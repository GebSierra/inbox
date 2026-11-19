// ---------- HEBREWS IN THE TABERNACLE: the memory pictures of "The Chapter Code" ----------
// One picture per chapter of Hebrews, each at its place in the tabernacle, in the order of the book "The Chapter Code"
// (https://a.co/d/04W9GCw3). This town is a companion to that book: the pictures are its hooks, the book has the outline.
// The most holy place (Hebrews 10–12: the ark, the cherubim, the cloud) is left as it is; you imagine those three.
// Runs after world/tabernacle.js (uses TENT, ALTAR, LAVER_Z, HP_Z, INCENSE_Z, ARK_Z, rod, goldM …) and before world/tour.js.
const HB = {};
const hbTex = (size, draw) => { const t = canvasTex(size, draw); t.userData = {}; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };   // UVs 0–1, not world-sized                                                     // where each picture stands, for tour.js
const hbM = (k, c, o = {}) => mat('hb' + k, c, { flatShading: false, roughness: .8, ...o });
const hbGold = hbM('Gold', '#e2b44a', { metalness: .55, roughness: .3, emissive: '#4a3008', emissiveIntensity: .35 });
const hbFire = (g, x, y, z, s) => { const f = makeFire(THREE, { scale: s, light: false }); f.position.set(x, y, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return f; };
function hbFig(x, y, z, rot, tunic, opts, sc = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; g.scale.setScalar(sc); scene.add(g); upPerson(g, tunic, opts); return g; }
// a full beard and moustache on a figure (head at about 1.31–1.55; seated figures are lowered by drop)
function hbBeard(g, col, len = .2, drop = 0) { const m = hbM('Beard' + col, col, { roughness: 1 }), b = new THREE.Group(); b.position.y = -drop; g.add(b);
  const c = add(new THREE.ConeGeometry(.075, len, 9), m, 0, 1.36 - len / 2, .085, b); c.rotation.x = Math.PI + .25; c.scale.set(1.1, 1, .7);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(.045, 8, 6), m, s * .055, 1.395, .07, b).scale.set(1, 1.3, .8);
  add(new THREE.CapsuleGeometry(.012, .07, 3, 6), m, 0, 1.43, .1, b).rotation.z = Math.PI / 2; return b; }
// a feathered wing (in the figure's frame: +x outward, +y up), white, layered
function hbWing(g, side, span = 1.1) { const w = new THREE.Group(); w.position.set(side * .1, 1.22, -.1); w.rotation.set(-.15, side * -.55, side * -.32); g.add(w);
  const fm = [hbM('Feather0', '#fbf8f1', { side: THREE.DoubleSide, roughness: .9 }), hbM('Feather1', '#ebe4d6', { side: THREE.DoubleSide, roughness: .9 }), hbM('Feather2', '#dcd2bf', { side: THREE.DoubleSide, roughness: .9 })];
  for (let row = 0; row < 3; row++) { const n = 9 - row * 2, len = span * (1 - row * .22);
    for (let i = 0; i < n; i++) { const t = i / (n - 1), ang = .25 + t * 1.25, fl = len * (.55 + .45 * Math.sin(t * Math.PI * .9 + .3)) * (row ? 1 : 1);
      const sh = new THREE.Shape(); sh.moveTo(0, -.045); sh.quadraticCurveTo(fl * .55, -.11, fl * .92, -.06); sh.quadraticCurveTo(fl * 1.04, 0, fl * .92, .06); sh.quadraticCurveTo(fl * .55, .11, 0, .045);   // a broad feather, round-tipped
      const f = add(new THREE.ExtrudeGeometry(sh, { depth: .008, bevelEnabled: false }), fm[row], 0, 0, row * .012, w); f.rotation.z = side > 0 ? ang : Math.PI - ang; if (side < 0) f.rotation.x = Math.PI; } }   // mirrored by turning over, not by a negative scale (that would flip the faces dark)
  return w; }

// ========== 1. THE ENTRANCE: an angel carrying a $ flies in at the gate (prophets / profits: Jesus above prophets and angels) ==========
{ const g = new THREE.Group(); g.position.set(.35, .45, 1.7); g.rotation.y = -.35; g.rotation.x = .1; g.scale.setScalar(1.4); scene.add(g);   // just in front of the gate, flying in
  upPerson(g, '#f7f3ea', { arms: 'pray', hair: 2, cloak: '#efe6d2' });
  const robe = hbM('Robe', '#f6f1e6', { map: TEX.cloth, side: THREE.DoubleSide });
  add(new THREE.CylinderGeometry(.2, .34, .9, 14, 1, true), robe, 0, .48, -.03, g);                        // a long robe flowing back
  const sash = add(new THREE.TorusGeometry(.19, .018, 6, 18), hbGold, 0, .95, 0, g); sash.rotation.x = Math.PI / 2;
  hbWing(g, 1); hbWing(g, -1);
  // the $: a gold S with a bar, held up in both hands in front of the chest
  const D = new THREE.Group(); D.position.set(0, .93, .34); D.scale.setScalar(1.15); g.add(D);
  const S = [], r = .12;                                                   // top bowl (anticlockwise from upper right to the middle), then bottom bowl (clockwise to lower left)
  for (let i = 0; i <= 24; i++) { const a = .35 + (1.5 * Math.PI - .35) * i / 24; S.push(new THREE.Vector3(Math.cos(a) * r, r + Math.sin(a) * r, 0)); }
  for (let i = 1; i <= 24; i++) { const a = Math.PI / 2 - (1.5 * Math.PI - .35) * i / 24; S.push(new THREE.Vector3(Math.cos(a) * r, -r + Math.sin(a) * r, 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(S), 60, .042, 10), hbGold, 0, 0, 0, D);
  add(new THREE.CylinderGeometry(.034, .034, .64, 10), hbGold, 0, 0, 0, D);
  HB[1] = [.35, 1.7]; }

// ========== 2. THE BRONZE ALTAR: two books burning on the altar (author of our salvation) ==========
{ const g = new THREE.Group(); g.position.set(0, ALTAR.h + .06, ALTAR.z + .35); g.scale.setScalar(1.25); scene.add(g);
  const pageT = hbTex(256, (x, w) => { x.fillStyle = '#efe4c6'; x.fillRect(0, 0, w, w); x.fillStyle = 'rgba(60,40,24,.75)';
    for (let col = 0; col < 2; col++) for (let r = 0; r < 18; r++) x.fillRect(14 + col * 124 + R(0, 4), 18 + r * 12, R(70, 104), 4);
    const gr = x.createRadialGradient(w / 2, w, 10, w / 2, w, w); gr.addColorStop(0, 'rgba(40,18,6,.0)'); gr.addColorStop(.7, 'rgba(40,18,6,.0)'); gr.addColorStop(1, 'rgba(30,14,4,.85)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  const pageM = new THREE.MeshStandardMaterial({ map: pageT, roughness: .9, side: THREE.DoubleSide });
  const coverA = hbM('CoverA', '#7a1f18', { roughness: .7 }), coverB = hbM('CoverB', '#3a78b0', { roughness: .7 }), edge = hbM('Edge', '#f2e6c4', { roughness: 1 });
  // book A: open, standing on its spine like a V, facing the gate
  { const B = new THREE.Group(); B.position.set(-.45, 0, 0); B.rotation.y = .25; g.add(B); const W = .62, H = .82;
    for (const s of [-1, 1]) { const half = new THREE.Group(); half.rotation.z = s * .42; B.add(half);
      box(W, H, .035, coverA, s * W / 2, 0, -.02, half);
      box(W - .04, H - .05, .09, edge, s * (W / 2 - .01), .02, .045, half);
      const pg = add(new THREE.PlaneGeometry(W - .05, H - .06), pageM, s * (W / 2 - .01), H / 2 + .02, .092, half); }
    hbFire(B, 0, .05, .2, .38); }
  // book B: closed, leaning on its fore-edge, gold title band, burning at the top
  { const B = new THREE.Group(); B.position.set(.62, 0, -.1); B.rotation.set(0, -.35, -.22); g.add(B); const W = .55, H = .8, T = .22;
    box(W, H, T, coverB, 0, 0, 0, B); box(W - .03, H - .04, T - .05, edge, .02, .02, 0, B);
    box(W * .8, .06, T + .005, hbGold, -.01, H * .7, 0, B); box(W * .8, .06, T + .005, hbGold, -.01, H * .25, 0, B);
    hbFire(B, 0, H - .05, 0, .34); }
  HB[2] = [0, ALTAR.z]; }

// ========== 3. BETWEEN THE ALTAR AND THE LAVER: Moses on a three-legged stool, with his staff (Jesus above Moses) ==========
{ const x = -1.15, z = -15.4, rot = .45;   // three-quarters to you, so the stool's seat and three legs show round him
  const st = new THREE.Group(); st.position.set(x, 0, z); st.rotation.y = rot; scene.add(st); const wd = hbM('Stool', '#c08a52', { map: TEX.wood });                       // pale wood, so it stands out from his red robe
  add(new THREE.CylinderGeometry(.3, .28, .07, 18), wd, 0, .4, -.04, st);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 2 + 1.05; /* one leg out to each side, one behind */ rod([Math.cos(a) * .16, .41, -.04 + Math.sin(a) * .16], [Math.cos(a) * .44, 0, -.04 + Math.sin(a) * .44], .045, wd, st, 8); }
  const g = hbFig(x, 0, z, rot, '#8a3a2a', { pose: 'sit', prop: 'staff', cloak: '#c9b48a', hair: 3 });
  hbBeard(g, '#e8e4dc', .26, .38);
  rod([.27, 0, .2], [.25, 1.62, .15], .034, hbM('Staff', '#5a3a1e', { map: TEX.wood }), g, 8);   // his staff, thick and upright, taller than he sits
  // the two tablets of the testimony, leaning against the stool
  const stone = hbM('Tablet', '#a8a49a', { roughness: 1 }), tab = new THREE.Shape(); tab.moveTo(-.15, 0); tab.lineTo(-.15, .36); tab.absarc(0, .36, .15, Math.PI, 0, true); tab.lineTo(.15, 0); tab.closePath();
  const marks = hbTex(128, (c, w) => { c.fillStyle = '#a8a49a'; c.fillRect(0, 0, w, w); c.fillStyle = '#5e5a52'; for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) c.fillRect(14 + k * 21 + R(0, 3), 28 + r * 13, R(8, 14), 4); });
  for (const s of [-1, 1]) { const t = add(new THREE.ExtrudeGeometry(tab, { depth: .05, bevelEnabled: true, bevelSize: .01, bevelThickness: .01, bevelSegments: 1 }), stone, s * .2 + .55, 0, .45, st); t.rotation.set(-.2, .85, 0);
    const f = add(new THREE.PlaneGeometry(.26, .4), new THREE.MeshStandardMaterial({ map: marks, roughness: 1 }), s * .2 + .55, .24, .45, st); f.rotation.copy(t.rotation); f.translateZ(.065); }
  HB[3] = [x, z]; }

// ========== 4. THE BRONZE LAVER: Joshua resting on an inflatable in the laver water (Jesus gives a better rest than Joshua) ==========
{ const ring = hbTex(256, (x, w) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#fff4c8' : '#f0507a'; x.fillRect(i * w / 8, 0, w / 8 + 1, w); } });   // pink and pale-yellow segments round the ring
  const vinyl = new THREE.MeshStandardMaterial({ map: ring, roughness: .35, metalness: 0 });
  // a ring float on the water, Joshua sitting back in it facing you, legs over the front, sunglasses on, a drink in his hand
  const g = new THREE.Group(); g.position.set(0, .9, LAVER_Z); g.rotation.y = .34; scene.add(g);
  const tor = add(new THREE.TorusGeometry(.46, .19, 16, 32), vinyl, 0, 0, 0, g); tor.rotation.x = Math.PI / 2;
  const P = new THREE.Group(); P.position.set(0, -.5, -.08); P.rotation.x = -.42; g.add(P);
  upPerson(P, '#6a7a3a', { pose: 'sit', hair: 2, skin: 1 });
  hbBeard(P, '#3a2a1e', .12, .38);
  const shade = hbM('Shades', '#121212', { roughness: .2, metalness: .4 }), gl = new THREE.Group(); gl.position.set(0, 1.44 - .38, .112); gl.scale.setScalar(1.3); P.add(gl);
  for (const s of [-1, 1]) { box(.07, .045, .014, shade, s * .04, 0, 0, gl); rod([s * .075, .03, 0], [s * .085, .03, -.1], .005, shade, gl, 3); } box(.03, .01, .012, shade, 0, .03, 0, gl);
  const cup = new THREE.Group(); cup.position.set(.17, .56, .4); P.add(cup);
  add(new THREE.CylinderGeometry(.045, .035, .12, 10), hbM('Cup', '#f2c84a', { roughness: .4 }), 0, .06, 0, cup); rod([0, .1, 0], [.03, .22, -.02], .006, hbM('Straw', '#e2402e'), cup, 4);
  const umb = add(new THREE.ConeGeometry(.07, .04, 8), hbM('Umb', '#3aa0d8', { side: THREE.DoubleSide }), -.02, .2, 0, cup);
  HB[4] = [0, LAVER_Z]; }

// ========== 5. THE FIVE PILLARS AT THE DOOR: the high priest standing among them (Jesus the perfect high priest) ==========
{ const x = TENT.w / 4, z = TENT.zF - .15, g = hbFig(x, 0, z, -.05, '#2b3f86', { hair: 1 });   // in the doorway itself, between the 3rd and 4th pillars
  hbBeard(g, '#2a1e16', .22);
  const eph = hbTex(64, (c, w) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#d9a640', '#2f4f95', '#6a2f6c', '#b22a2a'][i % 4]; c.fillRect(0, i * 8, w, 8); } });
  add(new THREE.CylinderGeometry(.205, .23, .42, 12, 1, true, -Math.PI * .42, Math.PI * .84), new THREE.MeshStandardMaterial({ map: eph, roughness: .7, side: THREE.DoubleSide }), 0, .78, .006, g);   // the ephod of gold, blue, purple and scarlet
  // the breastpiece: twelve stones in four rows of three, set in gold (Ex 28:15–21)
  const bp = new THREE.Group(); bp.position.set(0, .98, .13); bp.rotation.x = -.05; bp.scale.setScalar(1.15); g.add(bp); box(.2, .24, .02, hbGold, 0, 0, 0, bp);
  const gems = ['#c02a2a', '#d8b040', '#2a8a4a', '#3a6ab8', '#2a3a9a', '#e8e8f0', '#d86a2a', '#5aa8c8', '#7a3aa0', '#e0c050', '#4ab070', '#2a2a6a'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) add(new THREE.BoxGeometry(.045, .04, .02), hbM('Gem' + r + c, gems[r * 3 + c], { metalness: .2, roughness: .15, emissive: gems[r * 3 + c], emissiveIntensity: .15 }), (c - 1) * .058, .085 - r * .055, .015, bp);
  // the robe's hem of blue with pomegranates and golden bells (Ex 28:33–34)
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; add(new THREE.SphereGeometry(.022, 6, 5), i % 2 ? hbGold : hbM('Pom', '#a8243a'), Math.sin(a) * .23, .53, Math.cos(a) * .2, g); }
  // the turban of fine linen with the gold plate HOLY TO THE LORD (Ex 28:36–39)
  const tm = hbM('Turban', '#f6f2e6', { map: TEX.cloth }); for (let i = 0; i < 4; i++) { const w = add(new THREE.TorusGeometry(.095 - i * .012, .03, 6, 16), tm, 0, 1.56 + i * .035, .0, g); w.rotation.x = Math.PI / 2; w.scale.set(1, 1.15, 1); }   // a wound linen turban
  add(new THREE.SphereGeometry(.07, 10, 6), tm, 0, 1.66, 0, g); box(.09, .03, .01, hbGold, 0, 1.585, .118, g);   // the gold plate on its front
  HB[5] = [x, z]; }

// ========== 6. THE LAMPSTAND: its six branches fall away (the warning about falling away) — built in world/tabernacle.js ==========
HB[6] = [-TENT.w + .95, HP_Z];

// ========== 7. THE TABLE OF SHOWBREAD: Melchizedek eats from seven loaves and gives five to Abraham (a priest like Melchizedek) ==========
{ const tx = TENT.w - .95, bread = hbM('Loaf', '#c98e4a', { roughness: .75 });
  const loaf = (p, x, y, z, s = 1) => { const l = add(new THREE.SphereGeometry(.12, 12, 8), bread, x, y, z, p); l.scale.set(1.1 * s, .38 * s, .85 * s); return l; };
  // Melchizedek, king of Salem and priest: purple robe, a gold crown, a loaf at his mouth
  const mx = tx - .05, mz = HP_Z - 1.05, mel = hbFig(mx, 0, mz, -.25, '#5a2a6a', { arms: 'reach', cloak: '#6a1e4a', hair: 1 });
  hbBeard(mel, '#3a2a1e', .2);
  const cr = new THREE.Group(); cr.position.set(0, 1.55, .01); cr.scale.setScalar(1.35); mel.add(cr); add(new THREE.CylinderGeometry(.095, .09, .06, 12, 1, true), hbGold, 0, 0, 0, cr);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; add(new THREE.ConeGeometry(.018, .06, 4), hbGold, Math.sin(a) * .093, .055, Math.cos(a) * .093, cr); }
  loaf(mel, .03, 1.42, .17, .8).rotation.z = 1.2;   // at his mouth
  loaf(mel, .15, 1.42, .55, .8);                      // held out to Abraham
  // Abraham: old, a white beard, a striped cloak, holding five loaves
  const ax = tx - .05, az = HP_Z + 1.1, abr = hbFig(ax, 0, az, Math.PI + .45, '#8a6a3a', { prop: 'bowl', cloak: '#6a4a2a', hair: 3 });
  hbBeard(abr, '#ece8e0', .3);
  for (let i = 0; i < 5; i++) loaf(abr, -.04 + (i % 2) * .02, 1.06 + i * .045, .36, .75);
  HB[7] = [tx, HP_Z]; }

// ========== 8. THE ALTAR OF INCENSE: the old covenant's tablets burn and open to show NEW (a better covenant) ==========
{ const g = new THREE.Group(); g.position.set(0, 2 * CUBIT + .05, INCENSE_Z); scene.add(g);
  const stone = hbM('OldStone', '#8a8478', { roughness: 1 }), char = hbM('Char', '#2a2420', { roughness: 1 });
  const tab = new THREE.Shape(); tab.moveTo(-.17, 0); tab.lineTo(-.17, .4); tab.absarc(0, .4, .17, Math.PI, 0, true); tab.lineTo(.17, 0); tab.closePath();
  const oldT = hbTex(128, (c, w) => { c.fillStyle = '#8a8478'; c.fillRect(0, 0, w, w); c.fillStyle = '#2a241e'; c.font = 'bold 50px Georgia'; c.textAlign = 'center'; c.fillText('OT', w / 2, 66);
    for (let r = 0; r < 4; r++) c.fillRect(22, 82 + r * 10, 84, 4);
    c.strokeStyle = '#1a1410'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, 0); c.lineTo(44, 40); c.lineTo(30, 70); c.lineTo(58, 128); c.stroke(); c.beginPath(); c.moveTo(110, 10); c.lineTo(92, 52); c.lineTo(104, 90); c.stroke();
    const gr = c.createLinearGradient(0, 0, 0, w); gr.addColorStop(0, 'rgba(15,10,6,.85)'); gr.addColorStop(.35, 'rgba(15,10,6,0)'); gr.addColorStop(.8, 'rgba(15,10,6,0)'); gr.addColorStop(1, 'rgba(15,10,6,.7)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  for (const s of [-1, 1]) { const t = add(new THREE.ExtrudeGeometry(tab, { depth: .06, bevelEnabled: false }), stone, s * .26, 0, -.02, g); t.rotation.set(-.12, -s * .45, s * .26);
    const f = add(new THREE.PlaneGeometry(.32, .4), new THREE.MeshStandardMaterial({ map: oldT, roughness: 1 }), s * .26, .23, -.02, g); f.rotation.copy(t.rotation); f.translateZ(.065);
    hbFire(g, s * .3, .05, -.16, .24); hbFire(g, s * .42, .42, .02, .11);   /* fire behind, and licking the tablets' outer tops */ for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(.025, 5, 4), hbM('Ember', '#ff6a1a', { emissive: '#ff4a0a', emissiveIntensity: 1.2 }), s * (.15 + k * .06), .02, .14 - k * .03, g); }
  // the new: a bright tablet of gold between them, NEW across it
  const newT = hbTex(256, (c, w) => { const gr = c.createLinearGradient(0, 0, 0, w); gr.addColorStop(0, '#fff6d6'); gr.addColorStop(1, '#f0c868'); c.fillStyle = gr; c.fillRect(0, 0, w, w);
    c.fillStyle = '#7a2a12'; c.font = 'bold 92px Georgia'; c.textAlign = 'center'; c.fillText('NEW', w / 2, 150); c.font = 'italic 30px Georgia'; c.fillText('covenant', w / 2, 200); });
  const nt = new THREE.Shape(); nt.moveTo(-.17, 0); nt.lineTo(-.17, .32); nt.absarc(0, .32, .17, Math.PI, 0, true); nt.lineTo(.17, 0); nt.closePath();
  const NG = new THREE.Group(); NG.position.set(0, .14, .04); g.add(NG);                          // rising up out of the fire
  add(new THREE.ExtrudeGeometry(nt, { depth: .04, bevelEnabled: false }), hbGold, 0, 0, -.02, NG);
  const nf = add(new THREE.PlaneGeometry(.32, .36), new THREE.MeshStandardMaterial({ map: newT, emissive: '#ffd890', emissiveMap: newT, emissiveIntensity: .7, roughness: .5 }), 0, .23, .025, NG);
  const pl = new THREE.PointLight('#ffd890', 2.5, 3, 1.6); pl.position.set(0, .4, .4); g.add(pl); pl.userData.dyn = 1;
  HB[8] = [0, INCENSE_Z]; }

// ========== 9. THE VEIL: a cat slides down it and tears it in two (Jesus above the tabernacle) — the torn veil is in world/tabernacle.js ==========
{ const fur = hbM('Fur', '#d98a3a', { roughness: 1 }), furDk = hbM('FurDk', '#9a5420', { roughness: 1 }), wht = hbM('FurW', '#f2ebdd', { roughness: 1 });
  const g = new THREE.Group(); g.position.set(-.22, 2.15, TENT.zV + .32); g.rotation.x = -.1; scene.add(g);   // clinging to the east face of the veil, head up
  const body = add(new THREE.CapsuleGeometry(.11, .3, 6, 10), fur, 0, 0, 0, g); body.scale.set(1, 1, .85);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(.105, .018, 4, 12, Math.PI), furDk, 0, -.12 + i * .08, .012, g).rotation.y = Math.PI / 2 + Math.PI / 2;
  add(new THREE.SphereGeometry(.085, 10, 8), wht, 0, .05, .07, g).scale.set(.8, 1.6, .5);                   // pale chest
  const head = new THREE.Group(); head.position.set(0, .3, .05); head.rotation.x = .35; g.add(head);
  add(new THREE.SphereGeometry(.1, 12, 10), fur, 0, 0, 0, head).scale.set(1.05, .92, .95);
  add(new THREE.SphereGeometry(.05, 8, 6), wht, 0, -.035, .075, head).scale.set(1.2, .7, .8);
  add(new THREE.SphereGeometry(.012, 6, 5), hbM('Nose', '#d07a7a'), 0, -.01, .12, head);
  for (const s of [-1, 1]) { const e = add(new THREE.ConeGeometry(.045, .085, 4), fur, s * .06, .085, -.005, head); e.rotation.z = -s * .25;
    add(new THREE.SphereGeometry(.02, 8, 6), hbM('CatEye', '#6ab04a', { emissive: '#2a5a1a', emissiveIntensity: .4, roughness: .2 }), s * .038, .015, .085, head).scale.set(1, 1.3, .6);
    add(new THREE.SphereGeometry(.008, 5, 4), hbM('Pupil', '#0a0a0a'), s * .038, .015, .097, head).scale.set(.5, 1.5, .5);
    for (const k of [-1, 1]) rod([s * .03, -.03, .1], [s * .13, -.03 + k * .015, .12], .0025, wht, head, 3); }
  // front paws up, claws hooked into the cloth; back legs splayed, scrabbling
  for (const s of [-1, 1]) { rod([s * .07, .16, .02], [s * .13, .4, -.03], .03, fur, g, 7); add(new THREE.SphereGeometry(.035, 8, 6), wht, s * .13, .42, -.03, g);
    rod([s * .08, -.2, .0], [s * .19, -.33, .02], .038, fur, g, 7); rod([s * .19, -.33, .02], [s * .2, -.45, -.03], .026, fur, g, 7); add(new THREE.SphereGeometry(.033, 8, 6), wht, s * .2, -.46, -.03, g); }
  const tail = [[0, -.26, -.02], [.06, -.42, .04], [.18, -.5, .08], [.28, -.44, .1]].map(p => new THREE.Vector3(...p));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tail), 16, .028, 7), fur, 0, 0, 0, g);
  // claw marks: four ragged scratches running down the veil below the cat
  const scr = hbM('Scratch', '#e8dcc0', { roughness: 1 });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const sx = -.22 + s * .13 + (k - 1) * .025; box(.008, .55, .006, scr, sx, 1.55, TENT.zV + .2); }
  HB[9] = [0, TENT.zV]; }

// ========== 13. OUTSIDE THE TENT: the marriage bed made up for a guest (honour marriage, show hospitality) ==========
{ const x = TENT.w + 4.2, z = HP_Z - .5, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 2; scene.add(g);   // headboard to the north
  const wd = hbM('BedWood', '#7a4a28', { map: TEX.wood }), sheet = hbM('Sheet', '#f8f4ea', { map: TEX.cloth }), quilt = hbTex(256, (c, w) => { c.fillStyle = '#b8323a'; c.fillRect(0, 0, w, w);
    c.strokeStyle = '#e2b85a'; c.lineWidth = 6; c.strokeRect(12, 12, w - 24, w - 24); c.fillStyle = '#fff4e8'; c.beginPath(); const cx = w / 2, cy = w / 2 + 10, s = 70;
    c.moveTo(cx, cy + s * .9); c.bezierCurveTo(cx - s * 1.5, cy - s * .2, cx - s * .6, cy - s * 1.2, cx, cy - s * .45); c.bezierCurveTo(cx + s * .6, cy - s * 1.2, cx + s * 1.5, cy - s * .2, cx, cy + s * .9); c.fill(); });
  const L = 2.0, W = 1.5, legH = .38;
  for (const [a, b, h] of [[-1, -1, 1.15], [1, -1, 1.15], [-1, 1, .7], [1, 1, .7]]) { cyl(.05, .055, h, 8, wd, a * (W / 2), 0, b * (L / 2), g); add(new THREE.SphereGeometry(.065, 8, 6), wd, a * (W / 2), h + .04, b * (L / 2), g); }
  box(W, .5, .05, wd, 0, .55, -L / 2, g); box(W, .25, .05, wd, 0, .4, L / 2, g);                               // headboard and footboard
  for (const s of [-1, 1]) box(.06, .14, L, wd, s * (W / 2 - .02), legH - .08, 0, g);
  box(W - .1, .2, L - .1, sheet, 0, legH, 0, g);                                                              // the mattress
  const q = add(new THREE.BoxGeometry(W - .04, .05, L * .62), new THREE.MeshStandardMaterial({ map: quilt, roughness: .9 }), 0, legH + .23, .3, g);
  for (const s of [-1, 1]) { const p = add(new THREE.SphereGeometry(.26, 12, 8), sheet, s * .34, legH + .3, -L / 2 + .3, g); p.scale.set(1, .38, .62); }
  // hospitality: a basin and jug for the guest's feet, bread and a lamp on a stool, a folded towel, a welcome mat
  const clay = hbM('Clay', '#b8623a', { roughness: .8 });
  add(new THREE.LatheGeometry([[0, 0], [.18, 0], [.26, .1], [.28, .14]].map(([a, b]) => new THREE.Vector2(a, b)), 16), clay, .2, 0, L / 2 + .55, g);
  amph(g, .62, L / 2 + .55, .45);
  upStool(x + 1.25, z - 1.35, 0);
  const tray = new THREE.Group(); tray.position.set(x + 1.25, .47, z - 1.35); scene.add(tray); add(new THREE.CylinderGeometry(.2, .18, .03, 14), clay, 0, 0, 0, tray);
  for (let i = 0; i < 3; i++) { const l = add(new THREE.SphereGeometry(.07, 10, 7), hbM('Loaf', '#c98e4a', { roughness: .75 }), -.07 + i * .07, .045, (i % 2) * .05 - .02, tray); l.scale.set(1.2, .5, .9); }
  flame(tray, .12, .02, -.1, 1.2); add(new THREE.SphereGeometry(.05, 8, 5), clay, .12, .03, -.1, tray).scale.set(1.2, .5, 1.6);
  box(.36, .05, .28, hbM('Towel', '#e6dcc4', { map: TEX.cloth }), 0, legH + .2, L / 2 - .3, g);
  const rug = add(new THREE.PlaneGeometry(1.4, .9), hbM('Rug', '#8a3a2a', { map: TEX.cloth }), 0, .02, L / 2 + .7, g); rug.rotation.x = -Math.PI / 2;
  HB[13] = [x, z]; }
