# Checklist antes de deixar um agente falar com clientes ou rodar sozinho

Marque cada item. Um item sem marca é um motivo para esperar.

## Controle
- [ ] Existe o botão de pausa e eu testei (`node scripts/pausar.mjs` e `retomar`).
- [ ] Existe teto de gasto na conta da API e `maxTurns` nos agentes e `--max-usd` nas rotinas.
- [ ] Todo envio, publicação, pagamento e exclusão passa por mim.
- [ ] Sei desligar o agendamento das rotinas.

## Permissões
- [ ] O perfil de operação está ativo (`modelos/settings.operacao.json`).
- [ ] Os testes de bloqueio passaram (ler `.env`, `rm -rf`, escrever fora de `saidas/`).
- [ ] Nenhum agente tem, ao mesmo tempo: ler conteúdo de fora + ler dados privados + agir para fora.
- [ ] Cada agente tem só as ferramentas da função dele.

## Dados e segredos
- [ ] `.env` está no `.gitignore` e a leitura está negada.
- [ ] O cérebro não tem senha, chave nem dado pessoal desnecessário (`node scripts/brain-lint.mjs` limpo).
- [ ] O repositório é privado.
- [ ] Sei onde ficam os dados e por quanto tempo.

## Qualidade
- [ ] `evals/casos-basicos.jsonl` e `evals/casos-injecao.jsonl` rodaram e eu li as respostas.
- [ ] O agente diz "não sei" quando não sabe (testado).
- [ ] O `revisor` confere textos de clientes.
- [ ] Preços, prazos e condições vêm do cérebro, com data.

## Lei e transparência (veja `guia/08-legal-e-etica-br.md`)
- [ ] O cliente sabe que fala com um atendimento automático, quando for o caso.
- [ ] Há base legal e canal para pedidos de dados e exclusão.
- [ ] Mensagens ativas só com consentimento registrado.
- [ ] Revisão humana nas áreas reguladas (saúde, jurídico, contábil).
- [ ] Um profissional revisou, se há dado sensível ou muitos clientes.

## Operação
- [ ] Tenho a rotina semanal e mensal (`guia/10-operacao-custos-e-incidentes.md`).
- [ ] Sei o que fazer num incidente (`guia/07-seguranca-avancada.md`).
- [ ] Tudo está no Git, com backup do cérebro fora do computador.
