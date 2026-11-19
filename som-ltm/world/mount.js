// ---------- Chapter 5: the Summit (som-ltm/PLAN.md §3) ----------
// Method rule 4: each verse on a SPOT, a feature of the place (P) or an object (O); at least two natural objects per room.
// Spots in the fixed order, as seen standing on the path facing the room: 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre.
// Layout: the ridge runs along z = 0, with the trodden path on its crest. Compass: east = -x, north = +z (see world/terrain.js).
//   Rule 6, hillside form: a switchback trail (TRAIL, world/terrain.js) runs down the ridge from the Seat on the top (east end),
//   rooms at its turns alternating north and south, each lower than the last: rooms 1-4 on the Crown, the stile, rooms 5-10 in the Upper Meadow.
//   The path down to chapter 6 leaves from the Watchtower (room 10) at the low west end.
const GZ = -16, TZ = 0, HX = 0, HZ = 400;            // the player starts at (0, GZ + 16) = (0, 0), on the ridge path; HX/HZ unused
const RAISED = [];
const WALKWAYS = [[STILE_X - 1.5, -1.8, STILE_X + 1.5, 1.8], [131, -8, 137, -4], [137, -106, 143, -102], [138, -65, 144, -59]];   // the stile gap; the farm's upper, lower and terrace-wall gates
const rockM = mat('somRock', '#9a9282'), rockDk = mat('somRockDk', '#7d776b'), paleM = mat('somPale', '#d9d0bb'), dryStone = mat('somWall', '#b3a58a'),
  brushM = mat('somBrush', '#8a7a52'), floorM = mat('somFloor', '#cdb88e'), strawM = mat('somStraw', '#e8cc6a'), darkM = mat('somDark', '#2c2620'),
  ironM = mat('somIron', '#4a4744'), clayM = mat('somClay', '#b5653e'), hideM = mat('somHide', '#6b4a32'), tentM = mat('somTent', '#262220'),
  ashM = mat('somAsh', '#8d8a85'), leafM = mat('somLeaf', '#5f7a3e'), cukeM = mat('somCuke', '#7aa63e'), combM = mat('somComb', '#d9a640');

// textures for the summit's own materials (critic, 2026-11-17: "flat, untextured"): stone and rock get the stone texture, slabs the flagstones,
// cloth and tent the cloth weave, clay the pottery glaze. Rocks are lightened a little so nothing reads as a black hole.
rockM.map = TEX.stone; rockM.color.set('#b0a796'); rockDk.map = TEX.stone; rockDk.color.set('#968e80'); dryStone.map = TEX.stone; dryStone.color.set('#c8b896');
paleM.map = TEX.flag; paleM.color.set('#efe6d2'); floorM.map = TEX.flag; brushM.map = TEX.wicker; strawM.map = TEX.wicker; clayM.map = TEX.pot; clayM.color.set('#c47a4a');
tentM.map = TEX.cloth; tentM.color.set('#4a3a30'); hideM.map = TEX.cloth; ashM.map = TEX.flag;
for (const m of [rockM, rockDk, dryStone, paleM, floorM, brushM, strawM, clayM, tentM, hideM, ashM]) m.needsUpdate = true;
// the room's frame: forward (away from the viewer) and right, in world x/z, as station() works them out
function roomFrame(r) { const [x, z] = r.at, [vx, vz] = r.viewer; let fx = x - vx, fz = z - vz; const l = Math.hypot(fx, fz); fx /= l; fz /= l;
  return { x, z, fx, fz, yaw: Math.atan2(vx - x, vz - z), y: heightAt(x, z),
    at: (f, s) => [x + fx * f - fz * s, z + fz * f + fx * s] }; }   // f metres forward, s metres right
const SQ = h => [[-h, -h], [h, -h], [h, h], [-h, h], [0, 0]];
// a group standing at room coordinates (f, s), turned with the room (local +z = towards the viewer, local +x = the viewer's left)
// place a hand-built workshop model (world/models.js) on a spot, its front toward the viewer; returns the spot
function somAt(F, p, id, rot = 0, sc = 1) { const [x, z] = p, e = OBJECTS.get(id); if (!e) { console.warn('[som] missing model', id); return ground(p, .5); } const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = F.yaw + rot; g.scale.setScalar(sc); scene.add(g); const top = e.fn(g, 0, 0, 0) || 1; return { x, z, y: heightAt(x, z) + top * sc + .1 }; }
function atR(F, f, s, rot = 0) { const [x, z] = F.at(f, s), g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = F.yaw + rot; scene.add(g); return g; }
function libAt(id, x, z, rot = 0, s = 1, dy = 0) { const g = new THREE.Group(), y = heightAt(x, z) + dy; g.position.set(x, y, z); g.rotation.y = rot; g.scale.setScalar(s); scene.add(g);
  const e = OBJECTS.get(id); if (!e) { console.warn('[som] missing library object ' + id); return y + 1; } e.fn(g, 0, 0, 0);
  // some library pieces are built at the world origin (and so at the hilltop's height): set every piece down on its own spot
  g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); if (bb.isEmpty()) return y + 1;
  const c = bb.getCenter(new THREE.Vector3()); if (Math.hypot(c.x - x, c.z - z) > 2.5) { g.position.x -= c.x - x; g.position.z -= c.z - z; }
  if (Math.abs(bb.min.y - y) > .4) g.position.y -= bb.min.y - y;
  g.updateMatrixWorld(true); return new THREE.Box3().setFromObject(g).max.y; }
function somRock(x, z, s, y) { const m = add(new THREE.DodecahedronGeometry(s, 0), rnd() > .4 ? rockM : rockDk, x, (y ?? heightAt(x, z)) + s * .3, z); m.rotation.set(R(0, 3), R(0, 3), R(0, 3)); m.scale.y = .65; return (y ?? heightAt(x, z)) + s * .95; }
const ground = ([x, z], up = .12) => ({ x, z, y: heightAt(x, z) + up });
// a plain first-century Galilean house: thick walls (stone or mud plaster), a flat roof of beams under packed reeds, a low parapet,
// a dark doorway on its front (local +z) and a small window. Used instead of library houses that read as later or European.
function galHouse(x, z, w, d, hgt, rot, m, dy = 0) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z) + dy - .1, z); g.rotation.y = rot; scene.add(g);
  box(w, hgt, d, m, 0, 0, 0, g); for (let k = 0; k < Math.floor(w / .6); k++) box(.14, .14, d + .3, 'wood', -w / 2 + .3 + k * .6, hgt - .1, 0, g);
  const rf = box(w + .1, .14, d + .1, mat('somRoofReed', '#b8a070'), 0, hgt, 0, g); rf.material.map = TEX.wicker;
  for (const [a, b, c, e] of [[w + .1, .3, .14, d / 2], [w + .1, .3, .14, -d / 2]]) box(a, b, c, m, 0, hgt + .1, e, g);
  box(.95, 1.8, .06, mat('somDoorDark', '#2a2018'), -w * .2, 0, d / 2 + .02, g); box(1.15, .16, .12, 'wood', -w * .2, 1.8, d / 2 + .04, g);
  box(.45, .4, .06, mat('somDoorDark', '#2a2018'), w * .25, 1.35, d / 2 + .02, g); return g; }
// hand the room to the engine: spots [{ x, y, z }] in the fixed order, one per verse
function finishRoom(ch, r, F, spots) {
  station(ch, r.room, r.name, F.x, F.z, [F.x + F.fx, 0, F.z + F.fz], spots.slice(0, r.objects.filter(o => !o.extra).length).map((p, i) => ({ ...p, what: r.objects[i].what })));
  const st = STATIONS[STATIONS.length - 1]; st.back = r.back ?? 7; st.pitch = r.pitch ?? -.17;   // tilted up so the room banner shows at the top (owner, 2026-11-17)
}

// ---- 5.1 THE SEAT (5:1–5): olive tree · limestone pavement · split boulder with a thornbush · water bag on a stake · the seat-rock ----
defBuilder('som.seat', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; libAt('olive-tree-gnarled', x, z, 0, .72); out.push(ground([x, z], .6)); }
  { const g = atR(F, h, -h, .3); box(3.4, .24, 2.4, paleM, 0, -.02, 0, g); box(2, .22, 1.6, paleM, 1.1, .04, -1.1, g); box(1.4, .2, 1.2, paleM, -1.2, .03, 1, g); box(.02, .05, 1.8, darkM, .4, .2, 0, g); box(1.4, .05, .02, darkM, -.4, .2, .3, g); out.push(ground(sp[1], .32)); }   // bare limestone pavement, pale and cracked
  { const [x, z] = sp[2]; const a = somRock(x - .8, z, .85), b = somRock(x + .8, z + .05, .8); for (let k = 0; k < 9; k++) { const t = add(new THREE.ConeGeometry(.05, .5, 4), mat('somThorn', '#7a9a3e'), x + R(-.2, .2), heightAt(x, z) + R(.2, .7), z + R(-.25, .25)); t.rotation.set(R(-.6, .6), 0, R(-.6, .6)); } out.push({ x, z, y: Math.max(a, b) + .1 }); }   // the split boulder, a thornbush in the gap
  { const g = atR(F, -h, h); const st = cyl(.06, .08, 1.6, 6, 'wood', 0, 0, 0, g); for (const k of [-1, 1]) { const fk = cyl(.03, .04, .35, 5, 'wood', k * .08, 1.55, 0, g); fk.rotation.z = -k * .5; }
    const sk = mat('somSkin2', '#8a6040'); sk.map = TEX.cloth; const bag = add(new THREE.CapsuleGeometry(.26, .42, 4, 10), sk, 0, 1.05, .2, g); bag.rotation.x = .25; for (const [lx, ly] of [[-.2, .82], [.2, .82], [-.18, 1.3], [.18, 1.3]]) { const lg = cyl(.04, .03, .2, 5, sk, lx, ly, .22, g); lg.rotation.z = lx < 0 ? .6 : -.6; } cyl(.05, .07, .16, 6, sk, 0, 1.45, .14, g); out.push(ground(sp[3], 1.75)); }   // the goatskin water bag, its tied legs and neck, hung on a forked stake
  out.push(somAt(F, sp[4], 'som-seat-rock', 0, 1.3));   // the flat seat-rock where he sat

  finishRoom(ch, r, F, out); });

// ---- 5.2 THE SHEEPFOLD (5:6–10): gateway · slab-roofed corner · oak corner · crook on the wall · water trough ----
defBuilder('som.fold', (r, { ch }) => { const F = roomFrame(r), h = 3, H = .95, out = [];
  // the pen stands across the trail (owner, 2026-11-18): you come in by the gateway in the near wall and leave by a shepherd's gap in the far wall
  const seg = (a, b, hh = H) => { const [x0, z0] = F.at(...a), [x1, z1] = F.at(...b), L = Math.hypot(x1 - x0, z1 - z0);
    const y0 = Math.min(heightAt(x0, z0), heightAt(x1, z1)) - .1; const n = Math.max(2, Math.round(L / .5)); for (let row = 0; row < Math.round(hh / .3); row++) for (let k = 0; k <= n; k++) { const t = (k + (row % 2) * .5) / n; if (t > 1) continue; const st = add(new THREE.DodecahedronGeometry(R(.24, .32), 0), rnd() > .5 ? rockM : rockDk, x0 + (x1 - x0) * t, y0 + .15 + row * .28, z0 + (z1 - z0) * t); st.scale.set(1.2, .7, 1); st.rotation.y = R(0, 3); } };
  seg([-h, -h], [-h, -1.4], .5); seg([-h, 1.4], [-h, h], .5);    // near wall kept low either side of the gateway, so you can see in
  seg([h, -h], [h, -.6]); seg([h, .6], [h, h]);                  // far wall, either side of the shepherd's gap
  seg([-h, -h], [h, -h]); seg([-h, h], [h, h]);                  // the side walls
  somAt(F, F.at(-h, 0), 'som-fold-gateway', 0, .72);                 // the gateway across the trail
  out.push(ground(F.at(-h, -.75), 1.15));                      // 1: the gateway's big left upright
  out.push(somAt(F, F.at(h - .9, -h + .9), 'som-slab-corner', Math.PI / 4));   // 2: the slab-roofed corner
  { const [x, z] = F.at(h + 1.3, h + 1.2); tree(x, z, 1.2); out.push(ground(F.at(h - .4, h - .4), H + .05)); }   // 3: the corner shaded by the oak
  out.push(somAt(F, F.at(-h + .5, h - .3), 'som-crook', Math.PI)); out[out.length - 1].y -= .6;   // 4: the crook hung on the wall
  { const [cx, cz] = F.at(.3, -1.5); out.push({ x: cx, z: cz, y: libAt('water-trough', cx, cz, F.yaw, 1.25) }); }   // 5: the trough, beside the trail
  for (const [f, s] of [[1.6, 1.6], [-.4, 2.0]]) { const [x, z] = F.at(f, s); libAt('ewe-and-lamb', x, z, R(0, 6), .9); }
  finishRoom(ch, r, F, out); });

// ---- 5.3 THE LOOKOUT (5:11–15): a long flat rock under a great terebinth on the lake edge, the view open to Hippos ----
// near end of the long flat rock · the terebinth's trunk · heap of cucumbers · cliff-edge boulder · lamp on its stand
defBuilder('som.lookout', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h + .2, -h - .2, -.15); const rk = box(1.1, .5, 4.2, rockM, 0, -.05, -1.6, g); rk.scale.set(1, 1, 1); box(1, .12, 4, paleM, 0, .45, -1.6, g); out.push(ground(sp[0], .65)); }   // the long flat rock, running away from you along the left
  { const [x, z] = F.at(h + .3, -h - .3); tree(x, z, 1.9); out.push(ground(sp[1], .7)); }                                   // the great terebinth over it
  { const g = atR(F, h, h); for (let k = 0; k < 16; k++) { const c = add(new THREE.CapsuleGeometry(.1, .36, 3, 7), cukeM, R(-.5, .5), .1 + (k % 3) * .13, R(-.4, .4), g); c.rotation.z = Math.PI / 2; c.rotation.y = R(0, 3); } for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(R(.15, .25), 0), leafM, R(.8, 2.4), .1, R(-1.5, 1.5), g); out.push(ground(sp[2], .45)); }
  { const [x, z] = sp[3]; out.push({ x, z, y: somRock(x, z, 1.1) }); }
  { const [cx, cz] = sp[4]; out.push({ x: cx, z: cz, y: libAt('candelabrum', cx, cz, 0, 1.45) }); }
  finishRoom(ch, r, F, out); });

// ---- 5.4 THE THRESHING FLOOR (5:16–20): sheaves · lone thorn tree · winnowing fork · the worn floor edge · threshing sledge ----
defBuilder('som.floor', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  add(new THREE.CylinderGeometry(3.3, 3.4, .14, 20), floorM, F.x, F.y + .02, F.z).receiveShadow = true;
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28; add(new THREE.BoxGeometry(.6, .22, .35), paleM, F.x + Math.cos(a) * 3.54, F.y + .08, F.z + Math.sin(a) * 3.54).rotation.y = -a; }   // the raised edge
  { const [x, z] = sp[0]; for (let k = 0; k < 6; k++) { const m = cyl(.18, .26, 1.1, 6, strawM, x + R(-.35, .35), F.y, z + R(-.35, .35)); m.rotation.z = R(-.15, .15); } out.push({ x, z, y: F.y + 1.15 }); }
  { const [x, z] = F.at(h + .5, -h - .3); tree(x, z, .95); out.push(ground(sp[1], .45)); }
  { const g = atR(F, h, h); cyl(.05, .05, 1.2, 5, 'wood', 0, 0, 0, g); const f = cyl(.055, .055, 2.3, 6, 'woodLt', 0, .1, .35, g); f.rotation.x = .35; for (let k = -2; k <= 2; k++) box(.045, .45, .045, 'woodLt', k * .08, 2.05, 1.05, g); for (let k = 0; k < 8; k++) add(new THREE.IcosahedronGeometry(.3, 0), strawM, R(-.4, .4), .1, R(-.4, .2), g).scale.y = .5; out.push(ground(sp[2], 1.25)); }
  out.push(ground(F.at(-2.5, 2.5), .3));                                                  // on the worn edge
  { const g = atR(F, 0, 0, .3); box(1.15, .2, 1.9, 'woodLt', 0, .05, 0, g); const tip = box(1.15, .2, .5, 'woodLt', 0, .2, -1.05, g); tip.rotation.x = .5; for (let k = 0; k < 16; k++) add(new THREE.DodecahedronGeometry(.07, 0), paleM, R(-.45, .45), .26, R(-.8, .8), g); out.push({ x: F.x, z: F.z, y: F.y + .3 }); }
  for (let i = 0; i < 18; i++) { const a = R(0, 6.3), d = R(.5, 2.8); add(new THREE.BoxGeometry(.5, .02, .05), strawM, F.x + Math.cos(a) * d, F.y + .1, F.z + Math.sin(a) * d).rotation.y = R(0, 3); }
  finishRoom(ch, r, F, out); });

// ---- 5.5 THE QUARRY (5:21–25): chisel-marked left face · spoil heap · wedges in a crack · shear-legs · squared block on rollers ----
defBuilder('som.quarry', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  // the two cliff faces were removed (owner, 2026-11-18: "they just seem random"); kept here in case they are wanted later:
  const quarryFaces = () => { { const g = atR(F, 0, -h - 1.3); box(1.4, 3.2, 2 * h + 3, paleM, 0, -.3, 0, g); for (let k = 0; k < 9; k++) box(.02, 2.6, .05, rockDk, -.71, .2, -h - 1 + k * .75, g); }
    { const g = atR(F, h + 1.6, 0); box(2 * h + 4, 3.6, 1.4, paleM, 0, -.3, 0, g); } }; void quarryFaces;
  { const g = atR(F, -h, -h, .2); box(2.2, .35, 1.6, paleM, 0, -.05, 0, g); for (let k = 0; k < 6; k++) box(.03, .02, 1.3, rockDk, -.8 + k * .3, .3, 0, g); box(.9, .45, .7, paleM, .45, .3, .2, g); box(.04, .45, .72, darkM, -.02, .3, .2, g); out.push(ground(sp[0], .7)); }   // 1: a low shelf of bedrock, chisel-marked, a half-cut block still attached
  { const sg = atR(F, h, -h); box(2, .5, 1.8, paleM, 0, -.1, 0, sg); box(1.2, .3, 1.8, paleM, -.4, .4, 0, sg); }   // 2: a cut-back step in the bedrock
  { const [x, z] = sp[1]; for (let k = 0; k < 18; k++) { const d = R(0, 1), a = R(0, 6.3); add(new THREE.DodecahedronGeometry(R(.14, .3), 0), paleM, x + Math.cos(a) * d * 1.1, heightAt(x, z) + (1 - d) * .8, z + Math.sin(a) * d * 1.1); } out.push(ground(sp[1], 1.05)); }   // the spoil heap of chippings
  { const g = atR(F, h + .4, h); box(1.8, 1.5, 1.2, paleM, 0, 0, 0, g); box(.12, 1.3, 1.22, darkM, 0, .15, 0, g); for (let k = 0; k < 3; k++) box(.16, .4, .2, ironM, 0, 1.35, -.4 + k * .4, g); out.push(ground(F.at(h + .4, h), 1.8)); }   // the crack, with iron wedges driven in
  { const g = atR(F, -h, h); for (let k = 0; k < 3; k++) { const a = k / 3 * 6.28, p = cyl(.09, .1, 2.6, 6, 'woodLt', Math.cos(a) * .55, 0, Math.sin(a) * .55, g); p.rotation.set(Math.sin(a) * -.21, 0, Math.cos(a) * .21); } add(new THREE.TorusGeometry(.12, .03, 4, 8), 'wood', 0, 2.6, 0, g); cyl(.01, .01, 2.3, 4, 'wood', 0, .25, 0, g); out.push(ground(sp[3], .6)); }
  { const g = atR(F, 0, 0, .2); for (const z of [-.6, .6]) { const c = cyl(.1, .1, 1.5, 7, 'wood', 0, 0, z, g); c.rotation.z = Math.PI / 2; c.position.y = .1; } box(1.2, .9, 1.6, paleM, 0, .2, 0, g); out.push({ x: F.x, z: F.z, y: F.y + 1.15 }); }
  { const [a, b] = F.at(-h - .5, -h - .5), [c, d] = F.at(h + .5, h + .5); drape(Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d), 'path', .02); }   // the quarry floor, bare and dusty
  finishRoom(ch, r, F, out); });

// ---- 5.6 THE CHARCOAL BURNERS' CLEARING (5:26–30): smoking mound · row of stumps · axe in a block · rush baskets of charcoal · ash ring ----
defBuilder('som.charcoal', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  // models from the shared library (ltm-engine/objects/som.js), rebuilt 2026-11-18
  out.push(somAt(F, F.at(-h, -h - .2), 'som-log-stack', Math.PI / 2 + .3));   // 1: a stack of cut logs (owner, 2026-11-18)                 // 1: the smoking charcoal mound
  out.push(somAt(F, F.at(h, -h), 'som-cut-stumps', .3));                                   // 2: the row of cut stumps
  out.push(somAt(F, sp[2], 'som-axe-stump', -.4));                                         // 3: the chopping stump, the axe in it
  out.push(somAt(F, sp[3], 'som-charcoal-baskets', .2));                                   // 4: rush baskets of charcoal
  out.push(somAt(F, [F.x, F.z], 'som-ash-ring', 0, .8));                                   // 5: the old burn floor
  for (let i = 0; i < 12; i++) { const a = R(0, 6.3), d = R(7, 11), x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d; if (TRAIL_D(x, z) > 4) shrub(x, z, R(1, 1.4)); }   // the scrub round the clearing, off the trail
  finishRoom(ch, r, F, out); });

// ---- 5.7 THE BEE BANK (5:31–35): capped bank end · stacked hive pipes · smoker pot · bees' water dish · tray of comb ----
defBuilder('som.bees', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  out.push(somAt(F, F.at(-h, -h - .2), 'som-bank-end', .4));          // 1: the low bank end, capped with a flat stone (owner, 2026-11-18: smaller, natural)
  out.push(somAt(F, F.at(h - .2, -h - .3), 'som-bee-wall', .35));     // 2: the hive pipes, stacked on their own stone base
  { const g = atR(F, h, h); somRock(...F.at(h, h), .45); cyl(.22, .28, .55, 10, clayM, 0, .5, 0, g); const sp2 = cyl(.04, .06, .3, 6, clayM, .16, .82, 0, g); sp2.rotation.z = -.6; for (let k = 0; k < 4; k++) { const m = add(new THREE.SphereGeometry(.12 + k * .06, 8, 6), mat('somSmoke', '#e6e1da', { transparent: true, opacity: .5 }), .3 + k * .12, 1.0 + k * .3, 0, g); } out.push(ground(sp[2], 1.0)); }   // the smoker pot, smoking
  { const g = atR(F, -h, h); const bw = add(new THREE.SphereGeometry(.45, 14, 6, 0, 6.3, Math.PI / 2, Math.PI / 2), clayM, 0, .3, 0, g); bw.material.side = THREE.DoubleSide; add(new THREE.CircleGeometry(.4, 14), mat('somWater', '#6fb3c8'), 0, .24, 0, g).rotation.x = -Math.PI / 2; for (let k = 0; k < 3; k++) add(new THREE.DodecahedronGeometry(.07, 0), rockM, -.15 + k * .15, .27, R(-.1, .1), g); out.push(ground(sp[3], .45)); }   // a shallow clay bowl of water, stones for the bees to land on
  { const g = atR(F, 0, 0); box(1.1, .6, .8, rockM, 0, 0, 0, g); box(1, .07, .7, 'woodLt', 0, .6, 0, g); for (let a = 0; a < 6; a++) for (let b = 0; b < 4; b++) cyl(.07, .07, .1, 6, combM, -.38 + a * .15 + (b % 2) * .075, .68, -.25 + b * .13, g); for (let k = 0; k < 12; k++) add(new THREE.SphereGeometry(.035, 5, 4), darkM, R(-.8, .8), R(.9, 1.6), R(-.6, .6), g); out.push({ x: F.x, z: F.z, y: F.y + .85 }); }   // the tray of golden comb on a stone
  finishRoom(ch, r, F, out); });

// ---- 5.8 THE SHEPHERDS' CAMP (5:36–40): guy-rope peg · the tent's open front and pole · quern · ground loom · hearth stones ----
defBuilder('som.camp', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = F.at(h + 2.2, 0); libAt('goat-hair-tent', x, z, F.yaw, 1); }   // the black goat-hair tent
  { const [x, z] = sp[0]; cyl(.03, .05, .35, 5, 'wood', x, heightAt(x, z), z); const [x2, z2] = F.at(h - .2, -h); const L = Math.hypot(x2 - x, z2 - z); const rope = box(L, .02, .02, mat('somRope', '#c8b48a'), (x + x2) / 2, heightAt(x, z) + 1, (z + z2) / 2); rope.rotation.set(0, -Math.atan2(z2 - z, x2 - x), .35); out.push(ground(sp[0], .4)); }
  out.push(ground(F.at(h - .3, -h), 1.2));                                                 // the front pole of the tent
  { const g = atR(F, h, h); cyl(.5, .52, .22, 14, rockM, 0, 0, 0, g); cyl(.46, .46, .16, 14, paleM, 0, .22, 0, g); cyl(.04, .04, .35, 5, 'woodLt', .3, .38, 0, g); out.push(ground(sp[2], .4)); }
  { const g = atR(F, -h, h, .3); for (const s of [-.9, .9]) box(.06, .06, 1.6, 'wood', s, .04, 0, g); for (const f of [-.8, .8]) box(1.9, .06, .06, 'wood', 0, .04, f, g); const wv = box(1.6, .02, .7, mat('somWeave', '#b07a4a'), 0, .06, .35, g); wv.material.map = TEX.cloth; for (let k = 0; k < 14; k++) box(.012, .012, .75, mat('somWarp', '#e8dcc4'), -.75 + k * .115, .07, -.35, g); out.push(ground(sp[3], .15)); }
  { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; add(new THREE.DodecahedronGeometry(.2, 0), rockDk, F.x + Math.cos(a) * .55, F.y + .1, F.z + Math.sin(a) * .55); } add(new THREE.CircleGeometry(.45, 10), ashM, F.x, F.y + .03, F.z).rotation.x = -Math.PI / 2; out.push({ x: F.x, z: F.z, y: F.y + .3 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.9 THE RIDGE ROAD (5:41–45): gully culvert stones · carob tree · half-buried amphora · broken cart · the resting stone at the fork ----
defBuilder('som.road', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [a, b] = F.at(-9, -1.2), [c, d] = F.at(9, 1.2); drape(Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d), 'path', .02); const [e, f2] = F.at(1, -1), [g2, k2] = F.at(4, -14); drape(Math.min(e, g2), Math.min(f2, k2), Math.max(e, g2), Math.max(f2, k2), 'path', .02); }   // the road runs along the trail; the village track forks off to the left, down towards the lake
  { const [x, z] = sp[0], y = heightAt(x, z); add(new THREE.BoxGeometry(2.2, .05, 1.2), darkM, x, y + .01, z).rotation.y = F.yaw; for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { const [rx, rz] = F.at(-h + (k - 1.5) * .35, -h + sd * .75); somRock(rx, rz, .3, y); } const g = atR(F, -h, -h); const arch = add(new THREE.TorusGeometry(.6, .22, 6, 10, Math.PI), rockM, 0, 0, 0, g); arch.rotation.y = Math.PI / 2; out.push(ground(sp[0], .85)); }   // culvert stones arching over the gully
  { const [x, z] = F.at(h + .6, -h - .6); tree(x, z, 1.3); out.push(ground(sp[1], .6)); }
  out.push(somAt(F, sp[2], 'som-amphora-buried', .4));   // the old amphora, half-buried by the road
  out.push(somAt(F, sp[3], 'som-broken-cart', .5, .7));   // the cart, one wheel off and lying in the grass
  { const g = atR(F, 0, 0, .5); box(1.8, .5, 1.1, paleM, 0, 0, 0, g); out.push({ x: F.x, z: F.z, y: F.y + .6 }); }   // the flat resting stone at the fork
  { const [x, z] = F.at(6, 5); const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); scene.add(g); const b = add(new THREE.CapsuleGeometry(.45, 1.1, 3, 8), mat('somCamel', '#b8915c'), 0, .5, 0, g); b.rotation.z = Math.PI / 2; add(new THREE.SphereGeometry(.4, 8, 6), mat('somCamel', '#b8915c'), 0, 1, 0, g); }   // a camel resting beyond the fork
  finishRoom(ch, r, F, out); });

// ---- 5.10 THE WATCHTOWER (5:46–48): the tower's wooden ladder · its lookout window · the vine trellis ----
defBuilder('som.tower', (r, { ch }) => { const F = roomFrame(r), h = 2.3, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const [tx, tz] = F.at(h + 2.6, -h + .4), ty = heightAt(tx, tz); cyl(2.2, 2.45, 4.2, 14, dryStone, tx, ty - .3, tz); cyl(2.35, 2.35, .3, 14, rockDk, tx, ty + 3.85, tz);
  { const [bx, bz] = F.at(h - .6, -h - .9), g = new THREE.Group(); g.position.set(bx, heightAt(bx, bz), bz); g.rotation.y = Math.atan2(tx - bx, tz - bz) + Math.PI; scene.add(g); const lean = .3, L = 3.6;
    for (const s of [-.25, .25]) { const p = cyl(.045, .045, L, 5, 'wood', s, 0, 0, g); p.rotation.x = -lean; p.position.set(s, Math.cos(lean) * L / 2, -Math.sin(lean) * L / 2); } for (let k = 0; k < 8; k++) { const t = (k + .6) / 9 * L; box(.55, .045, .06, 'wood', 0, Math.cos(lean) * t, -Math.sin(lean) * t, g); } out.push(ground([bx, bz], .7)); }   // the ladder leaning against the tower
  { const [wx, wz] = F.at(h + .45, -h + .4), g = atR(F, h + .45, -h + .4); box(1.3, .18, .65, paleM, 0, 1.35, .05, g); box(1.2, 1.3, .1, paleM, 0, 1.5, -.16, g); box(.8, 1, .12, darkM, 0, 1.65, -.12, g); out.push({ x: wx, z: wz, y: heightAt(wx, wz) + 1.7 }); }   // the lookout window, its sill
  { const [x, z] = sp[2]; libAt('grapevine-trellis', x, z, F.yaw, 1.15); for (let k = 0; k < 6; k++) add(new THREE.IcosahedronGeometry(.1, 0), mat('somGrape', '#5a2a5a'), x + R(-.6, .6), heightAt(x, z) + R(1.2, 1.7), z + R(-.3, .3)).scale.y = 1.4; out.push(ground(sp[2], .9)); { const [vx, vz] = F.at(h + 7, 6); libAt('vineyard-rows', vx, vz, F.yaw, 1); } }
  finishRoom(ch, r, F, out); });

// ---------- the field wall and its stile, between the Crown and the Upper Meadow (outline break 5:20 / 5:21) ----------
// The wall marks where the open hilltop ends and worked land begins. It crosses the full width of the ridge, brow to brow,
// built of stones cleared from the Meadow's fields: uneven, knee to waist high, ending at each side in a heap of clearance stones.
// The stile: a gap in the wall closed by a worn threshold slab you step over, marked by a tall cairn topped with a white stone.
{ const W0 = -44, W1 = 44;
  for (let z = W0; z < W1; z += 1.1) { if (Math.abs(z) < 1.3) continue;
    const x = STILE_X + Math.sin(z * .21) * .5, hgt = R(.75, 1.15) * (1 - Math.max(0, Math.abs(z) - 36) / 14);
    const m = box(1.1, hgt, 1.2, rnd() > .3 ? dryStone : rockM, x, heightAt(x, z) - .12, z + .55); m.rotation.y = R(-.08, .08);
    if (rnd() > .55) add(new THREE.DodecahedronGeometry(R(.18, .3), 0), rockDk, x + R(-.3, .3), heightAt(x, z) + hgt - .05, z + R(0, 1)); }
  for (const zEnd of [W0 - 1.5, W1 + 1.5]) for (let k = 0; k < 22; k++) somRock(STILE_X + R(-2, 2), zEnd + R(-2, 2), R(.25, .55));   // clearance heaps at each end
  box(1.5, .2, 2.3, paleM, STILE_X, heightAt(STILE_X, 0) - .02, 0);                                                         // the worn threshold slab
  { const cx = STILE_X - 1.6, cz = 2.4, y = heightAt(cx, cz); for (let k = 0; k < 7; k++) add(new THREE.DodecahedronGeometry(.55 - k * .06, 0), rockM, cx + R(-.1, .1), y + .3 + k * .42, cz + R(-.1, .1)).rotation.y = R(0, 3);
    add(new THREE.DodecahedronGeometry(.22, 0), paleM, cx, y + 3.25, cz); }   // the cairn, topped with one white stone
  // the Meadow side shows work: low terrace lines across the slope and a ploughed strip
  for (const zl of [-27, -34, 25, 32]) for (let x = STILE_X + 4; x < 106; x += 1.4) { if (FLAT.some(([cx, cz, hw, hd]) => Math.abs(x - cx) < hw + 2 && Math.abs(zl - cz) < hd + 2)) continue; box(1.4, .35, .5, dryStone, x, heightAt(x, zl) - .1, zl); }
  for (let k = 0; k < 8; k++) { const z = -40 - k * 1.2; drape(STILE_X + 6, z, 60, z + .5, 'path', .02); }
}
// ---------- Hippos, the city on its hill across the lake (5:14) ----------
{ const [X, Z] = CITY;
  for (let i = 0; i < 60; i++) { const a = R(0, 6.3), d = Math.sqrt(rnd()) * 30, x = X + Math.cos(a) * d, z = Z + Math.sin(a) * d;
    box(R(5, 9), R(3, 6), R(5, 8), i % 4 ? mat('somCity', '#d9c7a4') : mat('somCity2', '#c9b38c'), x, heightAt(x, z) - .4, z).rotation.y = R(-.3, .3); }
  for (let i = 0; i < 30; i++) { const a = i / 30 * 6.28, x = X + Math.cos(a) * 34, z = Z + Math.sin(a) * 34; box(8, 5, 1.5, dryStone, x, heightAt(x, z) - .5, z).rotation.y = -a + Math.PI / 2; }
}
// ---------- the crowd, sitting on the north slope beyond the Seat, facing it (5:1) ----------
{ const ROBES = ['#8a5a3a', '#3f6f9a', '#c9a46a', '#7a8a5a', '#a8714c', '#5a4a6a', '#d9c39a', '#9a5a3a', '#e8dcc4'], placed = [], [sx, sz] = [-42, 0];
  for (let i = 0; i < 900 && placed.length < 110; i++) { const x = R(-58, -30), z = R(9, 40); if (Math.hypot(x + 42, z) < 9) continue;
    if (placed.some(([p, q]) => Math.hypot(p - x, q - z) < 1.6)) continue;
    placed.push([x, z]); person(x, z, Math.atan2(sx - x, sz - z), ROBES[(rnd() * ROBES.length) | 0], { y: heightAt(x, z) - .55, veil: rnd() > .65 ? '#e8dcc4' : undefined, hair: (rnd() * 4) | 0 }); }
}
// ---------- olive trees and scrub on the slopes, clear of the ridge path, the rooms, the crowd and the path down ----------
{ const clear = (x, z) => (Math.abs(z) < 21 && x > -52 && x < 112) || (x > 100 && x < 185 && z < 4 && z > -150) || (x > 90 && x < 262 && z < -100) || (x > -62 && x < -26 && z > 5 && z < 44) || (Math.abs(x - 110) < 5 && z < 0) || Math.hypot(x - CITY[0], z - CITY[1]) < 40;
  for (let i = 0; i < 340; i++) { const x = R(-180, 200), z = R(-90, 150); if (clear(x, z)) continue; const r = rnd(); if (r < .5) tree(x, z, R(.7, 1.1)); else if (r < .58) cypress(x, z, R(.8, 1.1)); else shrub(x, z, R(.9, 1.5)); }
  for (let i = 0; i < 14; i++) sheep(R(110, 150), R(30, 70));
}
// fishing boats drawn up on the beach below
for (const [x, r] of [[-30, .3], [-24, -.2], [-6, .1]]) { const z = SHORE + 2, b = new THREE.Group(); b.position.set(x, heightAt(x, z), z); b.rotation.y = r; scene.add(b);
  add(new THREE.CylinderGeometry(.9, .6, 5, 8, 1, true, 0, Math.PI), 'wood', 0, .9, 0, b).rotation.set(Math.PI / 2, 0, Math.PI); }

// ---------- the rooms come from books/matthew.json (engine chapter 1 = Matthew 5) ----------
buildRooms(1);
// walking routes: along the ridge path, through the stile, never across a room
VIA['1.5'] = [[10, 1], [STILE_X, 0], [22, 0]];                     // down the last leg of the trail and over the stile into the Upper Meadow
zoneLabel(5, 'The Summit', 20, 0);
