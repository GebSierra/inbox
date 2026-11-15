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
  VIA['2.5'] = [[27, 15], [24.4, 16.4], [22.6, 16.8], [22.4, 19.5], [22.4, 20.9], [18.4, 21.6], [18.4, 24]];   // round the hall, out by the side door, along the porch, out between the columns
  VIA['2.6'] = [[26, 30]];                                                            // along the lane to the foot of the back steps
  buildRooms(2);
}
{ // chapter 5: the rich man's walled house, just outside the west gate among his fields
  jcRichHouse(-82, -13);
  WALKWAYS.push([-83.6, -23, -80.4, -21]);
}
