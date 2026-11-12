# Como usar o seu escritório de IA

Montado em 12/11/2026. O histórico completo está em `DIARIO.md`; as regras da casa, em `CLAUDE.md`.

## No app do Claude (nuvem)
1. Abra uma conversa nova neste repositório.
2. Peça em uma frase. Exemplos:
   - `Use o agente vendas para responder: "Oi, quanto custa um site?"`
   - `Use o agente conteudo para criar 3 opções de post sobre [tema].`
   - `Use o agente automacoes: quero parar de fazer [tarefa] à mão.`
   - `Use o agente rotinas para me dar o resumo da semana.`
3. O rascunho aparece na conversa. **Nada é enviado, publicado ou agendado**: quem faz isso é você.
4. Para ver o escritório em 3D, peça: `Ligue o painel do escritório e me mostre em 3D.`

Na nuvem, os rascunhos (`saidas/`) e o registro de trabalho somem quando a conversa termina. Copie o que quiser guardar.

## No computador
1. Instale o Claude Code, o Git e o Node (passo a passo em `passos/01-preparar-o-computador.md`).
2. Baixe este repositório e abra um terminal dentro da pasta.
3. Rode uma vez: `node scripts/perfil.mjs computador` (liga as travas extras) e `node scripts/verificar-ambiente.mjs`.
4. Digite `claude`, aceite a pergunta de confiança da pasta e peça as tarefas. Para falar direto com o orquestrador: `claude --agent orquestrador`.
5. Painel: `node visual/app/server.mjs` e abra http://localhost:4700 (2D) ou http://localhost:4700/3d/ (3D).
6. Parar tudo: `node scripts/pausar.mjs`. Voltar: `node scripts/pausar.mjs retomar`.

## O que falta você fazer
- **Preencher o cérebro** (etapa 4). Numa conversa, diga: `Me entreviste, uma pergunta por vez, para preencher cerebro/empresa.md e cerebro/clientes.md.` Sem isso os agentes respondem "preciso confirmar com o dono" para preço, prazo e tom de voz.
- **Conferir a obra:** `node scripts/obra.mjs` mostra as etapas. Elas foram testadas pelo Claude; a conferência final é sua.
- **Rotinas agendadas e ferramentas externas** (agenda, e-mail, WhatsApp): nada foi ligado. Leia `guia/05-integracoes.md` e `guia/06-rotinas-e-agendamento.md` antes.
- **O repositório está público** (decisão sua em 12/11/2026): qualquer pessoa vê o que está aqui. Antes de pôr no cérebro preço, dado de cliente ou outra informação reservada, torne-o privado (GitHub > Settings > General > Danger Zone > Change visibility).

## Onde está cada coisa
| Pasta | O que é |
|---|---|
| `.claude/agents/` | Os 7 agentes da equipe |
| `.claude/skills/` | 17 jeitos de fazer prontos (responder cliente, proposta, follow-up, bom dia...) |
| `cerebro/` | O que o negócio sabe. Os agentes só afirmam o que está aqui |
| `estado/` | Equipe do painel, andamento da obra e registro de trabalho |
| `visual/` | O painel 2D e 3D |
| `passos/`, `guia/`, `nichos/` | O material do kit, para consulta |
