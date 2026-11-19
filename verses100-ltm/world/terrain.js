// ---------- the road: one long walk from a summit at dawn (Genesis 1:1) down through Bible lands (verses100-ltm/PLAN.md) ----------
// Compass: the road runs east along +x. Phase 1 (districts 1-5) lies between x -230 and x 100, on z ≈ 0.
//   1 The Dawn Garden   x -226 … -170   the summit, the road falling east
//   2 The Roman Road    x -165 … -102   a paved road down to the town's west gate (x -102)
//   3 The Synagogue     x -102 … -44    a walled town; the synagogue's origin at SO
//   4 The Tabernacle    x 0 … 46        its court outside the town, the gate on the west side
//   5 The Father's House x 59 … 96      a courtyard house with an upper floor, the olive-press yard behind it
// The engine's collision grid covers x and z from -260 to 290: later districts turn north and come back west inside it.
const SO = [-70, 0];                     // the synagogue's origin (objects/up-james-civic.js jcSynagogue), James's tested room positions are relative to it
const GZ = -16, TZ = 0, HX = 0, HZ = 400;  // engine: the player starts at (0, GZ + 16) before after.js moves them to room 1; house.js unused
const RAISED = [];                       // [cz, halfD, cx, halfW, deckY]: decks and steps you walk on
const WALKWAYS = [];                     // [x0, z0, x1, z1]: doorways kept clear of the collision grid
const SUMMIT = [-224, 0];
// the road's centre line (paving, colour and the walk between rooms)
const ROAD = [[-232, 0], [-150, 0], [-102, 0], [-89, 0]];
const ROAD_D = (x, z) => { let d = 1e9; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t)); } return d; };
function hRaw(x, z) {
  let h = 1.5 + Math.sin(x * 0.031) * .5 + Math.cos(z * 0.027) * .45 + Math.sin((x + z) * 0.05) * .25;
  if (x < -110) h += (-110 - x) * .12;                                          // the long slope down from the summit to the town
  h += 3 * Math.exp(-((x - SUMMIT[0]) ** 2 + (z - SUMMIT[1]) ** 2) / (2 * 22 * 22));   // the summit's crown
  h += Math.max(0, Math.abs(z) - 60) * .12;                                      // hills either side of the valley
  h += 2.0 * Math.exp(-((x + 128) ** 2 + (z - 8.4) ** 2) / (2 * 2.6 * 2.6));    // the knoll outside the town wall (Romans 5:8)
  return h;
}
// level pads under rooms and buildings: [cx, cz, halfW, halfD]; places.js adds one per room from the book before the ground is built
const FLAT = [];
const heightAt = (x, z) => { let h = hRaw(x, z);
  for (const [cx, cz, hw, hd] of FLAT) { const dx = Math.max(0, Math.abs(x - cx) - hw), dz = Math.max(0, Math.abs(z - cz) - hd), d = Math.hypot(dx, dz);
    const fl = hRaw(cx, cz); if (d === 0) { h = fl; continue; }
    if (d < 5) { const w = 1 - d / 5, s = w * w * (3 - 2 * w); h = h * (1 - s) + fl * s; } }
  return h; };
