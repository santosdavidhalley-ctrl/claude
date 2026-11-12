// Visualizador do pacote 3D: escolhe o escritório, gira, aproxima e coloca funcionários nos lugares livres.
// Só three.js (pasta vendor/). Os dados vêm de ../escritorios/ e ../funcionarios/.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const DADOS = new URL("../", document.baseURI); // raiz do pacote
const url = (rel) => new URL(rel, DADOS).href;
const $ = (s) => document.querySelector(s);
const SENTADO = 0.47; // altura de assento usada nos clipes sentados
const CLIPE_DA_POSE = { type: "digitando", laptop: "notebook", rest: "sentado", lounge: "sofa", stand: "digitando_em_pe" };
const SOL = new THREE.Vector3(-0.62, 0.44, 0.65).normalize();
const VISTA = new THREE.Vector3(0.95, 1.05, 1.25).normalize();
const nomeAndar = (n) => (n === 0 ? "Térreo" : `${n}º andar`);

/* ---------------- cena ---------------- */
const canvas = $("#cena");
const pequeno = matchMedia("(max-width: 760px)").matches;
let R;
try {
  R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch {
  $("#carregando-txt").textContent = "Este navegador não abriu o 3D. Tente outro navegador ou o computador.";
  throw new Error("sem WebGL");
}
R.setPixelRatio(Math.min(devicePixelRatio, pequeno ? 1.5 : 2));
R.outputColorSpace = THREE.SRGBColorSpace;
R.toneMapping = THREE.ACESFilmicToneMapping;
R.shadowMap.enabled = !pequeno;
R.shadowMap.type = THREE.PCFSoftShadowMap;

const cena = new THREE.Scene();
cena.background = new THREE.Color("#ece2d6");
cena.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
cena.environmentIntensity = 0.55;
cena.add(new THREE.HemisphereLight("#f3dcc2", "#6d5b47", 0.9));
const sol = new THREE.DirectionalLight("#ffd2a6", 2.6);
sol.castShadow = R.shadowMap.enabled;
sol.shadow.mapSize.set(2048, 2048);
sol.shadow.bias = -0.0003;
sol.shadow.normalBias = 0.03;
cena.add(sol, sol.target);

const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 3000);
const ctl = new OrbitControls(cam, canvas);
ctl.enableDamping = true;
ctl.dampingFactor = 0.08;
ctl.maxPolarAngle = Math.PI * 0.48;
ctl.screenSpacePanning = false;

function redimensionar() {
  R.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
}
addEventListener("resize", redimensionar);
redimensionar();

/* ---------------- interface ---------------- */
const selEsc = $("#escritorio");
const selAndar = $("#andar");
const btnTeto = $("#teto");
let avisoT = 0;
function aviso(msg) {
  const a = $("#aviso");
  a.textContent = msg;
  a.classList.add("on");
  clearTimeout(avisoT);
  avisoT = setTimeout(() => a.classList.remove("on"), 2600);
}
function carregando(txt) {
  const c = $("#carregando");
  if (txt === null) return c.classList.add("fora");
  c.classList.remove("fora");
  $("#carregando-txt").textContent = txt;
}
const raiz = document.documentElement.dataset;
if (raiz.download) Object.assign($("#baixar"), { href: raiz.download, hidden: false });
if (raiz.voltar) Object.assign($("#voltar"), { href: raiz.voltar, hidden: false });
let dicaFora = false;
canvas.addEventListener("pointerdown", () => {
  if (dicaFora) return;
  dicaFora = true;
  setTimeout(() => $("#dica").classList.add("fora"), 1200);
});

/* ---------------- dados ---------------- */
const loader = new GLTFLoader();
let indice = [];
let funcs = [];
let atual = null; // { item, dados, obj, andares: Map, tetos: [], pessoas: [], ocupados: Set }
let proximoLook = Math.floor(Math.random() * 8);
const looks = new Map();

async function json(rel) {
  const r = await fetch(url(rel));
  if (!r.ok) throw new Error(`${rel}: ${r.status}`);
  return r.json();
}

function look(i) {
  const f = funcs[i % funcs.length];
  if (!looks.has(f.id)) looks.set(f.id, loader.loadAsync(url(f.arquivo)));
  return looks.get(f.id);
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

function enquadrar(suave = false) {
  const esf = caixaVisivel(atual.obj).getBoundingSphere(new THREE.Sphere());
  const fovV = THREE.MathUtils.degToRad(cam.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * cam.aspect);
  const d = (esf.radius / Math.sin(Math.min(fovV, fovH) / 2)) * (pequeno ? 1.1 : 0.86);
  const alvo = esf.center.clone();
  const pos = alvo.clone().addScaledVector(VISTA, d);
  if (suave) voo = { de: cam.position.clone(), para: pos, alvoDe: ctl.target.clone(), alvoPara: alvo, t: 0 };
  else {
    cam.position.copy(pos);
    ctl.target.copy(alvo);
  }
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
let voo = null;

function andarAtivo() {
  if (selAndar.value !== "todos") return Number(selAndar.value);
  return Math.max(...atual.andares.keys());
}

function aplicarAndar(enq = true) {
  const v = selAndar.value;
  for (const [n, g] of atual.andares) g.visible = v === "todos" || n <= Number(v);
  for (const t of atual.tetos) t.visible = v === "todos" && btnTeto.getAttribute("aria-pressed") === "true";
  if (enq) enquadrar(true);
}

function contar() {
  const total = atual.dados.assentos.length;
  $("#contagem").innerHTML = `<b>${atual.pessoas.length}</b> / ${total} lugares`;
}

function info() {
  const d = atual.dados;
  const postos = d.postos_de_trabalho ?? d.assentos.filter((s) => s.trabalho).length;
  const el = $("#info");
  el.innerHTML = "";
  const h = document.createElement("h1");
  h.textContent = d.nome;
  const p = document.createElement("p");
  p.textContent = d.descricao;
  const ul = document.createElement("ul");
  for (const t of [d.andares > 1 ? `${d.andares} andares` : "1 andar", `${postos} postos de trabalho`, `${d.assentos.length} lugares`]) {
    const li = document.createElement("li");
    li.textContent = t;
    ul.append(li);
  }
  el.append(h, p, ul);
}

function descartar(a) {
  for (const f of a.pessoas) f.mixer.stopAllAction();
  cena.remove(a.obj);
  a.obj.traverse((x) => {
    if (!x.isMesh || x.userData.pessoa) return;
    x.geometry.dispose();
    for (const m of Array.isArray(x.material) ? x.material : [x.material]) {
      m.map?.dispose();
      m.dispose();
    }
  });
}

let pedido = 0;
async function abrir(id) {
  const item = indice.find((e) => e.id === id) ?? indice[0];
  const meu = ++pedido;
  carregando(`Carregando ${item.nome}…`);
  selEsc.value = item.id;
  try {
    const [g, dados] = await Promise.all([
      loader.loadAsync(url(item.arquivo), (ev) => {
        if (meu === pedido && ev.total) carregando(`Carregando ${item.nome}… ${Math.round((ev.loaded / ev.total) * 100)}%`);
      }),
      json(item.dados),
    ]);
    if (meu !== pedido) return;
    if (atual) descartar(atual);
    const obj = g.scene;
    prepararSombra(obj);
    const andares = new Map();
    const tetos = [];
    obj.traverse((x) => {
      const m = /^andar_(\d+)$/.exec(x.name);
      if (m) andares.set(Number(m[1]), x);
      if (x.userData?.teto) tetos.push(x);
    });
    cena.add(obj);
    atual = { item, dados, obj, andares, tetos, pessoas: [], ocupados: new Set() };
    selAndar.innerHTML = "";
    const n = [...andares.keys()].sort((a, b) => a - b);
    selAndar.append(new Option(n.length > 1 ? "Prédio inteiro" : "Andar", "todos"));
    for (const k of n) selAndar.append(new Option(nomeAndar(k), String(k)));
    $("#campo-andar").hidden = n.length < 2;
    btnTeto.setAttribute("aria-pressed", "false");
    aplicarAndar(false);
    enquadrar();
    info();
    contar();
    // caminho absoluto: no site a página tem <base> na pasta do visualizador e "#id" sozinho mudaria a URL
    history.replaceState(null, "", `${location.pathname}${location.search}#${item.id}`);
    carregando(null);
  } catch (e) {
    console.error(e);
    if (meu === pedido) carregando(`Não deu para abrir ${item.nome}. Recarregue a página.`);
  }
}

/* ---------------- funcionários ---------------- */
function proximoAssento() {
  const ativo = andarAtivo();
  const livres = atual.dados.assentos.filter((s) => !atual.ocupados.has(s.id) && s.andar === ativo);
  // primeiro as mesas de trabalho, depois reunião, sofás e o resto
  return livres.find((s) => s.trabalho) ?? livres[0] ?? null;
}

async function adicionar(qtd) {
  if (!atual) return;
  for (let k = 0; k < qtd; k++) {
    const s = proximoAssento();
    if (!s) {
      const outros = atual.dados.assentos.some((q) => !atual.ocupados.has(q.id));
      aviso(outros ? `${selAndar.value === "todos" ? "O andar de cima" : nomeAndar(andarAtivo())} lotou. Escolha outro andar.` : "Todos os lugares estão ocupados.");
      break;
    }
    atual.ocupados.add(s.id);
    const alvo = atual;
    const g = await look(proximoLook++);
    if (alvo !== atual) return;
    const o = g.scene.clone(true);
    o.traverse((x) => (x.userData.pessoa = true));
    const sentado = s.pose !== "stand";
    o.position.set(s.x, s.y + (sentado ? s.altura - SENTADO : 0), s.z);
    o.rotation.y = s.yaw;
    o.scale.setScalar(0.001);
    prepararSombra(o);
    const mixer = new THREE.AnimationMixer(o);
    const clip = THREE.AnimationClip.findByName(g.animations, CLIPE_DA_POSE[s.pose] ?? "sentado") ?? g.animations[0];
    if (clip) {
      const acao = mixer.clipAction(clip).play();
      acao.time = Math.random() * clip.duration;
    }
    (atual.andares.get(s.andar) ?? atual.obj).add(o);
    atual.pessoas.push({ o, mixer, s, nasce: 0 });
    contar();
  }
}

function tirar(o) {
  const i = atual.pessoas.findIndex((p) => p.o === o);
  if (i < 0) return;
  const [p] = atual.pessoas.splice(i, 1);
  p.mixer.stopAllAction();
  p.o.removeFromParent();
  atual.ocupados.delete(p.s.id);
  contar();
}

function limpar() {
  if (!atual) return;
  for (const p of atual.pessoas) {
    p.mixer.stopAllAction();
    p.o.removeFromParent();
  }
  atual.pessoas = [];
  atual.ocupados.clear();
  contar();
}

// toque curto num funcionário tira ele do lugar
const ray = new THREE.Raycaster();
let toque = null;
canvas.addEventListener("pointerdown", (e) => (toque = { x: e.clientX, y: e.clientY, t: performance.now() }));
canvas.addEventListener("pointerup", (e) => {
  if (!toque || !atual?.pessoas.length) return;
  const curto = Math.hypot(e.clientX - toque.x, e.clientY - toque.y) < 6 && performance.now() - toque.t < 450;
  toque = null;
  if (!curto) return;
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), cam);
  const hit = ray.intersectObjects(atual.pessoas.filter((p) => p.o.parent?.visible !== false).map((p) => p.o), true)[0];
  if (!hit) return;
  let o = hit.object;
  while (o && !atual.pessoas.some((p) => p.o === o)) o = o.parent;
  if (o) {
    tirar(o);
    aviso("Funcionário saiu do lugar.");
  }
});

$("#mais").addEventListener("click", () => adicionar(1));
$("#mais10").addEventListener("click", () => adicionar(10));
$("#limpar").addEventListener("click", limpar);
btnTeto.addEventListener("click", () => {
  const on = btnTeto.getAttribute("aria-pressed") !== "true";
  btnTeto.setAttribute("aria-pressed", String(on));
  if (on && selAndar.value !== "todos") selAndar.value = "todos";
  aplicarAndar(false);
});
selAndar.addEventListener("change", () => aplicarAndar(true));
selEsc.addEventListener("change", () => abrir(selEsc.value));
addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id && id !== atual?.item.id && indice.some((e) => e.id === id)) abrir(id);
});

/* ---------------- laço ---------------- */
const relogio = new THREE.Clock();
R.setAnimationLoop(() => {
  const dt = Math.min(relogio.getDelta(), 0.05);
  if (voo) {
    voo.t = Math.min(1, voo.t + dt * 1.6);
    const k = 1 - Math.pow(1 - voo.t, 3);
    cam.position.lerpVectors(voo.de, voo.para, k);
    ctl.target.lerpVectors(voo.alvoDe, voo.alvoPara, k);
    if (voo.t >= 1) voo = null;
  }
  ctl.update();
  if (atual)
    for (const p of atual.pessoas) {
      p.mixer.update(dt);
      if (p.nasce < 1) {
        // chega "crescendo" do lugar em ~0,3 s
        p.nasce = Math.min(1, p.nasce + dt * 3.5);
        p.o.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - p.nasce, 3)));
      }
    }
  R.render(cena, cam);
});

/* ---------------- início ---------------- */
(async () => {
  try {
    const [esc, fu] = await Promise.all([json("escritorios/indice.json"), json("funcionarios/funcionarios.json")]);
    indice = esc.escritorios;
    funcs = fu.funcionarios;
    for (const e of indice) selEsc.append(new Option(`${e.nome}`, e.id));
    const pedidoHash = location.hash.slice(1);
    const padrao = raiz.inicial && indice.some((e) => e.id === raiz.inicial) ? raiz.inicial : indice[0].id;
    await abrir(indice.some((e) => e.id === pedidoHash) ? pedidoHash : padrao);
    // os bonecos (~0,4 MB cada) já vêm baixando com a página parada, para o "+ Funcionário" ser na hora
    const ocioso = window.requestIdleCallback ?? ((f) => setTimeout(f, 1500));
    ocioso(() => funcs.forEach((_, i) => look(i)));
  } catch (e) {
    console.error(e);
    carregando("Não achei os arquivos do pacote. Abra pelo servir.mjs (veja o COMECE-AQUI.md).");
  }
})();
