// ---------- the districts beyond the agora: models first, rooms later (owner, 2026-11-12) ----------
// Loaded after world/town.js (so nothing here moves the town's seeded random layout). Builders live in ltm-engine/objects/up-james-civic.js.
// Route: gate -> agora (1) -> south passage onto the avenue -> synagogue (2, off the avenue's east side) -> down to the harbour gate (3) ->
// west along the craftsmen's street (4) -> west gate -> the rich man's house at the head of the farm and vineyard (5).
{ // the two new gates in the city wall (openings cut in world/gate.js)
  jcWallGate(WALL_OPEN[1][0].a, WALL_OPEN[1][0].b);   // the west gate, out to the farm
  jcWallGate(WALL_OPEN[2][0].a, WALL_OPEN[2][0].b);   // the harbour gate, onto the quay
  WALKWAYS.push([-72, -34, -68, -24.5], [-4.6, -42, 4.6, -38]);
}
{ // roads: the craftsmen's street inside the west gate, the road out to the farm, the lane to the rich man's gate
  drape(-70, -30.5, -2.5, -27.5, 'path', .03); drape(-92, -30.5, -70, -27.5, 'path', .03); drape(-83.5, -27.5, -80.5, -21.5, 'path', .03);
}
{ // chapter 2: the synagogue, its courtyard steps on the avenue
  const syn = jcSynagogue(20, 14);
  RAISED.push(...syn.raised);
  drape(2.5, 27.4, 31, 30.4, 'path', .03);   // the lane from the back steps to the avenue
  WALKWAYS.push([15.2, 10.3, 16.8, 11.7], [21.9, 19, 23, 20.2], [23.9, 8.4, 28.1, 9.6]);   // the main door, the side door to the portico, the storeroom doorway
  RAISED.push([11, 1.2, 15.1, .9, heightAt(18.5, 14) + 1.3]);   // the steps up to the main door
  zoneLabel(2, 'The Synagogue', 24, 14);
  // walking routes into each room (world x, z); the synagogue's local frame is world - (20, 14)
  VIA['2.1'] = [[6, 50], [4, 40], [2, 34], [-.8, 27], [-.8, 18]];                       // from the agora's south passage down the avenue to the steps
  VIA['2.2'] = [[1, 14], [6, 14.2]];                                                    // up the steps onto the courtyard
  VIA['2.3'] = [[13.5, 11], [17.2, 11]];                                                // through the main door into the hall
  VIA['2.4'] = [[26.1, 12.8]];                                                          // across the hall to the storeroom doorway
  VIA['2.5'] = [[27, 15], [24.4, 16.4], [22.6, 16.8], [22.4, 19.5], [22.4, 20.9]];   // round the hall, out by the side door onto the porch (you stand with your back to the building)
  VIA['2.6'] = [[26.7, 23.6], [26, 26.4]];                                                            // out between the columns, round the scarlet-cord post, down the back steps
  buildRooms(2);
}
{ // chapter 5: the rich man's walled house, just outside the west gate among his fields
  jcRichHouse(-82, -13);
  WALKWAYS.push([-83.6, -23, -80.4, -21]);
}
{ // chapter 3: the harbour. The quay and mole are in world/harbour.js (deck top HARB_QT); here: walking on them, the rooms' built details, the rooms
  const QT = HARB_QT;
  RAISED.push([-44.35, 3.75, -11, 55, QT], [-60, 17.2, 31, 3.2, QT]);   // the quay deck (out over the water) and the mole
  { const sh = TN.ship(-1, -.35, -51, Math.PI / 2); sh.userData.moored = 1; }   // a ship moored along the quay, its stern (steering oar) at x -7: The Moorings
  { const g = new THREE.Group(); g.position.set(-10, QT, -44.65); scene.add(g);  // the fisherman's small fire: a ring of stones, embers and three flames
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, st = add(new THREE.DodecahedronGeometry(.13, 0), 'stoneDk', Math.cos(a) * .42, .06, Math.sin(a) * .42, g); st.scale.y = .7; }
    cyl(.32, .36, .05, 8, mat('ember', '#ff8a3a', { emissive: '#ff5a1a', emissiveIntensity: .8 }), 0, 0, 0, g);
    for (const [fx, fz, fs] of [[0, 0, 2.2], [.12, .08, 1.5], [-.1, -.06, 1.6]]) flame(g, fx, .04, fz, fs); }
  for (let k = 0; k < 5; k++) box(2.2, QT + 2.2 - (k + 1) * .32, .5, 'stone', -23, -2.2, -48.25 - k * .5);   // landing steps down to the water: The Landing Steps
  cyl(.22, .26, .7, 6, 'stoneDk', 32.9, QT, -66.55);                                                       // a bollard on the mole's edge: The Lighthouse
  zoneLabel(3, 'The Harbour', 0, -55);
  VIA['3.1'] = [[20, 29.2], [4.5, 29.2], [-.8, 24], [-.8, -38], [0, -41.5], [-3, -43.5]];        // from the back steps along the lane, down the avenue, out of the harbour gate
  VIA['3.2'] = [[-5.5, -43.5], [-16, -43.5]];                                                    // west along the quay, round the fire
  VIA['3.3'] = [[-16, -43.5], [-5.5, -43.5], [10, -43.5], [29, -44.2], [30.6, -50]];             // back east along the quay and out along the mole
  buildRooms(3);
}