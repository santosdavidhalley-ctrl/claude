# Meu Alfred

Assistente pessoal que roda no seu computador. O cérebro é um modelo local (Ollama): as conversas não saem do PC e não há custo por uso.

O projeto cresce uma fase por vez. O estado de cada fase está em [PROGRESSO.md](PROGRESSO.md).

## Comandos (rode dentro desta pasta)

| Comando | O que faz |
|---|---|
| `uv run python -m alfred checar` | confere se o Ollama atende e se o modelo está baixado |
| `uv run python -m alfred oi` | chamada de teste: o Alfred diz oi usando só o seu PC |
| `uv run python -m unittest` | roda a bateria de testes (não precisa de internet nem do Ollama) |

## Onde fica cada coisa

| Pasta ou arquivo | O que é |
|---|---|
| `alfred/` | o código do Alfred |
| `testes/` | os testes |
| `config.toml` | configuração padrão (nada secreto) |
| `dados/` | tudo que é seu: memória, registros, configuração local. Fica só no seu PC, fora do git |
| `INSTALADOS.md` | o que foi instalado para o Alfred e como remover |

## Regras que o código impõe

- O cérebro local só aceita endereço deste computador (`127.0.0.1`). Qualquer outro é recusado, para a conversa não sair do PC por engano.
- Nenhum segredo entra no projeto. A pasta `dados/` e arquivos `.env*` são ignorados pelo git.
