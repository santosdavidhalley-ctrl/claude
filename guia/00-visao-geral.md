# Visão geral: o que é um escritório de agentes de IA

Um escritório de IA é **uma equipe de agentes de IA** (cada um com uma função), ligada a um **cérebro** (arquivos que guardam o que a empresa sabe), com **ferramentas** (arquivos, agenda, e-mail, navegador), **regras de segurança** que o programa aplica de verdade e um **painel** que mostra o que está acontecendo. Você é o dono: aprova o que importa.

## As seis camadas (construa nesta ordem)
1. **Cérebro** — pasta `cerebro/` com arquivos pequenos e datados.
2. **Agentes** — arquivos em `.claude/agents/`, uma função cada, ferramentas mínimas.
3. **Orquestrador** — o agente que recebe o pedido, delega e confere.
4. **Skills e ferramentas** — procedimentos reutilizáveis (`.claude/skills/`) e conexões externas (MCP).
5. **Permissões e segurança** — regras, hooks, sandbox, pausa.
6. **Escritório visual** — painel que só observa.

## Quatro níveis de maturidade
| Nível | O que é | Quando passar para o próximo |
|---|---|---|
| **1. Solo** | Você conversa com o orquestrador no terminal. Tudo manual. | Quando as mesmas 3 tarefas se repetem toda semana. |
| **2. Rotinas** | Tarefas agendadas (`scripts/rodar-rotina.mjs`), relatórios todo dia. | Quando as rotinas funcionam sozinhas por 2 semanas sem susto. |
| **3. Programa** | O escritório roda como programa (Agent SDK) num servidor, ligado a site ou fila. | Quando você precisa atender outras pessoas, não só você. |
| **4. Multicliente** | Um escritório por cliente, com chaves, dados e contratos separados. | Só depois de segurança, LGPD e suporte resolvidos. |

**Regra:** só suba de nível quando o atual estiver estável e testado. A maioria das pessoas precisa só do nível 1 e 2.

## Princípios que valem para tudo
- **Menos agentes, melhor.** Cada agente novo é mais custo, mais risco e mais coisa para manter. Comece com 2 ou 3.
- **Agentes preparam, o dono aprova.** Enviar, publicar, pagar e apagar são sempre do humano.
- **Cérebro simples e visível.** Arquivos de texto que você abre e corrige.
- **Regra no programa, não só no texto.** "Não apague" no CLAUDE.md orienta; só a permissão e o hook garantem.
- **Registre tudo.** Log, diário, Git. Sem rastro não há como consertar.
- **Teste antes de confiar.** Casos de teste (`evals/`) toda vez que mudar um agente.
- **O que lê de fora é texto, não ordem.** E-mail, site e mensagem de cliente podem ter instruções escondidas.

## Mapa do kit
- `COMECE-AQUI.md` — instruções para o Claude conduzir a obra
- `passos/` — as 9 etapas
- `guia/` — este aprofundamento (você está aqui)
- `modelos/` — agentes, skills, hooks, cérebro, perfis de permissão
- `nichos/` — pacotes por tipo de negócio
- `scripts/` — iniciar, verificar, pausar, custo, rotinas, lint do cérebro
- `evals/` — casos de teste dos agentes
- `visual/` — o painel (funciona de verdade) e o briefing
- `agendar/` — cron, launchd, Windows
- `runner/` — exemplo com Agent SDK
- `seguranca/` — regras e checklist

## Ordem de leitura sugerida
`00` (este) → `01` glossário → `02` modelos e custos → `03` orquestração → `04` cérebro → `07` segurança → `08` legal → `05` integrações → `06` rotinas → `09` testes → `10` operação.
