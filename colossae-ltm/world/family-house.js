// ---------- ZONE 3: family house (Colossians 3) — five open rooms ----------
const HX = 32, HZ = 2;
{
  romanAtrium(HX, HZ);
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

