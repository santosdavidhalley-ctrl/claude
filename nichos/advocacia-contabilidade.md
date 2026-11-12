# Nicho: Advocacia e contabilidade

**Começar rápido:** `node scripts/iniciar.mjs --agentes suporte,pesquisador,revisor` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** escritórios pequenos de advocacia ou contabilidade e profissionais autônomos dessas áreas. Profissão regulada: o agente **organiza e rascunha**; quem responde pelo trabalho é o profissional.

## Equipe sugerida

- **`orquestrador`** (modelo existente) — recebe o pedido e distribui.
  - Lê: `cerebro/escritorio.md`, `cerebro/clientes.md`, `cerebro/regras-de-sigilo.md`.
  - Produz: resumo do dia com prazos e pendências.
  - Nunca sozinho: enviar qualquer coisa a cliente, tribunal ou órgão público.

- **`suporte`** (modelo existente) — responde dúvidas administrativas de clientes (horário, documento pedido, status geral).
  - Lê: `cerebro/faq-administrativo.md`.
  - Produz: rascunho de resposta.
  - Nunca sozinho: dar orientação jurídica ou contábil, ou "parecer" de qualquer tipo.

- **`pesquisador`** (modelo existente) — busca fontes PÚBLICAS (lei, jurisprudência, notícias) e organiza para o profissional estudar.
  - Lê: só a internet. Nunca recebe documento de cliente: quem lê a web não pode ter dado de cliente junto.
  - Produz: resumo com as fontes citadas e o que não foi encontrado.
  - Nunca sozinho: concluir o caso, ou citar lei e decisão sem o profissional conferir na fonte.

- **`revisor`** (modelo existente) — confere o rascunho antes de você: citação de lei ou decisão sem fonte conferida, promessa, dado de cliente exposto. Devolve APROVADO, APROVADO COM AJUSTES ou REPROVADO; a aprovação final é do profissional.

- **`rascunhador`** (específico do nicho) — monta a primeira versão de peça, carta ou planilha de apoio. Fica com o documento do cliente, por isso não tem acesso à web.

- **`prazos`** (específico do nicho) — lista prazos e vencimentos que você informou; só lembra os que você cadastrou.

### Blocos prontos dos agentes específicos

Salve cada bloco como `.claude/agents/<name>.md`, cole as 3 linhas dele logo abaixo, no mesmo arquivo, e rode `node scripts/agente.mjs add <name>` (ele registra o agente no orquestrador e no painel). Reabra o Claude para carregar.

```yaml
---
name: rascunhador
description: "Monta a primeira versão de peça, carta ou planilha de apoio a partir dos seus modelos e do material do caso. Use quando o profissional pedir 'rascunhe' ou 'minuta'; o resultado sempre passa por revisão humana."
tools: Read, Write, Grep, Glob
model: sonnet
maxTurns: 15
---
```
- **Leia:** `cerebro/modelos-de-peca.md` e, só se o profissional indicar, `cerebro/pesquisa/` e o material do caso.
- **Faça:** rascunho com "NÃO REVISADO" no topo e cada citação de lei ou decisão marcada "conferir na fonte", em `saidas/rascunhos/AAAA-MM-DD-assunto.md`.
- **Nunca:** protocolar, enviar ou assinar; inventar lei, súmula ou decisão; usar a web (este agente tem dado de cliente).

```yaml
---
name: prazos
description: "Lista vencimentos e prazos que o profissional cadastrou e prepara alertas por cliente. Use no começo do dia ('o que vence esta semana') ou ao cadastrar um prazo novo."
tools: Read, Write, Grep
model: haiku
maxTurns: 10
---
```
- **Leia:** `cerebro/calendario-de-prazos.md`.
- **Faça:** alertas ordenados por data (cliente, tipo, vencimento, responsável) em `saidas/prazos/AAAA-MM-DD-alertas.md`.
- **Nunca:** calcular prazo legal por conta própria (só lembra os cadastrados), dar prazo como cumprido ou enviar alerta a cliente.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/escritorio.md` — identidade e limites. Quais áreas o escritório atende (e quais recusa)? · Qual o tom de voz? · O que o agente jamais faz (parecer, protocolo, envio)? · Quem revisa e assina tudo que sai?
- `cerebro/faq-administrativo.md` — Horário e formas de contato? · Quais documentos se pedem em cada serviço? · Como se pagam os honorários? · Como o cliente acompanha o andamento?
- `cerebro/modelos-de-peca.md` — seus modelos, sem dados de clientes. Que peças ou documentos se repetem? · Quais modelos seus servem de base? · Que trechos nunca podem mudar? · Como tirar o dado do cliente do modelo?
- `cerebro/calendario-de-prazos.md` — Quais prazos você controla (cliente, tipo, data, responsável)? · Quem confere cada prazo? · Com quantos dias de antecedência o alerta sai? · Como registra o prazo cumprido?
- `cerebro/clientes.md` — lista mínima. Quais clientes ativos? · Qual o contato preferido de cada um? · Que dados ficam fora do arquivo (CPF, número de processo)?
- `cerebro/pesquisa/` — pasta com material que você mesmo selecionou. Quais fontes públicas você aceita (tribunais, órgãos oficiais)? · Que temas pesquisa toda semana? · Como marca o material já conferido por você?
- `cerebro/regras-de-sigilo.md` — O que nunca sai do computador? · Quais documentos jamais vão para a IA? · Quem pode abrir os arquivos? · Onde ficam os backups?

## Rotina, indicadores e integrações

- **Rotina:** diária, `prazos` lista os vencimentos dos próximos dias (você confere cada um) · semanal, `pesquisador` entrega o material pedido e `rascunhador` entrega rascunhos para revisão · mensal, `orquestrador` resume carga de trabalho e pendências por cliente.
- **Indicadores:** prazos cumpridos sobre prazos cadastrados · peças revisadas sobre rascunhadas (meta: todas) · tempo do rascunho ao final (antes e depois do agente) · dúvidas administrativas respondidas sem sua intervenção · clientes sem retorno há mais de X dias (defina X).
- **Integrações** (só leitura primeiro): Google Docs, Drive e Agenda (MCP comunitário, taylorwilsdon); Notion (MCP oficial), se você já usa; API do sistema de processos ou contábil via script (sem MCP confirmado). Envie só o trecho necessário, nunca a pasta do cliente.

## Cuidados

- **Advocacia:** o parecer ético da OAB-SP (TED, maio/2026; número e data a confirmar) exige análise humana antes de enviar peça; informar o cliente do uso de IA é boa prática (ver `../guia/08-referencias.md`). A OAB também defende a advocacia contra empresas de IA que pratiquem atos exclusivos da classe (OAB, notícia 64465). Confirme com sua seccional.
- **Contabilidade:** o CFC ainda não tinha resolução sobre IA na data da pesquisa (27/10/2026). Confirme com seu conselho regional.
- **Nenhum "parecer" automático.** Nada vai ao cliente sem revisão do profissional.
- **Fontes:** nunca copie lei, súmula ou decisão que o agente citou sem abrir a fonte. IA pode errar referência.
- **Sigilo profissional e LGPD:** dado de cliente é confidencial (ver `../guia/08-legal-e-etica-br.md`).
- **Decisão automatizada:** a pessoa afetada pode pedir revisão (LGPD art. 20); revisão por pessoa é a boa prática.
- **Servidor nos EUA:** exige cláusulas-padrão (Res. ANPD nº 19/2024) ou outro mecanismo do art. 33.

## Primeira semana

- [ ] Escrever em `escritorio.md` o que o agente jamais faz (parecer, protocolo, envio).
- [ ] Cadastrar 10 prazos reais em `calendario-de-prazos.md`.
- [ ] Criar `orquestrador` e `prazos`; começar só com o administrativo.
- [ ] Testar `rascunhador` com um caso antigo já encerrado e comparar com o que foi feito.
- [ ] Definir o processo de revisão: quem revisa, onde assina, onde registra.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/advocacia-contabilidade.jsonl` (3 casos com `suporte`, `revisor` e `orquestrador`; cada caso chama a IA e gasta centavos; leia as respostas).
