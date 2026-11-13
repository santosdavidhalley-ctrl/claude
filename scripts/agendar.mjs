// Gera o agendamento de UMA rotina para o seu sistema (Mac, Linux ou Windows), com os caminhos certos desta máquina.
// Não instala nada: só imprime o texto e os comandos, para você (ou o Claude, com o seu OK) aplicar.
// Uso (na raiz do escritório):
//   node scripts/agendar.mjs bom-dia "/bom-dia" --hora 9:07                          (dias úteis é o padrão)
//   node scripts/agendar.mjs relatorio-semanal "/relatorio-semanal" --hora 17:07 --dias sex --max-usd 1
//   node scripts/agendar.mjs ideias "3 ideias de post para amanhã" --hora 8:13 --motor api --agente conteudo --provedor groq
// --dias: uteis (seg a sex), todos, ou lista como seg,qua,sex.  --motor: claude (padrão, usa rodar-rotina) ou api (outra IA).
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const [, , nome, pedido, ...resto] = process.argv;
const op = (k, d) => { const i = resto.indexOf("--" + k); return i > -1 ? resto[i + 1] : d; };
if (!nome || !pedido || !/^[a-z0-9-]+$/.test(nome)) { console.error('Uso: node scripts/agendar.mjs <nome> "<pedido>" --hora 9:07 [--dias uteis|todos|seg,qua] [--max-usd 0.5] [--motor api --agente X --provedor Y]'); process.exit(2); }
const [hh, mm] = op("hora", "9:07").split(":").map(Number);
if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) { console.error("Hora inválida. Use HH:MM, por exemplo 9:07 (evite hora redonda)."); process.exit(2); }
const NOMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"], diasOp = op("dias", "uteis");
const dias = diasOp === "uteis" ? [1, 2, 3, 4, 5] : diasOp === "todos" ? [0, 1, 2, 3, 4, 5, 6] : diasOp.split(",").map((d) => NOMES.indexOf(d.trim().slice(0, 3)));
if (!dias.length || dias.some((d) => d < 0)) { console.error("Dias inválidos. Use uteis, todos ou uma lista como seg,qua,sex."); process.exit(2); }

const motor = op("motor", "claude"), agente = op("agente", null), provedor = op("provedor", null);
let args;
if (motor === "api") {
  if (!agente || !provedor) { console.error("Com --motor api, informe --agente e --provedor (lista: node runner/escritorio-api.mjs --provedores)."); process.exit(2); }
  args = [path.join("runner", "escritorio-api.mjs"), agente, pedido, "--provedor", provedor];
} else {
  args = [path.join("scripts", "rodar-rotina.mjs"), nome, pedido, "--max-usd", op("max-usd", "0.5"), ...(agente ? ["--agente", agente] : [])];
}
const acha = (bin) => { try { return execFileSync(process.platform === "win32" ? "where" : "which", [bin], { encoding: "utf8", timeout: 5000 }).split(/\r?\n/)[0].trim() || null; } catch { return null; } };
// node pelo PATH (link estável, sobrevive a atualização); process.execPath aponta para a pasta da versão
const node = acha("node") || process.execPath, claude = motor === "claude" ? process.env.CLAUDE_BIN || acha("claude") : null;
if (motor === "claude" && !claude) { console.error("Não achei o comando claude. Instale o Claude Code ou defina CLAUDE_BIN com o caminho completo."); process.exit(2); }
const log = path.join(raiz, "estado", "agendador.log"), rotulo = `com.escritorio.${nome}`;
const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const quando = `${diasOp === "todos" ? "todos os dias" : dias.map((d) => NOMES[d]).join(", ")} às ${hh}:${String(mm).padStart(2, "0")}`;

console.log(`\nRotina "${nome}" (${quando}). Teste à mão primeiro, no terminal, nesta pasta:\n  node ${args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" ")}\n`);
if (process.platform === "darwin") {
  const caminhoPath = [...new Set([path.dirname(node), claude && path.dirname(claude), "/usr/bin", "/bin", "/usr/sbin", "/sbin"].filter(Boolean))].join(":");
  const intervalo = dias.length === 7 ? `<dict><key>Hour</key><integer>${hh}</integer><key>Minute</key><integer>${mm}</integer></dict>`
    : `<array>\n${dias.map((d) => `    <dict><key>Weekday</key><integer>${d}</integer><key>Hour</key><integer>${hh}</integer><key>Minute</key><integer>${mm}</integer></dict>`).join("\n")}\n  </array>`;
  const arq = `~/Library/LaunchAgents/${rotulo}.plist`;
  console.log(`MAC (launchd). Salve este texto em ${arq}:\n`);
  console.log(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${rotulo}</string>
  <key>WorkingDirectory</key><string>${xml(raiz)}</string>
  <key>ProgramArguments</key>
  <array>
${[node, ...args].map((a) => `    <string>${xml(a)}</string>`).join("\n")}
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>${xml(caminhoPath)}</string>${claude ? `\n    <key>CLAUDE_BIN</key><string>${xml(claude)}</string>` : ""}
  </dict>
  <key>StartCalendarInterval</key>
  ${intervalo}
  <key>StandardOutPath</key><string>${xml(log)}</string>
  <key>StandardErrorPath</key><string>${xml(log)}</string>
</dict>
</plist>`);
  console.log(`\nLigar:   launchctl bootstrap gui/$(id -u) ${arq}\nTestar:  launchctl kickstart gui/$(id -u)/${rotulo}\nDesligar: launchctl bootout gui/$(id -u)/${rotulo}   (e apague o arquivo .plist)`);
} else if (process.platform === "win32") {
  const semana = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const sc = dias.length === 7 ? "/SC DAILY" : `/SC WEEKLY /D ${dias.map((d) => semana[d]).join(",")}`;
  const cmd = `cmd /c cd /d \\"${raiz}\\" && \\"${node}\\" ${args.map((a) => (/\s|"/.test(a) ? `\\"${a}\\"` : a)).join(" ")} >> estado\\agendador.log 2>&1`;
  console.log(`WINDOWS (Agendador de Tarefas). No PowerShell:\n\nschtasks /Create ${sc} /ST ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} /TN "EscritorioIA-${nome}" /TR "${cmd}"`);
  console.log(`\nTestar:   schtasks /Run /TN "EscritorioIA-${nome}"\nDesligar: schtasks /Delete /TN "EscritorioIA-${nome}" /F${claude ? `\nSe o claude não for achado na hora agendada, defina CLAUDE_BIN=${claude} nas variáveis de ambiente do Windows.` : ""}\nNota: no Windows sem WSL2 as travas de terminal do kit valem menos (veja guia/07). O autor do kit não testou o agendamento no Windows.`);
} else {
  const dow = dias.length === 7 ? "*" : dias.join(",");
  console.log(`LINUX (cron). Rode "crontab -e" e cole esta linha:\n\n${mm} ${hh} * * ${dow} cd ${q(raiz)} && ${claude ? `CLAUDE_BIN=${q(claude)} ` : ""}${q(node)} ${args.map(q).join(" ")} >> ${q(log)} 2>&1`);
  console.log(`\nDesligar: "crontab -e" e apague a linha.`);
}
console.log(`\nAntes de confiar:
- O computador precisa estar ligado e acordado na hora. Confira ${path.relative(raiz, log)} nos primeiros dias.`);
if (motor === "claude") console.log(`- A rotina usa o login do Claude Code desta máquina. Login expirado = rotina falha: gere um token de 1 ano com "claude setup-token" e coloque CLAUDE_CODE_OAUTH_TOKEN nas variáveis do agendamento (o token é segredo: só neste arquivo, nunca no projeto).
- Se ANTHROPIC_API_KEY existir no ambiente, o claude -p usa a chave e cobra por uso, em vez da assinatura.`);
else console.log(`- A chave do provedor (ex.: GROQ_API_KEY) precisa estar nas variáveis do agendamento: o agendador não lê o seu terminal. Ollama não precisa de chave, mas precisa estar aberto.`);
console.log(`- Comece com UMA rotina e observe uma semana (${os.platform() === "darwin" ? "Mac" : os.platform()}).\n`);
