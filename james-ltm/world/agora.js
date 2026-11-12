// ---------- ZONE 1: the agora (James 1, six rooms) ----------
// Enter through the gate (heading south, -z). Rooms run clockwise: up the left (west) side, then back down the right (east).
// Layout (owner's fix, 2026-11-12): ONE closed ring of stoas round the square. Every room is a bay in that ring, walled on both sides with a lintel across its mouth;
// you stand on the square at the mouth and look in. The Gate Stoa is the walled court between the gate towers and an inner gateway (propylon).
//   square: x -13.5..13.5 (bay mouths), z 37 (south stoa) .. 60 (north stoa).  bays: x 13.5..20.5 each side.
//   west: 3 Tholos z 37..48.5, 2 Tower of the Winds z 48.5..60.   east: 4 Lamp Stoa z 37..44.67, 5 Mirror Court 44.67..52.33, 6 Almshouse Portico 52.33..60.
const AG = { x0: -20.5, x1: 20.5, z0: 33, z1: 64, mouth: 13.5, back: 20.5, west: [37, 48.5, 60], east: [37, 44.67, 52.33, 60] };
{ // paving: the square and the bays, and the gate court
  drape(AG.x0, AG.z0, AG.x1, AG.z1, 'path', .06);
  drape(-7.5, AG.z1, 7.5, 76, 'path', .06);
  for (const [x0, z0, x1, z1] of [[-AG.mouth, 36.8, AG.mouth, 37.1], [-AG.mouth, 59.9, AG.mouth, 60.2]]) drape(x0, z0, x1, z1, 'stoneDk', .08);
}
// (the stoa builder and the agora buildings are shared with the object library: ltm-engine/objects/james-shared.js, objects/up-james-civic.js)
{ // the ring of stoas
  agoraStoa(-20.5, 35, -3.4, 35, { face: 1, cols: 6 }); agoraStoa(3.4, 35, 20.5, 35, { face: 1, cols: 6 });          // south: a passage in the middle to the avenue
  agoraStoa(-20.5, 62, -7.5, 62, { face: -1, cols: 5 }); agoraStoa(7.5, 62, 20.5, 62, { face: -1, cols: 5 });         // north, either side of the gate court
  agoraStoa(17, AG.east[0], 17, AG.east[1], { face: 1, cols: 2, depth: 7, wall: 'travertine' });                       // 4 · the Lamp Stoa bay (roofed)
  agoraStoa(-6.25, 64, -6.25, 75.6, { face: -1, cols: 4, depth: 2.5 }); agoraStoa(6.25, 64, 6.25, 75.6, { face: 1, cols: 4, depth: 2.5 });   // 1 · the gate court's side colonnades
  jcPropylon(62);                                                                                                      // the inner gateway from the gate court into the square
  // bay walls (stoa ends) and the lintels across the bay mouths
  for (const zz of AG.west) jcBayWall(-AG.back, zz, -AG.mouth, zz);
  for (const zz of AG.east) jcBayWall(AG.mouth, zz, AG.back, zz);
  for (let i = 0; i < 2; i++) jcBayLintel(-AG.mouth, AG.west[i], -AG.mouth, AG.west[i + 1]);
  for (let i = 1; i < 3; i++) jcBayLintel(AG.mouth, AG.east[i], AG.mouth, AG.east[i + 1]);
  // back walls of the open bays, either side of the landmark that stands at the back
  for (const [z0, z1] of [[37, 39.5], [46, 48.5], [48.5, 51.3], [57.2, 60]]) jcBayWall(-AG.back, z0, -AG.back, z1, 4.6);
  for (const [z0, z1] of [[44.67, 45.7], [51.3, 52.33]]) jcBayWall(AG.back, z0, AG.back, z1, 4.6);
}
{ // 2 · Tower of the Winds, at the back of its bay
  towerOfTheWinds(-23.9, 54.25); }
{ // 3 · The Tholos, at the back of its bay
  tholos(-26.4, 42.75); }
{ // 5 · The Mirror Court (exedra), filling its bay
  exedra(18, 48.5); }
{ // 6 · The Almshouse Portico, its porch at the back of its bay
  almshousePortico(24.6, 56.17); }
{ // the sacred centre of the square: a small altar
  agoraAltar(48.5); }
{ // shops and houses packed round the outside of the ring, so the agora sits inside the town (flat-roofed blocks, own variation, no R())
  const blocks = [[-29, 30, -20.6, 37], [-31, 60.2, -20.6, 75], [-29, 38.5, -32, 38.5], [20.6, 32, 29, 44.6], [20.6, 44.8, 29, 51.2], [7.6, 64.2, 20.6, 75], [-20.6, 64.2, -7.6, 75], [20.6, 61.3, 29, 75]];
  let s = 4242; const rn = () => ((s = (s * 48271) % 2147483647) - 1) / 2147483646;
  for (const [x0, z0, x1, z1] of blocks) { if (Math.abs(x1 - x0) < 2 || Math.abs(z1 - z0) < 2) continue;
    const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), nx = Math.max(1, Math.round(w / 7)), nz = Math.max(1, Math.round(d / 7));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const cx = Math.min(x0, x1) + (i + .5) * w / nx, cz = Math.min(z0, z1) + (j + .5) * d / nz;
      const hh = 3.2 + rn() * 3.2, col = ['#e2cfaa', '#d8b98c', '#e8dcc0', '#cfa77a'][Math.floor(rn() * 4)], y = heightAt(cx, cz) - .3;
      box(w / nx - .3, hh, d / nz - .3, mat('agBlk' + col, col), cx, y, cz); box(w / nx, .3, d / nz, mat('neRoof', '#d2b48a'), cx, y + hh, cz).userData.nocol = 1; } }
}
// the six rooms (each a square of five objects, viewed from the mouth of its bay) are built from books/james.json
buildRooms(1);
const TZ = 2, HX = 32, HZ = 2, BZ = 2, BX = RIVER_X(BZ);
