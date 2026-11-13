# Kit Escritório de IA, do zero (versão 2.2)

Ensina a montar o seu próprio escritório de agentes de IA com o Claude, passo a passo, com modelos prontos, travas de segurança, testes e um painel que funciona.

## Como começar (4 passos)
1. **Descompacte** este arquivo. A pasta `escritorio-ia-kit` **é o seu projeto**: renomeie se quiser (por exemplo, `meu-escritorio`). Deixe-a num lugar comum, como a sua pasta pessoal: **fora** da Mesa, de Documentos, de Downloads e de pastas sincronizadas (iCloud, OneDrive, Dropbox, Google Drive), que travam arquivos e pedem permissão.
2. **Instale o Claude Code** (veja `passos/01-preparar-o-computador.md`) e abra um terminal dentro da pasta. Vai usar outra IA (Codex, Antigravity, OpenCode, Cursor) ou plano grátis? Leia antes `guia/15-outras-ias.md`.
3. Rode `node scripts/verificar-ambiente.mjs` e resolva toda FALHA (a saída está escrita do lado). Depois digite `claude`. Na primeira vez ele pergunta se você confia na pasta: **aceite**.
4. Cole esta frase: `Leia COMECE-AQUI.md e siga as instruções.`

O Claude conduz a obra com você, uma etapa por vez, e guarda o andamento em `estado/obra.json` e `DIARIO.md` (se a conversa acabar, ele retoma de onde parou).

## O que tem aqui
| Pasta | O que é |
|---|---|
| `COMECE-AQUI.md` | As instruções que o Claude segue |
| `AGENTS.md` | A porta de entrada para qualquer outra IA (Codex, Antigravity, OpenCode, Cursor) |
| `passos/` | As 9 etapas guiadas |
| `guia/` | 16 documentos de aprofundamento: visão geral, glossário, modelos e custos, orquestração, cérebro, integrações, rotinas, segurança, **leis do Brasil**, testes, operação, problemas, plugins, **prompts prontos**, fontes e **outras IAs (grátis e pagas)** |
| `modelos/` | 10 agentes, 17 skills, 4 hooks, 2 perfis de permissão, cérebro e estado de exemplo |
| `nichos/` | 8 pacotes por tipo de negócio (agência, loja virtual, clínica, imobiliária, advocacia/contabilidade, restaurante, infoprodutor, academia) |
| `scripts/` | iniciar, verificar ambiente, **testar as travas** (sem gastar), pausar tudo, custos, rotinas, **gerar agendamento**, lint do cérebro, avisos no Telegram, andamento da obra |
| `evals/` | Casos de teste dos agentes, inclusive contra injeção de prompt (como rodar e critério em `evals/LEIA-ME.md`) |
| `visual/` | O painel do escritório (**funciona**: `node visual/app/server.mjs`) e o briefing para evoluir |
| `agendar/` | Exemplos de cron, launchd (Mac) e Windows |
| `runner/` | Rodar os agentes com **outras IAs** (Ollama, Groq, OpenRouter, Gemini, OpenAI, DeepSeek) e exemplo avançado com o Agent SDK |
| `seguranca/` | As 10 regras e o checklist de lançamento |

## Antes de tudo
- **Você responde pelo que os seus agentes fazem.** Comece pequeno, com leitura e rascunho. Aumente aos poucos.
- **Os modelos são genéricos.** Adapte ao seu negócio.
- **Fatos técnicos** (comandos, preços, recursos) foram conferidos nas documentações oficiais em 28/10/2026 e mudam rápido. Na dúvida, a página oficial manda. O Claude pode ler a documentação atual e corrigir o que mudou.
- **Leis:** `guia/08` é informação geral, não aconselhamento jurídico.
- **Teste real:** o kit foi montado e os scripts testados com dados falsos. A parte que usa o Claude de verdade (`evals/`, `rodar-rotina`) depende da sua conta e do seu computador: rode primeiro com poucos casos e olhe o custo.
