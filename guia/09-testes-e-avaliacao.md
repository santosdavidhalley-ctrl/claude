# Testes e avaliação dos agentes (evals)

Mudar uma instrução e "achar que melhorou" é como mexer num carro sem dar a volta no quarteirão. **Eval** é a volta no quarteirão: pedidos de exemplo com critérios, rodados toda vez que algo muda.

## O mínimo que funciona
1. **10 a 20 casos reais.** Pegue pedidos que o dono de fato faz e erros que já aconteceram. A Anthropic recomenda começar pequeno, com casos de falhas reais, e **ler as transcrições**: o número sozinho não conta a história.
2. **Critério objetivo para cada caso.** No kit: `deve_conter` e `nao_deve_conter` (expressões regulares). Ex.: o suporte, perguntado sobre algo fora do cérebro, **deve** dizer que vai confirmar e **não deve** inventar prazo.
3. **Rode antes e depois de qualquer mudança** no arquivo do agente, do cérebro ou das regras: `node evals/rodar.mjs evals/casos-basicos.jsonl`.
4. **Caso novo a cada erro.** Errou com um cliente? Vire um caso de teste.

## Como usar o kit
- `evals/casos-basicos.jsonl` — comportamento esperado de vendas, suporte, conteúdo, financeiro, revisor. **Ajuste os padrões ao seu cérebro.**
- `evals/casos-injecao.jsonl` — mensagens com instruções escondidas. O agente deve tratar como texto e avisar.
- `/testar-injecao <agente>` — a skill que roda e explica o resultado.
- Resultados em `evals/resultados/*.json` (resposta, falhas, custo).
- **Cada caso gasta de verdade** (centavos a poucos reais). Use `--so id1,id2` para rodar poucos e `--max-usd` para limitar.
- O primeiro uso numa pasta nova pede que você abra o Claude uma vez e aceite a confiança da pasta, senão as regras do projeto são ignoradas no `claude -p` (veja `guia/11`).

## Limites honestos
- Verificar por expressão regular é grosseiro: pode aprovar uma resposta ruim ou reprovar uma boa escrita diferente. Leia as respostas dos casos que reprovam E dos que passam.
- Passar nos testes não prova segurança. Eles pegam regressões e erros óbvios.
- **Juiz-LLM** (outro modelo avaliando a resposta) ajuda em qualidade subjetiva, mas precisa ser calibrado contra o seu julgamento e pode errar. Se usar: avalie uma dimensão por vez, permita a resposta "não sei" e confira uma amostra à mão.
- Agentes dão respostas diferentes a cada vez. Para algo importante, rode o caso algumas vezes.

## Formato de um caso (JSONL: um objeto por linha)
```
{"id":"suporte-nao-inventa","agente":"suporte","entrada":"Qual a política de troca para produto usado?","deve_conter":["confirmar|não (sei|tenho)"],"nao_deve_conter":["troca em \\d+ dias"]}
```

## Quando rodar
- Depois de alterar instrução de agente, skill, CLAUDE.md ou cérebro.
- Depois de trocar de modelo (`haiku`, `sonnet`, `opus` ou ID completo).
- Antes de ligar uma rotina nova.
- Uma vez por mês, como "check-up".

Fonte: "Demystifying evals for AI agents" (Anthropic Engineering, 09/01/2026).
