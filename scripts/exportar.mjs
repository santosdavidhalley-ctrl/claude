// Converte o escritório (agentes e skills de .claude/) para o formato de outra ferramenta de IA. Nunca sobrescreve.
// Uso (na raiz do escritório, depois do iniciar):
//   node scripts/exportar.mjs codex          .agents/skills + .codex/agents/*.toml
//   node scripts/exportar.mjs antigravity    .agents/skills + .agents/agents/*.md
//   node scripts/exportar.mjs opencode       .opencode/agents/*.md (as skills ele já lê de .claude/skills)
//   node scripts/exportar.mjs gemini         .gemini/skills + .gemini/agents/*.md + .gemini/settings.json
//   node scripts/exportar.mjs cursor         nada a converter: o Cursor lê .claude/agents, .claude/skills e o AGENTS.md
// Formatos conferidos nas documentações oficiais em 28/10/2026 (guia/15-outras-ias.md, seção 4), sem teste em cada ferramenta.
// As TRAVAS (hooks, permissões, sandbox) não são convertidas: monte o equivalente na ferramenta e teste como na etapa 7.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const [, , alvo, ...resto] = process.argv;
const forcar = resto.includes("--forcar");
const ALVOS = ["codex", "antigravity", "opencode", "gemini", "cursor"];
if (!ALVOS.includes(alvo)) { console.error(`Uso: node scripts/exportar.mjs <${ALVOS.join("|")}> [--forcar]`); process.exit(2); }

const origemAgentes = [path.join(raiz, ".claude", "agents"), path.join(raiz, "modelos", "agentes")].find((d) => fs.existsSync(d));
const origemSkills = [path.join(raiz, ".claude", "skills"), path.join(raiz, "modelos", "skills")].find((d) => fs.existsSync(d));
if (!origemAgentes) { console.error("Não achei agentes. Rode antes: node scripts/iniciar.mjs"); process.exit(1); }
const feito = [], pulado = [];
const grava = (arq, texto) => {
  if (fs.existsSync(arq) && !forcar) { pulado.push(path.relative(raiz, arq)); return; }
  fs.mkdirSync(path.dirname(arq), { recursive: true }); fs.writeFileSync(arq, texto); feito.push(path.relative(raiz, arq));
};
const copiaPasta = (de, para) => {
  for (const e of fs.readdirSync(de, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const a = path.join(de, e.name), b = path.join(para, e.name);
    if (e.isDirectory()) copiaPasta(a, b); else grava(b, fs.readFileSync(a));
  }
};

// lê um agente: campos do cabeçalho + instruções (sem a seção de skills, que é do Claude Code)
const agentes = fs.readdirSync(origemAgentes).filter((f) => f.endsWith(".md")).map((f) => {
  const t = fs.readFileSync(path.join(origemAgentes, f), "utf8");
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const campo = (k) => ((m?.[1] || "").match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1]?.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"') || "";
  return { id: f.replace(/\.md$/, ""), descricao: campo("description"), corpo: (m?.[2] || t).trim() };
});
const yaml = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const toml = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const tomlLongo = (s) => (s.includes("'''") ? `"""\n${s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"""')}\n"""` : `'''\n${s}\n'''`);
const md = (a, extra = "") => `---\nname: ${a.id}\ndescription: ${yaml(a.descricao)}\n${extra}---\n\n${a.corpo}\n`;

if (alvo === "codex") {
  if (origemSkills) copiaPasta(origemSkills, path.join(raiz, ".agents", "skills"));
  for (const a of agentes) grava(path.join(raiz, ".codex", "agents", `${a.id}.toml`), `name = ${toml(a.id)}\ndescription = ${toml(a.descricao)}\ndeveloper_instructions = ${tomlLongo(a.corpo)}\n`);
} else if (alvo === "antigravity") {
  if (origemSkills) copiaPasta(origemSkills, path.join(raiz, ".agents", "skills"));
  for (const a of agentes) grava(path.join(raiz, ".agents", "agents", `${a.id}.md`), md(a));
} else if (alvo === "opencode") {
  for (const a of agentes) grava(path.join(raiz, ".opencode", "agents", `${a.id}.md`), `---\ndescription: ${yaml(a.descricao)}\nmode: ${a.id === "orquestrador" ? "primary" : "subagent"}\n---\n\n${a.corpo}\n`);
} else if (alvo === "gemini") {
  if (origemSkills) copiaPasta(origemSkills, path.join(raiz, ".gemini", "skills"));
  for (const a of agentes) grava(path.join(raiz, ".gemini", "agents", `${a.id}.md`), md(a));
  grava(path.join(raiz, ".gemini", "settings.json"), JSON.stringify({ context: { fileName: ["AGENTS.md", "CLAUDE.md"] } }, null, 2) + "\n");
}

const comando = { codex: "codex exec", antigravity: "agy -p", opencode: "opencode run", gemini: "gemini -p", cursor: "(sem modo agendado documentado)" }[alvo];
console.log(`\n${alvo}: ${feito.length} arquivo(s) criado(s)${pulado.length ? `, ${pulado.length} já existia(m) (use --forcar para sobrescrever)` : ""}.`);
if (alvo === "cursor") console.log("O Cursor lê .claude/agents, .claude/skills e o AGENTS.md direto: nada a converter.");
console.log(`\nFalta, e é com você (guia/15-outras-ias.md, seção 4):
- Travas: hooks, permissões e sandbox são do Claude Code. Monte o equivalente no ${alvo} e teste os mesmos casos de scripts/testar-travas.mjs.
- Ferramentas de cada agente: configure pelo jeito do ${alvo} (os campos tools/model do Claude Code ficaram de fora).
- Rotinas: troque "claude -p" por "${comando}", ou use runner/escritorio-api.mjs.
- Depois de mudar um agente em .claude/agents, rode de novo com --forcar.\n`);
