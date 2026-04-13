# SPEC — Finanças em Conversa
**Especificação Técnica do Aplicativo Web de Organização de Finanças Pessoais via Chat**

**Versão:** 1.0  
**Data:** Abril de 2026  
**Status:** Rascunho técnico

---

## 1. Visão Geral da Arquitetura

### 1.1 Modelo Geral

Aplicação web full-stack com arquitetura cliente-servidor. O frontend é uma SPA (Single Page Application) que se comunica com uma API REST no backend. O backend orquestra chamadas à Anthropic Claude API para processamento de linguagem natural e persiste dados em banco relacional.

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│  Next.js (React) — SPA responsiva                    │
│  Interface de chat + visualizações de dados          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────────┐
│                  API BACKEND                         │
│  Node.js + Fastify                                   │
│  Autenticação · Orquestração IA · Regras de negócio  │
└────────┬──────────────────────────┬─────────────────┘
         │                          │
┌────────▼──────────┐   ┌───────────▼───────────────┐
│  PostgreSQL        │   │  Anthropic Claude API      │
│  Dados do usuário  │   │  claude-sonnet-4-20250514  │
│  Transações        │   │  NLP + Agente Fina         │
│  Metas             │   └───────────────────────────┘
└───────────────────┘
```

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SSG, performance, ecossistema React |
| Estilização | Tailwind CSS + shadcn/ui | Velocidade de desenvolvimento, acessibilidade |
| Gráficos | Recharts | Leve, declarativo, bem integrado com React |
| Backend | Node.js + Fastify | Alta performance, tipagem fácil com TypeScript |
| ORM | Prisma | Type-safe, migrações automáticas, DX excelente |
| Banco de Dados | PostgreSQL | Relacional, confiável, suporte a JSONB |
| Autenticação | NextAuth.js (Auth.js v5) | Suporte a OAuth + e-mail, sessão segura |
| IA | Anthropic Claude API (`claude-sonnet-4-20250514`) | NLP, classificação, geração de dicas |
| Deploy | Vercel (frontend) + Railway (backend + DB) | Simplicidade operacional para MVP |
| Cache | Redis (Railway) | Cache de sessão e rate limiting |

---

## 2. Estrutura de Diretórios

```
finanas-em-conversa/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── cadastro/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── chat/            # Página principal — interface de chat
│   │   │   │   ├── relatorios/      # Visualizações standalone
│   │   │   │   └── perfil/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             # Landing page / redirect
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── widgets/             # Cards e gráficos inline no chat
│   │   │   │   ├── TransactionCard.tsx
│   │   │   │   ├── GoalProgressCard.tsx
│   │   │   │   ├── PieChartWidget.tsx
│   │   │   │   └── BarChartWidget.tsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   └── lib/
│   │       ├── api.ts               # Chamadas ao backend
│   │       └── hooks/
├── apps/
│   └── api/                         # Fastify backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── chat.ts           # Endpoint principal do chat
│       │   │   ├── transactions.ts
│       │   │   ├── goals.ts
│       │   │   └── reports.ts
│       │   ├── services/
│       │   │   ├── claude.service.ts # Orquestração da Claude API
│       │   │   ├── transaction.service.ts
│       │   │   ├── goal.service.ts
│       │   │   └── report.service.ts
│       │   ├── prompts/              # System prompts do agente Fina
│       │   │   ├── fina.system.ts
│       │   │   └── fina.tools.ts
│       │   └── prisma/
│       │       └── schema.prisma
│       └── package.json
└── packages/
    └── shared/                      # Tipos TypeScript compartilhados
        └── types/
            ├── transaction.ts
            ├── goal.ts
            └── chat.ts
```

---

## 3. Modelagem de Dados (Prisma Schema)

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  monthlyIncome Float?
  currency      String        @default("BRL")
  onboardingDone Boolean      @default(false)

  transactions  Transaction[]
  goals         Goal[]
  chatMessages  ChatMessage[]
  accounts      Account[]
  sessions      Session[]
}

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Float                          // positivo = receita, negativo = despesa
  type        TransactionType                // INCOME | EXPENSE
  category    TransactionCategory
  description String
  date        DateTime @default(now())
  rawInput    String?                        // mensagem original do usuário
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

model Goal {
  id           String     @id @default(cuid())
  userId       String
  title        String
  targetAmount Float
  savedAmount  Float      @default(0)
  deadline     DateTime?
  category     String?
  status       GoalStatus @default(ACTIVE)    // ACTIVE | COMPLETED | PAUSED
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id        String      @id @default(cuid())
  userId    String
  role      MessageRole                       // USER | ASSISTANT
  content   String      @db.Text
  metadata  Json?                             // widgets, transações linkadas, etc.
  createdAt DateTime    @default(now())

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum TransactionCategory {
  ALIMENTACAO
  TRANSPORTE
  MORADIA
  SAUDE
  LAZER
  EDUCACAO
  VESTUARIO
  SERVICOS
  RENDA
  OUTROS
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  PAUSED
}

enum MessageRole {
  USER
  ASSISTANT
}
```

---

## 4. API Endpoints

### 4.1 Autenticação
Gerenciada pelo **NextAuth.js** diretamente no frontend (Next.js API routes).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/signin` | Login e-mail/senha ou OAuth |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/auth/session` | Sessão atual |

### 4.2 Chat (Principal)

**POST `/api/chat`**

Endpoint central da aplicação. Recebe a mensagem do usuário, envia ao Claude com contexto, recebe a resposta estruturada e persiste os dados.

**Request:**
```typescript
{
  message: string;          // texto do usuário
  sessionId?: string;       // para continuidade de contexto
}
```

**Response:**
```typescript
{
  reply: string;            // resposta em texto da Fina
  widget?: {
    type: "transaction_card" | "goal_card" | "pie_chart" | "bar_chart" | "summary_card";
    data: unknown;          // dados específicos do widget
  };
  actions?: {
    transactionCreated?: Transaction;
    goalCreated?: Goal;
    goalUpdated?: Goal;
  };
}
```

### 4.3 Transações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/transactions` | Lista transações com filtros |
| POST | `/api/transactions` | Cria transação manualmente |
| PUT | `/api/transactions/:id` | Edita transação |
| DELETE | `/api/transactions/:id` | Remove transação |

**Query params para GET:**
- `startDate`, `endDate` — filtro de período
- `category` — filtro de categoria
- `type` — INCOME | EXPENSE
- `page`, `limit` — paginação

### 4.4 Metas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/goals` | Lista todas as metas do usuário |
| POST | `/api/goals` | Cria meta |
| PUT | `/api/goals/:id` | Atualiza meta |
| DELETE | `/api/goals/:id` | Remove meta |

### 4.5 Relatórios

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/reports/monthly-summary` | Totais de receita, despesa e saldo do mês |
| GET | `/api/reports/by-category` | Gastos agrupados por categoria em período |
| GET | `/api/reports/monthly-comparison` | Comparativo dos últimos N meses |

---

## 5. Integração com Anthropic Claude API

### 5.1 Configuração do Agente Fina

A Fina é implementada via **system prompt** + **tool use** da Claude API. O modelo `claude-sonnet-4-20250514` é usado em todas as interações.

### 5.2 System Prompt Base

```typescript
// apps/api/src/prompts/fina.system.ts

export const FINA_SYSTEM_PROMPT = `
Você é a Fina, assistente financeira pessoal do aplicativo "Finanças em Conversa".
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

## Dados do usuário (contexto atual)
{{USER_CONTEXT}}

## Regras importantes
- Sempre confirme transações antes de salvar, mostrando valor, categoria e data.
- Ao identificar ambiguidade (ex.: sem valor especificado), pergunte apenas o essencial.
- Nunca invente dados. Se não souber, pergunte.
- Datas: assuma "hoje" se não especificado. Interprete "ontem", "semana passada" corretamente.
- Valores: aceite formatos variados (R$45, 45 reais, quarenta e cinco).
`;
```

### 5.3 Ferramentas (Tool Use)

```typescript
// apps/api/src/prompts/fina.tools.ts

export const FINA_TOOLS = [
  {
    name: "register_transaction",
    description: "Registra uma transação financeira (gasto ou receita) identificada na mensagem do usuário.",
    input_schema: {
      type: "object",
      properties: {
        amount: { type: "number", description: "Valor em BRL. Positivo para receita, negativo para despesa." },
        category: {
          type: "string",
          enum: ["ALIMENTACAO","TRANSPORTE","MORADIA","SAUDE","LAZER","EDUCACAO","VESTUARIO","SERVICOS","RENDA","OUTROS"]
        },
        description: { type: "string", description: "Descrição curta da transação." },
        date: { type: "string", description: "Data no formato ISO 8601 (YYYY-MM-DD)." },
        needsConfirmation: { type: "boolean", description: "true se algum dado precisar ser confirmado pelo usuário antes de salvar." }
      },
      required: ["amount", "category", "description", "date", "needsConfirmation"]
    }
  },
  {
    name: "manage_goal",
    description: "Cria ou atualiza uma meta financeira.",
    input_schema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["create", "update", "complete"] },
        goalId: { type: "string", description: "ID da meta existente (para update/complete)." },
        title: { type: "string" },
        targetAmount: { type: "number" },
        deadline: { type: "string", description: "Data limite ISO 8601 (opcional)." },
      },
      required: ["action"]
    }
  },
  {
    name: "render_widget",
    description: "Solicita ao frontend que renderize um componente visual de dados.",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["summary_card", "pie_chart", "bar_chart", "transaction_list", "goal_progress"]
        },
        period: {
          type: "object",
          properties: {
            start: { type: "string" },
            end: { type: "string" }
          }
        },
        filters: {
          type: "object",
          properties: {
            categories: { type: "array", items: { type: "string" } }
          }
        }
      },
      required: ["type"]
    }
  }
];
```

### 5.4 Contexto Injetado no Prompt

Antes de cada chamada à API, o backend injeta contexto real do usuário:

```typescript
// apps/api/src/services/claude.service.ts

async function buildUserContext(userId: string): Promise<string> {
  const [user, currentMonthSummary, activeGoals, recentTransactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getMonthSummary(userId),
    prisma.goal.findMany({ where: { userId, status: "ACTIVE" }, take: 5 }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10
    })
  ]);

  return `
Nome: ${user.name}
Mês atual: ${currentMonthSummary.month}
Receitas do mês: R$ ${currentMonthSummary.income}
Despesas do mês: R$ ${currentMonthSummary.expenses}
Saldo do mês: R$ ${currentMonthSummary.balance}

Metas ativas: ${activeGoals.map(g => `${g.title} (R$ ${g.savedAmount}/${g.targetAmount})`).join(", ")}

Últimas 10 transações:
${recentTransactions.map(t => `- ${t.date}: ${t.description} ${t.amount > 0 ? "+" : ""}R$ ${t.amount} [${t.category}]`).join("\n")}
  `;
}
```

### 5.5 Gerenciamento de Histórico de Conversa

O histórico do chat é persistido no banco e injetado nas chamadas à API com janela deslizante.

```typescript
// Máximo de 20 mensagens anteriores injetadas por chamada (controle de custo)
const HISTORY_WINDOW = 20;

async function getChatHistory(userId: string): Promise<Message[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_WINDOW
  });

  return messages.reverse().map(m => ({
    role: m.role.toLowerCase() as "user" | "assistant",
    content: m.content
  }));
}
```

---

## 6. Frontend — Componentes Principais

### 6.1 ChatWindow

Componente central da aplicação. Gerencia:
- Lista de mensagens (`MessageBubble` por mensagem).
- Renderização de widgets inline (`TransactionCard`, `PieChartWidget`, etc.) quando `metadata.widget` presente.
- Scroll automático para última mensagem.
- Estado de carregamento (`TypingIndicator`) durante chamada à API.

### 6.2 ChatInput

- Textarea com auto-resize.
- Envio por `Enter` (sem Shift) ou botão.
- Desabilitado durante resposta em processamento.
- Sugestões rápidas (chips) baseadas no contexto: "Registrar gasto", "Ver resumo do mês", "Minhas metas".

### 6.3 Widgets Inline

Todos os widgets são renderizados dentro do fluxo do chat, não em páginas separadas.

**TransactionCard:** valor, categoria (com ícone), data, botões "Confirmar" / "Editar".

**GoalProgressCard:** nome da meta, barra de progresso, valor atual vs. meta, prazo.

**PieChartWidget:** gráfico de pizza por categoria, legenda simplificada.

**BarChartWidget:** comparativo mensal (até 6 meses), barras empilhadas receita/despesa.

**SummaryCard:** card com receita total, despesa total e saldo do mês.

---

## 7. Autenticação e Segurança

### 7.1 Fluxo de Autenticação

- **NextAuth.js v5** com providers: `Credentials` (e-mail + senha com bcrypt) e `Google OAuth`.
- Sessões gerenciadas via JWT com `secret` configurado em variável de ambiente.
- Tokens expiram em 30 dias com renovação automática.

### 7.2 Proteção de Rotas

- Middleware Next.js valida sessão em todas as rotas `/dashboard/*`.
- Backend Fastify valida JWT em todos os endpoints `/api/*` exceto `/api/auth/*`.
- Usuário só acessa seus próprios dados (filtro obrigatório por `userId` em todas as queries).

### 7.3 Rate Limiting

```typescript
// Redis-based rate limiting no Fastify
const rateLimitConfig = {
  chat: { max: 30, timeWindow: "1 minute" },    // 30 mensagens/minuto por usuário
  api: { max: 100, timeWindow: "1 minute" }      // outros endpoints
};
```

### 7.4 Variáveis de Ambiente

```env
# Backend
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://...
JWT_SECRET=...
NEXTAUTH_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.financasemconversa.com
NEXTAUTH_URL=https://financasemconversa.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 8. Tratamento de Erros

| Cenário | Comportamento |
|---|---|
| Claude API indisponível | Fina responde: "Estou com dificuldades técnicas agora. Tente em alguns instantes." |
| Mensagem ambígua sem valor | Fina pergunta: "Qual foi o valor exato?" antes de registrar |
| Timeout de API (> 10s) | Frontend exibe spinner + mensagem de espera; retry automático 1x |
| Token expirado | Redirect automático para login |
| Erro 500 no backend | Log em serviço de observabilidade + mensagem amigável ao usuário |

---

## 9. Onboarding — Fluxo Técnico

O onboarding é implementado como uma conversa especial com Fina, disparada quando `user.onboardingDone === false`.

1. System prompt adicional é injetado indicando que Fina deve conduzir o onboarding.
2. Fina faz até 3 perguntas sequenciais (renda, despesas fixas, primeira meta).
3. Respostas são processadas e salvas via `register_transaction` e `manage_goal`.
4. Ao final, `user.onboardingDone` é marcado como `true`.
5. Fina exibe `SummaryCard` com o perfil inicial configurado.

---

## 10. Observabilidade e Monitoramento

| Ferramenta | Uso |
|---|---|
| Sentry | Captura de erros no frontend e backend |
| Vercel Analytics | Métricas de performance do frontend |
| Logging estruturado (Pino) | Logs do backend no Railway |
| PostHog (futuro) | Eventos de produto para análise de retenção |

---

## 11. Plano de Desenvolvimento (Fases)

### Fase 1 — Fundação (Semanas 1–2)
- [ ] Setup monorepo (Turborepo ou estrutura simples com workspaces npm).
- [ ] Schema Prisma + migrações + seed de dados de teste.
- [ ] Autenticação completa (e-mail + Google) via NextAuth.
- [ ] Endpoint `/api/chat` funcional com chamada básica ao Claude.

### Fase 2 — Core do Chat (Semanas 3–4)
- [ ] System prompt da Fina + ferramentas `register_transaction` e `manage_goal`.
- [ ] Persistência de histórico de chat.
- [ ] Componentes de chat no frontend (ChatWindow, ChatInput, MessageBubble).
- [ ] Fluxo de confirmação de transação via chat.

### Fase 3 — Visualizações (Semana 5)
- [ ] Widgets inline: SummaryCard, PieChartWidget, BarChartWidget, GoalProgressCard.
- [ ] Ferramenta `render_widget` integrada ao agente.
- [ ] Endpoints de relatórios no backend.

### Fase 4 — Onboarding e Polimento (Semana 6)
- [ ] Fluxo de onboarding conversacional.
- [ ] Rate limiting + tratamento de erros completo.
- [ ] Responsividade mobile.
- [ ] Testes de integração dos fluxos principais.

### Fase 5 — Lançamento (Semana 7)
- [ ] Deploy em Vercel + Railway.
- [ ] Configuração de domínio e SSL.
- [ ] Sentry + analytics.
- [ ] Testes com usuários reais (beta fechado).

---

## 12. Decisões de Arquitetura e Trade-offs

| Decisão | Alternativa Considerada | Justificativa |
|---|---|---|
| Next.js para frontend | Vite + React puro | App Router facilita SSR + API routes para NextAuth |
| Fastify para API | Express | Performance superior; tipagem nativa com TypeScript |
| PostgreSQL | MongoDB | Dados financeiros são naturalmente relacionais |
| Tool Use do Claude | Parsing de resposta em texto | Mais confiável; estrutura garantida; erros mais raros |
| Histórico de 20 mensagens | Histórico completo | Controle de custo de tokens sem perda significativa de contexto |
| NextAuth (e-mail + Google) | Auth0 / Clerk | Zero custo no MVP; controle total dos dados |
