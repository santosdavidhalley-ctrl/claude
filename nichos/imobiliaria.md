# Nicho: Imobiliária e corretor de imóveis

**Começar rápido:** `node scripts/iniciar.mjs --agentes vendas,prospeccao,agenda` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** corretores autônomos e pequenas imobiliárias que vivem de captar imóvel, atender lead e agendar visita.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido do corretor e distribui.
  - Lê: `cerebro/corretor.md`.
  - Produz: resumo do dia com visitas, leads e pendências.
  - Nunca sozinho: negociar, enviar proposta ou assinar.

- **`vendas`** (modelo existente, adaptado) — responde interessados e qualifica o lead.
  - Lê: `cerebro/imoveis-disponiveis.md`, `cerebro/perguntas-de-qualificacao.md`.
  - Produz: rascunho de resposta e ficha do lead.
  - Nunca sozinho: inventar característica do imóvel, passar valor sem confirmar, prometer financiamento ou passar o contato do proprietário sem autorização dele.

- **`prospeccao`** (modelo existente, adaptado) — organiza leads de portais, redes e indicações.
  - Lê: `cerebro/regioes-e-perfis.md`.
  - Produz: lista priorizada de leads com próximo passo sugerido.
  - Nunca sozinho: contatar, ou guardar dado pessoal além do necessário.

- **`agenda`** (modelo existente) — organiza visitas entre cliente, corretor e proprietário.
  - Lê: agenda do corretor, `cerebro/imoveis-disponiveis.md`.
  - Produz: proposta de horários e lembretes.
  - Nunca sozinho: confirmar visita sem OK das duas partes.

- **`documentos`** (específico do nicho) — monta o checklist de documentos por operação e avisa vencimentos.

- **`preco-sugerido`** (específico do nicho) — junta comparáveis da região para apoiar a sua conversa de preço; nunca é avaliação oficial.

### Blocos prontos dos agentes específicos

Salve cada bloco como `.claude/agents/<name>.md`, cole as 3 linhas dele logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add <name>` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: documentos
description: "Monta o checklist de documentos de cada negócio e avisa o que falta e o que vence. Use quando abrir um negócio novo ou na revisão semanal das pendências."
tools: Read, Write, Grep
model: haiku
maxTurns: 10
---
```
- **Leia:** `cerebro/checklist-documentos.md` e `cerebro/negocios-em-andamento.md`.
- **Faça:** por negócio, o que falta e o que vence (certidões, CRECI), com data, em `saidas/documentos/AAAA-MM-DD-pendencias.md`.
- **Nunca:** assinar, protocolar ou orientar juridicamente; dizer que um documento está "ok" sem a sua conferência.

```yaml
---
name: preco-sugerido
description: "Junta comparáveis da região para apoiar a sua conversa de preço com o proprietário. Use quando precisar de uma faixa de referência para um imóvel, nunca como avaliação oficial."
tools: Read, Write
model: sonnet
maxTurns: 15
---
```
- **Leia:** `cerebro/comparaveis.md` (que você alimenta).
- **Faça:** tabela de comparáveis (endereço, metragem, preço, fonte, data) e uma faixa marcada "sugestão", em `saidas/preco/AAAA-MM-DD-imovel.md`.
- **Nunca:** emitir avaliação oficial, definir preço para o proprietário ou usar comparável sem fonte e data.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/corretor.md` — identidade e limites. Qual seu nome, CRECI e região? · Qual o tom de voz? · O que o agente nunca diz (valor sem confirmar, financiamento, avaliação)? · Em quanto tempo você responde um lead novo?
- `cerebro/imoveis-disponiveis.md` — só dado confirmado. Quais imóveis ativos, com preço, metragem e condomínio? · Quando cada dado foi conferido (data)? · Qual aceita financiamento? · Quais estão suspensos ou vendidos?
- `cerebro/perguntas-de-qualificacao.md` — Quais 5 perguntas você sempre faz? · Que faixa de preço e bairro entram? · O que desqualifica um lead? · Quando o lead passa para você?
- `cerebro/regioes-e-perfis.md` — Que bairros você atende? · Que tipos de cliente (comprador, locatário, investidor)? · Que imóveis capta e quais recusa?
- `cerebro/checklist-documentos.md` — Quais documentos pede em compra, venda e locação? · Quais têm validade (certidões)? · Qual o prazo de cada uma? · Quem confere?
- `cerebro/negocios-em-andamento.md` — Quais negócios abertos e em que etapa? · Qual a pendência e o responsável de cada um? · Qual o prazo? · Quem falou por último com o cliente?
- `cerebro/comparaveis.md` — Que vendas e anúncios recentes da região você usa? · De onde vem cada preço (fonte e data)? · Que metragem e padrão entram na comparação? · Quando um comparável fica velho demais?

## Rotina, indicadores e integrações

- **Rotina:** diária, `vendas` prepara respostas aos leads novos e `agenda` lista as visitas de amanhã (você aprova) · semanal, `prospeccao` entrega leads priorizados e `documentos` lista pendências de cada negócio · mensal, `orquestrador` resume leads, visitas, propostas e fechamentos.
- **Indicadores:** leads novos e origem · lead para visita · visita para proposta · tempo de primeira resposta ao lead · imóveis captados e parados há muito tempo · documentos pendentes por negócio.
- **Integrações** (só leitura primeiro): Google Agenda, Gmail e Sheets (MCP comunitário, taylorwilsdon); Supabase (MCP oficial) para CRM simples de leads e imóveis, com projeto de teste primeiro; portais de anúncio via script, se oferecerem acesso (sem MCP confirmado; confira se o portal permite).

## Cuidados

- **Avaliação de imóvel:** o agente apoia, não avalia. Avaliação oficial é com profissional habilitado (confirme com seu conselho).
- **Financiamento:** só cite condições com dado atualizado do banco; o agente nunca promete aprovação nem taxa.
- **Dados do lead e do proprietário:** são pessoais. Peça só o necessário e não passe o contato do proprietário a um lead sem autorização dele (sugestão). Ver `../guia/08-legal-e-etica-br.md`.
- **Contato:** responda quem pediu contato; para prospecção ativa, tenha base legal e opção de sair da lista.
- **CRECI e atuação:** mantenha seu registro em dia. Há projeto de lei em debate sobre atuação irregular (PL 3.614/2015, agenda do Cofeci; confira o andamento).
- **Anúncio:** não prometa o que o imóvel não tem. Fotos geradas por IA precisam ser avisadas.

## Primeira semana

- [ ] Listar seus imóveis com dados confirmados em `imoveis-disponiveis.md`.
- [ ] Escrever as 5 perguntas de qualificação que você sempre faz.
- [ ] Criar `orquestrador` e `vendas` a partir dos modelos.
- [ ] Testar `vendas` com 5 conversas antigas de leads.
- [ ] Definir o prazo máximo para responder um lead novo e medir.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/imobiliaria.jsonl` (3 casos com `vendas` e `prospeccao`; cada caso chama a IA e gasta centavos; leia as respostas).
