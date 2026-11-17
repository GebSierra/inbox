// ---------- Chapter 6: the Farm (som-ltm/PLAN.md §4) ----------
// A walled farmstead on the slope beyond the ridge's west end. A lane runs from the upper gate (north, below the Watchtower)
// to the lower gate (south, above the beach), zigzagging between the rooms, which alternate east and west of it.
// A terrace wall with a gate crosses the farm below the Spring: house terraces above (6:1–20), field terraces below (6:21–34).
// Builders use the helpers of world/mount.js (roomFrame, atR, SQ, ground, somRock, finishRoom, the som* materials).
const basaltM = mat('somBasalt', '#6a625a'), plasterM = mat('somPlaster', '#e6dcc6'), mudM = mat('somMud', '#a88a62'), clothM = mat('somCloth', '#e8e0cc'),
  waterM = mat('somWater', '#4f8fa6'), willowM = mat('somWillow', '#7c9a52'), lentilM = mat('somLentil', '#6f8e3c'), herbM = mat('somHerb', '#7a8a4a');
const wallRun = (x0, z0, x1, z1, H, m = dryStone, W = .6) => { const L = Math.hypot(x1 - x0, z1 - z0), xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
  const b = box(L, H, W, m, xc, Math.min(heightAt(x0, z0), heightAt(x1, z1), heightAt(xc, zc)) - .15, zc); b.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return b; };
// a wall along a line with gaps [[from, to], ...] measured along it
const wallGaps = (x0, z0, x1, z1, H, gaps = []) => { const L = Math.hypot(x1 - x0, z1 - z0); let t = 0; const cuts = [...gaps].sort((a, b) => a[0] - b[0]);
  for (const [g0, g1] of [...cuts, [L, L]]) { if (g0 > t + .2) wallRun(x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L, x0 + (x1 - x0) * g0 / L, z0 + (z1 - z0) * g0 / L, H); t = g1; } };

// ---- the farm wall, its two gates, and the terrace wall ----
wallGaps(110, -6, 174, -6, 1.6, [[21, 27]]);          // north wall, the upper gate at x 131–137
wallGaps(110, -140, 174, -140, 1.6, [[27, 33]]);      // south wall, the lower gate at x 137–143
wallRun(110, -6, 110, -140, 1.6); wallRun(174, -6, 174, -140, 1.6);
wallGaps(110, -83, 174, -83, 1.1, [[28, 34]]);        // the terrace wall between the house and the fields, its gate at x 138–144
for (const [x, z] of [[131, -6], [137, -6], [137, -140], [143, -140]]) box(.8, 2, .8, rockDk, x, heightAt(x, z) - .1, z);   // gate piers
// the farmhouse: a flat-roofed house behind the courtyard, with its smoke
{ const x = 112.5, z = -20; box(4.5, 3.4, 9, mudM, x, heightAt(x, z) - .2, z); box(5, .25, 9.6, 'wood', x, heightAt(x, z) + 3.15, z); }

// ---- 6.1 THE COURTYARD (6:1–5): gate pier · curtained doorway · stair to the roof · roof-roller · cistern lid ----
defBuilder('som.court', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, 0, 0); box(2 * h + 2, .08, 2 * h + 2, paleM, 0, 0, 0, g); }                                      // the paving
  { const g = atR(F, -h, -h); box(.7, 1.8, .7, dryStone, 0, 0, 0, g); out.push(ground(sp[0], 1.95)); }                // the gate's left pier
  { const g = atR(F, h + .7, -h + .2); box(1.3, 2.3, .15, mat('somCurtain', '#7a3b2e'), 0, 0, 0, g); box(1.8, .3, .4, 'wood', 0, 2.3, 0, g); out.push(ground(F.at(h + .4, -h + .2), .25)); }   // the doorway, its curtain
  { const g = atR(F, h + .2, h); for (let k = 0; k < 6; k++) box(1, .3 * (k + 1), .55, dryStone, 0, 0, .5 - k * .55, g); out.push(ground(F.at(h + .2, h), 1.15)); }   // the stair up to the roof
  { const g = atR(F, -h, h); const c = cyl(.28, .28, 1.2, 10, rockM, 0, .28, 0, g); c.rotation.z = Math.PI / 2; c.position.y = .28; out.push(ground(sp[3], .62)); }   // the roof-roller
  { cyl(.6, .6, .3, 14, dryStone, F.x, F.y, F.z); cyl(.5, .5, .1, 14, rockDk, F.x, F.y + .3, F.z); out.push({ x: F.x, z: F.z, y: F.y + .45 }); }   // the cistern mouth and its lid
  { const [x, z] = F.at(-h - 1.5, -h - 2.2); const d = new THREE.Group(); d.position.set(x, heightAt(x, z), z); d.rotation.y = F.yaw + 1.2; scene.add(d);
    const b = add(new THREE.CapsuleGeometry(.3, .8, 3, 8), mat('somDonkey', '#8a7a6a'), 0, .75, 0, d); b.rotation.z = Math.PI / 2; add(new THREE.BoxGeometry(.22, .35, .5), mat('somDonkey', '#8a7a6a'), .7, 1, 0, d); for (const [a, c] of [[-.35, -.15], [-.35, .15], [.35, -.15], [.35, .15]]) cyl(.05, .05, .55, 5, mat('somDonkey', '#8a7a6a'), a, 0, c, d); }   // the donkey by the gate
  finishRoom(ch, r, F, out); });

// ---- 6.2 THE INNER STOREROOM (6:6–10): open-fronted, cut into the terrace, its door swung back ----
// threshold · storage jars · dried herbs from a beam · plastered wall shelf · wooden chest
defBuilder('som.store', (r, { ch }) => { const F = roomFrame(r), h = 2.3, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, .4, 0, Math.PI);   // local +z = forward, +x = right
  box(.4, 3, 2 * h + 2.2, plasterM, -h - 1, 0, 0, g); box(.4, 3, 2 * h + 2.2, plasterM, h + 1, 0, 0, g); box(2 * h + 2.4, 3, .4, plasterM, 0, 0, h + 1.2, g);   // walls
  box(2 * h + 2.4, .3, 2 * h + 2.6, 'wood', 0, 3, .1, g);                                                                 // the roof
  box(.12, 2.3, 1.2, 'wood', -h - .7, 0, -h + .1, g).rotation.y = .15;                                                    // the door, swung back against the left wall
  { const s2 = atR(F, -h, -h); box(1.4, .1, .8, paleM, 0, 0, 0, s2); out.push(ground(sp[0], .2)); }                        // the threshold
  { const s2 = atR(F, h, -h); for (let k = 0; k < 4; k++) { const j = add(new THREE.SphereGeometry(.3, 9, 7), clayM, (k - 1.5) * .35, .55, 0, s2); j.scale.y = 1.8; } out.push(ground(sp[1], 1.15)); }   // storage jars
  { const s2 = atR(F, h, h); box(1.6, .1, .1, 'wood', 0, 2.2, 0, s2); for (let k = 0; k < 5; k++) { const b = add(new THREE.ConeGeometry(.13, .55, 6), herbM, -.6 + k * .3, 1.85, 0, s2); b.rotation.x = Math.PI; } box(1.2, .9, .5, plasterM, 0, 0, .5, s2); out.push(ground(sp[2], 1.05)); }   // herbs from a beam, over a plastered bin
  { const s2 = atR(F, -h, h); box(1.6, .9, .6, plasterM, 0, 0, 0, s2); out.push(ground(sp[3], 1.05)); }                    // the plastered wall shelf
  { const s2 = atR(F, 0, 0, .1); box(1.1, .6, .65, 'wood', 0, 0, 0, s2); box(1.14, .08, .7, 'woodLt', 0, .6, 0, s2); out.push({ x: F.x, z: F.z, y: F.y + .75 }); }   // the wooden chest
  finishRoom(ch, r, F, out); });

// ---- 6.3 THE BAKEHOUSE YARD (6:11–15): sieve on its hook · woodpile · clay oven · smoke-stained corner · kneading bowl ----
defBuilder('som.bake', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); cyl(.07, .08, 1.9, 6, 'wood', 0, 0, 0, g); box(.3, .05, .05, 'wood', 0, 1.6, .12, g); const sv = cyl(.32, .32, .1, 14, mat('somSieve', '#c8a86a'), 0, 1.3, .2, g); sv.rotation.x = Math.PI / 2; out.push(ground(sp[0], 1.95)); }   // the sieve on its post
  { const g = atR(F, h, -h); for (let row = 0; row < 3; row++) for (let k = 0; k < 5 - row; k++) { const l = cyl(.11, .11, 1.3, 6, 'wood', -.5 + k * .24 + row * .12, .11 + row * .2, 0, g); l.rotation.x = Math.PI / 2; l.position.y = .11 + row * .2; } out.push(ground(sp[1], .75)); }   // the woodpile
  { const [x, z] = sp[2], y = heightAt(x, z); const o = add(new THREE.SphereGeometry(.85, 12, 8, 0, 6.3, 0, 1.6), clayM, x, y, z); o.scale.y = 1.1; add(new THREE.CircleGeometry(.25, 10), darkM, x, y + .9, z).rotation.x = -Math.PI / 2;
    for (let k = 0; k < 4; k++) { const [lx, lz] = F.at(h - 1.1, h - .4 + k * .3); cyl(.17, .17, .05, 10, mat('somLoaf', '#c8964e'), lx, heightAt(lx, lz) + .02, lz); } out.push({ x, z, y: y + 1.05 }); }   // the clay oven, loaves cooling beside it
  { const g = atR(F, -h - .3, h + .3); box(.4, .9, 1.4, dryStone, -.2, 0, .5, g); box(1.4, .9, .4, dryStone, -.5, 0, .2, g); box(.6, .6, .02, darkM, -.3, .3, -.01, g); out.push(ground(sp[3], .2)); }   // a low corner of walling outside the yard, smoke-stained   // the smoke-stained corner
  { const g = atR(F, 0, 0); box(.7, .4, .7, rockM, 0, 0, 0, g); cyl(.45, .32, .25, 12, clayM, 0, .4, 0, g); box(.7, .03, .4, clothM, .1, .66, 0, g); out.push({ x: F.x, z: F.z, y: F.y + .75 }); }   // the kneading bowl with its cloth
  finishRoom(ch, r, F, out); });

// ---- 6.4 THE SPRING (6:16–20): spout · oil flask on a ledge (v) · wash-line · willow · flat stones across the outflow ----
defBuilder('som.spring', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.5, 0); box(2 * h + 4, 2.4, 1.6, rockM, 0, -.4, 0, g); }                                     // the rock face at the back
  { const g = atR(F, -h, -h); box(1, 1.1, 1, rockM, 0, 0, 0, g); const p = cyl(.06, .06, .5, 6, 'wood', 0, .9, -.4, g); p.rotation.x = Math.PI / 2; p.position.set(0, .9, -.6); out.push(ground(sp[0], 1.25)); }   // the spout
  { const g = atR(F, h, -h); box(1.1, .9, .6, rockM, 0, 0, 0, g); const fl = add(new THREE.SphereGeometry(.12, 8, 6), mat('somFlask', '#d9c27a'), 0, 1.02, 0, g); fl.scale.y = 1.5; cyl(.03, .04, .14, 6, mat('somFlask', '#d9c27a'), 0, 1.18, 0, g); out.push(ground(sp[1], 1.35)); }   // flask of oil on a ledge of rock
  { const g = atR(F, h, h); for (const s2 of [-.9, .9]) cyl(.05, .05, 1.8, 5, 'wood', s2, 0, 0, g); box(1.8, .02, .02, mat('somRope', '#c8b48a'), 0, 1.7, 0, g); box(.7, .9, .03, clothM, -.2, .8, 0, g); out.push(ground(sp[2], .7)); }   // the wash-line and a tunic
  { const [x, z] = F.at(-h - .3, h + .3); tree(x, z, 1.1); for (let k = 0; k < 9; k++) add(new THREE.IcosahedronGeometry(.4, 0), willowM, x + R(-1.2, 1.2), heightAt(x, z) + R(1.4, 2.6), z + R(-1.2, 1.2)).scale.y = 1.6; out.push(ground(sp[3], .6)); }   // the willow
  { const m = add(new THREE.PlaneGeometry(1.2, 2 * h + 3), waterM, ...F.at(0, 0).map((v, i) => i ? v : v)); m.rotation.x = -Math.PI / 2; m.rotation.z = -F.yaw; m.position.set(F.x, F.y + .04, F.z);
    for (let k = -1; k <= 1; k++) { const [x, z] = F.at(k * .7, 0); box(.6, .15, .7, paleM, x, F.y, z); } out.push({ x: F.x, z: F.z, y: F.y + .3 }); }   // the outflow and its flat stones
  { const [x, z] = F.at(-.8, -h + .6); box(.9, .03, .5, clothM, x, heightAt(x, z) + .02, z); }   // a linen towel spread on the rocks
  finishRoom(ch, r, F, out); });

// ---- 6.5 THE OX STALL (6:21–25): left stall post · yoke on its peg · plough · straw bedding · the roof pillar with its feeding niche ----
defBuilder('som.stall', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, 0, 0, Math.PI);
  box(.4, 2.6, 2 * h + 1.8, dryStone, -h - .9, 0, .2, g); box(.4, 2.6, 2 * h + 1.8, dryStone, h + .9, 0, .2, g); box(2 * h + 2.2, 2.6, .4, dryStone, 0, 0, h + 1, g);   // three walls, open front
  box(2 * h + 2.4, .25, 2 * h + 2.4, 'wood', 0, 2.6, .2, g);                                                                  // the roof
  { const s2 = atR(F, -h, -h); box(.35, 2.6, .35, 'wood', 0, 0, 0, s2); out.push(ground(sp[0], 1.4)); }                     // the left stall post
  { const s2 = atR(F, h + .7, -h); box(.08, .08, .3, 'wood', 0, 1.6, 0, s2); box(1.6, .14, .14, 'woodLt', 0, 1.62, -.2, s2); for (const s3 of [-.5, .5]) { const u = add(new THREE.TorusGeometry(.18, .04, 4, 8, Math.PI), 'wood', s3, 1.45, -.2, s2); u.rotation.z = Math.PI; } box(.5, 1.2, .4, dryStone, 0, 0, -.2, s2); out.push(ground(F.at(h + .7, -h), 1.3)); }   // the yoke on its peg, over a stone ledge
  { const s2 = atR(F, h, h, .3); const b = box(.12, .12, 2, 'wood', 0, .5, 0, s2); b.rotation.x = .25; box(.08, .5, .3, ironM, 0, .05, .9, s2); box(.6, .08, .08, 'wood', 0, .9, -.8, s2); out.push(ground(sp[2], .85)); }   // the plough
  { const [x, z] = sp[3]; for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(R(.3, .45), 0), strawM, x + R(-.5, .5), heightAt(x, z) + R(0, .3), z + R(-.5, .5)).scale.y = .5; out.push(ground(sp[3], .55)); }   // straw bedding
  { box(.6, 2.6, .6, dryStone, F.x, F.y, F.z); box(.45, .35, .1, darkM, F.x - F.fx * .3, F.y + .9, F.z - F.fz * .3); out.push({ x: F.x, z: F.z, y: F.y + 2.85 }); }   // the roof pillar and its feeding niche
  { const [x, z] = F.at(1.2, -1.4); const o = new THREE.Group(); o.position.set(x, heightAt(x, z), z); o.rotation.y = F.yaw + .4; scene.add(o); const b = add(new THREE.CapsuleGeometry(.45, .9, 3, 8), mat('somOx', '#7a5a3e'), 0, .45, 0, o); b.rotation.z = Math.PI / 2; add(new THREE.BoxGeometry(.4, .4, .5), mat('somOx', '#7a5a3e'), .75, .55, 0, o); }   // the ox, lying down
  finishRoom(ch, r, F, out); });

// ---- 6.6 THE GRANARY FIELD (6:26–30): terrace steps · lentils · scarecrow · granary door · hoe in the furrow ----
defBuilder('som.granary', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); for (let k = 0; k < 3; k++) box(1.2, .2 * (k + 1), .5, dryStone, 0, 0, -k * .5, g); out.push(ground(sp[0], .7)); }   // the terrace steps
  { const g = atR(F, h, -h); for (let a = 0; a < 5; a++) for (let b = 0; b < 4; b++) add(new THREE.IcosahedronGeometry(.16, 0), lentilM, -.7 + a * .35, .12, -.5 + b * .33, g).scale.y = .7; out.push(ground(sp[1], .3)); }   // the lentils
  { const g = atR(F, h, h); cyl(.05, .05, 2.2, 5, 'wood', 0, 0, 0, g); box(1.3, .06, .06, 'wood', 0, 1.6, 0, g); box(.6, .8, .2, mat('somRag', '#8a6a4a'), 0, 1.1, 0, g); add(new THREE.SphereGeometry(.17, 8, 6), strawM, 0, 2.05, 0, g); out.push(ground(sp[2], .5)); }   // the scarecrow
  { const g = atR(F, -h + .6, h + 3.2, -Math.PI / 2); box(3.2, 2.8, 3, dryStone, 0, 0, 0, g); add(new THREE.SphereGeometry(1.6, 10, 6, 0, 6.3, 0, 1.57), mudM, 0, 2.8, 0, g).scale.y = .7; box(.9, 1.6, .1, 'wood', 0, 0, -1.55, g); out.push(ground(F.at(-h + .6, h + 1.4), .15)); }   // the granary, off to the right, its door facing the field
  { for (let k = -2; k <= 2; k++) { const [x, z] = F.at(k * .6, 0); const fr = box(.25, .1, 3.2, mudM, x, heightAt(x, z) - .02, z); fr.rotation.y = F.yaw; }
    const [x, z] = F.at(0, .3); const hd = cyl(.03, .03, 1.4, 5, 'wood', x, heightAt(x, z), z); hd.rotation.z = .5; out.push({ x: F.x, z: F.z, y: F.y + .3 }); }   // furrows and the hoe
  finishRoom(ch, r, F, out); });

// ---- 6.7 THE OLIVE PRESS (6:31–34): crushing stone · press beam in its wall socket · rope pulp-baskets · oil collecting pit ----
defBuilder('som.press', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.3, 0); box(2 * h + 3, 2.4, .7, dryStone, 0, 0, 0, g); }                                     // the back wall that holds the beam
  { const [x, z] = sp[0], y = heightAt(x, z); cyl(1, 1.05, .55, 16, rockM, x, y, z); const st = cyl(.55, .55, .3, 14, paleM, x, y + .55, z); st.rotation.x = Math.PI / 2; st.position.y = y + 1.1; out.push({ x, z, y: y + 1.45 }); }   // the crushing stone in its bed
  { const g = atR(F, h, -h + .3); const bm = box(.3, .3, 4.5, 'wood', 0, 1.2, -1.5, g); bm.rotation.x = -.12; box(.5, .5, .5, darkM, 0, .9, .75, g); box(.5, 1, .5, rockM, 0, 0, -3.5, g); out.push(ground(F.at(h - .6, -h + .3), 1.65)); }   // the press beam in its socket
  { const [x, z] = sp[2]; for (let k = 0; k < 6; k++) cyl(.4, .4, .14, 12, mat('somRopeB', '#9a7a4a'), x, heightAt(x, z) + k * .15, z); out.push(ground(sp[2], 1.05)); }   // the stack of rope pulp-baskets
  { const [x, z] = sp[3], y = heightAt(x, z); cyl(.65, .65, .12, 14, rockM, x, y, z); add(new THREE.CircleGeometry(.45, 12), darkM, x, y + .13, z).rotation.x = -Math.PI / 2; out.push({ x, z, y: y + .2 }); }   // the oil collecting pit
  finishRoom(ch, r, F, out); });

buildRooms(2);
VIA['2.1'] = [[110, 0], [134, -4], [134, -10]];                       // from the Watchtower, through the farm's upper gate
VIA['2.5'] = [[147, -79], [141, -83], [136, -87]];                    // through the terrace-wall gate
zoneLabel(6, 'The Farm', 142, -70);
