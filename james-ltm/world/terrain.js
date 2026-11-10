import { townNE } from 'ltm-town/world/town-ne.js';
const TN = townNE({ THREE, scene, heightAt: (x, z) => heightAt(x, z), add, box, cyl, mat, R: (a, b) => R(a, b) });

// ---------- terrain ----------
const RIVER_X = z => 58 + Math.sin(z * 0.035) * 9 + Math.sin(z * 0.011 + 1) * 6;
const SHORE = -46;   // the coastline; the sea lies south of it
function hRaw(x, z) {
  let h = Math.sin(x * 0.03) * 1.0 + Math.cos(z * 0.025) * .8 + Math.sin((x + z) * 0.05) * 0.4;
  h += (z - SHORE) * 0.09;                                                         // the town climbs from the harbour
  const d = Math.hypot(x - 10, z - 15);
  if (z > SHORE + 20) h += Math.max(0, d - 95) * 0.12 * Math.min(1, (z - SHORE - 20) / 40);   // hills inland
  if (z < SHORE) h = Math.min(h, (z - SHORE) * 0.2 - .3);                            // the beach falls into the sea
  return h;
}
const FLAT = [[0, 54.5, 20.5, 22.5]];   // [cx, cz, halfW, halfD] the agora terrace
const heightAt = (x, z) => { let h = heightAt0(x, z);
  for (const [cx, cz, hw, hd] of FLAT) { const dx = Math.max(0, Math.abs(x - cx) - hw), dz = Math.max(0, Math.abs(z - cz) - hd), d = Math.hypot(dx, dz);
    if (d < 4) { const w = 1 - d / 4, fl = heightAt0(cx, cz); h = h * (1 - w * w * (3 - 2 * w)) + fl * (w * w * (3 - 2 * w)); } }
  return h; };
const TOWN = (x, z) => Math.max(0, 1 - Math.max(0, Math.hypot(x - 15, z - 15) - 65) / 25);
const heightAt0 = (x, z) => hRaw(x, z);
{
  const S = 520, N = 300;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cGrass = new THREE.Color('#b9a964'), cGrass2 = new THREE.Color('#9c9a58'), cDirt = new THREE.Color('#d8bb88'), cBank = new THREE.Color('#ead7a8');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + 15, z = p.getZ(i) + 15; p.setX(i, x); p.setZ(i, z);
    const y = heightAt(x, z); p.setY(i, y);
    const c = cGrass.clone().lerp(cGrass2, (Math.sin(x * .13) * Math.cos(z * .11) + 1) / 2); const n2 = Math.sin(x * .041 + 2) * Math.sin(z * .047) + Math.sin(x * .09 - z * .07) * .5; if (n2 > .55) c.lerp(new THREE.Color('#c8b878'), .35); else if (n2 < -.6) c.lerp(new THREE.Color('#6f8c45'), .4);
    if (x > -70 && x < 46 && z > -40 && z < 78) c.lerp(cDirt, 0.8); else if (Math.hypot(x - 15, z - 15) < 60) c.lerp(cDirt, 0.45);
    if (z < SHORE + 8) c.lerp(cBank, Math.min(1, (SHORE + 8 - z) / 6));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = R(150, 255) | 0; x.fillStyle = `rgba(${v},${v * .96 | 0},${v * .88 | 0},${R(.15, .5)})`; x.fillRect(R(0, 256), R(0, 256), R(1, 4), R(1, 3)); }
    for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(90,110,50,${R(.2, .5)})`; x.lineWidth = 1; const a = R(0, 256), b = R(0, 256); x.beginPath(); x.moveTo(a, b); x.lineTo(a + R(-3, 3), b - R(3, 8)); x.stroke(); }
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(120,110,95,${R(.2, .45)})`; x.beginPath(); x.ellipse(R(0, 256), R(0, 256), R(2, 5), R(1.5, 3.5), R(0, 3), 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(140, 140); t.anisotropy = 8; return t; })();
  const t = add(g.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, map: gtex }));
  t.castShadow = false; t.geometry.computeVertexNormals();
}
// the sea, south of the town
{
  const g = new THREE.PlaneGeometry(900, 520, 1, 1); g.rotateX(-Math.PI / 2);
  const wm = new THREE.MeshStandardMaterial({ color: '#3f8a9a', roughness: .2, metalness: .1, transparent: true, opacity: .94 });
  wm.onBeforeCompile = sh => { sh.uniforms.uT = WATER_T; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vW;').replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float r = sin(vW.z*.7 + uT*1.3 + sin(vW.x*.9)) * sin(vW.x*1.1 - uT*.9 + vW.z*.25);
     float shore = smoothstep(${(SHORE - 9).toFixed(1)}, ${(SHORE - 1).toFixed(1)}, vW.z);
     gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.55,.82,.8), shore * .55);
     gl_FragColor.rgb += vec3(.35,.22,.1) * smoothstep(.65, 1., r) * .35;
     gl_FragColor.rgb += vec3(.25) * shore * (.5 + .5*sin(vW.x*.8 + uT*2.));`); };
  const w = new THREE.Mesh(g, wm); w.position.set(15, -.35, SHORE - 258); w.userData.dyn = 1; w.receiveShadow = true; scene.add(w);
}
// mountains
function mountain(x, z, r, h, c, sub = true) {
  if (sub) for (let i = 0; i < 3; i++) mountain(x + R(-r * .7, r * .7), z + R(-r * .2, r * .5), r * R(.45, .65), h * R(.45, .75), c, false);
  c = new THREE.Color(c).lerp(SKY, Math.min(.3, Math.max(0, (Math.abs(z) - 200) / 450))).getStyle();
  const g = new THREE.ConeGeometry(r, h, 9, 4); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { if (p.getY(i) < h / 2 - .01) { p.setX(i, p.getX(i) * R(.8, 1.15)); p.setZ(i, p.getZ(i) * R(.8, 1.15)); p.setY(i, p.getY(i) + R(-h * .06, h * .06)); } }
  const gg = g.toNonIndexed(); const pp = gg.attributes.position, cols = []; const base = new THREE.Color(c), low = new THREE.Color('#8f9a64'), hi = new THREE.Color(c).offsetHSL(0, -.05, .1), dk = new THREE.Color(c).offsetHSL(0, 0, -.12);
  for (let i = 0; i < pp.count; i += 3) { const yy = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3 / h + .5; const col = yy < .25 ? low.clone().lerp(base, yy * 4) : base.clone().lerp(rnd() > .5 ? hi : dk, R(.1, .6)); for (let k = 0; k < 3; k++) cols.push(col.r, col.g, col.b); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals();
  const m = add(gg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), x, h / 2 - 6, z); m.castShadow = false;
}
mountain(20, 420, 150, 190, '#a8805a'); mountain(-120, 390, 110, 130, '#9a7c5c'); mountain(160, 400, 120, 150, '#ae8a60');
for (let i = 0; i < 9; i++) mountain(-200 + i * 55, 250 + R(-20, 20), R(45, 70), R(25, 45), '#a49a62');
mountain(-230, 110, 90, 70, '#b0a07a'); mountain(270, 120, 100, 80, '#b0a07a'); mountain(-60, 340, 80, 150, '#9c8d7a');
HOOKS.house = (x, z, w, d, floors, rot) => TN.neHouse(x, z, w, d, floors, rot);   // Near-Eastern houses instead of the kit's timber-frame ones
