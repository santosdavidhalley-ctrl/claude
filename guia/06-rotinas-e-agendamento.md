# Rotinas e agendamento

## O ciclo de uma rotina segura
1. **Escreva o pedido** como uma skill (ex.: `bom-dia`, `relatorio-semanal`). Uma rotina é uma skill + horário.
2. **Teste à mão** no terminal até funcionar.
3. **Rode em modo sem pergunta:** `node scripts/rodar-rotina.mjs relatorio-semanal --max-usd 1` (sem pedido, ele chama `/relatorio-semanal`). Skill de rotina se chama **com barra**: as skills `bom-dia` e `fechar-dia` são manuais (`disable-model-invocation`), então escrever "use a skill bom-dia" no pedido não funciona.
4. **Agende:** `node scripts/agendar.mjs relatorio-semanal "/relatorio-semanal" --hora 17:07 --dias sex` imprime o agendamento certo para o seu sistema, com os caminhos da sua máquina e o comando para desligar.
5. **Observe** por uma semana: log, custo, saídas.

## O que `rodar-rotina.mjs` faz por você
- Checa a pausa (`estado/PAUSA`) e não roda se estiver pausado.
- Chama `claude -p` com `--agent`, `--output-format json`, `--max-turns`, `--max-budget-usd` e `--permission-mode dontAsk`.
- Grava o relatório da execução em `saidas/rotinas/AAAA-MM-DD-nome-execucao.md` (o arquivo da própria skill fica intacto) e uma linha de **custo** em `estado/log.jsonl` com o valor informado pelo Claude (aparece em `scripts/custo.mjs` e no painel). Início e fim entram pelo log dos hooks.

## O `claude -p` por dentro (documentado)
- `-p` roda um pedido e sai; `--output-format json` devolve `result`, `session_id` e metadados; `--max-turns` e `--max-budget-usd` limitam; `--allowedTools`/`--disallowedTools` controlam ferramentas; `--agent` escolhe o agente; `--resume`/`--continue` retomam sessões.
- Sem ninguém para aprovar, o que precisaria de aprovação é **negado** (em `-p`). Por isso o perfil de operação libera de antemão só o necessário. Para rotina sem ninguém: `--permission-mode dontAsk` (ou `auto` com `--permission-prompts none`).
- `--bare` pula hooks, skills, agentes, MCP e CLAUDE.md: **não use** nas rotinas do escritório (você quer justamente isso carregado). A documentação avisa que o `--bare` vai virar o padrão do `-p` numa versão futura: quando isso acontecer, rode `node evals/rodar.mjs` e uma rotina à mão antes de confiar no agendamento.
- Custo: com `--output-format json`, o resultado traz `total_cost_usd` (estimativa do cliente, não a fatura). Fonte: https://code.claude.com/docs/en/headless (conferido em 28/10/2026).
- Login: a rotina usa o login do Claude Code da máquina. Para não falhar quando o login expirar, gere um token de 1 ano com `claude setup-token` e ponha em `CLAUDE_CODE_OAUTH_TOKEN` no agendamento. Se `ANTHROPIC_API_KEY` existir no ambiente, o `-p` usa a chave e cobra por uso. Fonte: https://code.claude.com/docs/en/authentication.

## Rotina com outra IA (Groq, Ollama, OpenRouter, Gemini...)
Para tarefas de texto (rascunho de post, resumo, resposta), `runner/escritorio-api.mjs` roda um agente com qualquer IA compatível, sem o Claude Code. Agende igual: `node scripts/agendar.mjs ideias "3 ideias de post" --hora 8:13 --motor api --agente conteudo --provedor groq`. Detalhes e limites em `guia/15-outras-ias.md`.

## Caminhos oficiais de agendamento
Veja a tabela em `agendar/LEIA-ME.md`. Resumo:
- **`/schedule`:** roda na nuvem da Anthropic, mesmo com o seu computador desligado. Prévia de pesquisa. **Exige login com conta claude.ai** (não funciona se `ANTHROPIC_API_KEY` estiver definida). Não acessa os arquivos locais; trabalha num clone do repositório. Mínimo de 1 hora entre execuções.
- **`/loop`:** repete um pedido dentro de uma sessão aberta. Bom para acompanhar algo agora; expira em 7 dias.
- **cron/launchd/Agendador do Windows:** a opção que enxerga os seus arquivos locais.
- **GitHub Actions:** para trabalho ligado a repositório.

## Boas rotinas para começar
| Rotina | Skill | Quando |
|---|---|---|
| Bom dia | `bom-dia` | Dias úteis, 9h07 |
| Fechar o dia | `fechar-dia` | Dias úteis, 18h07 |
| Relatório semanal | `relatorio-semanal` | Sexta, 17h07 |
| Triagem de e-mails (rascunhos) | `triagem-email` | 2x por dia, só com e-mail em modo rascunho |
| Relatório financeiro | `relatorio-financeiro` | Todo dia 1 |

## Avisos para o dono
`node scripts/avisar-telegram.mjs "Relatório semanal pronto"` no fim da rotina (veja `guia/05-integracoes.md`).

## O que NUNCA agendar
Envio de mensagens, publicações, pagamentos, exclusões. Agende **preparar** e deixe o **aprovar** para você.
