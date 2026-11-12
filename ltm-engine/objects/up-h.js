// ---------- UP-H: batch 2 of the plan's crude-object rebuilds (laundry rack, wooden crate, letter on a table, wax tablet, lyre, tray of cups, mallet and chisel) ----------
// Each replaces its builder and registry entry, keeping the id, footprint and top height. No R(): variation comes from upRng.
// The James builders (wax tablet, mallet and chisel) live in objects/james-1b.js, which other work may be editing, so they are replaced here
// through the registry only.
const uhWood = () => mat('uhWood', '#9a6a40', { roughness: .9, map: TEX.wood });
const uhWoodDk = () => mat('uhWoodDk', '#6a4428', { roughness: .9, map: TEX.wood });
const uhIron = () => mat('uhIron', '#4a4744', { metalness: .55, roughness: .5 });
const uhBrass = () => mat('uhBrass', '#b8893a', { metalness: .65, roughness: .35, flatShading: false });
// a striped linen texture in a given colour
const uhLinen = (key, base, stripe) => mat('uhLinen' + key, '#ffffff', { side: THREE.DoubleSide, roughness: .95, flatShading: false, map: upTex('uhLinen' + key, 64, 128, (c, w, h, r) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 2) { c.fillStyle = `rgba(0,0,0,${.03 + r() * .05})`; c.fillRect(i, 0, 1, h); }
  if (stripe) { c.fillStyle = stripe; c.fillRect(0, h * .08, w, 5); c.fillRect(0, h * .92 - 5, w, 5); } }) });

// ---- laundry rack: two A-frame trestles, a pole across, three cloths folded over it and hanging both sides ----
P.rack = (g, x, y, z) => { const wd = uhWood();
  for (const s of [-1, 1]) { for (const f of [-1, 1]) upLimbAdd(g, [x + s * .5, y, z + f * .22], [x + s * .5, y + 1.36, z], .03, .025, wd, 5);
    box(.05, .04, .36, wd, x + s * .5, y + .45, z, g); }
  const pole = add(new THREE.CylinderGeometry(.03, .03, 1.12, 7), wd, x, y + 1.38, z, g); pole.rotation.z = Math.PI / 2;
  const cloths = [['r', '#e06450', '#f0e2c0'], ['y', '#f0c860', '#a04a32'], ['b', '#5a8cbc', '#f6eedc']];
  cloths.forEach(([k, base, stripe], i) => { const L = [.95, .8, 1.0][i], W = .3, geo = new THREE.PlaneGeometry(W, L * 2, 4, 16), p = geo.attributes.position, r = upRng(91 + i);
    // fold the long strip over the pole: the first half hangs in front, the second behind, with a soft wave
    for (let v = 0; v < p.count; v++) { const px = p.getX(v), py = p.getY(v), t = py / L, side = t > 0 ? 1 : -1, d = Math.abs(t) * L;
      const wave = Math.sin(px * 18 + d * 6 + i) * .012 * Math.min(1, d * 3);
      p.setXYZ(v, px, -d + (d < .04 ? Math.sqrt(.0016 - Math.min(.0016, (.04 - d) ** 2)) : 0), side * (.035 + d * .04) + wave); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, uhLinen(k, base, stripe)); m.position.set(x - .33 + i * .33, y + 1.41, z); m.castShadow = m.receiveShadow = true; g.add(m);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(.018, .06, .03), uhWoodDk(), x - .33 + i * .33 + s * .1, y + 1.4, z, g); });   // pegs
  return y + 1.45; };
OBJECTS.get('laundry-rack').fn = P.rack;

// ---- wooden crate: corner posts and slatted sides with gaps, a slatted floor, straw spilling over the top, a loose lid against one side ----
COL_INLINE.woodenCrate = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk(), S = .62, H = .58;
  for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.06, H, .06, wk, x + cx * (S / 2 - .03), y, z + cz * (S / 2 - .03), g);
  for (let k = 0; k < 3; k++) { const yy = y + .03 + k * .19;
    for (const sz of [-1, 1]) box(S - .1, .14, .025, wd, x, yy, z + sz * (S / 2 - .012), g);
    for (const sx of [-1, 1]) box(.025, .14, S - .1, wd, x + sx * (S / 2 - .012), yy, z, g); }
  box(S - .06, .025, S - .06, wk, x, y + .03, z, g);
  const straw = mat('uhStraw', '#d9b866', { roughness: 1 }), r = upRng(4417);
  for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = r() * .24, st = add(new THREE.CylinderGeometry(.004, .004, .22 + r() * .12, 3), straw, x + Math.cos(a) * d, y + H - .02, z + Math.sin(a) * d, g); st.rotation.set(r() * 1.2 - .6, r() * 3, r() * 1.4 - .7); }
  add(new THREE.IcosahedronGeometry(.24, 1), straw, x, y + H - .12, z, g).scale.set(1.05, .45, 1.05);
  const lid = box(S - .04, .025, S * .9, wd, x + S / 2 + .06, y, z, g); lid.rotation.z = 1.25;
  return y + .63; };
OBJECTS.get('wooden-crate').fn = COL_INLINE.woodenCrate;

// ---- sealed letter on a table: a turned pedestal table on three feet, a folded papyrus letter tied with cord and a red seal, ink and a reed pen ----
COL_INLINE.letterOnTable = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk();
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + .4; upLimbAdd(g, [x, y + .12, z], [x + Math.cos(a) * .32, y + .02, z + Math.sin(a) * .32], .035, .03, wk, 6); }
  uaLathe([[.07, 0], [.05, .06], [.045, .25], [.06, .3], [.04, .36], [.04, .5], [.07, .56], [.0, .56]], wk, x, y + .06, z, g, 10);
  uaLathe([[0, 0], [.5, 0], [.51, .02], [.5, .05], [0, .05]], wd, x, y + .62, z, g, 28);
  const pap = mat('uhLetter', '#ffffff', { map: upTex('uhLetter', 256, 192, upPapyrusDraw(2, 5)), roughness: .9, flatShading: false, side: THREE.DoubleSide });
  const sheet = new THREE.Mesh(upSheet(.42, .3, 1), pap); sheet.position.set(x - .02, y + .672, z + .02); sheet.rotation.y = .25; sheet.receiveShadow = true; g.add(sheet);
  // the letter itself, folded into a narrow packet, tied and sealed, on top of the open sheet
  const pk = new THREE.Group(); pk.position.set(x + .06, y + .68, z - .05); pk.rotation.y = -.35; g.add(pk);
  box(.26, .03, .1, mat('uhPacket', '#e2cd9a', { roughness: .9 }), 0, 0, 0, pk);
  uaRing(.052, .004, mat('uhCordL', '#6a4a2e'), 0, .015, 0, pk, 10, 0).scale.set(1, .32, 1);
  const seal = add(new THREE.CylinderGeometry(.032, .036, .012, 12), mat('seal', '#b8331f'), 0, .036, 0, pk); seal.rotation.x = .04;
  cyl(.035, .04, .06, 10, mat('uhInk', '#2a2420', { roughness: .4 }), x - .3, y + .67, z + .18, g);
  const pen = add(new THREE.CylinderGeometry(.005, .007, .26, 5), mat('uhReed', '#c9a86a'), x - .24, y + .705, z + .2, g); pen.rotation.set(0, .6, 1.35);
  return y + .75; };
OBJECTS.get('letter-on-table').fn = COL_INLINE.letterOnTable;

// ---- wax tablet wiped smooth: a lectern on a base, a hinged pair of tablets with raised frames and fresh, smooth wax, a stylus on the ledge ----
OBJECTS.get('wax-tablet').fn = (g, x, y, z) => { const wk = uhWoodDk(), wd = uhWood();
  box(.7, .07, .5, wk, x, y, z, g); uaLathe([[.06, 0], [.045, .05], [.04, .62], [.06, .66], [0, .66]], wk, x, y + .07, z, g, 8);
  const gr = new THREE.Group(); gr.position.set(x, y + .78, z); gr.rotation.x = .5; g.add(gr);
  const wax = mat('uhWaxSmooth', '#ffffff', { roughness: .35, flatShading: false, map: upTex('uhWaxSmooth', 128, 192, (c, w, h, r) => { c.fillStyle = '#d9b85e'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { c.strokeStyle = `rgba(255,240,190,${.15 + r() * .2})`; c.lineWidth = 6 + r() * 10; c.beginPath(); const yy = r() * h; c.moveTo(0, yy); c.lineTo(w, yy + (r() - .5) * 20); c.stroke(); }   // smoothing strokes
    for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(120,90,40,.12)'; c.lineWidth = 1; c.beginPath(); const yy = r() * h; c.moveTo(r() * w * .3, yy); c.lineTo(w * (.5 + r() * .4), yy + 1); c.stroke(); } }) });   // faint ghosts of old writing
  for (const a of [-.205, .205]) { box(.39, .035, .54, wd, a, -.035, 0, gr); for (const [w2, d2, ox, oz] of [[.39, .04, 0, -.25], [.39, .04, 0, .25], [.04, .46, -.175, 0], [.04, .46, .175, 0]]) box(w2, .025, d2, wd, a + ox, 0, oz, gr);
    box(.31, .012, .46, wax, a, -.005, 0, gr); }
  for (const zz of [-.15, .15]) uaRing(.012, .004, uhIron(), 0, .005, zz, gr, 8, 0);
  box(.6, .03, .05, wk, 0, -.07, .3, gr);                                                          // the ledge
  const st = add(new THREE.CylinderGeometry(.006, .009, .3, 6), mat('stylus', '#d8d8d0', { metalness: .4, roughness: .4 }), .05, -.03, .3, gr); st.rotation.z = Math.PI / 2;
  add(new THREE.BoxGeometry(.02, .014, .006), mat('stylus', '#d8d8d0'), -.105, -.03, .3, gr);      // its flat eraser end
  return y + .85; };

// ---- lyre: a tortoise-shell sound box, two curving arms, a yoke with tuning collars, seven strings to a bridge, on a small stand ----
P.lyre = (g, x, y, z) => { const wk = uhWoodDk(), wd = uhWood(), br = uhBrass();
  uaLathe([[.12, 0], [.08, .06], [.05, .44], [.08, .5], [0, .5]], wk, x, y, z, g, 8); box(.3, .03, .16, wd, x, y + .48, z, g);
  const shell = mat('uhShell', '#ffffff', { roughness: .45, flatShading: false, map: upTex('uhShell', 128, 128, (c, w, h, r) => { c.fillStyle = '#7a5a2a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${40 + r() * 40 | 0},${24 + r() * 20 | 0},10,${.4 + r() * .4})`; c.beginPath(); c.ellipse(r() * w, r() * h, 6 + r() * 16, 4 + r() * 12, r() * 3, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(30,18,8,.6)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(i * w / 4, 0); c.lineTo(i * w / 4, h); c.stroke(); c.beginPath(); c.moveTo(0, i * h / 4); c.lineTo(w, i * h / 4); c.stroke(); } }) });
  const box2 = add(new THREE.SphereGeometry(.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), shell, x, y + .62, z, g); box2.rotation.x = -Math.PI / 2; box2.scale.set(1, 1.1, .5);
  add(new THREE.CircleGeometry(.2, 16), mat('uhHide', '#e6d6b2', { roughness: .9, side: THREE.DoubleSide }), x, y + .62, z + .002, g).scale.set(1, 1.1, 1);
  for (const s of [-1, 1]) uaTube([[x + s * .13, y + .7, z], [x + s * .2, y + .9, z], [x + s * .17, y + 1.1, z], [x + s * .25, y + 1.27, z]], .022, wd, g, 12);
  const yoke = add(new THREE.CylinderGeometry(.018, .018, .58, 8), wd, x, y + 1.24, z, g); yoke.rotation.z = Math.PI / 2;
  const n = 7; for (let i = 0; i < n; i++) { const sx = (i - (n - 1) / 2) * .042;
    const c = add(new THREE.CylinderGeometry(.012, .012, .03, 6), br, x + sx, y + 1.24, z, g); c.rotation.x = Math.PI / 2;
    box(.003, .5, .003, mat('uhGut', '#efe3c4'), x + sx * .8, y + .72, z + .03, g).rotation.z = -sx * .2; }
  box(.24, .02, .02, mat('uhBridge', '#e8dcc0'), x, y + .7, z + .03, g);
  return y + 1.32; };
OBJECTS.get('lyre').fn = P.lyre;

// ---- tray of cups: a brass tray with a raised rim and handles, four painted clay cups with handles and a small jug ----
P.cups = (g, x, y, z) => { const br = uhBrass();
  box(.6, .015, .4, br, x, y, z, g); for (const [w2, d2, ox, oz] of [[.6, .012, 0, -.194], [.6, .012, 0, .194], [.012, .4, -.294, 0], [.012, .4, .294, 0]]) box(w2, .035, d2, br, x + ox, y, z + oz, g);
  for (const s of [-1, 1]) uaRing(.035, .006, br, x + s * .32, y + .025, z, g, 10, Math.PI / 2).rotation.y = Math.PI / 2;
  const band = mat('uhCupBand', '#ffffff', { roughness: .55, flatShading: false, side: THREE.DoubleSide, map: upTex('uhCupBand', 128, 32, (c, w, h) => { c.fillStyle = '#b5603a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1e1612'; c.fillRect(0, 0, w, 5); c.fillRect(0, h * .55, w, 2); c.fillRect(0, h - 9, w, 9); c.fillStyle = '#e8d2a8'; for (let i = 0; i < 16; i++) c.fillRect(i * 8 + 2, h * .55 + 4, 3, 3); }) });
  for (let i = 0; i < 4; i++) { const cx = x - .2 + (i % 2) * .24, cz = z + (i > 1 ? .09 : -.09);
    uaLathe([[0, 0], [.03, 0], [.032, .01], [.05, .05], [.058, .09], [.054, .09], [.046, .05], [.028, .015], [0, .015]], band, cx, y + .015, cz, g, 14);
    uaRing(.02, .005, mat('clay'), cx + .058, y + .075, cz, g, 8, 0); }
  uaLathe([[0, 0], [.045, 0], [.06, .05], [.05, .11], [.025, .14], [.03, .17], [.026, .17], [0, .15]], band, x + .19, y + .015, z, g, 12);
  return y + .2; };
OBJECTS.get('tray-of-cups').fn = P.cups;

// ---- mallet and chisel on a stone block: a squared block with tooled faces and a half-cut letter, a round-headed mallet, a chisel, chips ----
OBJECTS.get('mallet-and-chisel').fn = (g, x, y, z) => { const lm = mat('uhLime', '#ece2cc', { roughness: 1, map: TEX.stone }), wd = uhWood();
  box(.9, .6, .76, lm, x, y, z, g);
  const tooled = mat('uhTooled', '#ffffff', { roughness: 1, map: upTex('uhTooled', 128, 96, (c, w, h, r) => { c.fillStyle = '#ece2cc'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { c.strokeStyle = `rgba(110,96,70,${.1 + r() * .2})`; c.lineWidth = 1; c.beginPath(); const px = r() * w, py = r() * h; c.moveTo(px, py); c.lineTo(px + 3 + r() * 4, py - 2 - r() * 3); c.stroke(); }
    c.fillStyle = 'rgba(70,58,40,.75)'; c.font = 'bold 54px serif'; c.textAlign = 'center'; c.fillText('Ι', w * .35, h * .72); c.fillStyle = 'rgba(70,58,40,.35)'; c.fillText('Α', w * .65, h * .72); }) });
  const face = add(new THREE.PlaneGeometry(.86, .56), tooled, x, y + .3, z + .381, g); face.receiveShadow = true;
  const top = y + .6, r = upRng(2213);
  for (const [cx, cz, s] of [[.22, -.22, .1], [-.24, -.24, .08], [.3, .12, .07]]) { const ch = add(new THREE.DodecahedronGeometry(s, 0), lm, x + cx, top + s * .4, z + cz, g); ch.scale.y = .6; ch.rotation.y = r() * 3; }
  for (let i = 0; i < 9; i++) { const ch = add(new THREE.TetrahedronGeometry(.02 + r() * .02, 0), lm, x + (r() - .5) * .9, y + .01, z + .4 + r() * .12, g); ch.rotation.set(r() * 3, r() * 3, 0); }   // chips on the ground
  // mallet: a turned round head on a handle
  const mg = new THREE.Group(); mg.position.set(x - .1, top + .07, z + .16); mg.rotation.y = .15; g.add(mg);
  const hd = add(new THREE.CylinderGeometry(.075, .085, .2, 12), uhWoodDk(), -.24, 0, 0, mg); hd.rotation.x = Math.PI / 2;
  const hn = add(new THREE.CylinderGeometry(.02, .026, .4, 7), wd, 0, -.04, 0, mg); hn.rotation.z = Math.PI / 2;
  // chisel: a tapered iron blade and a wooden grip
  const cg = new THREE.Group(); cg.position.set(x + .08, top + .02, z - .03); cg.rotation.y = -.25; g.add(cg);
  const bl = add(new THREE.CylinderGeometry(.008, .016, .24, 4), uhIron(), .12, 0, 0, cg); bl.rotation.z = Math.PI / 2; bl.scale.set(1, 1, .45);
  const gp = add(new THREE.CylinderGeometry(.022, .02, .14, 8), wd, -.07, 0, 0, cg); gp.rotation.z = Math.PI / 2;
  return top + .06; };
