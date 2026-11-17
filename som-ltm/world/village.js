// ---------- Chapter 7: the Shore Village (som-ltm/PLAN.md §5) ----------
// An unwalled fishing village on the flat strip of beach below the farm, where the lakeside highway (the village street) runs.
// Flat ground, so rule 6's clockwise form: enter at the east end (where the lane from the farm's lower gate meets the street),
// face west: rooms 1–3 on the left (the lake side), turn at the west end, rooms 4–6 on the right (the hill side) back east.
// The dry wadi crosses the street just west of the entrance: 7.6, the House on the Sand, stands in its bed; 7.5, the House on the Rock, on its west bank.
const sandM = mat('somSand', '#e2cf9e'), reedM = mat('somReed', '#b9a76a'), palmM = mat('somPalm', '#6d8a3a'), fishM = mat('somFish', '#9fb0b8');

// ---- 7.1 THE BOATWRIGHT'S YARD (7:1–5): planks · saw pit · pitch pot · trestle and adze · half-built hull on trestles ----
defBuilder('som.boat', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h, .2); for (let k = 0; k < 6; k++) box(2.2, .08, .32, 'woodLt', 0, k * .09, (k % 2) * .05, g); out.push(ground(sp[0], .65)); }   // the stack of planks
  { const [x, z] = sp[1], y = heightAt(x, z); const pit = box(2, .05, .8, darkM, x, y + .01, z); pit.rotation.y = F.yaw; for (const s2 of [-.7, .7]) { const [bx, bz] = F.at(h + s2, -h); cyl(.06, .06, .9, 5, 'wood', bx, y, bz); } const [lx, lz] = F.at(h, -h); const lg = box(.25, .25, 2.2, 'wood', lx, y + .85, lz); lg.rotation.y = F.yaw + Math.PI / 2; out.push({ x, z, y: y + 1.2 }); }   // the saw pit, a log across it
  { const [x, z] = sp[2], y = heightAt(x, z); for (let k = 0; k < 3; k++) { const a = k / 3 * 6.28; add(new THREE.DodecahedronGeometry(.15, 0), rockDk, x + Math.cos(a) * .3, y + .08, z + Math.sin(a) * .3); } cyl(.26, .2, .38, 10, darkM, x, y + .12, z); out.push({ x, z, y: y + .62 }); }   // the pot of pitch on its hearth stones
  { const g = atR(F, -h, h); for (const s2 of [-.6, .6]) for (const f2 of [-.25, .25]) cyl(.05, .05, .8, 5, 'wood', s2, 0, f2, g); box(1.5, .1, .6, 'woodLt', 0, .8, 0, g); box(.1, .1, .5, ironM, .2, .9, 0, g); cyl(.03, .03, .45, 5, 'wood', .2, .9, .25, g).rotation.x = Math.PI / 2; out.push(ground(sp[3], 1.1)); }   // the trestle with an adze
  { const g = atR(F, 0, 0, Math.PI / 2); for (const s2 of [-.8, .8]) { box(.15, .5, .9, 'wood', s2, 0, 0, g); }
    const hull = add(new THREE.CylinderGeometry(.75, .75, 3.2, 10, 1, true, Math.PI / 2, Math.PI), 'woodLt', 0, .95, 0, g); hull.rotation.z = Math.PI / 2; hull.material.side = THREE.DoubleSide;
    for (let k = -3; k <= 3; k++) { const rib = add(new THREE.TorusGeometry(.75, .04, 4, 10, Math.PI), 'wood', k * .45, .95, 0, g); rib.rotation.y = Math.PI / 2; rib.rotation.z = Math.PI; } out.push({ x: F.x, z: F.z, y: F.y + 1.05 }); }   // the half-built hull on trestles
  finishRoom(ch, r, F, out); });

// ---- 7.2 THE FISHERMAN'S COURT (7:6–10): courtyard entrance · salting vat · net on poles · basket of fish · mending stone with rope ----
defBuilder('som.fisher', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, 0, 0, Math.PI);
  box(.5, .9, 2 * h + 2, basaltM, -h - .9, 0, 0, g); box(.5, .9, 2 * h + 2, basaltM, h + .9, 0, 0, g);                       // basalt side walls
  box(2 * h + 2.3, .9, .5, basaltM, 0, 0, h + 1.3, g); box(2 * h + 2.3, 2.8, 2.4, basaltM, 0, 0, h + 2.7, g);                    // the back wall and the house behind it
  box(2 * h - 1.2, .5, .5, basaltM, .9, 0, -h - 1, g);                                                                            // the front wall, with the entrance at the near-left
  out.push(ground(F.at(-h - 1, -h + .2), .15));                                                                                   // the courtyard entrance
  { const s2 = atR(F, h, -h); box(1.2, .8, .9, rockM, 0, 0, 0, s2); box(1, .05, .7, waterM, 0, .76, 0, s2); out.push(ground(sp[1], .95)); }   // the fish-salting vat
  { const [x, z] = sp[2]; libAt('fishing-net', x, z, F.yaw, 1); out.push(ground(sp[2], .5)); }   // the net drying on poles
  { const [x, z] = sp[3]; out.push({ x, z, y: libAt('basket-of-fish', x, z, F.yaw, 1) }); }   // the basket of fish
  { const g2 = atR(F, 0, 0); box(.9, .45, .7, basaltM, 0, 0, 0, g2); add(new THREE.TorusGeometry(.22, .07, 5, 12), mat('somRope', '#c8b48a'), 0, .52, 0, g2).rotation.x = Math.PI / 2; out.push({ x: F.x, z: F.z, y: F.y + .65 }); }   // the mending stone with a coil of rope
  finishRoom(ch, r, F, out); });

// ---- 7.3 THE TAX TABLE (7:11–15): tax table and scales · mounting step · tethering rail · trade bales · the narrow jetty ----
defBuilder('som.tax', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const g = atR(F, -h, -h); box(1.4, .08, .8, 'woodLt', 0, .8, 0, g); for (const a of [-.6, .6]) for (const b of [-.3, .3]) cyl(.04, .04, .8, 5, 'wood', a, 0, b, g); cyl(.02, .02, .4, 4, ironM, .3, .88, 0, g); box(.5, .02, .02, ironM, .3, 1.28, 0, g); out.push(ground(sp[0], 1.05)); }   // the tax table and its scales
  { const g = atR(F, h, -h); box(1, .5, .8, rockM, 0, 0, 0, g); box(.6, .3, .8, rockM, -.3, .5, 0, g); out.push(ground(sp[1], .95)); }   // the stone mounting step
  { const g = atR(F, h, h); for (const s2 of [-1, 1]) cyl(.07, .07, 1.1, 5, 'wood', s2, 0, 0, g); box(2.1, .1, .1, 'wood', 0, 1, 0, g);
    out.push(ground(sp[2], 1.15)); for (const s2 of [-.8, .8]) { const [x, z] = F.at(h + 1.3, h + s2); libAt('grey-donkey', x, z, F.yaw + Math.PI / 2, 1); } }   // the tethering rail, pack animals at it
  { for (const [f2, s2] of [[0, -.4], [0, .4], [.5, 0]]) { const [x, z] = F.at(-h + f2, h + s2); libAt('grain-sack', x, z, F.yaw + R(-.3, .3), 1); } out.push(ground(sp[3], 1.0)); }   // trade bales waiting for the tax
  { const g = atR(F, 0, 0); box(.9, .15, 9, 'woodLt', 0, .15, 4.5, g); for (let k = 0; k < 5; k++) for (const s2 of [-.4, .4]) cyl(.07, .07, 1.2, 5, 'wood', s2, -.8, 1 + k * 2, g); out.push({ x: F.x, z: F.z, y: F.y + .4 }); }   // the narrow jetty out over the water
  finishRoom(ch, r, F, out); });

// ---- 7.4 THE ORCHARD (7:16–20): irrigation sluice · almond tree · gardener's stone seat · shallow well · pruned branches ----
defBuilder('som.orchard', (r, { ch }) => { const F = roomFrame(r), h = 2.5, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  const g = atR(F, 0, 0, Math.PI);
  box(.45, 1.1, 2 * h + 3, dryStone, -h - 1.3, 0, 0, g); box(.45, 1.1, 2 * h + 3, dryStone, h + 1.3, 0, 0, g); box(2 * h + 3, 1.1, .45, dryStone, 0, 0, h + 1.5, g);   // the orchard walls
  { const [x, z] = sp[0], y = heightAt(x, z); const ch2 = box(.4, .06, 4, waterM, x, y + .02, z); ch2.rotation.y = F.yaw; box(.6, .5, .12, 'wood', x, y, z); out.push({ x, z, y: y + .65 }); }   // the irrigation sluice
  { const [x, z] = F.at(h + .3, -h - .3); libAt('almond-in-blossom', x, z, 0, 1); out.push(ground(sp[1], .6)); }   // the almond tree in blossom
  { const s2 = atR(F, h + .7, h); box(1.4, .5, .6, rockM, 0, 0, 0, s2); out.push(ground(F.at(h + .7, h), .65)); }   // the gardener's stone seat in the wall
  { const [x, z] = sp[3]; libAt('village-well', x, z, F.yaw, .85); out.push(ground(sp[3], .9)); }   // the shallow well, rope and bucket
  { for (let k = 0; k < 9; k++) { const b = cyl(.03, .05, R(1, 1.6), 4, 'wood', F.x + R(-.5, .5), F.y + .1, F.z + R(-.5, .5)); b.rotation.set(Math.PI / 2 + R(-.3, .3), R(0, 3), R(-.2, .2)); } out.push({ x: F.x, z: F.z, y: F.y + .5 }); }   // the pile of pruned branches
  for (const [f2, s3] of [[-1.2, 1.2], [1.4, .2]]) { const [x, z] = F.at(f2 + 3.5, s3 - 4); }
  finishRoom(ch, r, F, out); });

// ---- 7.5 THE HOUSE ON THE ROCK (7:21–25): hewn doorstep · stone bench · the shelf's edge over the wadi · stone mortar · roofing reeds ----
defBuilder('som.rock', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [], lift = .7;
  { const g = atR(F, .8, 0); box(2 * h + 3.4, lift + .4, 2 * h + 4.6, rockM, 0, -.4, 0, g); box(1.2, lift * .5, .6, rockM, -h - .2, 0, -h - 3, g); }   // the rock shelf, and a step up onto it
  { const [x, z] = F.at(h + 3.4, 0); libAt('plaster-house-one-storey', x, z, F.yaw, 1, lift - .05); }   // the stone house on the rock
  const Y = F.y + lift;
  { const g = atR(F, -h, -h); box(1.1, .2, .7, paleM, 0, lift - .02, 0, g); out.push({ x: sp[0][0], z: sp[0][1], y: Y + .3 }); }   // the doorstep hewn in the rock
  { const g = atR(F, h, -h); box(1.5, .45, .5, paleM, 0, lift, 0, g); out.push({ x: sp[1][0], z: sp[1][1], y: Y + .6 }); }        // the stone bench against the house wall
  { const g = atR(F, h, h + .3); for (let k = 0; k < 4; k++) somRock(...F.at(h - .6 + k * .4, h + .9), .3, Y - .1); out.push({ x: sp[2][0], z: sp[2][1], y: Y + .15 }); }   // the shelf's edge over the wadi
  { const g = atR(F, -h, h); cyl(.3, .35, .5, 10, rockM, 0, lift, 0, g); cyl(.04, .05, .7, 5, 'wood', .05, lift + .45, 0, g).rotation.z = .3; out.push({ x: sp[3][0], z: sp[3][1], y: Y + .75 }); }   // the stone mortar
  { for (let k = 0; k < 14; k++) { const b = cyl(.025, .025, 2, 4, reedM, F.x + R(-.15, .15), Y + .15 + (k % 3) * .06, F.z + R(-.15, .15)); b.rotation.set(Math.PI / 2, F.yaw + R(-.1, .1), 0); } out.push({ x: F.x, z: F.z, y: Y + .45 }); }   // the bundle of roofing reeds
  finishRoom(ch, r, F, out); });

// ---- 7.6 THE HOUSE ON THE SAND (7:26–29): date palm · reed fence · the far bank · the house's mud-brick front wall ----
defBuilder('som.sand', (r, { ch }) => { const F = roomFrame(r), h = 2.4, sp = SQ(h).map(([f, s]) => F.at(f, s)), out = [];
  { const [x, z] = sp[0]; libAt('date-palm', x, z, 0, 1); out.push(ground(sp[0], .6)); }   // the date palm leaning over the house
  { const g = atR(F, h, -h); for (let k = 0; k < 12; k++) cyl(.03, .03, 1.3, 4, reedM, -1.1 + k * .2, 0, 0, g); box(2.3, .05, .05, 'wood', 0, 1, 0, g); out.push(ground(sp[1], 1.15)); }   // the reed fence round the little yard
  { const [x, z] = F.at(h + 1.5, h); out.push(ground(sp[2], .2)); }                                                            // the bank across the wadi
  { const [x, z] = F.at(-h + 1.6, h + 2.6); libAt('mud-brick-house', x, z, F.yaw - Math.PI / 2, 1); out.push(ground(F.at(-h, h), 1.0)); }   // the mud-brick house; spot 4 at its front wall's near corner
  finishRoom(ch, r, F, out); });

// the crowd on the far bank of the wadi, facing the walk's end (7:28–29)
{ const ROBES = ['#8a5a3a', '#3f6f9a', '#c9a46a', '#7a8a5a', '#a8714c', '#5a4a6a', '#d9c39a', '#e8dcc4'];
  for (let i = 0; i < 40; i++) { const x = R(140, 152), z = R(-146, -132); person(x, z, Math.atan2(158 - x, -149 - z), ROBES[i % ROBES.length], { y: heightAt(x, z) - .55, veil: rnd() > .6 ? '#e8dcc4' : undefined }); } }
// fishing boats drawn up on the beach, and a few houses of the village behind the street
for (const [x, rt] of [[182, .3], [210, -.2], [240, .15]]) libAt('galilee-fishing-boat-beached', x, SHORE + 2.5, rt, 1);
for (const [x, z, id, rt] of [[244, -146, 'mud-brick-house', 0], [212, -132, 'plaster-house-one-storey', .1], [242, -128, 'mud-brick-house-two-storey', -.1], [172, -128, 'mud-brick-house', .2]]) libAt(id, x, z, rt, 1);
for (const [x, z, id] of [[210, -158, 'woman-with-water-jar'], [176, -158, 'road-traveller-with-basket'], [252, -157, 'villager-green-tunic']]) libAt(id, x, z, R(0, 6), 1);

buildRooms(3);
VIA['3.1'] = [[136, -98], [140, -104], [140, -163], [162, -165]];   // through the farm's lower gate, down the lane to the street
VIA['3.4'] = [[234, -164], [240, -162], [234, -158]];                 // the loop turns at the west end of the village
zoneLabel(7, 'The Shore Village', 196, -163);
