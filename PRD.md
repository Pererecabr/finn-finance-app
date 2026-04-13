# PRD — Finanças em Conversa
**Aplicativo Web de Organização de Finanças Pessoais via Chat**

**Versão:** 1.0  
**Data:** Abril de 2026  
**Status:** Rascunho para validação

---

## 1. Visão Geral do Produto

### 1.1 Declaração do Problema

Aplicativos de controle financeiro existentes impõem barreiras significativas de adoção: formulários extensos, categorias rígidas, interfaces intimidadoras e curvas de aprendizado que desmotivam especialmente usuários iniciantes. O resultado é abandono precoce e retorno ao descontrole financeiro.

### 1.2 Solução Proposta

**Finanças em Conversa** é um aplicativo web que permite ao usuário controlar suas finanças por meio de uma interface de chat com um agente de IA chamado **Fina** — o Agente Financeiro. O usuário registra gastos, define metas e recebe orientações simplesmente conversando em português, como falaria com um amigo de confiança que entende de finanças.

### 1.3 Proposta de Valor

- **Zero atrito no registro:** basta digitar "gastei R$45 no mercado" — sem formulários.
- **Classificação automática:** a IA interpreta e categoriza cada transação.
- **Orientação proativa:** o agente sugere onde economizar com base no perfil do usuário.
- **Relatórios acessíveis:** visualizações simples, geradas sob demanda via chat.
- **Tom educativo:** linguagem amigável, sem jargões, adequada para iniciantes.

---

## 2. Público-Alvo

### 2.1 Persona Principal — "A Júlia"

- **Perfil:** 24 anos, recém-formada, primeiro emprego com salário fixo.
- **Comportamento:** usa apps no celular e no computador, não gosta de planilhas.
- **Dor:** sabe que deveria controlar gastos, mas desiste dos apps por achá-los trabalhosos.
- **Motivação:** quer guardar dinheiro para uma viagem em 6 meses.
- **Expectativa:** algo que "entenda o que ela escreve" e não a faça sentir julgada.

### 2.2 Persona Secundária — "O Seu Marcos"

- **Perfil:** 42 anos, autônomo, renda variável.
- **Comportamento:** pouca familiaridade com tecnologia financeira, desconfiante.
- **Dor:** dificuldade em saber quanto sobra no fim do mês.
- **Motivação:** ter clareza para planejar períodos de baixa renda.
- **Expectativa:** interface simples, sem intimidação, com explicações em linguagem clara.

---

## 3. Objetivos e Métricas de Sucesso

| Objetivo | Métrica | Meta (3 meses) |
|---|---|---|
| Adoção inicial | Usuários ativos mensais | 500 |
| Retenção | Taxa de retorno após 7 dias | ≥ 40% |
| Engajamento | Transações registradas/usuário/mês | ≥ 15 |
| Satisfação | NPS | ≥ 50 |
| Conversão de metas | Usuários com ≥ 1 meta ativa | ≥ 60% |

---

## 4. Funcionalidades do Produto

### 4.1 Registro de Gastos via Chat (P0 — Essencial)

O usuário registra transações escrevendo em linguagem natural no chat. O sistema interpreta valor, categoria, data e descrição automaticamente.

**Exemplos de entradas aceitas:**
- `"Gastei 35 reais no Burger King ontem"`
- `"Paguei a conta de luz, R$ 120"`
- `"Uber de hoje custou 22,50"`
- `"Recebi meu salário: 3.200"`

**Comportamento esperado:**
- Fina confirma o registro com um resumo claro.
- Se houver ambiguidade, faz uma única pergunta de confirmação.
- O usuário pode corrigir com linguagem natural ("na verdade foi R$ 40").

### 4.2 Classificação Automática de Transações (P0 — Essencial)

Cada transação é categorizada automaticamente com base no contexto da mensagem.

**Categorias padrão:**
- Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Vestuário, Serviços, Renda, Outros.

**Comportamento:**
- O usuário pode confirmar ou corrigir a categoria via chat.
- O sistema aprende padrões recorrentes do usuário (ex.: "Uber" → Transporte).
- Subcategorias podem ser criadas via conversa.

### 4.3 Definição e Acompanhamento de Metas (P0 — Essencial)

O usuário define metas financeiras em linguagem natural e acompanha o progresso.

**Exemplos:**
- `"Quero guardar R$ 2.000 para viagem até outubro"`
- `"Preciso pagar meu cartão de R$ 800 esse mês"`

**Comportamento:**
- Fina confirma a meta, define prazo e calcula valor mensal necessário.
- Atualiza o progresso automaticamente com base nas transações registradas.
- Envia alertas quando o progresso está abaixo do esperado.
- O usuário consulta metas perguntando: `"Como está minha meta de viagem?"`

### 4.4 Dicas de Economia do Agente Fina (P1 — Importante)

Fina analisa o histórico do usuário e oferece recomendações personalizadas de economia.

**Tipos de recomendações:**
- Alertas de gastos acima da média (ex.: "Você gastou 30% mais em delivery esse mês").
- Sugestões de corte baseadas em categorias supérfluas.
- Celebração de conquistas (ex.: "Parabéns! Você economizou R$ 200 comparado ao mês passado").
- Dicas educativas contextuais sobre finanças pessoais.

**Tom:** empático, motivador e não-julgamental.

### 4.5 Relatórios Simples e Personalizados (P1 — Importante)

Visualizações geradas sob demanda via chat, sem necessidade de navegar por menus.

**Exemplos de consultas:**
- `"Quanto gastei esse mês?"` → resumo por categoria.
- `"Onde estou gastando mais?"` → gráfico de pizza interativo.
- `"Mostre meus gastos de julho a setembro"` → comparativo por período.
- `"Quanto sobrou do meu salário?"` → saldo do mês.

**Formatos de visualização:**
- Cards de resumo numérico.
- Gráfico de barras (comparativo mensal).
- Gráfico de pizza (distribuição por categoria).
- Lista de transações com filtro.

### 4.6 Onboarding Conversacional (P1 — Importante)

Ao criar a conta, Fina conduz uma conversa de boas-vindas para entender o perfil financeiro básico do usuário.

**Fluxo:**
1. Pergunta sobre renda mensal aproximada (ou faixa).
2. Pergunta sobre despesas fixas principais.
3. Pergunta se já tem alguma meta em mente.
4. Apresenta um resumo do perfil e sugere primeiros passos.

Onboarding pode ser pulado e retomado a qualquer momento.

### 4.7 Autenticação e Gestão de Conta (P0 — Essencial)

- Cadastro via e-mail e senha ou Google OAuth.
- Recuperação de senha por e-mail.
- Perfil básico editável (nome, moeda preferida — padrão BRL).
- Exclusão de conta com confirmação.

---

## 5. Fora do Escopo (versão 1.0)

Os itens a seguir **não** fazem parte do MVP, mas podem ser considerados em versões futuras:

- Integração com Open Finance / APIs bancárias.
- Suporte a múltiplas moedas.
- Modo família / conta compartilhada.
- Importação de extratos em PDF ou CSV.
- Notificações push / e-mail automáticos.
- App nativo mobile (iOS/Android).
- Planejamento de investimentos.

---

## 6. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| Desempenho | Resposta do chat em ≤ 3 segundos (percentil 95) |
| Disponibilidade | 99,5% de uptime mensal |
| Segurança | Dados financeiros criptografados em repouso e em trânsito (TLS 1.3) |
| Privacidade | Conformidade com LGPD; dados não compartilhados com terceiros |
| Acessibilidade | WCAG 2.1 nível AA |
| Responsividade | Funcional em desktop e mobile (breakpoints padrão) |
| Idioma | Português brasileiro exclusivo no MVP |

---

## 7. Fluxos Principais do Usuário

### 7.1 Primeiro Acesso
```
Cadastro → Onboarding com Fina → Registro da primeira transação → Dashboard inicial
```

### 7.2 Uso Diário
```
Login → Chat com Fina → Registrar transações → Consultar saldo/metas → Encerrar sessão
```

### 7.3 Consulta de Relatório
```
Abrir chat → Digitar consulta em linguagem natural → Fina exibe card/gráfico → Usuário interage ou faz nova pergunta
```

### 7.4 Criação de Meta
```
Digitar objetivo no chat → Fina confirma e detalha meta → Acompanhamento automático via transações
```

---

## 8. Modelo de Negócio (Premissas Iniciais)

| Camada | Modelo | Descrição |
|---|---|---|
| MVP | Gratuito | Acesso completo sem custo no lançamento |
| Futuro (v2) | Freemium | Plano gratuito limitado + plano Pro com funcionalidades avançadas |
| Potencial | Parcerias | Indicação de produtos financeiros contextuais (conta digital, seguro) |

---

## 9. Premissas e Dependências

- A IA de processamento de linguagem natural será fornecida via **Anthropic Claude API**.
- O produto será desenvolvido com auxílio de ferramentas de geração de código por IA.
- O MVP será uma aplicação web responsiva (não app nativo).
- Os dados financeiros dos usuários não serão usados para treinar modelos de IA de terceiros.

---

## 10. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Baixa precisão da classificação automática | Média | Alto | Confirmação antes de salvar; feedback do usuário treina o sistema |
| Usuários hesitarem em compartilhar dados financeiros | Alta | Alto | Comunicação clara de privacidade; LGPD; sem integração bancária no MVP |
| Custo da API de IA ultrapassar projeção | Média | Médio | Limite de chamadas por usuário gratuito; cache de respostas padrão |
| Abandono após onboarding | Média | Alto | Onboarding curto e opcional; primeira transação em menos de 60 segundos |

---

## 11. Critérios de Lançamento do MVP

- [ ] Chat funcional com registro e classificação de transações.
- [ ] Metas financeiras funcionando com acompanhamento automático.
- [ ] Pelo menos 3 tipos de visualização de relatório via chat.
- [ ] Onboarding conversacional completo.
- [ ] Autenticação segura (e-mail + Google).
- [ ] Testes com ≥ 10 usuários reais e NPS ≥ 40.
- [ ] Conformidade LGPD documentada.
