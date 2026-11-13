# Cérebro e memória, em profundidade

## Por que arquivos simples
Memória de agente tem dois problemas: o contexto é limitado e custa dinheiro, e fato errado gravado vira erro repetido com confiança. Arquivos de texto resolvem os dois: você vê, corrige, versiona no Git e carrega só o que precisa.

## Os níveis de memória (comece pelo 1)
1. **Arquivos do cérebro (`cerebro/`).** O arquivo do agente lista o que ele lê antes de agir. É o padrão do kit.
2. **CLAUDE.md e regras.** `CLAUDE.md` é lido em toda conversa na pasta (e nas pastas acima). Pode importar arquivos com `@caminho` (até 4 níveis); o arquivo importado entra junto, então só importe o que for sempre necessário. A documentação recomenda menos de 200 linhas. Regras por pasta ou tipo de arquivo ficam em `.claude/rules/*.md`.
3. **Memória automática do Claude Code.** O Claude guarda notas sozinho em `~/.claude/projects/<projeto>/memory/`; as primeiras 200 linhas (ou 25 KB) de `MEMORY.md` entram em cada sessão. Convém saber que existe; desligue com `autoMemoryEnabled: false` se quiser controle total.
4. **Memória por subagente (campo `memory`).** No cabeçalho do agente: `memory: project` grava em `.claude/agent-memory/<agente>/` (vai para o Git); `user` em `~/.claude/agent-memory/<agente>/`; `local` em `.claude/agent-memory-local/<agente>/`. O agente passa a ler e escrever lá e aprende entre sessões. **Cuidado:** é o agente gravando sozinho. Para fatos de negócio, prefira o fluxo "agente propõe, dono aprova".
5. **Memória em grafo ou banco (avançado).** O servidor de memória de referência do protocolo MCP (grafo local), o Mem0 (camada de memória que extrai fatos das conversas; Apache-2.0) e o Letta (agentes com memória gerenciada). Só vale quando os arquivos ficarem pequenos demais para a quantidade de informação.

## O fluxo "propor e aprovar"
1. Durante o trabalho, o agente escreve em `cerebro/memoria/propostas.md`: data, agente, fato proposto, de onde veio.
2. O dono lê (a rotina `/fechar-dia` junta as propostas do dia) e **move** o que é verdade para o arquivo certo do cérebro, com data.
3. O que for falso, apague. O que for incerto, deixe como proposta.
Assim o cérebro nunca recebe um fato que o dono não confirmou.

## Como organizar o conteúdo
- **Arquivos pequenos** (o `brain-lint` avisa acima de 8 mil caracteres): `empresa.md`, `clientes.md`, um arquivo por processo.
- **Fato com data e fonte:** "Plano X custa R$ Y (confirmado pelo dono em DD/MM/AAAA)".
- **Linha "Última revisão: DD/MM/AAAA"** em cada arquivo; revisão a cada 90 dias.
- **Sem segredo:** nada de senha, chave, cartão, CPF de cliente. `node scripts/brain-lint.mjs` procura padrões de chave.
- **Exemplos valem mais que adjetivos:** 3 mensagens boas reais do dono ensinam o tom melhor que "seja simpático".

## Princípios de engenharia de contexto (Anthropic)
- Contexto é recurso finito: cada token extra compete pela atenção do modelo.
- Carregue sob demanda: o agente guarda referências (caminhos) e abre o arquivo quando precisa.
- Notas fora do contexto: arquivos de progresso e de decisões, lidos no começo da sessão.
- Subagentes para tarefas de busca ou saída grande: devolvem só o resumo.
- Fonte: "Effective context engineering for AI agents" (29/09/2025).

## Trabalho longo: o padrão do arquivo de progresso
Quando uma tarefa passa de uma sessão (como montar o escritório), a Anthropic descreve o padrão: **lista de funcionalidades em JSON com campo `passes`** (o agente só muda esse campo, depois de testar de verdade), **arquivo de progresso** lido no início e atualizado no fim de cada sessão, **commit no Git a cada mudança** e **uma funcionalidade por sessão**. O kit usa exatamente isso: `estado/obra.json` (a lista), `DIARIO.md` (o progresso) e Git. Fonte: "Effective harnesses for long-running agents" (26/11/2025).

## Erros clássicos
- Um arquivo gigante "com tudo".
- Fato sem data (ninguém sabe se ainda vale).
- Cérebro com informação contraditória: o Claude escolhe uma delas ao acaso.
- Deixar o agente gravar fatos de negócio sozinho.
- Esquecer a revisão mensal.
