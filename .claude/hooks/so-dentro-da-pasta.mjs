// Hook PreToolUse (Write|Edit): só deixa escrever nas pastas permitidas. Saída 2 = nega.
// Limite honesto: este hook só enxerga Write e Edit. Escrita feita por Bash (echo > arquivo) NÃO passa aqui:
// por isso o perfil de operação também nega comandos de escrita por regra e liga o sandbox.
import fs from "node:fs";
import path from "node:path";

const raiz = fs.realpathSync(process.env.CLAUDE_PROJECT_DIR || process.cwd());
// Ajuste esta lista ao seu escritório. Caminhos relativos à raiz do projeto.
const PERMITIDOS = ["saidas", "estado", "cerebro/memoria/propostas.md", "DIARIO.md"];

let entrada = "";
process.stdin.on("data", (d) => (entrada += d));
process.stdin.on("end", () => {
  let alvo = "";
  try { alvo = JSON.parse(entrada).tool_input?.file_path ?? ""; } catch { process.exit(0); }
  if (!alvo) process.exit(0);
  // resolve .. e links simbólicos: acha o ancestral que já existe e reaplica o resto do caminho
  const completo = path.resolve(alvo);
  let existente = path.dirname(completo);
  while (!fs.existsSync(existente) && existente !== path.dirname(existente)) existente = path.dirname(existente);
  const real = path.join(fs.realpathSync(existente), path.relative(existente, completo));
  const ok = PERMITIDOS.some((p) => {
    const base = path.join(raiz, p);
    return real === base || real.startsWith(base + path.sep);
  });
  if (!ok) {
    console.error(`BLOQUEADO: escrita fora das pastas permitidas (${PERMITIDOS.join(", ")}): ${alvo}`);
    process.exit(2);
  }
  process.exit(0);
});
