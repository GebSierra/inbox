// ---------- the wilderness of Sinai: a flat sandy plain round the camp, dunes beyond, red granite mountains ----------
// 1 cubit = 18 in = 0.4572 m. The courtyard's east gate is at z = 0; the courtyard runs west to z = -45.72 (100 cubits).
const CUBIT = 0.4572;
function hRaw(x, z) {
  let h = Math.sin(x * 0.021 + 1) * 1.4 + Math.cos(z * 0.018) * 1.1 + Math.sin((x - z) * 0.045) * 0.5 + Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.25;
  const d = Math.hypot(x, (z + 23) * 0.8);                       // the camp: flat round the tabernacle, rising gently outwards
  const k = Math.min(1, Math.max(0, (d - 70) / 60));
  return h * k * k * (3 - 2 * k) - 0.0;
}
const heightAt = (x, z) => hRaw(x, z);
{
  const S = 620, N = 260;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cSand = new THREE.Color('#dcc08e'), cSand2 = new THREE.Color('#cfae78'), cTrod = new THREE.Color('#c9ad80'), cScrub = new THREE.Color('#9c9a62');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 22; p.setZ(i, z);
    p.setY(i, heightAt(x, z));
    const c = cSand.clone().lerp(cSand2, (Math.sin(x * .07) * Math.cos(z * .05) + 1) / 2);
    const n2 = Math.sin(x * .031 + 2) * Math.sin(z * .037) + Math.sin(x * .08 - z * .06) * .5; if (n2 > .8) c.lerp(cScrub, .3);
    if (Math.abs(x) < 16 && z < 4 && z > -50) c.lerp(cTrod, .5);                 // the court, trodden earth
    if (Math.abs(x) < 3 && z > 0 && z < 60) c.lerp(cTrod, .4);                   // the way in from the east
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6000; i++) { const v = R(170, 255) | 0; x.fillStyle = `rgba(${v},${v * .95 | 0},${v * .86 | 0},${R(.15, .5)})`; x.fillRect(R(0, 256), R(0, 256), R(1, 3), R(1, 3)); }
    for (let i = 0; i < 50; i++) { x.fillStyle = `rgba(130,105,80,${R(.15, .35)})`; x.beginPath(); x.ellipse(R(0, 256), R(0, 256), R(1.5, 4), R(1, 3), R(0, 3), 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(160, 160); t.anisotropy = 8; return t; })();
  const t = add(g.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, map: gtex }));
  t.castShadow = false; t.geometry.computeVertexNormals();
}
// mountains: Sinai's red granite to the south-west, lower sandstone ridges all round
function mountain(x, z, r, h, c, sub = true) {
  if (sub) for (let i = 0; i < 3; i++) mountain(x + R(-r * .7, r * .7), z + R(-r * .2, r * .5), r * R(.45, .65), h * R(.45, .75), c, false);
  c = new THREE.Color(c).lerp(SKY, Math.min(.35, Math.max(0, (Math.hypot(x, z) - 220) / 450))).getStyle();
  const g = new THREE.ConeGeometry(r, h, 10, 5); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { if (p.getY(i) < h / 2 - .01) { p.setX(i, p.getX(i) * R(.75, 1.2)); p.setZ(i, p.getZ(i) * R(.75, 1.2)); p.setY(i, p.getY(i) + R(-h * .07, h * .07)); } }
  const gg = g.toNonIndexed(); const pp = gg.attributes.position, cols = []; const base = new THREE.Color(c), low = new THREE.Color('#c9a878'), hi = new THREE.Color(c).offsetHSL(0, -.05, .1), dk = new THREE.Color(c).offsetHSL(0, 0, -.12);
  for (let i = 0; i < pp.count; i += 3) { const yy = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3 / h + .5; const cc = yy < .2 ? low.clone().lerp(base, yy * 5) : base.clone().lerp(rnd() > .5 ? hi : dk, R(.1, .6)); for (let k = 0; k < 3; k++) cols.push(cc.r, cc.g, cc.b); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals();
  const m = add(gg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), x, h / 2 - 6, z); m.castShadow = false;
}
mountain(-60, -330, 150, 230, '#9a5a44'); mountain(70, -360, 120, 170, '#8e5644'); mountain(-190, -280, 100, 120, '#a5684c');
for (let i = 0; i < 10; i++) mountain(-260 + i * 58, 300 + R(-30, 30), R(45, 75), R(30, 55), '#c09a6c');
mountain(-300, 20, 110, 80, '#b48a62'); mountain(310, -40, 110, 90, '#b48a62'); mountain(260, 220, 90, 60, '#be9a6c'); mountain(230, -250, 100, 110, '#a8704e');
