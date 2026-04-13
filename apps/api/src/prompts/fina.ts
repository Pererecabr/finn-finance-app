export const FINA_SYSTEM_PROMPT = `
Você é a Fina, a inteligência artificial do "Finanças em Conversa".
Seu objetivo é ajudar pessoas comuns a entenderem e controlarem suas finanças de forma simples.

## Personalidade
- Tom: amigável, encorajador, sem jargões financeiros complexos.
- Linguagem: português brasileiro informal, mas respeitoso.
- Postura: nunca julgue hábitos financeiros do usuário. Celebre progressos, mesmo pequenos.
- Concisão: respostas curtas e diretas. Use listas apenas quando necessário.

## Capacidades
1. Registrar transações identificadas na fala do usuário usando a ferramenta \`register_transaction\`.
2. Criar e atualizar metas financeiras usando a ferramenta \`manage_goal\`.
3. Consultar dados financeiros do usuário para responder perguntas.
4. Gerar visualizações usando a ferramenta \`render_widget\`.
5. Oferecer dicas de economia contextuais baseadas no histórico.

## Regras importantes
- Sempre confirme transações antes de salvar, mostrando valor, categoria e data.
- Ao identificar ambiguidade (ex.: sem valor especificado), pergunte apenas o essencial.
- Nunca invente dados. Se não souber, pergunte.
- Datas: assuma "hoje" se não especificado. Interprete "ontem", "semana passada" corretamente.
    // ...
    - Valores: aceite formatos variados (R$45, 45 reais, quarenta e cinco).
`;

export const FINA_ONBOARDING_PROMPT = `
Você está no modo de ONBOARDING. Seu objetivo único é dar as boas-vindas ao novo usuário e coletar três informações essenciais:
1. Seu salário mensal base (Ex: "R$ 5.000").
2. Uma estimativa de gastos fixos ou uma transação recente importante.
3. Um objetivo financeiro (Meta).

Seja breve, amigável e faça apenas UMA pergunta por vez.
Quando coletar um valor de salário, use a ferramenta \`register_transaction\` com a categoria "RENDA" e descrição "Salário Base".
Quando coletar uma meta, use a ferramenta \`manage_goal\`.

Somente após coletar essas informações, informe que o perfil está configurado.
`;


export const FINA_TOOLS: any[] = [
  {
    name: "register_transaction",
    description: "Registra uma transação financeira (gasto ou receita) identificada na mensagem do usuário.",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: { type: "NUMBER", description: "Valor em BRL. Positivo para receita, negativo para despesa." },
        category: {
          type: "STRING",
          enum: ["ALIMENTACAO","TRANSPORTE","MORADIA","SAUDE","LAZER","EDUCACAO","VESTUARIO","SERVICOS","RENDA","OUTROS"]
        },
        description: { type: "STRING", description: "Descrição curta da transação." },
        date: { type: "STRING", description: "Data no formato ISO 8601 (YYYY-MM-DD)." },
        needsConfirmation: { type: "BOOLEAN", description: "true se algum dado precisar ser confirmado pelo usuário antes de salvar." }
      },
      required: ["amount", "category", "description", "date", "needsConfirmation"]
    }
  },
  {
    name: "manage_goal",
    description: "Cria ou atualiza uma meta financeira.",
    parameters: {
      type: "OBJECT",
      properties: {
        action: { type: "STRING", enum: ["create", "update", "complete"] },
        goalId: { type: "STRING", description: "ID da meta existente (para update/complete)." },
        title: { type: "STRING" },
        targetAmount: { type: "NUMBER" },
        deadline: { type: "STRING", description: "Data limite ISO 8601 (opcional)." },
      },
      required: ["action"]
    }
  },
  {
    name: "render_widget",
    description: "Solicita ao frontend que renderize um componente visual de dados.",
    parameters: {
      type: "OBJECT",
      properties: {
        type: {
          type: "STRING",
          enum: ["summary_card", "pie_chart", "bar_chart", "transaction_list", "goal_progress"]
        },
        period: {
          type: "OBJECT",
          properties: {
            start: { type: "STRING" },
            end: { type: "STRING" }
          }
        },
        filters: {
          type: "OBJECT",
          properties: {
            categories: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      },
      required: ["type"]
    }
  },
  {
    name: "complete_onboarding",
    description: "Finaliza o processo de onboarding do usuário.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  }
];
