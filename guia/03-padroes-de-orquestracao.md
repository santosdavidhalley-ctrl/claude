# Padrões de orquestração

Fonte principal: "Building effective agents" e "How we built our multi-agent research system" (engenharia da Anthropic). A regra deles: **comece pelo mais simples que resolve**.

## Os padrões (do mais simples ao mais complexo)
1. **Um agente só com boas instruções.** Resolve mais do que parece. Se resolve, pare aqui.
2. **Encadeamento (pipeline):** A → B → C numa ordem fixa. Ex.: pesquisador → vendas → revisor. Fácil de entender e de testar.
3. **Roteamento:** o orquestrador lê o pedido e escolhe UM especialista. É o padrão do kit.
4. **Paralelização:** partes independentes ao mesmo tempo (até 3 de uma vez no kit). Ex.: pesquisar 3 concorrentes. Mais rápido, mais caro.
5. **Orquestrador + trabalhadores:** o orquestrador decide dinamicamente quantos subagentes chamar e junta os resultados. Para tarefas abertas (pesquisa ampla).
6. **Avaliador-otimizador:** um agente produz, outro critica, repete. No kit: agente + `revisor`. Limite 1 volta para não gastar à toa.
7. **Equipes que conversam (agent teams):** vários Claude Code com lista de tarefas compartilhada. **Experimental, vem desligado, só no modo interativo e gasta muito mais.** Não use para começar.

## Como delegar bem (a causa nº 1 de resultado ruim)
O subagente **não vê a conversa**. O pedido a ele precisa levar: objetivo, contexto com as palavras do dono, arquivos a ler, formato e local da entrega, limites. O orquestrador do kit já faz isso (`modelos/agentes/orquestrador.md`).

## Limites técnicos documentados
- Subagentes rodam em paralelo; limite padrão de 20 ao mesmo tempo (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).
- Subagentes podem criar subagentes até uma profundidade configurável (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`; `1` desliga o aninhamento). Mantenha a hierarquia em UMA direção.
- Para limitar quais agentes um orquestrador chama: `tools: Agent(vendas, suporte), Read...` (vale para o agente rodado com `claude --agent`).
- Cada subagente devolve só o resultado final; o detalhe fica no contexto dele. Bom para tarefas que geram muita saída.

## Falhas típicas de multiagente e a defesa
| Falha | Como aparece | Defesa no kit |
|---|---|---|
| **Loop** | Dois agentes se chamando ou refazendo para sempre | Hierarquia numa direção; `maxTurns`; `--max-budget-usd`; `pausar.mjs` |
| **Erro em cadeia** | Um agente inventa um fato; o próximo o trata como verdade | Número sem fonte não passa; `revisor`; cérebro só com fatos confirmados |
| **Trabalho duplicado** | Dois agentes fazem a mesma coisa | Descrições claras, uma função por agente; orquestrador escolhe |
| **Telefone sem fio** | O detalhe se perde na delegação | Modelo de delegação com os 5 itens |
| **Contexto estourado** | Respostas pioram com o tempo | Cérebro em arquivos pequenos; `/clear`; subagente para saída grande |
| **Escopo infinito** | Agente "melhora" coisas que ninguém pediu | `Limites` no arquivo do agente; tarefa com entrega definida |

## Quando NÃO usar vários agentes
- A tarefa cabe numa conversa e numa função.
- Você ainda não testou um agente sozinho.
- O custo extra não traz ganho medido nos `evals/`.
