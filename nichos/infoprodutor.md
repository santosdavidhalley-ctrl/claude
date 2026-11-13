# Nicho: Infoprodutor, coach e mentor

**Começar rápido:** `node scripts/iniciar.mjs --agentes suporte,conteudo,vendas` (os agentes "específicos do nicho" abaixo você cria depois com `criar-agente`).

**Para quem é:** quem vende curso, mentoria, comunidade ou sessões individuais pela internet. Dor típica: suporte de aluno em massa, conteúdo constante e retenção.

## Equipe sugerida

Todos os agentes deste nicho já existem em `modelos/agentes/`: não há bloco para criar. Adapte cada cópia ao seu produto.

- **`orquestrador`** (modelo existente) — recebe o pedido e distribui.
  - Lê: `cerebro/produto.md`.
  - Produz: resumo do dia com pendências.
  - Nunca sozinho: reembolsar, mudar preço ou publicar.

- **`suporte`** (modelo existente) — responde dúvidas de alunos sobre acesso, material e prazos.
  - Lê: `cerebro/faq-alunos.md`, `cerebro/politica-reembolso.md`.
  - Produz: rascunho de resposta e lista de casos que exigem você.
  - Nunca sozinho: autorizar reembolso, mudar prazo de garantia, prometer resultado ou responder pergunta de saúde, remédio ou investimento do aluno (encaminhe a você).

- **`conteudo`** (modelo existente) — posts, e-mails, roteiros e legendas.
  - Lê: `cerebro/voz-e-temas.md`, `cerebro/produto.md`.
  - Produz: calendário e textos em `saidas/conteudo/`.
  - Nunca sozinho: publicar, ou afirmar resultado de aluno que você não autorizou.

- **`vendas`** (modelo existente) — responde interessados e acompanha quem está decidindo.
  - Lê: `cerebro/oferta-e-preco.md`, `cerebro/objecoes.md`.
  - Produz: rascunho de resposta e de follow-up.
  - Nunca sozinho: inventar bônus, desconto ou prazo; prometer ganho ou transformação garantida.

- **`agenda`** (modelo existente) — organiza sessões individuais e lembretes (se você faz mentoria ou coaching).
  - Lê: agenda, `cerebro/regras-de-sessao.md`.
  - Produz: proposta de horários e lembretes.
  - Nunca sozinho: marcar ou cancelar sem seu OK.

- **`revisor`** (modelo existente) — confere texto de venda e promessas antes de você publicar.
  - Lê: `cerebro/promessas-proibidas.md`.
  - Produz: lista de trechos arriscados com sugestão de troca.
  - Nunca sozinho: aprovar publicação; só aponta.

## Cérebro deste nicho

Crie estes arquivos em `cerebro/` entrevistando o dono, uma pergunta por vez. Grave a resposta com a data; o que ele não souber fica "a confirmar".

- `cerebro/produto.md` — O que você vende e para quem? · O que está e o que não está incluso? · Que resultado honesto o aluno pode esperar? · Como o aluno acessa o material?
- `cerebro/oferta-e-preco.md` — só o confirmado. Preço, parcelas e garantia de hoje? · Que bônus existem de verdade? · Até quando vale a oferta? · Quem pode dar desconto?
- `cerebro/politica-reembolso.md` — Qual o texto exato da política? · Qual o prazo de garantia? · Quem aprova reembolso? · Que casos fogem da regra?
- `cerebro/faq-alunos.md` — Quais as 20 dúvidas reais dos alunos? · Qual a resposta de cada uma? · Quais indicam falha no material?
- `cerebro/voz-e-temas.md` — Como você fala (formal, direto, com humor)? · Sobre que assuntos posta? · Quais 3 posts seus foram bons? · O que nunca postar?
- `cerebro/objecoes.md` — Como o lead diz "está caro"? · E "não tenho tempo"? · Qual a resposta honesta para cada uma? · Que objeções significam não vender?
- `cerebro/promessas-proibidas.md` — Que promessas nunca fazer (ganho, prazo, cura)? · Que depoimentos têm autorização por escrito? · Quais palavras são proibidas? · Quem revisa texto de venda antes de publicar?
- `cerebro/regras-de-sessao.md` — só se faz mentoria individual. Duração e preço da sessão? · Regra de remarcação e falta? · Quais horários estão disponíveis? · O que o aluno manda antes?

## Rotina, indicadores e integrações

- **Rotina:** diária, `suporte` prepara as respostas da fila de alunos (você aprova) · semanal, `conteudo` entrega o pacote da semana, `revisor` confere e você publica · mensal, `orquestrador` resume dúvidas mais frequentes e alunos sem acessar.
- **Indicadores:** vendas e origem (qual conteúdo gerou) · reembolsos e o motivo declarado · alunos ativos (quem acessou no mês) · cancelamento de assinaturas ou mentorias · tempo de resposta ao aluno · dúvidas repetidas (indicam falha no material).
- **Integrações** (só leitura primeiro): Google Gmail, Agenda e Sheets (MCP comunitário, taylorwilsdon); Notion (MCP oficial), se você já usa; plataforma de pagamento e de curso via script (sem MCP oficial confirmado para Mercado Pago ou Asaas; Stripe tem MCP oficial, se você usar). Aviso ao dono pelo Telegram: bot por API HTTP em script; não existe MCP oficial da Anthropic para Telegram.

## Cuidados

- **Promessa de resultado:** não prometa ganho, cura ou transformação. Pode violar o CDC e as regras de publicidade (ver `../guia/08-legal-e-etica-br.md`).
- **Depoimentos:** só com autorização do aluno. Não crie depoimento falso nem com IA.
- **Influência e publicidade:** identifique parceria paga (CONAR, ver `../guia/08-referencias.md`).
- **Coaching de saúde, finanças ou direito:** não substitua profissional; confirme as regras da categoria. Pergunta do aluno sobre remédio, tratamento ou investimento: o agente não responde, encaminha a você.
- **Dados de alunos:** guarde o mínimo. Serviços fora do Brasil exigem cláusulas-padrão (Res. ANPD nº 19/2024) ou outro mecanismo do art. 33.
- **Conteúdo de IA, voz e rosto:** direito de imagem é autônomo; sem permissão, há risco de indenização (pesquisa do kit).

## Primeira semana

- [ ] Escrever `politica-reembolso.md` com o texto exato que você pratica.
- [ ] Listar 20 dúvidas reais de alunos em `faq-alunos.md`.
- [ ] Criar `orquestrador` e `suporte`.
- [ ] Testar `suporte` com 10 mensagens antigas.
- [ ] Preencher `promessas-proibidas.md` antes de ligar o `conteudo`.

**Testes do nicho:** `node evals/rodar.mjs evals/nichos/infoprodutor.jsonl` (3 casos com `suporte` e `conteudo`; cada caso chama a IA e gasta centavos; leia as respostas).
