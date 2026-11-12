// Resume estado/log.jsonl: tarefas e gasto por dia e por agente. Alerta quando passa do limite diário.
// Uso:  node scripts/custo.mjs                              (últimos 7 dias com atividade)
//       LIMITE_DIA_USD=3 node scripts/custo.mjs
//       node scripts/custo.mjs --rotacionar [--manter-dias 30]   arquiva o log antigo (explicação abaixo)
// Eventos de teste ("teste": true, do gerar-eventos-teste.mjs) NÃO entram na conta: gasto falso não pode passar por gasto real.
// Rotação: o log só cresce, e o painel e os relatórios ficam mais lentos. --rotacionar move as linhas com mais de N dias (padrão 30)
//   para estado/arquivo/log-AAAA-MM.jsonl (acrescenta; um arquivo por mês, em UTC) e deixa só as recentes em estado/log.jsonl. Nada é apagado.
//   Tudo é gravado num arquivo temporário e depois renomeado por cima: se o processo morrer no meio, o log antigo continua inteiro.
//   Rodar de novo é seguro (não duplica). Linhas sem data legível ficam no log.jsonl. Uma vez por mês basta; evite rodar durante uma rotina.
//   scripts/resumo-log.mjs --dias N lê o arquivo sozinho; este script também puxa o arquivo quando faltam dias para completar os 7.
// Atenção: só aparece custo de rotinas (scripts/rodar-rotina.mjs, o `claude -p` informa o valor) e do runner/escritorio-api.mjs (com IA_PRECO_*).
// Para o gasto de conversas interativas, use /usage dentro do Claude Code e a página de uso da sua conta.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode

const estado = path.resolve(process.env.ESTADO_DIR || path.join(RAIZ, "estado"));
const limite = Number(process.env.LIMITE_DIA_USD || 5);
const logArq = path.join(estado, "log.jsonl"), pastaArq = path.join(estado, "arquivo");
const rel = (arq) => { const r = path.relative(RAIZ, arq); return r.startsWith("..") ? arq : r; };

const USO = "Uso: node scripts/custo.mjs [--rotacionar [--manter-dias N]]";
const erroUso = (msg) => { console.error(`${msg}\n${USO}`); process.exit(2); };
const args = process.argv.slice(2).flatMap((a) => (/^--manter-dias=/.test(a) ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)] : [a])); // aceita --manter-dias=30 e --manter-dias 30
let rotacionar = false, manterDias = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--rotacionar") rotacionar = true;
  else if (args[i] === "--manter-dias") { manterDias = Number(args[++i]); if (!(manterDias > 0 && manterDias <= 36500)) erroUso("--manter-dias precisa de um número de dias maior que 0."); }
  else erroUso(`Argumento desconhecido: ${args[i]}`);
}
if (manterDias !== null && !rotacionar) erroUso("--manter-dias só vale junto com --rotacionar.");

if (rotacionar) rotaciona(manterDias ?? 30); else relatorio();

// ---- relatório de custo (padrão)
function relatorio() {
  const dias = {};
  let teste = 0;
  const soma = (texto) => {
    for (const l of texto.split("\n")) {
      if (!l) continue;
      let e; try { e = JSON.parse(l); } catch { continue; }
      if (e?.teste === true) { teste++; continue; }
      if (!e?.t || !e.agente) continue;
      const dia = String(e.t).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) continue; // data ilegível: não vira um "dia" falso no relatório
      const d = (dias[dia] ||= { total: 0, tarefas: 0, erros: 0, ag: {} });
      const c = Number(e.custo_usd) || 0;
      d.total += c; const a = (d.ag[e.agente] ||= { c: 0, n: 0 }); a.c += c;
      if (e.evento === "fim") { d.tarefas++; a.n++; }
      if (e.evento === "erro") d.erros++;
    }
  };
  let texto = null; try { texto = fs.readFileSync(logArq, "utf8"); } catch { /* sem log */ }
  let arquivos = []; try { arquivos = fs.readdirSync(pastaArq).filter((f) => /^log-\d{4}-\d{2}\.jsonl$/.test(f)).sort().reverse(); } catch { /* nunca rotacionou */ }
  if (texto === null && !arquivos.length) { console.log("Sem estado/log.jsonl ainda."); return; }
  if (texto !== null) soma(texto);
  // Depois de uma rotação o log pode ter menos de 7 dias. Com 8 dias ou mais o mais antigo nem aparece, então o arquivo só entra quando faltam
  // dias (ou quando o dia mais antigo pode estar cortado ao meio pela rotação).
  for (const f of arquivos) { if (Object.keys(dias).length > 7) break; soma(fs.readFileSync(path.join(pastaArq, f), "utf8")); }
  const lista = Object.keys(dias).sort().slice(-7);
  const notaTeste = teste ? `(${teste} evento(s) de teste ignorado(s): vêm do gerar-eventos-teste.mjs e não contam como gasto.)\n` : "";
  if (!lista.length) { console.log("Nenhum evento válido no log." + (notaTeste ? "\n" + notaTeste : "")); return; }
  console.log("");
  for (const dia of lista) {
    const d = dias[dia], alerta = d.total > limite ? `  <-- ACIMA DO LIMITE (US$ ${limite.toFixed(2)})` : "";
    console.log(`${dia}  ${d.tarefas} tarefa(s), ${d.erros} erro(s), US$ ${d.total.toFixed(4)}${alerta}`);
    for (const [nome, a] of Object.entries(d.ag).sort((x, y) => y[1].c - x[1].c)) console.log(`   ${nome.padEnd(16)} ${String(a.n).padStart(3)} tarefa(s)   US$ ${a.c.toFixed(4)}`);
  }
  console.log(`\n${notaTeste}Lembrete: o valor é estimativa do cliente, não é a cobrança oficial. Confira na sua conta.\n`);
}

// ---- rotação do log (--rotacionar)
// Grava `conteudo` ao lado e renomeia por cima do destino (rename é atômico). `emendar` devolve o que chegou ao log enquanto eu gravava.
function gravarAtomico(arq, conteudo, emendar) {
  const tmp = `${arq}.${process.pid}.tmp`;
  try {
    const fd = fs.openSync(tmp, "w");
    try {
      const junta = () => { const mais = emendar ? emendar() : ""; if (mais) fs.writeFileSync(fd, mais); return Boolean(mais); };
      fs.writeFileSync(fd, conteudo);
      junta();
      fs.fsyncSync(fd); // os dados chegam ao disco antes da troca
      if (junta()) fs.fsyncSync(fd); // última olhada: algo chegou durante o fsync?
    } finally { fs.closeSync(fd); }
    fs.renameSync(tmp, arq);
  } catch (e) { fs.rmSync(tmp, { force: true }); throw e; }
}
// Texto que os agentes gravaram em log.jsonl depois do byte `de`.
function lerDesde(de) {
  const fd = fs.openSync(logArq, "r");
  try {
    const tam = fs.fstatSync(fd).size;
    if (tam < de) throw new Error("o log.jsonl encolheu durante a rotação (alguém o esvaziou?). Nada foi trocado");
    const b = Buffer.alloc(tam - de), n = b.length ? fs.readSync(fd, b, 0, b.length, de) : 0;
    return { texto: b.subarray(0, n).toString("utf8"), fim: de + n };
  } finally { fs.closeSync(fd); }
}
// Sobras de uma rotação que morreu no meio, com mais de 10 minutos (nunca têm dado único: o original só é trocado no fim).
function limparSobras() {
  for (const pasta of [estado, pastaArq]) {
    let nomes = []; try { nomes = fs.readdirSync(pasta); } catch { continue; }
    for (const n of nomes.filter((x) => /^log.*\.\d+\.tmp$/.test(x))) {
      const arq = path.join(pasta, n);
      try { if (Date.now() - fs.statSync(arq).mtimeMs > 600000) fs.rmSync(arq, { force: true }); } catch { /* outra rotação pode ter acabado de apagar */ }
    }
  }
}

function rotaciona(manter) {
  let trocou = false; // vira true só depois que o log novo entrou no lugar do antigo
  try {
    limparSobras();
    let bruto; try { bruto = fs.readFileSync(logArq); } catch { console.log("Sem estado/log.jsonl ainda. Nada a arquivar."); return; }
    const lidos = bruto.length; // bytes que li: o que os agentes gravarem depois disso eu preservo
    const corte = Date.now() - manter * 86400000;
    const recentes = [], porMes = new Map();
    let total = 0, antigas = 0, semData = 0;
    for (const bruta of bruto.toString("utf8").split("\n")) {
      const l = bruta.trimEnd();
      if (!l) continue;
      total++;
      let t = NaN; try { t = Date.parse(JSON.parse(l)?.t); } catch { /* linha quebrada: fica no log */ }
      if (Number.isNaN(t)) semData++;
      const mes = t < corte ? new Date(t).toISOString().slice(0, 7) : "";
      if (!/^\d{4}-\d{2}$/.test(mes)) { recentes.push(l); continue; } // recente, sem data ou data estranha: fica
      if (!porMes.has(mes)) porMes.set(mes, []);
      porMes.get(mes).push(l); antigas++;
    }
    if (!antigas) { console.log(`Nada para arquivar: nenhuma das ${total} linha(s) do log.jsonl tem mais de ${manter} dia(s).`); return; }

    // 1) o arquivo mensal recebe as linhas antigas (se o log ainda não foi trocado, o que já estiver lá não é repetido)
    fs.mkdirSync(pastaArq, { recursive: true });
    const porArquivo = []; let repetidas = 0;
    for (const mes of [...porMes.keys()].sort()) {
      const linhas = porMes.get(mes), arq = path.join(pastaArq, `log-${mes}.jsonl`);
      let atual = ""; try { atual = fs.readFileSync(arq, "utf8"); } catch { /* arquivo novo */ }
      const tem = new Set(atual.split("\n"));
      const novas = linhas.filter((l) => !tem.has(l));
      repetidas += linhas.length - novas.length;
      if (novas.length) gravarAtomico(arq, atual + (atual && !atual.endsWith("\n") ? "\n" : "") + novas.map((l) => l + "\n").join(""));
      porArquivo.push(`${rel(arq)} (+${novas.length})`);
    }

    // 2) só então o log perde as linhas antigas; o que chegou nesse meio-tempo é copiado para o novo
    let ate = lidos, chegaram = 0;
    const novidades = () => { const r = lerDesde(ate); ate = r.fim; chegaram += r.texto.split("\n").filter(Boolean).length; return r.texto; };
    gravarAtomico(logArq, recentes.map((l) => l + "\n").join("") + novidades(), novidades);
    trocou = true;

    console.log(`\nRotação feita: ficaram no log.jsonl os últimos ${manter} dia(s); o resto foi para estado/arquivo/.`);
    console.log(`  Antes:    ${total} linha(s) no log.jsonl`);
    console.log(`  Depois:   ${recentes.length + chegaram} no log.jsonl${chegaram ? ` (inclui ${chegaram} gravada(s) durante a rotação)` : ""} + ${antigas} no arquivo`);
    console.log(`  Arquivo:  ${porArquivo.join(", ")}`);
    if (repetidas) console.log(`  ${repetidas} linha(s) já estavam no arquivo (rotação anterior interrompida): não repeti.`);
    if (semData) console.log(`  ${semData} linha(s) sem data legível ficaram no log.jsonl (não dá para saber a idade).`);
    try { if (!/^\/?estado\/arquivo\/?\s*$/m.test(fs.readFileSync(path.join(RAIZ, ".gitignore"), "utf8"))) console.log("  Dica: acrescente a linha estado/arquivo/ ao .gitignore (o arquivo morto guarda pedidos e respostas e não deve ir para o Git)."); } catch { /* sem .gitignore */ }
    console.log("");
  } catch (e) {
    console.error(`Rotação interrompida: ${e.message}`);
    if (!trocou) console.error("O log.jsonl continua como estava (nenhuma linha se perdeu). Pode rodar a rotação de novo sem risco.");
    process.exitCode = 1;
  }
}
