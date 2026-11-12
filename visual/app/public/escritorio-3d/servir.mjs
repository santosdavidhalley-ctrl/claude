#!/usr/bin/env node
// Abre o visualizador do pacote no seu computador (Node 18+, sem instalar nada).
// Uso: node servir.mjs            → mostra o endereço (http://localhost:4173/visualizador/)
//      node servir.mjs --abrir    → também abre no navegador
//      PORTA=5000 node servir.mjs → outra porta
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".webp": "image/webp",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const srv = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (rel === "/") rel = "/visualizador/";
  if (rel.endsWith("/")) rel += "index.html";
  const arq = path.resolve(RAIZ, "." + rel);
  // só arquivos de dentro da pasta do pacote
  if (!arq.startsWith(RAIZ + path.sep) || !fs.existsSync(arq) || !fs.statSync(arq).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Não encontrado");
  }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(arq)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(arq).pipe(res);
});

let porta = Number(process.env.PORTA ?? 4173);
srv.on("error", (e) => {
  if (e.code === "EADDRINUSE" && !process.env.PORTA && porta < 4190) return srv.listen(++porta, "127.0.0.1");
  console.error(`Não deu para abrir a porta ${porta}: ${e.message}`);
  process.exit(1);
});
srv.on("listening", () => {
  const endereco = `http://localhost:${porta}/visualizador/`;
  console.log(`Escritório 3D no ar: ${endereco}\n(Ctrl+C para parar)`);
  if (process.argv.includes("--abrir")) {
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start \"\"" : "xdg-open";
    exec(`${cmd} ${endereco}`);
  }
});
srv.listen(porta, "127.0.0.1");
