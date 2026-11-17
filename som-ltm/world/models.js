// ---------- hand-built models for the Sermon on the Mount (model workshop, 2026-11-17) ----------
// Each model is registered in the object library (defObject) as 'som-…', built around its own base at (0, 0, 0),
// its front facing local +z (towards the viewer when placed with the room's yaw). Each one is judged on its own by a blind
// critic in the showcase (?model=id, see world/after.js) before it goes into a room.
const MM = (k, c, map, o = {}) => { const m = mat(k, c, o); if (map) { m.map = map; m.needsUpdate = true; } return m; };
const mLeather = MM('somLeather', '#7a5232', TEX.cloth), mLeatherDk = MM('somLeatherDk', '#5a3a22', TEX.cloth), mCord = MM('somCord', '#c8b48a'),
  mLime = MM('somLime', '#ebe4d2'), mLimeDk = MM('somLimeDk', '#d6ccb4'), mRock = MM('somRockM', '#aaa08e'), mRockDk = MM('somRockMDk', '#8c8476'),
  mThorn = MM('somThornM', '#6e7a3a'), mThornWood = MM('somThornWood', '#5a4430'), mWood = MM('somWoodM', '#8a6440', TEX.wood), mWoodLt = MM('somWoodLtM', '#b48a5a', TEX.wood),
  mWoodDk = MM('somWoodDkM', '#5e4028', TEX.wood), mIron = MM('somIronM', '#4a4744'), mMud = MM('somMudM', '#c4a070', TEX.plaster), mBrick = MM('somBrickM', '#b88c5c', TEX.stone),
  mPlaster = MM('somPlasterM', '#e8dcc4', TEX.plaster), mClay = MM('somClayM', '#c47a4a', TEX.pot), mClayDk = MM('somClayDkM', '#9a5a36', TEX.pot), mStraw = MM('somStrawM', '#e2c464', TEX.wicker),
  mComb = MM('somCombM', '#e0a838'), mHoney = MM('somHoneyM', '#c8841c', null, { roughness: .3 }), mPalmTrunk = MM('somPalmTrunkM', '#8a6a46', TEX.wicker), mFrond = MM('somFrondM', '#5f8a34', null, { side: THREE.DoubleSide }),
  mDates = MM('somDatesM', '#a8541e'), mBrine = MM('somBrineM', '#a8c8c0', null, { roughness: .2 }), mFishM = MM('somFishMM', '#a8b8c0', null, { roughness: .4 }), mSalt = MM('somSaltM', '#f6f2ea'),
  mRope = MM('somRopeM', '#c8ae7c', TEX.wicker), mSmoke = MM('somSmokeM', '#ece8e0', null, { transparent: true, opacity: .45, depthWrite: false }), mDark = MM('somDarkM', '#241c16'), mGrass = MM('somGrassM', '#7a8a3e');
const G = () => new THREE.Group();
const bx = (g, w, h, d, m, x, y, z, ry = 0, rx = 0, rz = 0) => { const o = box(w, h, d, m, x, y, z, g); o.rotation.set(rx, ry, rz); return o; };
const cy = (g, rt, rb, h, s, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = cyl(rt, rb, h, s, m, x, y, z, g); o.rotation.set(rx, ry, rz); return o; };
const lathe = (g, pts, m, x, y, z, seg = 14) => add(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), m, x, y, z, g);
// an irregular flat stone: a low polygon prism with jittered corners
function slab(g, r, h, m, x, y, z, sides = 6, ry = 0) { const sh = new THREE.Shape(); for (let i = 0; i < sides; i++) { const a = i / sides * 6.283, rr = r * R(.75, 1.15); i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: h * .25, bevelSize: h * .35, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2); const o = add(geo, m, x, y, z, g); o.rotation.y = ry; return o; }
function boulder(g, r, m, x, y, z, sy = .7) { const mm = m.clone(); mm.color.offsetHSL(0, R(-.02, .02), R(-.05, .05)); const o = add(new THREE.DodecahedronGeometry(r, 0), mm, x, y + r * sy * .55, z, g); o.scale.set(R(.85, 1.15), sy, R(.85, 1.15)); o.rotation.set(R(-.2, .2), R(0, 3), R(-.2, .2)); return o; }
function thornBush(g, x, y, z, s = 1) { for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, l = R(.35, .6) * s; const b = cy(g, .012 * s, .03 * s, l, 4, mThornWood, x + Math.cos(a) * .05, y, z + Math.sin(a) * .05, Math.sin(a) * .7, 0, -Math.cos(a) * .7);
    for (let k = 0; k < 4; k++) { const t = k / 4 + .2; const lf = add(new THREE.IcosahedronGeometry(.06 * s, 0), mThorn, x + Math.cos(a) * l * t * .7, y + l * t * .75, z + Math.sin(a) * l * t * .7, g); lf.scale.set(1, .6, 1); } } }
function def(id, label, fn) { defObject(id, (g, x, y, z) => { const h = G(); h.position.set(x, y, z); g.add(h); return fn(h); }, { label, origin: 'sermon on the mount', kind: 'object' }); }

// ---- the Seat (5:1–5) ----
def('som-goatskin-bag', 'Goatskin water bag hung from a forked stake', g => {
  cy(g, .05, .07, 1.9, 7, mWoodDk, 0, 0, -.35); cy(g, .03, .045, .55, 6, mWoodDk, -.14, 1.75, -.35, 0, 0, .6); cy(g, .03, .045, .55, 6, mWoodDk, .14, 1.75, -.35, 0, 0, -.6);   // the forked stake, behind the bag
  const hair = MM('somGoatHair', '#8a6440', TEX.cloth), seam = MM('somSeam', '#4a3020');
  const body = add(new THREE.CapsuleGeometry(.25, .62, 6, 12), hair, 0, .95, .1, g); body.rotation.z = Math.PI / 2; body.scale.set(1, 1.05, .85); const belly = add(new THREE.SphereGeometry(.27, 12, 8), hair, .05, .83, .1, g); belly.scale.set(1.5, .72, .85);
  bx(g, 1.0, .02, .02, seam, 0, 1.12, .3); bx(g, .02, .35, .02, seam, -.15, .95, .32);   // seams of the stitched skin
  for (const x of [-.45, -.3, .3, .45]) { cy(g, .055, .075, .3, 7, mLeatherDk, x, 1.12, .1, 0, 0, x < 0 ? .45 : -.45); cy(g, .06, .06, .04, 7, mCord, x * 1.12, 1.3, .1, 0, 0, x < 0 ? .45 : -.45); }   // four leg stubs, tied off
  cy(g, .08, .11, .3, 8, mLeatherDk, -.66, .95, .1, 0, 0, 1.15); cy(g, .085, .085, .05, 8, mCord, -.8, 1.01, .1, 0, 0, 1.15); cy(g, .05, .05, .06, 6, mWoodLt, -.84, 1.04, .1, 0, 0, 1.15);   // the neck, tied, a wooden stopper
  for (const x of [-.5, .5]) { const lx = x * .9, ly = 1.32, tx = x * .32, ty = 1.95, L = Math.hypot(tx - lx, ty - ly, .45); const c = cy(g, .013, .013, L, 4, mCord, (lx + tx) / 2, (ly + ty) / 2 - L / 2, -.12, .55, 0, Math.atan2(tx - lx, ty - ly) * -1); }   // cords from the legs up to the fork
  return 2.0; });
def('som-limestone-pavement', 'Bare limestone pavement', g => {
  const soil = add(new THREE.CircleGeometry(2.1, 9), MM('somCrack', '#6a5e48'), 0, .005, 0, g); soil.rotation.x = -Math.PI / 2; soil.scale.set(1, .9, 1);
  const P = [[0, 0, .9], [1.25, -.35, .65], [-1.15, .2, .7], [.35, 1.05, .62], [-.45, -.95, .6], [1.05, .85, .45], [-1.3, -.85, .4], [.25, -1.5, .45], [-.8, 1.1, .45]];
  P.forEach(([x, z, r], i) => { const sh = new THREE.Shape(); const n = 4 + (i % 3); for (let k = 0; k < n; k++) { const a = k / n * 6.283 + R(-.3, .3), rr = r * R(.7, 1.05); k ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: R(.12, .2), bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const o = add(geo, i % 3 ? mLime : mLimeDk, x, 0, z, g); o.rotation.y = R(0, 3); });   // angular blocks with deep cracks between
  for (let i = 0; i < 26; i++) { const a = R(0, 6.3), d = R(.4, 1.9); add(new THREE.ConeGeometry(.035, R(.15, .3), 3), mGrass, Math.cos(a) * d, .08, Math.sin(a) * d, g); }   // grass in the grikes
  return .22; });
def('som-seat-rock', 'Flat seat-rock', g => {
  const rk = MM('somSeatRock', '#b4aa96'); const shp = new THREE.Shape(); [[1.2, 0], [.8, .9], [-.4, 1.05], [-1.15, .35], [-1, -.6], [-.1, -1.1], [.9, -.75]].forEach(([x, z], i) => i ? shp.lineTo(x, z) : shp.moveTo(x, z));
  const geo = new THREE.ExtrudeGeometry(shp, { depth: .55, bevelEnabled: true, bevelThickness: .12, bevelSize: .15, bevelSegments: 2 }); geo.rotateX(-Math.PI / 2); add(geo, rk, 0, 0, 0, g);   // one stone, its top worn flat
  for (const [x, z, r] of [[-1.35, .55, .3], [1.25, .7, .25], [1.4, -.5, .2], [-.9, -1.15, .22], [.3, 1.35, .18]]) boulder(g, r, mRockDk, x, 0, z, .7);
  return .8; });
def('som-split-boulder', 'Split boulder with a thornbush in the crack', g => {
  const geo = new THREE.DodecahedronGeometry(.9, 0); const half = (s) => { const o = add(geo.clone(), mRock, s * .52, .55, 0, g); o.scale.set(.62, .78, .95); o.rotation.y = .3; return o; }; half(-1); half(1);   // the two halves of one stone
  for (let k = 0; k < 3; k++) thornBush(g, R(-.05, .05), .25 + k * .1, R(-.25, .25), 1.6);
  return 1.3; });

// ---- the Sheepfold (5:6–10) ----
function dryWall(g, x0, z0, x1, z1, hh, th = .5) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / .42)); for (let row = 0; row < Math.round(hh / .26); row++) for (let k = 0; k <= n; k++) { const t = Math.min(1, (k + (row % 2) * .5) / n);
  const st = add(new THREE.BoxGeometry(R(.38, .5), R(.2, .28), th * R(.85, 1.05)), rnd() > .45 ? mRock : mRockDk, x0 + (x1 - x0) * t, .13 + row * .25, z0 + (z1 - z0) * t, g); st.rotation.y = -Math.atan2(z1 - z0, x1 - x0) + R(-.1, .1); st.rotation.z = R(-.06, .06); } }
def('som-slab-corner', 'Corner of the fold roofed with flat slabs', g => {
  bx(g, 2.6, .02, 2.4, MM('somFoldFloor', '#9a8458'), 0, .01, -.1);   // trodden earth floor
  dryWall(g, -1.25, -1.25, 1.25, -1.25, 1.35, .7); dryWall(g, -1.25, -1.25, -1.25, 1.05, 1.35, .7);
  slab(g, 1.0, .2, mRockDk, -.35, 1.38, -.5, 5, .4); slab(g, .9, .2, mRock, .3, 1.4, -.25, 5, 1.6); slab(g, .8, .18, mRockDk, -.5, 1.42, .3, 5, 2.6);   // three thick slabs laid across for shade
  return 1.7; });
def('som-crook', 'Shepherd\'s crook hung on a peg on the wall', g => {
  dryWall(g, -.9, 0, .9, 0, 1.0, .45); const peg = cy(g, .045, .045, .32, 6, mWoodLt, .2, 1.0, .22, Math.PI / 2);   // dry-stone wall, a stout wooden peg
  cy(g, .03, .035, 1.25, 7, mWoodLt, .48, -.05, .3, 0, 0, .02); const hk = add(new THREE.TorusGeometry(.15, .03, 6, 12, Math.PI * 1.1), mWoodLt, .33, 1.2, .3, g); hk.rotation.z = -.05;   // the crook hanging by its hook over the peg
  return 1.4; });
def('som-fold-gateway', 'Gateway of the fold', g => {
  dryWall(g, -2.8, 0, -.85, 0, 1.25, .6); dryWall(g, .85, 0, 2.8, 0, 1.25, .6);
  for (const s of [-1, 1]) bx(g, .45, 1.6, .55, mRock, s * .68, 0, 0, s * .04);   // two upright slabs with flat bearing faces
  bx(g, 1.9, .26, .6, mRockDk, 0, 1.6, 0, .03); bx(g, 1.2, .02, .9, MM('somWorn', '#b8a070'), 0, .01, .3);   // the lintel; worn earth through the gap
  return 1.9; });

// ---- the House on the Sand (7:26–29) ----
def('som-date-palm', 'Date palm leaning over the house', g => {
  let x = 0, y = 0; for (let i = 0; i < 10; i++) { const lean = .07 * (i + 1) * .45, r0 = .26 - i * .013, h = .55; cy(g, r0 - .015, r0, h, 9, mPalmTrunk, x, y, 0, 0, 0, -lean); x += Math.sin(lean) * h; y += Math.cos(lean) * h; add(new THREE.TorusGeometry(r0 - .01, .035, 4, 9), mWoodDk, x, y - .03, 0, g).rotation.set(Math.PI / 2, 0, -lean); }   // tapering, scarred trunk, leaning
  for (let k = 0; k < 15; k++) { const a = k / 15 * 6.28, droop = k % 2 ? .55 : .25, fr = new THREE.Group(); fr.position.set(x, y + .1, 0); fr.rotation.set(0, a, 0); g.add(fr);
    for (let j = 0; j < 7; j++) { const t = (j + .5) / 7, L = 2.2, px = t * L, py = Math.sin(t * 2.4) * .5 - t * t * droop * 2; const lf = bx(fr, .3, .015, .55 * (1 - t * .6), mFrond, px, py, 0, 0, 0, -.3 - t * droop); }
  }   // fifteen arching fronds
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.28; for (let j = 0; j < 8; j++) add(new THREE.SphereGeometry(.06, 5, 4), mDates, x + Math.cos(a) * .35 + R(-.08, .08), y - .2 - j * .05, Math.sin(a) * .35 + R(-.08, .08), g).scale.y = 1.4; }   // hanging date clusters
  return y + .5; });
def('som-mudbrick-wall', 'Low mud-brick wall of the yard', g => {
  const mb = MM('somMudBrick', '#b49a74', TEX.plaster), mb2 = MM('somMudBrick2', '#a68c66', TEX.plaster);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) bx(g, .56 * R(.94, 1.02), .24, .36, rnd() > .5 ? mb : mb2, -1.45 + k * .58 + (row % 2) * .29, row * .25, 0, R(-.04, .04), 0, R(-.03, .03));
  const cap = add(new THREE.CapsuleGeometry(.2, 3.1, 4, 8), mb, 0, .82, 0, g); cap.rotation.z = Math.PI / 2; cap.scale.set(1, .6, 1);   // a rounded mud coping
  return .95; });

// ---- the Ox Stall (6:21–25) ----
def('som-yoke-on-peg', 'Yoke for two oxen, hung on its peg', g => {
  dryWall(g, -1.5, -.3, 1.5, -.3, 2.1, .45); cy(g, .07, .07, .6, 7, mWoodLt, 0, 1.85, .0, Math.PI / 2);   // coursed stall wall and a stout peg
  const yk = MM('somYokeWood', '#c89a62', TEX.wood); const beam = add(new THREE.TorusGeometry(3.2, .1, 6, 30, .62), yk, 0, -1.45, .35, g); beam.rotation.z = Math.PI / 2 - .31;   // a long, gently curved beam hung at its middle
  for (const s of [-.75, .75]) { const bow = add(new THREE.TorusGeometry(.3, .055, 6, 14, Math.PI), yk, s, 1.42, .35, g); bow.rotation.z = Math.PI; for (const d of [-.3, .3]) cy(g, .04, .04, .2, 5, mWoodDk, s + d, 1.6, .35); }   // two big U-shaped bows hanging below, pegged through the beam
  add(new THREE.TorusGeometry(.09, .025, 4, 10), mIron, 0, 1.55, .45, g);
  return 2.1; });
def('som-plough', 'Wooden plough (ard) with an iron share', g => {
  bx(g, .16, .14, 1.0, mWood, 0, .06, .45);   // the sole, along the ground
  const share = add(new THREE.ConeGeometry(.08, .45, 4), mIron, 0, .1, 1.12, g); share.rotation.x = Math.PI / 2;   // the pointed iron share on its tip
  const beam = bx(g, .12, .12, 2.6, mWoodLt, 0, .75, -.45, 0, .42);   // the long beam rising from the sole to the yoke
  const stilt = bx(g, .1, 1.1, .1, mWood, 0, .1, .05, 0, -.3); bx(g, .5, .08, .08, mWoodLt, 0, 1.15, -.25, 0, -.3);   // the handle upright and its grip
  return 1.3; });
def('som-feeding-niche', 'Roof pillar with a feeding niche of hay', g => {
  for (let row = 0; row < 9; row++) for (const [x, z, w, d] of [[0, -.3, .9, .3], [0, .3, .9, .3], [-.3, 0, .3, .3], [.3, 0, .3, .3]]) { if (row >= 2 && row <= 4 && z > .2) continue; bx(g, w * R(.97, 1.03), .28, d, rnd() > .5 ? mRock : mRockDk, x, row * .3, z, R(-.03, .03)); }
  bx(g, .7, .08, .5, mRockDk, 0, .58, .15); bx(g, .7, .08, .5, mRockDk, 0, 1.5, .15);
  bx(g, .6, .25, .4, mWood, 0, .66, .18); for (let i = 0; i < 26; i++) bx(g, R(.3, .6), .025, .03, mStraw, R(-.22, .22), .9 + R(0, .3), R(.05, .45), R(0, 3), 0, R(-.5, .5));
  bx(g, 1.2, .25, 1.0, mWoodDk, 0, 2.7, 0);
  return 2.95; });

// ---- the Bee Bank (5:31–35) ----
def('som-hive-pipes', 'Stack of clay hive pipes', g => {
  const lid = MM('somHiveLid', '#d8c4a0', TEX.plaster);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) { const x = (k - (3 - row) / 2) * .36, y = .2 + row * .33; cy(g, .16, .16, 1.4, 12, row % 2 ? mClay : mClayDk, x, y, 0, Math.PI / 2);
    cy(g, .165, .165, .05, 12, lid, x, y, .71, Math.PI / 2); add(new THREE.CircleGeometry(.035, 8), mDark, x, y - .06, .74, g); }
  bx(g, 1.8, .08, 1.5, mRock, 0, -.04, 0); for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(.014, 4, 3), mDark, R(-.6, .6), R(.15, .9), R(.76, .95), g);
  return 1.2; });
def('som-smoker-pot', 'Beekeeper\'s smoker pot', g => {
  boulder(g, .35, mRock, 0, 0, 0, .7); lathe(g, [[0, 0], [.2, .02], [.28, .2], [.27, .42], [.2, .52], [.21, .56], [.17, .56], [.16, .5]], mClay, 0, .42, 0); cy(g, .17, .17, .02, 12, mDark, 0, .96, 0);
  cy(g, .06, .1, .5, 10, mClay, .3, .78, 0, 0, 0, -1.0); cy(g, .07, .07, .03, 10, mDark, .52, .93, 0, 0, 0, -1.0);
  for (let k = 0; k < 5; k++) add(new THREE.SphereGeometry(.05 + k * .035, 8, 6), MM('somSmokeT', '#ece8e0', null, { transparent: true, opacity: .3, depthWrite: false }), .58 + k * .1, .98 + k * .16, 0, g);
  return 1.0; });
def('som-comb-tray', 'Tray of golden honeycomb', g => {
  bx(g, 1.2, .55, .9, mRock, 0, 0, 0); bx(g, 1.05, .06, .75, mWoodLt, 0, .55, 0); for (const s of [-.5, .5]) bx(g, 1.05, .1, .05, mWoodLt, 0, .58, s * .72);
  for (let k = 0; k < 4; k++) { const w = R(.18, .26), x = -.36 + k * .24; bx(g, w, R(.07, .1), .55, mComb, x, .61, R(-.03, .03), R(-.15, .15)); for (let c = 0; c < 5; c++) add(new THREE.CircleGeometry(.03, 6), mHoney, x + R(-.07, .07), .7, -.22 + c * .11, g).rotation.x = -Math.PI / 2; }
  for (let i = 0; i < 6; i++) { const dr = add(new THREE.SphereGeometry(.03, 6, 5), mHoney, R(-.5, .5), .52, R(.36, .4), g); dr.scale.y = 2.2; }
  return .75; });

// ---- the Fisherman's Court (7:6–10) ----
def('som-salting-vat', 'Fish-salting vat', g => {
  lathe(g, [[0, 0], [.75, 0], [.82, .1], [.8, .75], [.86, .82], [.7, .82], [.68, .2], [0, .2]], mPlaster, 0, 0, 0, 20); cy(g, .68, .68, .04, 20, mBrine, 0, .62, 0);
  add(new THREE.TorusGeometry(.72, .05, 5, 24), mSalt, 0, .78, 0, g).rotation.x = Math.PI / 2;
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, f = add(new THREE.CapsuleGeometry(.08, .38, 4, 8), mFishM, Math.cos(a) * .36, .67, Math.sin(a) * .36, g); f.rotation.set(Math.PI / 2, 0, a + 1.57); }
  const lid = new THREE.Group(); lid.position.set(1.05, .55, .2); lid.rotation.set(0, .4, .35); g.add(lid); cy(lid, .55, .55, .06, 18, mWoodLt, 0, 0, 0, Math.PI / 2); for (const s of [-.22, .22]) bx(lid, .08, 1.0, .06, mWood, s, -.5, .05);
  return .9; });
def('som-mending-stone', 'Mending stone with a net spread over it', g => {
  boulder(g, .7, mRock, 0, 0, 0, .6);
  const net = MM('somNetM', '#8a7a5a'); for (let i = -6; i <= 6; i++) { bx(g, 1.6, .012, .012, net, 0, .5 - Math.abs(i) * .01, i * .1); bx(g, .012, .012, 1.3, net, i * .12, .5 - Math.abs(i) * .01, 0); }
  for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(.26 - k * .07, .04, 6, 16), mRope, -.6, .08 + k * .07, .5, g).rotation.x = Math.PI / 2;
  bx(g, .05, .025, .4, mWoodLt, .2, .54, .1, .6); bx(g, .012, .03, .3, mCord, .2, .56, .1, .6);
  return .75; });
def('som-court-entrance', 'Entrance of a basalt courtyard', g => {
  const bas = MM('somBasaltM2', '#7c766e'), basDk = MM('somBasaltM3', '#625c56');
  for (const s of [-1, 1]) { for (let row = 0; row < 6; row++) bx(g, .55, .3, .55, row % 2 ? bas : basDk, s * .85, row * .31, 0, R(-.04, .04));
    for (let row = 0; row < 5; row++) for (let k = 0; k < 4; k++) bx(g, .42, .28, .45, rnd() > .5 ? bas : basDk, s * (1.35 + k * .44 + (row % 2) * .2), row * .3, 0, R(-.05, .05)); }
  bx(g, 2.4, .32, .6, basDk, 0, 1.86, 0); bx(g, 1.2, .03, .7, MM('somWorn', '#b8a070'), 0, .01, .3);
  return 2.2; });

// ---- the Ridge Road (5:41–45) ----
def('som-culvert', 'Culvert stones over a gully', g => {
  const earth = MM('somEarthBank', '#a8905e'); for (const s of [-1, 1]) bx(g, 1.4, .7, 2.4, earth, s * 1.15, -.15, 0, 0, 0, -s * .18);
  bx(g, .9, .02, 3.2, MM('somGullyBed', '#7a6a48'), 0, -.02, 0); for (let i = 0; i < 6; i++) boulder(g, R(.08, .14), mRockDk, R(-.3, .3), 0, R(-1.4, 1.4), .6);
  for (const s of [-1, 1]) for (let row = 0; row < 2; row++) for (let k = 0; k < 3; k++) bx(g, .35, .26, .42, row ? mRock : mRockDk, s * .58, row * .27, (k - 1) * .46, R(-.05, .05));
  for (let k = -1; k <= 1; k++) bx(g, 1.6, .16, .48, mRock, 0, .54, k * .5, R(-.04, .04));
  return .75; });
def('som-amphora-buried', 'Old amphora half-buried by the road', g => {
  const earth = MM('somEarthM', '#9a7e56'); const mound = add(new THREE.SphereGeometry(.9, 12, 6, 0, 6.3, 0, 1.57), earth, -.1, -.05, 0, g); mound.scale.set(1.2, .35, 1);
  const am = new THREE.Group(); am.position.set(.1, .05, 0); am.rotation.z = .75; g.add(am);
  lathe(am, [[0, 0], [.08, .02], [.22, .3], [.3, .7], [.28, 1.0], [.16, 1.2], [.1, 1.25], [.1, 1.5], [.14, 1.55], [.12, 1.58], [.08, 1.56]], mClay, 0, 0, 0, 16);
  add(new THREE.TorusGeometry(.12, .025, 6, 14), mClay, 0, 1.56, 0, am).rotation.x = Math.PI / 2; for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(.16, .035, 6, 12, Math.PI), mClay, s * .12, 1.3, 0, am); h.rotation.set(0, Math.PI / 2, s > 0 ? -.4 : .4); }
  return .9; });
def('som-broken-cart', 'Cart with a broken wheel, propped on stones', g => {
  bx(g, 1.4, .1, 2.2, mWoodLt, 0, .62, 0, 0, 0, .12); for (const s of [-1, 1]) bx(g, .08, .3, 2.2, mWood, s * .68, .7, 0, 0, 0, .12);
  for (const s of [-1, 1]) bx(g, .07, .07, 1.6, mWood, s * .3, .6, 1.8, 0, .25); cy(g, .06, .06, 1.7, 6, mWoodDk, 0, .5, 0, 0, 0, Math.PI / 2);
  const wheel = (gg, x, y, z, rx, ry, rz, broken) => { const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.set(rx, ry, rz); gg.add(w); add(new THREE.TorusGeometry(.5, .05, 6, 18, broken ? 4.6 : 6.3), mWood, 0, 0, 0, w); cy(w, .1, .1, .14, 10, mWoodDk, 0, 0, 0, Math.PI / 2);
    for (let k = 0; k < (broken ? 4 : 8); k++) { const sp = bx(w, .035, .5, .035, mWoodDk, 0, 0, 0, 0, 0, k / 8 * 6.28); sp.position.set(Math.sin(k / 8 * 6.28) * -.25, Math.cos(k / 8 * 6.28) * .25 - .25, 0); } };
  wheel(g, .84, .55, 0, 0, Math.PI / 2, 0, false);
  for (let k = 0; k < 3; k++) boulder(g, .26, mRockDk, -.75, k * .22, R(-.15, .15), .8);
  wheel(g, -1.6, .06, 1.0, -Math.PI / 2, 0, 0, true);
  return 1.2; });
def('som-resting-stone', 'Resting stone at the fork of the road', g => {
  slab(g, .95, .42, mRock, 0, 0, 0, 7, .3); slab(g, .82, .05, mLime, 0, .52, 0, 7, .5);
  const tr = MM('somTrack', '#b8a07a'); bx(g, .9, .03, 4.4, tr, 0, .025, 2.6); bx(g, .9, .03, 3.6, tr, -1.1, .025, -1.7, .5); bx(g, .9, .03, 3.6, tr, 1.1, .025, -1.7, -.5);
  return .6; });
