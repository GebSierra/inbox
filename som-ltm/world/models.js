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
def('som-goatskin-bag', 'Goatskin water bag on a forked stake', g => {
  cy(g, .05, .07, 1.75, 7, mWoodDk, 0, 0, 0); cy(g, .03, .045, .5, 6, mWoodDk, -.12, 1.6, 0, 0, 0, .6); cy(g, .03, .045, .5, 6, mWoodDk, .12, 1.6, 0, 0, 0, -.6);   // the forked stake
  const hair = MM('somGoatHair', '#8a6440', TEX.cloth);
  const body = add(new THREE.CapsuleGeometry(.24, .62, 6, 12), hair, 0, 1.05, .32, g); body.rotation.z = Math.PI / 2; body.scale.set(1, 1.05, .85);   // the whole skin, swollen with water, hanging sideways
  const belly = add(new THREE.SphereGeometry(.26, 12, 8), hair, .05, .93, .32, g); belly.scale.set(1.5, .7, .85);   // sagging belly
  for (const [x, up] of [[-.45, 1], [-.3, 1], [.3, 1], [.45, 1]]) { const lg = cy(g, .05, .07, .26, 7, mLeatherDk, x, 1.18, .32, 0, 0, x < 0 ? .5 : -.5); cy(g, .055, .055, .04, 7, mCord, x * 1.1, 1.35, .32, 0, 0, x < 0 ? .5 : -.5); }   // four leg stumps, each tied off
  const nk = cy(g, .07, .1, .26, 8, mLeatherDk, -.62, 1.02, .32, 0, 0, 1.2); cy(g, .075, .075, .05, 8, mCord, -.74, 1.07, .32, 0, 0, 1.2);   // the neck, the spout, tied with cord
  for (const sx of [-.4, .4]) { const c2 = cy(g, .012, .012, .55, 4, mCord, sx * .55, 1.5, .2, .5, 0, sx < 0 ? -.45 : .45); }   // cords from the legs up to the fork
  return 1.9; });
def('som-limestone-pavement', 'Bare limestone pavement', g => {
  const P = [[0, 0, 1.0], [1.35, -.3, .75], [-1.25, .2, .8], [.4, 1.1, .7], [-.5, -1.0, .65], [1.1, .9, .5], [-1.4, -.9, .45], [.2, -1.6, .5]];
  P.forEach(([x, z, r], i) => slab(g, r * .92, R(.08, .14), i % 3 ? mLime : mLimeDk, x, R(-.02, .03), z, 6, R(0, 3)));
  bx(g, 4.2, .02, 4, MM('somCrack', '#5a5040'), 0, -.01, 0);   // the dark soil showing in the cracks between the slabs
  for (let i = 0; i < 14; i++) { const t = add(new THREE.ConeGeometry(.03, R(.12, .25), 3), mGrass, R(-1.6, 1.6), .05, R(-1.6, 1.4), g); }   // grass in the cracks
  return .2; });
def('som-seat-rock', 'Flat seat-rock', g => {
  boulder(g, 1.2, mRock, 0, -.15, 0, .55); slab(g, .95, .1, mLime, 0, .52, 0, 7, .4); boulder(g, .4, mRockDk, -1.1, 0, .5, .6); boulder(g, .3, mRockDk, .9, 0, .8, .6);
  return .65; });
def('som-split-boulder', 'Split boulder with a thornbush in the crack', g => {
  const a = boulder(g, .85, mRock, -.55, 0, 0, .85); a.scale.x = .8; const b = boulder(g, .8, mRockDk, .55, 0, .05, .85); b.scale.x = .8;
  bx(g, .18, .3, 1.2, mDark, 0, 0, 0); thornBush(g, 0, .3, .1, 1.5);
  return 1.25; });

// ---- the Sheepfold (5:6–10) ----
function dryWall(g, x0, z0, x1, z1, hh, th = .5) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / .42)); for (let row = 0; row < Math.round(hh / .26); row++) for (let k = 0; k <= n; k++) { const t = Math.min(1, (k + (row % 2) * .5) / n);
  const st = add(new THREE.BoxGeometry(R(.38, .5), R(.2, .28), th * R(.85, 1.05)), rnd() > .45 ? mRock : mRockDk, x0 + (x1 - x0) * t, .13 + row * .25, z0 + (z1 - z0) * t, g); st.rotation.y = -Math.atan2(z1 - z0, x1 - x0) + R(-.1, .1); st.rotation.z = R(-.06, .06); } }
def('som-slab-corner', 'Corner of the fold roofed with flat slabs', g => {
  dryWall(g, -1.2, -1.2, 1.2, -1.2, 1.3); dryWall(g, -1.2, -1.2, -1.2, 1.0, 1.3);   // two walls meeting at the back-left
  for (let k = 0; k < 3; k++) slab(g, .8, .14, mRockDk, -.5 + k * .55, 1.32, -.5 + k * .1, 5, R(0, 3));   // thick flat slabs laid across
  bx(g, 1.8, .02, 1.8, mDark, -.3, .01, -.3);   // the shade beneath
  return 1.6; });
def('som-crook', 'Shepherd\'s crook hung on the wall', g => {
  dryWall(g, -.8, 0, .8, 0, .9, .45); cy(g, .03, .03, .25, 5, mWoodDk, .25, .78, .2, Math.PI / 2);   // a stretch of wall with a peg
  const st = cy(g, .03, .035, 1.9, 7, mWoodLt, .2, -.05, .26, -.04, 0, .1); const hk = add(new THREE.TorusGeometry(.14, .03, 6, 12, Math.PI * 1.25), mWoodLt, .38, 1.9, .26, g); hk.rotation.z = -.3;
  return 2.1; });
def('som-fold-gateway', 'Gateway of the fold', g => {
  dryWall(g, -2, 0, -.75, 0, 1.0); dryWall(g, .75, 0, 2, 0, 1.0);
  for (const s of [-1, 1]) { boulder(g, .42, mRockDk, s * .72, 0, 0, 2.2); } slab(g, .95, .16, mRock, 0, 1.25, 0, 5, 1.57);   // two upright stones, a lintel slab across
  bx(g, 1.2, .02, .8, MM('somWorn', '#b8a070'), 0, .01, .3);   // worn earth through the gap
  return 1.45; });

// ---- the House on the Sand (7:26–29) ----
def('som-date-palm', 'Date palm leaning over the house', g => {
  const n = 9; let x = 0, y = 0, lean = .08; for (let i = 0; i < n; i++) { const h = .55, seg = cy(g, .16 - i * .006, .19 - i * .006, h, 8, mPalmTrunk, x, y, 0, 0, 0, -lean * (i + 1) * .5); x += Math.sin(lean * (i + 1) * .5) * h; y += Math.cos(lean * (i + 1) * .5) * h; add(new THREE.TorusGeometry(.17 - i * .006, .03, 4, 8), mWoodDk, x, y - .02, 0, g).rotation.x = Math.PI / 2; }
  for (let k = 0; k < 11; k++) { const a = k / 11 * 6.28, fr = new THREE.Group(); fr.position.set(x, y + .1, 0); fr.rotation.set(0, a, 0); g.add(fr);
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.quadraticCurveTo(.9, .35, 2, -.5); shape.quadraticCurveTo(.9, .1, 0, -.08); const leaf = add(new THREE.ShapeGeometry(shape), mFrond, 0, 0, 0, fr); leaf.rotation.set(Math.PI / 2 - R(.2, .5), 0, 0); }
  for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(.12, 6, 5), mDates, x + R(-.2, .2), y - .15, R(-.2, .2), g).scale.y = 1.6;
  return y + .4; });
def('som-mudbrick-wall', 'Low mud-brick wall of the yard', g => {
  for (let row = 0; row < 4; row++) for (let k = 0; k < 7; k++) bx(g, .44, .18, .3, rnd() > .5 ? mBrick : mMud, -1.4 + k * .46 + (row % 2) * .23, row * .2, 0, R(-.03, .03));
  bx(g, 3.4, .06, .34, mMud, 0, .8, 0);   // a plastered top course
  return .9; });

// ---- the Ox Stall (6:21–25) ----
def('som-yoke-on-peg', 'Yoke for two oxen, hung on its peg', g => {
  bx(g, 2.6, 1.8, .3, mRock, 0, 0, -.2); cy(g, .05, .05, .35, 6, mWoodDk, 0, 1.55, 0, Math.PI / 2);   // a stretch of the stall wall with a peg
  const beam = bx(g, 2.1, .16, .18, mWoodLt, 0, 1.38, .12); for (const s of [-.6, .6]) { const bow = add(new THREE.TorusGeometry(.22, .045, 6, 12, Math.PI), mWood, s, 1.36, .12, g); bow.rotation.z = Math.PI; cy(g, .03, .03, .12, 5, mWoodDk, s - .22, 1.42, .12); cy(g, .03, .03, .12, 5, mWoodDk, s + .22, 1.42, .12); }
  add(new THREE.TorusGeometry(.07, .02, 4, 8), mIron, 0, 1.3, .2, g);   // the ring for the pole
  return 1.8; });
def('som-plough', 'Wooden plough with an iron share', g => {
  const beam = bx(g, .12, .12, 2.4, mWoodLt, 0, .62, -.1, 0, -.32); const sole = bx(g, .16, .12, .9, mWood, 0, .08, .75); const share = bx(g, .1, .08, .4, mIron, 0, .06, 1.3, 0, -.1);
  const stilt = bx(g, .09, 1.0, .09, mWood, 0, .1, .3, 0, -.35); bx(g, .45, .07, .07, mWood, 0, 1.0, .0, 0, -.35);   // the upright and its handle
  return 1.1; });
def('som-feeding-niche', 'Roof pillar with a feeding niche of hay', g => {
  bx(g, .8, 2.7, .8, mRock, 0, 0, 0); bx(g, .62, .55, .2, mDark, 0, .75, .32); for (let i = 0; i < 10; i++) { const s = bx(g, .5, .02, .03, mStraw, R(-.2, .2), .8 + R(0, .3), .36, R(0, 3), 0, R(-.4, .4)); }
  bx(g, .68, .08, .3, mWoodLt, 0, .7, .38);   // the niche's wooden lip
  return 2.75; });

// ---- the Bee Bank (5:31–35) ----
def('som-hive-pipes', 'Stack of clay hive pipes', g => {
  for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) { const x = (k - (3 - row) / 2) * .46, y = .24 + row * .42; cy(g, .22, .22, 1.1, 12, row % 2 ? mClay : mClayDk, x, y, 0, Math.PI / 2);
    cy(g, .2, .2, .03, 12, mMud, x, y, .56, Math.PI / 2); add(new THREE.CircleGeometry(.04, 6), mDark, x, y - .08, .58, g); }   // mud-sealed ends with a small entrance hole
  bx(g, 2.1, .1, 1.2, mRock, 0, -.05, 0);
  for (let i = 0; i < 10; i++) add(new THREE.SphereGeometry(.03, 5, 4), mDark, R(-.9, .9), R(.2, 1.5), R(.6, 1.0), g);   // bees
  return 1.5; });
def('som-smoker-pot', 'Beekeeper\'s smoker pot', g => {
  boulder(g, .35, mRock, 0, 0, 0, .7); lathe(g, [[0, 0], [.2, .02], [.28, .2], [.26, .42], [.12, .52], [.1, .6]], mClay, 0, .42, 0); cy(g, .05, .07, .32, 8, mClay, .25, .85, 0, 0, 0, -.9);
  for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(.08 + k * .05, 8, 6), mSmoke, .38 + k * .12, 1.0 + k * .25, R(-.05, .05), g);
  return 1.05; });
def('som-comb-tray', 'Tray of golden honeycomb', g => {
  bx(g, 1.2, .55, .9, mRock, 0, 0, 0); bx(g, 1.05, .06, .75, mWoodLt, 0, .55, 0); for (const s of [-.5, .5]) bx(g, 1.05, .1, .05, mWoodLt, 0, .58, s * .72);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = -.4 + c * .16 + (r % 2) * .08, z = -.24 + r * .15; cy(g, .08, .08, .12, 6, mComb, x, .62, z); add(new THREE.CircleGeometry(.055, 6), mHoney, x, .685, z, g).rotation.x = -Math.PI / 2; }
  for (let i = 0; i < 8; i++) add(new THREE.SphereGeometry(.03, 5, 4), mDark, R(-.5, .5), R(.75, 1.2), R(-.4, .4), g);
  return .8; });

// ---- the Fisherman's Court (7:6–10) ----
def('som-salting-vat', 'Fish-salting vat', g => {
  lathe(g, [[0, 0], [.75, 0], [.82, .1], [.8, .75], [.86, .82], [.7, .82], [.68, .2], [0, .2]], mPlaster, 0, 0, 0, 20); cy(g, .68, .68, .04, 20, mBrine, 0, .62, 0);
  for (let i = 0; i < 9; i++) { const f = add(new THREE.CapsuleGeometry(.05, .26, 3, 6), mFishM, R(-.4, .4), .66, R(-.4, .4), g); f.rotation.set(Math.PI / 2, 0, R(0, 3)); }
  for (let i = 0; i < 14; i++) add(new THREE.DodecahedronGeometry(.045, 0), mSalt, R(-.5, .5), .66, R(-.5, .5), g);
  const lid = cy(g, .5, .5, .05, 14, mWoodLt, 1.0, .35, .3, 1.2, 0, 0);   // its wooden lid leaning against it
  return .9; });
def('som-mending-stone', 'Mending stone with a coil of rope and a net needle', g => {
  boulder(g, .65, mRock, 0, 0, 0, .6); slab(g, .5, .06, mLime, 0, .42, 0, 6);
  for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(.3 - k * .06, .045, 6, 16), mRope, .1, .52 + k * .05, 0, g).rotation.x = Math.PI / 2;
  bx(g, .03, .02, .28, mWoodLt, -.3, .52, .2, .5);
  return .75; });
def('som-court-entrance', 'Entrance of a basalt courtyard', g => {
  const bas = MM('somBasaltM', '#6e6862', TEX.stone); for (const s of [-1, 1]) { for (let row = 0; row < 5; row++) bx(g, .5, .32, .5, bas, s * .85, row * .33, 0, R(-.05, .05)); dryWall(g, s * 1.1, 0, s * 2.4, 0, .9); }
  bx(g, 2.2, .3, .55, bas, 0, 1.65, 0); bx(g, 1.2, .03, .7, MM('somWorn', '#b8a070'), 0, .01, .3);
  return 1.95; });

// ---- the Ridge Road (5:41–45) ----
def('som-culvert', 'Culvert stones over a gully', g => {
  const dip = bx(g, 2.6, .02, 1.1, MM('somGullyM', '#8a7a52'), 0, -.02, 0, Math.PI / 2);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) boulder(g, .32, mRockDk, s * .55, k * .25, (k - 1) * .4, .9);
  slab(g, .75, .16, mRock, 0, .72, 0, 5, .3); slab(g, .6, .14, mRock, 0, .72, .7, 5, 1.2); slab(g, .6, .14, mRock, 0, .72, -.7, 5, 2);
  return .95; });
def('som-amphora-buried', 'Old amphora half-buried by the road', g => {
  const am = lathe(g, [[0, 0], [.08, .02], [.22, .3], [.3, .7], [.28, 1.0], [.16, 1.2], [.1, 1.25], [.1, 1.5], [.14, 1.55]], mClay, 0, -.15, 0); am.rotation.z = .7;
  for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(.13, .035, 5, 10, Math.PI), mClay, -.8, .82, s * .1, g); h.rotation.set(0, Math.PI / 2, .7); }
  for (let i = 0; i < 12; i++) boulder(g, R(.1, .2), MM('somEarthM', '#9a7e56'), R(-.1, .5), 0, R(-.4, .4), .5);
  return .9; });
def('som-broken-cart', 'Cart with a broken wheel, propped on stones', g => {
  bx(g, 1.4, .1, 2.2, mWoodLt, 0, .62, 0, 0, 0, .12); for (const s of [-1, 1]) bx(g, .08, .3, 2.2, mWood, s * .68, .7, 0, 0, 0, .12);   // bed and side rails
  for (const s of [-1, 1]) bx(g, .07, .07, 1.6, mWood, s * .3, .6, 1.8, 0, .25);   // the shafts
  const w = cy(g, .55, .55, .1, 14, mWood, .82, .55, 0, 0, 0, Math.PI / 2); for (let k = 0; k < 6; k++) bx(g, .04, 1.0, .04, mWoodDk, .84, .55, 0, k / 6 * Math.PI);   // the good wheel
  boulder(g, .35, mRockDk, -.75, 0, .1, .9);   // propped on stones where the other wheel was
  const bw = cy(g, .55, .55, .1, 14, mWood, -1.6, .06, .9, 0, 0, 0); for (let k = 0; k < 3; k++) bx(g, .04, .9, .04, mWoodDk, -1.6, .1, .9, 0, Math.PI / 2, k * .8);   // the broken wheel, lying in the grass, spokes missing
  return 1.2; });
def('som-resting-stone', 'Resting stone at the fork of the road', g => {
  boulder(g, .7, mRock, 0, 0, 0, .55); slab(g, .6, .08, mLime, 0, .4, 0, 7);
  bx(g, 1.1, .02, 3, MM('somTrack', '#b8a07a'), -.9, .005, -1.6, .45); bx(g, 1.1, .02, 3, MM('somTrack', '#b8a07a'), .9, .005, -1.6, -.45);   // the two tracks forking around it
  return .5; });
