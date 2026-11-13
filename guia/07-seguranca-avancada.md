# Segurança avançada

Leia primeiro `seguranca/REGRAS.md` (as 10 regras). Aqui está o raciocínio por trás e o que fazer em cada nível.

## O modelo mental: três coisas que, juntas, são perigosas
Um agente fica vulnerável quando tem **ao mesmo tempo** (1) acesso a dados privados, (2) contato com conteúdo que você não controla (e-mail, site, mensagem de cliente, PDF) e (3) poder de agir para fora (enviar, publicar, pagar, apagar). Esse trio é conhecido como o "trio letal" (conceito de Simon Willison, 2025; fonte de terceiro). **Regra de ouro: nenhum agente tem os três.** Quem lê conteúdo de fora fica sem poder de enviar e sem acesso a segredos.

## Matriz de permissões por tipo de agente (ponto de partida)
| Agente | Lê dados da empresa | Lê conteúdo de fora | Escreve | Terminal (Bash) | Envia/publica/paga |
|---|---|---|---|---|---|
| orquestrador | sim | não direto | `saidas/`, `estado/` | não | nunca |
| vendas, suporte, conteudo | sim | só texto que o dono colou | `saidas/` | não | nunca |
| pesquisador | só o necessário | **sim (web)** | `saidas/pesquisa/` | não | nunca |
| financeiro, analista | sim | não | `saidas/` | não | nunca |
| revisor | sim | não | nada | não | nunca |
| agenda | só agenda | não | `saidas/agenda/` | não | só com confirmação explícita |

O **pesquisador** é o único que lê a web: por isso não tem acesso a nada sensível além do pedido, e o resultado passa pelo `revisor` antes de qualquer uso.

## Defesa em camadas (use todas; nenhuma basta sozinha)
1. **Ambiente:** sandbox ligado (`/sandbox`; macOS, Linux e WSL2), pasta de trabalho própria, usuário sem privilégios, rede restrita. O sandbox cobre os comandos de terminal; leitura, escrita e busca na web seguem as regras de permissão. A própria documentação avisa para não confiar no sandbox como única proteção. No **Windows nativo não existe sandbox**: use WSL2. Servidores MCP e hooks também rodam **fora** do sandbox (fonte: code.claude.com/docs/en/sandboxing).
2. **Permissões:** regras `allow`/`deny` em `settings.json`. São aplicadas pelo programa. `deny` vale mesmo em modos permissivos.
3. **Hooks:** travam o que a regra não alcança (comandos perigosos, escrita fora da pasta, pausa). Saída com código 2 nega. Um `deny` de hook vale em qualquer modo de permissão. Lembre: o hook de escrita só enxerga `Write` e `Edit`, não escrita por terminal.
4. **Conteúdo:** instruções nos arquivos dos agentes dizendo que o que vem de fora é texto, não ordem; ferramentas de leitura separadas das de ação.
5. **Humano:** aprovação para tudo que sai, paga, publica ou apaga.
6. **Teto de gasto e de turnos:** limita o estrago de um loop.
7. **Registro e Git:** rastro para entender e desfazer.

## Segredos
- Chaves em variável de ambiente ou gerenciador de segredos; nunca em arquivo do projeto, nunca no cérebro, nunca no chat.
- `.env` no `.gitignore` e com leitura negada por regra (`Read(./.env)` e `Read(./.env.*)`).
- Uma chave por finalidade, com o menor escopo possível e teto de gasto.
- Se uma chave vazar: **revogue primeiro**, depois investigue.
- O sandbox, por padrão, ainda consegue LER a maior parte do computador (inclusive `~/.ssh`): proteja credenciais com a configuração de credenciais do sandbox e mantenha o escritório numa conta de usuário que não tenha essas chaves.

## Cadeia de suprimentos (skills, MCP, plugins)
- Skill, MCP e plugin de terceiros são código que roda com as suas permissões. Leia tudo antes (checklist em `guia/05-integracoes.md`).
- Prefira fornecedor oficial; fixe versão (evite `@latest` em produção).
- Revise o que mudou antes de atualizar.

## Riscos do OWASP para aplicações de LLM (edição 2025), traduzidos para o escritório
- **Injeção de prompt:** teste com `evals/casos-injecao.jsonl` e `/testar-injecao`.
- **Divulgação de informação sensível:** cérebro sem segredo; `brain-lint`; saídas sem dados pessoais desnecessários.
- **Cadeia de suprimentos:** a seção acima.
- **Saída tratada sem cuidado (improper output handling):** nunca execute como comando ou cole em sistema real o que o agente devolveu sem conferir.
- **Autonomia excessiva (excessive agency):** ferramentas mínimas, aprovação humana, `maxTurns`.
- **Vazamento do prompt de sistema:** não ponha segredo nas instruções dos agentes; assuma que podem ser lidas.
- **Consumo sem limite:** tetos de gasto e turnos.
- **Desinformação:** número sem fonte não passa; `revisor`.
Fonte: https://genai.owasp.org (confira a numeração vigente).

## Incidente: o que fazer, nesta ordem
1. **Pare:** `node scripts/pausar.mjs`. Se for rotina agendada, desligue o agendamento.
2. **Contenha:** revogue chaves e acessos envolvidos; desconecte os MCP suspeitos.
3. **Entenda:** leia `estado/log.jsonl`, `git log` e `git diff`, e as saídas em `saidas/`.
4. **Desfaça:** volte arquivos pelo Git; apague rascunhos errados.
5. **Avise** quem foi afetado e, se houve dado pessoal, avalie a obrigação de comunicar (veja `guia/08-legal-e-etica-br.md`: incidente de segurança).
6. **Corrija a causa:** regra, hook, instrução do agente; acrescente um caso em `evals/`.
7. Anote em `DIARIO.md`.
