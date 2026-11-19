// ---------- the districts of phase 1 (PLAN.md §5, districts 1-5), each laid out and then its rooms built from the book ----------
// Every room's spots and objects are in books/verses100.json; here: the places themselves (walls, buildings, steps, water),
// the walking routes into rooms that are not straight along the road (VIA), and the district labels for the bird's-eye view.
const camOf = (ch, n) => { const r = roomOf(ch, n); if (!r) return null; const [x, z] = r.at, [vx, vz] = r.viewer, l = Math.hypot(vx - x, vz - z), b = r.back ?? 7; return [x + (vx - x) / l * b, z + (vz - z) / l * b]; };
const keepRooms = []; for (let ch = 1; ch <= Math.min(BUILT, 5); ch++) { const c = bookChapter(ch); if (c) for (const r of c.rooms) if (r.at) keepRooms.push([Math.min(r.at[0], r.viewer[0]) - 5, Math.min(r.at[1], r.viewer[1]) - 5, Math.max(r.at[0], r.viewer[0]) + 5, Math.max(r.at[1], r.viewer[1]) + 5]); }

// ===== 1. THE DAWN GARDEN (Beginnings): the summit where the road starts =====
{
  // olive trees, cypresses and flowers on the crown; nothing on the road or in a room
  const keepGlory = [...keepRooms, [-199, 8, -185, 34], [-229, 8, -211, 30]];   // open sky behind the tent and the lookout, so their light has a clean backdrop
  scatter(-238, -34, -168, 34, 34, keepGlory, (x, z) => rnd() < .3 ? cypress(x, z, R(.8, 1.2)) : tree(x, z, R(.8, 1.15)));
  scatter(-236, -30, -168, 30, 26, keepGlory, (x, z) => shrub(x, z, R(.8, 1.3)));
  // 1.1 The Lookout: a broad flat-topped rock at the summit's edge (Genesis 1:1's spot)
  { const r = roomOf(1, 1); if (r) { const F = roomFrame(r), y = heightAt(r.at[0], r.at[1]); const g = atRoom(F, 0, 0, y);
    const b = add(new THREE.DodecahedronGeometry(1.25, 0), stoneM, 0, .05, 0, g); b.scale.set(1.25, .42, 1); box(2.1, .1, 1.6, stoneDkM, 0, .52, 0, g); rock(...F.at(.9, -1.3), .45, y); rock(...F.at(-.4, 1.4), .35, y); } }
  // 1.2 The Spring: a clear pool under the rocks, where the water begins
  { const r = roomOf(1, 2); if (r) { const [x, z] = r.at, y = heightAt(x, z);
    const pool = add(new THREE.CircleGeometry(1.25, 28), waterM, x, y + .05, z); pool.rotation.x = -Math.PI / 2; pool.receiveShadow = true;
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; rock(x + Math.cos(a) * 1.55, z + Math.sin(a) * 1.55, R(.25, .45), y); }
    for (const [dx, dz, s] of [[0, -2.3, .8], [-.9, -2.0, .6], [.9, -2.1, .55]]) rock(x + dx, z + dz, s, y); } }
  // 1.4 The Lamp-lit Rooftop: a flat-roofed house with a stone stair climbing its front to the roof (built like som-ltm 6.1's courtyard stair);
  // 3:17 sits at the stair head
  { const r = roomOf(1, 4); if (r) { const F = roomFrame(r);
    flatHouse(...F.at(3.4, .6), 8, 4, 3.0, F.yaw, mudM);
    for (let k = 0; k < 10; k++) { const [x, z] = F.at(.97, -.5 - k * .34); const st = box(.34, .3 * (k + 1), .85, stoneM, x, heightAt(x, z) - .02, z); st.rotation.y = F.yaw + Math.PI / 2; }
    { const [x, z] = F.at(1.35, -3.4); const c = box(.3, .55, .3, mudM, x, heightAt(x, z) + 3.0, z); c.rotation.y = F.yaw; } } }   // a parapet post where the stair reaches the roof
  zoneLabel(1, 'The Dawn Garden', -198, 0);
}

// ===== 2. THE ROMAN ROAD: paved, with milestones, down to the town's west gate =====
{
  drape(-166, -2.3, -102, 2.3, 'cobble', .05);
  for (let x = -164; x < -103; x += 1.6) for (const z of [-2.45, 2.45]) box(1.5, .14, .26, stoneDkM, x, heightAt(x, z) - .02, z);   // kerbstones
  scatter(-168, -36, -106, 36, 18, keepRooms, (x, z) => rnd() < .5 ? cypress(x, z, R(.8, 1.1)) : tree(x, z, R(.8, 1.1)));
  // 2.4 The Speaker's Steps: three marble steps rising away from the road (10:9 on the bottom step, 10:10 on the top)
  { const r = roomOf(2, 4); if (r) { const F = roomFrame(r), y = heightAt(r.at[0], r.at[1]) - .02;
    for (const [f0, f1, h] of [[-3.1, -1.2, .3], [-1.2, .6, .6], [.6, 3.1, .9]]) { const g = atRoom(F, (f0 + f1) / 2, 0, y); box(6.4, h, f1 - f0, 'marble', 0, 0, 0, g); } } }
  zoneLabel(2, 'The Roman Road', -136, 0);
}

// ===== 3. THE SYNAGOGUE (Listening, part 1: the Word): a walled town round James's synagogue =====
{
  const T = 4.6;   // wall height
  const tower = (x, z) => box(3.2, 6, 3.2, stoneM, x, heightAt(x, z) - .2, z);
  wallSeg(-102, -32, -102, -3.4, T, 1.2); wallSeg(-102, 3.4, -102, 32, T, 1.2); tower(-102, -4.8); tower(-102, 4.8);
  wallSeg(-44, -32, -44, -3.4, T, 1.2); wallSeg(-44, 3.4, -44, 32, T, 1.2); tower(-44, -4.8); tower(-44, 4.8);
  wallSeg(-102, -32, -44, -32, T, 1.2); wallSeg(-102, 32, -44, 32, T, 1.2);
  for (const gx of [-102, -44]) { const ly = heightAt(gx, 0) + T - .3; box(1.6, .8, 9.6, stoneM, gx, ly, 0); }   // lintels over the two gates
  WALKWAYS.push([-104, -3.2, -100, 3.2], [-46, -3.2, -42, 3.2]);
  const syn = jcSynagogue(SO[0], SO[1]);
  RAISED.push(...syn.raised);
  // James's walkways and steps, moved to this synagogue (James's origin was (20, 14))
  const J = (x, z) => [x - 20 + SO[0], z - 14 + SO[1]];
  for (const [x0, z0, x1, z1] of [[15.2, 10.3, 16.8, 11.7], [21.9, 19, 23, 20.2], [23.9, 8.4, 28.1, 9.6]]) { const [a, b] = J(x0, z0), [c, d] = J(x1, z1); WALKWAYS.push([a, b, c, d]); }
  { const [cx, cz] = J(15.1, 11); RAISED.push([cz, 1.2, cx, .9, heightAt(SO[0] - 1.5, SO[1]) + 1.3]); }
  drape(-66, 14.6, -45, 17.6, 'path', .03); drape(-49.6, -1.6, -46.4, 17.6, 'path', .03);   // the lane from the back steps to the east gate
  for (const [x, z, w, d, rot] of [[-95, 15, 6, 5, Math.PI], [-95, -15, 6, 5, 0], [-93, 25, 5, 4.5, Math.PI], [-52, 26, 6, 5, 0], [-52, -22, 7, 5, Math.PI], [-60, -24, 5, 4, Math.PI]]) flatHouse(x, z, w, d, 3, rot);
  zoneLabel(3, 'The Synagogue', SO[0], SO[1]);
  // walking routes into each room (world x, z): James's tested routes, moved
  VIA['3.1'] = [[-100, 0], [-89, 0], [-84, .2], [-76.5, -3], [-72.8, -3], [-71, .25], [-63.9, -1.2]];
  VIA['3.2'] = [[-63.9, -1.2]];                                                                                       // back into the hall, clear of the lectern                          // in at the gate, up the steps, through the hall to the scroll room
  VIA['3.3'] = [[-67.4, 2.8], [-67.6, 5.5], [-67.6, 6.9]];                                                                         // out of the hall by the side door onto the porch
  VIA['3.4'] = [[-67.6, 6.9], [-67.6, 5.5], [-67.4, 2.8], [-72.8, -3], [-76.5, -3], [-84, .2], [-89, 0]];                         // back through the hall, out of the main door, down the front steps
  VIA['3.5'] = [[-89, 0], [-84, .2]];                                                                                // up onto the courtyard to the pools
}

// ===== 4. THE TABERNACLE (Listening, part 2: Prayer): its court outside the town, the gate facing the road =====
// Proportions from Exodus 26-27 (a cubit of 0.457 m): court 100 × 50 cubits, tent 30 × 10 × 10, the veil 20 cubits in. Turned so the gate faces west, towards the road.
{
  const C = .4572, X1 = 100 * C, ZH = 25 * C, HH = 5 * C, GATE = 10 * C, y0 = heightAt(23, 0);
  const goldM = mat('v100Gold', '#d8a63c', { metalness: .35, roughness: .38, emissive: '#3a2406', emissiveIntensity: .35 }), bronzeM = mat('v100Bronze', '#9a6436', { metalness: .3, roughness: .5 });
  const goatM = mat('v100Goat', '#2b2522', { map: TEX.cloth }), ramM = mat('v100Ram', '#8e2a1e', { roughness: .8 }), veilM = mat('v100Veil', '#3d3a86', { map: TEX.cloth });
  // the linen hangings on bronze-footed posts, every 5 cubits
  const hang = (x0, z0, x1, z1) => { const w = wallSeg(x0, z0, x1, z1, HH, .07, linenM, y0); w.castShadow = true; };
  hang(0, -ZH, X1, -ZH); hang(0, ZH, X1, ZH); hang(X1, -ZH, X1, ZH); hang(0, -ZH, 0, -GATE / 2); hang(0, GATE / 2, 0, ZH);
  for (let x = 0; x <= X1 + .01; x += 5 * C) for (const z of [-ZH, ZH]) { cyl(.08, .09, HH + .2, 8, 'wood', x, y0, z); cyl(.13, .13, .14, 8, bronzeM, x, y0, z); }
  for (let z = -ZH; z <= ZH + .01; z += 5 * C) for (const x of [0, X1]) { if (x === 0 && Math.abs(z) < GATE / 2 - .1) continue; cyl(.08, .09, HH + .2, 8, 'wood', x, y0, z); cyl(.13, .13, .14, 8, bronzeM, x, y0, z); }
  for (const z of [-GATE / 2, -GATE / 6, GATE / 6, GATE / 2]) cyl(.09, .1, HH + .3, 8, 'wood', 0, y0, z);   // the gate's four posts, its screen drawn back
  WALKWAYS.push([-2, -GATE / 2 + .2, 2, GATE / 2 - .2]);
  // the tent: gold-covered boards, the coverings over them, five pillars at the door (the curtain drawn back), the veil
  const XF = 50 * C, XV = 70 * C, XB = 80 * C, TW = 5 * C, TH = 10 * C;
  box(XB - XF, TH, .2, goldM, (XF + XB) / 2, y0, -TW); box(XB - XF, TH, .2, goldM, (XF + XB) / 2, y0, TW); box(.2, TH, 2 * TW + .2, goldM, XB, y0, 0);
  box(XB - XF + .5, .12, 2 * TW + 1.2, goatM, (XF + XB) / 2, y0 + TH, 0); box(XB - XF + .3, .1, 2 * TW + .9, ramM, (XF + XB) / 2, y0 + TH + .12, 0);
  for (const s of [-1, 1]) { const d = box(XB - XF + .5, 2.6, .08, goatM, (XF + XB) / 2, y0 + TH - 2.5, s * (TW + .6)); d.castShadow = false; }
  for (const z of [-TW + .1, -TW / 2, TW / 2, TW - .1]) cyl(.12, .12, TH, 10, goldM, XF, y0, z);
  box(.06, TH, 2 * TW, veilM, XV, y0, 0);
  { const lt = new THREE.PointLight('#ffd9a0', 9, 14, 1.6); lt.position.set((XF + XV) / 2, y0 + 3.6, 0); lt.userData.dyn = 1; scene.add(lt); }
  v100Put('ark-of-the-covenant', (XV + XB) / 2, 0, -Math.PI / 2, 1.1, y0);
  zoneLabel(4, 'The Tabernacle', 23, 0);
  VIA['4.1'] = [[-84.5, -1], [-84.5, 12], [-63, 12], [-63, 16], [-48, 16], [-48, 0], [-40, 0], [-2, 0], [2, 0], [3, 7], [20, 7], [21.5, 0]];   // out by the back steps, through the town, in at the court gate, past the altar and laver to the door
}

// ===== 5. THE FATHER'S HOUSE (Assurance): "In my Father's house are many rooms" =====
// A courtyard house (x 59-81, z -11..11): rooms on the north and south, the entrance on the west, a two-storey east wing whose flat upper floor
// holds the upper room (south) and the roof terrace (north). A stair climbs from the court; an outside stair goes down to the olive-press yard.
{
  const y0 = heightAt(70, 0), DECK = 3.2, H = 3;
  const W = (x0, z0, x1, z1, h = H, th = .5, m = plasterM, y = y0) => wallSeg(x0, z0, x1, z1, h, th, m, y);
  // outer walls: the entrance on the west
  W(59, -11, 59, -1.5); W(59, 1.5, 59, 11); W(59, -11, 81, -11, DECK); W(59, 11, 81, 11, DECK); W(81, -11, 81, 11, DECK);
  box(.8, .3, 3.6, 'wood', 59, y0 + 2.4, 0);   // the lintel over the entrance
  drape(59.4, -6.8, 73.8, 6.8, 'path', .04);   // the paved court
  WALKWAYS.push([57.5, -1.3, 60.5, 1.3]);
  // south range: a row of rooms with three doorways onto the court (14:2)
  W(59, -7, 61.9, -7); W(63.1, -7, 65.9, -7); W(67.1, -7, 69.9, -7); W(71.1, -7, 74, -7);
  box(15, .25, 4.2, reedM, 66.5, y0 + H, -9);
  for (const dx of [62.5, 66.5, 70.5]) box(1.2, .2, .7, 'wood', dx, y0 + 2.1, -7);
  // north range: rooms and the kitchen, doorways at x 63 and 70 (14:3)
  W(59, 7, 62.4, 7); W(63.6, 7, 69.4, 7); W(70.6, 7, 74, 7);
  box(15, .25, 4.2, reedM, 66.5, y0 + H, 9);
  for (const dx of [63, 70]) box(1.2, .2, .7, 'wood', dx, y0 + 2.1, 7);
  // the east wing: ground-floor wall, the upper floor (a flat roof you walk on)
  W(74, -11, 74, 11, DECK, .5, plasterM);
  box(7.4, .3, 22.4, reedM, 77.5, y0 + DECK - .3, 0);
  RAISED.push([0, 11, 77.5, 3.5, y0 + DECK]);
  // the stair up from the court, against the east wing, climbing north (its foot is 14:6, the way out)
  for (let k = 0; k < 6; k++) { const cz = 1.6 + .83 * k + .415, h = (k + 1) * DECK / 6; box(1.4, h, .83, stoneM, 73.3, y0, cz); RAISED.push([cz, .415, 73.3, .7, y0 + h]); }
  // the upper room: three walls and a beamed roof, open towards the stair
  const UY = y0 + DECK;
  W(74, -11, 74, -2, 2.6, .4, plasterM, UY); W(81, -11, 81, -2, 2.6, .4, plasterM, UY); W(74, -11, 81, -11, 2.6, .4, plasterM, UY);
  for (let k = 0; k < 12; k++) box(7.2, .14, .16, 'wood', 77.5, UY + 2.6, -10.6 + k * .75);
  box(7.4, .12, 9.2, reedM, 77.5, UY + 2.75, -6.5);
  // the roof terrace: a low parapet, a gap on the east for the outside stair
  W(74, 7.2, 74, 11, 1, .3, plasterM, UY); W(74, 11, 81, 11, 1, .3, plasterM, UY); W(81, 2, 81, 8.6, 1, .3, plasterM, UY); W(81, 10.8, 81, 11, 1, .3, plasterM, UY);
  // the outside stair down to the yard
  for (let k = 0; k < 6; k++) { const cx = 81.4 + .8 * k, h = DECK - (k + 1) * DECK / 6; if (h > .05) box(.8, h, 2.2, stoneM, cx, y0, 9.7); RAISED.push([9.7, 1.1, cx, .4, y0 + Math.max(0, h)]); }
  // the olive-press yard behind the house: a low wall, its gate left open (53:6)
  const L = (x0, z0, x1, z1) => wallSeg(x0, z0, x1, z1, 1.1, .5, stoneM, y0);
  L(81, -8, 96, -8); L(96, -8, 96, 1.3); L(96, 3.9, 96, 8); L(90, 8, 96, 8);
  box(.2, 1.8, 1.3, 'wood', 96.2, y0, 4.6);   // the gate, swung open
  zoneLabel(5, "The Father's House", 72, 0);
  VIA['5.1'] = [[20, 7], [3, 7], [2, 0], [-2.5, 0], [-3, 15], [56, 15], [56, 0], [58, 0]];          // back out of the court gate, round to the house's entrance
  VIA['5.2'] = [[70, 1.2], [73.3, 1.3], [73.3, 6.4], [75.5, 6.4], [77, 1.5]];              // up the stair onto the upper floor
  VIA['5.4'] = [[79.5, 9.7], [81.1, 9.7], [86.5, 9.7], [86.5, 4]];                           // across the terrace and down the outside stair
}

// ---- the rooms, in walking order ----
for (let ch = 1; ch <= 15; ch++) buildRooms(ch);
