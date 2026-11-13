# Briefing — o escritório visual

> **Novidade na versão 2:** o painel 2D da versão 1 JÁ EXISTE e funciona em `visual/app/` (`node visual/app/server.mjs`, depois http://localhost:4700). Este briefing serve para EVOLUÍ-LO: a sua marca, um mundo mais rico, 3D.

> Para o Claude: este é o pedido de construção da interface. Leia inteiro, proponha o plano em 5 linhas e espere o OK da pessoa antes de escrever código.

## A ideia em uma frase

Uma página que **mostra** o que os agentes estão fazendo, como um escritório: cada agente é um personagem na própria mesa; quando trabalha, aparece ocupado com um balão do que está fazendo; quando termina, aparece o resultado.

## Regra de ouro: a tela só OBSERVA

- O visual **lê** o estado. Ele não executa tarefas e não tem chaves.
- Quem trabalha são os agentes (Claude). Quem desenha é a página. Separar isso evita que um bug de desenho vire um problema de segurança.
- Se a pessoa quiser mandar tarefa pela tela, isso vira uma etapa futura, com login e confirmação (ver `passos/09`).

## Contrato de estado (o único ponto de encontro)

Os agentes registram o que fazem em `estado/log.jsonl`, uma linha JSON por evento:

```json
{"t":"2026-10-27T14:03:11-03:00","agente":"vendas","evento":"inicio","tarefa":"Responder lead da loja X","custo_usd":0}
{"t":"2026-10-27T14:03:48-03:00","agente":"vendas","evento":"fim","tarefa":"Responder lead da loja X","resultado":"Rascunho salvo em saidas/lead-x.md","custo_usd":0.012}
```

E o arquivo `estado/equipe.json` descreve quem existe:

```json
{"agentes":[
  {"id":"orquestrador","nome":"Orquestrador","funcao":"Distribui o trabalho","cor":"#3d66e6"},
  {"id":"vendas","nome":"Vendas","funcao":"Responde leads","cor":"#12805c"}
]}
```

O visual só precisa desses dois arquivos. Qualquer agente novo aparece sozinho quando entra no `equipe.json`.

## O que construir (versão 1, 2D)

1. Um servidor local pequeno (Node) que:
   - serve a página;
   - lê `estado/equipe.json` e `estado/log.jsonl`;
   - avisa a página em tempo real quando o log muda (SSE ou WebSocket). Só escuta em `localhost`.
2. Uma página com:
   - uma planta de escritório vista de cima, uma mesa por agente;
   - estado de cada agente: **livre**, **trabalhando** (último evento é `inicio` sem `fim`), **concluído** (mostra o resultado por alguns segundos);
   - balão com a tarefa atual;
   - painel lateral com as últimas 20 linhas do log e o custo do dia por agente;
   - botão "Pausar tudo" apenas **exibe** o aviso de como parar (não executa nada).
3. Funcionar bem no celular (390 px de largura): sem rolagem lateral, textos legíveis, toque com 44 px no mínimo.

## Requisitos de qualidade

- Nada de emoji na interface; ícones desenhados em SVG.
- Cores com contraste legível (texto sobre fundo com razão mínima 4,5:1).
- Respeitar "reduzir movimento" do sistema.
- Se o log estiver vazio, mostrar o escritório vazio com a mensagem "Nenhum agente trabalhou ainda. Peça uma tarefa ao orquestrador."
- Testar de verdade: gerar eventos falsos no log e conferir na tela, em desktop e em 390 px, antes de dizer que está pronto.

## Versão 2 (só depois que a 1 estiver estável): 3D

- Trocar a planta 2D por uma cena 3D (Three.js com React Three Fiber, ou Babylon.js), mantendo o mesmo contrato de estado.
- Começar com personagens simples (formas geométricas) e só depois modelos 3D.
- Manter um plano B 2D para aparelho fraco ou navegador sem WebGL.

## Como pedir o resultado ao Claude

> "Leia visual/BRIEFING-VISUAL.md. Proponha o plano em 5 linhas. Depois de eu aprovar, construa a versão 1 em `visual/app/`, gere eventos de teste, e me mostre rodando em localhost com captura de tela no desktop e no celular."
