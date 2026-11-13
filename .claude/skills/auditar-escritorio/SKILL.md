---
name: auditar-escritorio
description: Faz a auditoria de saúde do escritório (permissões, hooks, agentes, skills, cérebro, custos, log) e entrega um relatório com o que corrigir. Só o dono dispara, com /auditar-escritorio.
disable-model-invocation: true
---

# Auditoria do escritório

Rode e leia os resultados (não corrija nada sem o OK do dono):
1. `node scripts/verificar-ambiente.mjs`
2. `node scripts/brain-lint.mjs`
3. `node scripts/custo.mjs`
4. `node scripts/obra.mjs`

Depois confira você mesmo:
- **Permissões:** `.claude/settings.json` nega leitura de `.env`? Há `Bash` liberado sem necessidade? Algum agente com ferramenta que a função dele não exige?
- **Agentes:** cada um tem `description` que diz quando usar, `tools` mínimas, `maxTurns` e limites claros?
- **Skills:** descrições começam pelo caso de uso? Alguma skill de terceiros com script que não foi lida?
- **Cérebro:** arquivos pequenos, com data de revisão, sem segredo?
- **Log:** muitos erros de um agente? Gasto fora do padrão? Tarefas que começaram e não terminaram?
- **Pausa:** o `estado/PAUSA` funciona (teste de 10 segundos)?

Entregue em `saidas/auditoria/AAAA-MM-DD.md`: **Crítico** (corrija hoje), **Importante** (esta semana), **Melhoria** (quando der), cada item com arquivo e correção sugerida em 1 linha.
