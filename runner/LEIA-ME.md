# Runners: rodar o escritório fora do terminal do Claude

## `escritorio-api.mjs` — qualquer IA, sem instalar nada
Roda UM agente com Ollama, Groq, OpenRouter, Gemini, OpenAI, DeepSeek ou qualquer API no formato OpenAI. Não usa ferramentas: lê o agente e o cérebro que ele cita e grava um rascunho em `saidas/<agente>/`, com custo em `estado/log.jsonl`. Respeita a pausa.
```
node runner/escritorio-api.mjs --provedores
node runner/escritorio-api.mjs suporte "Qual o prazo de entrega?" --provedor groq --seco   (mostra o que iria, sem gastar)
node runner/escritorio-api.mjs suporte "Qual o prazo de entrega?" --provedor groq
```
- Chave em variável de ambiente (`GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`). Ollama não usa chave.
- Custo: defina `IA_PRECO_ENTRADA` e `IA_PRECO_SAIDA` (US$ por milhão de tokens) para o valor aparecer certo em `scripts/custo.mjs`.
- Serve para agentes de texto (vendas, suporte, conteudo, revisor, prospeccao). Planilha: passe o arquivo com `--entrada`. Pesquisa na web: não.
- Limites e qual IA escolher: `guia/15-outras-ias.md`.

## `escritorio-sdk.mjs` — Agent SDK da Anthropic (avançado)

Use quando o escritório precisar rodar como **programa seu** (num servidor, ligado a um site, a um webhook ou a uma fila), em vez de pelo terminal.

## Quando NÃO precisa
- Para uso pessoal, rotinas diárias e o painel, `claude -p` + `scripts/rodar-rotina.mjs` resolvem e são mais simples.

## O que o SDK dá a mais
- Controle em código: permissões (`allowedTools`, `permissionMode`, callback `canUseTool`), subagentes definidos por programa, teto de gasto por consulta (`maxBudgetUsd`), retomada de sessão, saída estruturada e leitura do custo (`total_cost_usd`, que é estimativa do cliente, não a cobrança).
- Pacotes: `@anthropic-ai/claude-agent-sdk` (TypeScript) e `claude-agent-sdk` (Python). Documentação: https://code.claude.com/docs/en/agent-sdk/overview

## Regras que a documentação oficial faz questão de dizer
- Use **chave de API** com o SDK. A Anthropic não permite que produtos de terceiros ofereçam login claude.ai ou os limites da assinatura. Se você vai vender isso a clientes, cada cliente precisa usar a própria chave de API.
- O SDK não lê `.env` sozinho: carregue você mesmo, e nunca coloque a chave no código.
- Em TypeScript, a opção `env` SUBSTITUI o ambiente inteiro do processo filho: espalhe `process.env` ao usá-la.

## Arquivo de exemplo
`escritorio-sdk.mjs` — pedido → orquestração → resultado, com pausa, log em `estado/log.jsonl`, modo `dontAsk` e teto de gasto. **Não foi executado pelo autor do kit.** Teste numa pasta de teste, com `maxBudgetUsd` baixo, antes de apontar para dados reais.

## Antes de ir para um servidor
1. Rode o perfil de operação (`modelos/settings.operacao.json`).
2. Isole: usuário sem privilégios, pasta própria, sem acesso ao resto do computador, de preferência contêiner.
3. Coloque login e confirmação humana antes de qualquer ação com efeito externo.
4. Defina teto mensal e alertas na conta da API.
