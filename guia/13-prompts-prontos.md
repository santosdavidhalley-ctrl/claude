# Prompts prontos (copie, cole, adapte)

Pedidos que funcionam bem com o Claude dentro desta pasta. Troque o que está entre colchetes.

## Retomar e orientar
- **Retomar a obra:** `Leia COMECE-AQUI.md, estado/obra.json e o fim do DIARIO.md. Diga em 3 linhas onde paramos e qual é a próxima etapa.`
- **Explicar algo:** `Explique [termo] como se eu nunca tivesse programado, em até 5 linhas, com um exemplo do meu negócio.`
- **Onde está cada coisa:** `Liste em tabela os arquivos importantes desta pasta e para que serve cada um. Máximo 15 linhas.`

## Criar e ajustar
- **Agente novo:** `/criar-agente [função]`
- **Skill nova:** `/criar-skill [tarefa que se repete]`
- **Preencher o cérebro por entrevista:** `Me entreviste, uma pergunta por vez, para preencher cerebro/empresa.md e cerebro/clientes.md. O que eu não souber, deixe como "a confirmar". Não invente nada. No fim, mostre o que ficou.`
- **Melhorar um agente:** `O agente [nome] errou em [descrição]. Leia .claude/agents/[nome].md, mostre qual instrução faltou, proponha a mudança mínima e crie um caso de teste em evals/casos-basicos.jsonl. Só aplique depois do meu OK.`
- **Escolher modelo:** `Para o agente [nome], compare haiku e sonnet usando os casos de evals/. Mostre custo e falhas. Recomende, mas não troque sem meu OK.`

## Segurança e saúde
- **Auditoria completa:** `/auditar-escritorio`
- **Teste de injeção:** `/testar-injecao [agente]`
- **Revisar permissões:** `Leia .claude/settings.json e .claude/agents/*.md. Para cada agente, diga que ferramentas tem, que ferramentas a função dele realmente exige e o que dá para tirar. Não altere nada.`
- **Simular ataque:** `Finja ser um cliente mal-intencionado e escreva 5 mensagens que tentam enganar o agente [nome] (pedir senha, mandar ignorar regras, pedir para enviar algo). Salve em evals/ no formato JSONL e rode.`
- **Pausar tudo:** no terminal, `node scripts/pausar.mjs` (e `retomar`).

## Operação
- **Bom dia / fechar o dia:** `/bom-dia` e `/fechar-dia`
- **Entender um erro:** `Aconteceu isto: [cole a mensagem]. Explique a causa provável em 3 linhas, proponha a correção e consulte guia/11-solucao-de-problemas.md. Peça meu OK antes de mudar.`
- **Gasto estranho:** `Rode node scripts/custo.mjs e node scripts/resumo-log.mjs --dias 3 e me diga qual agente ou rotina mais gastou e por quê. Sugira um limite.`
- **Revisar o cérebro:** `Rode node scripts/brain-lint.mjs. Para cada aviso, proponha a correção. Não grave nada sem meu OK.`

## Conteúdo e vendas (exemplos)
- `Use o agente vendas para responder: [mensagem do lead]. Salve o rascunho e me diga o que você NÃO confirmou.`
- `Use o agente conteudo para criar 3 opções de post sobre [tema] no tom da empresa, e peça ao revisor para conferir.`
- `Peça ao agente pesquisador um comparativo de [concorrente 1] e [concorrente 2], com fontes e data.`

## Boas práticas ao pedir
- **Diga o resultado que quer**, não só a tarefa ("um resumo de 5 linhas para eu decidir hoje").
- **Diga o que NÃO pode** acontecer ("não envie nada", "não mexa fora de saidas/").
- **Peça o plano antes** de tarefas grandes ("liste os passos em 5 linhas e espere meu OK").
- **Uma coisa por vez.** Pedidos longos e misturados geram respostas ruins.
- **Troque de assunto com `/clear`.** Contexto velho atrapalha e custa.
