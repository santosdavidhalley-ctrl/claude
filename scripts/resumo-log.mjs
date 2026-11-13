// Resume o log de eventos (estado/log.jsonl) de um período: por agente, tarefas concluídas, erros, gasto e os 3 últimos resultados; no fim, os totais.
// É o que as rotinas (/bom-dia, /fechar-dia, /relatorio-semanal) rodam no lugar de ler o log: a ferramenta Read do Claude Code corta arquivos em 2000 linhas,
// e depois de algumas semanas um relatório feito "lendo o log" sairia errado, sem aviso. Este script lê o arquivo inteiro e é rápido.
// Uso (na raiz do escritório):
//   node scripts/resumo-log.mjs                           últimas 24 horas (padrão)
//   node scripts/resumo-log.mjs --horas 48                últimas 48 horas
//   node scripts/resumo-log.mjs --dias 7                  últimos 7 dias
//   node scripts/resumo-log.mjs --dias 7 --agente vendas  só um agente
//   node scripts/resumo-log.mjs --dias 7 --json           o mesmo resumo em JSON (para outros programas)
// Tarefa = evento "fim". "Sem fim" = iniciadas que não terminaram nem deram erro. O gasto soma o custo_usd de TODOS os eventos (inicio, fim, erro, custo).
// Ignora linhas de teste ("teste": true, do gerar-eventos-teste.mjs) e linhas quebradas, e diz quantas ignorou (contadas em tudo que foi lido).
// Se o período chega antes do começo do log.jsonl, lê também estado/arquivo/log-AAAA-MM.jsonl (criados por: node scripts/custo.mjs --rotacionar).
// Só lê: não altera nenhum arquivo. Respeita ESTADO_DIR, como os outros scripts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode

const USO = "Uso: node scripts/resumo-log.mjs [--horas N | --dias N] [--agente NOME] [--json]";
const erroUso = (msg) => { console.error(`${msg}\n${USO}`); process.exit(2); };
const args = process.argv.slice(2).flatMap((a) => (/^--(horas|dias|agente)=/.test(a) ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)] : [a])); // aceita --dias=7 e --dias 7
let horas = null, dias = null, filtro = null, comoJson = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--json") comoJson = true;
  else if (a === "--ajuda" || a === "--help" || a === "-h") { console.log(USO); process.exit(0); }
  else if (a === "--horas" || a === "--dias" || a === "--agente") {
    const v = args[++i];
    if (v === undefined || v.startsWith("--")) erroUso(`Falta o valor depois de ${a}.`);
    if (a === "--agente") filtro = v;
    else {
      const n = Number(v);
      if (!(n > 0 && n <= 100000)) erroUso(`${a} precisa de um número entre 0 e 100000 (recebi "${v}").`);
      if (a === "--horas") horas = n; else dias = n;
    }
  } else erroUso(`Argumento desconhecido: ${a}`); // um erro de digitação não pode virar um resumo do período errado, em silêncio
}
if (horas !== null && dias !== null) erroUso("Use --horas OU --dias, não os dois.");

const estado = path.resolve(process.env.ESTADO_DIR || path.join(RAIZ, "estado"));
const logArq = path.join(estado, "log.jsonl"), pastaArq = path.join(estado, "arquivo");
const agora = Date.now();
const inicio = agora - (dias !== null ? dias * 86400000 : (horas ?? 24) * 3600000);
const rotulo = dias !== null ? `últimos ${dias} dia${dias === 1 ? "" : "s"}` : `últimas ${horas ?? 24} h`;
const nome = (arq) => { const r = path.relative(RAIZ, arq); return r.startsWith("..") ? arq : r; };
const lerTexto = (arq) => {
  try { return fs.readFileSync(arq, "utf8").replace(/^\uFEFF/, ""); } catch (e) {
    if (e.code === "ENOENT") return null; // não existir é normal; qualquer outro erro, não: melhor parar do que resumir pela metade
    console.error(`Não consegui ler ${nome(arq)}: ${e.message}`); process.exit(1);
  }
};

// ---- leitura: cada linha vira, no máximo, uma entrada no agente certo
const agentes = new Map();     // agente -> contadores (só eventos dentro do período)
const comEvento = new Set();   // todo agente que tem evento no período (antes do filtro --agente)
let linhas = 0, teste = 0, quebradas = 0, maisAntigo = Infinity, maisRecente = -Infinity;
function processa(texto) {
  for (const l of texto.split("\n")) {
    if (!l.trim()) continue;
    linhas++;
    let e; try { e = JSON.parse(l); } catch { quebradas++; continue; }
    if (e?.teste === true) { teste++; continue; }
    const t = Date.parse(e?.t);
    if (Number.isNaN(t) || typeof e.agente !== "string" || !e.agente) { quebradas++; continue; } // sem data ou sem agente: não dá para usar
    if (t < maisAntigo) maisAntigo = t;
    if (t > maisRecente && t <= agora) maisRecente = t; // evento "do futuro" (relógio errado) não serve de referência
    if (t < inicio || t > agora) continue;
    comEvento.add(e.agente);
    if (filtro && e.agente.toLowerCase() !== filtro.toLowerCase()) continue;
    let a = agentes.get(e.agente);
    if (!a) agentes.set(e.agente, (a = { agente: e.agente, tarefas: 0, erros: 0, iniciadas: 0, custo: 0, ultimos: [] }));
    if (e.evento === "fim") a.tarefas++; else if (e.evento === "erro") a.erros++; else if (e.evento === "inicio") a.iniciadas++;
    const c = Number(e.custo_usd);
    if (Number.isFinite(c)) a.custo += c;
    if (typeof e.resultado === "string" && e.resultado.trim()) {
      a.ultimos.push({ t, evento: typeof e.evento === "string" ? e.evento : "", tarefa: typeof e.tarefa === "string" ? e.tarefa.slice(0, 300) : "", resultado: e.resultado.slice(0, 400) });
      if (a.ultimos.length > 3) { a.ultimos.sort((x, y) => x.t - y.t); a.ultimos.shift(); } // guarda só os 3 mais recentes
    }
  }
}

const fontes = []; // o que foi lido, para o resumo mostrar de onde vieram os números
const le = (arq, texto) => { const antes = linhas; processa(texto); fontes.push({ arquivo: nome(arq), linhas: linhas - antes }); };
const textoLog = lerTexto(logArq);
if (textoLog !== null) le(logArq, textoLog);
const comecoDoLog = maisAntigo; // as linhas arquivadas são todas mais antigas que isto
if (inicio < comecoDoLog) { // o período chega antes do começo do log.jsonl: o resto está no arquivo (se existir)
  let nomes = []; try { nomes = fs.readdirSync(pastaArq); } catch { /* nunca rotacionou */ }
  const de = new Date(inicio).toISOString().slice(0, 7), ate = new Date(Math.min(agora, comecoDoLog)).toISOString().slice(0, 7);
  for (const f of nomes.filter((n) => /^log-\d{4}-\d{2}\.jsonl$/.test(n)).sort()) {
    const mes = f.slice(4, 11);
    if (mes < de || mes > ate) continue; // só os meses que o período toca
    const arq = path.join(pastaArq, f), texto = lerTexto(arq);
    if (texto !== null) le(arq, texto);
  }
}

// ---- resultado
const r6 = (n) => Math.round(n * 1e6) / 1e6; // tira o ruído de ponto flutuante da soma
const semFim = (a) => Math.max(0, a.iniciadas - a.tarefas - a.erros);
const lista = [...agentes.values()].sort((x, y) => y.custo - x.custo || y.tarefas - x.tarefas || x.agente.localeCompare(y.agente));
for (const a of lista) a.ultimos.sort((x, y) => y.t - x.t); // mais recente primeiro
const total = { tarefas: 0, erros: 0, iniciadas_sem_fim: 0, custo_usd: 0, agentes: lista.length };
for (const a of lista) { total.tarefas += a.tarefas; total.erros += a.erros; total.iniciadas_sem_fim += semFim(a); total.custo_usd += a.custo; }
total.custo_usd = r6(total.custo_usd);
const semLog = textoLog === null && !fontes.length;
const dicaPeriodo = Number.isFinite(maisRecente) ? `Último evento do log: ${quando(maisRecente, true)}. Para incluí-lo, tente --dias ${Math.max(1, Math.ceil((agora - maisRecente) / 86400000))}.` : "";
const aviso = semLog ? "Sem estado/log.jsonl ainda: nada para resumir."
  : !lista.length ? (filtro ? `Nenhum evento do agente "${filtro}" no período.${comEvento.size ? ` Agentes com eventos no período: ${[...comEvento].sort().join(", ")}.` : ""}` : `Nenhum evento no período.${dicaPeriodo ? " " + dicaPeriodo : ""}`)
  : "";

function quando(ms, comAno = false) { // hora local, curta
  const d = new Date(ms), dd = (n) => String(n).padStart(2, "0");
  return `${dd(d.getDate())}/${dd(d.getMonth() + 1)}${comAno ? "/" + d.getFullYear() : ""} ${dd(d.getHours())}:${dd(d.getMinutes())}`;
}
const corta = (s, n) => { const x = String(s).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; };

if (comoJson) {
  console.log(JSON.stringify({
    periodo: { rotulo, de: new Date(inicio).toISOString(), ate: new Date(agora).toISOString() },
    filtro_agente: filtro,
    agentes: lista.map((a) => ({ agente: a.agente, tarefas: a.tarefas, erros: a.erros, iniciadas_sem_fim: semFim(a), custo_usd: r6(a.custo), ultimos_resultados: a.ultimos.map((u) => ({ t: new Date(u.t).toISOString(), evento: u.evento, tarefa: u.tarefa, resultado: u.resultado })) })),
    total,
    ignoradas: { teste, quebradas },
    lido: fontes,
    ...(aviso ? { aviso } : {}),
  }, null, 2));
} else {
  const L = [`Resumo do log: ${rotulo} (${quando(inicio, true)} a ${quando(agora, true)})${filtro ? `, só o agente ${filtro}` : ""}`];
  if (fontes.length) L.push(`Lido: ${fontes.map((f) => `${f.arquivo} (${f.linhas} linhas)`).join(" + ")}`);
  L.push("");
  if (aviso) L.push(aviso);
  for (const a of lista) {
    L.push(`${a.agente}: ${a.tarefas} tarefa(s), ${a.erros} erro(s), US$ ${a.custo.toFixed(4)}${semFim(a) ? `, ${semFim(a)} sem fim` : ""}`);
    for (const u of a.ultimos) L.push(`  - ${quando(u.t)} ${u.evento ? u.evento + ": " : ""}${corta(u.resultado, 110)}${u.tarefa ? ` (${corta(u.tarefa, 60)})` : ""}`);
  }
  if (lista.length) L.push("", `TOTAL: ${total.tarefas} tarefa(s), ${total.erros} erro(s), US$ ${total.custo_usd.toFixed(4)}${total.iniciadas_sem_fim ? `, ${total.iniciadas_sem_fim} sem fim` : ""} (${total.agentes} agente(s))`);
  const ign = [teste ? `${teste} linha(s) de teste` : "", quebradas ? `${quebradas} quebrada(s) ou sem data/agente` : ""].filter(Boolean);
  if (ign.length) L.push(`Ignoradas: ${ign.join(", ")}.`);
  console.log(L.join("\n"));
}
