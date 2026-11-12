# Modelos e custos

## Qual modelo para quê
| Modelo | Use para | Evite para |
|---|---|---|
| **Haiku** | Triagem, classificação, resumos curtos, agenda, tarefas repetitivas simples | Texto de cliente sensível, análise longa, decisões com risco |
| **Sonnet** | O dia a dia: vendas, suporte, conteúdo, análise, orquestração | Tarefas simples em grande volume (gasta à toa) |
| **Opus** | Decisões complexas, revisão final de algo caro, problemas difíceis | Rotina diária (custa mais para o mesmo resultado em tarefa fácil) |

No arquivo do agente: `model: haiku` (ou `sonnet`, `opus`, `inherit`). **Comece em Sonnet para o orquestrador, vendas e conteúdo; Haiku para agenda, triagem e suporte (rascunho que você aprova).** Suba de modelo só se os testes (`evals/`) mostrarem que o menor falha.

## Preços da API (por milhão de tokens, entrada / saída), conferidos em 27/10/2026
| Modelo | Entrada | Saída |
|---|---|---|
| Opus 5.5 | US$ 4 | US$ 20 |
| Sonnet 5.5 | US$ 2 | US$ 10 |
| Haiku 5.5 (prompts até 100 mil tokens) | US$ 0,10 | US$ 0,50 |

Fonte: https://platform.claude.com/docs/en/about-claude/pricing. **Preços mudam.** Confira antes de decidir. Há descontos de cache e lote que não estão na tabela acima.

## Como estimar uma tarefa (exemplo hipotético, troque pelos seus números)
Custo = (tokens de entrada × preço de entrada + tokens de saída × preço de saída) ÷ 1.000.000.
Exemplo: 20.000 tokens de entrada e 2.000 de saída em Sonnet = 20.000 × 2 ÷ 1.000.000 + 2.000 × 10 ÷ 1.000.000 = US$ 0,04 + US$ 0,02 = **US$ 0,06**. Esses números são só para mostrar a conta: os seus dependem do tamanho do cérebro e das respostas. Meça de verdade com `scripts/custo.mjs` e `/usage`.

## Assinatura x API
- **Assinatura (Pro/Max):** uso dentro de um limite por janela de horas. Bom para você conversando no terminal.
- **API (Console):** cobrança por token. Obrigatória para programas com o Agent SDK e para produtos de terceiros.
- Se `ANTHROPIC_API_KEY` estiver definida no ambiente, o Claude Code usa a chave (e cobra por uso) em vez da assinatura; `/schedule` deixa de funcionar. Confira com `/status`.

## O que mais gasta (e como evitar)
- **Vários agentes em paralelo:** cada um tem contexto próprio. A Anthropic observou que sistemas multiagente consomem muito mais tokens que um agente só. Delegue só o que compensa.
- **Equipes de agentes que conversam entre si (agent teams):** recurso experimental que gasta ainda mais. Não comece por ele.
- **Cérebro grande carregado sempre:** use arquivos pequenos e leitura sob demanda; tire instruções longas do CLAUDE.md e ponha em skills.
- **Conversas enormes:** use `/clear` ao trocar de assunto e `/compact` com instrução de foco.
- **Loop de agente:** sempre defina `maxTurns` nos agentes e `--max-budget-usd` nas rotinas.

## Travas de gasto (use as três)
1. **No agente:** `maxTurns`.
2. **Na rotina:** `scripts/rodar-rotina.mjs ... --max-usd 1` (usa `--max-budget-usd` do `claude -p`; é estimativa do cliente).
3. **Na conta:** teto mensal e alertas no painel da Anthropic. É a única trava que vale mesmo se tudo mais falhar.

`scripts/custo.mjs` mostra o gasto por dia e por agente das rotinas e avisa quando passa de `LIMITE_DIA_USD`.
