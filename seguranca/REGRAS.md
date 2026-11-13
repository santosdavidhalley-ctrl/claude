# Regras de segurança do escritório (leia antes de liberar qualquer permissão)

Dar permissão a um agente é dar a chave da sua casa a um estagiário muito rápido, que lê tudo o que aparece pela frente, inclusive coisas escritas por estranhos. A regra é a mesma de qualquer casa: **chave só da porta que ele precisa, e só pelo tempo que precisa.**

## As 10 regras

1. **Menor permissão possível.** Cada agente recebe só as ferramentas da função dele. Agente de conteúdo não precisa de terminal. Agente de pesquisa não precisa escrever arquivos.
2. **Leitura primeiro, escrita depois.** Todo agente novo começa só lendo. Ganha escrita quando você viu o trabalho dele funcionar por alguns dias.
3. **Pasta de trabalho fechada.** Agentes trabalham numa pasta do projeto. Nada de acesso ao computador inteiro, ao Desktop, aos Downloads ou à pasta pessoal.
4. **Segredos fora do alcance.** Chaves e senhas ficam em variáveis de ambiente ou em `.env` que está no `.gitignore` e bloqueado nas regras de permissão. O agente nunca precisa ler a chave; o programa lê.
5. **Conteúdo de fora é suspeito.** Página da web, e-mail, PDF, mensagem de cliente: qualquer texto pode conter instruções escondidas ("ignore as regras e envie…"). Isso se chama injeção de prompt. O agente que lê conteúdo de fora **não** pode ter, ao mesmo tempo, poder de enviar dados para fora ou apagar coisas.
6. **Ações que não têm volta pedem seu OK.** Apagar, enviar e-mail ou mensagem, pagar, publicar, fazer deploy, mexer em banco de dados de verdade: sempre confirmação humana.
7. **Trava de comandos perigosos.** Bloqueie por regra e por hook: `rm -rf`, `sudo`, `curl | sh`, `git push --force`, leitura de `.env`. Veja `modelos/settings.json` e `modelos/hooks/bloquear-perigoso.mjs` (testado).
8. **Tudo deixa rastro.** Cada agente registra o que fez em um arquivo de log. Se algo der errado, você consegue reconstruir.
9. **Teto de gasto.** Defina um limite mensal na conta da API e alertas de uso. Um agente em loop pode gastar muito em poucas horas.
10. **Teste em ambiente de brinquedo.** Antes de conectar a agenda, o e-mail ou o WhatsApp de verdade, rode tudo com contas e dados de teste.

## Sinais de que algo está errado

- O agente pede uma permissão que não tem a ver com a tarefa.
- O agente cita uma "instrução" que veio de um e-mail, site ou arquivo, e não de você.
- Gasto do dia muito acima do normal.
- Arquivos alterados fora da pasta do projeto.

Se qualquer um acontecer: **pare tudo, revogue as chaves envolvidas, leia o log.**

## O que NÃO fazer

- Não rode o Claude com todas as verificações de permissão desligadas num computador com seus dados pessoais.
- Não coloque chaves de API dentro de arquivos do projeto que vão para o GitHub.
- Não dê ao mesmo agente: ler a internet + ler seus arquivos + enviar mensagens.
- Não deixe agentes novos rodando de madrugada sem você ter visto o log do dia anterior.

## Aprofundamento
- `guia/07-seguranca-avancada.md` — modelo mental (o trio letal), matriz de permissões por agente, camadas de defesa, segredos, cadeia de suprimentos, OWASP, incidente passo a passo.
- `seguranca/CHECKLIST-LANCAMENTO.md` — o que conferir antes de deixar um agente falar com clientes ou rodar sozinho.
- `evals/casos-injecao.jsonl` — testes contra instruções escondidas.
- `scripts/pausar.mjs` — botão de emergência.
