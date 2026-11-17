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
wallGaps(112, -62, 168, -62, 1.1, [[26, 32]]);        // the terrace wall between the house and the fields, its gate at x 138–144
for (const [x, z] of [[131, -6], [137, -6], [137, -104], [143, -104]]) box(.8, 2, .8, rockDk, x, heightAt(x, z) - .1, z);   // gate piers
libAt('plaster-house-two-storey', 115.5, -16, Math.PI / 2, .9);   // the farmhouse behind the courtyard
// ---- 6.1 THE COURTYARD (6:1–5): gate pier · curtained doorway · stair to the roof · roof-roller · cistern lid ----
defBuilder('som.court', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, 0, 0); box(2 * h + 2, .08, 2 * h + 2, paleM, 0, 0, 0, g); }                                      // the paving
  { const g = atR(F, -h, -h); box(.8, 1.9, .8, dryStone, 0, 0, 0, g); box(1, .18, 1, paleM, 0, 1.9, 0, g); out.push(ground(sp[0], 2.2)); }   // the gate's left pier, squared, with its cap
  { for (const sd of [-1, 1]) { const g = atR(F, .4, sd * (h + 1.3)); box(.45, .9, 2 * h + 1.4, mudM, 0, 0, 0, g); } }   // low walls closing the court on either side
  { const g = atR(F, h + .8, -h + .2); box(3.4, 2.7, .3, plasterM, 0, 0, -.2, g); box(1.2, 2.1, .32, darkM, 0, 0, -.18, g); box(1.1, 2, .06, mat('somCurtain', '#9a4a36'), 0, .05, 0, g); box(1.6, .22, .36, 'wood', 0, 2.1, -.15, g); out.push(ground(F.at(h + .45, -h + .2), .25)); }   // the doorway into the house, its curtain hanging
  { const g = atR(F, h + .2, h); for (let k = 0; k < 6; k++) box(1, .3 * (k + 1), .55, dryStone, 0, 0, .5 - k * .55, g); out.push(ground(F.at(h + .2, h), 1.15)); }   // the stair up to the roof
  { const g = atR(F, -h, h); const c = cyl(.28, .28, 1.2, 10, rockM, 0, .28, 0, g); c.rotation.z = Math.PI / 2; c.position.y = .28; out.push(ground(sp[3], .62)); }   // the roof-roller
  { cyl(.6, .6, .3, 14, dryStone, F.x, F.y, F.z); cyl(.5, .5, .1, 14, rockDk, F.x, F.y + .3, F.z); out.push({ x: F.x, z: F.z, y: F.y + .45 }); }   // the cistern mouth and its lid
  { const [x, z] = F.at(-h - 1.2, -h - 2.4); libAt('grey-donkey', x, z, F.yaw + 1.2); }   // the donkey by the gate
  finishRoom(ch, r, F, out); });

// ---- 6.2 THE INNER STOREROOM (6:6–10): open-fronted, cut into the terrace, its door swung back ----
// threshold · storage jars · dried herbs from a beam · plastered wall shelf · wooden chest
defBuilder('som.store', (r, { ch }) => { const F = roomFrame(r), h = 2.3, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, .4, 0, Math.PI);   // local +z = forward, +x = right
  box(.4, 3, 2 * h + 2.2, plasterM, -h - 1, 0, 0, g); box(.4, 3, 2 * h + 2.2, plasterM, h + 1, 0, 0, g); box(2 * h + 2.4, 3, .4, plasterM, 0, 0, h + 1.2, g);   // walls
  box(2 * h + 2.4, .3, 2 * h + 2.6, 'wood', 0, 3, .1, g);                                                                 // the roof
  box(.12, 2.3, 1.2, 'wood', -h - .7, 0, -h + .1, g).rotation.y = .15;                                                    // the door, swung back against the left wall
  { const s2 = atR(F, -h, -h); box(1.4, .1, .8, paleM, 0, 0, 0, s2); out.push(ground(sp[0], .2)); }                        // the threshold
  { const [x, z] = sp[1]; out.push({ x, z, y: libAt('jar-rack', x, z, F.yaw, 1) }); }   // the row of tall storage jars
  { const [x, z] = sp[2]; out.push({ x, z, y: libAt('herb-rack', x, z, F.yaw, 1) }); }   // the rack of dried herbs
  { const s2 = atR(F, -h, h); box(1.6, .9, .6, plasterM, 0, 0, 0, s2); out.push(ground(sp[3], 1.05)); }                    // the plastered wall shelf
  { out.push({ x: F.x, z: F.z, y: libAt('big-chest', F.x, F.z, F.yaw + .1, 1) }); }   // the wooden chest
  finishRoom(ch, r, F, out); });

// ---- 6.3 THE BAKEHOUSE YARD (6:11–15): sieve on its hook · woodpile · clay oven · smoke-stained corner · kneading bowl ----
defBuilder('som.bake', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); cyl(.07, .08, 1.9, 6, 'wood', 0, 0, 0, g); box(.3, .05, .05, 'wood', 0, 1.6, .12, g); const rim = add(new THREE.TorusGeometry(.34, .05, 6, 18), 'woodLt', 0, 1.3, .24, g); const mesh = cyl(.32, .32, .02, 16, mat('somMesh', '#d8c08a'), 0, 1.3, .24, g); mesh.material.map = TEX.wicker; mesh.rotation.x = Math.PI / 2; out.push(ground(sp[0], 1.95)); }   // the sieve, rim and mesh, hung on its post
  { const g = atR(F, h + 1.4, 0); box(2 * h + 3, 1, .45, mudM, 0, 0, 0, g); const g2 = atR(F, 0, -h - 1.4); box(.45, 1, 2 * h + 3, mudM, 0, 0, 0, g2); }   // low mud-brick yard walls
  { const g = atR(F, h, -h); for (let row = 0; row < 3; row++) for (let k = 0; k < 5 - row; k++) { const l = cyl(.11, .11, 1.3, 6, 'wood', -.5 + k * .24 + row * .12, .11 + row * .2, 0, g); l.rotation.x = Math.PI / 2; l.position.y = .11 + row * .2; } out.push(ground(sp[1], .75)); }   // the woodpile
  { const [x, z] = sp[2], y = heightAt(x, z); const oy = libAt('bread-oven', x, z, F.yaw, 1);
    for (let k = 0; k < 4; k++) { const [lx, lz] = F.at(h - 1.1, h - .4 + k * .3); cyl(.17, .17, .05, 10, mat('somLoaf', '#c8964e'), lx, heightAt(lx, lz) + .02, lz); } out.push({ x, z, y: oy }); }   // the clay oven, loaves cooling beside it
  { const g = atR(F, -h - .3, h + .3); box(.45, 1.1, 1.6, mudM, -.2, 0, .5, g); box(1.6, 1.1, .45, mudM, -.5, 0, .2, g); box(.9, 1.05, .02, darkM, -.4, .02, -.03, g); box(.02, 1.05, .9, darkM, .03, .02, .2, g); out.push(ground(sp[3], .2)); }   // the yard's corner, blackened with smoke
  { const g = atR(F, 0, 0); box(.8, .45, .8, rockM, 0, 0, 0, g); cyl(.58, .36, .3, 18, clayM, 0, .45, 0, g); add(new THREE.CircleGeometry(.5, 18), mat('somDough', '#efe2c4'), 0, .72, 0, g).rotation.x = -Math.PI / 2; const cl = box(.9, .02, .5, clothM, .25, .76, .15, g); cl.rotation.z = -.25; out.push({ x: F.x, z: F.z, y: F.y + .9 }); }   // the wide kneading bowl, dough and a cloth
  finishRoom(ch, r, F, out); });

// ---- 6.4 THE SPRING (6:16–20): spout · oil flask on a ledge (v) · wash-line · willow · flat stones across the outflow ----
defBuilder('som.spring', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.1, 0); box(2 * h + 4, 3.2, 1.4, rockM, 0, -.4, 0, g); }   // the rock face the spring comes out of
  { const g = atR(F, -h, -h); box(.7, 1.2, .6, paleM, 0, 0, 0, g); const p2 = cyl(.07, .07, .5, 8, mat('somBronze', '#8a6a3a'), 0, .95, .3, g); p2.rotation.x = Math.PI / 2; cyl(.04, .04, .9, 6, mat('somWater', '#6fb3c8'), 0, .1, .55, g); out.push(ground(sp[0], 1.35)); }   // the spout: a carved stone, a pipe, the water falling
  { const g = atR(F, h, -h); box(1.1, .9, .6, rockM, 0, 0, 0, g); const fl = add(new THREE.SphereGeometry(.12, 8, 6), mat('somFlask', '#d9c27a'), 0, 1.02, 0, g); fl.scale.y = 1.5; cyl(.03, .04, .14, 6, mat('somFlask', '#d9c27a'), 0, 1.18, 0, g); out.push(ground(sp[1], 1.35)); }   // flask of oil on a ledge of rock
  { const [x, z] = sp[2]; out.push({ x, z, y: libAt('laundry-rack', x, z, F.yaw, 1) }); }   // the wash-line with a tunic drying
  { const [x, z] = F.at(-h - .9, h + 1.1); tree(x, z, 1.1); for (let k = 0; k < 14; k++) { const fr = add(new THREE.CylinderGeometry(.02, .12, 1.6, 4), willowM, x + R(-1.2, 1.2), heightAt(x, z) + R(1.6, 2.6), z + R(-1.2, 1.2)); fr.rotation.z = R(-.15, .15); } out.push(ground(sp[3], .6)); }   // the willow, its fronds hanging
  { const m = add(new THREE.PlaneGeometry(1.3, 2 * h + 4), waterM, 0, 0, 0); m.rotation.x = -Math.PI / 2; m.rotation.z = -F.yaw + Math.PI / 2; m.position.set(F.x, F.y + .04, F.z);
    for (let k = -1; k <= 1; k++) { const [x, z] = F.at(k * .9, k * .25); const st = box(.6, .16, .55, paleM, x, F.y, z); st.rotation.y = F.yaw + k * .4; } out.push({ x: F.x, z: F.z, y: F.y + .3 }); }   // the outflow and its flat stones
  { const [x, z] = F.at(-.8, -h + .6); box(.9, .03, .5, clothM, x, heightAt(x, z) + .02, z); }   // a linen towel spread on the rocks
  finishRoom(ch, r, F, out); });

// ---- 6.5 THE OX STALL (6:21–25): left stall post · yoke on its peg · plough · straw bedding · the roof pillar with its feeding niche ----
defBuilder('som.stall', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, 0, 0, Math.PI);
  box(.4, 2.6, 2 * h + 1.8, dryStone, -h - .9, 0, .2, g); box(.4, 2.6, 2 * h + 1.8, dryStone, h + .9, 0, .2, g); box(2 * h + 2.2, 2.6, .4, dryStone, 0, 0, h + 1, g);   // three walls, open front
  for (let k = -2; k <= 2; k++) box(.2, .2, 2 * h + 2.4, 'wood', k * 1.4, 2.6, .2, g);   // open roof beams, so the stall is lit
  { const s2 = atR(F, -h, -h); box(.35, 2.6, .35, 'wood', 0, 0, 0, s2); out.push(ground(sp[0], 1.4)); }                     // the left stall post
  { const s2 = atR(F, h + .7, -h); box(.1, .1, .35, 'wood', 0, 1.7, 0, s2); box(1.9, .18, .18, 'woodLt', 0, 1.72, -.22, s2); for (const s3 of [-.6, .6]) { const u = add(new THREE.TorusGeometry(.22, .05, 5, 10, Math.PI), 'wood', s3, 1.5, -.22, s2); u.rotation.z = Math.PI; } box(.6, 1.3, .45, dryStone, 0, 0, -.2, s2); out.push(ground(F.at(h + .7, -h), 1.4)); }   // the yoke, made for two, on its peg
  { const s2 = atR(F, h, h, .3); const b = box(.12, .12, 2, 'wood', 0, .5, 0, s2); b.rotation.x = .25; box(.08, .5, .3, ironM, 0, .05, .9, s2); box(.6, .08, .08, 'wood', 0, .9, -.8, s2); out.push(ground(sp[2], .85)); }   // the plough
  { const [x, z] = sp[3]; for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(R(.3, .45), 0), strawM, x + R(-.5, .5), heightAt(x, z) + R(0, .3), z + R(-.5, .5)).scale.y = .5; out.push(ground(sp[3], .55)); }   // straw bedding
  { box(.7, 2.6, .7, dryStone, F.x, F.y, F.z); const [nx, nz] = F.at(-.36, 0); const n = box(.6, .45, .2, strawM, nx, F.y + .8, nz); n.rotation.y = F.yaw; out.push({ x: F.x, z: F.z, y: F.y + 2.85 }); }   // the roof pillar, its feeding niche filled with fodder
  { const [x, z] = F.at(1.3, -1.5); libAt('ox-grazing', x, z, F.yaw + .5, .85); }   // the ox
  finishRoom(ch, r, F, out); });

// ---- 6.6 THE GRANARY FIELD (6:26–30): terrace steps · lentils · scarecrow · granary door · hoe in the furrow ----
defBuilder('som.granary', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); for (let k = 0; k < 3; k++) box(1.2, .2 * (k + 1), .5, dryStone, 0, 0, -k * .5, g); out.push(ground(sp[0], .7)); }   // the terrace steps
  { const [x, z] = sp[1]; libAt('garden-plot', x, z, F.yaw, .8); out.push(ground(sp[1], .35)); }   // the patch of lentils
  { const g = atR(F, h, h); cyl(.05, .05, 2.2, 5, 'wood', 0, 0, 0, g); box(1.3, .06, .06, 'wood', 0, 1.6, 0, g); box(.6, .8, .2, mat('somRag', '#8a6a4a'), 0, 1.1, 0, g); add(new THREE.SphereGeometry(.17, 8, 6), strawM, 0, 2.05, 0, g); out.push(ground(sp[2], .5)); }   // the scarecrow
  { const g = atR(F, -h + .9, h + 2.1, -Math.PI / 2); box(2.6, 2.6, 2.6, dryStone, 0, 0, 0, g); add(new THREE.SphereGeometry(1.35, 10, 6, 0, 6.3, 0, 1.57), mudM, 0, 2.6, 0, g).scale.y = .7; box(.9, 1.6, .1, 'wood', 0, 0, 1.33, g); box(1.1, .12, .2, 'woodLt', 0, 1.6, 1.36, g); out.push(ground(F.at(-h + .9, h + .6), .15)); }   // the stone granary, its door facing the field
  { for (let k = -2; k <= 2; k++) { const [x, z] = F.at(k * .6, 0); const fr = box(.25, .1, 3.2, mudM, x, heightAt(x, z) - .02, z); fr.rotation.y = F.yaw; }
    const [x, z] = F.at(0, .3); const hd = cyl(.035, .035, 1.4, 5, 'wood', x, heightAt(x, z) + .12, z); hd.rotation.set(0, F.yaw, Math.PI / 2); const bl = box(.08, .3, .26, ironM, x, heightAt(x, z) + .02, z); bl.rotation.y = F.yaw; out.push({ x: F.x, z: F.z, y: F.y + .3 }); }   // furrows and the hoe
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
VIA['2.1'] = [[110, 0], [134, -4], [134, -10]];   // from the Watchtower, through the farm's upper gate                       // from the Watchtower, through the farm's upper gate
VIA['2.5'] = [[145, -58], [141, -62], [137, -66]];                    // through the terrace-wall gate
zoneLabel(6, 'The Farm', 140, -55);
