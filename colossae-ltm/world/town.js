// walking aids the engine needs (see engine/runtime.js and engine/finish.js)
const RAISED = [[BZ, 2.4, BX, 17.6, 1.7]];   // [centre z, half depth, centre x, half width, deck height]: the bridge deck lifts the ground the player stands on
const WALKWAYS = [[-2.6, GZ - 4, 2.6, GZ + 4], [-3.6, TZ + 13.5, 3.6, TZ + 16.5], [HX - 1.3, HZ + 9, HX + 1.3, HZ + 11.5], [HX + 10.5, HZ + .9, HX + 11.8, HZ + 3.1], [BX - 17.6, BZ - 1.7, BX + 17.6, BZ + 1.7], [45, -3.6, 47, 7.6]];   // kept clear of collision: gate, doorways, bridge deck
{ // merchants behind their stalls
  const MER = [['#7a3b6a', 0, 1], ['#3f6f9a', 1, 2], ['#e8dcc4', 2, 3], ['#9a5a3a', 0, 0], ['#c43a2e', 1, 1], ['#5a4a6a', 2, 2]];
  M1.forEach(([sx, sz, face], i) => { if (i === 2 || i === 3) return; const [c, sk, hr] = MER[i]; const ox = -2.75, oz = .9, lx = sx + ox * Math.cos(face) + oz * Math.sin(face), lz = sz - ox * Math.sin(face) + oz * Math.cos(face); person(lx, lz, face - .5, c, { skin: sk, hair: hr, armsUp: i % 3 === 0 }); });
  // people in the street and around town
  const P0 = [[-2.1, 56.2, .5, '#d9c39a', { carry: 'jar', veil: '#e8dcc4', skin: 1 }], [-3.3, 47, .3, '#8a5a3a', { cloak: '#5a3a2a', hair: 3 }], [3.3, 33, -2.4, '#3f6f9a', { carry: 'basket', skin: 2 }],
    [-3, 6, 1, '#efe6d4', { cloak: '#9a2a2a', hair: 3 }], [3.5, 12, -2, '#e8dcc4', { armsUp: true }], [-6, 11, .4, '#c79a3a', { veil: '#3f6f9a', skin: 2 }],
    [HX + 2.5, HZ + 1, 2.2, '#9a4a3a', { veil: '#e0b44a', skin: 2 }], [HX + 1, HZ + 13, 0, '#5a6a3a', {}], [BX + 2, BZ + .8, 1.57, '#8a6a4a', { cloak: '#6a4a2a', carry: 'basket' }], [BX + 47, BZ + 1, 3.4, '#5a4a3a', { hair: 1 }],
    [-12, 30, 1.2, '#c9a46a', { carry: 'jar', veil: '#c43a2e' }], [20, 40, 2, '#7a8a5a', {}], [-22, 62, -1, '#a8714c', { cloak: '#3a4a6a' }]];
  for (const [x, z, r, c, o] of P0) person(x, z, r, c, { ...o, y: groundY(x, z) });
}
// garden plots between houses
for (const [gx, gz] of [[-58, 8], [-30, -26], [-58, 60], [8, -30]]) { for (let r = 0; r < 5; r++) for (let c2 = 0; c2 < 8; c2++) { const x = gx + c2 * .9, z = gz + r * 1.1; add(new THREE.IcosahedronGeometry(R(.22, .32), 0), r % 2 ? 'green' : 'leaf', x, heightAt(x, z) + .15, z).scale.y = .7; } stoneWall(gx - 1, gz - 1, gx + 7.5, gz - 1, .6); }
// ---------- landmarks ----------
{ // stoa (covered colonnade) facing the temple courtyard from the west
  const sx = -30, sz = 6, y = heightAt(sx, sz); box(6, .4, 26, 'marble', sx, y, sz); box(2, 6, 26, 'wallTrim', sx - 2.5, y, sz);
  for (let i = 0; i < 9; i++) cyl(.3, .35, 5.2, 10, 'marble', sx + 2.4, y + .4, sz - 12 + i * 3);
  box(6.4, .6, 26.4, 'marble', sx, y + 5.6, sz); const r = gableRoof(6.6, 26.6, 1.6, 'roof', sx, y + 6.2, sz, 0); }
{ // tholos (round shrine) on a little green near the gate
  const tx = -32, tz = 52, y = heightAt(tx, tz); cyl(4.2, 4.6, .8, 16, 'marble', tx, y, tz); cyl(2.6, 2.6, 4, 14, 'wallTrim', tx, y + .8, tz);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cyl(.22, .26, 4, 8, 'marble', tx + Math.cos(a) * 3.7, y + .8, tz + Math.sin(a) * 3.7); }
  cyl(4.2, 4.2, .5, 16, 'marble', tx, y + 4.8, tz); add(new THREE.ConeGeometry(4.5, 2.2, 16), 'roof', tx, y + 6.4, tz); }
{ // three-storey insula block
  const ix = -36, iz = 28; const g = house(ix, iz, 12, 9, 3, Math.PI / 2); }
// ---------- town filler: more houses, trees, walls, sheep ----------
const occupied = (x, z) => (z > 41 && z < 52.5 && x < -2) || (z > 21 && z < 32.5 && x < -2) || (x > -52 && x < -40.5) || (x > -26 && x < -14.5 && z < 26) || (x > -4 && x < 47 && z > 10 && z < 24) || (x < -24 && x > -44 && z > -10 && z < 60) || (Math.abs(x) < 20 && z > -16 && z < 85) || (x > 18 && x < 46 && Math.abs(z - 2) < 13) || Math.abs(x - RIVER_X(z)) < 20 || (x > BX && x < BX + 65 && Math.abs(z - 2) < 14);
const placed = []; for (let i = 0; i < 160; i++) { const x = R(-64, 40), z = R(-34, 70); if (placed.some(([a, b]) => Math.hypot(a - x, b - z) < 9.5)) continue; if (occupied(x, z) || Math.hypot(x, z - 60) < 18) continue; placed.push([x, z]); house(x, z, R(6, 9), R(6, 8), rnd() > .6 ? 2 : 1, Math.round(R(0, 3)) * Math.PI / 2 + R(-.08, .08)); if (rnd() > .5) tree(x + R(5, 6) * (rnd() > .5 ? 1 : -1), z + R(-3, 3), R(.7, 1)); else if (rnd() > .5) cypress(x + 5.5, z + R(-3, 3), .8); }
for (let i = 0; i < 400; i++) { const x = R(-66, 44), z = R(-36, 74); if (occupied(x, z) || Math.abs(x) < 6 && z > 20) continue;
  if (placed.some(([a, b]) => Math.hypot(a - x, b - z) < 5.5)) continue; const r = rnd(); if (r < .25) tree(x, z, R(.7, 1)); else if (r < .35) cypress(x, z, R(.7, 1)); else if (r < .8) shrub(x, z, R(.9, 1.6)); }
for (let i = 0; i < 160; i++) { const x = R(-140, 200), z = R(-150, 160); if (occupied(x, z)) continue; if (Math.hypot(x - 15, z - 15) < 55 && rnd() < .7) continue; tree(x, z, R(.8, 1.2)); }
for (let i = 0; i < 26; i++) { const x = R(-90, 150), z = R(-110, 120); if (!occupied(x, z)) cypress(x, z, R(.8, 1.2)); }
for (const s of [-1, 1]) for (let z = 30; z < 74; z += 11) tree(s * 19, z, .8);
for (const [gx, gz, w, d] of [[-150, -30, 60, 50], [-140, 120, 50, 40], [110, 110, 60, 45], [140, -60, 55, 50], [-60, 120, 40, 30]]) {
  for (let x = gx; x < gx + w; x += 7) for (let z = gz; z < gz + d; z += 7) if (!occupied(x, z)) tree(x + R(-1, 1), z + R(-1, 1), R(.75, .95));
  stoneWall(gx - 4, gz - 4, gx + w, gz - 4, .9); stoneWall(gx - 4, gz - 4, gx - 4, gz + d, .9); }
for (let i = 0; i < 6; i++) { const cx = R(-120, 160), cz = R(-120, 140); if (occupied(cx, cz)) continue; for (let k = 0; k < 4; k++) cypress(cx + R(-4, 4), cz + R(-4, 4), R(.9, 1.3)); }
for (let i = 0; i < 14; i++) sheep(R(-110, -70), R(60, 110));
for (let i = 0; i < 10; i++) sheep(R(95, 130), R(40, 80));
stoneWall(-120, 50, -60, 50, 1); stoneWall(-120, 50, -120, 120, 1); stoneWall(90, 30, 140, 30, 1); stoneWall(140, 30, 140, 90, 1);
stoneWall(BX + 36, BZ + 3, BX + 70, BZ + 3, .8);

drape(-2.5, TZ + 15, 2.5, TZ + 21, 'path'); drape(-62, 45, -3, 48.5, 'path', .03); drape(-62, 25, -3, 28.5, 'path', .03); drape(-48, -30, -44.5, 70, 'path', .03); drape(-22, -30, -18.5, 22, 'path', .03); drape(-2.5, TZ + 17.5, HX + 2, TZ + 21, 'path');
// walking routes between zones, through doorways
VIA['2.1'] = [[-3.6, 61], [-3.6, 50], [0, 44], [0, TZ + 21], [0, TZ + 14]];                                   // market -> temple gate
VIA['3.1'] = [[0, TZ + 14], [0, TZ + 19], [HX, HZ + 15], [HX, HZ + 8], [HX - 4, HZ + 1.5]];  // temple -> house front door
VIA['4.1'] = [[HX + 9, HZ + 2], [HX + 13, HZ + 2], [BX - 18, BZ + 2]];                 // house side door -> riverbank
VIA['4.2'] = [[BX - 15, BZ + 4.6], [BX - 15, BZ - 1], [BX + 17, BZ - 1]];                                           // across the bridge
zoneLabel(1, 'The Market', 0, 52); zoneLabel(2, 'The Temple', 0, TZ - 2); zoneLabel(3, 'The Family House', HX, HZ - 2); zoneLabel(4, 'The Bridge & Road', BX + 18, BZ - 6);

