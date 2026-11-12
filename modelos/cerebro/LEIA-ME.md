# Cérebro — como organizar o conhecimento dos agentes

O "cérebro" é só uma pasta de arquivos de texto (Markdown). Simples de propósito: você abre, lê, corrige e versiona no Git. O agente lê o que precisa, na hora que precisa.

## Estrutura recomendada

```
cerebro/
  empresa.md            quem somos, o que vendemos, tom de voz, o que NUNCA dizer
  clientes.md           perfil do cliente ideal, objeções comuns, perguntas frequentes
  processos/            como fazemos cada tarefa, passo a passo
    atendimento.md
    vendas.md
  agentes/              um arquivo por agente: o que ele sabe e o que aprendeu
    orquestrador.md
    vendas.md
    suporte.md
  memoria/              fatos confirmados, com data
    decisoes.md         "decidimos X em DD/MM porque Y"
    aprendizados.md     "quando acontecer A, fazer B"
```

## As 4 regras de um bom cérebro

1. **Arquivos pequenos e com nome claro.** O agente abre só o que precisa. Um arquivo gigante gasta atenção e dinheiro a cada conversa.
2. **Fato com data e fonte.** "Preço do plano X é R$ Y (confirmado pelo dono em DD/MM)". Sem data, ninguém sabe se ainda vale.
3. **Só o dono grava fatos novos.** O agente pode PROPOR uma anotação em `memoria/propostas.md`; o dono aprova e move. Assim o cérebro não se enche de erros que o agente inventou e repetiu.
4. **Revisão mensal.** Uma vez por mês, abra a pasta, apague o que ficou velho e corrija o que mudou. Cérebro velho vira agente confiante e errado.

## O que vai (e o que não vai) no cérebro

- Vai: tom de voz, regras do negócio, perguntas frequentes, exemplos de bons textos, tabelas de preço, políticas.
- Não vai: senhas, chaves, dados pessoais de clientes (CPF, cartão), conversas privadas.

## Como o agente usa

No arquivo do agente (`.claude/agents/<nome>.md`) há uma linha dizendo quais arquivos do cérebro ele deve ler antes de agir. Exemplo: o agente de suporte lê `empresa.md`, `clientes.md` e `processos/atendimento.md`.
