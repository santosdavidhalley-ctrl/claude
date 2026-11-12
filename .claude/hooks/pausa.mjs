// Hook PreToolUse (todas as ferramentas): se existir estado/PAUSA, NEGA tudo. É o botão de emergência.
// Código de saída 2 = negar; a mensagem em stderr volta para o Claude.
// Pausa de TESTE (node scripts/pausar.mjs --teste 30): o arquivo traz "ate=<horário>" e a pausa vale só até lá.
import fs from "node:fs";
import path from "node:path";
const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const marca = path.join(raiz, "estado", "PAUSA");
if (fs.existsSync(marca)) {
  const ate = Number((fs.readFileSync(marca, "utf8").match(/ate=(\d+)/) || [])[1]);
  if (!ate || Date.now() < ate) {
    console.error("ESCRITÓRIO PAUSADO pelo dono (estado/PAUSA). Não use nenhuma ferramenta. Avise o dono e aguarde: só ele retoma, no terminal dele.");
    process.exit(2);
  }
}
process.exit(0);
