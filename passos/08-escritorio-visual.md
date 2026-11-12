# Etapa 8 — O escritório visual

**Objetivo:** ver os agentes trabalhando, como num escritório.
**O painel do kit já funciona.** Você só precisa ligar.

## Ligar o painel do kit (2D)
1. Num terminal, na pasta do escritório: `node visual/app/server.mjs`
2. Abra http://localhost:4700 (só o seu computador enxerga).
3. Em outro terminal: `node scripts/gerar-eventos-teste.mjs` — eventos de teste (marcados como teste: aparecem no painel, mas não entram no gasto nem nas tarefas do dia); veja os personagens mudando de estado (livre, trabalhando, concluído, erro).
4. Pare o gerador (Ctrl+C). Não precisa limpar o log: os eventos de teste são marcados e ficam fora do gasto e das tarefas.
5. Agora com agentes de verdade: os hooks `log-eventos` escrevem em `estado/log.jsonl` quando você fala com o orquestrador e quando um agente termina. O painel atualiza sozinho.

O painel só **observa**: lê `estado/equipe.json` e `estado/log.jsonl`. Não executa nada e só escuta em `localhost`.

## O painel 3D (pacote `escritorio-3d`)
O mesmo servidor mostra o escritório em 3D em http://localhost:4700/3d/ (há um link "Ver em 3D" no painel 2D).
- Lê o MESMO estado do 2D (`estado/equipe.json` e `estado/log.jsonl`) e também só observa.
- Cada agente ganha uma mesa e um funcionário animado: digita quando está trabalhando; o balão mostra a tarefa. O orquestrador fica na sala da diretoria.
- A planta é escolhida pelo tamanho da equipe; dá para trocar no seletor da tela. Opcional em `estado/equipe.json`: `"escritorio3d": "comercial"` (planta) e, em cada agente, `"boneco": "funcionario-03"` (modelo).
- Os modelos ficam em `visual/app/public/escritorio-3d/` (leia o `COMECE-AQUI.md` de lá). O visualizador original do pacote abre em http://localhost:4700/escritorio-3d/visualizador/.
- Sem 3D no navegador (WebGL), a página avisa e a lista continua funcionando; o 2D é o plano B.

## Limites honestos
- O custo dos hooks é zero (o Claude Code não passa custo aos hooks). Só rotinas (`scripts/rodar-rotina.mjs`) registram custo. Para o resto: `/usage`.
- É 2D simples de propósito. O 3D usa o mesmo contrato de estado (`visual/BRIEFING-VISUAL.md`).

## Outros caminhos
1. **Pixel Agents** (projeto aberto, MIT): transforma os agentes do Claude Code em personagens de pixel art. `npx pixel-agents` ou extensão do VS Code. https://github.com/pixel-agents-hq/pixel-agents. Leia o README antes de rodar.
2. **O seu, com a sua marca:** peça ao Claude para evoluir `visual/app/` seguindo `visual/BRIEFING-VISUAL.md` (cores, mundo 2D mais rico, 3D).
3. **Inspiração:** AI Town (https://github.com/a16z-infra/ai-town, MIT) e AgentGUI (https://github.com/eth-medical-ai-lab/agent-gui, artigo acadêmico).

## Como conferir (critério da etapa)
O painel abre em http://localhost:4700 e mostra os agentes mudando de estado com os eventos de teste.
- Marque: `node scripts/obra.mjs passou 8 --nota "..." --commit`.

## Erros comuns
- Deixar a tela mandar comandos aos agentes no começo. Primeiro só observa.
- Abrir o painel na rede (`0.0.0.0`) sem login. Não faça.
- Imagens e personagens sem licença: use só o que você criou ou tem direito de usar.
