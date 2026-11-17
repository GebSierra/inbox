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
  brushM = mat('somBrush', '#8a7a52'), floorM = mat('somFloor', '#cdb88e'), strawM = mat('somStraw', '#d9c27a'), darkM = mat('somDark', '#2c2620'),
  ironM = mat('somIron', '#4a4744'), clayM = mat('somClay', '#b5653e'), hideM = mat('somHide', '#6b4a32'), tentM = mat('somTent', '#262220'),
  ashM = mat('somAsh', '#8d8a85'), leafM = mat('somLeaf', '#5f7a3e'), cukeM = mat('somCuke', '#5d7f36'), combM = mat('somComb', '#d9a640');

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
// hand the room to the engine: spots [{ x, y, z }] in the fixed order, one per verse
function finishRoom(ch, r, F, spots) {
  station(ch, r.room, r.name, F.x, F.z, [F.x + F.fx, 0, F.z + F.fz], spots.slice(0, r.objects.filter(o => !o.extra).length).map((p, i) => ({ ...p, what: r.objects[i].what })));
  const st = STATIONS[STATIONS.length - 1]; st.back = r.back ?? 7; st.pitch = r.pitch ?? -.17;   // tilted up so the room banner shows at the top (owner, 2026-11-17)
}

// ---- 5.1 THE SEAT (5:1–5): olive tree · limestone pavement · split boulder with a thornbush · water bag on a stake · the seat-rock ----
defBuilder('som.seat', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; libAt('olive-tree-gnarled', x, z, 0, 1); out.push(ground([x, z], .6)); }
  { const g = atR(F, h, -h, .3); box(2.6, .14, 1.8, paleM, 0, -.02, 0, g); box(1.6, .12, 1.3, paleM, .9, .01, -.9, g); box(1.2, .1, 1, paleM, -1, .02, -.8, g); out.push(ground(sp[1], .25)); }   // bare limestone pavement, in broken pale slabs
  { const [x, z] = sp[2]; const a = somRock(x - .62, z, .85), b = somRock(x + .62, z + .05, .8); libAt('shrub-cluster', x, z, 0, .55); out.push({ x, z, y: Math.max(a, b) + .1 }); }   // the split boulder: two halves, a caper bush in the gap
  { const g = atR(F, -h, h); const st = cyl(.06, .08, 1.6, 6, 'wood', 0, 0, 0, g); for (const k of [-1, 1]) { const fk = cyl(.03, .04, .35, 5, 'wood', k * .08, 1.55, 0, g); fk.rotation.z = -k * .5; }
    const bag = add(new THREE.CapsuleGeometry(.24, .38, 4, 10), mat('somSkin', '#a07a50'), 0, 1.08, .2, g); bag.rotation.x = .25; cyl(.05, .07, .16, 6, mat('somSkin', '#a07a50'), 0, 1.45, .14, g); out.push(ground(sp[3], 1.75)); }   // the goatskin water bag hung on a forked stake
  { const [cx, cz] = sp[4]; const seat = cyl(1.05, 1.3, .55, 8, rockM, cx, F.y - .05, cz); seat.rotation.y = .3; box(1.5, .06, 1, paleM, cx, F.y + .5, cz).rotation.y = F.yaw; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; somRock(cx + Math.cos(a) * 1.7, cz + Math.sin(a) * 1.7, .22); } out.push({ x: cx, z: cz, y: F.y + .7 }); }   // the flat seat-rock where he sat
  { for (let k = 0; k < 4; k++) { const [x, z] = F.at(R(-4, 4), R(-4.5, 4.5)); libAt('grass-tufts', x, z, R(0, 6), 1); } }
  finishRoom(ch, r, F, out); });

// ---- 5.2 THE SHEEPFOLD (5:6–10): gateway · slab-roofed corner · oak corner · crook on the wall · water trough ----
defBuilder('som.fold', (r, { ch }) => { const F = roomFrame(r), h = 3, W = .55, H = .95, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const seg = (a, b, hh = H) => { const [x0, z0] = F.at(...a), [x1, z1] = F.at(...b), L = Math.hypot(x1 - x0, z1 - z0);
    const m = box(L, hh, W, dryStone, (x0 + x1) / 2, Math.min(heightAt(x0, z0), heightAt(x1, z1)) - .1, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  seg([-h, -h + 1.5], [-h, h], .5);   // the near wall kept low so you can see into the fold seg([-h + 1.5, -h], [h, -h]); seg([h, -h], [h, h]); seg([h, h], [-h, h]);   // the gateway is the open near-left corner
  for (const s of [-h + 1.5, -h + 1.6]) { const g = atR(F, -h, s); }
  { for (const [f, s2] of [[-h, -h + 1.6], [-h + 1.6, -h]]) { const [x, z] = F.at(f, s2); box(.6, 1.3, .6, rockM, x, heightAt(x, z) - .1, z); } out.push(ground(sp[0], .12)); }   // the gateway, two big stones either side of the gap
  { const g = atR(F, h - .7, -h + .7); for (let k = 0; k < 3; k++) box(1.6, .12, .55, rockDk, 0, H + .02, -.5 + k * .5, g); out.push(ground(sp[1], H + .2)); }
  { const [x, z] = F.at(h + 1.3, h + 1.2); tree(x, z, 1.2); out.push(ground(sp[2], H + .05)); }
  { const g = atR(F, -h - .1, h - .9); const c = cyl(.045, .045, 1.8, 6, 'wood', 0, .1, 0, g); c.rotation.x = .12; const hk = add(new THREE.TorusGeometry(.16, .045, 5, 10, Math.PI * 1.3), 'wood', 0, 1.95, -.12, g); hk.rotation.y = Math.PI / 2; out.push(ground(sp[3], .9)); }   // the shepherd's crook leaning on the low wall
  { const [cx, cz] = sp[4]; out.push({ x: cx, z: cz, y: libAt('water-trough', cx, cz, F.yaw + Math.PI / 2, .9) }); }
  for (const [f, s] of [[1.2, -1.2], [-.9, 1.3]]) { const [x, z] = F.at(f, s); libAt('ewe-and-lamb', x, z, R(0, 6), .9); }
  finishRoom(ch, r, F, out); });

// ---- 5.3 THE LOOKOUT (5:11–15): a long flat rock under a great terebinth on the lake edge, the view open to Hippos ----
// near end of the long flat rock · the terebinth's trunk · heap of cucumbers · cliff-edge boulder · lamp on its stand
defBuilder('som.lookout', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h + .2, -h - .2, -.15); const rk = box(1.1, .5, 4.2, rockM, 0, -.05, -1.6, g); rk.scale.set(1, 1, 1); box(1, .12, 4, paleM, 0, .45, -1.6, g); out.push(ground(sp[0], .65)); }   // the long flat rock, running away from you along the left
  { const [x, z] = F.at(h + .3, -h - .3); tree(x, z, 1.9); out.push(ground(sp[1], .7)); }                                   // the great terebinth over it
  { const g = atR(F, h, h); for (let k = 0; k < 16; k++) { const c = add(new THREE.CapsuleGeometry(.07, .28, 3, 6), cukeM, R(-.45, .45), .08 + (k % 3) * .1, R(-.35, .35), g); c.rotation.z = Math.PI / 2; c.rotation.y = R(0, 3); } for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(R(.15, .25), 0), leafM, R(.8, 2.4), .1, R(-1.5, 1.5), g); out.push(ground(sp[2], .45)); }
  { const [x, z] = sp[3]; out.push({ x, z, y: somRock(x, z, 1.1) }); }
  { const [cx, cz] = sp[4]; out.push({ x: cx, z: cz, y: libAt('candelabrum', cx, cz, 0, 1) }); }
  finishRoom(ch, r, F, out); });

// ---- 5.4 THE THRESHING FLOOR (5:16–20): sheaves · lone thorn tree · winnowing fork · the worn floor edge · threshing sledge ----
defBuilder('som.floor', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  add(new THREE.CylinderGeometry(3.3, 3.4, .14, 20), floorM, F.x, F.y + .02, F.z).receiveShadow = true;
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.28; add(new THREE.BoxGeometry(.6, .22, .35), paleM, F.x + Math.cos(a) * 3.54, F.y + .08, F.z + Math.sin(a) * 3.54).rotation.y = -a; }   // the raised edge
  { const [x, z] = sp[0]; for (let k = 0; k < 6; k++) { const m = cyl(.18, .26, 1.1, 6, strawM, x + R(-.35, .35), F.y, z + R(-.35, .35)); m.rotation.z = R(-.15, .15); } out.push({ x, z, y: F.y + 1.15 }); }
  { const [x, z] = F.at(h + .5, -h - .3); tree(x, z, .65); out.push(ground(sp[1], .45)); }
  { const g = atR(F, h, h); cyl(.05, .05, 1.2, 5, 'wood', 0, 0, 0, g); const f = cyl(.035, .035, 2.1, 5, 'wood', 0, .1, .35, g); f.rotation.x = .35; for (let k = -1; k <= 1; k++) box(.03, .35, .03, 'wood', k * .1, 1.95, .95, g); out.push(ground(sp[2], 1.25)); }
  out.push(ground(F.at(-2.5, 2.5), .3));                                                  // on the worn edge
  { const g = atR(F, 0, 0, .3); box(1.1, .12, 1.9, 'woodLt', 0, .05, 0, g); for (let k = 0; k < 12; k++) add(new THREE.DodecahedronGeometry(.06, 0), rockDk, R(-.45, .45), .03, R(-.85, .85), g); out.push({ x: F.x, z: F.z, y: F.y + .3 }); }
  for (let i = 0; i < 18; i++) { const a = R(0, 6.3), d = R(.5, 2.8); add(new THREE.BoxGeometry(.5, .02, .05), strawM, F.x + Math.cos(a) * d, F.y + .1, F.z + Math.sin(a) * d).rotation.y = R(0, 3); }
  finishRoom(ch, r, F, out); });

// ---- 5.5 THE QUARRY (5:21–25): chisel-marked left face · spoil heap · wedges in a crack · shear-legs · squared block on rollers ----
defBuilder('som.quarry', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, 0, -h - 1.3); box(1.4, 3.2, 2 * h + 3, paleM, 0, -.3, 0, g); for (let k = 0; k < 9; k++) box(.02, 2.6, .05, rockDk, -.71, .2, -h - 1 + k * .75, g); }   // the left face, striped
  { const g = atR(F, h + 1.6, 0); box(2 * h + 4, 3.6, 1.4, paleM, 0, -.3, 0, g); }                                                            // the back face
  out.push(ground(sp[0], .15));
  { const [x, z] = sp[1]; for (let k = 0; k < 34; k++) { const d = R(0, 1), a = R(0, 6.3); add(new THREE.DodecahedronGeometry(R(.14, .3), 0), paleM, x + Math.cos(a) * d * 1.1, heightAt(x, z) + (1 - d) * .8, z + Math.sin(a) * d * 1.1); } out.push(ground(sp[1], 1.05)); }   // the spoil heap of chippings
  { const g = atR(F, h + .4, h); box(1.8, 1.5, 1.2, paleM, 0, 0, 0, g); box(.12, 1.3, 1.22, darkM, 0, .15, 0, g); for (let k = 0; k < 3; k++) box(.16, .4, .2, ironM, 0, 1.35, -.4 + k * .4, g); out.push(ground(F.at(h + .4, h), 1.8)); }   // the crack, with iron wedges driven in
  { const g = atR(F, -h, h); for (let k = 0; k < 3; k++) { const a = k / 3 * 6.28, p = cyl(.05, .06, 2.4, 5, 'wood', Math.cos(a) * .55, 0, Math.sin(a) * .55, g); p.rotation.set(Math.sin(a) * -.21, 0, Math.cos(a) * .21); } add(new THREE.TorusGeometry(.12, .03, 4, 8), 'wood', 0, 2.6, 0, g); cyl(.01, .01, 2.3, 4, 'wood', 0, .25, 0, g); out.push(ground(sp[3], .6)); }
  { const g = atR(F, 0, 0, .2); for (const z of [-.6, .6]) { const c = cyl(.1, .1, 1.5, 7, 'wood', 0, 0, z, g); c.rotation.z = Math.PI / 2; c.position.y = .1; } box(1.2, .9, 1.6, paleM, 0, .2, 0, g); out.push({ x: F.x, z: F.z, y: F.y + 1.15 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.6 THE CHARCOAL BURNERS' CLEARING (5:26–30): smoking mound · row of stumps · axe in a block · rush baskets of charcoal · ash ring ----
defBuilder('som.charcoal', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; const m = add(new THREE.SphereGeometry(1.3, 10, 6, 0, 6.3, 0, 1.57), mat('somTurf', '#5c4a33'), x, heightAt(x, z) - .05, z); m.scale.y = .75; out.push(ground(sp[0], 1.05)); }
  { for (let k = 0; k < 3; k++) { const [x, z] = F.at(h + R(-.3, .3), -h - .8 + k * .8); cyl(.22, .26, R(.3, .45), 8, 'wood', x, heightAt(x, z), z); } out.push(ground(F.at(h, -h), .5)); }
  { const g = atR(F, h, h); cyl(.35, .38, .5, 8, 'wood', 0, 0, 0, g); const hd = cyl(.025, .025, .8, 5, 'wood', .1, .5, 0, g); hd.rotation.z = .5; box(.04, .14, .22, ironM, -.08, .5, 0, g); out.push(ground(sp[2], .55)); }
  { const g = atR(F, -h, h); for (const s of [-.35, .35]) { cyl(.3, .24, .55, 8, mat('somRush', '#a08a52'), s, 0, 0, g); cyl(.27, .27, .05, 8, darkM, s, .52, 0, g); } out.push(ground(sp[3], .6)); }
  { const m = add(new THREE.RingGeometry(.8, 1.5, 18), ashM, F.x, F.y + .04, F.z); m.rotation.x = -Math.PI / 2; out.push({ x: F.x, z: F.z, y: F.y + .1 }); }
  for (let i = 0; i < 12; i++) { const a = R(0, 6.3), d = R(7, 11), x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d; if (TRAIL_D(x, z) > 4) shrub(x, z, R(1, 1.4)); }   // the scrub round the clearing, off the trail
  finishRoom(ch, r, F, out); });

// ---- 5.7 THE BEE BANK (5:31–35): capped bank end · stacked hive pipes · smoker pot · bees' water dish · tray of comb ----
defBuilder('som.bees', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, .2, -h - .9); box(1.1, .8, 2 * h + .9, dryStone, 0, 0, 0, g); }                         // the bank along the left side, from near to far
  { const [x, z] = sp[0]; box(1.2, .9, 1.2, dryStone, x, heightAt(x, z) - .05, z); add(new THREE.SphereGeometry(.62, 8, 5, 0, 6.3, 0, 1.57), rockM, x, heightAt(x, z) + .85, z); out.push(ground(sp[0], 1.5)); }   // the bank's rounded end, with its capstone   // the capstone on its near end
  { const g = atR(F, h + .6, -h + .3); box(1.2, 1.4, 2.6, dryStone, 0, 0, 0, g); for (let row = 0; row < 3; row++) for (let k = 0; k < 4; k++) { const p = cyl(.16, .16, 1.3, 8, clayM, -.05, .2 + row * .36, -.95 + k * .38 + (row % 2) * .19, g); p.rotation.x = Math.PI / 2; p.position.y = .25 + row * .36; } out.push(ground(sp[1], 1.5)); }
  { const g = atR(F, h, h); somRock(...F.at(h, h), .45); cyl(.16, .2, .42, 8, clayM, 0, .5, 0, g); const sp2 = cyl(.04, .06, .3, 6, clayM, .16, .82, 0, g); sp2.rotation.z = -.6; for (let k = 0; k < 4; k++) { const m = add(new THREE.SphereGeometry(.12 + k * .06, 8, 6), mat('somSmoke', '#e6e1da', { transparent: true, opacity: .5 }), .3 + k * .12, 1.0 + k * .3, 0, g); } out.push(ground(sp[2], 1.0)); }   // the smoker pot, smoking
  { const g = atR(F, -h, h); cyl(.45, .35, .14, 14, clayM, 0, 0, 0, g); cyl(.4, .4, .02, 14, mat('somWater', '#4f8fa6'), 0, .12, 0, g); for (let k = 0; k < 3; k++) add(new THREE.DodecahedronGeometry(.07, 0), rockM, -.15 + k * .15, .14, R(-.1, .1), g); out.push(ground(sp[3], .3)); }   // the bees' water dish, with stones to land on
  { const g = atR(F, 0, 0); box(.9, .45, .7, rockM, 0, 0, 0, g); box(.7, .06, .5, 'woodLt', 0, .45, 0, g); for (let k = 0; k < 3; k++) box(.18, .08, .4, combM, -.22 + k * .22, .51, 0, g); out.push({ x: F.x, z: F.z, y: F.y + .62 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.8 THE SHEPHERDS' CAMP (5:36–40): guy-rope peg · the tent's open front and pole · quern · ground loom · hearth stones ----
defBuilder('som.camp', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = F.at(h + 2.2, 0); libAt('goat-hair-tent', x, z, F.yaw, 1); }   // the black goat-hair tent
  { const [x, z] = sp[0]; cyl(.03, .05, .35, 5, 'wood', x, heightAt(x, z), z); const [x2, z2] = F.at(h - .2, -h); const L = Math.hypot(x2 - x, z2 - z); const rope = box(L, .02, .02, mat('somRope', '#c8b48a'), (x + x2) / 2, heightAt(x, z) + 1, (z + z2) / 2); rope.rotation.set(0, -Math.atan2(z2 - z, x2 - x), .35); out.push(ground(sp[0], .4)); }
  out.push(ground(F.at(h - .3, -h), 1.2));                                                 // the front pole of the tent
  { const g = atR(F, h, h); cyl(.36, .38, .16, 12, rockM, 0, 0, 0, g); cyl(.34, .34, .12, 12, rockDk, 0, .16, 0, g); cyl(.02, .02, .25, 4, 'wood', .2, .28, 0, g); out.push(ground(sp[2], .4)); }
  { const g = atR(F, -h, h, .3); for (const s of [-.9, .9]) box(.06, .06, 1.6, 'wood', s, .04, 0, g); for (const f of [-.8, .8]) box(1.9, .06, .06, 'wood', 0, .04, f, g); box(1.6, .02, 1.4, mat('somWeave', '#6a5a4a'), 0, .05, 0, g); out.push(ground(sp[3], .15)); }
  { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; add(new THREE.DodecahedronGeometry(.2, 0), rockDk, F.x + Math.cos(a) * .55, F.y + .1, F.z + Math.sin(a) * .55); } add(new THREE.CircleGeometry(.45, 10), ashM, F.x, F.y + .03, F.z).rotation.x = -Math.PI / 2; out.push({ x: F.x, z: F.z, y: F.y + .3 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.9 THE RIDGE ROAD (5:41–45): gully culvert stones · carob tree · half-buried amphora · broken cart · the resting stone at the fork ----
defBuilder('som.road', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [a, b] = F.at(0, 0), [c, d] = F.at(30, 6); drape(Math.min(a, c) - 1.5, Math.min(b, d), Math.max(a, c) + 1.5, Math.max(b, d), 'path', .02); }   // the track forking off north
  { const g = atR(F, -h, -h); for (const s of [-.55, .55]) box(.4, .5, 1.1, rockM, s, -.15, 0, g); box(1.5, .14, 1.1, rockDk, 0, .3, 0, g); out.push(ground(sp[0], .55)); }
  { const [x, z] = F.at(h + .6, -h - .6); tree(x, z, 1.3); out.push(ground(sp[1], .6)); }
  { const g = atR(F, h, h, .8); const a = add(new THREE.SphereGeometry(.32, 8, 6), clayM, 0, .1, 0, g); a.scale.y = 1.5; a.rotation.z = 1.1; cyl(.07, .1, .35, 6, clayM, .45, .25, 0, g).rotation.z = 1.1; out.push(ground(sp[2], .55)); }
  { const g = atR(F, -h, h, .4); box(1.3, .12, 2, 'woodLt', 0, .55, 0, g).rotation.z = .2; const w = cyl(.5, .5, .1, 10, 'wood', .7, .5, .3, g); w.rotation.z = Math.PI / 2; const w2 = cyl(.5, .5, .1, 10, 'wood', -.75, .1, -.4, g); w2.rotation.x = Math.PI / 2; somRock(...F.at(-h + .2, h - .6), .3); out.push(ground(sp[3], .95)); }
  { const g = atR(F, 0, 0, .5); box(1.3, .35, .8, rockM, 0, 0, 0, g); out.push({ x: F.x, z: F.z, y: F.y + .45 }); }
  { const [x, z] = F.at(5, 4); const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); scene.add(g); const b = add(new THREE.CapsuleGeometry(.45, 1.1, 3, 8), mat('somCamel', '#b8915c'), 0, .5, 0, g); b.rotation.z = Math.PI / 2; add(new THREE.SphereGeometry(.4, 8, 6), mat('somCamel', '#b8915c'), 0, 1, 0, g); }   // a camel resting beyond the fork
  finishRoom(ch, r, F, out); });

// ---- 5.10 THE WATCHTOWER (5:46–48): the tower's wooden ladder · its lookout window · the vine trellis ----
defBuilder('som.tower', (r, { ch }) => { const F = roomFrame(r), h = 2.3, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const [tx, tz] = F.at(h + 2.6, -h + .4), ty = heightAt(tx, tz); cyl(2.2, 2.45, 4.2, 14, dryStone, tx, ty - .3, tz); cyl(2.35, 2.35, .3, 14, rockDk, tx, ty + 3.85, tz);
  { const g = atR(F, -h, -h, .3); for (const s of [-.25, .25]) { const p = cyl(.04, .04, 3, 5, 'wood', s, 0, 0, g); p.rotation.x = -.25; } for (let k = 0; k < 7; k++) box(.55, .04, .05, 'wood', 0, .3 + k * .4, -.08 - k * .1, g); out.push(ground(sp[0], .6)); }
  { const [wx, wz] = F.at(h + .45, -h + .4), g = atR(F, h + .45, -h + .4); box(1.1, .16, .6, rockM, 0, 1.35, .05, g); box(.8, .95, .12, darkM, 0, 1.5, -.12, g); out.push({ x: wx, z: wz, y: heightAt(wx, wz) + 1.65 }); }   // the lookout window, its sill
  { const [x, z] = sp[2]; libAt('grapevine-trellis', x, z, F.yaw, 1); out.push(ground(sp[2], .9)); { const [vx, vz] = F.at(h + 7, 6); libAt('vineyard-rows', vx, vz, F.yaw, 1); } }
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
