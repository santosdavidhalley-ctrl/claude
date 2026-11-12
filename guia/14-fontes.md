# Fontes e como manter o kit atualizado

Tudo que é fato técnico neste kit foi conferido em **27/10/2026** nas fontes abaixo. Ferramentas de IA mudam rápido: se algo não bater, a fonte oficial manda — e o Claude consegue ler a documentação atual e ajustar.

## Documentação do Claude Code e da API
- Índice completo: https://code.claude.com/docs/llms.txt (Claude Code e Agent SDK) e https://platform.claude.com/llms.txt (API)
- Instalação: https://code.claude.com/docs/en/setup
- Subagentes: https://code.claude.com/docs/en/sub-agents
- Skills: https://code.claude.com/docs/en/skills
- Memória e CLAUDE.md: https://code.claude.com/docs/en/memory
- Hooks: https://code.claude.com/docs/en/hooks e /hooks-guide
- Permissões e configurações: https://code.claude.com/docs/en/permissions e /settings
- Sandbox: https://code.claude.com/docs/en/sandboxing
- MCP: https://code.claude.com/docs/en/mcp
- Modo sem interface (`claude -p`): https://code.claude.com/docs/en/headless e /cli-reference
- Agendamento e rotinas: https://code.claude.com/docs/en/scheduled-tasks e /routines
- Agent teams (experimental): https://code.claude.com/docs/en/agent-teams
- Agent SDK: https://code.claude.com/docs/en/agent-sdk/overview
- Plugins: https://code.claude.com/docs/en/plugins
- Preços: https://platform.claude.com/docs/en/about-claude/pricing
- Autenticação e custos: https://code.claude.com/docs/en/authentication e /costs

## Engenharia de agentes (Anthropic)
Lista de posts: https://www.anthropic.com/engineering. Lidos ou conferidos: "Building effective agents", "How we built our multi-agent research system" (13/06/2025), "Effective context engineering for AI agents" (29/09/2025), "Writing effective tools for agents" (11/09/2025), "Equipping agents for the real world with Agent Skills" (16/10/2025), "Effective harnesses for long-running agents" (26/11/2025, lido por inteiro), "Demystifying evals for AI agents" (09/01/2026), "Beyond permission prompts: making Claude Code more secure and autonomous" (20/10/2025), "How we contain Claude across products" (25/05/2026), "Code execution with MCP" (04/11/2025).

## Segurança
- OWASP GenAI Security Project: https://genai.owasp.org
- Trio letal (dados privados + conteúdo não confiável + ação externa), Simon Willison, 2025 (fonte de terceiro).

## Repositórios citados (estrelas e último push lidos na API do GitHub em 27/10/2026)
pixel-agents-hq/pixel-agents, a16z-infra/ai-town, anthropics/claude-agent-sdk-python e -typescript, crewAIInc/crewAI, langchain-ai/langgraph, mem0ai/mem0, letta-ai/letta, microsoft/playwright-mcp, github/github-mcp-server, supabase/mcp, makenotion/notion-mcp-server, stripe/ai, taylorwilsdon/google_workspace_mcp, modelcontextprotocol/servers, modelcontextprotocol/registry, n8n-io/n8n. A AutoGen (microsoft/autogen) está arquivada; o MetaGPT não tem atividade desde janeiro de 2026: por isso não são recomendados.

## Leis e normas (Brasil)
Ver as fontes oficiais em `guia/08-legal-e-etica-br.md`. WhatsApp: termos da Meta para a WhatsApp Business Platform.

## O que o autor do kit testou de verdade e o que não testou
**Testado com execução real:** hooks (bloqueio, pausa, registro, pasta permitida), `iniciar`, `verificar-ambiente`, `obra`, `custo`, `brain-lint`, `rodar-rotina` e `evals/rodar` (com um `claude` de teste), o painel visual (com eventos falsos, em 390 px e 1280 px) e UMA chamada real do `claude -p` (campos do JSON, flags e o aviso de pasta não confiável).
**Não testado:** agendadores (cron, launchd, Agendador do Windows), `/schedule`, o exemplo do Agent SDK, os MCP de terceiros, o Windows, e os agentes e skills conversando com clientes reais.

## Como manter atualizado
1. A cada mês, abra os links acima que você usa e compare com o kit.
2. Peça ao Claude: `Leia a documentação oficial de [tema] e diga o que mudou em relação a guia/[arquivo].md. Não altere nada, só relate.`
3. Rode `evals/` depois de qualquer atualização grande do Claude Code.
