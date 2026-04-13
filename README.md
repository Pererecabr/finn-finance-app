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
| 🔑 Chave de IA própria | Cada usuário usa sua própria chave gratuita do Google AI Studio |

---

## Stack

```
Frontend   Next.js 15 (App Router) + TypeScript + Tailwind CSS
Backend    Node.js + Fastify + Prisma ORM
Banco      SQLite (local, via Prisma)
IA         Google Gemini 2.0 Flash (chave pessoal, gratuita via Google AI Studio)
Auth       JWT + Cookies HttpOnly (bcryptjs)
```

---

## Arquitetura

```
Browser (Next.js SPA)
        │
        │ HTTP / REST + Cookies
        ▼
API Fastify
   ├── Autentica usuário via JWT em cookie
   ├── Instancia Gemini com a chave do usuário logado
   ├── Persiste transações, metas e histórico de chat (SQLite)
   └── Aplica regras de negócio
        │
        ├──▶ SQLite / Prisma (dados do usuário)
        └──▶ Google Gemini API (NLP + Agente Fina)
```

---

## Como funciona a Fina

A Fina é implementada com **system prompt + function calling** do Google Gemini. Ela recebe cada mensagem do usuário junto com contexto real da conta (saldo do mês, metas ativas, últimas transações) e pode executar quatro ações estruturadas:

| Ferramenta | Descrição |
|---|---|
| `register_transaction` | Salva um gasto ou receita |
| `manage_goal` | Cria ou atualiza uma meta financeira |
| `render_widget` | Solicita ao frontend um gráfico ou card de dados |
| `complete_onboarding` | Finaliza o processo de boas-vindas |

O histórico das últimas 20 mensagens é injetado em cada chamada para manter contexto da conversa.

---

## Modelo de Chave de IA

> Cada usuário insere **sua própria chave gratuita** do Google AI Studio. A chave é armazenada com segurança no banco de dados local e nunca é compartilhada com terceiros.

O acesso ao dashboard é **bloqueado** até que o usuário configure sua chave na página de Perfil. Isso garante:
- Custo zero para o operador do sistema
- Privacidade total dos dados de IA
- Controle individual de uso e cotas

**Como obter a chave (grátis):** [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Estrutura do Repositório

```
finn-finance-app/
├── apps/
│   ├── web/          # Next.js — interface de chat e visualizações
│   └── api/          # Fastify — endpoints REST e orquestração da IA
├── PRD.md            # Requisitos de produto
├── SPEC.md           # Especificação técnica
└── README.md
```

---

## Configuração Local

### Pré-requisitos

- Node.js 18+
- npm
- Conta no [Google AI Studio](https://aistudio.google.com) (gratuito)

### 1. Backend (API)

```bash
cd apps/api
npm install

# Configure as variáveis de ambiente
echo 'DATABASE_URL="file:./dev.db"' >> .env
echo 'JWT_SECRET="troque-por-um-segredo-seguro"' >> .env

# Crie o banco de dados
npx prisma db push

# Inicie o servidor
npm run dev
```

### 2. Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

### Acesso

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

### Variáveis de Ambiente (`apps/api/.env`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-segredo-jwt-aqui"
```

> **Importante:** A chave do Google Gemini **não é uma variável de ambiente do servidor**. Cada usuário insere a própria chave na página de Perfil do app após fazer login.

---

## Roadmap

- [x] Autenticação segura (e-mail + senha, JWT em cookie)
- [x] Chat funcional com registro de transações via linguagem natural
- [x] Metas financeiras e acompanhamento
- [x] Onboarding conversacional guiado pela Fina
- [x] Integração com Google Gemini (gratuito, chave por usuário)
- [x] Tema dourado (identidade visual de prosperidade)
- [x] Botão de limpar histórico de conversa
- [ ] Widgets de visualização inline (gráficos no chat)
- [ ] Upload de foto de perfil
- [ ] Deploy em produção (Vercel + Railway)
- [ ] Integrações futuras: Open Finance, notificações, app mobile

---

## Documentação

| Documento | Descrição |
|---|---|
| [`PRD.md`](./PRD.md) | Requisitos de produto, personas, funcionalidades e métricas |
| [`SPEC.md`](./SPEC.md) | Especificação técnica: schema, endpoints e prompts |

---

## Licença

MIT
