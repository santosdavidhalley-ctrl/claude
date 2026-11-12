# Agendar rotinas

Escolha UM caminho. Comece com uma rotina só, observe por uma semana.

| Caminho | Roda onde | Precisa do computador ligado | Observação |
|---|---|---|---|
| `/schedule` (rotinas na nuvem) | Nuvem da Anthropic | Não | Prévia de pesquisa. Exige login com conta claude.ai (NÃO funciona com chave de API). Clone novo do repositório: sem acesso aos seus arquivos locais. Intervalo mínimo de 1 hora. |
| `/loop` | Sua máquina, dentro de uma sessão aberta | Sim, com a sessão aberta | Para acompanhar algo agora (ex.: "veja o deploy a cada 5 minutos"). Expira em 7 dias. |
| `cron` / launchd / Agendador de Tarefas + `scripts/rodar-rotina.mjs` | Sua máquina | Sim | Acessa seus arquivos locais. É o padrão do sistema operacional (gere com `scripts/agendar.mjs`). |
| GitHub Actions (`anthropics/claude-code-action`) | Servidor do GitHub | Não | Para tarefas ligadas a repositório (revisão de código, issues). |

Fonte: https://code.claude.com/docs/en/scheduled-tasks e /routines (conferidos em 27/10/2026; os limites podem mudar).

## Para rotinas locais (cron, launchd, Agendador)
- **Gere pronto:** `node scripts/agendar.mjs <nome> "/<skill>" --hora 9:07 [--dias uteis|todos|seg,qua]` imprime o agendamento do SEU sistema com os caminhos certos, e o comando para desligar. Não instala nada sozinho.
- **Skill com barra:** o pedido da rotina é `/bom-dia`, não "use a skill bom-dia" (as skills de rotina são manuais).
- **Login que expira:** gere um token de 1 ano com `claude setup-token` e coloque `CLAUDE_CODE_OAUTH_TOKEN` nas variáveis do agendamento (é segredo: só ali). Se `ANTHROPIC_API_KEY` existir no ambiente, o `claude -p` usa a chave e cobra por uso.
- **Desligar:** launchd `launchctl bootout gui/$(id -u)/<rótulo>`; cron `crontab -e` e apague a linha; Windows `schtasks /Delete /TN <nome> /F`.
- **Nada de pergunta:** a rotina roda em modo `dontAsk` e só faz o que o `settings.json` libera. Use o perfil de operação.
- **Caminhos completos:** o agendador não tem o seu PATH. Use o caminho completo do `node` e, se precisar, defina `CLAUDE_BIN` com o caminho completo do `claude` (`which claude`).
- **Computador dormindo não roda:** se o Mac estiver em repouso na hora, a rotina não acontece.
- **Horário quebrado:** evite horário redondo; use 9:07 em vez de 9:00.
- **Log:** redirecione a saída para `estado/agendador.log` e confira nos primeiros dias.
- **Teste à mão primeiro:** rode o mesmo comando no terminal até funcionar, só depois agende.

Exemplos prontos: `cron.txt`, `launchd-mac.plist`, `windows.md`.
