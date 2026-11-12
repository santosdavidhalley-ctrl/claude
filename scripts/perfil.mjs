// Mostra e troca as travas extras DESTE COMPUTADOR. Elas ficam em .claude/settings.local.json, que não vai para o Git:
// a base (.claude/settings.json) é a mesma no app do Claude (nuvem) e no computador; o que só faz sentido no computador entra aqui.
// Uso (na raiz do escritório):
//   node scripts/perfil.mjs               mostra o que está ativo
//   node scripts/perfil.mjs computador    construção no computador: sandbox, não lê fora da pasta, sem git push pela IA
//   node scripts/perfil.mjs operacao      rotinas sem ninguém olhando: modo dontAsk e escrita só nas pastas permitidas
//   node scripts/perfil.mjs nuvem         tira as travas extras (fica só a base, igual ao app do Claude)
// Nunca apaga: o arquivo anterior vai para estado/removidos/settings/. Só vale depois de abrir o Claude Code de novo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const LOCAL = path.join(raiz, ".claude", "settings.local.json"), MOLDES = path.join(raiz, "modelos", "perfis");
const PERFIS = { computador: "construção no computador (sandbox, não lê fora da pasta, sem git push pela IA)", operacao: "rotinas sem ninguém olhando (dontAsk, escrita só nas pastas permitidas, sandbox)" };
const NA_NUVEM = process.env.CLAUDE_CODE_REMOTE === "true"; // sessão do app do Claude (nuvem)
const [cmd, ...resto] = process.argv.slice(2);
const forcar = resto.includes("--forcar");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const le = (arq) => { try { return JSON.parse(fs.readFileSync(arq, "utf8").replace(/^﻿/, "")); } catch { return undefined; } };
const molde = (nome) => le(path.join(MOLDES, `${nome}.local.json`));

function ativo() {
  if (!fs.existsSync(LOCAL)) return "nuvem";
  const atual = le(LOCAL);
  if (atual === undefined) return "ilegivel";
  return Object.keys(PERFIS).find((n) => igual(atual, molde(n))) || "personalizado";
}
function guarda() { // tira o arquivo atual do caminho sem apagar
  if (!fs.existsSync(LOCAL)) return null;
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  const dir = path.join(raiz, "estado", "removidos", "settings");
  fs.mkdirSync(dir, { recursive: true });
  const base = `settings.local.${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  let destino = path.join(dir, base + ".json");
  for (let i = 2; fs.existsSync(destino); i++) destino = path.join(dir, `${base}-${i}.json`); // duas trocas no mesmo segundo: nunca sobrescreve
  fs.renameSync(LOCAL, destino);
  return path.relative(raiz, destino);
}
function mostra() {
  const a = ativo();
  console.log(`\nBase (vale em todo lugar): .claude/settings.json`);
  console.log(a === "nuvem" ? "Travas extras deste computador: nenhuma (só a base, igual ao app do Claude)."
    : a === "ilegivel" ? "Travas extras: .claude/settings.local.json existe, mas não é um JSON válido. Corrija ou rode: node scripts/perfil.mjs nuvem"
    : a === "personalizado" ? "Travas extras: .claude/settings.local.json foi editado à mão (não é igual a nenhum molde de modelos/perfis/)."
    : `Travas extras deste computador: perfil "${a}" - ${PERFIS[a]}.`);
  if (NA_NUVEM) console.log("Você está no app do Claude (nuvem): aqui a sessão já roda numa máquina isolada e descartável; as travas extras são para o computador.");
  else if (a === "nuvem") console.log("No computador, ligue as travas extras: node scripts/perfil.mjs computador");
  console.log("");
}

if (!cmd) mostra();
else if (cmd === "nuvem") {
  const onde = guarda();
  console.log(onde ? `Travas extras desligadas. O arquivo anterior ficou em ${onde}.` : "Já estava só com a base.");
  console.log("Feche e abra o Claude Code para valer.");
} else if (Object.hasOwn(PERFIS, cmd)) {
  const novo = molde(cmd);
  if (novo === undefined) { console.error(`Não achei o molde modelos/perfis/${cmd}.local.json (ou ele não é um JSON válido).`); process.exit(1); }
  if (NA_NUVEM && !forcar) {
    console.error(`Você está no app do Claude (nuvem). O perfil "${cmd}" é para o computador: aqui ele impediria salvar o trabalho no GitHub e ler os arquivos que você anexa.\nNada foi alterado. (Se for mesmo o que quer: acrescente --forcar.)`);
    process.exit(2);
  }
  if (ativo() === cmd) { console.log(`O perfil "${cmd}" já estava ativo. Nada mudou.`); process.exit(0); }
  const onde = guarda();
  fs.mkdirSync(path.dirname(LOCAL), { recursive: true });
  fs.writeFileSync(LOCAL, JSON.stringify(novo, null, 2) + "\n");
  console.log(`Perfil "${cmd}" ligado em .claude/settings.local.json: ${PERFIS[cmd]}.`);
  if (onde) console.log(`O arquivo anterior ficou em ${onde}.`);
  console.log("Feche e abra o Claude Code para valer. Depois confira com /permissions e rode: node scripts/testar-travas.mjs");
} else {
  console.error("Uso: node scripts/perfil.mjs [computador | operacao | nuvem]");
  process.exit(2);
}
