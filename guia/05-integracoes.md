# Integrações (MCP e alternativas)

Conferido em 27/10/2026 no GitHub e nas documentações. **Antes de instalar qualquer coisa, faça a checagem da seção final.**

## Como conectar
```
claude mcp add --transport http <nome> <url>                      # servidor remoto (recomendado quando existe)
claude mcp add --transport stdio <nome> -- npx -y <pacote>        # servidor local
claude mcp list                                                   # confere (Connected / Needs authentication / Failed)
```
Escopos: `local` (padrão: só você, neste projeto), `project` (arquivo `.mcp.json`, vai para o Git), `user` (você, em todos os projetos). Dentro do Claude: `/mcp`. Fonte: https://code.claude.com/docs/en/mcp

Um agente só enxerga os servidores que você permitir no campo `mcpServers` dele ou no escopo atual. **Dê a cada agente só as ferramentas de que ele precisa.**

## O que existe e é mantido (estrelas e último push lidos no GitHub hoje)
| Para quê | Opção | Quem mantém | Observações |
|---|---|---|---|
| Navegador | `microsoft/playwright-mcp` | Microsoft | Apache-2.0, ~38 mil estrelas, push 22/10/2026 |
| GitHub | `github/github-mcp-server` | GitHub | MIT, ~34 mil, push 23/10/2026 |
| Banco e backend | `supabase/mcp` | Supabase | Apache-2.0; use conta de teste e permissão de leitura |
| Notion | `makenotion/notion-mcp-server` | Notion | MIT |
| Pagamentos | `stripe/ai` | Stripe | MIT; comece só com leitura |
| Tarefas | `linear/linear` | Linear | MIT |
| Gmail, Calendar, Drive, Docs, Sheets | `taylorwilsdon/google_workspace_mcp` | Comunidade | MIT, ~3,4 mil estrelas; usa OAuth na SUA conta Google: revise os escopos |
| Arquivos, Git, memória em grafo, busca na web | `modelcontextprotocol/servers` | Referência do protocolo | São exemplos de referência, não produtos prontos para produção |
| Automação visual | `n8n-io/n8n` | n8n | Licença "fair-code": grátis para uso próprio, com restrições comerciais; leia a licença |
| Memória | `mem0ai/mem0` | Mem0 | Apache-2.0 |
| Registro oficial de servidores | `modelcontextprotocol/registry` | Protocolo MCP | Para descobrir servidores |

## O que NÃO existe (ou não confirmei)
- **Telegram:** não há MCP oficial da Anthropic. O caminho simples para avisos é `scripts/avisar-telegram.mjs` (API do Telegram, sem MCP). Existe o `chigwell/telegram-mcp` (comunitário; usa conta de usuário, não bot).
- **Mercado Pago, Asaas, Make, Zapier, Jira (oficial):** sem MCP oficial confirmado. Use a API ou o SDK do provedor, chamada por um script seu, com chave só de leitura quando possível.
- **WhatsApp por MCP:** os projetos ativos usam o WhatsApp Web (não oficial) e põem o seu número em risco de banimento. Veja abaixo.

## WhatsApp: leia antes de ligar
- A **API oficial** (WhatsApp Business Platform, Meta) é o caminho que respeita os termos. A Meta passou a proibir, nessa plataforma, chatbots de IA de **propósito geral** quando a IA é o produto oferecido (política com vigência de 15/01/2026); bots de atendimento de uma empresa continuam permitidos. Confirme o texto vigente nos termos oficiais da Meta. Veja `guia/08-legal-e-etica-br.md`.
- **Bibliotecas não oficiais** (que automatizam o WhatsApp Web) violam os termos e podem banir o número. Nunca em número de produção.
- Em qualquer caso: o agente **rascunha**, você **aprova e envia**. Mensagem ativa exige base legal e opt-in.

## Checklist antes de instalar um MCP ou skill
- [ ] Código aberto, licença clara?
- [ ] Mantido (push nos últimos 6 meses)? Quem mantém?
- [ ] Oficial do fornecedor ou comunitário? (comunitário = mais cuidado)
- [ ] Quais permissões pede (escopos OAuth, acesso a arquivos)? Dá para começar só leitura?
- [ ] Onde ficam as credenciais? Nunca no arquivo do projeto.
- [ ] O que a ferramenta devolve pode conter instruções escondidas (injeção)? Quem lê isso não pode ter também poder de enviar ou apagar.
- [ ] Testei com conta de teste antes de ligar a conta real?
- [ ] Anotei em `DIARIO.md` o que instalei e por quê?

## Ordem sugerida para uma pequena empresa (opinião)
1. Arquivos locais (já funciona sem MCP).
2. Planilha ou Google Sheets/Drive em modo leitura.
3. Agenda em modo leitura, depois escrita com confirmação.
4. E-mail em modo rascunho.
5. Aviso no Telegram (script).
6. Só então CRM, pagamentos e WhatsApp oficial.
