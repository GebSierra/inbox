// ---------- terrain ----------
const RIVER_X = z => 58 + Math.sin(z * 0.035) * 9 + Math.sin(z * 0.011 + 1) * 6;
function hRaw(x, z) {
  let h = Math.sin(x * 0.03) * 1.6 + Math.cos(z * 0.025) * 1.4 + Math.sin((x + z) * 0.05) * 0.6;
  const d = Math.hypot(x - 10, z - 15);
  h += Math.max(0, d - 95) * 0.12;                         // rolling hills outside town
  const rd = Math.abs(x - RIVER_X(z));
  if (rd < 22) h -= Math.min(1, (1 - rd / 22) * 1.6) * 4.6;              // river valley
  return h;
}
const FLAT = [[0, 2, 18.5, 16.5], [32, 2, 12, 11]];   // [cx, cz, halfW, halfD] temple courtyard, family house
const heightAt = (x, z) => { let h = heightAt0(x, z);
  for (const [cx, cz, hw, hd] of FLAT) { const dx = Math.max(0, Math.abs(x - cx) - hw), dz = Math.max(0, Math.abs(z - cz) - hd), d = Math.hypot(dx, dz);
    if (d < 4) { const w = 1 - d / 4, fl = heightAt0(cx, cz); h = h * (1 - w * w * (3 - 2 * w)) + fl * (w * w * (3 - 2 * w)); } }
  return h; };
const TOWN = (x, z) => Math.max(0, 1 - Math.max(0, Math.hypot(x - 15, z - 15) - 65) / 25); // flatten town
const heightAt0 = (x, z) => {
  const h = hRaw(x, z); const rd = Math.abs(x - RIVER_X(z));
  if (rd < 22) return h; return h * (1 - TOWN(x, z) * 0.85);
};
{
  const S = 520, N = 300;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cGrass = new THREE.Color('#9db163'), cGrass2 = new THREE.Color('#86a053'), cDirt = new THREE.Color('#d6c08f'), cBank = new THREE.Color('#ece6d6');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + 15, z = p.getZ(i) + 15; p.setX(i, x); p.setZ(i, z);
    const y = heightAt(x, z); p.setY(i, y);
    const c = cGrass.clone().lerp(cGrass2, (Math.sin(x * .13) * Math.cos(z * .11) + 1) / 2); const n2 = Math.sin(x * .041 + 2) * Math.sin(z * .047) + Math.sin(x * .09 - z * .07) * .5; if (n2 > .55) c.lerp(new THREE.Color('#c8b878'), .35); else if (n2 < -.6) c.lerp(new THREE.Color('#6f8c45'), .4);
    const rd = Math.abs(x - RIVER_X(z));
    if (rd < 12) c.lerp(cBank, Math.min(1, 1 - Math.max(0, rd - 9.5) / 2.5) * .9);
    if (x > -70 && x < 46 && z > -40 && z < 68 && rd > 14) c.lerp(cDirt, 0.8); else if (Math.hypot(x - 15, z - 15) < 60 && rd > 14) c.lerp(cDirt, 0.45);
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
// river water
{
  const pts = [], W = 9;
  const g = new THREE.BufferGeometry(); const pos = [];
  for (let z = -240; z <= 260; z += 4) pts.push(z);
  for (let i = 0; i < pts.length - 1; i++) {
    const z0 = pts[i], z1 = pts[i + 1], x0 = RIVER_X(z0), x1 = RIVER_X(z1);
    // follow the riverbed: outside town the hills lift the bed above a flat water level
    const wy = z => heightAt(RIVER_X(z), z) + 0.4, y0 = wy(z0), y1 = wy(z1);
    pos.push(x0 - W, y0, z0, x0 + W, y0, z0, x1 - W, y1, z1, x0 + W, y0, z0, x1 + W, y1, z1, x1 - W, y1, z1);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const wm = new THREE.MeshStandardMaterial({ color: '#9ad9d2', roughness: .22, metalness: .05, transparent: true, opacity: .93, side: THREE.DoubleSide });
  wm.onBeforeCompile = sh => { sh.uniforms.uT = WATER_T; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vW;').replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float r = sin(vW.z*.9 + uT*1.6 + sin(vW.x*1.3)) * sin(vW.x*1.7 - uT*1.1 + vW.z*.3);
     float cx = abs(vW.x - (58. + sin(vW.z*.035)*9. + sin(vW.z*.011+1.)*6.));
     float edge = smoothstep(6.5, 8.8, cx);
     gl_FragColor.rgb = mix(gl_FragColor.rgb * vec3(.62,.86,.9), gl_FragColor.rgb, smoothstep(0., 6., cx));
     gl_FragColor.rgb += vec3(.05,.06,.06) * smoothstep(.6, 1., r) + vec3(.22) * edge * (.6 + .4*sin(vW.z*2.+uT*2.));`); };
  const w = new THREE.Mesh(g, wm); w.userData.dyn = 1;
  w.receiveShadow = true; scene.add(w);
  // travertine ledges
  for (let z = -200; z < 220; z += 1.6) for (const sd of [-1, 1]) {
    if (Math.abs(z - 2) < 4 || rnd() < .25) continue;
    const x = RIVER_X(z) + sd * R(8.6, 9.6), y = Math.max(-1.8, heightAt(x, z));
    const b = add(new THREE.DodecahedronGeometry(R(.35, .8), 0), rnd() < .6 ? 'travertine' : 'stoneDk', x, y - .1, z + R(-.5, .5)); b.scale.set(R(1, 1.6), R(.45, .7), R(.9, 1.4)); b.rotation.y = R(0, 6);
    if (rnd() < .5) { const pb = add(new THREE.DodecahedronGeometry(R(.12, .22), 0), 'stone', x + sd * R(.4, 1.2), y + .02, z + R(-.6, .6)); pb.scale.y = .5; }
  }
}
// reeds along the banks
for (let i = 0; i < 260; i++) { const z = R(-120, 140); if (Math.abs(z - 2) < 7) continue; const sd = rnd() > .5 ? 1 : -1, x = RIVER_X(z) + sd * R(8.8, 9.6); const y = Math.max(-1.75, heightAt(x, z)); for (let k = 0; k < 5; k++) { const r = box(.03, R(.6, 1.2), .03, k % 2 ? 'green' : mat('reed', '#9a9a5a'), x + R(-.25, .25), y - .05, z + R(-.25, .25)); r.rotation.z = R(-.25, .25); r.rotation.x = R(-.2, .2); r.castShadow = false; } }
// mountains
function mountain(x, z, r, h, c, sub = true) {
  if (sub) for (let i = 0; i < 3; i++) mountain(x + R(-r * .7, r * .7), z + R(-r * .2, r * .5), r * R(.45, .65), h * R(.45, .75), c, false);
  c = new THREE.Color(c).lerp(SKY, Math.min(.22, Math.max(0, (-z - 200) / 500))).getStyle();
  const g = new THREE.ConeGeometry(r, h, 9, 4); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { if (p.getY(i) < h / 2 - .01) { p.setX(i, p.getX(i) * R(.8, 1.15)); p.setZ(i, p.getZ(i) * R(.8, 1.15)); p.setY(i, p.getY(i) + R(-h * .06, h * .06)); } }
  const gg = g.toNonIndexed(); const pp = gg.attributes.position, cols = []; const base = new THREE.Color(c), low = new THREE.Color('#8f9a64'), hi = new THREE.Color(c).offsetHSL(0, -.05, .1), dk = new THREE.Color(c).offsetHSL(0, 0, -.12);
  for (let i = 0; i < pp.count; i += 3) { const yy = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3 / h + .5; const col = yy < .25 ? low.clone().lerp(base, yy * 4) : base.clone().lerp(rnd() > .5 ? hi : dk, R(.1, .6)); for (let k = 0; k < 3; k++) cols.push(col.r, col.g, col.b); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals();
  const m = add(gg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), x, h / 2 - 6, z); m.castShadow = false;
}
mountain(20, -420, 150, 200, '#a07a58'); mountain(-120, -390, 110, 130, '#8f7a60'); mountain(160, -400, 120, 150, '#a8845e');
for (let i = 0; i < 9; i++) mountain(-200 + i * 55, -250 + R(-20, 20), R(45, 70), R(25, 45), '#8fa060');
mountain(-210, -150, 90, 80, '#a6a483'); mountain(260, -140, 100, 90, '#a6a483'); mountain(-60, -340, 80, 150, '#9c8d7a');

