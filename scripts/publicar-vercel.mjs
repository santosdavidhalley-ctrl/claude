// Monta a pasta que vai para o Vercel: SÓ o painel 3D em modo demonstração (atividade simulada) e os modelos 3D que ele usa.
// Nada do cérebro, do estado, dos agentes, das regras nem do kit vai junto.
// Uso (na raiz do escritório):
//   node scripts/publicar-vercel.mjs                         monta em .publicar/escritorio-ia/
//   npx vercel deploy .publicar/escritorio-ia --prod         publica (pede login no Vercel na primeira vez)
// O nome da pasta final (escritorio-ia) vira o nome do projeto no Vercel.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // raiz do escritório, de onde quer que o comando rode
const PUBLICO = path.join(raiz, "visual", "app", "public");
const PACOTE = path.join(PUBLICO, "escritorio-3d");
const SAIDA = path.join(raiz, ".publicar", "escritorio-ia");
const rel = (p) => path.relative(raiz, p).split(path.sep).join("/");
const falha = (msg) => { console.error(msg); process.exit(1); };

// Tarefas de exemplo da demonstração (genéricas: nenhum cliente, preço ou dado real)
const TAREFAS = {
  vendas: ["Responder interessado: site para barbearia", "Rascunhar proposta de cardápio digital", "Responder pedido de orçamento"],
  conteudo: ["3 opções de post sobre ter um site próprio", "Legenda para mostrar um projeto", "Ideias de post para a semana"],
  suporte: ["Responder dúvida sobre prazo", "Explicar os planos de manutenção", "Responder dúvida sobre domínio"],
  agenda: ["Organizar as reuniões da semana", "Pauta da conversa com um cliente", "Sugerir horários para reunião"],
  prospeccao: ["Classificar perfis de negócios locais", "Rascunhar a primeira mensagem", "Organizar a lista de contatos"],
  automacoes: ["Desenhar lembrete de reunião", "Mapear uma tarefa repetitiva", "Desenhar rotina de follow-up"],
  rotinas: ["Resumo do dia", "Relatório da semana", "Fechar o dia"],
};
const AVISO = "Demonstração: a equipe é real, mas as tarefas são de exemplo e a atividade é simulada. O escritório de verdade roda no computador do dono, e esta tela só observa o trabalho dos agentes.";

for (const p of [path.join(PUBLICO, "3d", "index.html"), path.join(PACOTE, "escritorios", "indice.json"), path.join(PACOTE, "funcionarios", "funcionarios.json")]) {
  if (!fs.existsSync(p)) falha(`Não achei ${rel(p)}. O painel 3D e o pacote escritorio-3d precisam estar em visual/app/public/.`);
}
let equipe;
try { equipe = JSON.parse(fs.readFileSync(path.join(raiz, "estado", "equipe.json"), "utf8").replace(/^﻿/, "")); } catch (e) { falha(`estado/equipe.json ilegível ou ausente (${e.message}). Rode node scripts/iniciar.mjs antes.`); }
if (!Array.isArray(equipe.agentes) || !equipe.agentes.length) falha("estado/equipe.json não tem agentes.");
// só o que o painel desenha: id, nome, função, cor e (se houver) boneco e planta
const equipePublica = { agentes: equipe.agentes.map(({ id, nome, funcao, cor, boneco }) => ({ id, nome, funcao, cor, ...(boneco ? { boneco } : {}) })), ...(equipe.escritorio3d ? { escritorio3d: equipe.escritorio3d } : {}) };

const copiados = [];
function copia(de, para) {
  if (!fs.existsSync(de)) falha(`Faltou ${rel(de)}.`);
  fs.mkdirSync(path.dirname(para), { recursive: true });
  fs.copyFileSync(de, para);
  copiados.push(para);
}
function escreve(para, texto) {
  fs.mkdirSync(path.dirname(para), { recursive: true });
  fs.writeFileSync(para, texto);
  copiados.push(para);
}

// recomeça do zero (só esta pasta de saída, que o próprio script cria)
fs.rmSync(SAIDA, { recursive: true, force: true });

// 1. o painel 3D e o modo demonstração
for (const f of ["index.html", "painel3d.css", "painel3d.js"]) copia(path.join(PUBLICO, "3d", f), path.join(SAIDA, "3d", f));
escreve(path.join(SAIDA, "3d", "demo.json"), JSON.stringify({ equipe: equipePublica, tarefas: TAREFAS, aviso: AVISO }, null, 2) + "\n");

// 2. só as plantas de um andar (as únicas que o painel oferece), os funcionários e a biblioteca 3D
const indice = JSON.parse(fs.readFileSync(path.join(PACOTE, "escritorios", "indice.json"), "utf8"));
const terreas = indice.escritorios.filter((e) => e.andares === 1);
escreve(path.join(SAIDA, "escritorio-3d", "escritorios", "indice.json"), JSON.stringify({ ...indice, escritorios: terreas }, null, 1) + "\n");
for (const e of terreas) for (const f of [e.arquivo, e.dados]) copia(path.join(PACOTE, f), path.join(SAIDA, "escritorio-3d", f));
const funcs = JSON.parse(fs.readFileSync(path.join(PACOTE, "funcionarios", "funcionarios.json"), "utf8"));
copia(path.join(PACOTE, "funcionarios", "funcionarios.json"), path.join(SAIDA, "escritorio-3d", "funcionarios", "funcionarios.json"));
for (const f of funcs.funcionarios) copia(path.join(PACOTE, f.arquivo), path.join(SAIDA, "escritorio-3d", f.arquivo));
const VENDOR = path.join("visualizador", "vendor");
for (const f of ["three.module.min.js", "three.core.min.js", "three-LICENSE.txt", "addons/loaders/GLTFLoader.js", "addons/controls/OrbitControls.js", "addons/environments/RoomEnvironment.js", "addons/utils/BufferGeometryUtils.js"]) {
  copia(path.join(PACOTE, VENDOR, f), path.join(SAIDA, "escritorio-3d", VENDOR, f));
}

// 3. a página inicial leva ao 3D, e a configuração do Vercel
escreve(path.join(SAIDA, "index.html"), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Escritório de IA</title>
<meta name="description" content="Demonstração do escritório de IA em 3D: cada agente na sua mesa.">
<meta http-equiv="refresh" content="0; url=3d/">
<style>:root{color-scheme:light}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ece2d6;color:#0b1324;font:16px/1.5 ui-sans-serif,system-ui,sans-serif}a{color:#2f56d6;font-weight:700}</style>
</head>
<body><p>Abrindo o escritório em 3D… <a href="3d/">Abrir agora</a></p></body>
</html>
`);
escreve(path.join(SAIDA, "vercel.json"), JSON.stringify({
  redirects: [
    { source: "/", destination: "/3d/", permanent: false },
    { source: "/3d", destination: "/3d/", permanent: false },
  ],
  headers: [
    { source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
    { source: "/escritorio-3d/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
  ],
}, null, 2) + "\n");

const total = copiados.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`\nPronto: ${rel(SAIDA)}/ (${copiados.length} arquivos, ${(total / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Agentes na demonstração: ${equipePublica.agentes.map((a) => a.nome || a.id).join(", ")}`);
console.log(`Plantas: ${terreas.map((e) => e.id).join(", ")}`);
console.log(`\nPublicar: npx vercel deploy ${rel(SAIDA)} --prod\nVer antes no computador: npx serve ${rel(SAIDA)}  (e abra o endereço que aparecer)\n`);
