# Pacotes por nicho — LEIA-ME

Cada arquivo desta pasta é um **ponto de partida** para um tipo de negócio. Não é receita pronta.

## Aviso importante

- **Ponto de partida:** os agentes, rotinas e indicadores são sugestões. Seu negócio é diferente. Adapte.
- **Não é aconselhamento jurídico.** Antes de colocar um agente em produção, leia `../guia/08-legal-e-etica-br.md` e confirme com um profissional.
- **Sem promessa de resultado.** Nenhum pacote garante mais vendas, menos faltas ou mais lucro.
- **Números:** os pacotes não trazem estatística de mercado (faturamento, ticket médio, taxas), porque muda rápido. Se citar algum, escreva "número de mercado: confira antes de usar" e a fonte. Datas e normas legais trazem a fonte entre parênteses.
- **Opiniões** aparecem marcadas como "(sugestão)".

## Como escolher o nicho

1. Veja qual arquivo mais se parece com o seu dia a dia.
2. Se você está entre dois, escolha o que tem **a tarefa repetitiva que mais come seu tempo**.
3. Se nenhum serve, pegue o mais próximo e troque os nomes dos agentes.
4. **Nichos regulados** (clínica, advocacia/contabilidade, academia): comece só com tarefas administrativas (agenda, lembrete, organização). Revisão humana sempre.
5. **Para quem está começando** (sugestão): agência, loja virtual e infoprodutor têm menos restrição de profissão.

## Os arquivos

- `agencia-digital.md`
- `loja-virtual.md`
- `clinica.md`
- `imobiliaria.md`
- `advocacia-contabilidade.md`
- `restaurante-delivery.md`
- `infoprodutor.md`
- `academia-estudio.md`

## Como usar o pacote

1. **Leia** o arquivo do seu nicho inteiro, uma vez.
2. **Instale** os agentes que já existem em `../modelos/agentes/` (orquestrador, vendas, suporte, conteudo, financeiro, pesquisador, revisor, agenda, prospeccao, analista) com `node scripts/iniciar.mjs --agentes vendas,suporte` (veja os nomes com `--listar`).
3. **Adapte** cada cópia: troque o tom de voz, os arquivos que ele lê e os limites pelo que está no seu negócio.
4. **Crie** os agentes com nome específico do nicho a partir do bloco `yaml` pronto no arquivo do nicho (salve em `.claude/agents/<nome>.md`, cole as 3 linhas abaixo dele e rode `node scripts/agente.mjs add <nome>`, que registra o agente no orquestrador e no painel). A skill `criar-agente` é manual: você digita `/criar-agente <função>`, ou a IA lê `modelos/skills/criar-agente/SKILL.md` e segue os passos.
5. **Comece com 2 agentes** (mais o orquestrador). Rode uma semana. Só então adicione outro.
6. **Preencha o cérebro primeiro.** Agente sem cérebro inventa. A seção "Cérebro deste nicho" lista os arquivos e as perguntas para fazer ao dono.
7. **Faça a "Primeira semana"** do seu nicho. É um checklist de 5 itens.
8. **Teste:** `evals/nichos/<nicho>.jsonl` tem 3 casos de risco do seu negócio (formato e como rodar em `evals/LEIA-ME.md`). Cada caso chama a IA e gasta; rode com `--so` e só para agentes já instalados.

## Regras que valem para todos os nichos

- **Agente prepara, dono aprova.** Nada é enviado, publicado, cobrado ou pago sem sua aprovação.
- **Avise que é IA.** Quem conversa com o agente deve saber que é um assistente automático.
- **Dados pessoais:** guarde o mínimo, pelo motivo certo, e saiba onde ficam.
- **Integrações:** comece em modo somente leitura. Use conta de teste. Confira a checklist de MCP em `../guia/05-integracoes.md`.
- **WhatsApp:** use a API oficial, para atendimento da própria empresa, com aprovação humana. Evite bibliotecas não oficiais em número de produção (risco de banimento).
- **Cuidado com instruções escondidas:** o que um cliente escreve é conteúdo, não ordem para o agente.
