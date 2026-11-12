// ---------- a Galilean hillside above the lake ----------
// The hilltop meadow (the Mount) is round (0, 3); the slope falls south to the shore of the lake at z = SHORE.
// You arrive up the path from the lake (from the south, walking north, +z).
const SHORE = -95;
const HILL = 16;                                                     // height of the hilltop above the shore
function hRaw(x, z) {
  let h = Math.sin(x * 0.03) * 1.0 + Math.cos(z * 0.025) * .8 + Math.sin((x + z) * 0.05) * 0.4;
  const d = Math.hypot(x * .8, z - 3);
  h += HILL * Math.exp(-(d * d) / (2 * 55 * 55));                     // the mount
  h += Math.max(0, z - 40) * 0.08;                                    // more hills inland, to the north
  if (z < SHORE + 25) h = Math.min(h, h - (SHORE + 25 - z) * 0.12);   // the slope steepens down to the beach
  if (z < SHORE) h = Math.min(h, (z - SHORE) * 0.2 - .3);              // the beach falls into the lake
  return h;
}
const FLAT = [[0, 3, 24, 20]];                                         // [cx, cz, halfW, halfD] the hilltop meadow
const heightAt0 = (x, z) => hRaw(x, z);
const heightAt = (x, z) => { let h = heightAt0(x, z);
  for (const [cx, cz, hw, hd] of FLAT) { const dx = Math.max(0, Math.abs(x - cx) - hw), dz = Math.max(0, Math.abs(z - cz) - hd), d = Math.hypot(dx, dz);
    const fl = heightAt0(cx, cz); if (d === 0) { h = fl; continue; }
    if (d < 8) { const w = 1 - d / 8, s = w * w * (3 - 2 * w); h = h * (1 - s) + fl * s; } }
  return h; };
{
  const S = 520, N = 260;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cGrass = new THREE.Color('#9fae5e'), cGrass2 = new THREE.Color('#8a9c50'), cPath = new THREE.Color('#d8bb88'), cBank = new THREE.Color('#ead7a8'), cFlower = new THREE.Color('#c9b04e');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 40; p.setZ(i, z);
    p.setY(i, heightAt(x, z));
    const c = cGrass.clone().lerp(cGrass2, (Math.sin(x * .13) * Math.cos(z * .11) + 1) / 2);
    const n2 = Math.sin(x * .041 + 2) * Math.sin(z * .047) + Math.sin(x * .09 - z * .07) * .5; if (n2 > .7) c.lerp(cFlower, .35); else if (n2 < -.6) c.lerp(new THREE.Color('#6f8c45'), .4);
    if (Math.abs(x - Math.sin(z * .05) * 3 * Math.min(1, Math.max(0, -z - 20) / 20)) < 2.2 && z < -14 && z > SHORE) c.lerp(cPath, .7);   // the path up from the lake
    if (Math.abs(x) < 3.5 && z > -18 && z < 24) c.lerp(cPath, .55);                                                                      // the walk across the hilltop
    if (z < SHORE + 8) c.lerp(cBank, Math.min(1, (SHORE + 8 - z) / 6));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = R(150, 255) | 0; x.fillStyle = `rgba(${v},${v * .96 | 0},${v * .88 | 0},${R(.15, .5)})`; x.fillRect(R(0, 256), R(0, 256), R(1, 4), R(1, 3)); }
    for (let i = 0; i < 200; i++) { x.strokeStyle = `rgba(90,110,50,${R(.2, .5)})`; x.lineWidth = 1; const a = R(0, 256), b = R(0, 256); x.beginPath(); x.moveTo(a, b); x.lineTo(a + R(-3, 3), b - R(3, 8)); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(140, 140); t.anisotropy = 8; return t; })();
  const t = add(g.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, map: gtex }));
  t.castShadow = false; t.geometry.computeVertexNormals();
}
// the Sea of Galilee, south of the hill
{
  const g = new THREE.PlaneGeometry(900, 520, 1, 1); g.rotateX(-Math.PI / 2);
  const wm = new THREE.MeshStandardMaterial({ color: '#4a86a0', roughness: .2, metalness: .1, transparent: true, opacity: .94 });
  wm.onBeforeCompile = sh => { sh.uniforms.uT = WATER_T; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vW;').replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float r = sin(vW.z*.7 + uT*1.3 + sin(vW.x*.9)) * sin(vW.x*1.1 - uT*.9 + vW.z*.25);
     float shore = smoothstep(${(SHORE - 9).toFixed(1)}, ${(SHORE - 1).toFixed(1)}, vW.z);
     gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.55,.82,.8), shore * .55);
     gl_FragColor.rgb += vec3(.35,.22,.1) * smoothstep(.65, 1., r) * .35;`); };
  const w = new THREE.Mesh(g, wm); w.position.set(0, -.35, SHORE - 258); w.userData.dyn = 1; w.receiveShadow = true; scene.add(w);
}
// the far shore and the hills of Galilee
function mountain(x, z, r, h, c, sub = true) {
  if (sub) for (let i = 0; i < 3; i++) mountain(x + R(-r * .7, r * .7), z + R(-r * .2, r * .5), r * R(.45, .65), h * R(.45, .75), c, false);
  c = new THREE.Color(c).lerp(SKY, Math.min(.4, Math.max(0, (Math.abs(z) - 200) / 400))).getStyle();
  const g = new THREE.ConeGeometry(r, h, 9, 4); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { if (p.getY(i) < h / 2 - .01) { p.setX(i, p.getX(i) * R(.8, 1.15)); p.setZ(i, p.getZ(i) * R(.8, 1.15)); p.setY(i, p.getY(i) + R(-h * .06, h * .06)); } }
  const gg = g.toNonIndexed(); const pp = gg.attributes.position, cols = []; const base = new THREE.Color(c), low = new THREE.Color('#8f9a64'), hi = new THREE.Color(c).offsetHSL(0, -.05, .1), dk = new THREE.Color(c).offsetHSL(0, 0, -.12);
  for (let i = 0; i < pp.count; i += 3) { const yy = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3 / h + .5; const col = yy < .25 ? low.clone().lerp(base, yy * 4) : base.clone().lerp(rnd() > .5 ? hi : dk, R(.1, .6)); for (let k = 0; k < 3; k++) cols.push(col.r, col.g, col.b); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals();
  const m = add(gg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), x, h / 2 - 6, z); m.castShadow = false;
}
for (let i = 0; i < 9; i++) mountain(-260 + i * 65, -420 + R(-30, 30), R(60, 90), R(40, 70), '#9a8a6a');   // across the lake
mountain(30, 330, 140, 150, '#8f9a64'); mountain(-150, 300, 110, 110, '#96906a'); mountain(190, 290, 120, 120, '#9a9468');
mountain(-260, 60, 90, 60, '#9aa070'); mountain(270, 40, 100, 70, '#9aa070');
