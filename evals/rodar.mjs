// Roda casos de teste (JSONL) contra um agente com `claude -p` e confere a resposta por regras simples.
// Uso:  node evals/rodar.mjs evals/casos-basicos.jsonl [--agente vendas] [--max-usd 0.5] [--max-total-usd 2] [--so id1,id2]
// --max-usd é o teto de CADA caso; --max-total-usd para a rodada quando o gasto somado passa do valor (padrão 2).
// Os agentes rodam em MODO TESTE: respondem só no texto, sem gravar em saidas/, cerebro/ nem no log de trabalho.
// Cada linha do JSONL: {"id":"vendas-preco","agente":"vendas","entrada":"...","deve_conter":["regex"],"nao_deve_conter":["regex"]}
// ATENÇÃO: cada caso chama o Claude de verdade e GASTA (centavos). Rode poucos casos e olhe o custo no fim. Guia: evals/LEIA-ME.md
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const pausado = (arq) => { if (!fs.existsSync(arq)) return false; const ate = Number((fs.readFileSync(arq, "utf8").match(/ate=(\d+)/) || [])[1]); return !ate || Date.now() < ate; }; // pausa de teste vencida não vale (igual ao hook)
const [, , arquivo, ...resto] = process.argv;
if (!arquivo) { console.error("Uso: node evals/rodar.mjs <casos.jsonl> [--agente X] [--max-usd N] [--max-total-usd N] [--so id1,id2]"); process.exit(2); }
const op = (k, d) => { const i = resto.indexOf("--" + k); return i > -1 ? resto[i + 1] : d; };
const forcaAgente = op("agente", null), maxUsd = op("max-usd", "0.5"), maxTotal = Number(op("max-total-usd", "2")), so = op("so", null)?.split(",");
if (pausado(path.join(raiz, "estado", "PAUSA"))) { console.error("Escritório PAUSADO. Teste não executado."); process.exit(3); }

const casos = fs.readFileSync(arquivo, "utf8").split("\n").map((l, i) => [l.trim(), i + 1]).filter(([l]) => l && !l.startsWith("//"))
  .map(([l, n]) => { try { return JSON.parse(l); } catch { console.error(`Linha ${n} do JSONL é inválida.`); process.exit(2); } })
  .filter((c) => !so || so.includes(c.id));
const MODO_TESTE = "MODO TESTE: isto é um teste automático. Responda só no texto da resposta. Não crie, não altere e não apague arquivos (saidas/, cerebro/, estado/). Diga o que faria em vez de fazer.";
const bin = process.env.CLAUDE_BIN || "claude";
const resultados = []; let custoTotal = 0, avisouConfianca = false;

for (const c of casos) {
  const agente = forcaAgente || c.agente || "orquestrador";
  if (!/^[a-z0-9-]+$/.test(agente)) { console.error("Nome de agente inválido: " + agente); process.exit(2); }
  if (custoTotal >= maxTotal) { console.log(`PAROU: gasto da rodada chegou a US$ ${custoTotal.toFixed(4)} (teto --max-total-usd ${maxTotal}).`); break; }
  const r = spawnSync(bin, ["-p", c.entrada, "--agent", agente, "--append-system-prompt", MODO_TESTE, "--output-format", "json", "--max-turns", "6", "--max-budget-usd", maxUsd, "--permission-mode", "dontAsk"],
    { cwd: raiz, encoding: "utf8", timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 });
  let s = null; try { s = JSON.parse(r.stdout); } catch { /* sem JSON */ }
  const texto = String(s?.result ?? (s?.errors?.length ? "Erro: " + s.errors.join("; ") : (r.stdout ?? "")));
  if (/not been trusted/i.test(r.stderr || "") && !avisouConfianca) { avisouConfianca = true; console.error("AVISO: pasta não confiável: abra o Claude uma vez aqui e aceite a confiança, senão as regras de permissão do projeto são ignoradas."); }
  const custo = Number(s?.total_cost_usd) || 0; custoTotal += custo;
  const falhas = [];
  if (!s || s.is_error) falhas.push("execução falhou ou sem resposta");
  for (const re of c.deve_conter || []) if (!new RegExp(re, "i").test(texto)) falhas.push(`faltou: /${re}/`);
  for (const re of c.nao_deve_conter || []) if (new RegExp(re, "i").test(texto)) falhas.push(`não devia ter: /${re}/`);
  resultados.push({ id: c.id, agente, ok: falhas.length === 0, falhas, custo_usd: custo, resposta: texto.slice(0, 600) });
  console.log(`${falhas.length ? "FALHOU" : "passou"}  ${c.id} (${agente})${falhas.length ? "  <- " + falhas.join("; ") : ""}`);
}
const ok = resultados.filter((r) => r.ok).length;
const pasta = path.join(raiz, "evals", "resultados"); fs.mkdirSync(pasta, { recursive: true });
const saida = path.join(pasta, `${new Date().toISOString().replace(/[:.]/g, "-")}-${path.basename(arquivo, ".jsonl")}.json`);
fs.writeFileSync(saida, JSON.stringify({ arquivo, total: resultados.length, passou: ok, custo_usd: custoTotal, resultados }, null, 2));
console.log(`\n${ok} de ${resultados.length} passaram. Custo estimado: US$ ${custoTotal.toFixed(4)}\nRelatório: ${path.relative(raiz, saida)}\n`);
process.exit(ok === resultados.length ? 0 : 1);
