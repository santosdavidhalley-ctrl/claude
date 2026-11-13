// Servidor do escritório visual. Só LÊ: nunca escreve, nunca executa nada.
// Uso (na raiz do projeto):  node visual/app/server.mjs
// Variáveis opcionais:
//   PORT          porta (padrão 4700)
//   ESTADO_DIR    pasta do estado (padrão ./estado)
//   PAINEL_HOSTS  endereços extras aceitos, separados por vírgula (ex.: PAINEL_HOSTS=painel.exemplo.com,100.64.0.7)
//
// REDE: o servidor escuta SÓ em 127.0.0.1, então só este computador abre o painel. Um celular, mesmo no
// mesmo Wi-Fi, NÃO alcança o painel assim. Para isso o servidor teria de escutar em 0.0.0.0 (todas as
// interfaces) e qualquer pessoa da rede veria o painel. NÃO faça isso sem colocar login antes.
//
// DNS REBINDING: um site malicioso pode fazer o navegador chamar o seu localhost usando um nome falso.
// Por isso o cabeçalho Host é conferido e só passam: localhost, 127.0.0.1, [::1]; IP de rede local
// (10.x, 172.16-31.x, 192.168.x); nomes terminados em .local; e o que estiver em PAINEL_HOSTS.
// Qualquer outro recebe 403. IP de rede local e .local só servem se a porta for repassada ao celular
// (túnel ou proxy) ou se você mudar o endereço acima de propósito: liberar o nome não abre a porta.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."); // raiz do escritório, de onde quer que o comando rode

const aqui = path.dirname(fileURLToPath(import.meta.url));
const PUBLICO = path.join(aqui, "public");
const ESTADO = path.resolve(process.env.ESTADO_DIR || path.join(RAIZ, "estado"));
const PORT = Number(process.env.PORT || 4700);
const LOG = path.join(ESTADO, "log.jsonl");
const EQUIPE = path.join(ESTADO, "equipe.json");
const MAX_EVENTOS = 400;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`PORT inválida: "${process.env.PORT}". Use um número de 1 a 65535, por exemplo:  PORT=4701 node visual/app/server.mjs`);
  process.exit(1);
}

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary", ".webp": "image/webp", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" }; // os cinco últimos: painel 3D (public/3d/ e public/escritorio-3d/)

// --- Quem pode abrir o painel (proteção contra DNS rebinding, veja o cabeçalho) ---
const HOSTS_FIXOS = new Set(["localhost", "127.0.0.1", "[::1]"]);
// "Exemplo.com:4700" -> "exemplo.com"; "[::1]:4700" -> "[::1]"; qualquer formato estranho -> null
function nomeDoHost(valor) {
  const m = /^(\[[0-9a-f:.]+\]|[a-z0-9][a-z0-9_.-]*)(?::\d{1,5})?$/i.exec(String(valor || "").trim());
  return m ? m[1].toLowerCase().replace(/\.$/, "") : null;
}
const HOSTS_EXTRAS = new Set((process.env.PAINEL_HOSTS || "").split(/[\s,;]+/).map(nomeDoHost).filter(Boolean));
function ipRedeLocal(h) { // 10.x.x.x, 172.16-31.x.x, 192.168.x.x (sem zero à esquerda, que pode ser lido como octal)
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m || m.slice(1).some((p) => Number(p) > 255 || (p.length > 1 && p[0] === "0"))) return false;
  const a = Number(m[1]), b = Number(m[2]);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}
function hostPermitido(cabecalho) {
  const h = nomeDoHost(cabecalho);
  return !!h && (HOSTS_FIXOS.has(h) || ipRedeLocal(h) || /^[a-z0-9_-]+(\.[a-z0-9_-]+)*\.local$/.test(h) || HOSTS_EXTRAS.has(h));
}

// --- Leitura do estado ---
let equipeBoa = { agentes: [] }; // última equipe válida: o painel não pisca vazio se o arquivo estiver sendo regravado
function lerEquipe() {
  let texto;
  try { texto = fs.readFileSync(EQUIPE, "utf8"); } catch { equipeBoa = { agentes: [] }; return equipeBoa; } // ainda não existe (ou foi apagado): equipe vazia
  try {
    const j = JSON.parse(texto.replace(/^﻿/, "")); // aceita arquivo salvo com BOM (alguns editores do Windows)
    if (j && Array.isArray(j.agentes)) equipeBoa = j;
  } catch { /* JSON pela metade ou com erro de digitação: mantém a última equipe válida */ }
  return equipeBoa;
}
function lerEventos() {
  try {
    const linhas = fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean).slice(-MAX_EVENTOS);
    const eventos = [];
    for (const l of linhas) { try { eventos.push(JSON.parse(l)); } catch { /* linha quebrada: ignora */ } }
    return eventos;
  } catch { return []; }
}

// Vigia log.jsonl e equipe.json a cada 0,5 s e avisa os painéis abertos quando algum muda.
// Compara tamanho + data + inode (e não só o tamanho) e olha o CAMINHO do arquivo, não o arquivo aberto:
// por isso funciona se o arquivo for substituído por outro (salvar do editor, mv) e se ainda não existir.
const clientes = new Set();
function assinatura(arquivo) {
  try { const s = fs.statSync(arquivo); return `${s.size}:${s.mtimeMs}:${s.ino}`; } catch { return "ausente"; }
}
const assinaturaAtual = () => assinatura(LOG) + "|" + assinatura(EQUIPE);
let assinaturaAnterior = assinaturaAtual();
setInterval(() => {
  const atual = assinaturaAtual(); // medir ANTES de ler: se mudar durante a leitura, o próximo ciclo manda de novo
  if (atual === assinaturaAnterior) return;
  assinaturaAnterior = atual;
  if (!clientes.size) return;
  const msg = `data: ${JSON.stringify({ equipe: lerEquipe(), eventos: lerEventos() })}\n\n`;
  for (const r of clientes) r.write(msg);
}, 500);

const hostsAvisados = new Set(); // cada endereço bloqueado aparece uma vez no terminal, para o dono saber o que liberar
const servidor = http.createServer((req, res) => {
  if (!hostPermitido(req.headers.host)) {
    const h = nomeDoHost(req.headers.host) || "(endereço ilegível)";
    if (!hostsAvisados.has(h) && hostsAvisados.size < 20) { hostsAvisados.add(h); console.log(`Bloqueei um acesso pelo endereço "${h}". Se for você (túnel ou prévia do app), ligue o painel com PAINEL_HOSTS=${h}`); }
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end(`Acesso bloqueado (403): este endereço não está liberado para o painel.\nAbra http://localhost:${PORT} neste computador. Para liberar outro nome, ligue o servidor com a variável PAINEL_HOSTS.`);
    return;
  }
  const url = new URL(req.url, "http://localhost");
  if (req.method !== "GET") { res.writeHead(405).end(); return; }
  if (url.pathname === "/api/estado") {
    res.writeHead(200, { "content-type": TIPOS[".json"], "cache-control": "no-store" });
    res.end(JSON.stringify({ equipe: lerEquipe(), eventos: lerEventos() }));
    return;
  }
  if (url.pathname === "/api/stream") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
    res.write(`data: ${JSON.stringify({ equipe: lerEquipe(), eventos: lerEventos() })}\n\n`);
    clientes.add(res);
    req.on("close", () => clientes.delete(res));
    return;
  }
  let caminho;
  try { caminho = decodeURIComponent(url.pathname); } catch { caminho = "\0"; } // endereço malformado: cai no 404
  const rel = caminho.endsWith("/") ? caminho.slice(1) + "index.html" : caminho.slice(1); // "/" e "/3d/" abrem o index.html da pasta
  const arquivo = path.join(PUBLICO, rel);
  const dentro = !rel.includes("\0") && arquivo.startsWith(PUBLICO + path.sep);
  if (dentro && !caminho.endsWith("/") && fs.existsSync(path.join(arquivo, "index.html"))) { // "/3d" -> "/3d/" (os caminhos da página são relativos à pasta)
    res.writeHead(302, { location: url.pathname + "/" + url.search, "cache-control": "no-store" }).end();
    return;
  }
  if (!dentro || !fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Não encontrado");
    return;
  }
  // os modelos e a biblioteca 3D não mudam: o navegador pode guardar por 10 min; o resto continua sem cache
  const pesado = rel.startsWith("escritorio-3d/") && /\.(glb|webp|js)$/.test(arquivo);
  res.writeHead(200, { "content-type": TIPOS[path.extname(arquivo)] || "application/octet-stream", "cache-control": pesado ? "max-age=600" : "no-store" });
  fs.createReadStream(arquivo).pipe(res);
});

servidor.on("error", (erro) => { // sem isto, porta ocupada vira um monte de texto técnico (stack trace)
  if (erro.code === "EADDRINUSE") {
    const outra = PORT < 65535 ? PORT + 1 : 4701;
    console.error(`\nNão consegui ligar o painel: a porta ${PORT} já está em uso por outro programa.\n`);
    console.error(`- Talvez o painel já esteja aberto (em outro terminal?). Tente abrir: http://localhost:${PORT}`);
    console.error(`- Ou use outra porta. No Mac/Linux:  PORT=${outra} node visual/app/server.mjs`);
    console.error(`  No Windows (PowerShell):  $env:PORT=${outra}; node visual/app/server.mjs\n`);
  } else {
    console.error(`\nO painel parou por um erro (${erro.code || "desconhecido"}): ${erro.message}\n`);
  }
  process.exit(1);
});

// 127.0.0.1: só o seu computador enxerga (por isso o celular no Wi-Fi não alcança; veja REDE no cabeçalho).
// Para abrir na rede, NÃO mude isto sem colocar login antes.
servidor.listen(PORT, "127.0.0.1", () => {
  console.log(`Escritório visual em http://localhost:${PORT}`);
  if (fs.existsSync(path.join(PUBLICO, "3d", "index.html"))) console.log(`Em 3D:             http://localhost:${PORT}/3d/`);
  console.log(`Lendo: ${ESTADO}`);
});
