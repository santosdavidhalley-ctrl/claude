# Nicho: Academia e estúdio (fitness, pilates, yoga, dança)

**Começar rápido:** `node scripts/iniciar.mjs --agentes agenda,suporte,vendas` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** academias pequenas e estúdios com aulas, planos mensais e turmas com vagas limitadas. Os agentes cuidam do **administrativo e do relacionamento**; orientação de treino é do profissional habilitado.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido e distribui.
  - Lê: `cerebro/estudio.md`.
  - Produz: resumo do dia com pendências.
  - Nunca sozinho: enviar cobrança ou cancelar plano.

- **`agenda`** (modelo existente) — organiza aulas, vagas, confirmações e lista de espera.
  - Lê: grade de aulas exportada, `cerebro/regras-de-aula.md`.
  - Produz: lembretes de aula e sugestão de preenchimento de vagas.
  - Nunca sozinho: remover aluno da turma ou mudar horário de aula.

- **`suporte`** (modelo existente) — responde dúvidas de plano, horário, trancamento e aula experimental.
  - Lê: `cerebro/planos-e-precos.md`, `cerebro/faq-estudio.md`, `cerebro/avisos-de-saude.md`.
  - Produz: rascunho de resposta.
  - Nunca sozinho: orientar treino, dieta ou lesão; conceder isenção ou desconto.

- **`vendas`** (modelo existente) — recebe interessados e agenda aula experimental.
  - Lê: `cerebro/planos-e-precos.md`, `cerebro/objecoes.md`, `cerebro/avisos-de-saude.md`.
  - Produz: rascunho de resposta e de follow-up.
  - Nunca sozinho: prometer emagrecimento, ganho de massa ou saúde; inventar promoção.

- **`reativacao`** (específico do nicho) — identifica alunos que sumiram e prepara o convite de volta; você revisa e envia.

### Bloco pronto do agente específico

Salve como `.claude/agents/reativacao.md`, cole as 3 linhas logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add reativacao` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: reativacao
description: "Identifica alunos que sumiram e rascunha o convite para voltar. Use quando o dono pedir 'quem parou de vir' ou 'convite de volta', em geral uma vez por semana."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** a lista de frequência exportada e `cerebro/regras-de-desconto.md`. Pule quem pediu para não ser contatado.
- **Faça:** separe os alunos por perfil (sumiu há pouco, sumiu há muito, trancou) e rascunhe uma mensagem curta por perfil em `saidas/reativacao/AAAA-MM-DD-lote.md`.
- **Nunca:** enviar, oferecer condição fora das regras escritas, prometer emagrecimento ou resultado, ou citar lesão ou dado de saúde na mensagem.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/estudio.md` — identidade e limites. Quais modalidades e quem dá cada aula? · Tom: formal ou descontraído? · O que o agente nunca fala (treino, dieta, lesão, resultado)? · Quem responde o que o agente não pode?
- `cerebro/planos-e-precos.md` — só o confirmado. Quais planos e preços valem hoje? · Qual a regra de trancamento? · Como e quando se cancela? Há multa ou fidelidade? · Quando foi a última conferência (data)?
- `cerebro/regras-de-aula.md` — Qual o limite de vagas por turma? · Qual a tolerância de atraso? · O que acontece com falta sem aviso? · Como funciona a lista de espera?
- `cerebro/faq-estudio.md` — Horários e o que levar à aula? · Estacionamento e vestiário? · Como funciona a aula experimental? · Quais as 10 perguntas mais frequentes?
- `cerebro/objecoes.md` — O que você responde a "estou sem tempo"? · E a "não sei se aguento"? · E a "está caro"? · Qual a resposta honesta, sem prometer resultado?
- `cerebro/regras-de-desconto.md` — Que condições podem ser oferecidas? · Até quanto de desconto? · Até quando vale? · Quem aprova exceção?
- `cerebro/avisos-de-saude.md` — texto fixo. Qual o texto que orienta procurar avaliação profissional antes de começar? · Quem do estúdio revisou esse texto? · Que casos pedem liberação médica (gestante, lesão, idade)? · Em que momento o aviso é enviado?

## Rotina, indicadores e integrações

- **Rotina:** diária, `agenda` lista as aulas de amanhã e as vagas abertas (a recepção aprova os lembretes) · semanal, `reativacao` lista alunos sem treinar há tempo e prepara mensagens, `vendas` resume as aulas experimentais · mensal, `orquestrador` resume ocupação, cancelamentos e perguntas mais comuns.
- **Indicadores:** ocupação das aulas (vagas preenchidas sobre vagas totais) · faltas em aula marcada · alunos ativos e novos no mês · cancelamento de planos e o motivo declarado · aula experimental para matrícula · alunos reativados após convite.
- **Integrações** (só leitura primeiro): Google Agenda e Sheets (MCP comunitário, taylorwilsdon); WhatsApp Cloud API oficial via script, com aprovação humana (sem MCP oficial confirmado); API do sistema da academia via script, se existir. Cobrança brasileira (Pix, boleto): API do próprio provedor via script, nunca automática sem a sua aprovação.

## Cuidados

- **Saúde:** o agente nunca prescreve treino, dieta ou suplemento, nem orienta lesão. Isso é do profissional habilitado (sugestão; confirme com o conselho da categoria). Dúvida de saúde vai para uma pessoa; nada de "diagnóstico" automático.
- **Dados de saúde** (restrição, lesão, avaliação) são sensíveis na LGPD (art. 11). Guarde o mínimo (ver `../guia/08-legal-e-etica-br.md`).
- **Promessa de resultado:** não prometa emagrecimento ou ganho. Antes e depois exige autorização e cuidado (CONAR, ver `../guia/08-referencias.md`).
- **Imagem de aluno:** uso em post só com permissão por escrito.
- **Cobrança e cancelamento:** o agente prepara, você aprova. Atenção ao CDC.

## Primeira semana

- [ ] Preencher `planos-e-precos.md` e `regras-de-aula.md` com o que você pratica de fato.
- [ ] Medir a ocupação atual das suas aulas (sem agente) e anotar.
- [ ] Criar `orquestrador` e `agenda`.
- [ ] Redigir `avisos-de-saude.md` com um profissional da casa.
- [ ] Testar `suporte` com 10 perguntas reais de alunos.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/academia-estudio.jsonl` (3 casos com `suporte` e `vendas`; cada caso chama a IA e gasta centavos; leia as respostas).
