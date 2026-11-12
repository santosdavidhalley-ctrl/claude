# Progresso do Alfred

Este arquivo fica no git e não tem dado pessoal. O que é da pessoa (memória, registros, perfil) fica em `dados/`, só no computador dela.

## Decisões até aqui

| Assunto | Decisão | Por quê |
|---|---|---|
| Cérebro | modelo local pelo Ollama | gasto zero; nada sai do PC |
| Caminho | tudo no PC (caminho A) por enquanto | o caminho B precisa de servidor pago; fica para a Fase 8, se a pessoa quiser |
| Voz | vozes neurais da Microsoft | Fase 5 |
| Canal | WhatsApp | Fase 6; as opções e os riscos são explicados lá |
| Bibliotecas | nenhuma na Fase 0 (só o Python) | menos coisa para instalar e revisar |

## Fase 0 · Preparação (em andamento)

**Pronto**

- Estrutura do projeto, `.gitignore` (`dados/`, `.env*`) e configuração.
- Cérebro atrás de uma porta única (`pensar(mensagens, ferramentas)`), com adaptador para o Ollama.
- Comandos `checar` e `oi`.
- 34 testes automáticos.

**Testado e como** (em servidor Linux, Python 3.13, contra um Ollama de mentira)

- Resposta de uma vez e aos poucos (streaming).
- Erros com mensagem clara: Ollama fechado, modelo não baixado, demora, resposta cortada, erro no meio.
- Recusa de endereço fora do computador.
- `git` ignora `dados/` e `.env*`.

**Ainda não testado**

- Ollama de verdade (o servidor onde o código é escrito não alcança o site do Ollama).
- Windows: instalação, comandos e acentos no terminal.
- Qual modelo o computador da pessoa aguenta.

**Pendente para fechar o portão**

1. Conferir o computador (memória, processador, placa de vídeo, espaço).
2. Instalar, cada um com o sim da pessoa: Ollama, uv, Git.
3. Baixar o modelo escolhido.
4. `uv run python -m alfred oi` responde no computador da pessoa.
5. `git status` não mostra segredo.
6. A pessoa sabe como parar e remover o Ollama.

**Custo medido:** US$ 0.

**Riscos abertos**

- O repositório no GitHub é público: o código do Alfred é visível para qualquer pessoa. Nenhum dado pessoal vai para lá.
- Modelo local é mais lento e menos preciso que um cérebro pago; pode perder partes de pedidos complexos.
