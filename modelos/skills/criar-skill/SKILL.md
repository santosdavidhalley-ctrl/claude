---
name: criar-skill
description: Guia a criação de uma NOVA skill (procedimento reutilizável em .claude/skills/<nome>/SKILL.md). Só o dono dispara, com /criar-skill <tarefa>.
disable-model-invocation: true
argument-hint: "<tarefa que se repete, ex.: responder pedido de orçamento>"
---

# Criar uma skill nova

Tarefa: $ARGUMENTS

1. Peça ao dono um EXEMPLO real (entrada e resultado bom). Sem exemplo, não escreva a skill.
2. Pasta `.claude/skills/<nome-kebab>/SKILL.md`. O `---` precisa estar na PRIMEIRA linha.
3. Frontmatter: `name`; `description` com o que faz e QUANDO usar (a parte mais importante é o começo: o texto é cortado em 1.536 caracteres); `disable-model-invocation: true` se for rotina que só o dono dispara.
4. Corpo: passos numerados, curtos; checagem final; onde salvar; o que NÃO fazer. Detalhes longos vão em arquivos de apoio na mesma pasta, citados no SKILL.md.
5. Teste: rode `/<nome>` e depois um pedido normal que deveria acionar a skill sozinha. Se não acionou, reescreva a descrição.
6. Anote em `DIARIO.md`.
