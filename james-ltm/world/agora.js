// ---------- ZONE 1: the agora (James 1, six rooms) ----------
// Enter through the gate (heading south, -z). Rooms run clockwise: up the left (west) side, then back down the right (east).
// 1 Gate Stoa is the court just inside the gate (seen through the arch). Then up the left: 2 Tower of the Winds, 3 Tholos; back down the right: 4 Lamp Stoa, 5 Mirror Court, 6 Almshouse Portico.
const AG = { x0: -19.5, x1: 19.5, z0: 33, z1: 75.5, rx: 11, z: [67, 55, 43] };
{ // paving: one flagstone square, a little above the terrain everywhere
  drape(AG.x0, AG.z0, AG.x1, AG.z1, 'path', .06);
  // a kerb of darker stone round the square
  for (const [x0, z0, x1, z1] of [[AG.x0, AG.z0, AG.x1, AG.z0 + .3], [AG.x0, AG.z1 - .3, -3.2, AG.z1], [3.2, AG.z1 - .3, AG.x1, AG.z1]]) drape(x0, z0, x1, z1, 'stoneDk', .08);
}
// (the stoa builder and the agora buildings are shared with the object library: ltm-engine/objects/james-shared.js)
{ // west stoa behind the Gate Stoa room
  agoraStoa(-17, 61, -17, 75, { face: -1, cols: 6 });
  // east colonnade behind the Lamp Stoa room: long, white, many columns
  agoraStoa(17, 34.5, 17, 47, { face: 1, cols: 6, wall: 'travertine' });
  // south stoa closing the square, with a passage in the middle to the temple road
  agoraStoa(-19, 34.2, -3.4, 34.2, { face: 1, cols: 5 }); agoraStoa(3.4, 34.2, 19, 34.2, { face: 1, cols: 5 });
}
{ // 2 · Tower of the Winds
  towerOfTheWinds(-18.2, 55); }
{ // 3 · The Tholos
  tholos(-19.5, 42); }
{ // 5 · The Mirror Court (exedra)
  exedra(17.5, 52); }
{ // 6 · The Almshouse Portico
  almshousePortico(18, 61.5); }
{ // 1 · The Gate Stoa: a columned porch across the court just inside the gate
  gateStoaPorch(64.5); }
{ // the sacred centre of the square: a small altar
  agoraAltar(55); }
// the six rooms (each a square of five objects, viewed from the middle of the square) are built from books/james.json
buildRooms(1);

const TZ = 2, HX = 32, HZ = 2, BZ = 2, BX = RIVER_X(BZ);
