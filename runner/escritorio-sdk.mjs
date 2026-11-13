// EXEMPLO AVANÇADO: rodar o escritório como programa seu com o Claude Agent SDK (TypeScript/JavaScript).
// Adaptado dos exemplos da documentação oficial (https://code.claude.com/docs/en/agent-sdk/quickstart e /subagents).
// NÃO foi executado pelo autor do kit: teste primeiro numa pasta de teste, com limite de gasto baixo.
//
// Instalar (na raiz do projeto):   npm init -y && npm pkg set type=module && npm install @anthropic-ai/claude-agent-sdk
// Autenticar:  export ANTHROPIC_API_KEY=...   (a documentação manda usar CHAVE DE API com o SDK, não o login da assinatura)
// Rodar:       node runner/escritorio-sdk.mjs "Responda o lead da loja X"
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs";
import path from "node:path";

const pedido = process.argv.slice(2).join(" ");
if (!pedido) { console.error('Uso: node runner/escritorio-sdk.mjs "<pedido>"'); process.exit(2); }
if (fs.existsSync(path.join(process.cwd(), "estado", "PAUSA"))) { console.error("Escritório PAUSADO."); process.exit(3); }

const log = path.join(process.cwd(), "estado", "log.jsonl");
const escreve = (o) => fs.appendFileSync(log, JSON.stringify({ t: new Date().toISOString(), ...o }) + "\n");
const ler = (f) => fs.readFileSync(path.join(process.cwd(), f), "utf8");

// Os agentes podem vir dos arquivos .claude/agents/ (o SDK também lê essa pasta) ou ser definidos aqui.
// Definições passadas em `agents` têm prioridade sobre arquivos com o mesmo nome (conforme a documentação).
const agents = {
  suporte: {
    description: "Responde dúvidas de clientes só com o que está no cérebro.",
    prompt: ler(".claude/agents/suporte.md").replace(/^---[\s\S]*?---\s*/, ""),
    tools: ["Read", "Grep", "Glob"],
    model: "haiku",
  },
};

escreve({ agente: "orquestrador", evento: "inicio", tarefa: pedido.slice(0, 140), custo_usd: 0 });
let custo = 0, resultado = "";
try {
  for await (const msg of query({
    prompt: pedido,
    options: {
      allowedTools: ["Read", "Grep", "Glob", "Agent"], // só leitura + chamar agentes
      permissionMode: "dontAsk",                        // o que não estiver liberado é negado
      agents,
      maxTurns: 12,
      maxBudgetUsd: 1,                                  // teto de gasto desta consulta
    },
  })) {
    if (msg.type === "result") { custo = Number(msg.total_cost_usd ?? msg.totalCostUsd) || 0; resultado = msg.result ?? ""; }
  }
  escreve({ agente: "orquestrador", evento: "fim", tarefa: pedido.slice(0, 140), resultado: String(resultado).slice(0, 140), custo_usd: custo });
  console.log(resultado);
} catch (e) {
  escreve({ agente: "orquestrador", evento: "erro", tarefa: pedido.slice(0, 140), resultado: String(e.message).slice(0, 140), custo_usd: custo });
  console.error("Erro:", e.message); process.exit(1);
}
