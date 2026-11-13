// Gera eventos FALSOS em estado/log.jsonl para você ver o escritório visual funcionando.
// Uso (na raiz do projeto):  node scripts/gerar-eventos-teste.mjs
// Para parar: Ctrl+C. Todo evento sai marcado com "teste": true, e scripts/custo.mjs e scripts/resumo-log.mjs ignoram essas linhas:
// o gasto falso daqui nunca aparece como gasto real, então não precisa limpar o log (se quiser, apague as linhas que têm "teste":true).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode

const estado = path.resolve(process.env.ESTADO_DIR || path.join(RAIZ, "estado"));
fs.mkdirSync(estado, { recursive: true });
const log = path.join(estado, "log.jsonl");
let agentes = [];
try { agentes = JSON.parse(fs.readFileSync(path.join(estado, "equipe.json"), "utf8")).agentes.map((a) => a.id).filter((id) => id !== "orquestrador"); } catch { /* sem equipe */ }
if (!agentes.length) { console.error("Crie estado/equipe.json primeiro (veja modelos/estado/equipe.json)."); process.exit(1); }

const tarefas = ["Responder lead da loja X", "Montar proposta curta", "Resumir reunião", "Rascunhar post da semana", "Responder dúvida sobre prazo", "Atualizar planilha de contatos"];
const escreve = (o) => fs.appendFileSync(log, JSON.stringify({ t: new Date().toISOString(), ...o, teste: true }) + "\n"); // teste: true = linha falsa, ignorada pelos relatórios
const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
const rodada = () => {
  const ag = sorteia(agentes), tarefa = sorteia(tarefas);
  escreve({ agente: "orquestrador", evento: "inicio", tarefa: `Distribuir: ${tarefa}`, custo_usd: 0 });
  escreve({ agente: ag, evento: "inicio", tarefa, custo_usd: 0 });
  setTimeout(() => {
    escreve({ agente: ag, evento: Math.random() < 0.12 ? "erro" : "fim", tarefa, resultado: "Rascunho salvo em saidas/", custo_usd: Number((Math.random() * 0.04 + 0.002).toFixed(4)) });
    escreve({ agente: "orquestrador", evento: "fim", tarefa: `Distribuir: ${tarefa}`, resultado: "Entregue ao dono", custo_usd: 0.001 });
  }, 3500 + Math.random() * 3000);
};
console.log("Gerando eventos de teste... (Ctrl+C para parar)");
rodada();
setInterval(rodada, 6000);
