// ---------- the harbour ----------
{ const qy = 1.1;
  box(110, qy + 2, 4, 'stone', -12, -2, SHORE + 1.5); box(110, .25, 4.4, 'stoneDk', -12, qy, SHORE + 1.5);            // quay along the shore
  box(6, qy + 3, 34, 'stone', 31, -3, SHORE - 14); box(6.4, .25, 34, 'stoneDk', 31, qy, SHORE - 14);                // the mole
  for (let i = 0; i < 9; i++) cyl(.22, .26, .7, 6, 'stoneDk', -55 + i * 11, qy + .25, SHORE - .2);                  // bollards
  { const lh = TN.lighthouse(31, SHORE - 29); }
  for (const [x, z, r] of [[-20, SHORE - 9, .2], [5, SHORE - 11, -.15], [22, SHORE - 20, 1.45], [-48, SHORE - 30, .6]]) { const sh = TN.ship(x, -.35, z, r); sh.userData.y0 = -.35; sh.userData.ph = R(0, 6); SHIPS.push(sh); }
  for (let x = -66; x < 20; x += R(7, 12)) TN.palm(x, SHORE + 5 + R(0, 2), R(.9, 1.2));
  // a stepped street from the agora down to the harbour
  drape(-2.5, SHORE + 3, 2.5, 33, 'path', .05);
}
