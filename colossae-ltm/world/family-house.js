// ---------- ZONE 3: family house (Colossians 3) — five open rooms ----------
const HX = 32, HZ = 2;
{
  const y0 = heightAt(HX, HZ) - .1;
  box(22, .3, 20, 'path', HX, y0, HZ);
  const W = (x0, z0, x1, z1, h = 7.2) => { const L = Math.hypot(x1 - x0, z1 - z0); const m = box(L, h, .45, 'wall', (x0 + x1) / 2, y0, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  // outer walls with door at front (south, z=HZ+10)
  W(HX - 11, HZ + 10, HX - 1.4, HZ + 10); W(HX + 1.4, HZ + 10, HX + 11, HZ + 10);
  W(HX - 11, HZ - 10, HX + 11, HZ - 10); W(HX - 11, HZ - 10, HX - 11, HZ + 10); W(HX + 11, HZ - 10, HX + 11, HZ + .6); W(HX + 11, HZ + 3.4, HX + 11, HZ + 10); box(.7, 2.9, .2, 'wallTrim', HX + 11.2, y0, HZ + .5); box(.7, 2.9, .2, 'wallTrim', HX + 11.2, y0, HZ + 3.5); box(.8, .4, 3.4, 'wallTrim', HX + 11.2, y0 + 2.8, HZ + 2); box(.45, 4.2, 2.8, 'wall', HX + 11, y0 + 3, HZ + 2); 
  // inner partitions (rooms around atrium)
  
  
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { cyl(.26, .3, 3.6, 10, 'marble', HX + sx * 5, y0, HZ + sz * 4); box(.7, .25, .7, 'wallTrim', HX + sx * 5, y0 + 3.4, HZ + sz * 4); box(.7, .2, .7, 'wallTrim', HX + sx * 5, y0, HZ + sz * 4); }
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) box(6, .3, .4, 'wallTrim', HX + sx * 8, y0 + 3.3, HZ + sz * 4);
  W(HX - 5, HZ + 4, HX - 5, HZ + 10, 3.6); W(HX + 5, HZ + 4, HX + 5, HZ + 10, 3.6); W(HX - 5, HZ - 4, HX - 5, HZ - 10, 3.6); W(HX + 5, HZ - 4, HX + 5, HZ - 10, 3.6);

  
  
  // roof rims (open interior so the rooms are visible from above), tiled roofs on side wings
  // inward-sloping tiled roofs around an open atrium (compluvium)
  const lean = (cx, cz, w, d, ax, dir) => { const m = box(w, .3, d, 'roof', cx, y0 + 7.7, cz); if (ax === 'x') m.rotation.x = dir * .22; else m.rotation.z = dir * .22; };
  lean(HX, HZ + 7.2, 23, 6.6, 'x', 1); lean(HX - 8.2, HZ, 6.6, 8.2, 'z', -1); lean(HX + 8.2, HZ, 6.6, 8.2, 'z', 1);
  // rear wing gets an upper storey (chapter 3: "set your minds on things above")
  box(22.4, 3.4, 6.4, 'wall', HX, y0 + 3.6, HZ - 7); box(22.8, .3, 6.8, 'wallTrim', HX, y0 + 3.5, HZ - 7);
  gableRoof(6.4, 22.4, 2.2, 'roof', HX, y0 + 7, HZ - 7, Math.PI / 2);
  for (let i = -3; i <= 3; i++) { box(.9, 1.2, .1, 'window', HX + i * 3, y0 + 4.8, HZ - 3.75); box(1.1, .15, .25, 'wallTrim', HX + i * 3, y0 + 4.7, HZ - 3.7); }
  // peristyle columns at atrium corners, front facade details
  for (const a of [-4.6, -1.5, 1.5, 4.6]) for (const b of [-3.6, 3.6]) if (Math.abs(a) > 4 || b > 0) cyl(.24, .28, 7.2, 8, 'marble', HX + a, y0, HZ + b);
  // upper gallery floor and balustrade around the atrium
  for (const b of [-4, 4]) box(10.4, .25, .9, 'woodLt', HX, y0 + 3.6, HZ + b * .95);
  for (const b of [-3.5, 3.5]) box(9.4, .8, .1, 'wallTrim', HX, y0 + 3.85, HZ + b);
  // upper windows on facade + string course
  box(22.4, .3, .3, 'wallTrim', HX, y0 + 3.5, HZ + 10.15); for (let i = -3; i <= 3; i++) if (i) box(.9, 1.2, .1, 'window', HX + i * 3, y0 + 4.8, HZ + 10.25);
  for (const s2 of [-1, 1]) for (let i = -2; i <= 2; i++) box(.1, 1.2, .9, 'window', HX + s2 * 11.25, y0 + 4.8, HZ + i * 3.5);
  for (const a of [-1, 1]) { box(.5, 3.8, .6, 'wallTrim', HX + a * 1.6, y0, HZ + 10.1); for (const k of [-6.5, 6.5]) box(.9, 1.1, .1, 'window', HX + k + a * 1.6, y0 + 1.6, HZ + 10.25); }
  box(3.7, .5, .6, 'wallTrim', HX, y0 + 3.4, HZ + 10.1);
  box(8, .2, 1.6, 'woodLt', HX, y0 + 3.6, HZ + 11); for (let i = -4; i <= 4; i++) box(.06, .8, .06, 'wood', HX + i * .95, y0 + 3.8, HZ + 11.75); box(8.1, .1, .1, 'wood', HX, y0 + 4.6, HZ + 11.75);
  for (const sx of [-3.6, 3.6]) { const br = box(.15, 1.4, .15, 'wood', HX + sx, y0 + 2.4, HZ + 10.9); br.rotation.x = .6; }
  for (let i = 0; i < 4; i++) cyl(.18, .14, .3, 7, 'clay', HX - 3 + i * 2, y0 + 3.8, HZ + 11.4), add(new THREE.IcosahedronGeometry(.25, 0), i % 2 ? 'leaf' : 'leafDk', HX - 3 + i * 2, y0 + 4.25, HZ + 11.4);
  for (const sd of [-1, 1]) { const lf = box(1.2, 3, .1, mat('door', '#7a2a1e'), HX + sd * 1.45, y0, HZ + 9.25); lf.rotation.y = Math.PI / 2; } for (const k of [-.55, .55]) box(.06, .1, .06, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), HX + k * 2.6, y0 + 1.4, HZ + 9.25);
  box(23.6, .25, 1.2, 'roofTrim', HX, y0 + 7.15, HZ + 10.5); for (let i = -11; i <= 11; i += 1.1) box(.12, .2, .7, 'wood', HX + i, y0 + 6.95, HZ + 10.4);
  drape(HX - 1.6, HZ + 10.3, HX + 1.6, HZ + 18, 'path', .06); for (let i = 0; i < 10; i++) { const sx = HX + (i % 2 ? 1 : -1) * R(3, 9), sz = HZ + R(11, 15); shrub(sx, sz, R(1.2, 1.7)); }
  for (const a of [-1, 1]) { cyl(.5, .4, .6, 8, 'clay', HX + a * 3, y0, HZ + 11.2); add(new THREE.IcosahedronGeometry(.6, 0), 'leaf', HX + a * 3, y0 + 1, HZ + 11.2); }
  for (const [a, b] of [[-3, 2.5], [3, -2.5], [-3, -2.5], [3, 2.5]]) { cyl(.35, .3, .5, 7, 'clay', HX + a, y0, HZ + b); add(new THREE.IcosahedronGeometry(.45, 0), 'leafDk', HX + a, y0 + .8, HZ + b); }
  // impluvium + rooms contents
  box(4, .45, 3, 'stone', HX, y0, HZ); box(3.4, .05, 2.4, new THREE.MeshStandardMaterial({ color: '#7fd6d2', roughness: .15 }), HX, y0 + .42, HZ);
}
// five rooms, clockwise from the front-left as you enter: loom room, bedroom, dining room, kitchen, shrine
houseRoom(HX - 8, HZ + 7, 2.78, panelTex('#2c3e6a', '#5a3a26', '#1e1a18'), 'bw');
houseRoom(HX - 8, HZ - 7, 2.78, panelTex('#2f5a3e', '#efe2c4', '#1e1a18'), 'meander');
houseRoom(HX, HZ - 7, 4.78, panelTex('#9a2a20', '#efe2c4', '#1e1a18', 4), 'multi');
houseRoom(HX + 8, HZ - 7, 2.78, noRep(canvasTex(512, (x, w) => { x.fillStyle = '#d4a868'; x.fillRect(0, 0, w, w); for (let i = 0; i < 5; i++) { const g2 = x.createRadialGradient(w / 2 + R(-60, 60), w * .35, 10, w / 2, w * .35, R(90, 170)); g2.addColorStop(0, 'rgba(40,30,20,.06)'); g2.addColorStop(1, 'rgba(40,30,20,0)'); x.fillStyle = g2; x.fillRect(0, 0, w, w); } for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(80,50,20,${R(0, .07)})`; x.fillRect(R(0, w), R(0, w), 3, 3); } })), 'earth', '#ffb070');
houseRoom(HX + 8, HZ + 7, 2.78, panelTex('#1e2a4a', '#c99a3a', '#141210'), 'multi', '#ffb870');
defAnchor('house', [HX, HZ]);   // the book places the five house rooms relative to this
// the dining room is built from the table model's own chairs and fruit; without the model it falls back to the plain vignette in the book
defBuilder('colossae.diningRoom', (r, ctx) => {
  const [cx, cz] = pos(r.at, `${r.room} ${r.name} at`);
  if (MODELS.table) { const yy = heightAt(HX, HZ) + .22, g = new THREE.Group(); g.position.set(cx, yy, cz); g.rotation.y = Math.PI / 2; g.scale.setScalar(.82); scene.add(g);
  const keep = ['medieval_Table_4', 'medieval_chair_2', 'medieval_chair001_19', 'medieval_chair003_21', 'medieval_chair004_22', 'medieval_fruit_bowl_12', 'medieval_Apple001_31', 'medieval_Apple002_32', 'medieval_Apple003_33', 'medieval_Apple004_34', 'medieval_Apple005_35', 'medieval_Apple006_36', 'medieval_Apple007_37', 'medieval_pear001_41', 'medieval_pear002_42', 'medieval_pear003_43', 'wine_jug_28', 'medieval_candle_7', 'Circle001_6', 'medieval_dish_30', 'medieval_mug_13', 'medieval_mug001_15', 'medieval_water_jar001_27', 'Medieval_Knife002_25'];
  for (const n of keep) { const o = MODELS.table.getObjectByName(n); if (!o) continue; const c = o.clone(true); o.matrixWorld.decompose(c.position, c.quaternion, c.scale); g.add(c); } g.updateMatrixWorld(true);
  const at = n => { const o = g.getObjectByName(n); const b = new THREE.Box3().setFromObject(o); const c = b.getCenter(new THREE.Vector3()); return { x: c.x, y: b.max.y, z: c.z }; };
  const L = [['medieval_chair_2', 'carved chair'], ['medieval_fruit_bowl_12', 'bowl of apples and pears'], ['wine_jug_28', 'wine jug'], ['medieval_dish_30', 'plate of food'], ['medieval_candle_7', 'candle']].map(([n, w]) => ({ ...at(n), what: w }));
  // order the five by the viewer's clockwise rule: near-left, far-left, far-right, near-right, centre
  { // pick the object nearest each corner of the square as seen from the viewer (viewer on +z side looking -z: near = +z, left = -x)
    const cand = [['medieval_chair_2', 'carved chair'], ['medieval_chair001_19', 'chair with a woven back'], ['medieval_chair003_21', 'chair by the wall'], ['medieval_chair004_22', 'end chair'], ['medieval_fruit_bowl_12', 'bowl of apples and pears'], ['wine_jug_28', 'wine jug'], ['medieval_dish_30', 'plate of food'], ['medieval_mug_13', 'clay mug'], ['medieval_water_jar001_27', 'water jar']].filter(([n]) => g.getObjectByName(n)).map(([n, w]) => ({ ...at(n), what: w }));
    const used = new Set(), pick = (dx, dz) => { let best = null, bd = 1e9; for (const c of cand) { if (used.has(c)) continue; const d = Math.hypot(c.x - (cx + dx), c.z - (cz + dz)); if (d < bd) { bd = d; best = c; } } used.add(best); return best; };
    const cen = L.pop(); L.length = 0; L.push(pick(-1.6, 1.4), pick(-1.6, -1.4), pick(1.6, -1.4), pick(1.6, 1.4), cen); }
  station(3, r.room, r.name, cx, cz, [cx, 0, cz - 4.4], L); return; }
  ctx.fallback();
});
buildRooms(3);   // loom room, bedroom, dining room, kitchen, shrine: the order the book lists them in
// note: last room of zone 3 servant's area is next to kitchen; walk continues east
drape(43, HZ - 2, RIVER_X(2) - 16, HZ + 2, 'path');

