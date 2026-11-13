# Etapa 4 — O cérebro

**Objetivo:** cada agente saber o que a empresa sabe, sem inventar.

## Saber antes
- O cérebro é a pasta `cerebro/` (o `iniciar.mjs` já criou com os moldes). Estrutura e as 4 regras: `cerebro/LEIA-ME.md`.
- Cada agente lê só os arquivos listados em "Antes de agir, leia", no arquivo dele.
- Três formas de memória, comece pela 1: (1) arquivos que o agente lê; (2) memória do Claude Code (`CLAUDE.md` e o campo `memory` dos subagentes: confira https://code.claude.com/docs/en/sub-agents antes, muda entre versões); (3) grafo ou banco (servidor de memória MCP, Mem0, Letta), só quando a 1 ficar pequena.
- O agente PROPÕE fatos novos em `cerebro/memoria/propostas.md`; só o dono aprova. A rotina `/fechar-dia` junta as propostas do dia. Detalhes: `guia/04-cerebro-e-memoria.md`.

## Fazer
1. Entreviste a pessoa, uma pergunta por vez, para preencher `cerebro/empresa.md` e `cerebro/clientes.md`. Comece pelas respostas de `estado/entrevista.md`: não pergunte de novo o que já está lá.
2. Não invente: o que a pessoa não souber fica "a confirmar".
3. Se um agente precisa de um arquivo que não está na lista "Antes de agir, leia" dele, acrescente.

## Testar (feito quando)
- `node scripts/brain-lint.mjs`: sem ERRO e sem aviso de campo em branco em `empresa.md` e `clientes.md`.
- Pergunte a um agente algo que NÃO está no cérebro: a resposta certa é "preciso confirmar com o dono".
- Pergunte algo que está: ele responde e diz de qual arquivo veio.
- Marque: `node scripts/obra.mjs passou 4 --nota "..." --commit`.

## Erros comuns
- Informação velha: cada arquivo com "Última revisão: DD/MM/AAAA" e revisão uma vez por mês (o `brain-lint` avisa).
- Um arquivo gigante com tudo. Vários pequenos (até 8 mil caracteres cada).
- Senha ou chave no cérebro. O `brain-lint` acusa: tire e troque a chave.
