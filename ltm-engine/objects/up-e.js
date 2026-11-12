// ---------- UP-E: Roman seal in the paving, well rope and bucket, fishing boat on the water, the fishermen's pier ----------
// Called from objects/colossae-shared.js (romanSeal, spearRack, villageWell), objects/colossae.js (fishingBoat) and engine/kit.js (dais "pier").
// Function declarations and caches only: nothing runs at load. NEVER calls R(): variation comes from the private generator ueRng(seed).
const ueRng = seed => { let s = (seed >>> 0) || 1; return (a = 0, b = 1) => a + ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296) * (b - a); };
const UEC = {};
const ueCanvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };

// height of the ground under the point (px, pz) of group g, relative to g's own origin height (0 when there is no terrain, e.g. the library stage)
function ueGround(g, px, pz) {
  if (typeof heightAt !== 'function') return 0;
  g.updateWorldMatrix(true, false);
  const w = new THREE.Vector3(px, 0, pz).applyMatrix4(g.matrixWorld), o = new THREE.Vector3(0, 0, 0).applyMatrix4(g.matrixWorld);
  return (heightAt(w.x, w.z) - o.y) / (g.matrixWorld.getMaxScaleOnAxis() || 1);
}
// the river surface at (x, z) of group g, in g's own height units, or null when the town has no river
function ueWaterY(g, x, z) {
  if (typeof RIVER_X !== 'function' || typeof heightAt !== 'function') return null;
  g.updateWorldMatrix(true, false);
  const w = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld), o = new THREE.Vector3(0, 0, 0).applyMatrix4(g.matrixWorld);
  return (heightAt(RIVER_X(w.z), w.z) + .4 - o.y) / (g.matrixWorld.getMaxScaleOnAxis() || 1);
}
// a rope (twisted look) along the points [[x,y,z],...] with radius r, built as a thin tube with a diagonal-strand texture
function ueRope(g, pts, r = .02, col = '#b99c68') {
  const key = 'rope' + col;
  const base = UEC[key] ||= (() => { const t = new THREE.CanvasTexture(ueCanvas(32, 32, (k, w, h) => { k.fillStyle = col; k.fillRect(0, 0, w, h); k.strokeStyle = 'rgba(60,40,18,.85)'; k.lineWidth = 6;
    for (const o of [-w, 0, w]) { k.beginPath(); k.moveTo(o, 0); k.lineTo(o + w, h); k.stroke(); }
    k.strokeStyle = 'rgba(240,220,170,.55)'; k.lineWidth = 3; for (const o of [-w, 0, w]) { k.beginPath(); k.moveTo(o + 9, 0); k.lineTo(o + w + 9, h); k.stroke(); } }));
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2]))), len = curve.getLength();
  const t = base.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, len / (r * 7)), 1);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 1, flatShading: false });
  const mesh = add(new THREE.TubeGeometry(curve, Math.max(6, Math.ceil(len * 10)), r, 6, false), m, 0, 0, 0, g); mesh.castShadow = false; return mesh;
}
// a thin round limb from point a to point b
function ueLimb(g, a, b, r0, r1, m, seg = 6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const mesh = add(new THREE.CylinderGeometry(r1, r0, L, seg), m, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2, g);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return mesh;
}

// ================= the Roman seal: a bronze medallion bedded flush in the paving, with a ring of stones =================
// draws the seal design: mode 'map' (colours) or 'bump' (grey relief height). The canvas is the circle, up = away from a viewer standing at the gate's outside.
function ueSealDraw(k, S, bump) {
  const P = bump ? { rim: '#d8d8d8', field: '#3a3a3a', gold: '#ffffff', goldDk: '#bdbdbd', line: '#6a6a6a', leaf: '#f2f2f2', leafLine: '#8a8a8a', beak: '#ffffff' }
    : { rim: '#a8792a', field: '#2a1a10', gold: '#f0cd62', goldDk: '#b88a2c', line: '#5a3a14', leaf: '#b9cf6a', leafLine: '#4a5a22', beak: '#fff0a8' };
  const c = S / 2, u = S / 512;
  k.save(); k.scale(u, u); k.translate(0, 0);
  const C = 256;
  k.fillStyle = P.rim; k.beginPath(); k.arc(C, C, 256, 0, 7); k.fill();
  if (bump) { k.fillStyle = P.field; k.beginPath(); k.arc(C, C, 244, 0, 7); k.fill(); }
  else { const gr = k.createRadialGradient(C, C, 20, C, C, 244); gr.addColorStop(0, '#4a3118'); gr.addColorStop(1, P.field); k.fillStyle = gr; k.beginPath(); k.arc(C, C, 244, 0, 7); k.fill(); }
  k.strokeStyle = P.gold; k.lineWidth = 7; k.beginPath(); k.arc(C, C, 236, 0, 7); k.stroke();
  k.lineWidth = 6; k.beginPath(); k.arc(C, C, 176, 0, 7); k.stroke();
  k.strokeStyle = P.goldDk; k.lineWidth = 3; k.beginPath(); k.arc(C, C, 168, 0, 7); k.stroke();
  // lettering round the rim
  const txt = 'SENATVS POPVLVSQVE ROMANVS', n = txt.length;
  k.fillStyle = P.gold; k.font = 'bold 42px Georgia, "Times New Roman", serif'; k.textAlign = 'center'; k.textBaseline = 'middle';
  for (let i = 0; i < n; i++) { if (txt[i] === ' ') continue; const a = -Math.PI / 2 + (i + .5) * 2 * Math.PI / n; k.save(); k.translate(C + Math.cos(a) * 205, C + Math.sin(a) * 205); k.rotate(a + Math.PI / 2); k.fillText(txt[i], 0, 0); k.restore(); }
  // laurel wreath
  k.strokeStyle = P.leafLine; k.lineWidth = 5; k.beginPath(); k.arc(C, C, 140, 0, 7); k.stroke();
  for (const s of [-1, 1]) for (let i = 0; i < 15; i++) {
    const t = i / 14, a = Math.PI / 2 + s * (.1 + t * 2.75), px = C + Math.cos(a) * 140, py = C + Math.sin(a) * 140;
    for (const side of [-1, 1]) { k.save(); k.translate(px, py); k.rotate(a + s * Math.PI / 2 * -1 + side * .75); k.fillStyle = P.leaf; k.strokeStyle = P.leafLine; k.lineWidth = 2;
      k.beginPath(); k.ellipse(20, 0, 22, 8, 0, 0, 7); k.fill(); k.stroke(); k.restore(); } }
  // the eagle: wings spread, head turned, tail and talons
  const eagle = () => {
    k.lineJoin = 'round'; k.strokeStyle = P.line; k.lineWidth = 2.5;
    for (const s of [-1, 1]) {
      const L = [62, 88, 108, 116, 112, 102, 90, 76];
      for (let i = 0; i < 8; i++) { k.save(); k.translate(C + s * 22, 236 - i * 1.5); k.scale(s, 1); k.rotate(-(68 - i * 9.5) * Math.PI / 180);
        k.fillStyle = i % 2 ? P.gold : P.goldDk; const l = L[i];
        k.beginPath(); k.moveTo(0, -13); k.quadraticCurveTo(l * .5, -24, l, -6); k.lineTo(l + 14, 1); k.quadraticCurveTo(l * .5, 22, 0, 13); k.closePath(); k.fill(); k.stroke();
        k.strokeStyle = P.line; k.lineWidth = 1.5; k.beginPath(); k.moveTo(10, 0); k.lineTo(l, -1); k.stroke(); k.lineWidth = 2.5; k.restore(); }
      k.fillStyle = P.gold; k.beginPath(); k.ellipse(C + s * 36, 232, 34, 24, s * -.35, 0, 7); k.fill(); k.stroke(); }
    // tail
    for (let i = -2; i <= 2; i++) { k.save(); k.translate(C, 300); k.rotate(i * .2); k.fillStyle = i % 2 ? P.gold : P.goldDk; k.beginPath(); k.moveTo(-9, 0); k.lineTo(-11, 66); k.lineTo(0, 76); k.lineTo(11, 66); k.lineTo(9, 0); k.closePath(); k.fill(); k.stroke(); k.restore(); }
    // legs and talons
    k.strokeStyle = P.goldDk; k.lineWidth = 9; for (const s of [-1, 1]) { k.beginPath(); k.moveTo(C + s * 12, 318); k.lineTo(C + s * 20, 352); k.stroke(); }
    k.strokeStyle = P.line; k.lineWidth = 3; for (const s of [-1, 1]) for (const d of [-.5, 0, .5]) { k.beginPath(); k.moveTo(C + s * 20, 352); k.lineTo(C + s * 20 + Math.sin(d) * 24, 372); k.stroke(); }
    // body, chest feathering
    k.strokeStyle = P.line; k.lineWidth = 2.5; k.fillStyle = P.gold; k.beginPath(); k.ellipse(C, 262, 31, 60, 0, 0, 7); k.fill(); k.stroke();
    k.strokeStyle = P.line; k.lineWidth = 2; for (let r = 0; r < 4; r++) { k.beginPath(); k.arc(C, 238 + r * 22, 18, .2, Math.PI - .2); k.stroke(); }
    // head, beak, eye
    k.fillStyle = P.gold; k.strokeStyle = P.line; k.lineWidth = 2.5; k.beginPath(); k.ellipse(C, 196, 19, 21, 0, 0, 7); k.fill(); k.stroke();
    k.fillStyle = P.beak; k.beginPath(); k.moveTo(C - 12, 188); k.lineTo(C - 40, 206); k.lineTo(C - 20, 211); k.closePath(); k.fill(); k.stroke();
    k.fillStyle = P.line; k.beginPath(); k.arc(C - 3, 190, 4, 0, 7); k.fill();
  };
  eagle();
  k.restore();
}
function ueSealTex() {
  if (UEC.seal) return UEC.seal;
  const map = new THREE.CanvasTexture(ueCanvas(512, 512, k => ueSealDraw(k, 512, false))), bump = new THREE.CanvasTexture(ueCanvas(512, 512, k => { k.fillStyle = '#000'; k.fillRect(0, 0, 512, 512); ueSealDraw(k, 512, true); }));
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; bump.anisotropy = 8;
  return (UEC.seal = { map, bump });
}
// (g, x, y, z) => top y: y is the paving height at the centre; the medallion follows the slope of the ground under it
function ueRomanSeal(g, x, y, z) {
  const R0 = 1.6, ZS = 1.45, sg = new THREE.Group();   // ZS: the medallion is stretched along the line of sight (z) so it still reads round from the stop, 6 m back and low
   sg.position.set(x, y, z); g.add(sg); sg.updateWorldMatrix(true, false);
  const G = (px, pz) => ueGround(sg, px, pz) - ueGround(sg, 0, 0);
  const gx = (G(1, 0) - G(-1, 0)) / 2, gz = (G(0, 1) - G(0, -1)) / 2;
  const med = new THREE.Group(); med.position.y = .04; med.rotation.set(-Math.atan(gz), 0, Math.atan(gx)); med.scale.z = ZS; sg.add(med);   // .04 = how far the paving drape lies above the terrain
  const T = ueSealTex();
  const face = new THREE.CircleGeometry(R0 - .05, 72); face.rotateX(-Math.PI / 2);
  add(face, new THREE.MeshStandardMaterial({ map: T.map, bumpMap: T.bump, bumpScale: 3, roughness: .5, metalness: .12 }), 0, .03, 0, med).castShadow = false;
  const prof = [[R0 - .05, .03], [R0 - .02, .05], [R0 + .01, .042], [R0 + .05, .0], [R0 + .05, -.08]].map(([a, b]) => new THREE.Vector2(a, b));
  add(new THREE.LatheGeometry(prof, 72), mat('sealRim', '#8c6428', { roughness: .45, metalness: .15, side: THREE.DoubleSide }), 0, 0, 0, med).castShadow = false;
  // a mortar bed round it, following the ground, and the setting stones on top of it
  const rg = ueRng(4411), SEG = 64, pos = [], idx = [], r0 = R0 + .03, r1 = R0 + .62;
  for (let i = 0; i <= SEG; i++) { const a = i / SEG * Math.PI * 2; for (const r of [r0, r1]) { const px = Math.cos(a) * r, pz = Math.sin(a) * r * ZS; pos.push(px, G(px, pz) + .05, pz); } }
  for (let i = 0; i < SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const bed = new THREE.BufferGeometry(); bed.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bed.setIndex(idx); bed.computeVertexNormals();
  add(bed, mat('sealBed', '#7f735f', { side: THREE.DoubleSide }), 0, 0, 0, sg).castShadow = false;
  const stA = uaStoneMat('stone', 'Dr'), stB = uaStoneMat('stoneDk', 'Dr'), N = 22;
  for (let i = 0; i < N; i++) { const a = (i + rg(-.05, .05)) / N * Math.PI * 2, rr = R0 + .3 + rg(-.02, .02), px = Math.cos(a) * rr, pz = Math.sin(a) * rr * ZS, h = .1 + rg(0, .015);
    const b = box(.5 + rg(0, .06), h, .3 + rg(0, .04), i % 2 ? stA : stB, px, G(px, pz) - .03, pz, sg); b.rotation.y = -Math.atan2(Math.sin(a) / ZS, Math.cos(a)); }
  return y + .1;
}

// ================= the well: a twisted rope from the windlass (axis at height rollY) to the bail of a bucket hanging in the shaft (rim at rimY; both relative to the group) =================
function ueWellBucket(g, x, o, z, rollY = o + 1.45, rimY = o + .42) {
  const bw = mat('bucketWood', '#8a5a34', { side: THREE.DoubleSide }), iron = mat('iron', '#3c3a38', { metalness: .4, roughness: .6 });
  const pr = [[0, 0], [.15, 0], [.2, .32], [.185, .32], [.145, .04], [0, .04]].map(([a, b]) => new THREE.Vector2(a, b));
  add(new THREE.LatheGeometry(pr, 14), bw, x, rimY - .32, z, g);
  for (const h of [.07, .26]) { const t = add(new THREE.TorusGeometry(.153 + h * .17, .014, 4, 16), iron, x, rimY - .32 + h, z, g); t.rotation.x = Math.PI / 2; }
  add(new THREE.CircleGeometry(.185, 14), mat('bucketWater', '#274a4c', { roughness: .1 }), x, rimY - .12, z, g).rotation.x = -Math.PI / 2;
  const bail = add(new THREE.TorusGeometry(.2, .012, 4, 14, Math.PI), iron, x, rimY, z, g);   // the bail handle, an arch across the bucket
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(.022, 5, 4), iron, x + s * .2, rimY, z, g);
  const topY = rimY + .2;   // top of the bail
  // coils on the windlass, then the rope itself down to the bail, a knot and two turns round the handle
  for (let i = 0; i < 5; i++) { const t = add(new THREE.TorusGeometry(.118, .02, 5, 12), mat('ropeCoil', '#a8885a'), x - .12 + i * .06, rollY, z, g); t.rotation.y = Math.PI / 2; }
  ueRope(g, [[x, rollY - .13, z], [x + .012, (rollY - .13 + topY) / 2 + .1, z + .006], [x - .006, (rollY - .13 + topY) / 2 - .1, z], [x, topY + .045, z]], .022);
  add(new THREE.SphereGeometry(.052, 7, 5), mat('ropeKnot', '#a8885a'), x, topY + .03, z, g).scale.set(1, 1.25, 1);
  for (const dz of [-.02, .02]) { const t = add(new THREE.TorusGeometry(.036, .014, 5, 10), mat('ropeKnot'), x, topY, z + dz, g); t.rotation.x = Math.PI / 2 - dz * 6; }
  return topY + .1;
}

// ================= the fishermen's pier: planks on piles with a notch of open water in the near-left corner for the boat =================
function uePier(g, spread) {
  const W2 = spread[0] * 2 + 2, D2 = spread[1] * 2 + 1.8, xCut = -spread[0] + 1.25, zCut = spread[1] - 1.45, rows = 11, ph = D2 / rows;
  for (let i = 0; i < rows; i++) { const zc = -D2 / 2 + (i + .5) * ph, front = zc > zCut, x0 = front ? xCut : -W2 / 2;
    box(W2 / 2 - x0, .12, ph * .95, 'woodLt', (x0 + W2 / 2) / 2, -.02, zc, g); }
  for (const [px, pz] of [[W2 / 2, -D2 / 2], [-W2 / 2, -D2 / 2], [W2 / 2, D2 / 2], [xCut + .1, D2 / 2 - .12], [xCut + .1, zCut + ph * .5]]) cyl(.12, .12, 1.6, 7, 'wood', px, -1.5, pz, g);
  box(.1, .1, D2 - .2, 'wood', xCut + .1, -.14, 0, g);
}

// ================= the fishing boat afloat =================
// (g, x, y, z) => top y. The hull floats with its waterline on the river (in the town) or on a little pond (in the library), bobs gently,
// is tied by a rope to its own mooring pile, and carries two oars and a heap of net.
function ueFishingBoat(g, x, y, z) {
  const wy = ueWaterY(g, x, z), s = .85, st = new THREE.Group(); st.position.set(x, 0, z); g.add(st);
  const water = wy === null ? y + .02 : wy;   // surface level, in g's units
  if (wy === null) { add(new THREE.CylinderGeometry(1.3, 1.3, .3, 28), mat('pondW', '#6fb9b4', { roughness: .1 }), 0, y - .13, 0, st); }
  const ringG = new THREE.Group(); ringG.position.y = water + .012; ringG.rotation.y = .22; st.add(ringG);
  const ring = add(new THREE.RingGeometry(.62, .86, 28), new THREE.MeshBasicMaterial({ color: '#e8f6f2', transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide }), 0, 0, 0, ringG);
  ring.rotation.x = -Math.PI / 2; ring.scale.set(.52, 1.13, 1); ring.castShadow = false;
  // the boat group (bobs): origin on the waterline, the keel a hand below it
  const b = new THREE.Group(); b.position.set(0, water + .05, 0); b.rotation.y = .22; st.add(b); b.userData.y0 = water + .05; b.userData.ph = (x * 7.1 + z * 3.3) % 6.28; b.userData.amp = .035;
  if (typeof SHIPS !== 'undefined') SHIPS.push(b);
  const hull = mat('boatWood', '#8a5a34', { side: THREE.DoubleSide }), L = 1.05 * s, W = .42 * s, H = .38 * s, drop = .17 * s;
  const pos = [], idx = [], N = 16, S = [], V = (a, c, d) => { pos.push(a, c, d); return pos.length / 3 - 1; }, rail = [[], []];
  for (let i = 0; i <= N; i++) { const t = -1 + 2 * i / N, e = Math.abs(t), zz = t * L, fl = -drop + .17 * s * e * e, bw = W * .7 * (1 - e ** 3) + .02, tp = H - drop + .13 * s * e ** 3, wd = W * (1 - e ** 4) + .015;
    S.push({ bl: V(-bw, fl, zz), br: V(bw, fl, zz), tl: V(-wd, tp, zz), tr: V(wd, tp, zz) }); rail[0].push([-wd, tp + .005, zz]); rail[1].push([wd, tp + .005, zz]); }
  for (let i = 0; i < N; i++) { const p = S[i], q = S[i + 1]; idx.push(p.bl, p.br, q.br, p.bl, q.br, q.bl, p.br, p.tr, q.tr, p.br, q.tr, q.br, p.tl, q.bl, p.bl, p.tl, q.tl, q.bl); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); add(geo, hull, 0, 0, 0, b);
  // a dry inner floor at the boat's own origin height, a hand above the river, so the river mesh does not show through the open hull (the boat floats on its draft, a third of its height)
  { const fp = [], fi = []; for (let i = 0; i <= N; i++) { const t = -1 + 2 * i / N, e = Math.abs(t), zz = t * L, fl = -drop + .17 * s * e * e, tp = H - drop + .13 * s * e ** 3, bw = W * .7 * (1 - e ** 3) + .02, wd = W * (1 - e ** 4) + .015, k = Math.min(1, Math.max(0, (0 - fl) / (tp - fl))), hw = Math.max(.005, (bw + (wd - bw) * k) - .012); fp.push(-hw, 0, zz, hw, 0, zz); if (i) { const q = i * 2; fi.push(q - 2, q - 1, q + 1, q - 2, q + 1, q); } }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fg.setIndex(fi); fg.computeVertexNormals(); add(fg, mat('boatFloor', '#6b4526', { side: THREE.DoubleSide }), 0, 0, 0, b); }
  for (const rl of rail) ueLimb2(b, rl, .022, 'woodLt');
  const ty = H - drop - .1 * s;   // seats
  for (const tz of [-.38, .22]) box(W * 1.7, .035, .13, 'woodLt', 0, ty, tz * s * 1.2, b);
  box(.05, .3 * s, .06, 'wood', 0, -drop + .03, L, b).rotation.x = -.3;     // the stem posts
  box(.05, .3 * s, .06, 'wood', 0, -drop + .03, -L, b).rotation.x = .3;
  // two oars laid along the boat, and a heap of net with corks in the stern
  const r = ueRng(5531);
  for (const sx of [-1, 1]) { const ox = sx * .11 * s, a = [ox, ty + .06, -.9 * s], c = [ox * 1.4, ty + .06, .85 * s]; ueLimb(b, a, c, .017, .017, 'woodLt', 5); const bl = box(.1, .02, .3, 'woodLt', c[0], c[1] - .01, c[2] + .06, b); bl.rotation.y = 0; }
  const net = add(new THREE.SphereGeometry(.2 * s, 7, 5), mat('netHeap', '#7a6a50'), 0, ty + .02, -.7 * s, b); net.scale.set(1.2, .5, 1.1);
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.028, 5, 3), 'cork', r(-.16, .16), ty + .1, -.7 * s + r(-.14, .14), b);
  // the mooring pile (off the bow, to the side) and the rope from the bow to it
  const px = .8, pz = -1.0, pile = new THREE.Group(); pile.position.set(px, 0, pz); st.add(pile);
  const top = y + .3, depth = water - 1.3, tie = water + .3;
  cyl(.085, .1, top - depth, 7, 'wood', 0, depth, 0, pile);
  for (const dy of [0, .07]) { const t = add(new THREE.TorusGeometry(.1, .016, 5, 10), mat('ropeKnot', '#a8885a'), 0, tie + dy, 0, pile); t.rotation.x = Math.PI / 2; }
  const bx = -L * Math.sin(.22), bz = -L * Math.cos(.22), by = water + H - drop + .13 * s + .02;
  ueRope(st, [[bx, by, bz], [(bx + px) / 2, water + .1, (bz + pz) / 2 - .02], [px - .09, tie + .03, pz + .01]], .017);
  add(new THREE.SphereGeometry(.035, 6, 4), mat('ropeKnot'), bx, by, bz, st);
  return water + H - drop + .35;
}
// a rail along a polyline of points (a tube of constant radius)
function ueLimb2(g, pts, r, m) { for (let i = 0; i < pts.length - 1; i++) ueLimb(g, pts[i], pts[i + 1], r, r, m, 4); }
