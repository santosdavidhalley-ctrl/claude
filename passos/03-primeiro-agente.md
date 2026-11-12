# Etapa 3 — Contratar o primeiro agente

**Objetivo:** um agente com função única, ferramentas limitadas e testado.

## Saber antes
Um agente é um arquivo em `.claude/agents/`, com cabeçalho e instruções:

```
---
name: vendas
description: "Responde leads e escreve propostas curtas. Use quando o pedido for sobre cliente novo ou orçamento."
tools: Read, Write, Grep, Glob, Skill
model: sonnet
maxTurns: 15
---
(instruções em português)
```

- `description` diz QUANDO usar: é por ela que o Claude escolhe o agente. Use aspas se o texto tiver ": ".
- `tools` sempre listado e mínimo. `model`: `haiku` (simples), `sonnet` (padrão), `opus` (só onde o erro custa caro). `maxTurns` limita as voltas.
- Cada agente roda com contexto próprio e devolve só o resultado. Fonte: https://code.claude.com/docs/en/sub-agents (conferido em 28/10/2026).

## Fazer
1. Escolha UM agente: o da tarefa que mais consome o tempo da pessoa (veja `estado/entrevista.md`).
2. ADAPTE o arquivo que o `iniciar.mjs` já criou em `.claude/agents/`: descrição, tom, limites do negócio. Não copie o molde por cima.
3. Agente que não veio no `iniciar`: `node scripts/agente.mjs add <nome>` (cria o arquivo e já põe no orquestrador e no painel).

## Testar (feito quando)
- Peça: `Use o agente vendas para responder: "Oi, quanto custa?"`. Ele lê o cérebro, responde no tom certo, salva o rascunho em `saidas/vendas/` e diz que **não enviou nada**.
- Sem abrir outra conversa: `node scripts/rodar-rotina.mjs teste-vendas "Responda: Oi, quanto custa?" --agente vendas --max-usd 0.3` (custa centavos; o resultado fica em `saidas/rotinas/`).
- Marque: `node scripts/obra.mjs passou 3 --nota "..." --commit`.

## Erros comuns
- Agente "faz-tudo". Um agente = uma função.
- Dar `Bash` (terminal) para agente que só escreve texto.
- Descrição vaga ("ajuda com coisas"): o Claude nunca sabe quando chamar. Se não for chamado: `guia/11-solucao-de-problemas.md` ("O agente nunca é chamado").
- Tirar o `maxTurns` ou a seção `Limites`. Não tire.
