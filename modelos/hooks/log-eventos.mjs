// Hook de REGISTRO: escreve uma linha em estado/log.jsonl a cada evento importante.
// É isso que alimenta o escritório visual. NUNCA bloqueia nada (sempre sai com 0).
// Eventos usados: UserPromptSubmit, PreToolUse (ferramenta Agent), SubagentStop, Stop.
// Observação honesta: o custo em dólares NÃO chega aos hooks. Para custo, use /usage (sessão) ou
// scripts/rodar-rotina.mjs (rotinas), que grava o custo informado pelo `claude -p`.
import fs from "node:fs";
import path from "node:path";

const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const estado = path.join(raiz, "estado");
const log = path.join(estado, "log.jsonl");
const pend = path.join(estado, ".pendente.json");
// esconde chaves coladas por engano antes de gravar (sk-..., AKIA..., ghp_..., xox...)
const limpa = (s) => String(s ?? "").replace(/\b(sk-[\w-]{6})[\w-]+/g, "$1***").replace(/\b(AKIA|ghp_|gho_|xox[abp]-)[\w-]{8,}/g, "$1***");
const corta = (s, n = 140) => limpa(s).replace(/\s+/g, " ").trim().slice(0, n);

let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  try {
    const e = JSON.parse(entrada || "{}");
    fs.mkdirSync(estado, { recursive: true });
    const escreve = (o) => fs.appendFileSync(log, JSON.stringify({ t: new Date().toISOString(), custo_usd: 0, ...o }) + "\n");
    const quem = e.agent_type || "orquestrador";
    const lePend = () => { try { return JSON.parse(fs.readFileSync(pend, "utf8")); } catch { return {}; } };

    switch (e.hook_event_name) {
      case "UserPromptSubmit":
        // quando um agente chamado em segundo plano termina, o aviso chega como um "pedido" novo: registra em português, sem o texto técnico
        escreve({ agente: quem, evento: "inicio", tarefa: /^\s*<task-notification>/.test(e.prompt || "") ? "Conferir o resultado de um agente" : corta(e.prompt) });
        break;
      case "PreToolUse": {
        // Antes de delegar a um subagente, guarda a descrição da tarefa para o registro do início/fim dele.
        if (e.tool_name === "Agent" || e.tool_name === "Task") {
          const ti = e.tool_input || {};
          const alvo = ti.subagent_type || ti.agent || ti.name;
          if (alvo) { const p = lePend(); p[alvo] = corta(ti.description || ti.prompt); fs.writeFileSync(pend, JSON.stringify(p)); escreve({ agente: alvo, evento: "inicio", tarefa: p[alvo] }); }
        }
        break;
      }
      case "SubagentStop": {
        const p = lePend();
        escreve({ agente: e.agent_type || "subagente", evento: "fim", tarefa: p[e.agent_type] || "", resultado: corta(e.last_assistant_message) });
        break;
      }
      case "Stop":
        escreve({ agente: quem, evento: "fim", resultado: corta(e.last_assistant_message) });
        break;
      default:
    }
  } catch { /* o registro nunca pode atrapalhar o trabalho */ }
  process.exit(0);
});
