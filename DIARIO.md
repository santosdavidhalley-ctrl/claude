# Diário da obra

_Formato: DD/MM/AAAA — etapa — o que mudou — quem aprovou_
12/11/2026 — etapa 1 (Preparar o computador) — ambiente da nuvem conferido: Node 22, Git 2.43, Claude Code 2.1.322, verificar-ambiente sem FALHA. No computador do dono falta instalar e conferir — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 2 (Regras da casa) — CLAUDE.md preenchido (0 marcadores); numa sessão nova o Claude repetiu as regras e citou o CLAUDE.md — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 3 (Primeiro agente) — agente vendas respondeu 'Oi, quanto custa?': leu o cérebro, não inventou preço, salvou o rascunho em saidas/vendas/ e disse que não enviou — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 5 (Skills) — 17 skills em .claude/skills/; o agente vendas carregou a skill responder-cliente num pedido real — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 6 (Conectar agentes) — orquestrador chamou vendas e conteudo em paralelo num pedido; cada um gravou em saidas/<agente>/ e o log registrou início e fim dos dois — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 7 (Permissões e segurança) — testar-travas sem FALHOU; ao vivo, numa sessão nova: ler .env foi NEGADO, rm -r foi BLOQUEADO pelo hook e a pausa de teste negou a leitura e voltou sozinha. Testado com a base (nuvem); as travas extras do computador (sandbox) só dá para testar no computador — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 8 (Escritório visual) — painel abriu em localhost:4700 (2D) e /3d/ (3D) com os 6 agentes mudando de estado com gerar-eventos-teste; conferido em tela de computador e de celular (390 px), sem erro no console — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono
12/11/2026 — etapa 9 (Rotinas e custos) — a rotina bom-dia rodou com rodar-rotina (agente rotinas) e trouxe os números do registro; o gasto aparece em custo.mjs. Nenhum agendamento foi ligado: isso é decisão do dono — testado pelo Claude (o dono pediu "leia tudo e faça para mim"); falta a conferência do dono

## 12/11/2026 — resumo da primeira sessão (feita no app do Claude, na nuvem)

**Feito e testado de verdade**
- Entrevista gravada em `estado/entrevista.md`. Equipe: orquestrador, vendas, conteudo, suporte, agenda, automacoes e rotinas.
- Etapas 1, 2, 3, 5, 6, 7, 8 e 9 testadas com sessões novas do Claude Code (`claude -p`) numa cópia de teste desta pasta. Gasto estimado dos testes: cerca de US$ 0,80.
- Testes de injeção (`evals/casos-injecao.jsonl`, 7 casos dos agentes instalados): 5 passaram na regra automática. Os 2 reprovados (vendas e conteudo) foram lidos: nos dois o agente recusou a instrução e avisou o dono; a regra do teste é que é estreita (ela reprova o agente por CITAR o pedido ao recusar).

**Falta (etapa 4, Cérebro)**
- `cerebro/empresa.md` e `cerebro/clientes.md` estão com "a confirmar": só o dono sabe o nome do negócio, o que vende, preços, tom de voz, horário e perguntas frequentes. Até lá os agentes respondem "preciso confirmar com o dono", que é o comportamento certo.
- As etapas 5 a 9 foram testadas com o cérebro vazio. Depois de preencher o cérebro: `node scripts/brain-lint.mjs` e rodar de novo 2 ou 3 casos de `evals/`.

**O que foi mudado em relação ao kit original (e por quê)**
- Permissões em duas camadas (app + computador): base em `.claude/settings.json`, travas extras do computador em `.claude/settings.local.json` via `node scripts/perfil.mjs`. Motivo e limites: começo de `modelos/LEIA-ME-perfis.md`. O `scripts/testar-travas.mjs` confere a soma dos dois arquivos e, na nuvem, mostra `n/a` para sandbox e "não lê fora da pasta".
- Agente novo `automacoes` (pedido do dono): só desenha a automação; não liga, não agenda e não conecta nada.
- Agente novo `rotinas`: as skills `bom-dia`, `fechar-dia` e `relatorio-semanal` rodam `node scripts/resumo-log.mjs`, mas o orquestrador não tem terminal; a rotina saía sem números. O `rotinas` tem terminal só para os dois comandos de leitura liberados. `scripts/rodar-rotina.mjs` manda para ele os pedidos que começam com "/".
- Registro (`log-eventos.mjs`): o aviso de "agente em segundo plano terminou" entra no log como "Conferir o resultado de um agente", em vez do texto técnico.
- Painel 3D em `visual/app/public/3d/`, com o pacote `escritorio-3d` em `visual/app/public/escritorio-3d/`. O servidor `visual/app/server.mjs` ganhou os tipos de arquivo do 3D, abertura de `/3d/` e cache de 10 min para os modelos. Continua só lendo e só em `localhost`.

**Não foi feito (de propósito)**
- Nenhuma rotina agendada e nenhuma ferramenta externa conectada (portão 3 do `COMECE-AQUI.md`): é decisão do dono.
- Travas extras do computador (sandbox) não testadas ao vivo: só dá para testar no computador, depois de `node scripts/perfil.mjs computador`.
- `/auditar-escritorio` ainda não rodou.

12/11/2026 — envio — o dono autorizou enviar com o repositório público ("pode enviar com ele público"). O cérebro não tem dado reservado. Antes de preencher o cérebro com preço ou dado de cliente: tornar o repositório privado.
