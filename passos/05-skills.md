# Etapa 5 — Skills (habilidades reutilizáveis)

**Objetivo:** ensinar um "jeito de fazer" uma vez e reaproveitar.

## Saber antes
- **Agente** = quem faz (função, ferramentas, modelo). **Skill** = como se faz uma tarefa (um procedimento em passos).
- Uma skill é uma pasta com `SKILL.md`: cabeçalho com `description` (o Claude decide por ela quando carregar) e os passos. Ficam em `.claude/skills/` (o `iniciar.mjs` já copiou as 17) ou em `~/.claude/skills/` (vale para todos os projetos). É um padrão aberto: outras ferramentas leem o mesmo formato (`guia/15-outras-ias.md`).
- Os agentes do kit têm a ferramenta `Skill` e uma lista "Skills que você usa": a skill só é carregada quando o pedido combina, o que economiza tokens.
- Skills **manuais** (`disable-model-invocation: true`: `bom-dia`, `fechar-dia`, `criar-agente`, `auditar-escritorio`, `testar-injecao`) só rodam quando alguém digita `/nome`. Em rotina, o pedido é `"/bom-dia"`.
- Fonte: https://code.claude.com/docs/en/skills e https://code.claude.com/docs/en/sub-agents (conferido em 28/10/2026).

## Fazer
1. Escolha as 2 ou 3 skills mais úteis para o negócio (ex.: `responder-cliente`, `proposta-comercial`, `relatorio-semanal`) e ADAPTE os passos delas em `.claude/skills/`. Não copie de novo.
2. Com o OK da pessoa, tire as que não servem ao negócio: mova para `estado/removidos/skills/`. Menos skills = menos coisa para o Claude considerar.
3. Para uma tarefa que a pessoa repete muito, siga `.claude/skills/criar-skill/SKILL.md`.

## Skills de terceiros: cuidado
- Uma skill pode trazer scripts. Antes de instalar uma de terceiros, leia o `SKILL.md` e todos os arquivos dela. Prefira autores conhecidos e repositórios mantidos.

## Testar (feito quando)
- Peça uma tarefa que case com a descrição de uma skill adaptada: o Claude diz que está usando a skill.
- Ou digite `/nome-da-skill` para testar direto.
- Marque: `node scripts/obra.mjs passou 5 --nota "..." --commit`.

## Erros comuns
- `description` genérica: a skill nunca é chamada. Escreva "use quando...".
- Skill enorme: divida em arquivos e deixe o `SKILL.md` só com o roteiro.
