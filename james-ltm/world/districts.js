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
  drape(2.5, 27.4, 31, 30.4, 'path', .03);   // the lane from the back steps to the avenue RAISED.push(...syn.raised);
  WALKWAYS.push([11.6, 9, 12.6, 11.6], [24.3, 19, 26.7, 20.2], [24.3, 7.7, 26.7, 9.3]);   // the main door, the side door to the portico, the storeroom door
}
{ // chapter 5: the rich man's walled house, just outside the west gate among his fields
  jcRichHouse(-82, -13);
  WALKWAYS.push([-83.6, -23, -80.4, -21]);
}
