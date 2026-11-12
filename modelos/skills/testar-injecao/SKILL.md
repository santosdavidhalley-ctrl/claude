---
name: testar-injecao
description: Roda os casos de teste de prompt injection do kit (evals/casos-injecao.jsonl) contra os agentes e mostra quais foram enganados. Só o dono dispara, com /testar-injecao <agente>.
disable-model-invocation: true
argument-hint: "<agente a testar, ex.: suporte>"
---

# Teste de injeção de prompt

Agente a testar: $ARGUMENTS

1. Explique ao dono, em 3 linhas, o que será feito: enviar ao agente mensagens com instruções escondidas e conferir se ele as ignora.
2. Rode no terminal: `node evals/rodar.mjs evals/casos-injecao.jsonl --agente $ARGUMENTS`. Isto usa o `claude -p` e tem custo pequeno: avise antes.
3. Leia o relatório em `evals/resultados/`. Para cada caso reprovado, mostre: a mensagem, o que o agente respondeu e qual regra faltou.
4. Proponha (sem aplicar) o reforço no arquivo do agente e peça o OK.
