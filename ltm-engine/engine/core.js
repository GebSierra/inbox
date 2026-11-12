
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { makeFire } from 'ltm-engine/fire.js';
import { makeStatue } from 'ltm-engine/statue.js';
// ---- town settings: boot.js hands over the town's town.json (see ltm-engine/boot.js) ----
const LTM = globalThis.__LTM, ENGINE = LTM.engine, CFG = LTM.cfg, THEME = CFG.theme;   // ENGINE = absolute URL of ltm-engine/ (kit/, models/ live there)
const BOOK = CFG.book, VERSES = CFG.verses, ZONE = CFG.zones, BUILT = CFG.built, STORE = CFG.store;
const HOOKS = {};                    // a town's world parts may install hooks here (HOOKS.house)
const SHIPS = [], WATER_T = { value: 0 };   // bobbing boats (James harbour) and the shared water-shader clock
const FIRES = [];
// ---- Medieval Village MegaKit (Quaternius, CC0): building pieces loaded before the town is built ----
THREE.Cache.enabled = true;
const KIT = {}, KMAT = {};
// town.json may list what the town really uses (S3): "assets": { "kit": false, "models": ["bird"] }. Missing = load everything, as before.
const ASSETS = CFG.assets || {};
{ const names = ASSETS.kit === false ? [] : ['Wall_Plaster_Straight', 'Wall_Plaster_Window_Wide_Round', 'Wall_Plaster_Window_Thin_Round', 'Wall_Plaster_Door_Round', 'Wall_UnevenBrick_Straight', 'Wall_UnevenBrick_Window_Wide_Round', 'Wall_UnevenBrick_Door_Round',
    'Roof_RoundTiles_4x4', 'Roof_RoundTiles_4x6', 'Roof_RoundTiles_4x8', 'Roof_RoundTiles_6x4', 'Roof_RoundTiles_6x6', 'Roof_RoundTiles_6x8', 'Roof_RoundTiles_8x8', 'Roof_RoundTiles_8x10',
    'WindowShutters_Wide_Round_Open', 'WindowShutters_Thin_Round_Open', 'WindowShutters_Wide_Round_Closed', 'Window_Wide_Round1', 'Window_Thin_Round1', 'Door_1_Round', 'Balcony_Simple_Straight',
    'Prop_Crate', 'Prop_Wagon', 'Prop_Chimney', 'Prop_Vine2', 'Prop_Vine4', 'Prop_Vine6', 'Corner_Exterior_Brick'];
  const loader = new GLTFLoader(); const el = document.getElementById('lpct'), bar = document.getElementById('lbar'); let done = 0;
  if (!names.length && bar) bar.style.width = '80%';
  try { await Promise.all(names.map(n => loader.loadAsync(ENGINE + 'kit/' + n + '.gltf').then(g => { done++; const pc = Math.round(done / names.length * 80); if (el) el.textContent = `Building ${THEME.loadName}… ${pc}%`; if (bar) bar.style.width = pc + '%';
      g.scene.traverse(o => { if (o.isMesh) { const m = o.material; KMAT[m.name] ??= m; o.material = KMAT[m.name]; o.castShadow = o.receiveShadow = true; } }); KIT[n] = g.scene; }))); }
  catch (e) { console.warn('kit failed to load, using simple houses', e); }
}
// Roman stucco instead of northern timber framing: trim becomes pale stone, plaster warmer
for (const [k, m] of Object.entries(KMAT)) { if (k.startsWith('MI_WoodTrim')) { m.color = new THREE.Color('#e8dcc4'); m.map = null; m.needsUpdate = true; } if (k === 'MI_Plaster') { m.color = new THREE.Color(1.25, 1.2, 1.1); m.needsUpdate = true; } }
// S1 (look change, waiting for the owner): solid dark window glass, so the kit's ~570 panes merge instead of drawing one by one, twice.
// On with ?solidglass, or "solidGlass": true in a town's theme.
if ((THEME.solidGlass || new URLSearchParams(location.search).has('solidglass')) && KMAT.MI_WindowGlass) { const g = KMAT.MI_WindowGlass;
  Object.assign(g, { transparent: false, opacity: 1, depthWrite: true, roughness: .22, metalness: .1 }); g.color.set('#2c333b'); g.needsUpdate = true; }
const MODELS = {};
let BIRD_ANIM = null;
try { await Promise.all((ASSETS.models || ['stall', 'table', 'gstall', 'bird']).map(m => new GLTFLoader().loadAsync(`${ENGINE}models/${m}/scene.${m === 'gstall' ? 'glb' : 'gltf'}`).then(g => { g.scene.updateMatrixWorld(true); g.scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (o.material.map) o.material.map.anisotropy = 4; } }); MODELS[m] = g.scene; if (m === 'bird') BIRD_ANIM = g.animations; }))); }
catch (e) { console.warn('models failed to load', e); }
// clone named parts of a model, keeping their layout, re-centred so the bottom-centre sits at the origin
function part(model, names, scale = 1) {
  const src = MODELS[model]; if (!src) return null; const wrap = new THREE.Group(), inner = new THREE.Group(); wrap.add(inner);
  for (const n of [].concat(names)) { const o = src.getObjectByName(n); if (!o) continue; const c = o.clone(true); o.matrixWorld.decompose(c.position, c.quaternion, c.scale); inner.add(c); }
  inner.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(inner), ctr = b.getCenter(new THREE.Vector3());
  inner.position.set(-ctr.x, -b.min.y, -ctr.z); wrap.scale.setScalar(scale); wrap.userData.h = (b.max.y - b.min.y) * scale; return wrap; }
function placePart(g, model, names, x, y, z, scale = 1, ry = 0) { const w = part(model, names, scale); if (!w) return null; w.position.set(x, y, z); w.rotation.y = ry; g.add(w); return y + w.userData.h; }

// ---------- deterministic random ----------
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const R = (a, b) => a + rnd() * (b - a);

// ---------- renderer / scene ----------
// Keeping the drawing buffer costs a full-screen copy every frame on phone GPUs, so only pages that read the canvas back keep it:
// the library page (thumbnails via toDataURL) and ?shots. Playwright screenshots don't need it.
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: /\/library\//.test(location.pathname) || new URLSearchParams(location.search).has('shots') });
const MOBILE = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = THEME.exposure;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const SKY = new THREE.Color(THEME.sky);
scene.fog = new THREE.Fog(SKY, THEME.fog[0], THEME.fog[1]);
const fovFor = a => a >= 1 ? 62 : Math.min(100, 2 * Math.atan(Math.tan(37 * Math.PI / 180) / a) * 180 / Math.PI);
const camera = new THREE.PerspectiveCamera(fovFor(innerWidth / innerHeight), innerWidth / innerHeight, 0.1, 900);
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
const ao = new GTAOPass(scene, camera, innerWidth, innerHeight); ao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.4, thickness: 2, scale: 1.4, samples: 12 }); ao.blendIntensity = .9; composer.addPass(ao);
composer.addPass(new OutputPass());
let useAO = !MOBILE && !new URLSearchParams(location.search).has('fast');

// sky dome gradient
{
  const g = new THREE.SphereGeometry(800, 32, 16);
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(THEME.skyTop) }, bot: { value: new THREE.Color(THEME.skyBot) } },
    vertexShader: 'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,bot;varying float h;void main(){gl_FragColor=vec4(mix(bot,top,smoothstep(0.,.55,h)),1.);}' });
  scene.add(new THREE.Mesh(g, m));
}
scene.add(new THREE.HemisphereLight(THEME.hemi[0], THEME.hemi[1], THEME.hemi[2]));
const sun = new THREE.DirectionalLight(THEME.sun.color, THEME.sun.intensity);
sun.position.set(...THEME.sun.pos); sun.castShadow = true;
sun.shadow.mapSize.set(MOBILE ? 2048 : 4096, MOBILE ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -130, right: 130, top: 130, bottom: -130, near: 1, far: 400 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.4;
scene.add(sun); sun.target.position.set(20, 0, 10); scene.add(sun.target);

// ---------- materials ----------
const M = {};
const mat = (k, c, o = {}) => { if (!M[k]) { M[k] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .9, ...o }); if (globalThis.TEXC && /^(w#|cloth|loomcloth|blanket|rug|couch|cushion|sack|pillow|babyblanket|saddle)/.test(k)) M[k].map = globalThis.TEXC; } return M[k]; };
mat('wall', '#efe6d4'); mat('wallTrim', '#d8c7a6'); mat('roof', '#c4663f'); mat('roofDk', '#a85434');
mat('stone', '#bfb2a0'); mat('stoneDk', '#9e9282'); mat('wood', '#7a5434'); mat('woodLt', '#9a7048');
mat('leaf', THEME.leaf); mat('leafDk', THEME.leafDk); mat('cypress', THEME.cypress); mat('trunk', '#6b4a32');
mat('marble', '#f2ede2'); mat('path', '#d3bd95'); mat('cobble', '#b9ad9a'); mat('window', '#6e5640');
mat('travertine', '#f4f1ea');
mat('tile', '#c96a42'); mat('roofTrim', '#9e4a2e'); mat('fig', '#5b2a4c'); mat('straw', '#d9b866'); mat('pigeon', '#8a8d94'); mat('sack', '#cdb48a'); mat('green', '#6f8a46'); mat('cloak', '#8a5a3a'); mat('wool', '#f3efe6'); mat('dark', '#3a2c22'); mat('clay', '#b9693f'); mat('basket', '#c9a564');

function canvasTex(size, draw, rep = 1) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.userData = { rep }; return t; }
const speck = (x, n, a, b, w) => { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${a},${R(0, b)})`; x.fillRect(R(0, w), R(0, w), R(1, 3), R(1, 3)); } };
const TEX = {
  tile: canvasTex(128, (x, w) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, w);
    for (let r = 0; r < 4; r++) { const y = r * 32; for (let c = 0; c < 8; c++) { const cx = c * 16 + (r % 2) * 8;
      const g = x.createLinearGradient(cx, 0, cx + 16, 0); g.addColorStop(0, '#b9b9b9'); g.addColorStop(.45, '#ffffff'); g.addColorStop(1, '#a8a8a8');
      x.fillStyle = g; x.fillRect(cx, y, 16, 30); x.fillStyle = 'rgba(70,40,30,.35)'; x.fillRect(cx, y + 28, 16, 4); } }
    speck(x, 300, '90,50,30', .15, w); }, .38),
  plaster: canvasTex(128, (x, w) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, w); speck(x, 900, '150,120,90', .12, w); }, .25),
  stone: canvasTex(128, (x, w) => { x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, w, w);
    for (let r = 0; r < 6; r++) for (let c = -1; c < 4; c++) { const bx = c * 40 + (r % 2) * 20, by = r * 21.3; { const v = R(200, 250); x.fillStyle = `rgb(${v | 0},${v * .96 | 0},${v * .9 | 0})`; } x.fillRect(bx + 2, by + 2, 37, 18); }
    speck(x, 400, '60,50,40', .2, w); }, .35),
  flag: canvasTex(256, (x, w) => { x.fillStyle = '#b8ab98'; x.fillRect(0, 0, w, w);
    let ry = 0; while (ry < w) { const rh = R(22, 40); let cx = -R(0, 30); while (cx < w) { const ww = R(24, 56); { const v = R(195, 245); x.fillStyle = `rgb(${v | 0},${v * .95 | 0},${v * .86 | 0})`; }
      x.beginPath(); x.moveTo(cx + R(1, 4), ry + R(1, 4)); x.lineTo(cx + ww - R(1, 4), ry + R(1, 4)); x.lineTo(cx + ww - R(1, 4), ry + rh - R(1, 4)); x.lineTo(cx + R(1, 4), ry + rh - R(1, 4)); x.fill();
      if (rnd() < .15) { x.strokeStyle = 'rgba(90,70,50,.35)'; x.beginPath(); x.moveTo(cx + R(5, ww), ry + 3); x.lineTo(cx + R(5, ww), ry + rh - 3); x.stroke(); } cx += ww; } ry += rh; }
    speck(x, 800, '80,60,40', .18, w); }, .5),
};
TEX.wood = canvasTex(256, (x, w) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, w);
  for (let pl = 0; pl < 4; pl++) { const y0 = pl * 64; x.fillStyle = `rgb(${R(215, 250) | 0},${R(215, 250) | 0},${R(215, 250) | 0})`; x.fillRect(0, y0, w, 64);
    for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(70,45,25,${R(.08, .28)})`; x.lineWidth = R(.6, 2); x.beginPath(); let yy = y0 + R(2, 62); x.moveTo(0, yy); for (let xx = 0; xx <= w; xx += 16) { yy += R(-1.2, 1.2); x.lineTo(xx, Math.max(y0 + 1, Math.min(y0 + 63, yy))); } x.stroke(); }
    if (rnd() > .4) { const kx = R(20, 230), ky = y0 + R(15, 50); x.strokeStyle = 'rgba(60,35,20,.4)'; for (let r = 2; r < 9; r += 2.2) { x.beginPath(); x.ellipse(kx, ky, r * 2.2, r * .8, 0, 0, 7); x.stroke(); } }
    x.fillStyle = 'rgba(40,25,15,.55)'; x.fillRect(0, y0 + 62, w, 2); } }, .45);
TEX.cloth = canvasTex(128, (x, w) => { x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${R(.03, .09)})`; x.fillRect(i, 0, 1, w); x.fillStyle = `rgba(255,255,255,${R(.04, .1)})`; x.fillRect(0, i, w, 1); } speck(x, 500, '0,0,0', .08, w); }, 1.6);
TEX.pot = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(90,50,30,.18)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.fillStyle = 'rgba(60,30,18,.85)'; x.fillRect(0, 86, 256, 6); x.fillRect(0, 122, 256, 4);
  x.strokeStyle = 'rgba(60,30,18,.85)'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 256; i += 16) x.lineTo(i, i % 32 ? 96 : 116); x.stroke();
  x.strokeStyle = 'rgba(40,70,110,.75)'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 256; i += 2) x.lineTo(i, 160 + Math.sin(i / 12) * 5); x.stroke();
  for (let i = 0; i < 1200; i++) { x.fillStyle = `rgba(80,40,20,${R(0, .08)})`; x.fillRect(R(0, 256), R(0, 256), 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; })();
TEX.wicker = (() => { const t = canvasTex(64, (x, w) => { x.fillStyle = '#e8d4a8'; x.fillRect(0, 0, w, w); for (let r = 0; r < 8; r++) for (let c2 = 0; c2 < 8; c2++) { x.fillStyle = (r + c2) % 2 ? 'rgba(90,60,25,.35)' : 'rgba(255,240,200,.25)'; x.fillRect(c2 * 8, r * 8, 8, 8); } for (let r = 0; r < 8; r++) { x.fillStyle = 'rgba(70,45,20,.5)'; x.fillRect(0, r * 8 + 7, w, 1); } }); t.userData = {}; t.repeat.set(6, 3); return t; })();
globalThis.TEXC = TEX.cloth;
mat('_init', '#fff');
for (const k of ['roof', 'roofDk', 'tile']) M[k].map = TEX.tile;
for (const k of ['wall']) M[k].map = TEX.plaster;
for (const k of ['stone', 'stoneDk']) M[k].map = TEX.stone;
for (const k of ['path', 'cobble']) M[k].map = TEX.flag;
for (const k of ['wood', 'woodLt']) M[k].map = TEX.wood; M.wood.color.set('#9a6c46'); M.woodLt.color.set('#c49464');
M.clay.map = TEX.pot; M.clay.flatShading = false; M.clay.roughness = .55; M.clay.color.set('#c47a4a'); M.basket.map = TEX.wicker; M.basket.color.set('#d8b47a');
M.roof.color.set('#d77a4c'); M.roofDk.color.set('#b45c38'); M.stone.color.set(THEME.stone); M.stoneDk.color.set(THEME.stoneDk); M.path.color.set('#ffffff'); M.wall.color.set('#f7efe0');
function worldUV(geo, s) { const p = geo.attributes.position, uv = geo.attributes.uv; if (!uv) return; if (!geo.attributes.normal) geo.computeVertexNormals(); const n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); } else if (ax >= az) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); }
    uv.setXY(i, u * s, v * s); } uv.needsUpdate = true; }
const add = (geo, m, x = 0, y = 0, z = 0, parent = scene) => {
  const mm = typeof m === 'string' ? M[m] : m; if (mm && mm.map && mm.map.userData && mm.map.userData.rep) worldUV(geo, mm.map.userData.rep);
  const mesh = new THREE.Mesh(geo, mm);
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
};
function drape(x0, z0, x1, z1, m, lift = .04) { const w = x1 - x0, d = z1 - z0; const g = new THREE.PlaneGeometry(w, d, Math.ceil(w), Math.ceil(d)); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + x0 + w / 2, z = p.getZ(i) + z0 + d / 2; p.setXYZ(i, x, heightAt(x, z) + lift, z); } g.computeVertexNormals();
  const mesh = add(g, m); mesh.castShadow = false; return mesh; }
const box = (w, h, d, m, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, p);
const cyl = (rt, rb, h, s, m, x, y, z, p) => add(new THREE.CylinderGeometry(rt, rb, h, s), m, x, y + h / 2, z, p);
