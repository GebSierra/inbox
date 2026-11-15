// ---------- NEW (plan item N5): the Tabernacle's furnishings as library objects ----------
// The same look as tabernacle-ltm/world/tabernacle.js (Exodus 25–27, 30, 37–38), built to the cubit, so a later palace can use them anywhere.
// The Tabernacle town keeps its own copies, so its scene does not change. Private materials (utb*), no R(), no lights of their own
// (a town that wants the lampstand's or the ark's light adds one), the altar fire is the engine's makeFire.
//   upArk(g,x,y,z)            the ark of the covenant with the mercy seat and two cherubim, poles in rings (Ex 25:10–22)
//   upLampstand(g,x,y,z)      the golden lampstand: six branches, almond knops, seven lamps lit (Ex 25:31–40)
//   upShowbread(g,x,y,z)      the table of showbread with twelve loaves in two piles, frankincense, dishes (Ex 25:23–30, Lev 24:5–9)
//   upIncenseAltar(g,x,y,z)   the golden altar of incense with horns, crown and glowing coals (Ex 30:1–10)
//   upBronzeAltar(g,x,y,z)    the bronze altar of burnt offering: horns, ledge, network, poles, ash, logs and fire (Ex 27:1–8)
//   upLaver(g,x,y,z)          the bronze laver on its stand, with water (Ex 30:17–21, 38:8)
//   upCourtPost(g,x,y,z)      a bronze-socketed court pillar with silver capital and a length of linen hanging (Ex 27:9–18)
const UTB_C = 0.4572;
const utbM = () => UTB_M.gold ? UTB_M : Object.assign(UTB_M, {
  gold: mat('utbGold', '#d8a63c', { metalness: .35, roughness: .38, emissive: '#3a2406', emissiveIntensity: .35 }),
  bronze: mat('utbBronze', '#9a6436', { metalness: .3, roughness: .5 }), bronzeDk: mat('utbBronzeDk', '#5e3c20'),
  bronzeS: mat('utbBronzeS', '#a8703c', { metalness: .3, roughness: .45, side: THREE.DoubleSide }), silver: mat('utbSilver', '#d9dcde', { metalness: .3, roughness: .35 }),
  bread: mat('utbBread', '#d6a565', { flatShading: false }), water: mat('utbWater', '#7fb2c2', { metalness: .2, roughness: .15 }),
  ash: mat('utbAsh', '#3a3430'), log: mat('utbLog', '#4a3020'), coal: mat('utbCoal', '#5a2a18', { emissive: '#ff5a1a', emissiveIntensity: .8 }),
  linen: mat('utbLinen', '#f4efe2', { map: TEX.cloth, side: THREE.DoubleSide }), cord: mat('utbCord', '#cdbb92') });
const UTB_M = {};
function utbRod(a, b, r, m, parent, sides = 5) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const mesh = add(new THREE.CylinderGeometry(r, r, L, sides), m, 0, 0, 0, parent); mesh.position.copy(A).add(B).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return mesh; }
const utbGroup = (g, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); g.add(G); return G; };
const UTB_CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

function upArk(g, x, y, z) { const M = utbM(), G = utbGroup(g, x, y, z), C = UTB_C, L = 2.5 * C, Wd = 1.5 * C, Ht = 1.5 * C, fy = .1;
  for (const [a, b] of UTB_CORNERS) box(.08, fy, .08, M.gold, a * (L / 2 - .06), 0, b * (Wd / 2 - .06), G);
  box(L, Ht, Wd, M.gold, 0, fy, 0, G); box(L + .04, .05, Wd + .04, M.gold, 0, fy + Ht - .1, 0, G); box(L + .02, .04, Wd + .02, M.gold, 0, fy + Ht, 0, G);
  for (const sd of [-1, 1]) { utbRod([-L / 2 - .9, fy + .12, sd * (Wd / 2 + .06)], [L / 2 + .9, fy + .12, sd * (Wd / 2 + .06)], .025, M.gold, G);
    for (const a of [-.42, .42]) add(new THREE.TorusGeometry(.05, .012, 5, 10), M.gold, a, fy + .12, sd * (Wd / 2 + .06), G).rotation.y = Math.PI / 2; }
  const y0 = fy + Ht + .04;
  for (const sd of [-1, 1]) { const c = new THREE.Group(); c.position.set(sd * (L / 2 - .17), y0, 0); c.rotation.y = sd * Math.PI / 2; G.add(c);
    add(new THREE.CylinderGeometry(.07, .1, .32, 8), M.gold, 0, .16, 0, c).rotation.x = .25; add(new THREE.SphereGeometry(.07, 8, 6), M.gold, 0, .38, -.06, c);
    for (const ws of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(ws * .3, .18, ws * .26, .5); sh.quadraticCurveTo(ws * .12, .32, 0, .1);
      const wp = new THREE.Group(); wp.position.set(ws * .06, .26, .02); wp.rotation.y = ws * .55; wp.rotation.x = -.42; c.add(wp);
      add(new THREE.ExtrudeGeometry(sh, { depth: .015, bevelEnabled: false }), M.gold, 0, 0, 0, wp); } }
  return y + y0 + .6; }

function upLampstand(g, x, y, z) { const M = utbM(), G = utbGroup(g, x, y, z), top = 1.55, s = .02;
  cyl(.2, .26, .08, 10, M.gold, 0, 0, 0, G); for (let i = 0; i < 3; i++) cyl(.04, .05, .18, 6, M.gold, Math.cos(i * 2.1) * .2, 0, Math.sin(i * 2.1) * .2, G);
  cyl(.035, .05, top, 8, M.gold, 0, .08, 0, G); for (const yy of [.55, .95, 1.2, 1.4]) cyl(.06, .03, .07, 8, M.gold, 0, yy, 0, G);
  for (let i = 1; i <= 3; i++) { const r = .16 * i; for (const sd of [-1, 1]) { const pts = [];
    for (let k = 0; k <= 12; k++) { const th = k / 12 * Math.PI / 2; pts.push(new THREE.Vector3(0, top - r * Math.cos(th), sd * r * Math.sin(th))); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, s, 6), M.gold, 0, 0, 0, G);
    for (const k of [4, 8]) { const p = pts[k]; add(new THREE.SphereGeometry(.03, 6, 5), M.gold, p.x, p.y, p.z, G); } } }
  for (let i = -3; i <= 3; i++) { const lz = i * .16; cyl(.05, .03, .06, 8, M.gold, 0, top + .08, lz, G);
    add(new THREE.SphereGeometry(.05, 8, 5), M.gold, 0, top + .16, lz, G).scale.set(.8, .5, 1.3); flame(G, 0, top + .17, lz + .045, .7); }
  return y + top + .35; }

function upShowbread(g, x, y, z) { const M = utbM(), G = utbGroup(g, x, y, z), C = UTB_C, L = 2 * C, Wd = 1 * C, Ht = 1.5 * C;
  box(Wd, .05, L, M.gold, 0, Ht - .05, 0, G); box(Wd + .04, .04, L + .04, M.gold, 0, Ht, 0, G);
  for (const [a, b] of UTB_CORNERS) box(.05, Ht - .05, .05, M.gold, a * (Wd / 2 - .04), 0, b * (L / 2 - .04), G);
  box(Wd - .06, .07, L - .06, M.gold, 0, Ht * .45, 0, G);
  for (const sd of [-1, 1]) utbRod([sd * (Wd / 2 + .06), Ht * .45, -L / 2 - .35], [sd * (Wd / 2 + .06), Ht * .45, L / 2 + .35], .02, M.gold, G);
  for (const pz of [-.2, .2]) { for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(.15, .16, .045, 14), M.bread, 0, Ht + .045 + i * .05, pz, G).scale.set(.9, 1, 1.15);
    cyl(.035, .025, .05, 8, M.gold, 0, Ht + .045 + 6 * .05 + .02, pz, G); }
  for (const pz of [-.38, .38]) cyl(.05, .03, .08, 8, M.gold, .14, Ht + .04, pz, G);
  return y + Ht + .45; }

function upIncenseAltar(g, x, y, z) { const M = utbM(), G = utbGroup(g, x, y, z), s = UTB_C, h = 2 * UTB_C;
  box(s, h, s, M.gold, 0, 0, 0, G); box(s + .05, .05, s + .05, M.gold, 0, h, 0, G);
  for (const [a, b] of UTB_CORNERS) add(new THREE.ConeGeometry(.04, .1, 5), M.gold, a * (s / 2 - .04), h + .1, b * (s / 2 - .04), G);
  for (const sd of [-1, 1]) utbRod([-s / 2 - .4, h * .75, sd * (s / 2 + .05)], [s / 2 + .4, h * .75, sd * (s / 2 + .05)], .015, M.gold, G);
  cyl(.09, .06, .05, 10, M.coal, 0, h + .05, 0, G); return y + h + .2; }

function upBronzeAltar(g, x, y, z, o = {}) { const M = utbM(), G = utbGroup(g, x, y, z), s = 5 * UTB_C, h = 3 * UTB_C, r = upRng(4407);
  box(s, h, s, M.bronze, 0, 0, 0, G); box(s + .14, .12, s + .14, M.bronze, 0, h * .5, 0, G);
  for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) { const p = -s / 2 + .13 + i * (s - .26) / 8; box(.03, h * .48, .02, M.bronzeDk, p, .02, sd * (s / 2 + .02), G); box(.02, h * .48, .03, M.bronzeDk, sd * (s / 2 + .02), .02, p, G); }
  for (const [a, b] of UTB_CORNERS) { const hn = add(new THREE.ConeGeometry(.12, .32, 5), M.bronze, a * (s / 2 - .12), h + .16, b * (s / 2 - .12), G); hn.rotation.z = -a * .25; hn.rotation.x = b * .25; }
  for (const sd of [-1, 1]) { utbRod([-s / 2 - .9, h * .45, sd * (s / 2 + .1)], [s / 2 + .9, h * .45, sd * (s / 2 + .1)], .045, M.bronze, G);
    for (const a of [-.7, .7]) add(new THREE.TorusGeometry(.08, .02, 5, 10), M.bronze, a, h * .45, sd * (s / 2 + .1), G).rotation.y = Math.PI / 2; }
  box(s - .2, .06, s - .2, M.ash, 0, h, 0, G);
  for (let i = 0; i < 6; i++) { const lg = cyl(.07, .07, 1.1, 5, M.log, (r() - .5) * .8, h + .1 - .55, (r() - .5) * .8, G); lg.rotation.z = Math.PI / 2; lg.rotation.y = r() * 3; }
  if (o.fire !== false) { const f = makeFire(THREE, { scale: .55, light: false }); f.position.set(0, h + .05, 0); f.traverse(q => q.userData.dyn = 1); G.add(f); FIRES.push(f); }
  return y + h + 1.2; }

function upLaver(g, x, y, z) { const M = utbM(), G = utbGroup(g, x, y, z);
  cyl(.5, .58, .12, 16, M.bronze, 0, 0, 0, G); cyl(.14, .22, .45, 12, M.bronze, 0, .12, 0, G);
  add(new THREE.LatheGeometry([[0, 0], [.18, 0], [.42, .05], [.62, .22], [.68, .32], [.66, .34]].map(([a, b]) => new THREE.Vector2(a, b)), 20), M.bronzeS, 0, .55, 0, G);
  add(new THREE.CircleGeometry(.62, 20), M.water, 0, .83, 0, G).rotation.x = -Math.PI / 2; return y + .95; }

// a court pillar (5 cubits): bronze socket, silver hooks and fillet at the top, a length of fine twined linen hung from it to the next post
function upCourtPost(g, x, y, z, o = {}) { const M = utbM(), G = utbGroup(g, x, y, z), H = 5 * UTB_C, span = o.span ?? 5 * UTB_C;
  for (const px of span ? [0, span] : [0]) { box(.3, .2, .3, M.bronze, px, 0, 0, G); cyl(.08, .09, H, 8, mat('utbAcacia', '#a0703e', { map: TEX.wood }), px, .2, 0, G);
    cyl(.12, .1, .14, 8, M.silver, px, H + .12, 0, G);
    for (const sd of [-1, 1]) { utbRod([px, H + .1, 0], [px + sd * .35, 0, sd * .9], .008, M.cord, G); box(.04, .12, .04, M.bronzeDk, px + sd * .35, 0, sd * .9, G); } }   // guy cords to bronze pegs (Ex 27:19)
  if (span) { utbRod([0, H + .05, .08], [span, H + .05, .08], .015, M.silver, G);   // the silver fillet the linen hangs from
    const geo = new THREE.PlaneGeometry(span - .16, H - .1, 16, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * .025);   // soft folds
    geo.computeVertexNormals(); add(geo, M.linen, span / 2, (H - .1) / 2 + .25, .1, G); }
  return y + H + .3; }

{ const T = (id, label, tags, kind, fn) => defObject(id, fn, { label, origin: 'tabernacle', tags, kind });
  T('ark-of-the-covenant', 'Ark of the covenant', ['tabernacle', 'temple', 'gold', 'holy'], 'object', upArk);
  T('golden-lampstand', 'Golden lampstand (menorah)', ['tabernacle', 'temple', 'gold', 'light', 'revelation'], 'object', upLampstand);
  T('table-of-showbread', 'Table of showbread', ['tabernacle', 'temple', 'gold', 'bread'], 'object', upShowbread);
  T('altar-of-incense', 'Golden altar of incense', ['tabernacle', 'temple', 'gold', 'prayer'], 'object', upIncenseAltar);
  T('bronze-altar', 'Bronze altar of burnt offering', ['tabernacle', 'temple', 'bronze', 'sacrifice', 'fire'], 'structure', upBronzeAltar);
  T('bronze-laver', 'Bronze laver', ['tabernacle', 'temple', 'bronze', 'water', 'washing'], 'object', upLaver);
  T('court-post-hanging', 'Court pillars with linen hanging', ['tabernacle', 'court', 'linen', 'fence'], 'structure', upCourtPost); }
