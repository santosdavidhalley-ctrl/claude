# Etapa 2 — Regras da casa (CLAUDE.md)

**Objetivo:** um arquivo curto que o Claude lê toda vez que entra na pasta. É o regulamento do escritório.

## Saber antes
- **Curto:** a documentação recomenda menos de 200 linhas. Cada linha custa atenção em toda conversa. Instrução longa vira skill (`criar-skill`).
- **Orienta, não obriga:** o CLAUDE.md molda o que o Claude tenta fazer, mas não bloqueia nada. Quem bloqueia são as permissões e os hooks (etapa 7).
- **Importar:** `@cerebro/empresa.md` dentro do CLAUDE.md carrega o arquivo junto em toda conversa. Só importe o que é sempre necessário.
- **Outras IAs:** o `AGENTS.md` da raiz manda as outras ferramentas lerem este CLAUDE.md também.

## Fazer
1. Abra o `CLAUDE.md` da raiz (o `iniciar.mjs` já criou). Não copie `modelos/CLAUDE.md` por cima.
2. Preencha os campos `{{...}}` com as respostas de `estado/entrevista.md`. O que a pessoa não souber fica "a confirmar".
3. Mostre o texto final e salve só depois do OK.

## Testar (feito quando)
- `grep -c "{{" CLAUDE.md` responde 0.
- A pessoa abre uma conversa nova (`/clear`) e pergunta "Quais são as regras desta casa?": o Claude repete as do CLAUDE.md. `/context` mostra que o arquivo foi carregado.
- Marque: `node scripts/obra.mjs passou 2 --nota "CLAUDE.md preenchido" --commit`.

## Erros comuns
- CLAUDE.md gigante, com tudo da empresa dentro. O conhecimento da empresa vai no cérebro (etapa 4), em arquivos separados.
- Escrever "nunca apague nada" e achar que isso protege. Não protege: veja a etapa 7.
