# Nicho: Restaurante e delivery

**Começar rápido:** `node scripts/iniciar.mjs --agentes suporte,conteudo,financeiro` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** restaurantes, lanchonetes, dark kitchens e padarias com venda no balcão e por delivery.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido do dono e distribui.
  - Lê: `cerebro/restaurante.md`.
  - Produz: resumo do dia com pendências.
  - Nunca sozinho: mudar preço do cardápio ou fazer pedido a fornecedor.

- **`suporte`** (modelo existente) — responde dúvidas de cardápio, horário, pedido e entrega.
  - Lê: `cerebro/cardapio.md`, `cerebro/faq-restaurante.md`.
  - Produz: rascunho de resposta, lista de reclamações do dia.
  - Nunca sozinho: reembolsar, afirmar que um prato não tem alérgeno, ou prometer prazo.

- **`financeiro`** (modelo existente) — organiza caixa e custos a partir das planilhas; nunca paga, transfere nem emite nota.

- **`conteudo`** (modelo existente) — posts, promoções e respostas a avaliações.
  - Lê: `cerebro/restaurante.md`, `cerebro/promocoes-permitidas.md`.
  - Produz: textos em `saidas/conteudo/`.
  - Nunca sozinho: publicar, criar promoção que não esteja nas regras, ou acusar e ameaçar cliente em resposta pública.

- **`cardapio`** (específico do nicho) — analisa quais pratos vendem e dão margem; só sugere.

- **`compras-e-estoque`** (específico do nicho) — sugere a lista de compras e aponta desperdício.

### Blocos prontos dos agentes específicos

Salve cada bloco como `.claude/agents/<name>.md`, cole as 3 linhas dele logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add <name>` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: cardapio
description: "Analisa quais pratos vendem e quais dão margem. Use no fechamento da semana ('ranking de pratos') ou antes de mexer no cardápio."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** as vendas exportadas e `cerebro/custos-dos-pratos.md`.
- **Faça:** ranking por venda e por margem (preço menos custo), com a conta, e sugestões marcadas "sugestão", em `saidas/cardapio/AAAA-MM-DD-ranking.md`.
- **Nunca:** alterar cardápio ou preço, nem usar custo que não esteja no arquivo.

```yaml
---
name: compras-e-estoque
description: "Sugere a lista de compras e aponta desperdício e itens perto do vencimento. Use no começo do dia ('o que repor e o que vence') ou antes de fechar o pedido ao fornecedor."
tools: Read, Write, Grep, Glob
model: haiku
maxTurns: 10
---
```
- **Leia:** a planilha de estoque, `cerebro/fornecedores.md` e `cerebro/ficha-tecnica.md`.
- **Faça:** lista de compras sugerida e itens perto do vencimento, em `saidas/compras/AAAA-MM-DD-lista.md`.
- **Nunca:** comprar, pagar ou mandar descartar item.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/restaurante.md` — identidade e limites. Qual o nome, o tom e os horários? · Qual a área de entrega e a taxa? · O que nunca prometer (prazo, alérgeno)? · Quem responde o que o agente não pode?
- `cerebro/cardapio.md` — só o confirmado pela cozinha. Quais pratos, preços e ingredientes? · Que alérgenos cada prato contém? · Quem da cozinha confirmou, e quando? · Quais pratos podem ter traços de outros alérgenos?
- `cerebro/ficha-tecnica.md` — Quanto de cada insumo vai em cada prato? · Qual o rendimento e a perda? · Quais os 10 pratos mais vendidos?
- `cerebro/custos-dos-pratos.md` — Qual o custo atual de cada prato? · Quando foi atualizado (data)? · Quais insumos mais variam de preço?
- `cerebro/fornecedores.md` — Quem fornece o quê, e qual o contato? · Qual o prazo de entrega e o pedido mínimo? · Quem faz o pedido?
- `cerebro/faq-restaurante.md` — Que perguntas de cliente se repetem (horário, entrega, retirada)? · Qual a resposta de cada uma? · Como trata atraso e pedido errado?
- `cerebro/promocoes-permitidas.md` — Que promoções são permitidas? · Até quanto de desconto? · Em que dias e horários? · Quem aprova promoção nova?

## Rotina, indicadores e integrações

- **Rotina:** diária, `compras-e-estoque` lista o que repor e o que vence e `suporte` resume as reclamações (você aprova) · semanal, `cardapio` entrega o ranking de pratos e `conteudo` propõe os posts · mensal, `orquestrador` junta vendas, custos e reclamações para você decidir ajustes de cardápio.
- **Indicadores:** faturamento por canal (balcão, delivery) · ticket médio por canal · margem por prato (preço menos custo da ficha técnica; compare com o seu histórico, não com média de mercado) · desperdício em valor ou itens descartados · tempo de entrega e atrasos · reclamações e o motivo mais comum.
- **Integrações** (só leitura primeiro): Google Sheets (MCP comunitário, taylorwilsdon) para vendas, estoque e fichas; plataforma de delivery ou sistema de caixa via script (sem MCP confirmado); WhatsApp Cloud API oficial via script, para dúvidas e status de pedido, com aprovação humana.

## Cuidados

- **Alérgenos:** o agente só repete o que está escrito no cardápio e confirmado pela cozinha. Na dúvida, escala para uma pessoa.
- **Atendimento por IA:** avise o cliente (CDC; ver `../guia/08-legal-e-etica-br.md`).
- **Endereço e telefone do cliente:** dados pessoais (LGPD). Guarde o mínimo.
- **Marketing por mensagem:** tenha base legal e opção de sair.
- **Avaliações públicas:** o agente rascunha, você responde; nunca acuse nem ameace o cliente.
- **Vigilância sanitária e rotulagem:** regras locais; o agente não substitui seu controle.

## Primeira semana

- [ ] Fechar o cardápio com preço e alérgenos revisados pela cozinha.
- [ ] Calcular o custo de seus 10 pratos mais vendidos.
- [ ] Criar `orquestrador` e `suporte`.
- [ ] Testar `suporte` com 10 perguntas reais de clientes.
- [ ] Definir o que o agente nunca responde sozinho (alérgeno, reembolso, atraso).

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/restaurante-delivery.jsonl` (3 casos com `suporte` e `conteudo`; cada caso chama a IA e gasta centavos; leia as respostas).
