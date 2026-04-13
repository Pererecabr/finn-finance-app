import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { prisma } from './db';
import { FINA_SYSTEM_PROMPT, FINA_TOOLS, FINA_ONBOARDING_PROMPT } from '../prompts/fina';

export class GeminiService {
  async chat(userId: string, userMessage: string) {
    // 1. Fetch User and Context
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.geminiKey) throw new Error('Google Gemini API Key não configurada no perfil.');

    // Initialize Gemini with user's specific key
    const genAI = new GoogleGenerativeAI(user.geminiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      tools: [{ functionDeclarations: FINA_TOOLS }],
    });

    const context = await this.buildUserContext(userId);
    
    // Choose system prompt based on onboarding status
    const systemInstruction = user.onboardingDone 
      ? `${FINA_SYSTEM_PROMPT}\n\n## Contexto Atual do Usuário:\n${context}`
      : `${FINA_ONBOARDING_PROMPT}\n\n## Contexto Atual (Novo Usuário):\nNome: ${user.name}`;

    // 2. Fetch History (last 20 messages)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    // Map history to Gemini format
    // Map history to Gemini format and ensure alternating roles
    const contents: Content[] = [];
    let lastRole: string | null = null;

    for (const msg of history) {
      const currentRole = msg.role === 'user' ? 'user' : 'model';
      
      // Gemini requires alternating roles: user -> model -> user ...
      // And must start with 'user'
      if (currentRole === lastRole) continue;
      if (contents.length === 0 && currentRole !== 'user') continue;

      // Skip empty content
      if (!msg.content || msg.content.trim() === "") continue;

      contents.push({
        role: currentRole,
        parts: [{ text: msg.content }]
      });
      lastRole = currentRole;
    }

    // Ensure we don't end with a model message if we are about to send a user message?
    // startChat handles history, then sendMessage adds the next user message.
    // So history can end in 'model'.

    // 3. Start Chat and Get Response
    try {
      const chat = model.startChat({
        history: contents,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }]
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      
      return response;
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      console.error('Gemini Error Message:', error.message);
      if (error.response) {
        console.error('Gemini Error Details (Response):', JSON.stringify(error.response, null, 2));
      }
      throw error;
    }
  }

  private async buildUserContext(userId: string): Promise<string> {
    const [user, transactions, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10
      }),
      prisma.goal.findMany({
        where: { userId }
      })
    ]);

    if (!user) return 'Usuário não encontrado.';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth }
      }
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    return `
Nome: ${user.name}
Salário Base: R$ ${user.salary.toFixed(2)}
Mês Atual: ${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}

Resumo do Mês:
- Receitas: R$ ${income.toFixed(2)}
- Despesas: R$ ${expenses.toFixed(2)}
- Saldo: R$ ${(user.salary + income - expenses).toFixed(2)}

Metas Ativas:
${goals.map(g => `- ${g.title}: R$ ${g.currentAmount.toFixed(2)} / R$ ${g.targetAmount.toFixed(2)} (Prazo: ${g.deadline.toLocaleDateString('pt-BR')})`).join('\n')}

Últimas 10 Transações:
${transactions.map(t => `- ${t.date.toLocaleDateString('pt-BR')}: ${t.description} (${t.category}) | ${t.type === 'INCOME' ? '+' : '-'} R$ ${t.amount.toFixed(2)}`).join('\n')}
    `;
  }
}

export const geminiService = new GeminiService();
