# Etapa 6 — Conectar um agente no outro (orquestrador)

**Objetivo:** você fala com UM agente (o orquestrador) e ele distribui o trabalho.

## Saber antes
- O orquestrador pode **chamar outros agentes**: `tools: Agent(vendas, suporte, conteudo), ...`. A lista em `Agent(...)` limita quais. O `iniciar.mjs` já montou com os agentes escolhidos; para mudar depois, use `node scripts/agente.mjs add <id>` ou `remove <id>`.
- Para falar direto com ele: `claude --agent orquestrador`, numa sessão NOVA depois de criar os agentes.
- Cada agente chamado começa **do zero**. O orquestrador do kit manda 5 itens no pedido (objetivo, contexto, leituras, entrega, limites) e confere o resultado antes de responder.
- Do mais simples ao mais complexo: pipeline (A → B → C), roteador (escolhe 1 agente; é o modelo do kit), paralelo. Equipes de agentes que conversam entre si (*agent teams*) são experimentais, vêm desligadas e gastam muito mais: não comece por elas. Detalhes: `guia/03-padroes-de-orquestracao.md`.
- Fonte: https://code.claude.com/docs/en/sub-agents (conferido em 28/10/2026).

## Fazer
1. `node scripts/agente.mjs listar`: a lista `Agent(...)` do orquestrador tem de bater com os arquivos de `.claude/agents/` e com o painel.
2. Peça à pessoa para abrir `claude --agent orquestrador` numa sessão nova e pedir algo que envolva 2 agentes (ex.: "responda este lead e prepare um post sobre o mesmo produto").

## Testar (feito quando)
- O orquestrador disse quais agentes chamou e por quê, e cada um gravou em `saidas/<agente>/`.
- `node scripts/resumo-log.mjs --horas 1` mostra os agentes que trabalharam (início e fim entram pelos hooks).
- Sem a pessoa abrir outro terminal: `node scripts/rodar-rotina.mjs teste-orquestrador "Responda o lead da loja Alfa e prepare um post sobre o mesmo produto" --max-usd 0.5` (custa centavos).
- Marque: `node scripts/obra.mjs passou 6 --nota "..." --commit`.

## Erros comuns
- Loop: um agente chama outro que chama o primeiro. Hierarquia numa direção só (orquestrador → agentes).
- Cadeia de erro: um agente inventa um fato e o próximo trata como verdade. Por isso o orquestrador confere antes de responder.
- Agentes demais. Comece com 2 ou 3.
