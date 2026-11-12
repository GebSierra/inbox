// ---------- props ----------
function tree(x, z, s = 1) {
  // L2 options (objects/up-trees.js), chosen by the town theme "trees" or ?trees=a|b: draw and discard the old tree's 112 random numbers first
  const style = THEME.trees || new URLSearchParams(location.search).get('trees');
  if ((style === 'a' || style === 'b') && typeof upOlive === 'function') { for (let k = 0; k < 112; k++) rnd(); return upOlive(x, z, s, { style }); }
  const y = heightAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  // olive-style tree: a leaning, forked trunk and many small canopy clumps in three greens
  const tk = cyl(.14 * s, .26 * s, 1.6 * s, 6, 'trunk', 0, 0, 0, g); tk.rotation.z = R(-.12, .12);
  const br = []; for (let b = 0; b < 3; b++) { const a = b / 3 * Math.PI * 2 + R(-.4, .4), bx = Math.cos(a) * .55 * s, bz = Math.sin(a) * .55 * s;
    const limb = cyl(.06 * s, .11 * s, 1.1 * s, 5, 'trunk', bx * .5, 1.45 * s, bz * .5, g); limb.rotation.z = -Math.cos(a) * .55; limb.rotation.x = Math.sin(a) * .55; br.push([bx * 1.3, 2.4 * s, bz * 1.3]); }
  const greens = ['leaf', 'leafDk', 'sh0'];
  for (const [bx, by, bz] of br) for (let i = 0; i < 6; i++) { const m = add(new THREE.IcosahedronGeometry(R(.38, .58) * s, 0), M[greens[i % 3]] ? greens[i % 3] : 'leaf', bx + R(-.55, .55) * s, by + R(-.15, .55) * s, bz + R(-.55, .55) * s, g); m.scale.y = .72; m.rotation.set(R(0, 3), R(0, 3), 0); }
}
function shrub(x, z, s = 1, y) { y ??= heightAt(x, z); const cs = ['#6f8a46', '#5f7a3e', '#7c9450', '#8aa05a'];
  for (let i = 0; i < 5; i++) { const m = add(new THREE.IcosahedronGeometry(R(.22, .34) * s, 1), mat('sh' + i % 4, cs[i % 4], { flatShading: true }), x + R(-.3, .3) * s, y + (.25 + R(0, .3)) * s, z + R(-.3, .3) * s); m.scale.y = .8; }
  if (rnd() < .4) for (let i = 0; i < 4; i++) add(new THREE.IcosahedronGeometry(.05 * s, 0), mat('flower' + (i % 2), i % 2 ? '#e0b44a' : '#e8e2d8'), x + R(-.35, .35) * s, y + R(.4, .65) * s, z + R(-.35, .35) * s); }
function cypress(x, z, s = 1) {
  UD.cypress(x, z, s, heightAt(x, z));   // objects/up-d.js: flame-shaped cypress, shared geometry, no random numbers drawn
}
// a sheep: the region's fat-tailed sheep (objects/up-sheep.js). Draws exactly one R(), like the old box-headed one, so towns keep their layout.
function sheep(x, z) { const ry = R(0, 6); return typeof upSheep === 'function' ? upSheep(x, z, { ry }) : null; }
function stoneWall(x0, z0, x1, z1, h = 1) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 2.2);
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    const m = box(L / n * 1.02, h * R(.85, 1.1), .8, i % 3 ? 'stone' : 'stoneDk', x, heightAt(x, z) - .1, z);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  }
}
function gableRoof(w, d, h, m, x, y, z, rot = 0, p = scene) {
  const s = new THREE.Shape(); s.moveTo(-w / 2 - .5, 0); s.lineTo(w / 2 + .5, 0); s.lineTo(0, h); s.lineTo(-w / 2 - .5, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d + 1, bevelEnabled: false }); g.translate(0, 0, -(d + 1) / 2);
  const r = add(g, m, x, y, z, p); r.rotation.y = rot;
  if (m === 'roof' || m === 'roofDk') { const rg = add(new THREE.CylinderGeometry(.2, .2, d + 1.15, 6), 'roofTrim', 0, h + .02, 0, r); rg.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) { const ev = add(new THREE.BoxGeometry(.18, .22, d + 1), 'roofTrim', sx * (w / 2 + .45), .02, 0, r); } }
  return r;
}
const WALLS = ['#f7efe0', '#f2e2c2', '#ecd3a8', '#f4e8d8', '#e8cfae'].map((c, i) => { const m = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .9 }); m.map = null; return m; });
const PLASTER = ['#ffffff', '#fff6e6', '#fbecd2', '#fffaf0'];
function kitMat(name, tint) { if (!tint || tint === '#ffffff') return KMAT[name]; const k = name + tint; if (!KMAT[k]) { KMAT[k] = KMAT[name].clone(); KMAT[k].color = new THREE.Color(tint).multiplyScalar(1.25); } return KMAT[k]; }
function kitPiece(name, parent, x, y, z, ry, tint) { const src = KIT[name]; if (!src) return null; const o = src.clone(true); o.position.set(x, y, z); o.rotation.y = ry; if (tint) o.traverse(m => { if (m.isMesh && m.material.name === 'MI_Plaster') m.material = kitMat('MI_Plaster', tint); }); parent.add(o); return o; }
function kitHouse(x, z, w, d, floors, rot) {
  let nx = Math.max(2, Math.min(4, Math.round(w / 2))), nz = Math.max(2, Math.min(5, Math.round(d / 2)));
  if (nx < 4 && nz > 4) nz = 4; if (nx === 4 && nz < 4) nz = 4; if (nx === 3 && nz === 2) nz = 2;
  const roof = KIT[`Roof_RoundTiles_${nx * 2}x${nz * 2}`] ? `Roof_RoundTiles_${nx * 2}x${nz * 2}` : 'Roof_RoundTiles_4x4'; if (roof === 'Roof_RoundTiles_4x4') { nx = 2; nz = 2; }
  const W = nx * 2, D = nz * 2, H = 3.12, brick = false, tint = PLASTER[(rnd() * PLASTER.length) | 0];
  const g = new THREE.Group(); g.position.set(x, heightAt(x, z) - .05, z); g.rotation.y = rot; scene.add(g);
  box(W - .5, H * floors - .2, D - .5, 'dark', 0, 0, 0, g);   // solid core so you never see through a doorway
  const wall = (kind) => brick ? ({ plain: 'Wall_UnevenBrick_Straight', wide: 'Wall_UnevenBrick_Window_Wide_Round', thin: 'Wall_UnevenBrick_Window_Wide_Round', door: 'Wall_UnevenBrick_Door_Round' })[kind] : ({ plain: 'Wall_Plaster_Straight', wide: 'Wall_Plaster_Window_Wide_Round', thin: 'Wall_Plaster_Window_Thin_Round', door: 'Wall_Plaster_Door_Round' })[kind];
  const sides = [[nx, 0, D / 2 - .09, 0], [nx, 0, -D / 2 + .09, Math.PI], [nz, -W / 2 + .09, 0, -Math.PI / 2], [nz, W / 2 - .09, 0, Math.PI / 2]];
  sides.forEach(([n, ox, oz, ry], si) => { for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
    const t = -n + 1 + 2 * i, px = ry === 0 || ry === Math.PI ? t * (ry === 0 ? 1 : -1) : ox, pz = ry === 0 || ry === Math.PI ? oz : t * (ry > 0 ? -1 : 1);
    const isDoor = si === 0 && f === 0 && i === Math.floor(n / 2); const r = rnd(); const kind = isDoor ? 'door' : (r < .35 ? 'plain' : f ? 'thin' : 'wide');
    kitPiece(wall(kind), g, px, f * H, pz, ry, brick ? null : tint);
    if (kind === 'wide') { kitPiece('Window_Wide_Round1', g, px, f * H, pz, ry); kitPiece(rnd() < .7 ? 'WindowShutters_Wide_Round_Open' : 'WindowShutters_Wide_Round_Closed', g, px, f * H, pz, ry); }
    if (kind === 'thin') { kitPiece('Window_Thin_Round1', g, px, f * H, pz, ry); kitPiece('WindowShutters_Thin_Round_Open', g, px, f * H, pz, ry); }
    if (kind === 'door') kitPiece('Door_1_Round', g, px - .53 * Math.cos(ry), f * H, pz + .53 * Math.sin(ry), ry);
    if (f === 1 && si === 0 && i === 0 && rnd() < .5) kitPiece('Balcony_Simple_Straight', g, px, f * H, pz, ry);
    if (f === 0 && kind === 'plain' && rnd() < .35) kitPiece(['Prop_Vine2', 'Prop_Vine4', 'Prop_Vine6'][(rnd() * 3) | 0], g, px, 0, pz, ry); } });
  { const rf = kitPiece(roof, g, 0, H * floors, 0, 0); if (rf) rf.scale.y = .42; }
  
  return g;
}
function house(x, z, w, d, floors = 1, rot = 0) {
  if (HOOKS.house) return HOOKS.house(x, z, w, d, floors, rot);   // James swaps in its Near-Eastern houses
  if (KIT.Wall_Plaster_Straight) return kitHouse(x, z, w, d, floors, rot);
  const g = new THREE.Group(); g.position.set(x, heightAt(x, z) - .2, z); g.rotation.y = rot; scene.add(g);
  const h = 3.4 * floors; const wm = WALLS[(rnd() * WALLS.length) | 0]; wm.map = TEX.plaster;
  box(w, h, d, wm, 0, 0, 0, g); if (floors === 1 && rnd() > .5) { box(w * .45, 3.2, d * .6, wm, -w * .2, h, -d * .15, g); gableRoof(w * .45, d * .6, 1.4, 'roofDk', -w * .2, h + 3.2, -d * .15, 0, g); } box(w + .2, .35, d + .2, 'wallTrim', 0, 0, 0, g);
  gableRoof(w, d, Math.min(w, d) * .32, 'roof', 0, h, 0, 0, g);
  for (let f = 0; f < floors; f++) for (let i = -1; i <= 1; i += 2) {
    box(.8, 1.1, .1, 'window', i * w * .25, 1.4 + f * 3.4, d / 2 + .02, g);
    box(1.05, .18, .2, 'wallTrim', i * w * .25, 1.3 + f * 3.4, d / 2 + .05, g);
    box(1.05, .16, .16, 'wallTrim', i * w * .25, 2.5 + f * 3.4, d / 2 + .05, g);
    for (const sh of [-1, 1]) box(.38, 1.1, .06, mat('shut', '#6f4f34'), i * w * .25 + sh * .62, 1.4 + f * 3.4, d / 2 + .08, g);
  }
  box(w + .3, .25, d + .3, 'wallTrim', 0, h - .25, 0, g); if (floors > 1) box(w + .1, .18, d + .1, 'wallTrim', 0, 3.3, 0, g);
  if (rnd() > .4) { box(1.2, 2.1, .1, 'wood', 0, 0, d / 2 + .02, g); box(1.7, .3, .25, 'wallTrim', 0, 2.1, d / 2 + .05, g); }
  return g;
}
// striped awning texture
function stripeTex(a, b, n) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 8; const x = c.getContext('2d');
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 128 / n, 0, 128 / n + 1, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function stall(x, z, face, cloth, goods, style = 'awning') {
  const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = face; scene.add(g);
  if (style !== 'tent') for (const [a, b] of [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]]) box(.16, b > 0 ? 3.1 : 3.7, .16, 'wood', a, 0, b, g);
  const awn = add(new THREE.BoxGeometry(4.3, .08, 3.2), typeof cloth === 'string'
    ? new THREE.MeshStandardMaterial({ color: cloth, flatShading: true, roughness: 1 })
    : new THREE.MeshStandardMaterial({ map: cloth, roughness: 1 }), 0, 2.95, 0, g);
  awn.visible = false;
  const cg = new THREE.PlaneGeometry(4.5, 3.6, 6, 4); const cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) { const u = cp.getX(i) / 2.25, v = cp.getY(i) / 1.8; cp.setZ(i, -(1 - u * u) * .18 * (1 - v * v) - .0); }
  cg.computeVertexNormals(); const can = add(cg, awn.material, 0, 3.45, .1, g); if (style !== 'awning') can.visible = false; can.rotation.x = -Math.PI / 2 + .5; can.material.side = THREE.DoubleSide; can.material.emissive = can.material.map ? new THREE.Color('#5a4a3a') : new THREE.Color(can.material.color).multiplyScalar(.35); if (can.material.map) can.material.emissiveMap = can.material.map;
  if (style === 'awning' || style === 'cart') for (let i = 0; i < 9; i++) { const f = add(new THREE.ConeGeometry(.16, .26, 3), awn.material, -2 + i * .5, 2.72, 1.72, g); f.rotation.x = Math.PI; f.rotation.y = Math.PI / 6; }
  if (style === 'cart') { can.visible = true; for (const sx of [-1, 1]) { const w = add(new THREE.CylinderGeometry(.75, .75, .14, 14), 'wood', sx * 2.05, .75, .2, g); w.rotation.z = Math.PI / 2; const hub = add(new THREE.CylinderGeometry(.14, .14, .2, 8), 'dark', sx * 2.12, .75, .2, g); hub.rotation.z = Math.PI / 2; }
    for (const sx of [-1, 1]) { const h = box(.1, .1, 2.4, 'woodLt', sx * .6, .9, 2.2, g); h.rotation.x = -.12; } box(3.8, .5, 2.6, 'woodLt', 0, .55, -.1, g); }
  if (style === 'tent') { const tm = awn.material; for (const sz of [-1, 1]) { const pl = add(new THREE.PlaneGeometry(4.6, 2.2), tm, 0, 3.05, sz * .95, g); pl.rotation.x = sz * -1.05 + (sz > 0 ? 0 : 0); pl.rotation.x = sz > 0 ? -1.05 : 1.05 - Math.PI; pl.material.side = THREE.DoubleSide; }
    for (const sx of [-2.1, 2.1]) { box(.12, 4.1, .12, 'wood', sx, 0, 0, g); } box(4.5, .1, .1, 'wood', 0, 4.0, 0, g); for (const sx of [-1, 1]) { const r = box(.03, 2.4, .03, 'dark', sx * 2.3, 0, 2.1, g); r.rotation.x = -.5; } }
  if (style === 'roof') { can.visible = false; const rf = box(4.6, .12, 3.6, 'wood', 0, 3.1, .1, g); rf.rotation.x = .3;
    const tg = new THREE.Group(); tg.position.set(0, 3.25, .1); tg.rotation.x = .3; g.add(tg);
    const teg = mat('tegula', '#c8693f', { roughness: .8 }), imb = mat('imbrex', '#b85a36', { roughness: .8 }); const imbG = new THREE.CylinderGeometry(.085, .1, .56, 8, 1, false, 0, Math.PI);
    for (let r = 0; r < 7; r++) for (let c2 = 0; c2 < 9; c2++) { const xx = -2.15 + c2 * .54, zz = -1.65 + r * .52;
      const t = box(.48, .035, .56, teg, xx + R(-.01, .01), -.02 + r * .015, zz, tg); t.rotation.x = -.06; box(.04, .07, .56, teg, xx - .22, -.02 + r * .015, zz, tg); box(.04, .07, .56, teg, xx + .22, -.02 + r * .015, zz, tg);
      if (c2 < 8) { const m = add(imbG, imb, xx + .27, .03 + r * .015, zz, tg); m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI; m.rotation.order = 'XZY'; m.scale.set(1, 1, 1); } }
    for (let c2 = 0; c2 < 8; c2++) { const e = add(new THREE.CircleGeometry(.1, 8, 0, Math.PI), imb, -2.15 + c2 * .54 + .27, .03 + 6 * .015, -1.65 + 6.5 * .52 + .02, tg); }
    for (let i = 0; i < 9; i++) box(4.5, .06, .16, 'woodLt', 0, -.12, -1.7 + i * .45, tg); box(4.7, .22, .25, 'roofTrim', 0, 2.75, 1.75, g); box(4.2, .3, .2, 'wood', 0, 2.6, 1.3, g); for (const sx of [-1, 1]) box(.06, 2.7, 3, 'woodLt', sx * 1.85, 0, -.1, g).visible = false; }
  box(3.6, .12, 1.3, 'woodLt', 0, 1, .7, g); box(.12, 1, .12, 'wood', -1.6, 0, 1.2, g); box(.12, 1, .12, 'wood', 1.6, 0, 1.2, g);
  goods(g);
  box(3.6, .1, .7, 'woodLt', 0, 1.6, -1, g);
  if (style !== 'tent') { box(3.7, .08, .08, 'wood', 0, 2.45, 1.25, g); for (let i = 0; i < 7; i++) { const hx = -1.6 + i * .53; box(.015, .3, .015, 'dark', hx, 2.15, 1.25, g);
      const k = i % 3; if (k === 0) add(new THREE.IcosahedronGeometry(.13, 0), mat('garlic', '#efe6d4'), hx, 2.05, 1.25, g).scale.y = 1.3; else if (k === 1) { const pt = add(new THREE.LatheGeometry([[0, 0], [.1, .02], [.14, .12], [.08, .24]].map(([a, b]) => new THREE.Vector2(a, b)), 7), 'clay', hx, 1.88, 1.25, g); } else add(new THREE.ConeGeometry(.09, .32, 5), mat('pepper', '#b8331f'), hx, 2.0, 1.25, g).rotation.x = Math.PI; } }

  return g;
}
const fruit = (g, c) => { for (let i = -1; i <= 1; i++) { cyl(.45, .35, .35, 7, 'basket', i * 1.1, 1.12, .7, g); for (let k = 0; k < 5; k++) add(new THREE.IcosahedronGeometry(.16, 0), mat('f' + c, c), i * 1.1 + R(-.2, .2), 1.55, .7 + R(-.2, .2), g); } };
const amph = (g, x, z, s = 1, y = 0) => { const m = add(new THREE.LatheGeometry([[0, 0], [.1, .02], [.18, .05], [.27, .2], [.3, .4], [.32, .6], [.3, .78], [.2, 1.02], [.11, 1.15], [.1, 1.24], [.13, 1.32], [.12, 1.36]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 16), 'clay', x, 0, z, g); for (const sd of [-1, 1]) { const h = add(new THREE.TorusGeometry(.09 * s, .022 * s, 5, 8, Math.PI), 'clay', x + sd * .17 * s, 1.1 * s, z, g); h.rotation.z = sd * Math.PI / 2; } };

