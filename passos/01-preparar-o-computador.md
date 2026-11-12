# Etapa 1 — Preparar o computador

**Objetivo:** Claude Code funcionando, uma pasta de projeto confiável e o ambiente verificado.
**Leia antes (se quiser):** `../guia/00-visao-geral.md` e `../guia/02-modelos-e-custos.md`.

## O que instalar
- **Claude Code** (conferido em https://code.claude.com/docs/en/setup em 27/10/2026; se mudar, a página manda):
  - Mac, Linux ou WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
  - Mac com Homebrew: `brew install --cask claude-code`
  - Windows com WinGet: `winget install Anthropic.ClaudeCode`
- **Git** (guarda o histórico e permite desfazer erros): https://git-scm.com
- **Node.js 18 ou superior** (o painel e os scripts do kit usam): https://nodejs.org

## Conta e custo
- O Claude Code funciona com **assinatura Claude (Pro ou Max)** ou com **conta de API (Console)**. A assinatura tem limite por janela de horas; a API cobra por uso.
- Se você for programar com o **Agent SDK**, a documentação oficial manda usar **chave de API**.
- Defina um **teto mensal de gasto** na conta de API antes de qualquer automação.
- Se a variável `ANTHROPIC_API_KEY` estiver definida, o Claude Code usa a chave (cobrança por uso) em vez da assinatura. Confira com `/status`.

## Preparar a pasta
1. Descompactou o kit? Aquela pasta **é** o seu projeto. Renomeie se quiser.
2. No terminal, entre nela e rode `git init` (se ainda não for um repositório).
3. Digite `claude`. **Aceite a pergunta de confiança da pasta.** Sem isso, as regras de permissão do projeto são ignoradas, principalmente nas rotinas.
4. Rode (fora do Claude, no terminal): `node scripts/verificar-ambiente.mjs`. Corrija toda linha FALHA.

## Como conferir (critério da etapa)
- `claude --version`, `git --version` e `node --version` respondem.
- `node scripts/verificar-ambiente.mjs` termina sem FALHA.
- A pasta é confiável (o Claude Code não mostra o aviso de "workspace not trusted").
- Marque: `node scripts/obra.mjs passou 1 --nota "..." --commit`.

## Erros comuns
- Abrir o Claude numa pasta errada (a pasta pessoal inteira): ele pode ler arquivos que você não queria. **Sempre** abra dentro da pasta do escritório.
- Colar chave de API no chat. Não faça isso: chaves vão em variável de ambiente.
- Ficar sem espaço em disco: o `verificar-ambiente` avisa.
