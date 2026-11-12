# Etapa 9 — Rotinas, testes e custos

**Objetivo:** o escritório trabalhar sem você digitar tudo, sem estourar o orçamento, e com testes que protegem o que já funciona.
**Leia antes:** `../guia/06-rotinas-e-agendamento.md`, `../guia/09-testes-e-avaliacao.md`, `../guia/10-operacao-custos-e-incidentes.md`.

## 1. Teste os agentes (antes de automatizar)
- Ajuste `evals/casos-basicos.jsonl` ao seu cérebro. Rode poucos casos: `node evals/rodar.mjs evals/casos-basicos.jsonl --so vendas-preco-fora-do-cerebro`.
- Rode `evals/casos-injecao.jsonl` com `/testar-injecao <agente>`.
- **Cada caso gasta de verdade.** Olhe o custo no fim.

## 2. Uma rotina só
- Escolha: `bom-dia` ou `relatorio-semanal`.
- Rode à mão: `node scripts/rodar-rotina.mjs bom-dia` (chama `/bom-dia`).
- Gere o agendamento do seu sistema: `node scripts/agendar.mjs bom-dia "/bom-dia" --hora 9:07` (só imprime; aplique depois do OK).
- Veja a saída em `saidas/rotinas/` e a linha no painel.
- Troque para o perfil de operação (`modelos/LEIA-ME-perfis.md`) para rotinas sem ninguém olhando.
- Só então agende (`agendar/LEIA-ME.md`). Observe por uma semana.

## 3. Custos
- `node scripts/custo.mjs` mostra o gasto por dia e por agente das rotinas e avisa acima de `LIMITE_DIA_USD`. Resumo do que cada agente fez: `node scripts/resumo-log.mjs --dias 7`.
- O log cresce: uma vez por mês, `node scripts/custo.mjs --rotacionar` arquiva o que tem mais de 30 dias em `estado/arquivo/` (nada se perde; o resumo continua lendo).
- Teto mensal na conta da API. `maxTurns` nos agentes. `--max-usd` nas rotinas.

## 4. Manutenção (15 minutos por mês)
1. `node scripts/brain-lint.mjs` e revisar o cérebro.
2. `/auditar-escritorio`.
3. Ler o log do mês: que agente mais errou?
4. Conferir gastos e chaves.
5. Rodar de novo os testes de bloqueio (etapa 7) e os `evals/`.

## Próximos passos (só com o básico estável)
- Conectar ferramentas reais, **uma por vez, só leitura primeiro** (`guia/05-integracoes.md`).
- Aviso no Telegram ao fim das rotinas (`scripts/avisar-telegram.mjs`).
- Agent SDK para rodar como programa (`runner/`).
- Empacotar como plugin (`guia/12-plugins-e-distribuicao.md`).
- Painel 3D e login para mandar tarefas pela tela.

## Como conferir (critério da etapa)
Uma rotina rodou com `scripts/rodar-rotina.mjs` e o gasto aparece em `node scripts/custo.mjs`.
- Marque: `node scripts/obra.mjs passou 9 --nota "..." --commit`.
