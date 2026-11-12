# Escritório de IA (kit) — instruções para qualquer IA

Esta pasta é um kit para montar, com a pessoa que abriu você aqui, um escritório de agentes de IA.

- **Comece por `COMECE-AQUI.md`** e siga as instruções. Você conduz a obra, uma etapa por vez, em português simples.
- Se `estado/obra.json` existir, a obra já começou: retome de onde parou (seção 0 do `COMECE-AQUI.md`).
- Depois que a obra começa, as **regras da casa** ficam em `CLAUDE.md`. Leia esse arquivo também, seja qual for a sua ferramenta.
- **Se você não é o Claude Code:** o kit foi escrito para ele. Depois do `node scripts/iniciar.mjs`, rode `node scripts/exportar.mjs <codex|antigravity|opencode|gemini|cursor>` para converter agentes e skills, e leia `guia/15-outras-ias.md`, seção 4 (travas e rotinas na sua ferramenta).
- Leia só o arquivo da etapa atual. Não leia a pasta `guia/` inteira.
- Prefira os scripts a escrever à mão: `scripts/iniciar.mjs`, `verificar-ambiente.mjs`, `testar-travas.mjs`, `obra.mjs`, `agente.mjs`, `exportar.mjs`, `agendar.mjs`, `resumo-log.mjs`, `brain-lint.mjs`.
- Nunca leia `.env`, chaves ou senhas. Nunca peça chave no chat.
