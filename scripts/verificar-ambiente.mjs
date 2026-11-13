// Confere se o computador e a pasta estão prontos e acusa os tropeços mais comuns antes que eles aconteçam.
// Não instala nada e não altera nada (só grava e apaga um arquivo de teste para ver se a pasta aceita gravação).
// Uso:  node scripts/verificar-ambiente.mjs        Cada FALHA traz a saída; as soluções detalhadas estão em guia/11.
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const pausado = (arq) => { if (!fs.existsSync(arq)) return false; const ate = Number((fs.readFileSync(arq, "utf8").match(/ate=(\d+)/) || [])[1]); return !ate || Date.now() < ate; }; // pausa de teste vencida não vale (igual ao hook)
const linhas = [];
const reg = (nivel, nome, detalhe = "") => linhas.push({ nivel, nome, detalhe });
const roda = (c) => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"], timeout: 8000 }).toString().trim(); } catch { return null; } };
const versao = (s) => (String(s).match(/(\d+)\.(\d+)\.(\d+)/) || []).slice(1).map(Number);
const menor = (a, b) => { for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0); } return false; };

// 1. programas
const vn = versao(process.versions.node);
vn[0] >= 20 ? reg("OK", "Node.js", process.versions.node)
  : vn[0] >= 18 ? reg("AVISO", "Node.js", `${process.versions.node}: funciona, mas já não recebe atualização e o painel Pixel Agents pede 20+. Instale a versão LTS em https://nodejs.org`)
  : reg("FALHA", "Node.js", `${process.versions.node}: precisa de 20 ou mais novo. Instale a versão LTS em https://nodejs.org`);
const git = roda("git --version");
git ? reg("OK", "Git", git) : reg("FALHA", "Git", "não encontrado: instale em https://git-scm.com");
if (git) {
  const quem = roda("git config user.name"), email = roda("git config user.email");
  quem && email ? reg("OK", "Git sabe quem você é", `${quem} <${email}>`) : reg("AVISO", "Git sem nome/e-mail", 'o primeiro commit vai falhar: git config --global user.name "Seu Nome" e git config --global user.email voce@exemplo.com');
}
const cl = roda("claude --version");
if (!cl) reg("FALHA", "Claude Code", "não encontrado. Acabou de instalar? Feche e abra o terminal. Se continuar, veja passos/01 e guia/11");
else if (menor(versao(cl), [2, 1, 257])) reg("AVISO", "Claude Code", `${cl}: versão antiga, algumas travas do kit não funcionam. Atualize: claude update`);
else reg("OK", "Claude Code", cl);

// 2. conta e cobrança
if (process.env.ANTHROPIC_API_KEY) reg("AVISO", "ANTHROPIC_API_KEY definida", "o Claude Code vai usar a chave de API (cobra por uso) em vez da assinatura. Se não era a intenção: unset ANTHROPIC_API_KEY");
else reg("OK", "ANTHROPIC_API_KEY", "não definida (usa o login da assinatura)");

// 3. a pasta: lugar certo, sem sincronização, aceita gravação
const casa = os.homedir(), real = (() => { try { return fs.realpathSync(raiz); } catch { return raiz; } })();
if (real === casa || real === path.parse(real).root) reg("FALHA", "Pasta do escritório", "você está na pasta pessoal inteira (ou na raiz do disco): o Claude enxergaria tudo. Use uma pasta só para o escritório");
const arriscadas = [
  [/[\\/](Desktop|Mesa|Documents|Documentos)([\\/]|$)/i, "na Mesa ou em Documentos: no Mac elas costumam sincronizar com o iCloud (trava arquivo com o disco cheio) e pedem permissão de acesso"],
  [/[\\/](Downloads|Transferências)([\\/]|$)/i, "em Downloads: pasta protegida no Mac e fácil de apagar sem querer"],
  [/OneDrive|iCloud|Mobile Documents|Dropbox|Google ?Drive|My Drive|CloudStorage/i, "dentro de uma pasta sincronizada com a nuvem: a sincronização trava e duplica arquivos"],
];
for (const [re, motivo] of arriscadas) if (re.test(real)) reg("AVISO", "Lugar da pasta", `está ${motivo}. Recomendado: mover para ${path.join(casa, "escritorio-ia")} antes de começar`);
if (!fs.existsSync(path.join(raiz, "modelos")) && !fs.existsSync(path.join(raiz, "CLAUDE.md"))) reg("FALHA", "Pasta do kit", "não achei modelos/ aqui: rode na pasta que tem o COMECE-AQUI.md");
else reg("OK", "Pasta do kit", raiz);
try { if (fs.readdirSync(raiz).some((n) => fs.existsSync(path.join(raiz, n, "COMECE-AQUI.md")))) reg("AVISO", "Pasta dentro de pasta", "há outra cópia do kit aqui dentro (comum ao descompactar duas vezes). Trabalhe só numa"); } catch { /* sem leitura */ }
const teste = path.join(raiz, `.teste-gravacao-${process.pid}`);
try { fs.writeFileSync(teste, "ok"); fs.rmSync(teste); reg("OK", "A pasta aceita gravação"); }
catch (e) { reg("FALHA", "A pasta NÃO aceita gravação", `${e.code || e.message}: pasta protegida, sincronizada ou disco cheio. Mova o kit para ${path.join(casa, "escritorio-ia")}`); }

// 4. sistema
if (process.platform === "win32") reg("AVISO", "Windows nativo", "o isolamento de comandos (sandbox) não existe aqui e algumas travas valem menos. Recomendado: WSL2 (guia/07)");
const df = process.platform === "win32" ? null : roda(`df -Pk "${raiz}"`);
if (df) {
  const kb = Number(df.split("\n")[1]?.split(/\s+/)[3]);
  if (kb && kb < 500 * 1024) reg("FALHA", "Disco quase cheio", `${Math.round(kb / 1024)} MB livres: comandos vão falhar no meio. Libere espaço antes`);
  else if (kb && kb < 2 * 1024 * 1024) reg("AVISO", "Pouco espaço em disco", `${(kb / 1024 / 1024).toFixed(1)} GB livres`);
}

// 5. o escritório montado (depois do iniciar)
const montado = fs.existsSync(path.join(raiz, ".claude", "settings.json"));
for (const a of ["CLAUDE.md", ".claude/settings.json", ".claude/agents", ".claude/hooks", "cerebro", "estado/equipe.json", "estado/obra.json"]) {
  if (!fs.existsSync(path.join(raiz, a))) reg("AVISO", a, "ainda não existe (rode node scripts/iniciar.mjs)");
}
if (montado) {
  try { JSON.parse(fs.readFileSync(path.join(raiz, ".claude", "settings.json"), "utf8")); reg("OK", "settings.json válido"); }
  catch (e) { reg("FALHA", "settings.json", "JSON inválido (vírgula sobrando?): " + e.message); }
  const t = spawnSync(process.execPath, [path.join(raiz, "scripts", "testar-travas.mjs")], { encoding: "utf8", timeout: 60000 });
  t.status === 0 ? reg("OK", "Travas", "node scripts/testar-travas.mjs passou") : reg("FALHA", "Travas", "alguma trava não respondeu certo: rode node scripts/testar-travas.mjs e veja o FALHOU");
}
if (fs.existsSync(path.join(raiz, ".env"))) {
  const gi = fs.existsSync(path.join(raiz, ".gitignore")) ? fs.readFileSync(path.join(raiz, ".gitignore"), "utf8") : "";
  /(^|\r?\n)\.env(\r?\n|$)/.test(gi) ? reg("OK", ".env está no .gitignore") : reg("FALHA", ".env existe e NÃO está no .gitignore", "adicione '.env' ao .gitignore antes de qualquer commit");
}
if (pausado(path.join(raiz, "estado", "PAUSA"))) reg("AVISO", "Escritório PAUSADO", "você retoma no seu terminal: node scripts/pausar.mjs retomar");

const cor = { OK: "OK    ", AVISO: "AVISO ", FALHA: "FALHA " };
console.log("");
for (const l of linhas) console.log(`${cor[l.nivel]} ${l.nome}${l.detalhe ? "  -  " + l.detalhe : ""}`);
const f = linhas.filter((l) => l.nivel === "FALHA").length, a = linhas.filter((l) => l.nivel === "AVISO").length;
console.log(`\n${f} falha(s), ${a} aviso(s).${f ? " Corrija as FALHAS antes de seguir (soluções em guia/11-solucao-de-problemas.md)." : ""}\n`);
process.exit(f ? 1 : 0);
