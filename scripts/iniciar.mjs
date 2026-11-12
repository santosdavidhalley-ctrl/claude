// Monta a estrutura do escritório a partir de modelos/. NUNCA sobrescreve arquivo que já existe.
// Uso (na raiz do projeto, que é esta pasta):
//   node scripts/iniciar.mjs                              orquestrador + vendas + suporte + conteudo
//   node scripts/iniciar.mjs --agentes vendas,financeiro  escolhe os agentes (orquestrador sempre entra)
//   node scripts/iniciar.mjs --listar                     lista os agentes disponíveis
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const M = path.join(raiz, "modelos");
if (!fs.existsSync(M)) { console.error("Rode na raiz do kit (a pasta que tem modelos/)."); process.exit(1); }
const arg = (n) => { const i = process.argv.indexOf("--" + n); return i > -1 ? process.argv[i + 1] : null; };
const disponiveis = fs.readdirSync(path.join(M, "agentes")).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
if (process.argv.includes("--listar")) { console.log(disponiveis.join("\n")); process.exit(0); }

const escolhidos = [...new Set(["orquestrador", ...(arg("agentes") ? arg("agentes").split(",").map((s) => s.trim()) : ["vendas", "suporte", "conteudo"])])];
const invalidos = escolhidos.filter((a) => !disponiveis.includes(a));
if (invalidos.length) { console.error("Agente(s) inexistente(s): " + invalidos.join(", ") + "\nDisponíveis: " + disponiveis.join(", ")); process.exit(1); }

const feito = [], pulado = [];
function copia(de, para, transforma) {
  if (fs.existsSync(para)) { pulado.push(path.relative(raiz, para)); return; }
  fs.mkdirSync(path.dirname(para), { recursive: true });
  if (transforma) fs.writeFileSync(para, transforma(fs.readFileSync(de, "utf8"))); else fs.copyFileSync(de, para);
  feito.push(path.relative(raiz, para));
}
function copiaPasta(de, para) {
  for (const e of fs.readdirSync(de, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const a = path.join(de, e.name), b = path.join(para, e.name);
    if (e.isDirectory()) copiaPasta(a, b); else copia(a, b);
  }
}

// agentes (o orquestrador recebe a lista exata dos que existem)
const subs = escolhidos.filter((a) => a !== "orquestrador");
for (const a of escolhidos) {
  copia(path.join(M, "agentes", a + ".md"), path.join(raiz, ".claude", "agents", a + ".md"),
    a === "orquestrador" ? (t) => t.replace(/Agent\([^)]*\)/, `Agent(${subs.join(", ")})`) : null);
}
copiaPasta(path.join(M, "skills"), path.join(raiz, ".claude", "skills"));
copiaPasta(path.join(M, "hooks"), path.join(raiz, ".claude", "hooks"));
const settingsDestino = path.join(raiz, ".claude", "settings.json");
copia(path.join(M, "settings.json"), fs.existsSync(settingsDestino) ? path.join(raiz, ".claude", "settings.sugerido.json") : settingsDestino);
copia(path.join(M, "CLAUDE.md"), path.join(raiz, "CLAUDE.md"));
copiaPasta(path.join(M, "cerebro"), path.join(raiz, "cerebro"));
copia(path.join(M, "estado", "obra.json"), path.join(raiz, "estado", "obra.json"));
copia(path.join(M, "estado", "log.jsonl"), path.join(raiz, "estado", "log.jsonl"));

// equipe.json a partir dos agentes escolhidos
const equipeArq = path.join(raiz, "estado", "equipe.json");
if (!fs.existsSync(equipeArq)) {
  const resumo = (d) => { let s = d.split(/\.\s|\.$/)[0].replace(/\s*\([^)]*$/, ""); if (s.length > 60) s = s.slice(0, 60).replace(/\s+\S*$/, "").replace(/\s*\([^)]*$/, "").replace(/[,(]$/, "") + "…"; return s; };
  // nome com acento e função curta para o painel (agentes novos usam o começo da descrição)
  const PAINEL = { orquestrador: ["Orquestrador", "Recebe o pedido e distribui"], vendas: ["Vendas", "Responde leads e rascunha propostas"], suporte: ["Suporte", "Tira dúvidas pelo cérebro"], conteudo: ["Conteúdo", "Posts, legendas e e-mails"], financeiro: ["Financeiro", "Contas e relatórios"], pesquisador: ["Pesquisador", "Pesquisa na web com fontes"], revisor: ["Revisor", "Confere antes de sair"], agenda: ["Agenda", "Organiza compromissos"], prospeccao: ["Prospecção", "Listas e primeira mensagem"], analista: ["Analista", "Números e tendências"] };
  const cores = ["#3d66e6", "#12805c", "#9a6700", "#8a3ffc", "#c2410c", "#0e7490", "#be185d", "#4d7c0f"];
  const agentes = escolhidos.map((id, i) => {
    const t = fs.readFileSync(path.join(M, "agentes", id + ".md"), "utf8");
    const desc = (t.match(/^description:\s*(.+)$/m) || [, ""])[1].replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
    const [nome, funcao] = PAINEL[id] || [id.charAt(0).toUpperCase() + id.slice(1), resumo(desc)];
    return { id, nome, funcao, cor: cores[i % cores.length] };
  });
  fs.mkdirSync(path.dirname(equipeArq), { recursive: true });
  fs.writeFileSync(equipeArq, JSON.stringify({ agentes }, null, 2) + "\n");
  feito.push("estado/equipe.json");
}
fs.mkdirSync(path.join(raiz, "saidas"), { recursive: true });
fs.mkdirSync(path.join(raiz, "dados"), { recursive: true }); // planilhas e exportações que os agentes leem (fora do Git)
if (!fs.existsSync(path.join(raiz, "DIARIO.md"))) { fs.writeFileSync(path.join(raiz, "DIARIO.md"), "# Diário da obra\n\n_Formato: DD/MM/AAAA — etapa — o que mudou — quem aprovou_\n"); feito.push("DIARIO.md"); }

// .gitignore: segredos e arquivos de estado nunca vão para o Git
const gi = path.join(raiz, ".gitignore"), linhas = [".env", ".env.*", "!.env.example", "estado/log.jsonl", "estado/PAUSA", "estado/.pendente.json", "estado/agendador.log", "estado/arquivo/", "estado/removidos/", "saidas/", "dados/", "evals/resultados/", ".claude/settings.local.json", "node_modules/"];
const atual = fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "";
const falta = linhas.filter((l) => !atual.split(/\r?\n/).includes(l)); // aceita .gitignore com quebra de linha do Windows
if (falta.length) { fs.writeFileSync(gi, atual + (atual && !atual.endsWith("\n") ? "\n" : "") + falta.join("\n") + "\n"); feito.push(".gitignore (+" + falta.length + " linhas)"); }

console.log(`\nCriado (${feito.length}):\n  ` + (feito.join("\n  ") || "nada"));
if (pulado.length) console.log(`\nJá existia, NÃO mexi (${pulado.length}):\n  ` + pulado.join("\n  "));
console.log(`\nAgentes: ${escolhidos.join(", ")}\n\nPróximos passos:\n  1. node scripts/verificar-ambiente.mjs\n  2. node scripts/obra.mjs\n  3. git init (se ainda não fez) e abra o Claude nesta pasta: claude\n`);
