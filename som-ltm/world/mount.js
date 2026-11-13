// ---------- Chapter 5: the Summit (som-ltm/PLAN.md §3) ----------
// Method rule 4: each verse on a SPOT, a feature of the place (P) or an object (O); at least two natural objects per room.
// Spots in the fixed order, as seen standing on the path facing the room: 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre.
// Layout: the ridge runs along z = 0, with the trodden path on its crest. Compass: east = -x, north = +z (see world/terrain.js).
//   The Crown (east of the stile at x = STILE_X): start just east of the stile facing east; rooms 1-2 on the left (north),
//   turn at the east end, rooms 3-4 on the right (south, the lake edge) coming back to the stile.
//   The Upper Meadow (west of the stile): facing west, rooms 5-7 on the left (south), turn, rooms 8-10 on the right (north) back to the stile.
//   The path down to chapter 6 leaves from the Watchtower (room 10), down the west side of the field wall.
const GZ = -16, TZ = 0, HX = 0, HZ = 400;            // the player starts at (0, GZ + 16) = (0, 0), on the ridge path; HX/HZ unused
const RAISED = [];
const WALKWAYS = [[STILE_X - 1.5, -1.8, STILE_X + 1.5, 1.8]];   // the stile gap
const rockM = mat('somRock', '#9a9282'), rockDk = mat('somRockDk', '#7d776b'), paleM = mat('somPale', '#d9d0bb'), dryStone = mat('somWall', '#b3a58a'),
  brushM = mat('somBrush', '#8a7a52'), floorM = mat('somFloor', '#cdb88e'), strawM = mat('somStraw', '#d9c27a'), darkM = mat('somDark', '#2c2620'),
  ironM = mat('somIron', '#4a4744'), clayM = mat('somClay', '#b5653e'), hideM = mat('somHide', '#6b4a32'), tentM = mat('somTent', '#262220'),
  ashM = mat('somAsh', '#8d8a85'), leafM = mat('somLeaf', '#5f7a3e'), cukeM = mat('somCuke', '#5d7f36'), combM = mat('somComb', '#d9a640');

// the room's frame: forward (away from the viewer) and right, in world x/z, as station() works them out
function roomFrame(r) { const [x, z] = r.at, [vx, vz] = r.viewer; let fx = x - vx, fz = z - vz; const l = Math.hypot(fx, fz); fx /= l; fz /= l;
  return { x, z, fx, fz, yaw: Math.atan2(vx - x, vz - z), y: heightAt(x, z),
    at: (f, s) => [x + fx * f - fz * s, z + fz * f + fx * s] }; }   // f metres forward, s metres right
const SQ = h => [[-h, -h], [h, -h], [h, h], [-h, h], [0, 0]];
// a group standing at room coordinates (f, s), turned with the room (local +z = towards the viewer, local +x = the viewer's left)
function atR(F, f, s, rot = 0) { const [x, z] = F.at(f, s), g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = F.yaw + rot; scene.add(g); return g; }
function libAt(id, x, z, rot = 0, s = 1) { const g = new THREE.Group(), y = heightAt(x, z); g.position.set(x, y, z); g.rotation.y = rot; g.scale.setScalar(s); scene.add(g);
  const top = OBJECTS.get(id).fn(g, 0, 0, 0); return y + (top || 1) * s; }
function somRock(x, z, s, y) { const m = add(new THREE.DodecahedronGeometry(s, 0), rnd() > .4 ? rockM : rockDk, x, (y ?? heightAt(x, z)) + s * .3, z); m.rotation.set(R(0, 3), R(0, 3), R(0, 3)); m.scale.y = .65; return (y ?? heightAt(x, z)) + s * .95; }
const ground = ([x, z], up = .12) => ({ x, z, y: heightAt(x, z) + up });
// hand the room to the engine: spots [{ x, y, z }] in the fixed order, one per verse
function finishRoom(ch, r, F, spots) {
  station(ch, r.room, r.name, F.x, F.z, [F.x + F.fx, 0, F.z + F.fz], spots.slice(0, r.objects.filter(o => !o.extra).length).map((p, i) => ({ ...p, what: r.objects[i].what })));
  const st = STATIONS[STATIONS.length - 1]; st.back = r.back ?? 7; st.pitch = r.pitch ?? -.3;
}

// ---- 5.1 THE SEAT (5:1–5): olive tree · limestone pavement · split boulder with a thornbush · water bag on a stake · the seat-rock ----
defBuilder('som.seat', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; tree(x, z, 1.15); out.push(ground([x, z], .6)); }
  { const g = atR(F, h, -h, .4); box(2.2, .12, 1.6, paleM, 0, 0, 0, g); box(1.4, .1, 1.1, paleM, .5, .02, -.6, g); out.push(ground(sp[1], .2)); }
  { const [x, z] = sp[2]; const a = somRock(x - .5, z, .9), b = somRock(x + .55, z + .1, .8); shrub(x, z, 1.1); out.push({ x, z, y: Math.max(a, b) }); }
  { const g = atR(F, -h, h); cyl(.06, .07, 1.5, 6, 'wood', 0, 0, 0, g); const bag = add(new THREE.SphereGeometry(.32, 8, 6), hideM, 0, 1.15, .14, g); bag.scale.set(1, 1.3, .7); out.push(ground(sp[3], 1.55)); }
  { const [cx, cz] = sp[4], seat = add(new THREE.DodecahedronGeometry(1.25, 0), rockM, cx, F.y + .3, cz); seat.scale.set(1.25, .42, 1); seat.rotation.y = .4; out.push({ x: cx, z: cz, y: F.y + .75 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.2 THE SHEEPFOLD (5:6–10): gateway · slab-roofed corner · oak corner · crook on the wall · water trough ----
defBuilder('som.fold', (r, { ch }) => { const F = roomFrame(r), h = 3, W = .55, H = .95, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const seg = (a, b) => { const [x0, z0] = F.at(...a), [x1, z1] = F.at(...b), L = Math.hypot(x1 - x0, z1 - z0);
    const m = box(L, H, W, dryStone, (x0 + x1) / 2, Math.min(heightAt(x0, z0), heightAt(x1, z1)) - .1, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  seg([-h, -h + 1.5], [-h, h]); seg([-h + 1.5, -h], [h, -h]); seg([h, -h], [h, h]); seg([h, h], [-h, h]);   // the gateway is the open near-left corner
  for (const s of [-h + 1.5, -h + 1.6]) { const g = atR(F, -h, s); }
  { const [x, z] = sp[0]; somRock(x + R(-.3, .3), z, .35); out.push(ground(sp[0], .12)); }
  { const g = atR(F, h - .7, -h + .7); for (let k = 0; k < 3; k++) box(1.6, .12, .55, rockDk, 0, H + .02, -.5 + k * .5, g); out.push(ground(sp[1], H + .2)); }
  { const [x, z] = F.at(h + 1.3, h + 1.2); tree(x, z, 1.2); out.push(ground(sp[2], H + .05)); }
  { const g = atR(F, -h, h - .9); const c = cyl(.03, .03, 1.6, 5, 'wood', 0, .2, -.32, g); c.rotation.x = .25; out.push(ground(sp[3], H + .05)); }
  { const [cx, cz] = sp[4]; out.push({ x: cx, z: cz, y: libAt('water-trough', cx, cz, F.yaw + Math.PI / 2, .9) }); }
  for (const [f, s] of [[1.4, -1.4], [.5, 1.6], [-1.3, 1.1]]) { const [x, z] = F.at(f, s); sheep(x, z); }
  finishRoom(ch, r, F, out); });

// ---- 5.3 THE LOOKOUT (5:11–15): gourd on a pole · brushwood back wall · heap of cucumbers · cliff-edge boulder · lamp on its stand ----
defBuilder('som.lookout', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const booth = atR(F, h * .55, 0, Math.PI);                     // local +z = forward
  for (const s of [-h - .6, h + .6]) for (const f of [0, h * .9]) cyl(.07, .08, 2.3, 6, 'wood', s, 0, f, booth);
  box(2 * h + 1.6, 2.1, .25, brushM, 0, 0, h * .9 + .15, booth);                       // the woven back wall
  box(2 * h + 2, .2, h * .9 + 1, brushM, 0, 2.25, h * .45, booth);                     // the brushwood roof
  { const g = atR(F, -h, -h); cyl(.06, .07, 1.9, 6, 'wood', 0, 0, 0, g); add(new THREE.SphereGeometry(.22, 8, 6), mat('somGourd', '#c9a24e'), .14, 1.45, 0, g).scale.y = 1.4; out.push(ground(sp[0], 1.95)); }
  out.push(ground(F.at(h + .4, -h), 1.2));                                                // on the back wall (its middle, so the marker rests on it)
  { const g = atR(F, h - .3, h); for (let k = 0; k < 14; k++) { const c = add(new THREE.CapsuleGeometry(.07, .28, 3, 6), cukeM, R(-.4, .4), .1 + (k % 3) * .1, R(-.3, .3), g); c.rotation.z = Math.PI / 2; c.rotation.y = R(0, 3); } out.push(ground(F.at(h - .3, h), .5)); }
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
  { const [x, z] = sp[1]; for (let k = 0; k < 16; k++) add(new THREE.DodecahedronGeometry(R(.12, .3), 0), paleM, x + R(-.6, .6), heightAt(x, z) + R(0, .4), z + R(-.6, .6)); out.push(ground(sp[1], .7)); }
  { const g = atR(F, h + .4, h); box(1.4, 1.4, 1, paleM, 0, 0, 0, g); box(.03, 1.2, 1.02, darkM, .1, .1, 0, g); for (let k = 0; k < 3; k++) box(.08, .25, .14, ironM, .1, 1.1, -.3 + k * .3, g); out.push(ground(F.at(h + .4, h), 1.45)); }
  { const g = atR(F, -h, h); for (let k = 0; k < 3; k++) { const a = k / 3 * 6.28, p = cyl(.05, .06, 3.2, 5, 'wood', Math.cos(a) * .7, 0, Math.sin(a) * .7, g); p.rotation.set(Math.sin(a) * -.21, 0, Math.cos(a) * .21); } add(new THREE.TorusGeometry(.12, .03, 4, 8), 'wood', 0, 2.6, 0, g); cyl(.01, .01, 2.3, 4, 'wood', 0, .25, 0, g); out.push(ground(sp[3], .6)); }
  { const g = atR(F, 0, 0, .2); for (const z of [-.6, .6]) { const c = cyl(.1, .1, 1.5, 7, 'wood', 0, 0, z, g); c.rotation.z = Math.PI / 2; c.position.y = .1; } box(1.2, .9, 1.6, paleM, 0, .2, 0, g); out.push({ x: F.x, z: F.z, y: F.y + 1.15 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.6 THE CHARCOAL BURNERS' CLEARING (5:26–30): smoking mound · row of stumps · axe in a block · rush baskets of charcoal · ash ring ----
defBuilder('som.charcoal', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; const m = add(new THREE.SphereGeometry(1.3, 10, 6, 0, 6.3, 0, 1.57), mat('somTurf', '#5c4a33'), x, heightAt(x, z) - .05, z); m.scale.y = .75; out.push(ground(sp[0], 1.05)); }
  { for (let k = 0; k < 3; k++) { const [x, z] = F.at(h + R(-.3, .3), -h - .8 + k * .8); cyl(.22, .26, R(.3, .45), 8, 'wood', x, heightAt(x, z), z); } out.push(ground(F.at(h, -h), .5)); }
  { const g = atR(F, h, h); cyl(.35, .38, .5, 8, 'wood', 0, 0, 0, g); const hd = cyl(.025, .025, .8, 5, 'wood', .1, .5, 0, g); hd.rotation.z = .5; box(.04, .14, .22, ironM, -.08, .5, 0, g); out.push(ground(sp[2], .55)); }
  { const g = atR(F, -h, h); for (const s of [-.35, .35]) { cyl(.3, .24, .55, 8, mat('somRush', '#a08a52'), s, 0, 0, g); cyl(.27, .27, .05, 8, darkM, s, .52, 0, g); } out.push(ground(sp[3], .6)); }
  { const m = add(new THREE.RingGeometry(.8, 1.5, 18), ashM, F.x, F.y + .04, F.z); m.rotation.x = -Math.PI / 2; out.push({ x: F.x, z: F.z, y: F.y + .1 }); }
  for (let i = 0; i < 12; i++) { const a = R(0, 6.3), d = R(7, 11), x = F.x + Math.cos(a) * d, z = F.z + Math.sin(a) * d; if (Math.abs(z) > 4) shrub(x, z, R(1, 1.4)); }   // the scrub round the clearing
  finishRoom(ch, r, F, out); });

// ---- 5.7 THE BEE BANK (5:31–35): capped bank end · stacked hive pipes · smoker pot · bees' water dish · tray of comb ----
defBuilder('som.bees', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, .2, -h - .3); box(1.1, 1.1, 2 * h + .9, dryStone, 0, 0, 0, g); }                         // the bank along the left side, from near to far
  { const [x, z] = sp[0]; add(new THREE.SphereGeometry(.6, 8, 5, 0, 6.3, 0, 1.57), rockM, x, heightAt(x, z) + 1.05, z); out.push(ground(sp[0], 1.55)); }   // the capstone on its near end
  { const g = atR(F, h + .6, -h + .3); box(1.2, 1.4, 2.6, dryStone, 0, 0, 0, g); for (let row = 0; row < 3; row++) for (let k = 0; k < 4; k++) { const p = cyl(.16, .16, 1.3, 8, clayM, -.05, .2 + row * .36, -.95 + k * .38 + (row % 2) * .19, g); p.rotation.x = Math.PI / 2; p.position.y = .25 + row * .36; } out.push(ground(sp[1], 1.5)); }
  { const g = atR(F, h, h); somRock(...F.at(h, h), .45); cyl(.13, .17, .32, 8, clayM, 0, .5, 0, g); out.push(ground(sp[2], .95)); }
  { const g = atR(F, -h, h); cyl(.38, .3, .1, 12, clayM, 0, 0, 0, g); out.push(ground(sp[3], .2)); }
  { const g = atR(F, 0, 0); box(.9, .45, .7, rockM, 0, 0, 0, g); box(.7, .06, .5, 'woodLt', 0, .45, 0, g); for (let k = 0; k < 3; k++) box(.18, .08, .4, combM, -.22 + k * .22, .51, 0, g); out.push({ x: F.x, z: F.z, y: F.y + .62 }); }
  finishRoom(ch, r, F, out); });

// ---- 5.8 THE SHEPHERDS' CAMP (5:36–40): guy-rope peg · the tent's open front and pole · quern · ground loom · hearth stones ----
defBuilder('som.camp', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, h + 1.6, 0, Math.PI); box(2 * h + 2.4, 1.9, 3, tentM, 0, 0, .1, g); box(2 * h + 2.4, .08, .9, tentM, 0, 1.85, -1.6, g); cyl(.05, .05, 2.1, 5, 'wood', -h, 0, -1.9, g); cyl(.05, .05, 2.1, 5, 'wood', h, 0, -1.9, g); }   // the black tent, its front awning on poles
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
  const [tx, tz] = F.at(h + 1.4, -.6), ty = heightAt(tx, tz); cyl(2.3, 2.6, 5.5, 14, dryStone, tx, ty - .3, tz); cyl(2.45, 2.45, .3, 14, rockDk, tx, ty + 5.1, tz);
  { const g = atR(F, -h, -h, .3); for (const s of [-.25, .25]) { const p = cyl(.04, .04, 3, 5, 'wood', s, 0, 0, g); p.rotation.x = -.25; } for (let k = 0; k < 7; k++) box(.55, .04, .05, 'wood', 0, .3 + k * .4, -.08 - k * .1, g); out.push(ground(sp[0], .6)); }
  { const g = atR(F, h - .3, -h + .9); box(.9, .14, .5, rockM, 0, 1.25, 0, g); box(.7, .8, .1, darkM, 0, 1.4, -.26, g); out.push(ground(F.at(h - .3, -h + .9), 1.55)); }   // the window, its sill
  { const g = atR(F, h, h); for (const s of [-.8, .8]) cyl(.05, .06, 2, 5, 'wood', s, 0, 0, g); box(1.9, .06, .1, 'wood', 0, 1.95, 0, g); for (let k = 0; k < 7; k++) add(new THREE.IcosahedronGeometry(R(.25, .35), 0), leafM, R(-.9, .9), R(1.3, 2.1), R(-.15, .15), g); out.push(ground(sp[2], .9)); }
  finishRoom(ch, r, F, out); });

// ---------- the stile: the field wall across the ridge, between the Crown and the Upper Meadow (outline break 5:20 / 5:21) ----------
{ for (const [z0, z1] of [[-26, -1.6], [1.6, 26]]) { const L = z1 - z0, zc = (z0 + z1) / 2; box(.6, 1.1, L, dryStone, STILE_X, heightAt(STILE_X, zc) - .15, zc); }
  for (const dx of [-.7, 0, .7]) box(.6, .25 + (dx === 0 ? .25 : 0), 1.6, rockM, STILE_X + dx, heightAt(STILE_X, 0) - .05, 0); }

// ---------- Hippos, the city on its hill across the lake (5:14) ----------
{ const [X, Z] = CITY;
  for (let i = 0; i < 60; i++) { const a = R(0, 6.3), d = Math.sqrt(rnd()) * 30, x = X + Math.cos(a) * d, z = Z + Math.sin(a) * d;
    box(R(5, 9), R(3, 6), R(5, 8), i % 4 ? mat('somCity', '#d9c7a4') : mat('somCity2', '#c9b38c'), x, heightAt(x, z) - .4, z).rotation.y = R(-.3, .3); }
  for (let i = 0; i < 30; i++) { const a = i / 30 * 6.28, x = X + Math.cos(a) * 34, z = Z + Math.sin(a) * 34; box(8, 5, 1.5, dryStone, x, heightAt(x, z) - .5, z).rotation.y = -a + Math.PI / 2; }
}
// ---------- the crowd, sitting on the north slope beyond the Seat, facing it (5:1) ----------
{ const ROBES = ['#8a5a3a', '#3f6f9a', '#c9a46a', '#7a8a5a', '#a8714c', '#5a4a6a', '#d9c39a', '#9a5a3a', '#e8dcc4'], placed = [], [sx, sz] = [-2, 11];
  for (let i = 0; i < 900 && placed.length < 110; i++) { const x = R(-14, 10), z = R(19, 48);
    if (placed.some(([p, q]) => Math.hypot(p - x, q - z) < 1.6)) continue;
    placed.push([x, z]); person(x, z, Math.atan2(sx - x, sz - z), ROBES[(rnd() * ROBES.length) | 0], { y: heightAt(x, z) - .55, veil: rnd() > .65 ? '#e8dcc4' : undefined, hair: (rnd() * 4) | 0 }); }
}
// ---------- olive trees and scrub on the slopes, clear of the ridge path, the rooms, the crowd and the path down ----------
{ const clear = (x, z) => (Math.abs(z) < 21 && x > -45 && x < 95) || (x > -16 && x < 12 && z > 17 && z < 50) || (Math.abs(x - 19) < 5 && z < 0) || Math.hypot(x - CITY[0], z - CITY[1]) < 40;
  for (let i = 0; i < 340; i++) { const x = R(-180, 200), z = R(-90, 150); if (clear(x, z)) continue; const r = rnd(); if (r < .5) tree(x, z, R(.7, 1.1)); else if (r < .58) cypress(x, z, R(.8, 1.1)); else shrub(x, z, R(.9, 1.5)); }
  for (let i = 0; i < 14; i++) sheep(R(110, 150), R(30, 70));
}
// fishing boats drawn up on the beach below
for (const [x, r] of [[-30, .3], [-24, -.2], [-6, .1]]) { const z = SHORE + 2, b = new THREE.Group(); b.position.set(x, heightAt(x, z), z); b.rotation.y = r; scene.add(b);
  add(new THREE.CylinderGeometry(.9, .6, 5, 8, 1, true, 0, Math.PI), 'wood', 0, .9, 0, b).rotation.set(Math.PI / 2, 0, Math.PI); }

// ---------- the rooms come from books/matthew.json (engine chapter 1 = Matthew 5) ----------
buildRooms(1);
// walking routes: along the ridge path, through the stile, never across a room
VIA['1.3'] = [[-28, 0], [-38, 0], [-28, 0]];                       // the Crown loop turns at its east end
VIA['1.5'] = [[10, 0], [STILE_X, 0], [22, 0]];                     // over the stile into the Upper Meadow
VIA['1.8'] = [[78, 0], [88, 0], [78, 0]];                          // the Meadow loop turns at its west end
zoneLabel(5, 'The Summit', 20, 0);
