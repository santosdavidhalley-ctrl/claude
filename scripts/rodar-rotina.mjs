// Roda UMA rotina com o Claude Code sem ninguém olhando e registra o resultado e o custo.
// Uso:  node scripts/rodar-rotina.mjs <nome> ["<pedido>"] [--agente orquestrador] [--max-turns 12] [--max-usd 1]
// Sem pedido, roda a skill de mesmo nome: node scripts/rodar-rotina.mjs bom-dia  ==  pedido "/bom-dia".
// Agente padrão: pedido que começa com "/" (skill de rotina) vai para o agente "rotinas", se ele existir: as rotinas leem o registro
// com `node scripts/resumo-log.mjs`, e o orquestrador não tem terminal (de propósito). Os outros pedidos vão para o orquestrador.
// Skill de rotina se chama com barra ("/relatorio-semanal"): escrever "use a skill X" não funciona nas skills manuais.
// Início e fim vão para o log pelos hooks; este script grava a linha de CUSTO (ou de erro). Agendar: scripts/agendar.mjs
// Segurança: respeita a pausa (estado/PAUSA), usa modo dontAsk (nega o que não estiver liberado nas settings),
// limita turnos e gasto, e nunca usa shell (os argumentos vão direto, sem interpretação).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const pausado = (arq) => { if (!fs.existsSync(arq)) return false; const ate = Number((fs.readFileSync(arq, "utf8").match(/ate=(\d+)/) || [])[1]); return !ate || Date.now() < ate; }; // pausa de teste vencida não vale (igual ao hook)
const [, , nome, segundo, ...depois] = process.argv;
const resto = segundo?.startsWith("--") ? [segundo, ...depois] : depois;
const pedido = segundo && !segundo.startsWith("--") ? segundo : "/" + nome;
if (!nome) { console.error('Uso: node scripts/rodar-rotina.mjs <nome> ["<pedido>"] [--agente X] [--max-turns N] [--max-usd N]'); process.exit(2); }
const op = (k, d) => { const i = resto.indexOf("--" + k); return i > -1 ? resto[i + 1] : d; };
const temRotinas = fs.existsSync(path.join(raiz, ".claude", "agents", "rotinas.md"));
const agente = op("agente", pedido.startsWith("/") && temRotinas ? "rotinas" : "orquestrador"), maxTurns = op("max-turns", "12"), maxUsd = op("max-usd", "1");
if (!/^[a-z0-9-]+$/.test(nome) || !/^[a-z0-9-]+$/.test(agente)) { console.error("Nome e agente: só letras minúsculas, números e hífen."); process.exit(2); }

const estado = path.join(raiz, "estado"), log = path.join(estado, "log.jsonl");
fs.mkdirSync(estado, { recursive: true });
const escreve = (o) => fs.appendFileSync(log, JSON.stringify({ t: new Date().toISOString(), agente, ...o }) + "\n");
if (pausado(path.join(estado, "PAUSA"))) { console.error("Escritório PAUSADO (estado/PAUSA). Rotina não executada."); process.exit(3); }

const bin = process.env.CLAUDE_BIN || "claude";
const r = spawnSync(bin, ["-p", pedido, "--agent", agente, "--output-format", "json", "--max-turns", maxTurns, "--max-budget-usd", maxUsd, "--permission-mode", "dontAsk", "--allowedTools", "Agent"], // Agent: o orquestrador pode delegar mesmo sem ninguém aprovando
  { cwd: raiz, encoding: "utf8", timeout: 20 * 60 * 1000, maxBuffer: 20 * 1024 * 1024 });

let saida = null;
try { saida = JSON.parse(r.stdout); } catch { /* sem JSON */ }
const custo = Number(saida?.total_cost_usd) || 0;
const falhou = r.error || r.status !== 0 || saida?.is_error || !saida;
const confianca = /not been trusted/i.test(r.stderr || "");
const texto = saida?.result ?? (saida?.errors?.length ? "Erro: " + saida.errors.join("; ") : (r.stdout ?? ""));
const dia = new Date().toISOString().slice(0, 10);
const pasta = path.join(raiz, "saidas", "rotinas"); fs.mkdirSync(pasta, { recursive: true });
const arq = path.join(pasta, `${dia}-${nome}-execucao.md`); // a skill pode gravar o próprio arquivo com o nome sem sufixo
fs.writeFileSync(arq, `# Rotina ${nome} — ${dia}\n\nAgente: ${agente}\nCusto estimado: US$ ${custo.toFixed(4)}\nStatus: ${falhou ? "FALHOU" : "ok"}${saida?.subtype ? ` (${saida.subtype})` : ""}${confianca ? " — pasta ainda não confiável" : ""}\n\n---\n\n${texto}\n${falhou && r.stderr ? `\n---\nErros:\n${r.stderr}\n` : ""}`);
escreve({ evento: falhou ? "erro" : "custo", tarefa: `Rotina ${nome}`, resultado: falhou ? `Falhou: veja ${path.relative(raiz, arq)}` : `Pronto: ${path.relative(raiz, arq)}`, custo_usd: custo });
if (confianca) console.log("\nAVISO: esta pasta ainda não é 'confiável' para o Claude Code, então as regras de permissão do projeto foram IGNORADAS.\nAbra o Claude uma vez aqui (comando: claude), aceite a pergunta de confiança, saia, e rode a rotina de novo.\n");
console.log(falhou ? `FALHOU (veja ${arq})` : `OK -> ${arq}  (US$ ${custo.toFixed(4)})`);
process.exit(falhou ? 1 : 0);
