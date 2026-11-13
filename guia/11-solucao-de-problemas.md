# Solução de problemas

Primeiro reflexo: `node scripts/verificar-ambiente.mjs` (acusa a maioria dos tropeços abaixo), depois `claude --debug` e `/doctor`. Fonte: documentação oficial do Claude Code (conferida em 28/10/2026).

## Tropeços de quem está começando (sintoma → saída)

**Instalar**
- `claude: command not found` logo depois de instalar → feche e abra o terminal (o instalador muda o PATH). No Mac, o programa fica em `~/.local/bin/claude`.
- Windows bloqueia o script de instalação → use o comando oficial do PowerShell da página de instalação; se a política da empresa bloquear, instale no WSL2 (recomendado para o kit).
- Node antigo → instale a versão LTS em https://nodejs.org (o kit pede 20 ou mais novo).
- Conta: o plano gratuito do Claude não inclui o Claude Code. Use Pro, Max ou chave de API, ou outra ferramenta (`guia/15-outras-ias.md`).

**Abrir a pasta**
- Abriu o Claude na pasta pessoal inteira → ele enxerga tudo. Saia e abra DENTRO da pasta do escritório.
- Pasta na Mesa, em Documentos, em Downloads ou em OneDrive, iCloud, Dropbox, Google Drive → a sincronização trava arquivos ("operation timed out") e o Mac pede permissão de acesso. Mova para uma pasta comum, ex.: `escritorio-ia` na sua pasta pessoal.
- Descompactou duas vezes e ficou pasta dentro de pasta → trabalhe só na que tem o `COMECE-AQUI.md`.
- Não aceitou a pergunta de confiança da pasta → as permissões do projeto são ignoradas (veja a próxima seção).

**Primeira conversa**
- Respondeu em inglês → peça "responda sempre em português"; o `CLAUDE.md` da obra já pede.
- Cobrança inesperada ou "credit balance is too low" → `ANTHROPIC_API_KEY` está definida: o Claude Code usa a chave (cobra por uso) em vez da assinatura. `unset ANTHROPIC_API_KEY` e confira com `/status`.
- "Usage limit reached" → acabou a cota da janela da assinatura. Espere o horário que aparece; a obra continua de onde parou (`node scripts/obra.mjs`).

**Durante a obra**
- Agente ou hook novo não aparece → só carrega ao abrir o Claude de novo: `/exit` e `claude`.
- A IA quer copiar um molde por cima do que você já preencheu → não deixe: o kit manda ADAPTAR o arquivo que existe.
- Conversa longa e a IA esqueceu o combinado → `/clear` e diga "continue a obra": ela roda `node scripts/obra.mjs` e retoma.
- `node: command not found` num hook → o Claude Code não acha o Node (comum com nvm ou abrindo o editor pelo Dock). Instale o Node pelo instalador oficial ou abra o Claude pelo terminal.
- Tudo é negado de repente → a pausa está ligada (`estado/PAUSA`). Só você retoma, no seu terminal: `node scripts/pausar.mjs retomar`.
- Commit falha com "Please tell me who you are" → `git config --global user.name "Seu Nome"` e `git config --global user.email voce@exemplo.com`.
- Teste de agente falhou → leia a resposta antes de mexer: muitas vezes a regra do teste é que está estreita (`evals/LEIA-ME.md`).

**Painel**
- "Porta em uso" → o painel já está aberto em outra janela; feche-a ou use outra porta (o servidor diz como).
- No celular não abre → é de propósito: o painel não tem login, então só o próprio computador enxerga (`localhost`). Para ver de longe, use acesso remoto ao computador. Abrir para a rede exige pôr senha antes (`passos/08`).
- "Acesso negado" (403) ao abrir → o painel só aceita `localhost`, o IP da rede local ou nomes `.local`. Outros nomes: liste em `PAINEL_HOSTS`.

**Rotinas e custos**
- Rotina diz "ok" mas não fez nada → o pedido precisa da barra (`"/bom-dia"`) e o perfil precisa liberar o que ela usa. Leia o arquivo `-execucao.md` em `saidas/rotinas/`.
- Rotina não rodou na hora → computador dormindo, ou login expirado: gere o token com `claude setup-token` (`guia/06-rotinas-e-agendamento.md`).
- Custo zero no relatório → só as rotinas e o `runner/` informam custo; para conversas, use `/usage`.

**Outras IAs**
- Plano gratuito responde 429 ou 413 → limite por minuto ou pedido grande demais. Espere, diminua `--max-contexto` ou troque de provedor (`guia/15-outras-ias.md`).
- Ollama: "não conectou" → abra o Ollama (`ollama serve`) e baixe o modelo (`ollama pull <modelo>`).

## "Minhas regras de permissão não funcionam em `claude -p`" (a mais comum)
Numa pasta nova, o Claude Code **ignora as permissões do projeto** em `.claude/settings.json` até a pasta ser confiável. Mensagem real: "Ignoring N permissions.allow entries from .claude/settings.json: this workspace has not been trusted". **Solução:** abra o Claude interativamente nessa pasta (`claude`), aceite a pergunta de confiança, saia, e tente de novo. As rotinas e os testes do kit avisam quando isso acontece.

## O agente nunca é chamado
- Arquivo sem `name`, sem `---` na primeira linha, ou com YAML que não lê: é ignorado em silêncio. Use `claude --debug`.
- Campo com nome errado (camelCase: `disallowedTools`, `permissionMode`, `maxTurns`): ignorado sem erro.
- `name` com `:` não é permitido.
- `description` fraca: o Claude escolhe o agente pela descrição. Diga QUANDO usar.
- Chame explicitamente para testar: "Use o agente vendas para...".

## O hook não dispara
- `/hooks` mostra o que está ativo; confira evento e matcher.
- Matcher diferencia maiúscula de minúscula: `Write|Edit`, não `write`.
- Escrita por terminal (Bash) não dispara `Write|Edit`.
- Matcher de MCP precisa de `.*`: `mcp__memory__.*`.
- Se não aparece depois de editar o arquivo: reinicie a sessão. Confira vírgula sobrando no JSON.
- Teste o script à mão: `echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | node .claude/hooks/bloquear-perigoso.mjs; echo $?`.
- Hook que deveria BLOQUEAR precisa sair com código 2. Código 1 não bloqueia.

## "hook error" na conversa
Script não existe, sem permissão de execução (Mac/Linux, scripts `.sh`), caminho relativo (use `$CLAUDE_PROJECT_DIR`), ou erro de sintaxe. Os hooks do kit são `.mjs`: `node --check arquivo.mjs`.

## Permissão pedindo toda hora (ou negando tudo)
- Em `claude -p` o que pediria aprovação é NEGADO. Libere o necessário em `allow` ou use o perfil de operação.
- Regra `ask` força pergunta; hook `allow` não passa por cima de `deny`.
- `/permissions` lista as regras e de qual arquivo vêm.

## Contexto estourando / respostas piorando
- `/context` mostra o que está carregado; `/compact` resume; `/clear` recomeça (use ao trocar de assunto).
- CLAUDE.md curto; instruções longas viram skills; descrição de skill curta.
- Cérebro em arquivos pequenos.

## O CLAUDE.md não é seguido
É contexto, não regra aplicada à força. Confira com `/context` se o arquivo foi carregado. Se a regra precisa valer sempre, vire hook ou permissão. Instruções contraditórias: o Claude escolhe uma.

## A skill não é acionada
- `---` precisa estar na primeira linha. YAML inválido carrega a skill sem campos.
- A descrição é cortada em 1.536 caracteres: ponha o caso de uso no começo.
- Teste com `/nome-da-skill` direto. `disable-model-invocation: true` impede o disparo automático (é o desejado nas rotinas).

## `/schedule` diz "Unknown command"
Só funciona com login em conta claude.ai. Se `ANTHROPIC_API_KEY` estiver no ambiente, ou se você usa Bedrock/Vertex, não aparece. Remova a variável e faça `/login`.

## O visual não mostra nada
- `node visual/app/server.mjs` está rodando? Abra http://localhost:4700.
- `estado/equipe.json` existe e tem agentes? `estado/log.jsonl` tem linhas? Teste com `node scripts/gerar-eventos-teste.mjs`.
- Os hooks de registro (`log-eventos.mjs`) estão no `.claude/settings.json`? `/hooks` confirma.
- Nomes: o `agente` do log precisa ser igual ao `id` em `equipe.json`.

## O custo aparece zero
O hook de registro NÃO recebe custo. Só aparecem custos das rotinas (`scripts/rodar-rotina.mjs`), que leem `total_cost_usd` do `claude -p`. Para o resto, `/usage`.

## O modelo respondeu diferente do esperado
Alias de modelo (`haiku`, `sonnet`, `opus`) muda com a versão do Claude Code. Fixe com o ID completo se a diferença importar. Confira com `/status`.

## Windows
O Claude Code roda no Windows nativo ou no WSL2. No Windows nativo não existe sandbox e os hooks dependem do Git for Windows: para o kit, prefira o **WSL2**. Os scripts do kit usam só Node e funcionam nos dois.
