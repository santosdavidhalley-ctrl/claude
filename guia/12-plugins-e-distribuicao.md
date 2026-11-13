# Plugins e distribuição

## Para que servem
Um **plugin** reúne agentes, skills, hooks e servidores MCP numa pasta que outra pessoa (ou outro computador seu) instala de uma vez. Útil quando você quer reaproveitar o mesmo escritório em vários projetos ou entregar para uma equipe.

## Estrutura (documentação oficial)
```
meu-escritorio-plugin/
  .claude-plugin/plugin.json    (manifesto; é o ÚNICO arquivo dentro de .claude-plugin/)
  agents/        (os agentes)
  skills/        (uma pasta por skill, com SKILL.md)
  hooks/hooks.json   (mesma forma do bloco "hooks" do settings.json)
  .mcp.json      (servidores MCP)
```
Componentes colocados dentro de `.claude-plugin/` não carregam. Teste localmente com `claude --plugin-dir ./meu-escritorio-plugin`. Valide com `claude plugin validate`. Um hook igual em `settings.json` e em `hooks/hooks.json` roda duas vezes. Agentes de plugin têm o nome com prefixo (`plugin:agente`). Fonte: https://code.claude.com/docs/en/plugins (conferido em 27/10/2026, em parte por resumo; leia a página antes de publicar).

## Quando vale
- Mesmo escritório em 3 ou mais projetos.
- Você quer versionar e atualizar tudo junto.
- Equipe pequena usando o mesmo padrão.

## Se você pretende vender ou implantar escritórios para clientes
Isso é um negócio, não só uma pasta. Pense antes:
- **Chave de API:** a documentação do Agent SDK diz que produtos de terceiros não podem oferecer login claude.ai nem os limites da assinatura. Cada cliente usa a própria chave de API (ou você contrata e repassa o custo com contrato claro).
- **LGPD:** você passa a tratar dados dos clientes dos seus clientes. Defina quem é controlador e quem é operador, tenha contrato, política de privacidade e canal de atendimento ao titular. Veja `guia/08-legal-e-etica-br.md`.
- **Isolamento:** um escritório por cliente, com pasta, chaves, log e backups separados. Nunca misture cérebros.
- **Suporte e responsabilidade:** o que acontece quando o agente erra? Contrato, limites do serviço, aprovação humana nas mensagens ao cliente final.
- **Segurança:** servidor com usuário sem privilégios, sandbox, tetos de gasto por cliente, monitoramento. `guia/07`.
- **Transparência:** avise que é atendimento com IA, quando for o caso.
- Peça revisão de um advogado antes de assinar os primeiros contratos.
