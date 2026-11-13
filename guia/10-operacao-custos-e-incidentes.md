# Operação: rotina do dono, custos e incidentes

## Rotina do dono
**Todo dia (5 minutos):** `/bom-dia` (ou a rotina agendada) → ler as pendências → aprovar ou recusar propostas de anotação do cérebro → olhar o painel.
**Toda semana (15 minutos):** `node scripts/custo.mjs` e `node scripts/resumo-log.mjs --dias 7`; ler os erros; abrir 3 saídas de agentes e conferir contra o que você sabe; rodar `evals/` se mudou algo.
**Todo mês (30 minutos):** `node scripts/brain-lint.mjs` e revisar o cérebro (apagar o velho, corrigir o que mudou); `/auditar-escritorio`; revisar permissões e chaves; atualizar o Claude Code; conferir preços e termos das ferramentas.

## Controle de mudanças (para não quebrar o que funciona)
1. Mudou um agente, skill, regra ou cérebro? **Crie um ramo no Git** ou faça um commit antes.
2. Rode `evals/`.
3. Rode 2 ou 3 pedidos reais.
4. Se piorou, `git restore` e tente de novo. Se melhorou, commit com mensagem clara e anote em `DIARIO.md`.

## Custos: sinais de alerta
- Gasto do dia acima do normal sem tarefa nova → procure loop (`maxTurns`, agente chamando agente).
- Um agente em Opus fazendo tarefa simples → troque o modelo.
- Cérebro crescendo → divida arquivos.
- Muitas tentativas por pedido → instrução do agente está vaga.

## Incidentes comuns e o que fazer
| Situação | Ação |
|---|---|
| Agente errou numa mensagem para cliente | Corrija com o cliente, crie um caso em `evals/`, reforce o `Limites` do agente, passe o texto pelo `revisor` daqui em diante |
| Gasto disparou | `pausar.mjs`; veja `custo.mjs` e `resumo-log.mjs --horas 24`; ache o loop; reduza `maxTurns`; confira o teto da conta |
| Chave vazou | Revogue primeiro; troque; procure uso indevido; veja `guia/07` |
| Agente seguiu instrução de um e-mail | Pare; isole o agente (tire ferramentas de ação); adicione o caso a `casos-injecao.jsonl` |
| Rotina não rodou | Computador dormindo? Caminho completo de `node`/`claude`? Pasta confiável? Veja `estado/agendador.log` |
| MCP suspeito | Remova com `claude mcp remove <nome>`; revogue o acesso OAuth no serviço |
| Dado pessoal exposto | Contenha, avalie a comunicação (LGPD), registre. Veja `guia/08` |

## Backup e versionamento
- A pasta do escritório vive no **Git**. `.gitignore` já exclui segredos e arquivos de estado.
- Repositório remoto: **privado**. Nunca público com cérebro de cliente.
- Faça cópia do `cerebro/` e do `estado/obra.json` fora do computador.
- `git log` é o seu histórico de decisões: mensagens de commit claras.

## Atualizações
- Atualize o Claude Code com o método da instalação (o instalador automático atualiza; Homebrew e WinGet não: rode o comando de upgrade).
- A cada atualização grande: rode `scripts/verificar-ambiente.mjs`, `/hooks`, `/permissions` e os `evals/`.
- Alias de modelo (`haiku`, `sonnet`, `opus`) aponta para a versão que o seu Claude Code escolher; para fixar uma versão, use o ID completo do modelo no arquivo do agente.

## Quando chamar um profissional
- Dados de saúde, jurídico ou financeiro de clientes.
- Vai atender muitas pessoas, ou vender o escritório para clientes.
- Qualquer incidente com dado pessoal.
