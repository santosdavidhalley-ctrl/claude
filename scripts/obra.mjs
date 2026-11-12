// Acompanha o andamento da obra (estado/obra.json) e registra cada etapa concluída.
// Uso:  node scripts/obra.mjs                                     onde a obra parou (comece TODA sessão por aqui)
//       node scripts/obra.mjs passou 3 --nota "vendas testado"    marca a etapa 3 (só depois de TESTAR) e anota no DIARIO.md
//       node scripts/obra.mjs passou 4 5 6 --commit               marca várias, anota e faz o commit no Git (se houver)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const arq = path.join(RAIZ, "estado", "obra.json"), diario = path.join(RAIZ, "DIARIO.md");
if (!fs.existsSync(arq)) { console.error("estado/obra.json não existe. Rode: node scripts/iniciar.mjs"); process.exit(1); }
const obra = JSON.parse(fs.readFileSync(arq, "utf8"));
const args = process.argv.slice(2), op = (k) => { const i = args.indexOf("--" + k); return i > -1 ? args[i + 1] : null; };
const hoje = new Date(), dataIso = hoje.toLocaleDateString("sv-SE"), dataBr = hoje.toLocaleDateString("pt-BR"); // data local, não UTC
const arquivoDaEtapa = (n) => { try { return fs.readdirSync(path.join(RAIZ, "passos")).find((f) => f.startsWith(String(n).padStart(2, "0") + "-")); } catch { return null; } };

if (args[0] === "passou") {
  const nums = args.slice(1).filter((a, i, l) => /^\d+$/.test(a) && l[i - 1] !== "--nota").map(Number);
  if (!nums.length) { console.error('Uso: node scripts/obra.mjs passou <n> [<n>...] [--nota "..."] [--commit]'); process.exit(2); }
  const marcadas = [], repetidas = [];
  for (const n of nums) {
    const e = obra.etapas.find((x) => x.n === n);
    if (!e) { console.error(`Etapa ${n} não existe.`); process.exit(1); }
    if (e.passou) repetidas.push(e); else { e.passou = true; e.feito_em = dataIso; marcadas.push(e); }
  }
  fs.writeFileSync(arq, JSON.stringify(obra, null, 2) + "\n");
  const nota = op("nota");
  // etapa já concluída só ganha linha nova se vier com --nota (reteste); sem nota, nada se repete no diário
  const registrar = [...marcadas.map((e) => [e, nota || "passou no teste da etapa"]), ...(nota ? repetidas.map((e) => [e, `reteste: ${nota}`]) : [])];
  if (registrar.length) {
    const antes = fs.existsSync(diario) ? fs.readFileSync(diario, "utf8") : "";
    fs.appendFileSync(diario, (antes && !antes.endsWith("\n") ? "\n" : "") + registrar.map(([e, n]) => `${dataBr} — etapa ${e.n} (${e.nome}) — ${n} — aprovado pelo dono`).join("\n") + "\n");
  }
  if (marcadas.length) console.log(`Marcada(s): ${marcadas.map((e) => e.n).join(", ")} · anotado no DIARIO.md`);
  if (repetidas.length) console.log(`Já estava(m) concluída(s): ${repetidas.map((e) => e.n).join(", ")}${nota ? " · reteste anotado" : ""}`);
  if (args.includes("--commit")) {
    if (!fs.existsSync(path.join(RAIZ, ".git"))) console.log("Sem Git nesta pasta: commit pulado (rode git init se quiser histórico).");
    else {
      try {
        execFileSync("git", ["add", "-A"], { cwd: RAIZ, stdio: "ignore" });
        execFileSync("git", ["commit", "-q", "-m", `Obra: etapa ${[...marcadas, ...repetidas].map((e) => `${e.n} (${e.nome})`).join(", ")}`], { cwd: RAIZ, stdio: "pipe" });
        console.log("Commit feito.");
      } catch (e) {
        const msg = String(e.stderr || "") + String(e.stdout || "") + String(e.message || "");
        console.log(/user\.(name|email)|identity|Please tell me who you are/i.test(msg) ? 'Commit não feito: o Git não sabe quem você é. Rode git config --global user.name "Seu Nome" e git config --global user.email voce@exemplo.com'
          : /nothing to commit|nada a submeter/i.test(msg) ? "Nada novo para o commit." : "Commit não feito: " + msg.trim().split("\n")[0]);
      }
    }
  }
}

const feitas = obra.etapas.filter((e) => e.passou).length;
console.log(`\nObra: ${feitas} de ${obra.etapas.length} etapas concluídas\n`);
for (const e of obra.etapas) console.log(`${e.passou ? "[x]" : "[ ]"} ${e.n}. ${e.nome}${e.feito_em ? `  (${e.feito_em})` : ""}`);
const prox = obra.etapas.find((e) => !e.passou);
console.log(prox ? `\nPróxima: etapa ${prox.n} — ${prox.nome}\n  Arquivo: passos/${arquivoDaEtapa(prox.n) || "?"}\n  Feito quando: ${prox.criterio}` : "\nObra concluída. Rotina de manutenção: guia/10-operacao-custos-e-incidentes.md.");
if (fs.existsSync(diario)) {
  const ult = fs.readFileSync(diario, "utf8").trim().split("\n").filter((l) => /^\d{2}\/\d{2}\/\d{4}/.test(l)).slice(-5);
  if (ult.length) console.log(`\nÚltimas anotações do DIARIO.md:\n  ${ult.join("\n  ")}`);
}
const entrevista = path.join(RAIZ, "estado", "entrevista.md");
console.log(fs.existsSync(entrevista) ? "\nEntrevista: estado/entrevista.md (leia antes das etapas 2 e 4).\n" : "\nEntrevista ainda não gravada em estado/entrevista.md.\n");
