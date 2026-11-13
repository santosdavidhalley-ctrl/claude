// Painel 3D do escritório de IA.
// Lê o MESMO estado do painel 2D (../api/stream: estado/equipe.json + estado/log.jsonl) e desenha com o pacote
// escritorio-3d (../escritorio-3d/): cada agente ganha uma mesa e um funcionário animado.
// Esta tela só OBSERVA: não manda nada para os agentes nem grava arquivo nenhum.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ---------------- constantes ---------------- */
const PACOTE = new URL("../escritorio-3d/", import.meta.url); // raiz do pacote 3D
const url = (rel) => new URL(rel, PACOTE).href;
const $ = (s) => document.querySelector(s);
const SENTADO = 0.47; // altura de assento usada nos clipes sentados (COMECE-AQUI.md do pacote)
const CLIPE_TRABALHANDO = { type: "digitando", laptop: "notebook", rest: "sentado", lounge: "sofa", stand: "digitando_em_pe" };
const CLIPE_LIVRE = { stand: "parado", lounge: "sofa" }; // nos outros lugares: "sentado"
const DONE_MS = 8000; // "concluído" fica na tela por 8 s (igual ao painel 2D)
const PRESO_MS = 15 * 60 * 1000; // início sem fim há 15 min: provavelmente interrompido
const ROTULO = { livre: "Livre", trabalhando: "Trabalhando", concluido: "Concluído", erro: "Erro" };
const CORES = ["#3d66e6", "#12805c", "#9a6700", "#8a3ffc", "#c2410c", "#0e7490", "#be185d", "#4d7c0f"];
// quem senta onde: o primeiro modelo vai para o orquestrador (a mesa da diretoria, quando a planta tem uma)
const BONECOS = ["funcionario-04", "funcionario-01", "funcionario-02", "funcionario-03", "funcionario-05", "funcionario-06", "funcionario-07", "funcionario-08"];
// plantas de um andar, da menor para a maior: a automática é a primeira em que a equipe cabe
const AUTOMATICAS = ["diretoria-equipe", "sede-compacta", "open-space-grande", "central-operacoes"];
const VISTA = new THREE.Vector3(0.82, 1.22, 1.12).normalize();
const SOL = new THREE.Vector3(-0.62, 0.44, 0.65).normalize();
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pequeno = matchMedia("(max-width: 900px)").matches;

/* ---------------- estado ---------------- */
let dados = { equipe: { agentes: [] }, eventos: [] };
let indice = []; // escritórios do pacote
let funcs = []; // funcionários do pacote
let atual = null; // { id, item, dados, obj }
const pessoas = new Map(); // id do agente -> { ag, lugar, o, mixer, clips, acao, clipe, anel, el, elBalao, estado, topo, nasce }
let semLugar = new Set(); // agentes que não couberam na planta escolhida
let geracao = 0; // muda a cada remontagem da cena (descarta o que ainda estava carregando)
let assinatura = null; // equipe + planta da última montagem
let foco = null; // id do agente em destaque
let recebeu = false; // já chegou o primeiro estado do servidor
let demonstracao = false; // página publicada sem o servidor do escritório (ex.: Vercel): atividade simulada

/* ---------------- utilidades (iguais às do painel 2D) ---------------- */
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function usd(n) { return "US$ " + n.toFixed(2).replace(".", ","); }
function quando(t) {
  const s = (Date.now() - new Date(t).getTime()) / 1000;
  if (Number.isNaN(s)) return "";
  if (s < 60) return "agora há pouco";
  if (s < 3600) return "há " + Math.floor(s / 60) + " min";
  if (s < 86400) return "há " + Math.floor(s / 3600) + " h";
  return "há " + Math.floor(s / 86400) + " d";
}
function hoje(t) { return new Date(t).toDateString() === new Date().toDateString(); }
function corDe(ag) { return /^#[0-9a-f]{6}$/i.test(ag.cor || "") ? ag.cor : CORES[hash(ag.id || "x") % CORES.length]; }
function curto(s, n = 90) { s = String(s); return s.length > n ? s.slice(0, n - 2) + "…" : s; }
function agentes() { return ((dados.equipe && dados.equipe.agentes) || []).filter((a) => a && typeof a.id === "string" && a.id); }

function derivar() {
  const ult = {}, gasto = {};
  let tarefas = 0, custo = 0;
  for (const e of dados.eventos || []) {
    if (!e || !e.agente) continue;
    if (e.evento !== "custo") ult[e.agente] = e; // a linha de custo das rotinas não muda o status
    if (e.t && hoje(e.t) && e.teste !== true) { // evento de teste aparece na tela, mas não soma em tarefas nem gasto
      const c = Number(e.custo_usd) || 0;
      gasto[e.agente] = (gasto[e.agente] || 0) + c;
      custo += c;
      if (e.evento === "fim") tarefas++;
    }
  }
  return { ult, gasto, tarefas, custo };
}
function estadoDe(e) {
  if (!e) return "livre";
  const idade = Date.now() - new Date(e.t).getTime();
  if (e.evento === "inicio") return idade < PRESO_MS ? "trabalhando" : "livre";
  if (e.evento === "erro") return "erro";
  if (e.evento === "fim" && idade < DONE_MS) return "concluido";
  return "livre";
}
function textoDe(st, e) { // o que aparece na lista
  if (st === "trabalhando") return e.tarefa || "Trabalhando…";
  if (st === "concluido") return e.resultado || "Pronto";
  if (st === "erro") return e.resultado || e.tarefa || "Algo deu errado";
  return e ? "Última: " + (e.tarefa || "—") : "Aguardando pedido";
}

/* ---------------- interface fixa ---------------- */
const palco = $("#palco");
const canvas = $("#cena");
const camadaRotulos = $("#rotulos");
const selPlanta = $("#planta");
function carregando(txt) {
  const c = $("#carregando");
  if (txt === null) return c.classList.add("fora");
  c.classList.remove("fora");
  $("#carregando-txt").textContent = txt;
}
function recado(partes) { // partes: texto ou [texto, href]
  const r = $("#recado");
  r.textContent = "";
  if (!partes) { r.hidden = true; return; }
  for (const p of partes) {
    if (Array.isArray(p)) { const a = el("a", null, p[0]); a.href = p[1]; r.append(a); } else r.append(p);
  }
  r.hidden = false;
}
const lado = $("#lado"), puxador = $("#puxador");
puxador.addEventListener("click", () => {
  const aberta = lado.classList.toggle("aberta");
  puxador.setAttribute("aria-expanded", String(aberta));
});
function fecharGaveta() { lado.classList.remove("aberta"); puxador.setAttribute("aria-expanded", "false"); }

/* ---------------- cena ---------------- */
let R = null, cena = null, cam = null, ctl = null, sol = null, voo = null;
const gente = new THREE.Group(); // funcionários e anéis (fora do objeto do escritório, que é descartado ao trocar de planta)
const loader = new GLTFLoader();
THREE.Cache.enabled = true; // trocar de planta e voltar não baixa de novo
try {
  R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch {
  R = null;
}
if (R) {
  R.setPixelRatio(Math.min(devicePixelRatio, pequeno ? 1.5 : 2));
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.shadowMap.enabled = !pequeno;
  R.shadowMap.type = THREE.PCFSoftShadowMap;

  cena = new THREE.Scene();
  cena.background = new THREE.Color("#ece2d6");
  cena.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.55;
  cena.add(new THREE.HemisphereLight("#f3dcc2", "#6d5b47", 0.9));
  sol = new THREE.DirectionalLight("#ffd2a6", 2.6);
  sol.castShadow = R.shadowMap.enabled;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.bias = -0.0003;
  sol.shadow.normalBias = 0.03;
  cena.add(sol, sol.target, gente);

  cam = new THREE.PerspectiveCamera(32, 1, 0.1, 3000);
  ctl = new OrbitControls(cam, canvas);
  ctl.enableDamping = !calmo;
  ctl.dampingFactor = 0.08;
  ctl.maxPolarAngle = Math.PI * 0.48;
  ctl.screenSpacePanning = false;

  const redimensionar = () => {
    const w = palco.clientWidth, h = palco.clientHeight;
    if (!w || !h) return;
    R.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  };
  new ResizeObserver(redimensionar).observe(palco);
  redimensionar();
} else {
  carregando(null);
  recado(["Este navegador não abriu o 3D. A lista ao lado continua funcionando; se preferir, abra o ", ["painel 2D", "../"], "."]);
}

async function json(rel) {
  const r = await fetch(url(rel));
  if (!r.ok) throw new Error(`${rel}: ${r.status}`);
  return r.json();
}
const modelos = new Map();
function boneco(id) { // um download por modelo; cada agente recebe um clone
  if (!modelos.has(id)) modelos.set(id, loader.loadAsync(url(`funcionarios/${id}.glb`)));
  return modelos.get(id);
}
function prepararSombra(o) {
  o.traverse((x) => {
    if (!x.isMesh) return;
    const mats = Array.isArray(x.material) ? x.material : [x.material];
    x.castShadow = !mats.some((m) => m.transparent);
    x.receiveShadow = true;
  });
}
function caixaVisivel(o) {
  const b = new THREE.Box3();
  o.updateMatrixWorld(true);
  o.traverse((x) => {
    if (!x.isMesh) return;
    for (let p = x; p; p = p.parent) if (!p.visible) return;
    if (x.name.startsWith("terreno")) return;
    b.expandByObject(x);
  });
  return b;
}
function voar(pos, alvo, suave) {
  if (suave && !calmo) voo = { de: cam.position.clone(), para: pos, alvoDe: ctl.target.clone(), alvoPara: alvo, t: 0 };
  else {
    voo = null;
    cam.position.copy(pos);
    ctl.target.copy(alvo);
  }
}
function enquadrar(suave) {
  if (!R || !atual) return;
  const esf = caixaVisivel(atual.obj).getBoundingSphere(new THREE.Sphere());
  const fovV = THREE.MathUtils.degToRad(cam.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * cam.aspect);
  const d = (esf.radius / Math.sin(Math.min(fovV, fovH) / 2)) * (cam.aspect < 1 ? 1.02 : 0.84);
  const alvo = esf.center.clone();
  voar(alvo.clone().addScaledVector(VISTA, d), alvo, suave);
  ctl.minDistance = Math.max(1.5, esf.radius * 0.12);
  ctl.maxDistance = esf.radius * 5;
  cam.near = Math.max(0.05, esf.radius * 0.005);
  cam.far = esf.radius * 20;
  cam.updateProjectionMatrix();
  sol.target.position.copy(esf.center);
  sol.position.copy(esf.center).addScaledVector(SOL, esf.radius * 3);
  const sc = sol.shadow.camera;
  sc.left = sc.bottom = -esf.radius * 1.1;
  sc.right = sc.top = esf.radius * 1.1;
  sc.near = 0.1;
  sc.far = esf.radius * 6;
  sc.updateProjectionMatrix();
}
function descartarPlanta(a) {
  cena.remove(a.obj);
  a.obj.traverse((x) => {
    if (!x.isMesh) return;
    x.geometry.dispose();
    for (const m of Array.isArray(x.material) ? x.material : [x.material]) {
      m.map?.dispose();
      m.dispose();
    }
  });
}

/* ---------------- escolha da planta ---------------- */
const terreas = () => indice.filter((e) => e.andares === 1);
function escolhaSalva() { try { return localStorage.getItem("escritorio3d.planta") || "auto"; } catch { return "auto"; } }
function salvarEscolha(v) { try { localStorage.setItem("escritorio3d.planta", v); } catch { /* sem armazenamento: vale só nesta visita */ } }
function plantaPara(n) {
  const lista = terreas();
  const fixa = selPlanta.value;
  if (fixa !== "auto" && lista.some((e) => e.id === fixa)) return fixa;
  const sugerida = dados.equipe && dados.equipe.escritorio3d; // opcional em estado/equipe.json: "escritorio3d": "comercial"
  if (typeof sugerida === "string" && lista.some((e) => e.id === sugerida)) return sugerida;
  for (const id of AUTOMATICAS) {
    const e = lista.find((x) => x.id === id);
    if (e && e.postos_de_trabalho >= n) return id;
  }
  return (lista.find((e) => e.id === AUTOMATICAS[AUTOMATICAS.length - 1]) || lista[lista.length - 1] || indice[0]).id;
}
function lugaresDa(planta) { // mesa do orquestrador (diretoria) e a fila de mesas para os outros agentes
  const tipo = new Map(planta.salas.map((s) => [s.nome, s.tipo]));
  const postos = planta.assentos.filter((s) => s.trabalho && s.andar === 0);
  const chefe = postos.find((s) => s.movel === "cadeira-diretor") || null;
  // primeiro as mesas viradas para a câmera (dá para ver o rosto de quem trabalha), depois as de costas
  const deFrente = (s) => VISTA.x * Math.sin(s.yaw) + VISTA.z * Math.cos(s.yaw) > 0;
  const ordem = (l) => [...l.filter(deFrente), ...l.filter((s) => !deFrente(s))];
  const equipe = ordem(postos.filter((s) => s !== chefe && tipo.get(s.sala) === "trabalho"));
  const resto = ordem(postos.filter((s) => s !== chefe && tipo.get(s.sala) !== "trabalho"));
  return { chefe, fila: [...equipe, ...resto] };
}

/* ---------------- montar a cena para a equipe atual ---------------- */
function limparGente() {
  for (const p of pessoas.values()) {
    p.mixer.stopAllAction();
    p.o.removeFromParent();
    p.anel.removeFromParent();
    p.anel.geometry.dispose();
    p.anel.material.dispose();
    p.el.remove();
  }
  pessoas.clear();
}
async function abrirPlanta(id, minha) {
  const item = indice.find((e) => e.id === id);
  carregando(`Carregando ${item.nome}…`);
  const [g, planta] = await Promise.all([loader.loadAsync(url(item.arquivo)), json(item.dados)]);
  if (minha !== geracao) return false;
  if (atual) descartarPlanta(atual);
  const obj = g.scene;
  prepararSombra(obj);
  obj.traverse((x) => { if (x.userData && x.userData.teto) x.visible = false; }); // sem teto, para ver por dentro
  cena.add(obj);
  atual = { id, item, dados: planta, obj };
  enquadrar(false);
  return true;
}
async function sentar(ag, lugar, i, minha) {
  const modelo = funcs.some((f) => f.id === ag.boneco) ? ag.boneco : BONECOS[i % BONECOS.length]; // opcional em equipe.json: "boneco": "funcionario-03"
  const g = await boneco(modelo);
  if (minha !== geracao) return;
  const o = g.scene.clone(true);
  const emPe = lugar.pose === "stand";
  o.position.set(lugar.x, lugar.y + (emPe ? 0 : lugar.altura - SENTADO), lugar.z);
  o.rotation.y = lugar.yaw;
  prepararSombra(o);
  const cor = corDe(ag);
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.6, 48),
    new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  );
  anel.rotation.x = -Math.PI / 2;
  anel.position.set(lugar.x, lugar.y + 0.02, lugar.z);
  anel.renderOrder = 2;

  const rot = el("button", "rotulo livre");
  rot.type = "button";
  rot.tabIndex = -1; // a lista Equipe faz o mesmo e é alcançável pelo teclado
  rot.style.setProperty("--c", cor);
  const balao = el("span", "balao");
  const placa = el("span", "placa");
  placa.append(el("i"), el("span", null, ag.nome || ag.id));
  rot.append(balao, placa);
  rot.addEventListener("click", () => focar(ag.id));
  camadaRotulos.append(rot);

  const p = { ag, lugar, o, mixer: new THREE.AnimationMixer(o), clips: g.animations, acao: null, clipe: null, anel, el: rot, elBalao: balao, estado: "livre", topo: lugar.y + 1.5, nasce: calmo ? 1 : 0 };
  pessoas.set(ag.id, p);
  tocar(p, CLIPE_LIVRE[lugar.pose] || "sentado", true);
  p.mixer.update(0);
  o.updateMatrixWorld(true);
  p.topo = new THREE.Box3().setFromObject(o).max.y + 0.1; // o rótulo fica logo acima da cabeça, já na pose sentada
  if (!calmo) o.scale.setScalar(0.001);
  gente.add(o, anel);
}
async function montar() {
  if (!R || !indice.length) return;
  const minha = ++geracao;
  const ags = agentes();
  try {
    const id = plantaPara(ags.length);
    const trocou = !atual || atual.id !== id;
    if (trocou) {
      limparGente();
      if (!(await abrirPlanta(id, minha))) return;
    }
    if (minha !== geracao) return;
    limparGente();
    const { chefe, fila } = lugaresDa(atual.dados);
    const livres = [...fila];
    const orq = ags.find((a) => a.id === "orquestrador") || ags[0];
    const pares = [];
    semLugar = new Set();
    ags.forEach((ag, i) => {
      const lugar = ag === orq && chefe ? chefe : livres.shift();
      if (lugar) pares.push(sentar(ag, lugar, ag === orq ? 0 : i + (ags[0] === orq ? 0 : 1), minha));
      else semLugar.add(ag.id);
    });
    await Promise.all(pares);
    if (minha !== geracao) return;
    carregando(null);
    recado(ags.length ? null : ["Nenhum agente em estado/equipe.json ainda. Rode node scripts/iniciar.mjs para montar a equipe."]);
    if (foco && !pessoas.has(foco)) foco = null;
    camadaRotulos.classList.toggle("muitos", pessoas.size > 6);
    atualizar();
  } catch (e) {
    console.error(e);
    if (minha === geracao) carregando("Não deu para abrir o escritório 3D. Recarregue a página ou abra o painel 2D.");
  }
}

/* ---------------- animação por estado ---------------- */
function tocar(p, nome, jaJa) {
  if (p.clipe === nome) return;
  const clip = THREE.AnimationClip.findByName(p.clips, nome) || THREE.AnimationClip.findByName(p.clips, "sentado") || p.clips[0];
  if (!clip) return;
  const nova = p.mixer.clipAction(clip);
  nova.reset();
  nova.time = Math.random() * clip.duration; // cada um no seu ritmo
  if (calmo || jaJa || !p.acao) {
    if (p.acao) p.acao.stop();
    nova.play();
    if (calmo) p.mixer.update(0); // com "reduzir movimento", só a pose muda
  } else {
    nova.play();
    p.acao.crossFadeTo(nova, 0.45, false);
  }
  p.acao = nova;
  p.clipe = nome;
}
function aplicarEstado(p, st, e) {
  p.estado = st;
  tocar(p, st === "trabalhando" ? CLIPE_TRABALHANDO[p.lugar.pose] || "digitando" : CLIPE_LIVRE[p.lugar.pose] || "sentado");
  p.el.className = "rotulo " + st + (foco === p.ag.id ? " foco" : "");
  const txt = st === "livre" ? "" : curto(textoDe(st, e), 80);
  if (p.elBalao.textContent !== txt) p.elBalao.textContent = txt;
  p.anel.material.opacity = st === "livre" ? 0.5 : 0.95;
  if (st !== "trabalhando") p.anel.scale.setScalar(1);
}

/* ---------------- foco ---------------- */
function focar(id) {
  foco = id;
  const p = pessoas.get(id);
  if (p && R) {
    const alvo = new THREE.Vector3(p.lugar.x, p.lugar.y + 0.9, p.lugar.z);
    voar(alvo.clone().addScaledVector(VISTA, cam.aspect < 1 ? 11 : 7.5), alvo, true); // em tela em pé, mais longe: cabe a mesa inteira
  }
  if (pequeno) fecharGaveta();
  atualizar();
}
$("#enquadrar").addEventListener("click", () => {
  foco = null;
  enquadrar(true);
  atualizar();
});

/* ---------------- lista, feed e totais ---------------- */
const itens = new Map(); // id -> { li, nome, funcao, oque, status } (atualiza no lugar: o foco do teclado não se perde)
let chaveEquipe = "", chaveFeed = "", chaveGastos = "";
function listaEquipe(ags, d) {
  const ul = $("#equipe");
  const chave = ags.map((a) => a.id).join("|");
  if (chave !== chaveEquipe) {
    chaveEquipe = chave;
    ul.textContent = "";
    itens.clear();
    if (!ags.length) ul.append(el("li", "vazio", "Nenhum agente em estado/equipe.json ainda."));
    for (const ag of ags) {
      const li = el("li"), b = el("button");
      b.type = "button";
      const ponto = el("span", "ponto"), quem = el("span", "quem"), nome = el("span", "nome"), funcao = el("span", "funcao"), oque = el("span", "oque"), status = el("span", "status");
      quem.append(nome, funcao, oque);
      b.append(ponto, quem, status);
      b.addEventListener("click", () => focar(ag.id));
      li.append(b);
      ul.append(li);
      itens.set(ag.id, { li, ponto, nome, funcao, oque, status });
    }
  }
  for (const ag of ags) {
    const it = itens.get(ag.id), e = d.ult[ag.id], st = estadoDe(e);
    it.li.className = st + (foco === ag.id ? " foco" : "");
    it.ponto.style.setProperty("--c", corDe(ag));
    const poe = (n, t) => { if (n.textContent !== t) n.textContent = t; };
    poe(it.nome, ag.nome || ag.id);
    poe(it.funcao, (ag.funcao || "") + (semLugar.has(ag.id) ? " (sem mesa nesta planta)" : ""));
    poe(it.oque, curto(textoDe(st, e), 120));
    poe(it.status, ROTULO[st]);
  }
}
function listaFeed(ags) {
  const rec = (dados.eventos || []).slice(-20).reverse();
  const chave = rec.length + "|" + (rec[0] ? rec[0].t + rec[0].agente + rec[0].evento : "") + "|" + Math.floor(Date.now() / 30000);
  if (chave === chaveFeed) return;
  chaveFeed = chave;
  const feed = $("#feed");
  const rolagem = feed.scrollTop;
  feed.textContent = "";
  if (!rec.length) feed.append(el("div", "vazio", "Nenhum agente trabalhou ainda. Peça uma tarefa ao orquestrador."));
  for (const e of rec) {
    if (!e || !e.agente) continue;
    const ag = ags.find((a) => a.id === e.agente) || {};
    const it = el("div", "item"), dot = el("i"), tx = el("div");
    dot.style.setProperty("--c", corDe(ag.id ? ag : { id: e.agente }));
    const verbo = e.evento === "inicio" ? "começou" : e.evento === "fim" ? "terminou" : e.evento === "erro" ? "teve um erro em" : e.evento === "custo" ? "gastou em" : e.evento || "";
    tx.append(el("span", null, (ag.nome || e.agente) + " " + verbo + (e.tarefa ? ": " + e.tarefa : "")), el("small", null, quando(e.t)));
    it.append(dot, tx);
    feed.append(it);
  }
  feed.scrollTop = rolagem;
}
function listaGastos(ags, d) {
  const chave = ags.map((a) => a.id + ":" + (d.gasto[a.id] || 0).toFixed(4)).join("|");
  if (chave === chaveGastos) return;
  chaveGastos = chave;
  const gastos = $("#gastos");
  gastos.textContent = "";
  const max = Math.max(0.0001, ...ags.map((a) => d.gasto[a.id] || 0));
  for (const ag of ags) {
    const v = d.gasto[ag.id] || 0, w = el("div"), l = el("div", "l"), b = el("div", "b"), s = el("span");
    l.append(el("span", null, ag.nome || ag.id), el("b", null, usd(v)));
    s.style.width = Math.round((v / max) * 100) + "%";
    s.style.setProperty("--c", corDe(ag));
    b.append(s);
    w.append(l, b);
    gastos.append(w);
  }
}
function atualizar() {
  const d = derivar(), ags = agentes();
  let ativos = 0, agora = null; // agora: quem começou a trabalhar por último (resumo da gaveta no celular)
  for (const ag of ags) {
    const e = d.ult[ag.id], st = estadoDe(e);
    if (st === "trabalhando") {
      ativos++;
      if (!agora || new Date(e.t) > new Date(agora.e.t)) agora = { ag, e };
    }
    const p = pessoas.get(ag.id);
    if (p) aplicarEstado(p, st, e);
  }
  $("#t-ativos").textContent = ativos;
  $("#t-tarefas").textContent = d.tarefas;
  $("#t-custo").textContent = usd(d.custo);
  $("#puxador-resumo").textContent = agora
    ? `${agora.ag.nome || agora.ag.id}: ${curto(agora.e.tarefa || "trabalhando", 60)}`
    : demonstracao
      ? `${ags.length} ${ags.length === 1 ? "agente" : "agentes"} · demonstração`
      : `${ags.length} ${ags.length === 1 ? "agente" : "agentes"} · tarefas hoje: ${d.tarefas} · gasto hoje: ${usd(d.custo)}`;
  listaEquipe(ags, d);
  listaFeed(ags);
  listaGastos(ags, d);
}
function sincronizar() { // chegou estado novo: remonta a cena só se a equipe ou a planta mudou
  const ags = agentes();
  const nova = ags.map((a) => a.id + ":" + (a.boneco || "") + ":" + corDe(a) + ":" + (a.nome || "")).join("|") + "#" + selPlanta.value + "#" + ((dados.equipe && dados.equipe.escritorio3d) || "");
  if (nova !== assinatura) {
    assinatura = nova;
    montar();
  }
  atualizar();
}

/* ---------------- laço de desenho ---------------- */
const ponto = new THREE.Vector3();
function posicionarRotulos() {
  const w = palco.clientWidth, h = palco.clientHeight;
  for (const p of pessoas.values()) {
    ponto.set(p.lugar.x, p.topo, p.lugar.z).project(cam);
    const fora = ponto.z < -1 || ponto.z > 1;
    p.el.style.visibility = fora ? "hidden" : "visible";
    if (fora) continue;
    const x = (ponto.x * 0.5 + 0.5) * w, y = (-ponto.y * 0.5 + 0.5) * h;
    p.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    // quem está mais perto fica por cima; quem tem algo a dizer (trabalhando, concluído, erro) e o agente em foco, acima de todos
    p.el.style.zIndex = String(Math.round((1 - ponto.z) * 100000) + (p.estado === "livre" ? 0 : 100000) + (foco === p.ag.id ? 200000 : 0));
  }
}
if (R) {
  const relogio = new THREE.Clock();
  let tempo = 0;
  R.setAnimationLoop(() => {
    const dt = Math.min(relogio.getDelta(), 0.05);
    tempo += dt;
    if (voo) {
      voo.t = Math.min(1, voo.t + dt * 1.6);
      const k = 1 - Math.pow(1 - voo.t, 3);
      cam.position.lerpVectors(voo.de, voo.para, k);
      ctl.target.lerpVectors(voo.alvoDe, voo.alvoPara, k);
      if (voo.t >= 1) voo = null;
    }
    ctl.update();
    for (const p of pessoas.values()) {
      if (!calmo) p.mixer.update(dt);
      if (p.nasce < 1) { // chega "crescendo" no lugar em ~0,3 s
        p.nasce = Math.min(1, p.nasce + dt * 3.5);
        p.o.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - p.nasce, 3)));
      }
      if (p.estado === "trabalhando" && !calmo) p.anel.scale.setScalar(1 + 0.07 * Math.sin(tempo * 4)); // o anel pulsa enquanto trabalha
    }
    R.render(cena, cam);
    posicionarRotulos();
  });
}

/* ---------------- início ---------------- */
function conectar() {
  const c = $("#conexao"), es = new EventSource("../api/stream");
  es.onmessage = (m) => {
    try {
      dados = JSON.parse(m.data);
      recebeu = true;
      c.textContent = "ao vivo";
      c.classList.add("on");
      sincronizar();
    } catch { /* mensagem quebrada: ignora */ }
  };
  es.onerror = () => {
    c.textContent = "reconectando";
    c.classList.remove("on");
  };
}
// Modo demonstração: quando a página é publicada sem o servidor do escritório (ex.: Vercel), o script
// scripts/publicar-vercel.mjs põe um demo.json ao lado desta página. No computador ele não existe e o painel fica ao vivo.
async function lerDemo() {
  try {
    const r = await fetch("./demo.json", { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.equipe && Array.isArray(j.equipe.agentes) ? j : null;
  } catch {
    return null;
  }
}
function iniciarDemonstracao(demo) {
  demonstracao = true;
  document.body.classList.add("demo");
  const c = $("#conexao");
  c.textContent = "demonstração";
  c.classList.add("on");
  const aviso = $(".aviso");
  if (aviso) aviso.textContent = typeof demo.aviso === "string" ? demo.aviso : "Demonstração: a atividade desta página é simulada.";
  const link2d = document.querySelector('a.chip[href="../"]');
  if (link2d) link2d.hidden = true; // o painel 2D precisa do servidor do escritório
  dados = { equipe: demo.equipe, eventos: [] };
  recebeu = true;
  sincronizar();
  const ids = agentes().map((a) => a.id).filter((id) => id !== "orquestrador");
  if (!ids.length) return;
  const temOrq = agentes().some((a) => a.id === "orquestrador");
  const tarefas = demo.tarefas && typeof demo.tarefas === "object" ? demo.tarefas : {};
  const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
  const tarefaDe = (id) => sorteia(Array.isArray(tarefas[id]) && tarefas[id].length ? tarefas[id] : ["Tarefa de exemplo"]);
  const nomeDe = (id) => (agentes().find((a) => a.id === id) || {}).nome || id;
  const ev = (o) => { // "teste": true = evento falso: aparece na tela, mas não conta como tarefa nem gasto
    dados.eventos.push({ t: new Date().toISOString(), custo_usd: 0, teste: true, ...o });
    if (dados.eventos.length > 80) dados.eventos.splice(0, dados.eventos.length - 80);
    atualizar();
  };
  const ocupados = new Set();
  const rodada = () => {
    const livres = ids.filter((id) => !ocupados.has(id));
    if (!livres.length) return;
    const id = sorteia(livres), tarefa = tarefaDe(id);
    ocupados.add(id);
    if (temOrq) {
      ev({ agente: "orquestrador", evento: "inicio", tarefa: "Distribuir: " + tarefa });
      setTimeout(() => ev({ agente: "orquestrador", evento: "fim", tarefa: "Distribuir: " + tarefa, resultado: "Pedido entregue a " + nomeDe(id) }), 1500);
    }
    ev({ agente: id, evento: "inicio", tarefa });
    setTimeout(() => {
      ocupados.delete(id);
      ev({ agente: id, evento: "fim", tarefa, resultado: "Rascunho pronto para o dono revisar" });
    }, 5000 + Math.random() * 5000);
  };
  rodada();
  setTimeout(rodada, 1800);
  setInterval(rodada, 4500);
}
selPlanta.addEventListener("change", () => {
  salvarEscolha(selPlanta.value);
  if (recebeu) sincronizar();
});
(async () => {
  try {
    const [esc, fu] = await Promise.all([json("escritorios/indice.json"), json("funcionarios/funcionarios.json")]);
    indice = esc.escritorios;
    funcs = fu.funcionarios;
    selPlanta.append(new Option("Planta automática", "auto"));
    for (const e of terreas()) selPlanta.append(new Option(`${e.nome} (${e.postos_de_trabalho} mesas)`, e.id));
    const salva = escolhaSalva();
    selPlanta.value = [...selPlanta.options].some((o) => o.value === salva) ? salva : "auto";
  } catch (e) {
    console.error(e);
    carregando(null);
    recado(["Não achei o pacote 3D em visual/app/public/escritorio-3d/. A lista ao lado continua funcionando; o ", ["painel 2D", "../"], " também."]);
    indice = []; // sem pacote não há cena: fica só a lista
  }
  const demo = await lerDemo();
  if (demo) iniciarDemonstracao(demo);
  else conectar();
  setInterval(atualizar, 2000); // estados que mudam com o tempo ("concluído" some em 8 s)
})();
