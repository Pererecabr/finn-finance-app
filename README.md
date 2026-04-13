# 💬 Finanças em Conversa

> Controle financeiro pessoal via chat com IA — sem formulários, sem planilhas, sem complicação.

---

## O que é

**Finanças em Conversa** é um aplicativo web onde o usuário organiza suas finanças simplesmente conversando com a **Fina**, uma assistente financeira com IA. Basta escrever "gastei R$ 45 no mercado hoje" — a Fina registra, categoriza e atualiza seu resumo automaticamente.

O projeto resolve um problema real: a maioria das pessoas abandona apps de controle financeiro porque eles exigem muita entrada manual. Aqui, a interface é o chat.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 💬 Registro via chat | Transações em linguagem natural, sem formulários |
| 🏷️ Classificação automática | IA categoriza cada gasto automaticamente |
| 🎯 Metas financeiras | Defina objetivos e acompanhe o progresso pelo chat |
| 💡 Dicas da Fina | Recomendações de economia baseadas no seu histórico |
| 📊 Relatórios inline | Gráficos e resumos gerados direto na conversa |
| 🧭 Onboarding conversacional | Configuração inicial guiada pela Fina, sem formulários |

---

## Stack

```
Frontend   Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts
Backend    Node.js + Fastify + Prisma ORM
Banco      PostgreSQL
Cache      Redis
IA         Anthropic Claude API (claude-sonnet-4-20250514) — tool use
Auth       NextAuth.js v5 (e-mail + Google OAuth)
Deploy     Vercel (frontend) · Railway (backend + banco + cache)
```

---

## Arquitetura

```
Browser (Next.js SPA)
        │
        │ HTTPS / REST
        ▼
API Fastify
   ├── Orquestra chamadas ao Claude API
   ├── Persiste transações, metas e histórico de chat
   └── Aplica regras de negócio e rate limiting
        │
        ├──▶ PostgreSQL (dados do usuário)
        └──▶ Anthropic Claude API (NLP + Agente Fina)
```

---

## Como funciona a Fina

A Fina é implementada com **system prompt + tool use** da Claude API. Ela recebe cada mensagem do usuário junto com contexto real da conta (saldo do mês, metas ativas, últimas transações) e pode executar três ações estruturadas:

- `register_transaction` — salva um gasto ou receita
- `manage_goal` — cria ou atualiza uma meta
- `render_widget` — solicita ao frontend um gráfico ou card de dados

O histórico das últimas 20 mensagens é injetado em cada chamada para manter contexto da conversa.

---

## Estrutura do Repositório

```
finanas-em-conversa/
├── apps/
│   ├── web/          # Next.js — interface de chat e visualizações
│   └── api/          # Fastify — endpoints REST e orquestração da IA
└── packages/
    └── shared/       # Tipos TypeScript compartilhados entre apps
```

---

## Configuração Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Chave de API da Anthropic
- Credenciais OAuth do Google (opcional)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financas-em-conversa
cd financas-em-conversa

# Instale dependências
npm install

# Configure as variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edite os arquivos .env com suas credenciais

# Execute as migrações do banco
cd apps/api
npx prisma migrate dev

# Inicie em modo desenvolvimento
npm run dev  # na raiz — sobe frontend e backend simultaneamente
```

### Variáveis de Ambiente

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/financas
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-secret-aqui
NEXTAUTH_SECRET=seu-nextauth-secret
```

**`apps/web/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Documentação

| Documento | Descrição |
|---|---|
| [`PRD.md`](./PRD.md) | Requisitos de produto, personas, funcionalidades e métricas |
| [`SPEC.md`](./SPEC.md) | Especificação técnica completa: schema, endpoints, prompts e plano de dev |

---

## Roadmap

- [x] PRD e SPEC definidos
- [ ] Setup do monorepo e banco de dados
- [ ] Autenticação (e-mail + Google)
- [ ] Chat funcional com registro de transações
- [ ] Metas financeiras e acompanhamento
- [ ] Widgets de visualização inline
- [ ] Onboarding conversacional
- [ ] Deploy em produção
- [ ] Integrações futuras: Open Finance, notificações, app mobile

---

## Licença

MIT
