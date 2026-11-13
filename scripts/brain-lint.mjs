// Confere a saúde do cérebro (cerebro/**/*.md): arquivos grandes demais, campos em branco, datas velhas, segredos.
// Uso:  node scripts/brain-lint.mjs
// Sai com código 1 se achar ERRO (segredo ou arquivo gigante). AVISO não derruba.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode

const base = path.join(RAIZ, "cerebro");
if (!fs.existsSync(base)) { console.error("Pasta cerebro/ não existe. Rode: node scripts/iniciar.mjs"); process.exit(1); }
const LIMITE = Number(process.env.LIMITE_CHARS || 8000), DIAS = Number(process.env.DIAS_REVISAO || 90);
const SEGREDOS = [/sk-ant-[A-Za-z0-9_-]{10,}/, /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /(senha|password|token|api[_-]?key)\s*[:=]\s*(?!trocar|mudar|definir|ver |no |na |em )\S{6,}/i];
const achados = [];
function varre(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { varre(p); continue; }
    if (!e.name.endsWith(".md")) continue;
    const rel = path.relative(RAIZ, p), t = fs.readFileSync(p, "utf8");
    if (t.length > LIMITE) achados.push(["ERRO", rel, `${t.length} caracteres (limite ${LIMITE}): divida em arquivos menores`]);
    for (const r of SEGREDOS) if (r.test(t)) { achados.push(["ERRO", rel, "parece conter segredo (chave/senha/token): remova e troque a chave"]); break; }
    // campo vazio: "- **Nome:**" sem nada depois, "__", item "-" sozinho, ou marcador; ignora as linhas que explicam o formato
    const util = t.split("\n").filter((l) => !/formato|exemplo|_Formato/i.test(l)).join("\n");
    const vazios = (util.match(/\*\*[^*\n]+:\*\*[ \t]*$/gm) || []).length + (util.match(/__+/g) || []).length + (util.match(/^\s*-\s*$/gm) || []).length + (util.match(/\{\{|a confirmar|preencher/gi) || []).length;
    if (vazios && !/LEIA-ME/.test(e.name)) achados.push(["AVISO", rel, `${vazios} campo(s) em branco ou marcador ({{ }}, a confirmar, "- **Campo:**" vazio)`]);
    const m = t.match(/[Úú]ltima revis[ãa]o:\s*(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) { const d = new Date(`${m[3]}-${m[2]}-${m[1]}`), idade = (Date.now() - d.getTime()) / 864e5; if (idade > DIAS) achados.push(["AVISO", rel, `última revisão há ${Math.round(idade)} dias (limite ${DIAS})`]); }
    else if (!/memoria[\\/]/.test(rel) && !/agentes[\\/]/.test(rel) && !/LEIA-ME/.test(e.name)) achados.push(["AVISO", rel, "sem linha 'Última revisão: DD/MM/AAAA'"]);
  }
}
varre(base);
console.log("");
for (const [n, r, d] of achados) console.log(`${n.padEnd(6)} ${r}  -  ${d}`);
const erros = achados.filter((a) => a[0] === "ERRO").length;
console.log(`\n${erros} erro(s), ${achados.length - erros} aviso(s).\n`);
process.exit(erros ? 1 : 0);
