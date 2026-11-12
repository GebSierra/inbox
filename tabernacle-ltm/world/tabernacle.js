// ---------- THE TABERNACLE (Exodus 25–27, 30, 35–40) ----------
// Built to the cubit (CUBIT = 0.4572 m, from terrain.js). The door faces east (+z); you walk in heading west (-z).
// North is +x (on your right as you walk in), south is -x.
//   courtyard 100 × 50 cubits, hangings 5 cubits high (Ex 27:9–18)
//   tent 30 × 10 × 10 cubits: holy place 20 cubits, most holy place a 10-cubit cube (Ex 26)
//   the most holy place sits in the middle of the western half of the court, the altar in the middle of the eastern half.
const C = CUBIT;
const COURT = { x: 25 * C, zE: 0, zW: -100 * C };                 // half-width 11.43, east 0, west -45.72
const TENT = { w: 5 * C, H: 10 * C, zF: -50 * C, zV: -70 * C, zB: -80 * C, th: .18 };   // front -22.86, veil -32.0, back -36.58
const ALTAR = { z: -25 * C, s: 5 * C, h: 3 * C };                 // 5 × 5 × 3 cubits, centre of the eastern square
const LAVER_Z = -18.5;
const ARK_Z = (TENT.zV + TENT.zB) / 2;                             // centre of the most holy place
const GZ = COURT.zE;                                               // engine: the gate (player starts 16 m outside it, facing in)
const TZ = ALTAR.z - 7;                                            // engine: unused smoke/bird hooks centre on the altar
const RAISED = [];
const WALKWAYS = [];
const ROOF = [];                                                   // the tent's coverings: hidden in bird's-eye view to show the cutaway

// ---- materials ----
const goldM = mat('tGold', '#d8a63c', { metalness: .35, roughness: .38, emissive: '#3a2406', emissiveIntensity: .35 });
const bronzeM = mat('tBronze', '#9a6436', { metalness: .3, roughness: .5 });
const silverM = mat('tSilver', '#d9dcde', { metalness: .3, roughness: .35 });
const acaciaM = mat('tAcacia', '#a0703e', { map: TEX.wood });
const linenM = mat('tLinen', '#f4efe2', { map: TEX.cloth });
const goatM = mat('tGoat', '#2b2522', { map: TEX.cloth });
const ramM = mat('tRam', '#8e2a1e', { roughness: .8 });
const tachashM = mat('tTachash', '#4a4440', { roughness: .95 });
const cordM = mat('tCord', '#cdbb92');
const breadM = mat('tBread', '#d6a565', { flatShading: false });
const waterM = mat('tWater', '#7fb2c2', { metalness: .2, roughness: .15 });

// woven textures: the gate and door screens (blue, purple, scarlet and fine linen, embroidered: Ex 26:36, 27:16),
// the veil and the inner curtains (with cherubim, skilfully worked: Ex 26:1, 26:31)
const BLUE = '#2f4f95', PURPLE = '#6a2f6c', SCARLET = '#b22a2a', LINEN = '#f2ece0';
const noRepT = t => { t.userData = {}; return t; };
function screenTex() { return noRepT(canvasTex(256, (x, w) => {
  x.fillStyle = LINEN; x.fillRect(0, 0, w, w);
  const cols = [BLUE, PURPLE, SCARLET, LINEN]; for (let i = 0; i < 16; i++) { x.fillStyle = cols[i % 4]; x.fillRect(i * w / 16, 0, w / 16 + 1, w); }
  for (const y of [18, w - 30]) { x.fillStyle = '#e8c26a'; x.fillRect(0, y, w, 10); for (let i = 0; i < 16; i++) { x.fillStyle = cols[(i + 1) % 3]; x.beginPath(); x.moveTo(i * 16, y); x.lineTo(i * 16 + 8, y + 10); x.lineTo(i * 16 + 16, y); x.fill(); } }
  for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${R(.02, .07)})`; x.fillRect(0, i, w, 1); } })); }
function cherub(x, cx, cy, s, body, wing) {          // a stylised woven cherub: kneeling figure, wings raised
  x.fillStyle = wing; for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(cx, cy - s * .2); x.quadraticCurveTo(cx + sd * s * .9, cy - s * 1.1, cx + sd * s * .25, cy - s * 1.25); x.quadraticCurveTo(cx + sd * s * .35, cy - s * .6, cx, cy); x.fill(); }
  x.fillStyle = body; x.beginPath(); x.ellipse(cx, cy + s * .15, s * .2, s * .38, 0, 0, 7); x.fill();
  x.beginPath(); x.arc(cx, cy - s * .35, s * .13, 0, 7); x.fill(); }
function veilTex(base, n) { return noRepT(canvasTex(512, (x, w) => {
  x.fillStyle = base; x.fillRect(0, 0, w, w);
  for (let i = 0; i < 64; i++) { x.fillStyle = [BLUE, PURPLE, SCARLET][i % 3]; x.globalAlpha = .25; x.fillRect(i * 8, 0, 4, w); } x.globalAlpha = 1;
  const step = w / n; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cherub(x, (c + .5) * step, (r + .62) * step, step * .42, (r + c) % 2 ? SCARLET : '#e2b85a', (r + c) % 2 ? '#e2b85a' : PURPLE);
  for (const y of [6, w - 18]) { x.fillStyle = '#e2b85a'; x.fillRect(0, y, w, 12); }
  for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${R(.02, .06)})`; x.fillRect(0, i, w, 1); } })); }
const screenM = new THREE.MeshStandardMaterial({ map: screenTex(), roughness: .9 });
const veilM = new THREE.MeshStandardMaterial({ map: veilTex(BLUE, 3), roughness: .9 });
const ceilM = new THREE.MeshStandardMaterial({ map: veilTex(LINEN, 4), roughness: .95, side: THREE.FrontSide });

// a sheep of the region (fat-tailed, cream wool, a dark face and drooping ears, like the Awassi of today), head toward +x.
// Wool is a cluster of overlapping puffs; some graze with their heads down; a few have brown or black fleeces.
const WOOL = ['#efe8da', '#e8dfcc', '#f3eee4', '#8a6a4a', '#3a302a'].map((c, i) => mat('tWool' + i, c, { flatShading: true, roughness: 1 }));
const FACE = [mat('tFace0', '#3a2c24', { roughness: .9 }), mat('tFace1', '#6a4a34', { roughness: .9 })], HOOF = mat('tHoof', '#2a221e');
function woolSheep(x, z, ry = R(0, 6.3), s = R(.85, 1.05)) {
  const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g);
  const k = rnd(), wm = WOOL[k < .08 ? 4 : k < .18 ? 3 : (rnd() * 3) | 0], fm = FACE[rnd() < .3 ? 1 : 0];
  const puffs = [[0, .74, 0, .34], [.24, .78, 0, .3], [-.24, .76, 0, .3], [.1, .7, .14, .27], [.1, .7, -.14, .27], [-.12, .7, .15, .27], [-.12, .7, -.15, .27], [0, .9, 0, .25], [.34, .74, 0, .23], [-.38, .7, 0, .24]];
  for (const [px, py, pz, r] of puffs) add(new THREE.IcosahedronGeometry(r * R(.92, 1.08), 1), wm, px, py + R(-.02, .02), pz, g);
  add(new THREE.IcosahedronGeometry(.17, 1), wm, -.52, .6, 0, g).scale.set(.9, 1.15, 1.1);                 // the fat tail
  for (const [lx, lz] of [[.26, .11], [.26, -.11], [-.26, .11], [-.26, -.11]]) { cyl(.035, .042, .44, 6, fm, lx, .04, lz, g); cyl(.047, .047, .05, 6, HOOF, lx, 0, lz, g); }
  const head = new THREE.Group(), graze = rnd() < .4; head.position.set(.46, .86, 0); head.rotation.z = graze ? -1.05 : R(-.25, .1); head.rotation.y = R(-.35, .35); g.add(head);
  add(new THREE.CylinderGeometry(.09, .12, .22, 7), wm, .04, -.02, 0, head).rotation.z = -1.2;                // neck wool
  const skull = add(new THREE.IcosahedronGeometry(.13, 1), fm, .17, .0, 0, head); skull.scale.set(1.25, 1, .85);
  const muzzle = add(new THREE.IcosahedronGeometry(.085, 1), fm, .3, -.06, 0, head); muzzle.scale.set(1.2, .85, .8);
  add(new THREE.IcosahedronGeometry(.085, 1), wm, .12, .1, 0, head).scale.set(1, .6, 1.1);                  // a tuft of wool on the crown
  for (const sd of [-1, 1]) { const ear = add(new THREE.IcosahedronGeometry(.07, 0), fm, .13, -.02, sd * .13, head); ear.scale.set(.6, .35, 1.6); ear.rotation.x = sd * .7;   // long, drooping
    add(new THREE.SphereGeometry(.015, 5, 4), mat('tEye', '#120d0a'), .24, .04, sd * .075, head); }
  return g; }
// a straight rod (cord, pole) between two points
function rod(a, b, r, m, parent = scene, sides = 5) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const mesh = add(new THREE.CylinderGeometry(r, r, L, sides), m, 0, 0, 0, parent); mesh.position.copy(A).add(B).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return mesh; }
// a hanging between two posts, along x or along z
function hanging(x0, z0, x1, z1, y0, y1, m, t = .03) {
  const L = Math.hypot(x1 - x0, z1 - z0); const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  return box(alongX ? L : t, y1 - y0, alongX ? t : L, m, (x0 + x1) / 2, y0, (z0 + z1) / 2); }
// curtain gathered and tied back against a post
function gathered(x, z, h, m, r = .14) { const g = add(new THREE.CylinderGeometry(r * .7, r * 1.15, h, 8), m, x, h / 2 + .02, z); const tie = cyl(r * .85, r * .85, .08, 8, cordM, x, h * .45, z); return g; }

// ---------- THE COURTYARD: 60 posts on bronze bases, silver hooks and bands, fine linen hangings (Ex 27:9–19) ----------
{
  const HH = 5 * C, posts = [];
  for (let k = 0; k <= 20; k++) for (const sx of [-1, 1]) posts.push([sx * COURT.x, -k * 5 * C, sx, 0]);      // north and south sides
  for (let k = 1; k < 10; k++) posts.push([-COURT.x + k * 5 * C, COURT.zW, 0, -1]);                           // west side
  // east side: 15 cubits of hanging each side of the gate on 3 pillars, the gate 20 cubits on 4 pillars
  const EAST = [-COURT.x + 3.43, -10 * C, -10 * C + 20 * C / 3, 10 * C - 20 * C / 3, 10 * C, COURT.x - 3.43];
  for (const x of EAST) posts.push([x, COURT.zE, 0, 1]);
  for (const [x, z, ox, oz] of posts) {
    box(.34, .22, .34, bronzeM, x, 0, z);                                     // bronze base
    cyl(.075, .085, HH, 7, acaciaM, x, .2, z);                                // post
    cyl(.1, .1, .1, 7, silverM, x, HH + .12, z);                              // silver capital
    const nx = ox || (x > 0 ? .4 : -.4) * 0, nz = oz;
    const ex = ox ? ox : 0, ez = oz ? oz : 0;                                 // cords and bronze pegs, outward (Ex 27:19, 35:18)
    if (ex || ez) { const px = x + ex * 1.5, pz = z + ez * 1.5; rod([x, HH + .05, z], [px, .05, pz], .012, cordM); cyl(.03, .02, .25, 4, bronzeM, px, -.05, pz); }
  }
  // corner cords
  for (const [x, z] of [[-COURT.x, 0], [COURT.x, 0], [-COURT.x, COURT.zW], [COURT.x, COURT.zW]]) { const px = x + Math.sign(x) * 1.1, pz = z + (z < -1 ? -1.1 : 1.1); rod([x, HH + .05, z], [px, .05, pz], .012, cordM); }
  // silver bands (fillets) joining the posts along the top, and the linen hangings
  const sideZ = Array.from({ length: 21 }, (_, k) => -k * 5 * C);
  for (const sx of [-1, 1]) for (let k = 0; k < 20; k++) { const x = sx * COURT.x; rod([x, HH + .05, sideZ[k]], [x, HH + .05, sideZ[k + 1]], .022, silverM); hanging(x, sideZ[k] - .08, x, sideZ[k + 1] + .08, .08, HH - .05, linenM); }
  for (let k = 0; k < 10; k++) { const x0 = -COURT.x + k * 5 * C, x1 = x0 + 5 * C; rod([x0, HH + .05, COURT.zW], [x1, HH + .05, COURT.zW], .022, silverM); hanging(x0 + .08, COURT.zW, x1 - .08, COURT.zW, .08, HH - .05, linenM); }
  const E = [-COURT.x, ...EAST, COURT.x];
  for (let k = 0; k < E.length - 1; k++) { const x0 = E[k], x1 = E[k + 1], gate = x0 >= -10 * C - .01 && x1 <= 10 * C + .01, mid = Math.abs(x0 + x1) < .01;
    rod([x0, HH + .05, 0], [x1, HH + .05, 0], .022, silverM);
    if (mid) { gathered(x0 + .2, .02, HH - .05, screenM); gathered(x1 - .2, .02, HH - .05, screenM); continue; }   // the middle of the gate is tied back: the way in
    hanging(x0 + .08, 0, x1 - .08, 0, .08, HH - .05, gate ? screenM : linenM, gate ? .05 : .03); }
  WALKWAYS.push([-1.1, -.6, 1.1, .6]);
}

// ---------- THE BRONZE ALTAR (Ex 27:1–8, 38:1–7) ----------
{
  const s = ALTAR.s, h = ALTAR.h, z = ALTAR.z, g = new THREE.Group(); g.position.set(0, 0, z); scene.add(g);
  box(s, h, s, bronzeM, 0, 0, 0, g);
  box(s + .14, .12, s + .14, bronzeM, 0, h * .5, 0, g);                               // the ledge
  for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) { box(.03, h * .48, .02, mat('tBronzeDk', '#5e3c20'), -s / 2 + .13 + i * (s - .26) / 8, .02, sd * (s / 2 + .02), g); box(.02, h * .48, .03, mat('tBronzeDk', '#5e3c20'), sd * (s / 2 + .02), .02, -s / 2 + .13 + i * (s - .26) / 8, g); }   // bronze network below the ledge
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const hn = add(new THREE.ConeGeometry(.12, .32, 5), bronzeM, a * (s / 2 - .12), h + .16, b * (s / 2 - .12), g); hn.rotation.z = -a * .25; hn.rotation.x = b * .25; }   // four horns
  for (const sd of [-1, 1]) { rod([-s / 2 - .9, h * .45, sd * (s / 2 + .1)], [s / 2 + .9, h * .45, sd * (s / 2 + .1)], .045, bronzeM, g); for (const a of [-.7, .7]) add(new THREE.TorusGeometry(.08, .02, 5, 10), bronzeM, a, h * .45, sd * (s / 2 + .1), g).rotation.y = Math.PI / 2; }   // poles in rings
  box(s - .2, .06, s - .2, mat('tAsh', '#3a3430'), 0, h, 0, g);                           // ash
  for (let i = 0; i < 6; i++) { const lg = cyl(.07, .07, 1.1, 5, mat('tLog', '#4a3020'), R(-.4, .4), h + .1 - .55, R(-.4, .4), g); lg.rotation.z = Math.PI / 2; lg.rotation.y = R(0, 3); }
  const f = makeFire(THREE, { scale: .55, light: true }); f.position.set(0, h + .05, 0); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f);
  // slaughter tables and the morning's lambs on the north side of the altar (Lev 1:11)
  for (const tz of [z - 2.2, z, z + 2.2]) { box(1.2, .08, .7, 'stone', 4.6, .85, tz); for (const [a, b] of [[-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28]]) box(.1, .85, .1, 'stoneDk', 4.6 + a, 0, tz + b); }
  for (const [x, zz] of [[6.8, z + 3.5], [7.6, z + 1.2], [6.2, z - 3.4]]) woolSheep(x, zz);
  for (let i = 0; i < 5; i++) { const lg = cyl(.09, .09, 1.3, 5, mat('tLog', '#4a3020'), -3.6, .09 + i * .17 - .65, z + 1.4 + (i % 2) * .05); lg.rotation.x = Math.PI / 2; lg.position.x += (i % 3) * .2; }
}
// ---------- THE BRONZE LAVER, made from the women's mirrors (Ex 30:17–21, 38:8) ----------
{
  const g = new THREE.Group(); g.position.set(0, 0, LAVER_Z); scene.add(g);
  cyl(.5, .58, .12, 16, bronzeM, 0, 0, 0, g);
  cyl(.14, .22, .45, 12, bronzeM, 0, .12, 0, g);
  const pr = [[0, 0], [.18, 0], [.42, .05], [.62, .22], [.68, .32], [.66, .34]].map(([r, y]) => new THREE.Vector2(r, y));
  const bowl = add(new THREE.LatheGeometry(pr, 20), mat('tBronzeS', '#a8703c', { metalness: .3, roughness: .45, side: THREE.DoubleSide }), 0, .55, 0, g);
  const w = add(new THREE.CircleGeometry(.62, 20), waterM, 0, .83, 0, g); w.rotation.x = -Math.PI / 2;
}

// ---------- THE TENT (Ex 26, 36) ----------
const T = TENT;
{
  const bw = 1.5 * C, H = T.H, wx = T.w + T.th / 2;
  // boards of acacia overlaid with gold, each on two silver sockets (Ex 26:15–25): 20 a side, 6 + 2 corner boards at the back
  for (const sx of [-1, 1]) for (let k = 0; k < 20; k++) { const z = T.zB + (k + .5) * bw; box(T.th, H, bw - .015, goldM, sx * wx, .15, z); for (const o of [-.17, .17]) box(T.th + .12, .16, .26, silverM, sx * wx, 0, z + o); }
  for (let k = 0; k < 8; k++) { const x = -T.w - T.th + (k + .5) * ((2 * T.w + 2 * T.th) / 8); box((2 * T.w + 2 * T.th) / 8 - .015, H, T.th, goldM, x, .15, T.zB - T.th / 2); box(.26, .16, T.th + .12, silverM, x, 0, T.zB - T.th / 2); }
  // the middle bar, outside, through the boards (Ex 26:28)
  for (const sx of [-1, 1]) rod([sx * (wx + T.th / 2 + .03), H * .5, T.zB], [sx * (wx + T.th / 2 + .03), H * .5, T.zF], .035, goldM);
  // floor: bare earth inside, swept
  { const fl = add(new THREE.PlaneGeometry(2 * T.w, T.zF - T.zB), mat('tFloor', '#b89c74'), 0, .02, (T.zF + T.zB) / 2); fl.rotation.x = -Math.PI / 2; fl.castShadow = false; }
  // the ceiling: the inner curtains of linen with cherubim, seen from inside (Ex 26:1)
  { const ce = add(new THREE.PlaneGeometry(2 * T.w, T.zF - T.zB), ceilM, 0, H + .14, (T.zF + T.zB) / 2); ce.rotation.x = Math.PI / 2; ce.castShadow = false; }
  // the door: five pillars of acacia overlaid with gold, gold capitals, bronze sockets, and the embroidered screen (Ex 26:36–37)
  const DX = [-2, -1, 0, 1, 2].map(k => k * T.w / 2);
  for (const x of DX) { box(.3, .2, .3, bronzeM, x, 0, T.zF); cyl(.1, .11, H, 8, goldM, x, .2, T.zF); cyl(.15, .12, .18, 8, goldM, x, H + .1, T.zF); }
  for (let k = 0; k < 4; k++) { const x0 = DX[k], x1 = DX[k + 1];
    if (k === 1 || k === 2) { gathered(k === 1 ? x0 + .12 : x1 - .12, T.zF + .1, H - .1, screenM, .1); continue; }    // the two middle bays are tied back
    hanging(x0 + .1, T.zF + .1, x1 - .1, T.zF + .1, .2, H, screenM, .05); }
  WALKWAYS.push([-.95, T.zF - .7, -.2, T.zF + .7], [.2, T.zF - .7, .95, T.zF + .7]);
  // the veil: four pillars overlaid with gold on silver sockets, blue, purple and scarlet with cherubim (Ex 26:31–33)
  const VX = [-1.5, -.5, .5, 1.5].map(k => k * T.w / 2);
  for (const x of VX) { box(.3, .2, .3, silverM, x, 0, T.zV); cyl(.1, .11, H, 8, goldM, x, .2, T.zV); cyl(.15, .12, .18, 8, goldM, x, H + .1, T.zV); }
  const VE = [-T.w, ...VX, T.w];
  for (let k = 0; k < VE.length - 1; k++) { const x0 = VE[k], x1 = VE[k + 1];
    if (k === 2) { gathered(x0 + .14, T.zV + .14, H - .05, veilM, .12); gathered(x1 - .14, T.zV + .14, H - .05, veilM, .12); continue; }   // parted in the middle, so you can walk through
    hanging(x0 + (k ? .1 : 0), T.zV + .14, x1 - (k === VE.length - 2 ? 0 : .1), T.zV + .14, .02, H, veilM, .05); }
  WALKWAYS.push([-.3, T.zV - .7, .3, T.zV + .7]);
}
// ---- the coverings: goat hair, rams' skins dyed red, and an outer covering of tachash skins (Ex 26:7–14) ----
// They are kept out of the merge (dyn) so bird's-eye view can lift them off, like a cutaway.
{
  const H = T.H, W = T.w + T.th + .08, z0 = T.zB - T.th - .08, z1 = T.zF + .25, L = z1 - z0, zc = (z0 + z1) / 2;
  const layer = (m, y, w, l, zz, drop, back) => { const out = [];
    out.push(box(2 * w, .05, l, m, 0, y, zz));
    if (drop) for (const sx of [-1, 1]) out.push(box(.05, drop, l, m, sx * (w + .02), y - drop + .05, zz));
    if (back) out.push(box(2 * w + .1, back, .05, m, 0, y - back + .05, zz - l / 2 - .02));
    return out; };
  const pieces = [
    ...layer(goatM, H + .2, W, L, zc, H + .2 - .45, H + .2 - .3),          // goat hair: down to a cubit above the ground, the extra half curtain over the back (Ex 26:12)
    box(2 * W + .1, .45, .05, goatM, 0, H - .2, z1 + .02),                    // the sixth curtain doubled over the front (Ex 26:9)
    ...layer(ramM, H + .28, W + .06, L - .3, zc - .1, .55, .45),
    ...layer(tachashM, H + .36, W + .12, L - .5, zc - .2, .4, .35) ];
  // a low ridge so rain runs off, as in the reference picture
  const ridge = add(new THREE.CylinderGeometry(.12, .12, L - .5, 6), tachashM, 0, H + .42, zc - .2); ridge.rotation.x = Math.PI / 2; pieces.push(ridge);
  for (const p of pieces) { p.userData.dyn = 1; ROOF.push(p); }
}

// ---------- IN THE HOLY PLACE ----------
const HP_Z = (T.zF + T.zV) / 2 - .4;
// the table of showbread, on the north side (Ex 25:23–30, 26:35, 40:22; Lev 24:5–9): 2 × 1 × 1.5 cubits, twelve loaves in two piles
{
  const g = new THREE.Group(); g.position.set(T.w - .95, 0, HP_Z); scene.add(g);
  const L = 2 * C, Wd = 1 * C, Ht = 1.5 * C;
  box(Wd, .05, L, goldM, 0, Ht - .05, 0, g);
  box(Wd + .04, .04, L + .04, goldM, 0, Ht, 0, g);                                      // the gold moulding round the top
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(.05, Ht - .05, .05, goldM, a * (Wd / 2 - .04), 0, b * (L / 2 - .04), g);
  box(Wd - .06, .07, L - .06, goldM, 0, Ht * .45, 0, g);                                // the rim between the legs
  for (const sd of [-1, 1]) rod([sd * (Wd / 2 + .06), Ht * .45, -L / 2 - .35], [sd * (Wd / 2 + .06), Ht * .45, L / 2 + .35], .02, goldM, g);
  for (const pz of [-.2, .2]) for (let i = 0; i < 6; i++) { const lf = add(new THREE.CylinderGeometry(.15, .16, .045, 14), breadM, 0, Ht + .045 + i * .05, pz, g); lf.scale.set(.9, 1, 1.15); }
  for (const pz of [-.2, .2]) cyl(.035, .025, .05, 8, goldM, 0, Ht + .045 + 6 * .05 + .02, pz, g);   // frankincense on each pile (Lev 24:7)
  for (const pz of [-.38, .38]) cyl(.05, .03, .08, 8, goldM, .14, Ht + .04, pz, g);                    // dishes and cups (Ex 25:29)
}
// the golden lampstand, on the south side (Ex 25:31–40, 37:17–24): six branches from the shaft, almond-blossom cups, seven lamps
{
  const g = new THREE.Group(); g.position.set(-T.w + .95, 0, HP_Z); scene.add(g);
  const top = 1.55, s = .02;
  cyl(.2, .26, .08, 10, goldM, 0, 0, 0, g); for (let i = 0; i < 3; i++) { const ft = cyl(.04, .05, .18, 6, goldM, Math.cos(i * 2.1) * .2, 0, Math.sin(i * 2.1) * .2, g); }
  cyl(.035, .05, top, 8, goldM, 0, .08, 0, g);
  for (const yy of [.55, .95, 1.2, 1.4]) cyl(.06, .03, .07, 8, goldM, 0, yy, 0, g);              // knops and flowers on the shaft
  for (let i = 1; i <= 3; i++) { const r = .16 * i; for (const sd of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 12; k++) { const th = k / 12 * Math.PI / 2; pts.push(new THREE.Vector3(0, top - r * Math.cos(th), sd * r * Math.sin(th))); }   // a quarter circle: out from the shaft and up to the lamp line
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, s, 6), goldM, 0, 0, 0, g);
    for (const k of [4, 8]) { const p = pts[k]; add(new THREE.SphereGeometry(.03, 6, 5), goldM, p.x, p.y, p.z, g); } } }
  for (let i = -3; i <= 3; i++) { const z = i * .16; cyl(.05, .03, .06, 8, goldM, 0, top + .08, z, g);
    const lamp = add(new THREE.SphereGeometry(.05, 8, 5), goldM, 0, top + .16, z, g); lamp.scale.set(.8, .5, 1.3);
    flame(g, 0, top + .17, z + .045, .7); }
  const pl = new THREE.PointLight('#ffc070', 7, 9, 1.4); pl.position.set(-T.w + 1.3, top + .3, HP_Z); scene.add(pl); ROOM_LIGHTS.push(pl); pl.userData.base = 7;
}
// the altar of incense, before the veil (Ex 30:1–10, 37:25–28): 1 × 1 × 2 cubits, overlaid with gold, horns and a crown
const INCENSE_Z = T.zV + 1.0;
{
  const g = new THREE.Group(); g.position.set(0, 0, INCENSE_Z); scene.add(g); const s = C, h = 2 * C;
  box(s, h, s, goldM, 0, 0, 0, g); box(s + .05, .05, s + .05, goldM, 0, h, 0, g);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(new THREE.ConeGeometry(.04, .1, 5), goldM, a * (s / 2 - .04), h + .1, b * (s / 2 - .04), g);
  for (const sd of [-1, 1]) rod([-s / 2 - .4, h * .75, sd * (s / 2 + .05)], [s / 2 + .4, h * .75, sd * (s / 2 + .05)], .015, goldM, g);
  cyl(.09, .06, .05, 10, mat('tCoal', '#5a2a18', { emissive: '#ff5a1a', emissiveIntensity: .8 }), 0, h + .05, 0, g);
  const pl = new THREE.PointLight('#ffd8a0', 4, 7, 1.5); pl.position.set(0, 2.6, T.zV + 2.5); scene.add(pl); ROOM_LIGHTS.push(pl); pl.userData.base = 4;
}
// ---------- IN THE MOST HOLY PLACE: the ark of the covenant and the mercy seat (Ex 25:10–22, 37:1–9) ----------
{
  const g = new THREE.Group(); g.position.set(0, 0, ARK_Z); scene.add(g);
  const L = 2.5 * C, Wd = 1.5 * C, Ht = 1.5 * C, fy = .1;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(.08, fy, .08, goldM, a * (L / 2 - .06), 0, b * (Wd / 2 - .06), g);   // feet
  box(L, Ht, Wd, goldM, 0, fy, 0, g);
  box(L + .04, .05, Wd + .04, goldM, 0, fy + Ht - .1, 0, g);                                           // gold moulding round about
  box(L + .02, .04, Wd + .02, goldM, 0, fy + Ht, 0, g);                                                // the mercy seat
  for (const sd of [-1, 1]) { rod([-L / 2 - .9, fy + .12, sd * (Wd / 2 + .06)], [L / 2 + .9, fy + .12, sd * (Wd / 2 + .06)], .025, goldM, g);
    for (const a of [-.42, .42]) add(new THREE.TorusGeometry(.05, .012, 5, 10), goldM, a, fy + .12, sd * (Wd / 2 + .06), g).rotation.y = Math.PI / 2; }
  // two cherubim of hammered gold, facing one another, wings spread upward overshadowing the mercy seat
  const y0 = fy + Ht + .04;
  for (const sd of [-1, 1]) { const c = new THREE.Group(); c.position.set(sd * (L / 2 - .17), y0, 0); c.rotation.y = sd * Math.PI / 2; g.add(c);
    const body = add(new THREE.CylinderGeometry(.07, .1, .32, 8), goldM, 0, .16, 0, c); body.rotation.x = .25;
    add(new THREE.SphereGeometry(.07, 8, 6), goldM, 0, .38, -.06, c);                                   // head bowed toward the mercy seat
    for (const ws of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(ws * .3, .18, ws * .26, .5); sh.quadraticCurveTo(ws * .12, .32, 0, .1);   // a wing, spread out and up
      const wp = new THREE.Group(); wp.position.set(ws * .06, .26, .02); wp.rotation.y = ws * .55; wp.rotation.x = -.42; c.add(wp);                                       // swept forward over the mercy seat
      add(new THREE.ExtrudeGeometry(sh, { depth: .015, bevelEnabled: false }), goldM, 0, 0, 0, wp); } }
  // the glory between the cherubim (Ex 25:22): a soft light, not a fire
  const pl = new THREE.PointLight('#ffe6a8', 9, 7, 1.3); pl.position.set(0, 1.6, ARK_Z); scene.add(pl); ROOM_LIGHTS.push(pl); pl.userData.base = 9;
  const glowT = canvasTex(128, (x, w) => { const gr = x.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,244,210,.9)'); gr.addColorStop(.4, 'rgba(255,226,150,.35)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 })); glow.position.set(0, y0 + .45, ARK_Z); glow.scale.setScalar(1.3); glow.userData.dyn = 1; scene.add(glow);
}

// ---------- priests at their work (linen tunics, Ex 28:39–42) ----------
{ const P = [[-1.8, ALTAR.z - .4, -1.4, '#f1ece0'], [-1.3, LAVER_Z + .2, Math.PI / 2, '#f1ece0'], [3.9, ALTAR.z + 1.4, -1.2, '#efe8d8'], [-2.6, LAVER_Z - 1.6, .8, '#f1ece0']];
  for (const [x, z, r, c] of P) person(x, z, r, c, { hair: 1, cloak: '#ece4d2' }); }
