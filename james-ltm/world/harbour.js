// ---------- the harbour ----------
var HARB_QT = heightAt(-11, -43.6) + .12;   // the quay's deck: flush with the levelled shore, so the harbour gate opens straight onto it (walkable: world/districts.js)
{ const qy = HARB_QT;
  box(110, qy + 2.4, 7.3, 'stone', -11, -2.5, -44.35); box(110, .12, 7.4, 'stoneDk', -11, qy - .1, -44.35).userData.nocol = 1;   // quay from the city wall out over the water
  box(110, .2, .5, 'marble', -11, qy - .08, -47.85).userData.nocol = 1;                                                         // coping along the water's edge
  box(6, qy + 3, 34, 'stone', 31, -3, SHORE - 14); box(6.4, .12, 34, 'stoneDk', 31, qy - .1, SHORE - 14).userData.nocol = 1;   // the mole
  for (let i = 0; i < 9; i++) cyl(.22, .26, .7, 6, 'stoneDk', -55 + i * 11, qy, -47.55);                                     // bollards
  { const lh = TN.lighthouse(31, SHORE - 29); }
  for (const [x, z, r] of [[-20, SHORE - 9, .2], [5, SHORE - 11, -.15], [22, SHORE - 20, 1.45], [-48, SHORE - 30, .6]]) { const sh = TN.ship(x, -.35, z, r); sh.userData.y0 = -.35; sh.userData.ph = R(0, 6); SHIPS.push(sh); }
  for (let x = -66; x < 20; x += R(7, 12)) TN.palm(x, SHORE + 5 + R(0, 2), R(.9, 1.2));
  // a stepped street from the agora down to the harbour
  drape(-2.5, SHORE + 3, 2.5, 33, 'path', .05);
}
