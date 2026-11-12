# Processo de prospecção

> Montado pelo Claude em 12/11/2026, a pedido do dono, com as respostas dele. O dono ajusta com o uso.

## 1. Montar a lista (quem faz: o dono)
- Onde procurar: perfis de negócios no Instagram e indicações. Lead sugerido por IA só entra depois de conferido no perfil público do negócio.
- Quem procurar: clínicas de estética, açaiterias, pequenas lanchonetes, barbearias e parecidos (`cerebro/clientes.md`).
- O que olhar no perfil (2 minutos por negócio): tem site? O link da bio leva para onde? O cardápio ou a lista de serviços é uma foto? O perfil posta e responde?
- Onde anotar: numa planilha com as colunas de `modelos/leads-modelo.csv`. A lista de verdade fica FORA do Git (pasta `dados/` ou planilha do dono): o repositório é público.

## 2. Classificar (quem faz: agente prospeccao)
- **A:** é do cliente ideal, o perfil está ativo e dá para ver um problema que os nossos serviços resolvem (sem site, link da bio vazio ou quebrado, cardápio em foto).
- **B:** é do cliente ideal, mas não deu para ver o problema, ou já tem um site simples.
- **C:** fora do cliente ideal, perfil parado ou já tem um site bom. Não abordar agora.
- Cada nota vem com uma linha de motivo. Sem origem clara do contato: "sem base para contato".

## 3. Primeira mensagem (o agente rascunha; o dono envia)
- Canal e regras: `cerebro/processos/contato-ativo.md`.
- A mensagem sai do perfil do próprio dono: escreva em primeira pessoa ("Sou [seu nome], faço sites..."), deixando [seu nome] para ele preencher. Nunca "sou assistente de...".
- Até 5 linhas, em tom neutro, educado e simples. Sem nome de empresa (ainda não há).
- Indicação: antes de enviar, o dono confirma com quem indicou se pode citar o nome.
- Tem de ter: quem é você e o que faz; onde achou o contato, ou quem indicou; uma observação específica e verdadeira sobre o negócio; UMA pergunta; uma forma simples de parar de receber.
- Não pode ter: preço, prazo exato, promessa de resultado, crítica ao que o negócio faz hoje, texto igual para todos.

## 4. Depois da primeira mensagem
- Sem resposta: não mande outra. Marque "sem resposta" na planilha.
- Respondeu: a conversa passa para o agente `vendas`. Proposta enviada e sem resposta: skill `follow-up`.
- Pediu para parar: marque "não contatar" e nunca mais chame.

## 5. Ritmo (sugestão do kit para agências; o dono ajusta)
- 5 a 10 negócios por dia, bem escolhidos, em vez de muitos de uma vez.
- Uma vez por semana, olhe a planilha: quantos foram abordados, quantos responderam, quantas conversas viraram proposta. O que funcionou vira proposta de anotação em `cerebro/memoria/propostas.md`.

_Última revisão: 12/11/2026_
