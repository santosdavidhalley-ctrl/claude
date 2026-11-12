# 15 — Outras IAs: construir e operar sem depender só do Claude

Conferido em 28/10/2026 nas páginas oficiais (fontes no fim). Preço, limite e modelo grátis mudam rápido: na dúvida, a página oficial manda.

## Resumo em 30 segundos
- **Construir** (a IA que monta o escritório com você) pede um **agente de código** forte. Recomendado: **Claude Code**. Também funcionam: Codex, Antigravity CLI, OpenCode e Cursor.
- **Operar** (o trabalho do dia a dia dos agentes) pode usar IA barata ou grátis: `runner/escritorio-api.mjs` roda os agentes com Ollama, Groq, OpenRouter, Gemini, OpenAI ou DeepSeek.
- **Grátis tem preço:** limite por minuto e por dia, modelo que some, e às vezes os seus dados viram treino. Dado de cliente nunca vai para plano que treina com os dados.

## 1. Para CONSTRUIR (agente de código)
| Ferramenta | Para começar | Lê este kit? | Observação |
|---|---|---|---|
| **Claude Code** (recomendado) | Claude Pro US$ 20/mês (US$ 17 no anual) ou Max a partir de US$ 100 | Sim: o kit foi feito para ele | Agentes, skills, travas e rotinas funcionam como estão |
| Codex CLI (OpenAI) | ChatGPT Plus US$ 20/mês (o Free e o Go têm só o app) | Sim, pelo `AGENTS.md` | `npm install -g @openai/codex` |
| Antigravity CLI (Google) | Plano individual US$ 0, com limite semanal básico | Sim, pelo `AGENTS.md` | Substituiu o plano grátis do Gemini CLI em 18/06/2026 |
| OpenCode (código aberto) | Grátis, com alguns modelos grátis (por tempo limitado) | Sim, pelo `AGENTS.md` | Usa 75+ provedores: Groq, OpenRouter, Ollama no computador. Aceita assinatura ChatGPT Plus/Pro |
| Cursor (editor) | Plano Free limitado | Sim, pelo `AGENTS.md` | Lê também `.claude/agents` e `.claude/skills` |
| Gemini CLI | Só com chave paga da API do Gemini | `GEMINI.md` (dá para apontar para `AGENTS.md`) | Sem plano grátis desde 18/06/2026 |

### Claude Code com motor de outra empresa
O Claude Code aceita outro modelo pelas variáveis `ANTHROPIC_BASE_URL` e `ANTHROPIC_AUTH_TOKEN`. Têm guia oficial: **Ollama** (`ollama launch claude`, no computador ou na nuvem deles), OpenRouter, DeepSeek, Kimi (Moonshot), GLM (Z.ai) e MiniMax.
- A Anthropic **não dá suporte** a esse uso ("doesn't support routing Claude Code to non-Claude models"). Funciona, mas pode falhar nas ferramentas. O OpenRouter avisa o mesmo: só é garantido com o provedor oficial da Anthropic.
- Ollama no computador: a documentação pede janela de contexto de **64 mil tokens ou mais** e máquina forte (o `gpt-oss:20b` pede cerca de 16 GB de memória). Busca na web e controles avançados de ferramenta não funcionam por completo.
- O plano de código da Z.ai (GLM Coding Plan) **proíbe** usar a cota em scripts e apps próprios: serve para o agente de código, não para o `runner/`.

### Limites honestos para construir com IA grátis ou pequena
- Modelo pequeno erra mais em tarefa longa com muitos arquivos (etapas 3 a 7). Vá mais devagar, uma etapa por vez, e rode `node scripts/testar-travas.mjs` e os testes de `evals/`.
- As travas do kit (hooks, permissões, sandbox) são do **Claude Code**. Em outra ferramenta elas só valem depois que você montar o equivalente (tabela da seção 4) e testar igual à etapa 7.
- Limite grátis acaba no meio da obra. O kit guarda o andamento em `estado/obra.json` e `DIARIO.md`: dá para continuar outro dia ou com outra IA.

## 2. Para OPERAR (o dia a dia dos agentes)
`node runner/escritorio-api.mjs <agente> "<pedido>" --provedor <nome>` roda um agente **sem ferramentas**: lê o arquivo do agente e o cérebro que ele cita, e devolve um rascunho em `saidas/<agente>/`. Ver provedores: `--provedores`. Ver o que iria, sem gastar: `--seco`. Agendar: `node scripts/agendar.mjs ... --motor api`.

| Provedor | Grátis? | Limite ou preço | Dados | Bom para |
|---|---|---|---|---|
| **Ollama** (no computador) | Sim | Sem cota; depende da máquina (8 a 16 GB de memória para os modelos leves) | Não saem do computador | Triagem, resumo, rascunho simples, dado sensível |
| **Groq** | Plano grátis | `openai/gpt-oss-120b`: 30 pedidos/min, 1.000/dia, 8 mil tokens/min | Não guarda por padrão (log de abuso até 30 dias), nos EUA | Respostas rápidas com prompt pequeno |
| **OpenRouter** (modelos `:free`) | Sim | 20 pedidos/min e 50/dia; 1.000/dia depois de comprar US$ 10 em créditos | O provedor do modelo grátis pode registrar e treinar | Testes |
| **Gemini API** (AI Studio) | Plano grátis (modelos Flash) | Limite exibido no AI Studio | No grátis o Google usa o conteúdo e pessoas podem ler: nada de dado pessoal | Testes sem dado de cliente |
| **DeepSeek** | Pago, muito barato | `deepseek-flash`: US$ 0,15 a 0,30 entrada e 0,60 a 1,20 saída por milhão de tokens | Processados e guardados na China | Volume sem dado sensível |
| OpenAI, Anthropic | Pago por uso | Tabela de cada um | Confira a política de dados da conta | Texto que vai para cliente |

O que o `runner/` NÃO faz: buscar na web (o `pesquisador` não roda nele), abrir planilha sozinho (passe o arquivo com `--entrada`), enviar ou publicar (é sempre rascunho). Prompt grande estoura plano grátis: o runner corta o cérebro no limite de cada provedor e avisa.

## 3. Qual escolher (recomendação)
- **Orçamento zero:** OpenCode com modelo grátis para construir, devagar. Ollama (se a máquina aguenta) ou Groq para operar rascunhos. Nada de dado de cliente em plano que treina.
- **Melhor custo-benefício:** Claude Pro para construir. Ollama ou Groq nas tarefas internas simples. Claude (Haiku) nas que falam com cliente.
- **Empresa com cliente de verdade:** Claude Max, ou API com teto mensal de gasto. Grátis só para teste.
- **Por agente:** triagem e resumo interno → grátis ou local. Vendas e suporte (texto que vai para o cliente) → modelo bom + revisão sua. Financeiro, jurídico e saúde → o melhor que você puder + revisão humana sempre.

## 4. Onde cada ferramenta procura cada coisa (para a IA que está montando)
| Item | Claude Code | Codex | Antigravity | OpenCode | Cursor |
|---|---|---|---|---|---|
| Instruções | `CLAUDE.md`; sem ele, `AGENTS.md` | `AGENTS.md` | `AGENTS.md` ou `GEMINI.md` | `AGENTS.md` | `AGENTS.md` |
| Skills (`SKILL.md`) | `.claude/skills/` | `.agents/skills/` | `.agents/skills/` | `.opencode/skills/` (lê `.claude/skills` e `.agents/skills`) | `.agents/skills/`, `.cursor/skills/` (lê `.claude/skills`) |
| Agentes | `.claude/agents/*.md` | `.codex/agents/*.toml` (`name`, `description`, `developer_instructions`) | `.agents/agents/*.md` | `.opencode/agents/*.md` | `.cursor/agents/*.md` (lê `.claude/agents`) |
| Trava antes da ferramenta | hook `PreToolUse`, saída 2 | hook `PreToolUse` em `.codex/hooks.json`, saída 2 | `.agents/hooks.json`, `PreToolUse` com "deny" | plugin `tool.execute.before` | não confirmado |
| Sem ninguém olhando | `claude -p` | `codex exec` | `agy -p` | `opencode run` | — |

Se você (IA) não é o Claude Code:
1. Rode `node scripts/iniciar.mjs` normalmente: ele cria `cerebro/`, `estado/`, `saidas/` e a pasta `.claude/` (que serve de molde).
2. Rode `node scripts/exportar.mjs <codex|antigravity|opencode|gemini|cursor>`: ele copia as skills (o formato `SKILL.md` é padrão aberto) e converte os agentes para o formato da sua ferramenta, sem sobrescrever nada. Depois de mudar um agente em `.claude/agents/`, rode de novo com `--forcar`.
3. Configure as ferramentas de cada agente pelo jeito da sua ferramenta (os campos `tools`, `model` e `maxTurns` são do Claude Code e ficam de fora).
4. As regras da casa ficam em `CLAUDE.md`: leia esse arquivo também (o `AGENTS.md` da raiz manda fazer isso).
5. Recrie as travas no mecanismo da sua ferramenta. Os hooks do kit leem a entrada no formato do Claude Code: adapte a leitura e teste os mesmos casos de `scripts/testar-travas.mjs`.
6. Nas rotinas, troque `claude -p` pelo comando da sua ferramenta, ou use `runner/escritorio-api.mjs`.

## Fontes (28/10/2026)
- Claude Code e AGENTS.md: https://code.claude.com/docs/en/memory · gateways: https://code.claude.com/docs/en/gateways
- Ollama + Claude Code: https://docs.ollama.com/integrations/claude-code · contexto: https://docs.ollama.com/context-length
- Codex: https://learn.chatgpt.com/docs/pricing · https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Gemini CLI → Antigravity: https://github.com/google-gemini/gemini-cli · https://antigravity.google/pricing
- OpenCode: https://opencode.ai · Cursor: https://cursor.com/docs/rules
- Groq: https://console.groq.com/docs/rate-limits · https://console.groq.com/docs/your-data
- OpenRouter: https://openrouter.ai/docs/api_reference/limits · Gemini API: https://ai.google.dev/gemini-api/terms
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing · Z.ai: https://docs.z.ai/legal-agreement/subscription-terms
- Claude: https://claude.com/pricing
