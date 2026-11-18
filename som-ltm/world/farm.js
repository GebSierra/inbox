// ---------- Chapter 6: the Farm (som-ltm/PLAN.md §4) ----------
// A walled farmstead on the near-flat ground beyond the ridge's west end (tightened 2026-11-17 to give the village room). A lane runs from the upper gate (north, below the Watchtower)
// to the lower gate (south, above the beach), zigzagging between the rooms, which alternate east and west of it.
// A terrace wall with a gate crosses the farm below the Spring: house terraces above (6:1–20), field terraces below (6:21–34).
// Builders use the helpers of world/mount.js (roomFrame, atR, SQ, ground, somRock, finishRoom, the som* materials).
const basaltM = mat('somBasalt', '#6a625a'), plasterM = mat('somPlaster', '#e6dcc6'), mudM = mat('somMud', '#a88a62'), clothM = mat('somCloth', '#e8e0cc'),
  waterM = mat('somWater', '#4f8fa6'), willowM = mat('somWillow', '#7c9a52'), lentilM = mat('somLentil', '#6f8e3c'), herbM = mat('somHerb', '#7a8a4a');
basaltM.map = TEX.stone; basaltM.color.set('#8a827a'); plasterM.map = TEX.plaster; mudM.map = TEX.plaster; mudM.color.set('#c8a878'); clothM.map = TEX.cloth;
for (const m of [basaltM, plasterM, mudM, clothM]) m.needsUpdate = true;
const wallRun = (x0, z0, x1, z1, H, m = dryStone, W = .6) => { const L = Math.hypot(x1 - x0, z1 - z0), xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
  const b = box(L, H, W, m, xc, Math.min(heightAt(x0, z0), heightAt(x1, z1), heightAt(xc, zc)) - .15, zc); b.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return b; };
// a wall along a line with gaps [[from, to], ...] measured along it
const wallGaps = (x0, z0, x1, z1, H, gaps = []) => { const L = Math.hypot(x1 - x0, z1 - z0); let t = 0; const cuts = [...gaps].sort((a, b) => a[0] - b[0]);
  for (const [g0, g1] of [...cuts, [L, L]]) { if (g0 > t + .2) wallRun(x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L, x0 + (x1 - x0) * g0 / L, z0 + (z1 - z0) * g0 / L, H); t = g1; } };

// ---- the farm wall, its two gates, the terrace wall, the farmhouse (a tighter compound, 2026-11-17) ----
wallGaps(112, -6, 168, -6, 1.6, [[19, 25]]);          // north wall, the upper gate at x 131–137
wallGaps(112, -104, 168, -104, 1.6, [[25, 31]]);      // south wall, the lower gate at x 137–143
wallRun(112, -6, 112, -104, 1.6); wallRun(168, -6, 168, -104, 1.6);
wallGaps(112, -62, 168, -62, 1.1, [[44, 50]]);        // the terrace wall between the house and the fields, its gate at the west end, x 156–162 (2026-11-18)
for (const [x, z] of [[131, -6], [137, -6], [137, -104], [143, -104]]) box(.8, 2, .8, rockDk, x, heightAt(x, z) - .1, z);   // gate piers
// ---- the farmhouse (owner, 2026-11-18; PLAN §4): one house you walk through. Rooms on the east and west sides of an open central court,
// a flat earth roof over the rooms (hidden from the bird's-eye view), a cistern court behind. The room builders below stand inside it.
const HOUSE_ROOFS = [];
{ const pw = (x0, z0, x1, z1, H, gaps = [], m = plasterM, W = .5) => { const L = Math.hypot(x1 - x0, z1 - z0); let t = 0;
    for (const [g0, g1] of [...gaps, [L, L]]) { if (g0 > t + .2) { const a = t / L, b = g0 / L, xa = x0 + (x1 - x0) * a, za = z0 + (z1 - z0) * a, xb = x0 + (x1 - x0) * b, zb = z0 + (z1 - z0) * b, l = Math.hypot(xb - xa, zb - za), xc = (xa + xb) / 2, zc = (za + zb) / 2;
      const w = box(l, H, W, m, xc, Math.min(heightAt(xa, za), heightAt(xb, zb)) - .2, zc); w.rotation.y = -Math.atan2(zb - za, xb - xa); } t = g1; } };
  pw(118, -14, 150, -14, 3.2, [[12.4, 14.8]]);              // front wall, the front door at its east end (x 130.4–132.8)
  pw(118, -41, 150, -41, 3.2, [[15, 17.2], [22.8, 31.4]]); // back wall: the back door from the central court, the stall's open front
  pw(118, -14, 118, -41, 3.2);                              // east wall
  pw(150, -14, 150, -41, 3.2, [[16.8, 27]]);                // west wall, open along the stall (an ox stall needs no closed wall)
  pw(128, -14, 128, -41, 3.2, [[7, 13.4], [17.6, 24.4]]);   // the east rooms open onto the central court: storeroom and kitchen
  pw(140, -14, 140, -41, 3.2, [[5.5, 7.5]]);                // the sleeping room's door; the stall is closed on the court side
  pw(118, -29.5, 128, -29.5, 3.2); pw(140, -29.5, 150, -29.5, 3.2);
  pw(118, -41, 118, -56, 1.9, [], dryStone, .6); pw(150, -41, 150, -56, 1.9, [], dryStone, .6); pw(118, -56, 150, -56, 1.9, [], dryStone, .6);   // the cistern court's walls
  const earth = mat('somRoofEarth', '#b49a72'); earth.map = TEX.plaster;
  for (const [x0, z0, x1, z1] of [[118, -14, 128, -29.5], [118, -29.5, 128, -41], [140, -14, 150, -29.5]]) { const y = heightAt((x0 + x1) / 2, (z0 + z1) / 2) + 3; const rf = box(x1 - x0 + .6, .3, z0 - z1 + .6, earth, (x0 + x1) / 2, y, (z0 + z1) / 2); rf.castShadow = false; HOUSE_ROOFS.push(rf); }
  for (const [x, z] of [[123, -14], [145, -14]]) box(.9, .6, .1, darkM, x, heightAt(x, z) + 1.6, z + (z > -20 ? .26 : -.26));   // small windows
}

// the central court of the house is beaten earth, not grass; the entry passage is dim (room critic, 2026-11-18)
{ const earthF = mat('somBeatenEarth', '#8a7258'); earthF.map = TEX.plaster; box(11.6, .06, 26.6, earthF, 134, heightAt(134, -27.5) - .01, -27.5);
  const pf = mat('somPassageFloor', '#4a3c30'); box(4, .07, 4, pf, 131.6, heightAt(131.6, -16) - .005, -16);
  box(3.2, .45, .7, mat('somLintel', '#6e5236', { }), 131.6, heightAt(131.6, -14) + 2.5, -14);   // a timber lintel over the door
  for (let x = 118.4; x < 150; x += .9) { const b = box(.16, .16, .5, 'wood', x, heightAt(x, -14) + 2.95, -13.6); }   // roof-beam ends showing under the cornice
  const st = mat('somPlasterStain', '#b8a888', { transparent: true, opacity: .55 }); for (const [x, w, hh] of [[122, 2.2, .8], [126.5, 1.4, 1.2], [137.5, 2.6, .7], [143, 1.6, 1.0], [147.5, 2, .9]]) { const p = add(new THREE.PlaneGeometry(w, hh), st, x, heightAt(x, -14) + .55 + hh / 2, -13.73); p.rotation.y = Math.PI; }   // stains and patches low on the plaster
  box(.9, .7, .1, darkM, 139.5, heightAt(139.5, -14) + 1.7, -13.72); box(1.1, .1, .2, 'wood', 139.5, heightAt(139.5, -14) + 2.08, -13.7); }   // a small window
// ---- 6.1 THE COURTYARD (6:1–5): gate pier · curtained doorway · stair to the roof · roof-roller · cistern lid ----
defBuilder('som.court', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  // the paved court in front of the farmhouse; the house front is the farmhouse's north wall (f = 3.4), its door at s = -3.6 … -1.2
  const stoneT = mat('somCourtStone', '#a39a8a'); stoneT.map = TEX.stone;
  { const g = atR(F, 0, 0); box(2 * h + 2, .08, 2 * h + 2, paleM, 0, 0, 0, g); }                                      // the paving
  { const g = atR(F, -h, -h); box(.8, 1.9, .8, dryStone, 0, 0, 0, g); box(1, .18, 1, paleM, 0, 1.9, 0, g); out.push(ground(sp[0], 2.2)); }   // 1: the gate's left pier, squared, with its cap
  { for (const sd of [-1, 1]) { const g = atR(F, .4, sd * (h + 1.3)); box(.45, .9, 2 * h + 1.4, mudM, 0, 0, 0, g); } }   // low walls closing the court on either side
  // the house front: a cornice and parapet along the flat roof line, a footing course, a roofed entry passage behind the door
  { const g = atR(F, 3.4, 0); box(32.6, .22, .8, paleM, 2, 3.15, 0, g); box(32.6, .5, .3, plasterM, 2, 3.37, .25, g); box(32.6, .35, .62, dryStone, 2, -.05, 0, g); }
  { const [px, pz] = F.at(5.4, -2.4), y = heightAt(px, pz); const pr = box(4.4, .3, 4.2, mat('somRoofEarth', '#b49a72'), px, y + 3, pz); pr.castShadow = true; HOUSE_ROOFS.push(pr);
    for (const sd of [-3.7, -1.1]) { const [wx, wz] = F.at(5.4, sd); const w = box(.3, 3, 4, plasterM, wx, heightAt(wx, wz) - .1, wz); w.rotation.y = F.yaw; } }   // the dim entry passage you see through the door
  { const g = atR(F, 3.25, -2.4); const cur = mat('somCurtain', '#a8523a'); cur.map = TEX.cloth; box(.55, 2.05, .05, cur, .9, .05, 0, g); for (let k = 0; k < 4; k++) box(.12, 2.05, .07, cur, -1.05 + k * .08, .05, .05, g).rotation.y = k * .2; cyl(.025, .025, 2.6, 5, 'wood', 0, 2.15, 0, g).rotation.z = Math.PI / 2; box(.12, .08, .1, mat('somCord', '#c8b48a'), -.9, 1.1, .02, g);
    out.push(ground(F.at(3.0, -2.4), 1.2)); }   // 2: the doorway, its curtain half drawn and tied back on one side
  { const n = 10; for (let k = 0; k < n; k++) { const [x, z] = F.at(2.95, 1.0 + k * .34); const st = box(.34, .3 * (k + 1), .85, stoneT, x, heightAt(x, z) - .02, z); st.rotation.y = F.yaw + Math.PI / 2; }
    const [x2, z2] = F.at(2.95, 1.0 + n * .34 + .3); out.push(ground(F.at(2.95, 2.6), 1.7)); }   // 3: the stone stair rising along the house front to the flat roof
  { const g = atR(F, -h, h, .2); const rm = mat('somRollerStone', '#8e877c'); rm.map = TEX.stone; rm.color.set('#c4beb2'); const c = cyl(.32, .32, 1.15, 14, rm, 0, .32, 0, g); c.rotation.z = Math.PI / 2; c.position.y = .32;
    for (const sd of [-1, 1]) { const pin = cyl(.045, .045, .2, 6, 'wood', sd * .66, .32, 0, g); pin.rotation.z = Math.PI / 2; pin.position.y = .32; } out.push(ground(sp[3], .68)); }   // 4: the stone roof-roller with its wooden handle frame
  { const g = atR(F, 0, 0, Math.PI / 2); const rough = mat('somMangerStone', '#9c9282'); rough.map = TEX.stone; box(2.0, .3, 1.0, rough, 0, 0, 0, g); for (const sd of [-1, 1]) { box(2.0, .5, .2, rough, 0, .3, sd * .4, g); box(.2, .5, .6, rough, sd * .9, .3, 0, g); }   // a hollow trough cut from one stone, thick rough rims
    box(1.6, .02, .6, darkM, 0, .31, 0, g); for (let k = 0; k < 40; k++) box(R(.25, .55), .03, .035, strawM, R(-.7, .7), R(.34, .62), R(-.22, .22), g).rotation.set(R(-.3, .3), R(0, 3), 0);   // heaped with straw
    out.push({ x: F.x, z: F.z, y: F.y + .95 }); { const [bx, bz] = F.at(.2, -1.25); libAt('wooden-bucket', bx, bz, 0, 1); } }   // 5: a big carved stone manger with straw
  { const [x, z] = F.at(.3, -h - .4); libAt('grey-donkey', x, z, F.yaw + Math.PI / 2, 1); const [tx, tz] = F.at(-.8, -h - .8); cyl(.06, .07, 1.1, 6, 'wood', tx, heightAt(tx, tz), tz); add(new THREE.TorusGeometry(.07, .015, 4, 8), ironM, tx, heightAt(tx, tz) + 1, tz); }   // the donkey tied to a post by the left wall
  for (const [f, s, id, sc] of [[2.7, -.2, 'big-jar', 1], [2.6, .35, 'big-jar', .85], [1.4, 3.3, 'water-pail', 1], [-.6, 3.4, 'flour-sack', 1], [2.4, 4.4, 'fig-tree', .8]]) { const [x, z] = F.at(f, s); libAt(id, x, z, R(0, 6), sc); }   // jars by the door, a sack, a basket, a fig tree in the corner
  { const [x, z] = F.at(.5, 3.55); const b = box(1.8, .45, .45, stoneT, x, heightAt(x, z), z); b.rotation.y = F.yaw + Math.PI / 2; }   // a stone bench against the right wall
  for (let k = 0; k < 12; k++) { const [x, z] = F.at(R(-.6, .6), R(-1.3, 1.3)); box(R(.2, .5), .02, .03, strawM, x, heightAt(x, z) + .09, z).rotation.y = R(0, 3); }   // straw scattered round the manger
  finishRoom(ch, r, F, out); });

// ---- 6.2 THE INNER STOREROOM (6:6–10): open-fronted, cut into the terrace, its door swung back ----
// threshold · storage jars · dried herbs from a beam · plastered wall shelf · wooden chest
defBuilder('som.store', (r, { ch }) => { const F = roomFrame(r), h = 2.3, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, .4, 0, Math.PI);   // local +z = forward, +x = right
  // the storeroom is the whole north-east room of the house (owner, 2026-11-18): no walls of its own, the house walls are its walls
  box(.12, 2.3, 1.2, 'wood', 127.55, heightAt(127.55, -21.1), -21.1).rotation.y = .5;   // the door, swung back against the wall left of the doorway
  out.push(ground([127.2, -21.5], 1.3));   // 1: the door
  { box(10, .06, 15.5, plasterM, 123, heightAt(123, -21.75) - .02, -21.75); }   // the plastered floor                        // the threshold
  { const pts = [[0, 0], [.18, .05], [.3, .4], [.32, .8], [.24, 1.15], [.12, 1.25], [.14, 1.35]].map(([a, b]) => new THREE.Vector2(a, b)); for (let k = 0; k < 4; k++) { const [jx, jz] = F.at(h + .9, -h - .4 + k * .62); add(new THREE.LatheGeometry(pts, 12), clayM, jx, heightAt(jx, jz), jz); } out.push(ground(sp[1], 1.55)); }   // a row of four tall clay storage jars   // the row of tall storage jars
  { const [x, z] = sp[2]; out.push({ x, z, y: libAt('herb-rack', x, z, F.yaw, 1) }); }   // the rack of dried herbs
  { const s2 = atR(F, -h, h + .8); box(1.8, .12, .55, plasterM, 0, 1.1, 0, s2); for (const [a, b] of [[-.55, 0], [-.15, .05], [.35, 0]]) cyl(.1, .13, .26, 10, clayM, a, 1.22, b, s2); out.push(ground(F.at(-h, h + .6), 1.4)); }   // the plastered shelf on the wall, small pots on it                    // the plastered wall shelf
  { out.push({ x: F.x, z: F.z, y: libAt('big-chest', F.x, F.z, F.yaw + .1, 1) }); }   // the wooden chest
  finishRoom(ch, r, F, out); });

// ---- 6.3 THE BAKEHOUSE YARD (6:11–15): sieve on its hook · woodpile · clay oven · smoke-stained corner · kneading bowl ----
defBuilder('som.bake', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); cyl(.07, .08, 1.9, 6, 'wood', 0, 0, 0, g); box(.3, .05, .05, 'wood', 0, 1.6, .12, g); const rim = add(new THREE.TorusGeometry(.26, .045, 6, 18), 'woodLt', 0, 1.3, .2, g); const mesh = cyl(.24, .24, .02, 16, mat('somMesh', '#d8c08a'), 0, 1.3, .24, g); mesh.material.map = TEX.wicker; mesh.rotation.x = Math.PI / 2; out.push(ground(sp[0], 1.95)); }   // the sieve, rim and mesh, hung on its post
  { const g = atR(F, h + 1.4, 0); box(2 * h + 3, 1, .45, mudM, 0, 0, 0, g); const g2 = atR(F, 0, -h - 1.4); box(.45, 1, 2 * h + 3, mudM, 0, 0, 0, g2); }   // low mud-brick yard walls
  { const g = atR(F, h, -h); for (let row = 0; row < 3; row++) for (let k = 0; k < 5 - row; k++) { const l = cyl(.11, .11, 1.3, 6, 'wood', -.5 + k * .24 + row * .12, .11 + row * .2, 0, g); l.rotation.x = Math.PI / 2; l.position.y = .11 + row * .2; } out.push(ground(sp[1], .75)); }   // the woodpile
  { const [x, z] = sp[2], y = heightAt(x, z); const oy = libAt('bread-oven', x, z, F.yaw, 1.35);
    for (let k = 0; k < 4; k++) { const [lx, lz] = F.at(h - 1.1, h - .4 + k * .3); cyl(.17, .17, .05, 10, mat('somLoaf', '#c8964e'), lx, heightAt(lx, lz) + .02, lz); } out.push({ x, z, y: oy }); }   // the clay oven, loaves cooling beside it
  { const g = atR(F, -h - .3, h + .3); box(.45, 1.1, 1.6, mudM, -.2, 0, .5, g); box(1.6, 1.1, .45, mudM, -.5, 0, .2, g); box(1.2, 1.1, .02, darkM, -.4, .02, -.03, g); box(.02, 1.1, 1.2, darkM, .03, .02, .2, g); out.push(ground(sp[3], .2)); }   // the yard's corner, blackened with smoke
  { const g = atR(F, 0, 0); for (const [a, b] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) cyl(.05, .05, .4, 5, 'wood', a, 0, b, g); box(.85, .06, .85, 'woodLt', 0, .4, 0, g); cyl(.58, .36, .3, 18, clayM, 0, .45, 0, g); add(new THREE.CircleGeometry(.5, 18), mat('somDough', '#efe2c4'), 0, .72, 0, g).rotation.x = -Math.PI / 2; const cl = box(.9, .02, .5, clothM, .25, .76, .15, g); cl.rotation.z = -.25; out.push({ x: F.x, z: F.z, y: F.y + .9 }); }   // the wide kneading bowl, dough and a cloth
  finishRoom(ch, r, F, out); });

// ---- 6.4 THE SPRING (6:16–20): spout · oil flask on a ledge (v) · wash-line · willow · flat stones across the outflow ----
defBuilder('som.spring', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.1, 0); box(2 * h + 4, 2.4, 1.0, plasterM, 0, -.2, 0, g); box(2 * h + 4, .14, 1.1, paleM, 0, 2.2, 0, g); }   // the plastered back of the cistern court, the cistern's spout set in it
  { const g = atR(F, -h, -h); box(1.1, 1.4, .7, rockM, 0, 0, -.3, g); const sp2 = box(.3, .16, .7, paleM, 0, 1.05, .2, g); add(new THREE.CircleGeometry(.08, 8), darkM, 0, 1.05, .56, g); const fallW = cyl(.06, .1, 1.05, 8, mat('somFall', '#9fd0e0', { transparent: true, opacity: .8 }), 0, 0, .58, g); add(new THREE.CircleGeometry(.4, 14), mat('somWater', '#6fb3c8'), 0, .03, .6, g).rotation.x = -Math.PI / 2; out.push(ground(sp[0], 1.4)); }   // the stone spout, water falling from it into a little pool
  { const g = atR(F, h, -h); box(1.2, 1, .7, rockM, 0, 0, 0, g); const fl = add(new THREE.SphereGeometry(.2, 10, 8), mat('somFlask', '#d9c27a'), 0, 1.2, 0, g); fl.scale.y = 1.45; cyl(.05, .07, .22, 8, mat('somFlask', '#d9c27a'), 0, 1.5, 0, g); cyl(.06, .06, .05, 8, 'wood', 0, 1.62, 0, g); out.push(ground(sp[1], 1.75)); }   // the flask of oil on its ledge of rock
  { const [x, z] = sp[2]; out.push({ x, z, y: libAt('laundry-rack', x, z, F.yaw, 1) }); }   // the wash-line with a tunic drying
  { const [fx, fz] = F.at(-h + .2, h + .9); libAt('fig-tree', fx, fz, 0, .9); out.push(ground(sp[3], .6)); }   // 4: a fig tree shading the court
  if (0) { const [x, z] = F.at(-h + .2, h + .6); const y = heightAt(x, z); for (let k = 0; k < 14; k++) { const [rx, rz] = F.at(R(-1.5, 1.5), R(-.9, -.5)); const rd = cyl(.012, .02, R(.6, 1), 3, willowM, rx, heightAt(rx, rz), rz); rd.rotation.z = R(-.2, .2); } const tr = cyl(.14, .22, 1.8, 7, 'wood', x, y, z); tr.rotation.z = .12; for (let k = 0; k < 26; k++) { const a = k / 26 * 6.28, rr = R(.4, 1.2); const fr = add(new THREE.CylinderGeometry(.015, .05, R(1.2, 1.9), 3), willowM, x + Math.cos(a) * rr, y + R(1.3, 1.9), z + Math.sin(a) * rr); fr.rotation.set(Math.sin(a) * .15, 0, -Math.cos(a) * .15); } out.push(ground(sp[3], .6)); }   // the willow on the bank, its thin fronds hanging
  { cyl(.85, .9, .4, 16, dryStone, F.x, F.y, F.z); cyl(.72, .72, .12, 16, paleM, F.x, F.y + .4, F.z); { const [bx, bz] = F.at(.3, .95); libAt('wooden-bucket', bx, bz, 0, 1); } out.push({ x: F.x, z: F.z, y: F.y + .555 }); }   // 5: the cistern mouth and its round stone lid
  { const [x, z] = F.at(-.8, -h + .6); box(.9, .03, .5, clothM, x, heightAt(x, z) + .02, z); }   // a linen towel spread on the rocks
  finishRoom(ch, r, F, out); });

// ---- 6.5 THE OX STALL (6:21–25): left stall post · yoke on its peg · plough · straw bedding · the roof pillar with its feeding niche ----
defBuilder('som.stall', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, 0, 0, Math.PI);
  box(.4, 2.6, 2 * h + 1.8, dryStone, -h - .9, 0, .2, g);   // the west (outside) wall left open box(2 * h + 2.2, 2.6, .4, dryStone, 0, 0, h + 1, g);   // three walls, open front
  for (let k = -2; k <= 2; k++) box(.2, .2, 2 * h + 2.4, 'wood', k * 1.4, 2.6, .2, g);   // open roof beams, so the stall is lit
  { const s2 = atR(F, -h, -h); box(.35, 2.6, .35, 'wood', 0, 0, 0, s2); out.push(ground(sp[0], 1.4)); }                     // the left stall post
  out.push(somAt(F, F.at(h + .55, -h + .2), 'som-yoke-on-peg', 0, .85)); out[out.length - 1].y -= .3;   // 2: the yoke on its peg (workshop model)
  { const s2 = atR(F, h, h, .3); const b = box(.16, .16, 2.3, 'woodLt', 0, .55, 0, s2); b.rotation.x = .3; const sh = box(.14, .55, .45, ironM, 0, .05, 1.05, s2); sh.rotation.x = -.5; const hn = box(.1, .9, .1, 'woodLt', 0, .55, -1.05, s2); hn.rotation.x = -.4; box(.5, .08, .08, 'woodLt', 0, 1.0, -1.2, s2); out.push(ground(sp[2], .85)); }   // the plough
  { const [x, z] = sp[3]; for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(R(.3, .45), 0), strawM, x + R(-.5, .5), heightAt(x, z) + R(0, .3), z + R(-.5, .5)).scale.y = .5; out.push(ground(sp[3], .55)); }   // straw bedding
  { box(.7, 2.6, .7, dryStone, F.x, F.y, F.z); const [nx, nz] = F.at(-.36, 0); const nb = box(.75, .6, .12, darkM, nx - F.fx * .01, F.y + .8, nz - F.fz * .01); nb.rotation.y = F.yaw; const n = box(.6, .35, .16, strawM, nx - F.fx * .06, F.y + .75, nz - F.fz * .06); n.rotation.y = F.yaw; out.push({ x: F.x, z: F.z, y: F.y + 2.85 }); }   // the roof pillar, its feeding niche filled with fodder
  { const [x, z] = F.at(1.6, 1.4); libAt('ox-grazing', x, z, F.yaw - Math.PI / 2, .85); }   // the ox
  finishRoom(ch, r, F, out); });

// ---- 6.6 THE GRANARY FIELD (6:26–30): terrace steps · lentils · scarecrow · granary door · hoe in the furrow ----
defBuilder('som.granary', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h, .3); const st = box(.45, 1.0, .3, rockM, 0, -.1, 0, g); st.rotation.z = .06; box(.47, .12, .32, paleM, 0, .86, 0, g); out.push(ground(sp[0], 1.0)); }   // 1: the boundary stone at the field's corner, its top whitened (the steps are gone, owner 2026-11-18)
  { const [x, z] = sp[1]; libAt('garden-plot', x, z, F.yaw, .8); out.push(ground(sp[1], .35)); }   // the patch of lentils
  { const g = atR(F, h, h); cyl(.05, .05, 2.2, 5, 'wood', 0, 0, 0, g); box(1.3, .06, .06, 'wood', 0, 1.6, 0, g); const rag = mat('somRag', '#9a6a4a'); rag.map = TEX.cloth; box(.7, .9, .22, rag, 0, 1.0, 0, g); for (const sd of [-1, 1]) box(.35, .5, .05, rag, sd * .55, 1.2, .1, g); add(new THREE.SphereGeometry(.2, 8, 6), strawM, 0, 2.05, 0, g); add(new THREE.ConeGeometry(.3, .25, 8), strawM, 0, 2.3, 0, g); out.push(ground(sp[2], .5)); }   // the scarecrow
  { const g = atR(F, -h + .9, h + 1.5, -Math.PI / 2); g.scale.setScalar(.8); box(2.6, 2.6, 2.6, dryStone, 0, 0, 0, g); add(new THREE.SphereGeometry(1.35, 10, 6, 0, 6.3, 0, 1.57), mudM, 0, 2.6, 0, g).scale.y = .7; box(.9, 1.6, .1, 'wood', 0, 0, 1.33, g); box(1.1, .12, .2, 'woodLt', 0, 1.6, 1.36, g); out.push(ground(F.at(-h + .9, h + .6), .15)); }   // the stone granary, its door facing the field
  { for (let k = -2; k <= 2; k++) { const [x, z] = F.at(k * .6, 0); const fr = box(.25, .1, 3.2, mudM, x, heightAt(x, z) - .02, z); fr.rotation.y = F.yaw; }
    const [x, z] = F.at(0, .3); const hd = cyl(.05, .05, 1.8, 6, 'woodLt', x, heightAt(x, z) + .14, z); hd.rotation.set(0, F.yaw, .9); hd.position.y += .6; const [bx2, bz2] = F.at(0, 1.2); const bl = box(.1, .4, .36, ironM, bx2, heightAt(bx2, bz2) + .02, bz2); bl.rotation.y = F.yaw; out.push({ x: F.x, z: F.z, y: F.y + .3 }); }   // furrows and the hoe
  finishRoom(ch, r, F, out); });

// ---- 6.7 THE OLIVE PRESS (6:31–34): crushing stone · press beam in its wall socket · rope pulp-baskets · oil collecting pit ----
defBuilder('som.press', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.3, 0); box(2 * h + 3, 2.4, .7, dryStone, 0, 0, 0, g); }                                     // the back wall that holds the beam
  { const [x, z] = sp[0], y = heightAt(x, z); cyl(1.05, 1.1, .5, 18, rockM, x, y, z); cyl(.85, .85, .06, 18, mat('somOil', '#6a5a2a'), x, y + .47, z); cyl(.12, .12, 1.4, 8, 'wood', x, y + .5, z); const st = cyl(.62, .62, .32, 18, paleM, x + .4, y + 1.1, z); st.rotation.z = Math.PI / 2; const ax = box(1.8, .12, .12, 'wood', x + .4, y + 1.05, z); out.push({ x, z, y: y + 1.9 }); }   // the crushing stone: an upright millstone in its round stone bed
  { const g = atR(F, h + .9, -h); box(.9, .9, .3, paleM, 0, .9, 0, g); box(.4, .4, .32, darkM, 0, 1.15, .01, g); const bm = box(.28, .28, 4.4, 'wood', 0, 1.0, 2.1, g); bm.rotation.x = .1; box(.6, .5, .6, rockM, 0, 0, 4.2, g); out.push(ground(F.at(h + .45, -h), 1.55)); }   // the press beam running out of its socket in the wall, a weight stone at its end
  { const [x, z] = sp[2]; const bm2 = mat('somRopeB', '#b08a52'); bm2.map = TEX.wicker; for (let k = 0; k < 5; k++) cyl(.5, .5, .16, 16, bm2, x + R(-.04, .04), heightAt(x, z) + k * .17, z); out.push(ground(sp[2], .95)); }   // a stack of woven rope pulp-baskets
  { const [x, z] = sp[3], y = heightAt(x, z); cyl(.65, .65, .12, 14, rockM, x, y, z); add(new THREE.CircleGeometry(.45, 12), darkM, x, y + .13, z).rotation.x = -Math.PI / 2; out.push({ x, z, y: y + .2 }); }   // the oil collecting pit
  finishRoom(ch, r, F, out); });

buildRooms(2);
VIA['2.1'] = [[104, 2], [110, 0], [122, -3], [130, -3]];             // from the Watchtower down to the farm's upper gate
VIA['2.2'] = [[134, -8], [132, -12], [131.6, -15], [131.5, -19], [130, -23]];   // through the front door, then left into the storeroom
VIA['2.3'] = [[131, -26], [131, -32], [129, -35]];                    // back out to the central court, along to the kitchen
VIA['2.4'] = [[131, -37], [134, -39], [134, -41.5]];                  // out of the back door into the cistern court
VIA['2.5'] = [[138, -44], [143, -44]];                                // across the cistern court to the stall
VIA['2.6'] = [[145, -38.5], [146, -35], [149.5, -34.5], [154, -36], [160, -46], [160, -62], [154, -72]];   // through the stall, out of its open side, down through the terrace gate
zoneLabel(6, 'The Farm', 134, -8);
