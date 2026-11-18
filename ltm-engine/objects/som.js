// ---------- OBJECT LIBRARY: hand-built models from the Sermon on the Mount workshop (som-ltm, 2026-11) ----------
// Each was scored alone by a blind model critic (som-ltm/refs/models/). Ids start 'som-'. Wrapped in a block so its helpers stay private.
{
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
// an upright cylinder stands on y; a tipped one (rx or rz set) is centred on y, so lying logs, pipes and hafts sit where they are put
const cy = (g, rt, rb, h, s, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = cyl(rt, rb, h, s, m, x, y, z, g); o.rotation.set(rx, ry, rz); if (rx || rz) o.position.y = y; return o; };
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
  cy(g, .06, .08, 2.1, 7, mWoodDk, 0, 0, 0); for (const s of [-1, 1]) cy(g, .035, .05, .55, 6, mWoodDk, s * .14, 2.0, 0, 0, 0, -s * .5);   // a stout stake, forked at the top
  cy(g, .02, .02, .5, 5, mWood, 0, 2.26, 0, 0, 0, Math.PI / 2);   // a crossbar resting in the fork
  const bag = add(new THREE.SphereGeometry(.34, 14, 10), mLeather, 0, 1.15, .32, g); bag.scale.set(1.05, 1.25, .8);   // the swollen skin, full of water
  for (const s of [-1, 1]) { cy(g, .012, .012, .7, 4, mCord, s * .17, 1.88, .2, .35, 0, -s * .2);   // two cords from the crossbar to the tied legs
    cy(g, .05, .045, .22, 7, mLeatherDk, s * .22, 1.5, .28, 0, 0, s * .9); cy(g, .045, .04, .2, 7, mLeatherDk, s * .3, .78, .32, 0, 0, -s * 2.4); }   // four tied leg stumps
  cy(g, .06, .08, .28, 8, mLeatherDk, 0, .7, .4, .5); cy(g, .07, .07, .04, 8, mCord, 0, .72, .48, .5);   // the neck spout, tied off, hanging at the bottom
  const drip = add(new THREE.SphereGeometry(.02, 6, 5), mBrine, 0, .6, .52, g); drip.scale.y = 1.8;
  return 2.3; });
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
  const lean = .22, H = 6.2, segs = 14; for (let i = 0; i < segs; i++) { const t = i / segs, r = .24 - t * .06; cy(g, r * .92, r, H / segs * 1.02, 9, mPalmTrunk, Math.sin(lean) * t * H, t * H, 0, 0, 0, -lean); }   // thick ringed trunk
  const top = new THREE.Group(); top.position.set(Math.sin(lean) * H, H, 0); g.add(top);
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28 + R(-.1, .1), up = k % 2 ? .5 : -.1, fr = new THREE.Group(); fr.rotation.y = a; top.add(fr);
    const pts = []; for (let j = 0; j <= 8; j++) { const t = j / 8; pts.push(new THREE.Vector3(t * 2.6, Math.sin(t * 2.4) * (.6 + up) - t * t * 1.4, 0)); } const curve = new THREE.CatmullRomCurve3(pts);
    add(new THREE.TubeGeometry(curve, 10, .025, 4), mPalmTrunk, 0, 0, 0, fr);   // the arching midrib
    for (let j = 1; j < 14; j++) { const p = curve.getPoint(j / 14), w = .5 * Math.sin(j / 14 * 3.1); for (const s of [-1, 1]) { const lf = bx(fr, .07, .015, w, mFrond, p.x, p.y, s * w / 2); lf.rotation.x = s * .5; } } }   // leaflets either side, making a feathered crown
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + .4, dx = Math.cos(a) * .35, dz = Math.sin(a) * .35; for (let i = 0; i < 26; i++) add(new THREE.SphereGeometry(.05, 6, 5), mDates, top.position.x + dx + R(-.13, .13), H - .35 - R(0, .6), dz + R(-.13, .13), g);   // big date bunches hanging below the crown
    cy(g, .015, .015, .6, 4, mStraw, top.position.x + dx, H - .3, dz, 0, 0, .2); }
  return H + 1; });
def('som-mudbrick-wall', 'Low mud-brick wall of the yard', g => {
  const mb = MM('somMudBrick', '#b49a74', TEX.plaster), mb2 = MM('somMudBrick2', '#a68c66', TEX.plaster);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) bx(g, .56 * R(.94, 1.02), .24, .36, rnd() > .5 ? mb : mb2, -1.45 + k * .58 + (row % 2) * .29, row * .25, 0, R(-.04, .04), 0, R(-.03, .03));
  const cap = add(new THREE.CapsuleGeometry(.2, 3.1, 4, 8), mb, 0, .82, 0, g); cap.rotation.z = Math.PI / 2; cap.scale.set(1, .6, 1);   // a rounded mud coping
  return .95; });

// ---- the Ox Stall (6:21–25) ----
def('som-yoke-on-peg', 'Yoke for two oxen, hung on its peg', g => {
  dryWall(g, -1.3, -.4, 1.3, -.4, 2.0, .45);   // the stall's coursed stone wall behind
  cy(g, .06, .06, .55, 8, mWoodDk, 0, 1.55, -.1, Math.PI / 2);   // one stout peg sticking out of the wall face
  add(new THREE.TorusGeometry(.09, .022, 5, 10), mRope, 0, 1.5, .12, g);   // the cord loop over the peg
  cy(g, .015, .015, .22, 4, mRope, 0, 1.38, .14);
  const sh = new THREE.Shape(); sh.moveTo(-1, -.06); [[-.85, -.08], [-.75, -.1], [-.55, .02], [-.35, -.1], [-.2, -.08], [.2, -.08], [.35, -.1], [.55, .02], [.75, -.1], [.85, -.08], [1, -.06], [1, .1], [-1, .1]].forEach(([a, b]) => sh.lineTo(a, b));
  add(new THREE.ExtrudeGeometry(sh, { depth: .16, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1 }), MM('somYokeWood', '#8e6a42', TEX.wood), 0, 1.18, .02, g);   // the carved beam hanging against the wall face, two neck hollows
  for (const s of [-.55, .55]) { const bow = add(new THREE.TorusGeometry(.24, .04, 6, 16, Math.PI), mWoodLt, s, 1.16, .1, g); bow.rotation.z = Math.PI; for (const t of [-1, 1]) cy(g, .022, .022, .26, 5, mWoodDk, s + t * .24, 1.12, .1); }   // a U-bow hanging under each hollow
  return 2.0; });
def('som-plough', 'Wooden plough (ard) with an iron share', g => {
  const sole = bx(g, .14, .12, 1.0, mWood, 0, .05, 0, 0, .15);   // the sole dragging along the ground
  const sh = new THREE.ConeGeometry(.09, .4, 4); sh.rotateX(Math.PI / 2); add(sh, mIron, 0, .02, .66, g).scale.x = 1.4;   // a big iron share on its point
  cy(g, .06, .07, 1.25, 7, mWood, 0, .55, -.45, .45);   // the stilt rising at the back
  bx(g, .5, .07, .07, mWoodDk, 0, 1.17, -.75); for (const s of [-1, 1]) cy(g, .035, .035, .2, 5, mWoodDk, s * .25, 1.15, -.75, 0, 0, Math.PI / 2);   // a crosswise handle on top
  const beam = cy(g, .06, .08, 3.0, 8, mWoodLt, 0, .4, .9, -1.32);   // the long beam from the stilt out to the yoke
  bx(g, .1, .12, .12, mWoodDk, 0, .6, -.1); for (let k = 0; k < 3; k++) cy(g, .068, .068, .05, 7, mRope, 0, .75, .1 + k * .2, -1.32);   // lashings where beam meets stilt
  bx(g, .9, .1, .1, mWood, 0, 1.15, 2.2); cy(g, .02, .02, .3, 4, mWoodDk, 0, 1.05, 2.2);   // the yoke-bar at the far end of the beam
  return 1.3; });
def('som-feeding-niche', 'Roof pillar with a feeding niche of hay', g => {
  const tones = [mRock, mRockDk, MM('somRockWarm', '#b8a68a')];
  for (let row = 0; row < 9; row++) for (const [x, z, w, d] of [[0, -.32, .95, .32], [0, .32, .95, .32], [-.32, 0, .32, .32], [.32, 0, .32, .32]]) { if (row >= 2 && row <= 4 && z > .2) continue; bx(g, w * R(.97, 1.03), .28, d, tones[(rnd() * 3) | 0], x, row * .3, z, R(-.03, .03)); }
  for (const s of [-1, 1]) bx(g, .14, .95, .36, mRockDk, s * .4, .6, .32);   // the niche's cut sides
  bx(g, .8, .1, .5, mRockDk, 0, .56, .2); bx(g, .8, .12, .5, mRockDk, 0, 1.5, .2);
  bx(g, .66, .28, .42, mWood, 0, .66, .2); for (let i = 0; i < 34; i++) bx(g, R(.3, .6), .025, .03, mStraw, R(-.25, .25), .9 + R(0, .32), R(.05, .45), R(0, 3), 0, R(-.5, .5));   // the manger in the niche, heaped with hay
  bx(g, 3.2, .3, .45, mWoodDk, 0, 2.7, 0); for (const s of [-1, 1]) bx(g, .9, .1, .9, mRockDk, 0, 2.62, 0);   // the roof beam running across on a capstone
  return 3.0; });

// ---- the Bee Bank (5:31–35) ----
def('som-hive-pipes', 'Stack of clay hive pipes', g => {
  const lid = MM('somHiveLid', '#cdb894', TEX.plaster), pipeA = MM('somPipeA', '#a8714c', TEX.pot), pipeB = MM('somPipeB', '#946446', TEX.pot);
  for (let i = 0; i < 6; i++) boulder(g, .35, mRock, -1 + i * .4, -.1, R(-.3, .3), .5);   // a low stone bed
  for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) { const x = (k - (3 - row) / 2) * .36 + R(-.02, .02), y = .32 + row * .33; cy(g, .16 * R(.95, 1.05), .16, 1.4, 12, (row + k) % 2 ? pipeA : pipeB, x, y, R(-.05, .05), Math.PI / 2);
    const cap = add(new THREE.SphereGeometry(.16, 10, 6, 0, 6.3, 0, 1.2), lid, x, y, .7, g); cap.rotation.x = Math.PI / 2; cap.scale.set(1, .4, 1); add(new THREE.CircleGeometry(.03, 8), mDark, x, y - .07, .77, g); }   // domed mud caps, each with a small hole
  for (let i = 0; i < 16; i++) { const b = add(new THREE.SphereGeometry(.025, 5, 4), MM('somBee', '#3a2a10'), R(-.7, .7), R(.2, 1.3), R(.75, 1.1), g); b.scale.x = 1.6; }   // bees about the holes
  return 1.35; });
def('som-smoker-pot', 'Beekeeper\'s smoker pot', g => {
  slab(g, .45, .25, mRock, 0, 0, 0, 6); lathe(g, [[0, 0], [.2, .02], [.28, .2], [.27, .42], [.2, .52], [.21, .56], [.17, .56], [.16, .5]], mClay, 0, .3, 0); cy(g, .17, .17, .02, 12, MM('somEmber', '#5a2a18'), 0, .84, 0);
  cy(g, .06, .1, .5, 10, mClay, .3, .66, 0, 0, 0, -1.0);
  for (let k = 0; k < 9; k++) add(new THREE.SphereGeometry(.04 + k * .025, 8, 6), MM('somSmokeT2', '#ece8e0', null, { transparent: true, opacity: .38, depthWrite: false }), .56 + k * .07, .86 + k * .13, R(-.03, .03), g);   // smoke rising from the spout
  return .95; });
def('som-comb-tray', 'Tray of golden honeycomb', g => {
  boulder(g, .6, mRock, 0, -.15, 0, .55); bx(g, 1.05, .06, .75, mWoodLt, 0, .42, 0); for (const s of [-.5, .5]) bx(g, 1.05, .1, .05, mWoodLt, 0, .45, s * .72);
  const cell = MM('somCombCells', '#e4ac3c', TEX.wicker);
  for (let k = 0; k < 4; k++) { const x = -.36 + k * .24, sh = new THREE.Shape(); sh.moveTo(-.1, 0); sh.lineTo(.1, 0); sh.lineTo(.12, .3); sh.quadraticCurveTo(0, .4, -.12, .3); sh.lineTo(-.1, 0); const comb = add(new THREE.ExtrudeGeometry(sh, { depth: .45, bevelEnabled: false }), cell, x, .48, -.22, g); comb.rotation.z = R(-.2, .2); }   // four slabs of comb, rounded tops, cells showing
  for (let i = 0; i < 8; i++) { const dr = add(new THREE.SphereGeometry(.03, 6, 5), mHoney, R(-.5, .5), .4, R(.36, .4), g); dr.scale.y = 2.4; }
  return .9; });

// ---- the Fisherman's Court (7:6–10) ----
def('som-salting-vat', 'Fish-salting vat', g => {
  lathe(g, [[0, 0], [.75, 0], [.82, .1], [.8, .75], [.86, .82], [.7, .82], [.68, .2], [0, .2]], mPlaster, 0, 0, 0, 20); cy(g, .68, .68, .04, 20, MM('somBrine2', '#7fa8a0', null, { roughness: .1, metalness: .1 }), 0, .62, 0);
  add(new THREE.TorusGeometry(.72, .05, 5, 24), mSalt, 0, .78, 0, g).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) { const z = -.4 + i * .16, f = add(new THREE.CapsuleGeometry(.07, .5, 4, 8), mFishM, R(-.05, .05), .66, z, g); f.rotation.set(0, 0, Math.PI / 2); add(new THREE.ConeGeometry(.08, .14, 4), mFishM, .4, .66, z, g).rotation.z = -Math.PI / 2; }   // fish laid side by side, heads one way
  for (let i = 0; i < 18; i++) add(new THREE.DodecahedronGeometry(.04, 0), mSalt, R(-.55, .55), .68, R(-.5, .5), g);
  const lid = new THREE.Group(); lid.position.set(.93, .48, 0); lid.rotation.set(0, 0, .3); g.add(lid); cy(lid, .55, .55, .06, 18, mWoodLt, 0, 0, 0, 0, 0, Math.PI / 2); for (const s of [-.22, .22]) bx(lid, .06, .08, 1.0, mWood, .04, -.04, s);   // the lid leaning against the vat
  return .9; });
def('som-mending-stone', 'Mending stone with a net spread over it', g => {
  boulder(g, .75, mRock, 0, -.2, 0, .55); slab(g, .7, .12, mRock, 0, .3, 0, 7);   // a flat-topped stone
  const geo = new THREE.PlaneGeometry(1.9, 1.6, 18, 16); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x / .75, z / .7); p.setY(i, d < 1 ? .45 : .45 - (d - 1) * .55); }
  add(geo, new THREE.MeshBasicMaterial({ color: '#5a4a32', wireframe: true }), 0, 0, 0, g);   // the net draped over it, sagging at the edges
  for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(.2 - k * .05, .04, 6, 16), mRope, .3, .5 + k * .04, .2, g).rotation.x = Math.PI / 2;   // a coil of cord on top
  const nd = bx(g, .08, .03, .45, mWoodLt, -.25, .5, -.1, .5); bx(g, .03, .04, .3, mCord, -.25, .52, -.1, .5);   // a big wooden net needle wound with twine
  return .7; });
def('som-court-entrance', 'Entrance of a basalt courtyard', g => {
  const bas = MM('somBasaltM2', '#7c766e'), basDk = MM('somBasaltM3', '#625c56');
  for (const s of [-1, 1]) { for (let row = 0; row < 6; row++) bx(g, .78, .3, .7, row % 2 ? bas : basDk, s * .9, row * .31, 0, R(-.03, .03));   // thick built posts
    for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) bx(g, R(.45, .6), .3, .45, rnd() > .5 ? bas : basDk, s * (1.55 + k * .5), row * .31, 0); bx(g, .55, .25, .5, basDk, s * 3.3, 1.2, 0); }   // coursed walls, capped at the ends
  bx(g, 2.6, .45, .8, basDk, 0, 1.86, 0); bx(g, 1.1, .03, .8, MM('somWorn', '#b8a070'), 0, .01, .3);   // a heavy lintel
  return 2.3; });

// ---- the Ridge Road (5:41–45) ----
def('som-culvert', 'Culvert stones over a gully', g => {
  const earth = MM('somEarthBank', '#a8905e'), road = MM('somTrack', '#b8a07a');
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.6, 0); sh.lineTo(1.6, .2); sh.lineTo(.2, .62); sh.lineTo(0, .62); const emb = add(new THREE.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: false }), earth, s * .5, 0, -.75, g); emb.scale.x = s;
    bx(g, 1.5, .02, 1.5, road, s * 1.25, .45, 0, 0, 0, -s * .28); }   // the road embankment ramping down each side
  bx(g, .9, .02, 4, MM('somGullyBed', '#7a6a48'), 0, -.02, 0); for (let i = 0; i < 8; i++) boulder(g, R(.08, .14), mRockDk, R(-.3, .3), 0, R(-1.8, 1.8), .6);   // the gully bed running out both sides
  for (const s of [-1, 1]) for (let row = 0; row < 2; row++) for (let k = 0; k < 3; k++) bx(g, .32, .29, .48, row ? mRock : mRockDk, s * .58, row * .3, (k - 1) * .5, R(-.05, .05));   // built abutments
  for (let k = -1; k <= 1; k++) bx(g, 1.5, .14, .48, MM('somSlabGrey', '#9a9286'), 0, .6, k * .5, R(-.04, .04));   // three grey stone slabs spanning the gully
  return .75; });
def('som-amphora-buried', 'Old amphora half-buried by the road', g => {
  const earth = MM('somEarthM', '#9a7e56');
  const am = new THREE.Group(); am.position.set(.1, -.25, 0); am.rotation.z = .75; g.add(am);
  lathe(am, [[0, 0], [.08, .02], [.22, .3], [.3, .7], [.28, 1.0], [.16, 1.2], [.1, 1.25], [.1, 1.5], [.14, 1.55], [.12, 1.58], [.08, 1.56]], mClay, 0, 0, 0, 16);
  add(new THREE.TorusGeometry(.12, .025, 6, 14), mClay, 0, 1.56, 0, am).rotation.x = Math.PI / 2; for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(.18, .045, 6, 12, Math.PI), MM('somClayDk2', '#a85e36', TEX.pot), s * .12, 1.3, 0, am); h.rotation.set(0, Math.PI / 2, s > 0 ? -.4 : .4); }
  for (let i = 0; i < 22; i++) { const a = R(0, 6.3), d = R(.1, .8); boulder(g, R(.12, .25), i % 3 ? earth : mRockDk, .35 + Math.cos(a) * d * .7, -.05, Math.sin(a) * d, .45); }   // earth heaped round and over its foot
  return .9; });
def('som-broken-cart', 'Cart with a broken wheel, propped on stones', g => {
  const tilt = .12; bx(g, 1.4, .1, 2.2, mWoodLt, 0, .62, 0, 0, 0, tilt); for (const s of [-1, 1]) bx(g, .08, .3, 2.2, mWood, s * .68, .7 + s * .08, 0, 0, 0, tilt);
  for (const s of [-1, 1]) bx(g, .08, .08, 1.7, mWood, s * .3, .55, 1.85, 0, .12);   // the shafts, fixed under the front of the bed
  cy(g, .06, .06, 1.7, 6, mWoodDk, 0, .5, 0, 0, 0, Math.PI / 2);
  const wheel = (gg, x, y, z, rx, ry, rz, n) => { const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.set(rx, ry, rz); gg.add(w); add(new THREE.TorusGeometry(.5, .06, 6, 20), mWood, 0, 0, 0, w); cy(w, .1, .1, .14, 10, mWoodDk, 0, 0, 0, Math.PI / 2);
    for (let k = 0; k < n; k++) { const sp = bx(w, .04, .46, .04, mWoodDk, 0, 0, 0, 0, 0, k / 8 * 6.28); sp.position.set(-Math.sin(k / 8 * 6.28) * .23, Math.cos(k / 8 * 6.28) * .23 - .23, 0); } return w; };
  wheel(g, .84, .55, 0, 0, Math.PI / 2, 0, 8);
  for (let k = 0; k < 4; k++) boulder(g, .24, mRockDk, -.75, k * .17, (k % 2) * .2 - .1, .8);   // stones piled under the bare axle end
  wheel(g, -1.65, .06, 1.0, -Math.PI / 2, 0, 0, 5);   // the fallen wheel, three spokes broken out
  return 1.2; });
def('som-resting-stone', 'Resting stone at the fork of the road', g => {
  const rk = MM('somRestRock', '#b0a690'); const sh = new THREE.Shape(); [[1.0, 0], [.6, .55], [-.3, .62], [-.95, .2], [-.85, -.4], [-.1, -.6], [.75, -.45]].forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: .45, bevelEnabled: true, bevelThickness: .1, bevelSize: .12, bevelSegments: 2 }); geo.rotateX(-Math.PI / 2); add(geo, rk, 0, 0, 0, g);   // a wide, low, rough flat-topped stone
  const worn = add(new THREE.CircleGeometry(1.7, 10), MM('somTrack', '#b8a07a'), 0, .01, 0, g); worn.rotation.x = -Math.PI / 2;   // the worn ground where travellers stop
  for (let i = 0; i < 4; i++) boulder(g, R(.1, .18), mRockDk, R(-1.3, 1.3), 0, R(-1.2, 1.2), .6);
  return .65; });


// ---- the Charcoal Burners' Clearing (5:26–30), rebuilt 2026-11-18 ----
def('som-charcoal-mound', 'Charcoal burner\'s mound, smoking', g => {
  const turf = MM('somTurfSq', '#55603a', TEX.stone), earth = MM('somEarthCov', '#6a5440', TEX.plaster), soot = MM('somSoot', '#1e1a16'), bark = MM('somBark2', '#7a6046', TEX.wood), cut = MM('somCutFace2', '#ecd29c');
  // the stack: billets stood on end in rings round a central chimney, a cone
  for (let ring = 0; ring < 4; ring++) { const r = .25 + ring * .38, n = 8 + ring * 6, hgt = 1.5 - ring * .3; for (let k = 0; k < n; k++) { const a = k / n * 6.283; const b = cy(g, .07, .08, hgt, 6, bark, Math.cos(a) * r, 0, Math.sin(a) * r); b.rotation.set(Math.sin(a) * .25, 0, -Math.cos(a) * .25); cy(g, .07, .07, .02, 6, cut, Math.cos(a) * (r - .1), hgt - .02, Math.sin(a) * (r - .1)); } }
  // the earth cover, laid over most of it but not yet over the near side, so the stacked wood shows
  const geo = new THREE.SphereGeometry(1.62, 22, 10, 2.41, 4.6, 0, 1.45); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setXYZ(i, x, y * .95, z); } geo.computeVertexNormals(); const cov = add(geo, earth, 0, 0, 0, g); cov.material.side = THREE.DoubleSide;
  for (let i = 0; i < 46; i++) { const a = R(2.5, 6.9), t = R(.15, 1.25), r = 1.63 * Math.sin(Math.PI / 2 - t), y = 1.55 * Math.sin(t); const tf = add(new THREE.BoxGeometry(R(.3, .42), .06, R(.22, .3)), turf, -Math.cos(a) * r, y, Math.sin(a) * r, g); tf.lookAt(0, -2, 0); tf.rotateX(Math.PI / 2); }   // square turves pressed onto the earth
  for (let k = 0; k < 6; k++) { const a = 2.7 + k * .75; add(new THREE.CircleGeometry(.08, 6), soot, -Math.cos(a) * 1.64, .25, Math.sin(a) * 1.64, g).lookAt(-Math.cos(a) * 9, .25, Math.sin(a) * 9); }
  cy(g, .17, .2, .1, 10, soot, 0, 1.5, 0);
  const smoke = new THREE.Group(); g.add(smoke); for (let k = 0; k < 6; k++) { const s = add(new THREE.SphereGeometry(.25 + k * .1, 8, 6), MM('somSmokeThin', '#e2ded6', null, { transparent: true, opacity: .2 - k * .02, depthWrite: false }), k * .32, 1.75 + k * .38, k * .08, smoke); s.scale.set(1.5, .7, 1.2); }
  const rk = new THREE.Group(); rk.position.set(1.85, 0, -.6); rk.rotation.set(0, .3, .45); g.add(rk); cy(rk, .03, .03, 2.0, 5, mWoodLt, 0, 0, 0); bx(rk, .5, .06, .08, mWoodDk, 0, 2.0, 0); for (let k = 0; k < 5; k++) cy(rk, .015, .015, .16, 4, mWoodDk, -.2 + k * .1, 2.0, 0);
  return 1.6; });
def('som-cut-stumps', 'Row of freshly cut stumps', g => {
  const cut = MM('somCutFace2', '#ecd29c'), bark = MM('somBark2', '#7a6046', TEX.wood);
  for (const [x, z, r, h, tilt] of [[-1.4, .2, .3, .45, .2], [0, -.25, .38, .35, -.18], [1.45, .25, .28, .55, .25]]) { lathe(g, [[0, 0], [r * 1.7, 0], [r * 1.3, .07], [r * 1.05, .18], [r, h], [0, h]], bark, x, -.02, z, 12);   // stumps flaring into the ground
    cy(g, r * .97, r * .97, .03, 12, cut, x, h - .01, z, tilt); for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(r * (.25 + k * .24), .006, 3, 14), MM('somRing', '#c09a62'), x, h + .02, z, g).rotation.x = Math.PI / 2 + tilt; }
  for (let i = 0; i < 60; i++) bx(g, R(.05, .14), .015, R(.03, .08), cut, R(-2, 2), .01, R(-.9, .9), R(0, 3));   // fresh pale chips all round
  return .6; });
def('som-axe-stump', 'Chopping stump with an axe in it', g => {
  const cut = MM('somCutFace2', '#ecd29c'), bark = MM('somBark2', '#7a6046', TEX.wood);
  lathe(g, [[0, 0], [.75, 0], [.6, .1], [.5, .25], [.48, .62], [0, .62]], bark, 0, -.02, 0, 14); cy(g, .47, .47, .02, 14, cut, 0, .6, 0); for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(.12 + k * .11, .006, 3, 16), MM('somRing', '#c09a62'), 0, .625, 0, g).rotation.x = Math.PI / 2;
  bx(g, .32, .16, .05, mIron, -.02, .56, 0, 0, 0, -.25);   // the iron axe head sunk in the top
  cy(g, .032, .038, .8, 7, MM('somHaft', '#c8a46a', TEX.wood), .3, .88, 0, 0, 0, -.85);   // its pale wooden haft slanting up and out
  for (let i = 0; i < 7; i++) { const bil = new THREE.Group(); bil.position.set(1.0 + (i % 4) * .2 - .3, .09 + (i > 3 ? .16 : 0), -.1 + (i % 2) * .05); bil.rotation.set(0, .1, Math.PI / 2); g.add(bil); add(new THREE.CylinderGeometry(.1, .1, .65, 8, 1, false, 0, Math.PI), bark, 0, 0, 0, bil); const f = bx(bil, .2, .65, .006, cut, 0, -.325, 0); }   // split billets in a neat pile, pale split faces up
  for (let i = 0; i < 25; i++) bx(g, R(.05, .12), .015, R(.03, .07), cut, R(-.9, .9), .01, R(-.8, .8), R(0, 3));
  return 1.0; });
def('som-charcoal-baskets', 'Rush baskets heaped with charcoal', g => {
  const rush = MM('somRushW', '#c2ad72', TEX.wicker), coal = MM('somCoalG2', '#45413c', null, { roughness: .55 });
  for (const [x, z, s] of [[-.45, 0, 1], [.45, .1, .85]]) { const bk = lathe(g, [[0, 0], [.3 * s, 0], [.4 * s, .14 * s], [.44 * s, .34 * s], [.46 * s, .4 * s], [.42 * s, .4 * s], [.39 * s, .2 * s], [0, .18 * s]], rush, x, 0, z, 18); bk.material.side = THREE.DoubleSide;
    add(new THREE.TorusGeometry(.44 * s, .035, 5, 22), MM('somRushRim', '#a8925a', TEX.wicker), x, .4 * s, z, g).rotation.x = Math.PI / 2;   // a thick rolled rim
    for (let i = 0; i < 34; i++) { const a = R(0, 6.3), d = Math.sqrt(R(0, 1)) * .36 * s; add(new THREE.DodecahedronGeometry(R(.05, .085), 0), coal, x + Math.cos(a) * d, .38 * s + (1 - d / (.36 * s)) * .2, z + Math.sin(a) * d, g).rotation.set(R(0, 3), R(0, 3), 0); } }   // a mounded heap of dark grey chunks
  return .7; });
def('som-ash-ring', 'Old burn floor of an earlier mound', g => {
  const floor = MM('somBurnFloor', '#4a4540'), floor2 = MM('somBurnFloor2', '#5c544a', null, { transparent: true, opacity: .7 }), coal = MM('somCoalG2', '#2e2b28'), ash = MM('somAshL', '#9c9890');
  const blot = (r, m, y, n = 14) => { const sh = new THREE.Shape(); for (let i = 0; i < n; i++) { const a = i / n * 6.283, rr = r * R(.6, 1.15); i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } const o = add(new THREE.ShapeGeometry(sh), m, 0, y, 0, g); o.rotation.x = -Math.PI / 2; return o; };
  blot(1.5, floor, .05, 18);   // a ragged-edged patch of blackened earth
  for (let i = 0; i < 9; i++) { const o = blot(R(.3, .7), i % 2 ? floor : floor2, .045 + i * .001, 9); o.position.x = R(-1.6, 1.6); o.position.z = R(-1.6, 1.6); }   // smudges spilling past the edge
  for (let i = 0; i < 7; i++) { const o = blot(R(.15, .35), ash, .056, 8); o.position.x = R(-.9, .9); o.position.z = R(-.9, .9); }   // drifts of ash
  for (let i = 0; i < 40; i++) { const a = R(0, 6.3), d = Math.sqrt(R(0, 1)) * 1.6; const c = add(new THREE.DodecahedronGeometry(R(.03, .07), 0), coal, Math.cos(a) * d, .06, Math.sin(a) * d, g); c.scale.y = .5; }
  return .1; });

// ---- the Bee Bank (5:31–35), rebuilt 2026-11-18: one walled bank, the hive pipes set into its far end ----
def('som-bee-wall', 'Freestanding stack of clay hive pipes on a stone base', g => {
  const pipe = MM('somPipeLong', '#c9a27a', TEX.pot), plug = MM('somPipePlug2', '#d9c7a2', TEX.plaster), cap = MM('somCapSlab', '#b8ae9a', TEX.stone);
  for (let i = 0; i < 9; i++) boulder(g, R(.22, .3), i % 2 ? mRock : mRockDk, -.75 + (i % 5) * .38 + R(-.05, .05), -.05, -.25 + Math.floor(i / 5) * .45, .55);   // a low base of field stones
  const rows = [4, 3, 2]; rows.forEach((n, row) => { for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * .4, y = .45 + row * .34; cy(g, .17, .17, 1.1, 14, pipe, x, y, 0, Math.PI / 2); cy(g, .15, .15, .02, 12, plug, x, y, .56, Math.PI / 2); add(new THREE.CircleGeometry(.035, 8), mDark, x, y - .06, .575, g); } });   // long clay pipes stacked 4-3-2, mud-sealed ends with a small entrance
  slab(g, .95, .1, cap, 0, 1.35, 0, 7);   // a flat stone laid on top to shade them
  for (let i = 0; i < 16; i++) { const b = add(new THREE.SphereGeometry(.02, 5, 4), MM('somBee', '#3a2a10'), R(-.7, .7), R(.35, 1.2), R(.62, .9), g); b.scale.x = 1.7; }
  return 1.45; });


def('som-bank-end', 'Low end of a field bank, capped with a flat stone', g => {
  for (let i = 0; i < 14; i++) boulder(g, R(.22, .32), i % 3 ? mRock : mRockDk, R(-.6, .6), i < 9 ? 0 : .22, R(-.4, .4), .75);   // a rough heap of field stones
  slab(g, .7, .14, MM('somCapStone2', '#cdc3ae', TEX.stone), 0, .5, 0, 7); thornBush(g, .7, 0, -.5, .6);
  return .9; });
def('som-scarecrow', 'Scarecrow in an old robe', g => {
  const robe = MM('somRagRobe', '#8a6a4a', TEX.cloth), sash = MM('somRagSash', '#a8523a', TEX.cloth);
  cy(g, .045, .05, 2.3, 6, mWood, 0, 0, 0); cy(g, .035, .035, 1.5, 6, mWood, 0, 1.65, 0, 0, 0, Math.PI / 2);   // pole and cross-stick
  const rb = lathe(g, [[0, 0], [.42, 0], [.36, .2], [.28, .6], [.22, .95], [.14, 1.05], [0, 1.08]], robe, 0, .75, 0, 12); rb.material.side = THREE.DoubleSide;   // a long robe hanging from the shoulders
  for (const s of [-1, 1]) { const sl = cy(g, .1, .14, .62, 8, robe, s * .45, 1.62, 0, 0, 0, Math.PI / 2); for (let k = 0; k < 4; k++) cy(g, .012, .012, R(.15, .25), 3, MM('somStrawM2', '#e2c464'), s * .78, 1.62 + R(-.06, .06), R(-.06, .06), 0, 0, Math.PI / 2 + R(-.4, .4)); }   // sleeves, straw poking from the cuffs
  add(new THREE.TorusGeometry(.2, .035, 5, 14), sash, 0, 1.35, 0, g).rotation.x = Math.PI / 2;   // a rag sash
  const hd = add(new THREE.SphereGeometry(.17, 10, 8), MM('somBurlap', '#c8b07a', TEX.cloth), 0, 2.0, 0, g); hd.scale.y = 1.15;   // a sacking head
  lathe(g, [[0, 0], [.32, 0], [.3, .03], [.14, .06], [.12, .2], [0, .22]], MM('somStrawHat', '#d8b860', TEX.wicker), 0, 2.13, 0, 12);   // a straw hat
  return 2.4; });

}
