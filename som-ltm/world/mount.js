// ---------- the Mount: the summit where he sat down (Matthew 5:1) ----------
// Method rule 4 (2026-11-12): each verse on a SPOT. A spot is a feature of the place (a corner of a wall, a rock, a doorway)
// or an object that belongs there. Every room has at least two natural objects. So each room here is a real hilltop place,
// built by its own builder below, with its five spots in the fixed order: 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre.
// The walk: the Seat on the crown, round the summit (Sheepfold, Lookout, Threshing Floor), then on and down the mountain.
const GZ = -19, TZ = 0, HX = 0, HZ = 400;            // the player starts at (0, GZ + 16), just below the crown; HX/HZ unused (no houseRoom here)
const RAISED = [];
const WALKWAYS = [];
const rockM = mat('somRock', '#9a9282'), rockDk = mat('somRockDk', '#7d776b'), dryStone = mat('somWall', '#b3a58a'), thatch = mat('somThatch', '#b59a5e'), floorM = mat('somFloor', '#cdb88e'), strawM = mat('somStraw', '#d9c27a');

// the room's frame, as station() works it out: forward (away from the viewer) and right, in world x/z
function roomFrame(r) { const [x, z] = r.at, [vx, vz] = r.viewer; let fx = x - vx, fz = z - vz; const l = Math.hypot(fx, fz); fx /= l; fz /= l;
  return { x, z, fx, fz, rx: -fz, rz: fx, yaw: Math.atan2(vx - x, vz - z), y: heightAt(x, z),
    at: (f, s) => [x + fx * f + -fz * s, z + fz * f + fx * s] }; }   // f metres forward, s metres right
// the five spot positions of a square of half-size h: [forward, right] for near-left, far-left, far-right, near-right, centre
const SQ = h => [[-h, -h], [h, -h], [h, h], [-h, h], [0, 0]];
// place a library object (objects/*.js builders take a local group) at world x, z; returns the world y of its top
function libAt(id, x, z, rot = 0, s = 1) { const g = new THREE.Group(), y = heightAt(x, z); g.position.set(x, y, z); g.rotation.y = rot; g.scale.setScalar(s); scene.add(g);
  const top = OBJECTS.get(id).fn(g, 0, 0, 0); return y + (top || 1) * s; }
function somRock(x, z, s, y) { const m = add(new THREE.DodecahedronGeometry(s, 0), rnd() > .4 ? rockM : rockDk, x, (y ?? heightAt(x, z)) + s * .3, z); m.rotation.set(R(0, 3), R(0, 3), R(0, 3)); m.scale.y = .65; return (y ?? heightAt(x, z)) + s * .95; }
// hand the room to the engine: spots [{ x, y, z, what }] in the fixed order, one per verse
function finishRoom(ch, r, F, spots) {
  station(ch, r.room, r.name, F.x, F.z, [F.x + F.fx, 0, F.z + F.fz], spots.map((p, i) => ({ ...p, what: r.objects[i].what })));
  STATIONS[STATIONS.length - 1].back = r.back ?? 7; STATIONS[STATIONS.length - 1].pitch = r.pitch ?? -.32;
}

// 5:1–5 · THE SEAT: a ring of rocks on the crown; the flat seat-rock where he sat is the centre; an old olive tree behind it
defBuilder('som.seat', (r, { ch }) => { const F = roomFrame(r), h = 2.6, sp = SQ(h).map(([f, s]) => F.at(f, s));
  const tops = sp.slice(0, 4).map(([x, z], i) => somRock(x, z, i % 2 ? .95 : 1.15));
  const [cx, cz] = sp[4], seat = add(new THREE.DodecahedronGeometry(1.25, 0), rockM, cx, F.y + .3, cz); seat.scale.set(1.25, .42, 1); seat.rotation.y = .4;
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; const [x, z] = F.at(Math.cos(a) * (h + 1.8), Math.sin(a) * (h + 1.8)); if (i !== 5) somRock(x, z, R(.35, .6)); }
  { const [x, z] = F.at(h + 3.4, -1.2); tree(x, z, 1.25); }
  finishRoom(ch, r, F, [...sp.slice(0, 4).map(([x, z], i) => ({ x, z, y: tops[i] })), { x: cx, z: cz, y: F.y + .75 }]); });

// 5:6–10 · THE SHEEPFOLD: a square dry-stone pen with its gate towards you; the corners of the wall are spots 1–4, the trough the centre
defBuilder('som.fold', (r, { ch }) => { const F = roomFrame(r), h = 3, W = .55, H = .95, sp = SQ(h).map(([f, s]) => F.at(f, s));
  const seg = (a, b) => { const [x0, z0] = F.at(...a), [x1, z1] = F.at(...b), L = Math.hypot(x1 - x0, z1 - z0);
    const m = box(L, H, W, dryStone, (x0 + x1) / 2, Math.min(heightAt(x0, z0), heightAt(x1, z1)) - .1, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  seg([-h, -h], [-h, -1.1]); seg([-h, 1.1], [-h, h]); seg([-h, h], [h, h]); seg([h, h], [h, -h]); seg([h, -h], [-h, -h]);   // the gate gap faces you
  const tops = sp.slice(0, 4).map(([x, z]) => { const y = heightAt(x, z) + H - .1; add(new THREE.DodecahedronGeometry(.42, 0), rockM, x, y + .1, z).scale.y = .7; return y + .4; });   // a capstone on each corner
  const [cx, cz] = sp[4], ty = libAt('water-trough', cx, cz, F.yaw + Math.PI / 2, .9);
  for (const [f, s] of [[1.6, -1.4], [.6, 1.7], [-1.4, 1.5]]) { const [x, z] = F.at(f, s); sheep(x, z); }
  { const [x, z] = F.at(h + 1.4, h + 1.2); tree(x, z, .9); }
  finishRoom(ch, r, F, [...sp.slice(0, 4).map(([x, z], i) => ({ x, z, y: tops[i] })), { x: cx, z: cz, y: ty }]); });

// 5:11–15 · THE LOOKOUT: a farmer's field hut on the summit's edge, open towards the city on its hill across the water (5:14).
// The hut's back wall and its two posts are spots 2 and 3 (far), the jar by its door and the bench are 1 and 4 (near), the lamp on its stand the centre.
defBuilder('som.lookout', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s));
  const g = new THREE.Group(); g.position.set(F.x, F.y, F.z); g.rotation.y = F.yaw + Math.PI; scene.add(g);   // local +z = forward
  const D = h; box(.35, 2.2, .35, 'wood', -h, 0, D, g); box(.35, 2.2, .35, 'wood', h, 0, D, g);          // the two front posts of the shelter, far corners
  box(2 * h + 1.4, 2.3, .4, dryStone, 0, 0, D + 1.6, g); box(.4, 2.3, 1.6, dryStone, -h - .5, 0, D + .8, g); box(.4, 2.3, 1.6, dryStone, h + .5, 0, D + .8, g);
  box(2 * h + 2, .25, 2.6, thatch, 0, 2.25, D + .8, g);
  const t2 = F.y + 2.2, t3 = t2;
  const y1 = libAt('big-jar', ...sp[0], 0, .9), y4 = (() => { const [x, z] = sp[3], y = heightAt(x, z), b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = F.yaw; scene.add(b); box(.35, .4, .35, dryStone, -.6, 0, 0, b); box(.35, .4, .35, dryStone, .6, 0, 0, b); box(1.8, .14, .55, rockM, 0, .4, 0, b); return y + .54; })();
  const y5 = libAt('candelabrum', ...sp[4], 0, 1);
  finishRoom(ch, r, F, [{ x: sp[0][0], z: sp[0][1], y: y1 }, { x: sp[1][0], z: sp[1][1], y: t2 }, { x: sp[2][0], z: sp[2][1], y: t3 }, { x: sp[3][0], z: sp[3][1], y: y4 }, { x: sp[4][0], z: sp[4][1], y: y5 }]); });

// 5:16–20 · THE THRESHING FLOOR: a round floor of beaten earth ringed with stones; sheaves stacked at the four corners of the square
// round it (spots 1–4), the threshing sledge in the middle (centre), a winnowing fork leaning on the near sheaf.
defBuilder('som.floor', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s));
  const fl = add(new THREE.CylinderGeometry(3.3, 3.4, .14, 20), floorM, F.x, F.y + .02, F.z); fl.receiveShadow = true;
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; somRock(F.x + Math.cos(a) * 3.55, F.z + Math.sin(a) * 3.55, .28, F.y); }
  const tops = sp.slice(0, 4).map(([x, z]) => { const y = heightAt(x, z) + .1; for (let k = 0; k < 5; k++) { const m = cyl(.18, .26, 1.1, 6, strawM, x + R(-.35, .35), y, z + R(-.35, .35)); m.rotation.z = R(-.15, .15); } return y + 1.1; });
  const [cx, cz] = sp[4], sg = new THREE.Group(); sg.position.set(cx, F.y + .1, cz); sg.rotation.y = F.yaw + .3; scene.add(sg);
  box(1.1, .12, 1.9, 'woodLt', 0, 0, 0, sg); box(.1, .5, .1, 'wood', 0, .1, -.95, sg);   // the sledge
  { const [x, z] = F.at(-h + .3, -h - .7); const f = cyl(.04, .04, 2.2, 5, 'wood', x, F.y, z); f.rotation.z = .35; }   // winnowing fork
  for (let i = 0; i < 18; i++) { const a = R(0, 6.3), d = R(.5, 2.6); add(new THREE.BoxGeometry(.5, .02, .05), strawM, F.x + Math.cos(a) * d, F.y + .1, F.z + Math.sin(a) * d).rotation.y = R(0, 3); }   // chaff
  finishRoom(ch, r, F, [...sp.slice(0, 4).map(([x, z], i) => ({ x, z, y: tops[i] })), { x: cx, z: cz, y: F.y + .35 }]); });

// ---------- the city on its hill, across the water (5:14) ----------
{ const [X, Z] = CITY;
  for (let i = 0; i < 46; i++) { const a = R(0, 6.3), d = Math.sqrt(rnd()) * 26, x = X + Math.cos(a) * d, z = Z + Math.sin(a) * d;
    const w = R(4, 7), dd = R(4, 6), hh = R(2.6, 4.2) + (26 - d) * .08; box(w, hh, dd, i % 4 ? mat('somCity', '#d9c7a4') : mat('somCity2', '#c9b38c'), x, heightAt(x, z) - .4, z).rotation.y = R(-.3, .3); }
  for (let i = 0; i < 28; i++) { const a = i / 28 * 6.28; box(9, 4, 1.2, dryStone, X + Math.cos(a) * 30, heightAt(X + Math.cos(a) * 30, Z + Math.sin(a) * 30) - .5, Z + Math.sin(a) * 30).rotation.y = -a + Math.PI / 2; }
}
// ---------- the crowd, sitting on the slope below the crown, facing the Seat (5:1) ----------
{ const ROBES = ['#8a5a3a', '#3f6f9a', '#c9a46a', '#7a8a5a', '#a8714c', '#5a4a6a', '#d9c39a', '#9a5a3a', '#e8dcc4'], placed = [];
  for (let i = 0; i < 900 && placed.length < 120; i++) { const a = R(.75, 2.4), d = R(9, 34), x = Math.cos(a) * d * 1.15, z = 9 + Math.sin(a) * d;   // on the slope beyond the Seat, so the Seat stop looks across it to the crowds
    if (placed.some(([p, q]) => Math.hypot(p - x, q - z) < 1.6) || FLAT.some(([cx, cz, hw]) => Math.hypot(x - cx, z - cz) < hw + 5)) continue;
    placed.push([x, z]); person(x, z, Math.atan2(-x, 9 - z), ROBES[(rnd() * ROBES.length) | 0], { y: heightAt(x, z) - .55, veil: rnd() > .65 ? '#e8dcc4' : undefined, hair: (rnd() * 4) | 0 }); }
}
// olive trees and scrub on the slopes, clear of the rooms, the crowd and the path down
{ const clear = (x, z) => Math.hypot(x, z - 10) < 45 || FLAT.some(([cx, cz, hw]) => Math.hypot(x - cx, z - cz) < hw + 5) || Math.abs(x + 18) < 5 && z < 0 || (z < -10 && z > -60 && Math.abs(x) < 52);
  for (let i = 0; i < 300; i++) { const x = R(-170, 170), z = R(-90, 150); if (clear(x, z)) continue; const r = rnd(); if (r < .5) tree(x, z, R(.7, 1.1)); else if (r < .58) cypress(x, z, R(.8, 1.1)); else shrub(x, z, R(.9, 1.5)); }
  for (let i = 0; i < 14; i++) sheep(R(50, 90), R(30, 70));
  for (const [x, z] of [[-60, 30], [40, 40]]) stoneWall(x, z, x + 22, z, .7);
}
// fishing boats drawn up on the beach below
for (const [x, r] of [[-30, .3], [-24, -.2], [-6, .1]]) { const z = SHORE + 2, b = new THREE.Group(); b.position.set(x, heightAt(x, z), z); b.rotation.y = r; scene.add(b);
  add(new THREE.CylinderGeometry(.9, .6, 5, 8, 1, true, 0, Math.PI), 'wood', 0, .9, 0, b).rotation.set(Math.PI / 2, 0, Math.PI); }

// ---------- chapter 5 (engine chapter 1): the rooms come from books/matthew.json ----------
buildRooms(1);
zoneLabel(5, 'The Summit', 0, 0);
