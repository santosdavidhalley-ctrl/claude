# Nicho: Loja virtual (e-commerce)

**Começar rápido:** `node scripts/iniciar.mjs --agentes suporte,conteudo,vendas` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** donos de loja online própria ou em marketplace, com poucos produtos a milhares de pedidos.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido e distribui.
  - Lê: `cerebro/empresa.md`.
  - Produz: resumo curto do dia com pendências de aprovação.
  - Nunca sozinho: reembolsar, mudar preço ou enviar mensagem a cliente.

- **`suporte`** (modelo existente) — responde dúvidas de pedido, troca e prazo.
  - Lê: `cerebro/politica-troca.md`, `cerebro/faq-loja.md`, `cerebro/entrega-e-frete.md`.
  - Produz: rascunho de resposta e lista de casos que precisam do dono.
  - Nunca sozinho: autorizar reembolso, abrir exceção de política, enviar sem aprovação, nem dar status ou prazo de pedido que não esteja nos dados exportados.

- **`vendas`** (modelo existente) — responde interessados e acompanha quem está decidindo; nunca inventa preço, prazo, estoque ou desconto.

- **`conteudo`** (modelo existente) — descrições de produto, posts e e-mails.
  - Lê: `cerebro/produtos.md`, `cerebro/empresa.md`.
  - Produz: textos em `saidas/conteudo/`.
  - Nunca sozinho: publicar, ou inventar característica de produto (dado que falta vira "a confirmar").

- **`estoque`** (específico do nicho) — acompanha o estoque exportado e avisa risco de ruptura.

- **`carrinho-abandonado`** (específico do nicho) — prepara lembretes para quem não finalizou a compra; você revisa e envia.

### Blocos prontos dos agentes específicos

Salve cada bloco como `.claude/agents/<name>.md`, cole as 3 linhas dele logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add <name>` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: estoque
description: "Acompanha o estoque exportado e avisa risco de ruptura. Use no começo do dia ('o que está acabando') ou antes de uma promoção."
tools: Read, Write, Grep, Glob
model: haiku
maxTurns: 10
---
```
- **Leia:** a planilha de estoque exportada e `cerebro/fornecedores.md`.
- **Faça:** lista de itens críticos (estoque, vendas dos últimos dias, prazo de reposição) e sugestão de reposição, em `saidas/estoque/AAAA-MM-DD-criticos.md`.
- **Nunca:** fazer pedido ao fornecedor, pagar ou alterar a planilha.

```yaml
---
name: carrinho-abandonado
description: "Prepara lembretes para quem não finalizou a compra. Use uma vez por semana, com a lista de carrinhos exportada, ou quando o dono pedir 'recuperar carrinhos'."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** a lista de carrinhos exportada e `cerebro/regras-de-desconto.md`.
- **Faça:** um rascunho curto por segmento (valor do carrinho, tempo parado), sem urgência falsa, em `saidas/carrinho/AAAA-MM-DD-lote.md`.
- **Nunca:** enviar, dar desconto acima do limite escrito ou escrever "últimas unidades" sem o estoque confirmar.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/empresa.md` — identidade e limites. Qual o nome e o jeito de falar da loja? · O que nunca prometer (prazo, estoque, desconto)? · Quem decide exceções? · Qual o horário de atendimento?
- `cerebro/politica-troca.md` — copiada do que você já pratica. Qual o prazo para troca e para devolução? · Quem paga o frete? · Que produtos não trocam? · Quem aprova exceção ou reembolso?
- `cerebro/faq-loja.md` — Quais as 15 perguntas reais dos clientes? · Qual a resposta de cada uma? · Como o cliente acompanha o pedido?
- `cerebro/entrega-e-frete.md` — Quais transportadoras e prazos por região? · Quando o frete é grátis? · O que fazer em atraso ou extravio? · Como o cliente rastreia?
- `cerebro/produtos.md` — catálogo resumido. Quais produtos, com medidas, materiais e cuidados? · Que dados vêm do fornecedor e quais são seus? · Que características nunca afirmar sem confirmar? · Quando foi a última revisão?
- `cerebro/regras-de-desconto.md` — Qual o desconto máximo que o agente pode sugerir? · Para quais produtos vale? · Em quais datas? · Quem aprova acima do limite?
- `cerebro/fornecedores.md` — Quais fornecedores e contatos? · Qual o prazo de reposição por item? · Qual o pedido mínimo? · Quem faz o pedido?

## Rotina, indicadores e integrações

- **Rotina:** diária, `suporte` prepara as respostas dos chamados abertos e `estoque` lista itens críticos (você aprova) · semanal, `carrinho-abandonado` monta o lote de lembretes e `conteudo` propõe 3 posts · mensal, `estoque` sugere a curva dos mais e menos vendidos (você decide reposição e promoção).
- **Indicadores:** pedidos e faturamento do período · ticket médio (compare com seu histórico) · carrinhos recuperados sobre abandonados · itens em ruptura e dias sem estoque · tempo de primeira resposta · trocas e devoluções e o motivo mais frequente.
- **Integrações** (só leitura primeiro): Google Sheets e Gmail para estoque, pedidos exportados e e-mails (MCP comunitário, taylorwilsdon); plataforma da loja via script (sem MCP confirmado); WhatsApp Cloud API oficial via script, para atendimento da própria loja, com aprovação humana. Pagamento (Pix, cartão): API do provedor via script (Stripe tem MCP oficial, mas só use se a loja já vende por ele).

## Cuidados

- **Atendimento por IA:** avise o cliente e ofereça falar com uma pessoa (CDC e LGPD art. 20; ver `../guia/08-legal-e-etica-br.md`).
- **WhatsApp:** só tarefas da própria loja. A Meta proíbe bot de IA de propósito geral na API desde 15/01/2026 (conforme veículos; confira o texto oficial em `../guia/08-referencias.md`).
- **Marketing por mensagem:** tenha base legal e forma de sair da lista.
- **Dados de compra:** guarde o mínimo. Se usar Supabase, Stripe ou Claude API, confira as cláusulas de transferência internacional (Res. ANPD nº 19/2024).
- **Descrição de produto:** não invente benefício. Texto errado vira problema de consumidor.
- **Desconto:** o agente sugere, você decide.

## Primeira semana

- [ ] Preencher `politica-troca.md` e `faq-loja.md` com respostas reais.
- [ ] Criar `orquestrador` e `suporte` a partir dos modelos.
- [ ] Testar `suporte` com 10 perguntas antigas; ver onde errou.
- [ ] Exportar estoque e pedidos para planilha (leitura somente).
- [ ] Decidir o limite de desconto e escrever em `regras-de-desconto.md`.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/loja-virtual.jsonl` (3 casos com `suporte` e `conteudo`; cada caso chama a IA e gasta centavos; leia as respostas).
