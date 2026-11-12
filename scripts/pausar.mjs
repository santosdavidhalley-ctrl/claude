// PAUSA TUDO: cria estado/PAUSA. O hook de pausa (.claude/hooks/pausa.mjs) passa a negar toda ferramenta.
// Uso:  node scripts/pausar.mjs          (pausa)
//       node scripts/pausar.mjs retomar  (volta a funcionar)
//       node scripts/pausar.mjs --teste 30  (pausa que acaba sozinha em 30 s: para a IA testar a pausa sem se trancar)
// Retomar a pausa de verdade é sempre o DONO, no terminal dele: a IA pausada não consegue rodar comando nenhum.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const estado = path.resolve(process.env.ESTADO_DIR || path.join(RAIZ, "estado"));
const marca = path.join(estado, "PAUSA");
fs.mkdirSync(estado, { recursive: true });
if (process.argv[2] === "retomar") { fs.rmSync(marca, { force: true }); console.log("Escritório RETOMADO."); }
else if (process.argv[2] === "--teste") {
  const s = Math.min(300, Math.max(5, Number(process.argv[3]) || 30));
  fs.writeFileSync(marca, `pausa de teste em ${new Date().toISOString()}\nate=${Date.now() + s * 1000}\n`);
  console.log(`Pausa de TESTE por ${s} s em ${marca}. Peça qualquer ferramenta agora: tem de ser negada. Depois disso volta sozinha.`);
} else { fs.writeFileSync(marca, `pausado em ${new Date().toISOString()}\n`); console.log(`Escritório PAUSADO (${marca}). Nenhum agente consegue usar ferramentas até você rodar, no seu terminal: node scripts/pausar.mjs retomar`); }
