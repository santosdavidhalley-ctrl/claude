# Nicho: Agência digital e prestador de serviço

**Começar rápido:** `node scripts/iniciar.mjs --agentes vendas,prospeccao,analista` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** agências, freelancers e prestadores que vendem serviço por projeto ou mensalidade. Dor típica: achar clientes, escrever proposta, acompanhar prazo e provar resultado.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido do dono e distribui.
  - Lê: `cerebro/empresa.md`, `cerebro/processos/`.
  - Produz: resumo de 5 linhas do que foi feito e do que precisa de aprovação.
  - Nunca sozinho: enviar, cobrar ou prometer prazo a cliente, nem confirmar mudança de escopo.

- **`prospeccao`** (modelo existente) — organiza a lista de possíveis clientes que VOCÊ fornece e rascunha o primeiro contato. Nunca raspa contatos de site ou rede.
  - Lê: `cerebro/cliente-ideal.md`, `cerebro/servicos-e-precos.md`, `cerebro/processos/contato-ativo.md`.
  - Produz: lista de leads com motivo da escolha e rascunho de mensagem.
  - Nunca sozinho: contatar o lead, ou guardar dado pessoal sem necessidade.

- **`vendas`** (modelo existente) — responde interessados e escreve propostas curtas.
  - Lê: `cerebro/servicos-e-precos.md`, `cerebro/propostas-anteriores.md`.
  - Produz: rascunho de resposta e de proposta em `saidas/vendas/`.
  - Nunca sozinho: enviar proposta, inventar preço, prazo ou resultado.

- **`analista`** (modelo existente) — responde perguntas sobre números das planilhas, mostrando a conta e a limitação. O `analista-resultados` abaixo é a versão por cliente.

- **`projetos`** (específico do nicho) — acompanha prazos e entregas dos clientes ativos e escreve o relatório semanal; você revisa antes de enviar.

- **`analista-resultados`** (específico do nicho) — junta números de campanhas e site em um relatório mensal por cliente; só recomenda.

### Blocos prontos dos agentes específicos

Salve cada bloco como `.claude/agents/<name>.md`, cole as 3 linhas dele logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add <name>` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: projetos
description: "Acompanha prazos e entregas dos clientes ativos e escreve o relatório semanal de status. Use na sexta ('status dos projetos') ou quando uma entrega atrasar."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** `cerebro/projetos-ativos.md` e `cerebro/processo-de-entrega.md`.
- **Faça:** um relatório por cliente (feito, em andamento, atrasado, próximo passo) e um alerta de atraso, em `saidas/projetos/AAAA-MM-DD-status.md`.
- **Nunca:** aprovar mudança de escopo, prometer prazo novo ou falar com o cliente.

```yaml
---
name: analista-resultados
description: "Junta números de campanhas e do site em um relatório mensal por cliente. Use no fechamento do mês ('relatório de resultados'), com as planilhas exportadas em mãos."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** as planilhas exportadas das ferramentas e `cerebro/metas-por-cliente.md`.
- **Faça:** o que subiu e o que caiu (com a conta e a planilha de origem) e hipóteses marcadas como hipótese, em `saidas/resultados/AAAA-MM-DD-cliente.md`.
- **Nunca:** alterar campanha, verba ou anúncio (só recomenda), usar número que não está na planilha ou afirmar que a campanha "causou" o resultado.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/empresa.md` — identidade e limites. Quem é a agência e que serviços vende? · Qual o tom de voz? · O que nunca prometer a cliente (resultado, prazo, verba)? · Quais palavras são proibidas?
- `cerebro/servicos-e-precos.md` — só o confirmado. Quais pacotes e preços valem hoje? · O que não está incluso? · Cobra por projeto, mensalidade ou hora? · Quando cada preço foi confirmado (data)?
- `cerebro/cliente-ideal.md` — Quem atender (segmento, porte)? · Quem recusar? · Quais as objeções mais comuns? · Que sinal indica cliente-problema?
- `cerebro/propostas-anteriores.md` — 2 ou 3 propostas boas, sem dados do cliente. Quais propostas servem de modelo? · Que dados do cliente precisam sair? · Que cláusulas e condições se repetem?
- `cerebro/processo-de-entrega.md` — Quais as etapas da entrega? · Prazo típico de cada etapa? · Quem aprova cada etapa? · Como trata pedido de mudança de escopo?
- `cerebro/projetos-ativos.md` — Quais clientes ativos e o escopo de cada? · Prazo de cada entrega? · Quem é o responsável? · Onde o status é atualizado?
- `cerebro/metas-por-cliente.md` — O que cada cliente mede como sucesso? · De qual ferramenta sai cada número? · Qual a meta e o período? · Com que frequência o relatório sai?
- `cerebro/processos/contato-ativo.md` — já vem no modelo; confira e ajuste. De onde vêm suas listas de contatos? · Qual a base legal de cada lista? · Como a pessoa sai da lista? · Quem já pediu para não ser contatado?

## Rotina, indicadores e integrações

- **Rotina:** diária, `prospeccao` prepara 5 a 10 leads e rascunhos (você aprova o que sai) · semanal, `projetos` fecha o status por cliente (você revisa antes de enviar) · mensal, `analista-resultados` monta o relatório de resultados (você revisa e apresenta).
- **Indicadores:** leads novos por semana · propostas enviadas e aceitas · entregas no prazo (quantas de quantas) · retrabalho (pedidos de ajuste por projeto) · margem por cliente (receita menos horas e custos) · clientes ativos e saídas no mês.
- **Integrações** (comece só leitura): Google Workspace (Gmail, Agenda, Drive, Docs e Sheets; MCP comunitário, taylorwilsdon); Supabase (MCP oficial) para CRM simples de leads e projetos, com projeto de teste primeiro; API de anúncios e analytics via script (sem MCP confirmado). Antes de instalar qualquer MCP, use o "Checklist antes de instalar" de `guia/05-integracoes.md`.

## Cuidados

- **Contato frio:** base legal e opção de sair da lista (`cerebro/processos/contato-ativo.md`; leis em `../guia/08-legal-e-etica-br.md`).
- **Dados dos clientes dos seus clientes:** só trate com contrato claro. Eles contam como dados pessoais (LGPD).
- **Influenciadores e anúncios:** publicidade precisa ser identificada (CONAR, ver `../guia/08-referencias.md`).
- **Conteúdo gerado por IA:** não há lei específica no Brasil sobre autoria (pesquisa do kit); diga que usou IA quando relevante.
- **Voz e rosto de pessoa real:** só com permissão por escrito.
- **Nunca prometa** resultado de vendas ao cliente.

## Primeira semana

- [ ] Preencher `empresa.md` e `servicos-e-precos.md`.
- [ ] Criar `orquestrador` e `vendas` a partir dos modelos.
- [ ] Testar `vendas` com 3 pedidos reais antigos; comparar com o que você respondeu.
- [ ] Definir o que `vendas` nunca pode dizer; escrever no cérebro.
- [ ] Anotar tempo economizado e erros encontrados no `DIARIO.md`.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/agencia-digital.jsonl` (3 casos com `prospeccao`, `orquestrador` e `analista`; cada caso chama a IA e gasta centavos; leia as respostas).
