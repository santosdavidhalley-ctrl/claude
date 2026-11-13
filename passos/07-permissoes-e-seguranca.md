# Etapa 7 — Permissões e segurança

**Objetivo:** os agentes agem no seu computador só dentro do que você permitiu, com travas que o programa aplica de verdade e um botão de pausa.
**Leia antes:** `../seguranca/REGRAS.md` e `../guia/07-seguranca-avancada.md`.

## Como o Claude Code decide o que pode
- **Modos de permissão:** `default` (pergunta), `acceptEdits`, `plan` (só planeja), `dontAsk` (nega o que perguntaria; bom para rotina), `bypassPermissions` (pula tudo: **nunca** no computador com os seus dados).
- **Regras** (`allow` / `deny`) em `.claude/settings.json`: aplicadas pelo programa, não pelo modelo.
- **Hooks:** pequenos programas que rodam SEMPRE antes de uma ferramenta e podem bloquear (saindo com código 2).
- **Sandbox:** isola os comandos de terminal (macOS, Linux, WSL2). Camada extra, não garantia.
- Fonte: https://code.claude.com/docs/en/permissions, /settings, /hooks, /sandboxing (conferido em 27/10/2026).

## Neste escritório (app do Claude + computador)
As permissões ficaram em duas camadas: a base em `.claude/settings.json` (vale nos dois lugares) e as travas extras do computador em `.claude/settings.local.json`, ligadas com `node scripts/perfil.mjs computador`. O motivo e os limites estão no começo de `modelos/LEIA-ME-perfis.md`. No app do Claude, o `testar-travas` mostra sandbox e "não lê fora da pasta" como `n/a`.

## O que o kit já traz
- `modelos/settings.json` — perfil de **construção** (já copiado para `.claude/settings.json` pelo `iniciar.mjs`).
- `modelos/settings.operacao.json` — perfil de **operação** (para depois e para rotinas). Veja `modelos/LEIA-ME-perfis.md`.
- Hooks em `.claude/hooks/`: `bloquear-perigoso` (rm -rf, sudo, curl|sh, push forçado, .env), `pausa` (botão de emergência), `log-eventos` (alimenta o painel), `so-dentro-da-pasta` (perfil de operação).

## O que fazer
1. Confira o que está ativo: `/permissions` e `/hooks`. Se estiver vazio, saia e abra o Claude de novo (configurações novas só carregam ao abrir).
2. **Teste automático (custo zero):** `node scripts/testar-travas.mjs` roda cada trava com pedidos de exemplo (33 conferências). Tudo tem de dar `ok`.
3. **Teste ao vivo dos bloqueios:**
   - Peça: "leia o arquivo .env" (crie um `.env` de exemplo vazio) → tem que ser NEGADO.
   - Peça: "apague a pasta saidas/teste com rm -r" → tem que ser BLOQUEADO.
   - Pausa: rode `node scripts/pausar.mjs --teste 30` e, nos 30 segundos, peça qualquer leitura → tem que ser NEGADA. Depois ela volta sozinha. (A pausa normal, sem `--teste`, só o DONO tira, no terminal dele: a IA pausada não consegue rodar comando nenhum, de propósito.)
4. Agentes que leem conteúdo de fora (e-mail, site) **não** recebem ferramenta de enviar, publicar ou apagar.
5. Rode `/auditar-escritorio` e leia o relatório.

## Como conferir (critério da etapa)
`node scripts/testar-travas.mjs` termina com "Todas as travas responderam certo", os dois bloqueios ao vivo foram negados e a pausa de teste negou as ferramentas e voltou sozinha.
- Marque: `node scripts/obra.mjs passou 7 --nota "..." --commit`.

## Erros comuns
- Achar que escrever "nunca apague arquivos" no CLAUDE.md protege. Não protege.
- Chave de API dentro da pasta do projeto sem bloquear a leitura do arquivo.
- Dar ao mesmo agente: ler a internet + ler seus arquivos + enviar mensagens.
- Regra com sintaxe errada: ignorada ou avisada. Sempre confira com `/permissions`.
