import { FastifyInstance } from 'fastify';
import { prisma } from '../services/db';
import { geminiService } from '../services/gemini';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string(),
});

export async function chatRoutes(server: FastifyInstance) {
  // Add authentication hook
  server.addHook('preHandler', async (request, reply) => {
    await (server as any).authenticate(request, reply);
  });

  server.post('/', async (request, reply) => {
    const { userId } = (request as any).user;
    const { message } = chatSchema.parse(request.body);
    
    // Save user message
    await prisma.chatMessage.create({
      data: { role: 'user', content: message, userId }
    });

    // Get AI Response
    let response;
    try {
      response = await geminiService.chat(userId, message);
    } catch (error: any) {
      // Handle specific Gemini API errors
      let errorText = 'Ocorreu um erro ao processar sua mensagem. Tente novamente em instantes.';
      
      if (error.status === 429) {
        errorText = '⏳ Você enviou muitas mensagens em pouco tempo. Aguarde alguns instantes e tente novamente (limite gratuito do Google Gemini: 15 por minuto).';
      } else if (error.status === 400 && error.message?.includes('API_KEY_INVALID')) {
        errorText = '🔑 Sua chave API do Google Gemini parece ser inválida. Por favor, vá até o Perfil e atualize a chave.';
      } else if (error.status === 404) {
        errorText = '🔧 Erro de configuração do modelo de IA. Contate o suporte.';
      }

      // Save the error as an assistant message so it appears in chat
      await prisma.chatMessage.create({
        data: { role: 'assistant', content: errorText, userId }
      });

      return reply.status(200).send({ text: errorText, tools: [] });
    }
    
    // Extract content and tools (Gemini format)
    let assistantText = '';
    const tools: any[] = [];

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          assistantText += part.text;
        }
        if (part.functionCall) {
          tools.push({
            id: (Math.random() * 1000).toString(),
            name: part.functionCall.name,
            input: part.functionCall.args
          });
        }
      }
    }

    // Save assistant message
    if (assistantText) {
      await prisma.chatMessage.create({
        data: { role: 'assistant', content: assistantText, userId }
      });
    }

    return { text: assistantText, tools };
  });

  // Fetch chat history
  server.get('/history', async (request, reply) => {
    const { userId } = (request as any).user;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  });

  // Clear chat history
  server.delete('/history', async (request, reply) => {
    const { userId } = (request as any).user;

    await prisma.chatMessage.deleteMany({ where: { userId } });

    return { success: true };
  });

  // Confirm a tool call (e.g. register transaction)
  server.post('/confirm-tool', async (request, reply) => {
    const { userId } = (request as any).user;
    
    const toolSchema = z.object({
      toolName: z.enum(['register_transaction', 'manage_goal', 'complete_onboarding']),
      input: z.any(),
    });

    const { toolName, input } = toolSchema.parse(request.body);

    if (toolName === 'complete_onboarding') {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingDone: true }
      });

      await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: '🎉 Parabéns! Seu perfil foi configurado com sucesso. Agora você pode explorar seu dashboard completo!',
          userId: userId
        }
      });

      return { success: true };
    }

    if (toolName === 'register_transaction') {
      const transaction = await prisma.transaction.create({
        data: {
          amount: input.amount,
          description: input.description,
          category: input.category,
          type: input.amount > 0 ? 'INCOME' : 'EXPENSE',
          date: input.date ? new Date(input.date) : new Date(),
          userId: userId
        }
      });

      // Save a system message confirming the action
      await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: `✅ Pronto! Registrei ${input.description} de R$ ${Math.abs(input.amount).toFixed(2)} em ${input.category}.`,
          userId: userId
        }
      });

      return transaction;
    }

    if (toolName === 'manage_goal') {
      if (input.action === 'create') {
        const goal = await prisma.goal.create({
          data: {
            title: input.title,
            targetAmount: input.targetAmount,
            deadline: input.deadline ? new Date(input.deadline) : new Date(),
            userId: userId
          }
        });
        return goal;
      }
    }

    return { success: true };
  });
}
