# Perfis de permissão

## Neste escritório: app do Claude (nuvem) + computador

O dono usa o escritório nos dois lugares, então as permissões ficaram em duas camadas (adaptação feita em 12/11/2026; os perfis originais do kit continuam logo abaixo, como referência):

- **Base, vale em todo lugar: `.claude/settings.json`** (vai para o Git). Tem a pausa, a trava de comandos perigosos, o registro de eventos, a negação de leitura de `.env` e de `rm`, `sudo`, `curl` e `wget`, e a escrita sem pergunta só em `saidas/`, `estado/`, `DIARIO.md` e `cerebro/memoria/propostas.md`.
- **Travas extras do computador: `.claude/settings.local.json`** (NÃO vai para o Git; cada computador liga a sua). Ligue com `node scripts/perfil.mjs computador`: sandbox, não ler fora da pasta e `git push` negado para a IA. Para rotinas sem ninguém olhando: `node scripts/perfil.mjs operacao` (modo `dontAsk`, escrita só nas pastas permitidas pelo hook `so-dentro-da-pasta`). Os moldes estão em `modelos/perfis/`. Ver o que está ativo: `node scripts/perfil.mjs`.

**Por que a base não tem as três travas do computador:** no app do Claude cada conversa roda numa máquina isolada, criada para aquela conversa e descartada depois. Lá, o sandbox e a negação de `git push` impediriam salvar o trabalho no GitHub, e "não ler fora da pasta" impediria ler os arquivos que o dono anexa na conversa. No computador, onde estão os arquivos pessoais do dono, essas travas continuam obrigatórias: o `node scripts/testar-travas.mjs` acusa FALHOU se faltarem.

**Limites honestos desta adaptação:**
- Na nuvem, quem contém a IA é a máquina isolada e a política de rede do ambiente, não o sandbox do kit. Confira a política de rede do seu ambiente nas configurações do Claude Code na web.
- Na nuvem, a IA consegue fazer `git push` para o ramo da conversa (é assim que o trabalho é salvo). Push forçado continua bloqueado pelo hook.
- `saidas/`, `dados/` e `estado/log.jsonl` não vão para o Git: na nuvem somem quando a conversa termina.
- A pausa (`node scripts/pausar.mjs`) é para o computador. No app, pare a conversa pelo próprio app.

## Os perfis originais do kit

O Claude Code lê `.claude/settings.json`. O kit traz dois perfis. Troque conforme a fase:

- **`settings.json` — CONSTRUÇÃO.** Para a fase em que você está montando o escritório com o Claude. O Claude lê os arquivos desta pasta (nada fora dela: `blockReadsOutsideWorkingDirectories`), edita sem perguntar só `saidas/`, `estado/`, `DIARIO.md` e `cerebro/memoria/propostas.md`; o resto ele pede. Comandos de terminal rodam sem perguntar DENTRO da sandbox (isolados na pasta); onde a sandbox não existe (Windows sem WSL2, Linux sem bubblewrap), eles perguntam. Tem a trava de comandos perigosos, a pausa e o registro de eventos.
- **`settings.operacao.json` — OPERAÇÃO.** Para quando o escritório já funciona e para rotinas sem ninguém olhando. Modo `dontAsk`: o que não estiver liberado é NEGADO (nada de pergunta que ninguém vai responder). Escrita só em `saidas/`, `estado/`, `DIARIO.md` e `cerebro/memoria/propostas.md`, com a trava `so-dentro-da-pasta`. Terminal: só o que estiver liberado na lista (`autoAllowBashIfSandboxed: false`).

## Como trocar
1. Guarde o atual: copie `.claude/settings.json` para `.claude/settings.construcao.json`.
2. Copie `modelos/settings.operacao.json` para `.claude/settings.json`.
3. Abra o Claude e rode `/permissions` e `/hooks` para conferir que as regras e as travas apareceram.
4. Teste os bloqueios (peça para ler um `.env` de exemplo; peça para escrever em `cerebro/empresa.md`). Os dois precisam ser negados.

## Observações honestas
- Os valores `auto` e `bypassPermissions` não são aceitos como padrão em settings de projeto (conforme a documentação). Não use `bypassPermissions` num computador com os seus dados.
- As regras de permissão e os hooks são aplicados pelo programa, não pelo modelo. O `CLAUDE.md` orienta, mas não obriga.
- Os dois perfis liberam, sem pergunta, só dois comandos de leitura do log: `node scripts/resumo-log.mjs` e `node scripts/custo.mjs` (usados pelas rotinas de bom-dia, fechar o dia e relatório semanal).
- Regra de escrita é sempre `Edit(caminho)`: a documentação diz que regras `Write(caminho)` são aceitas mas nunca valem.
- O hook `so-dentro-da-pasta` só vê as ferramentas Write e Edit. Escrita por terminal (Bash) é contida pelo sandbox e pelas regras de negação; por isso o sandbox fica ligado.
- O sandbox cobre só comandos de terminal. As ferramentas de arquivo, os servidores MCP e os hooks rodam FORA dele. No Windows nativo não há sandbox: use WSL2. Se o sandbox não abrir (falta dependência), o Claude Code roda os comandos sem isolamento; para travar em vez disso, ponha `"failIfUnavailable": true` no bloco `sandbox` (no Windows nativo isso impede o Claude Code de abrir).
- `blockReadsOutsideWorkingDirectories` exige Claude Code 2.1.257 ou mais novo; em versão antiga ele só é ignorado com um aviso.
- Se uma regra tiver sintaxe errada, o Claude Code ignora ou avisa: confira sempre com `/permissions`.
- Fonte: https://code.claude.com/docs/en/permissions e https://code.claude.com/docs/en/hooks (conferidos em 28/10/2026) e https://code.claude.com/docs/en/sandboxing.
