// Colossians 1, the market (rooms 1-6) is built from books/colossians.json: the gate, four stalls and the well are custom rooms
// whose builders live here; they take their arguments (which stall, where the well stands) and their object labels from the book.
// order: up the left side from the gate, then down the right side. The stall's place in the street is M1[slot] (gate.js); the book names the slot.
const MARKET = [
  { name: 'Fig Seller', sign: '#6b2f5a', props: [g => [P.figBowl(g, -1.25, H_NEAR, .7), 'bowl of figs'], g => [P.scale(g, -1.25, H_FAR, -1), 'hanging scales'], g => [P.honey(g, 1.25, H_FAR, -1), 'honey jar'], g => [P.sack(g, 1.25, H_NEAR, .7), 'sack of grain'], g => [P.crates(g, 0, 1.15, -.2), 'stacked crates']] },
  { name: 'Scribe’s Table', sign: '#3a2c22', props: [g => [P.desk(g, -1.2, H_NEAR, .7), 'papyrus and quill'], g => [P.scrolls(g, -1.2, H_FAR - .1, -1.05), 'scroll shelf'], g => [P.lamps(g, 1.2, H_FAR, -1), 'oil lamps'], g => [P.tablets(g, 1.25, H_NEAR, .7), 'wax tablets'], g => [P.chest(g, 0, 1.15, -.2), 'coin chest']] },
  { name: 'The Potter', sign: '#9a5a3a', props: [g => [P.wheel(g, -1.15, 0, .3), 'potter’s wheel'], g => [P.kiln(g, -1.1, 0, -.95), 'glowing kiln'], g => [P.jarPyramid(g, 1.15, H_FAR, -1.05), 'pyramid of jars'], g => [P.bowlStack(g, 1.25, H_NEAR, .7), 'stack of bowls'], g => [P.clay(g, 0, 1.15, -.2), 'lump of wet clay']] },
  { name: 'Pomegranates', sign: '#c43a2e', props: [g => [P.basket(g, -1.25, H_NEAR, .7, '#c43a2e'), 'basket of pomegranates'], g => [P.herbs(g, -1.2, H_FAR - 1.1, -1.05), 'hanging herbs'], g => [P.cage(g, 1.25, H_FAR, -1), 'songbird cage'], g => [P.basket(g, 1.25, H_NEAR, .7, '#7a9a3a', 10), 'basket of olives'], g => [P.press(g, 0, 1.15, -.2), 'juice press']] },
];
defBuilder('colossae.gate', r => { // ROOM 1 — the city gate (seen from outside, facing into town)
  if (r.at && r.at[1] !== GZ) bookError(`${r.room} ${r.name}: the book puts the gate at z=${r.at[1]}, gate.js says GZ=${GZ}`);
  const W = i => r.objects[i].what;
  const gy = heightAt(0, GZ), g = new THREE.Group(); g.position.set(0, gy, GZ); scene.add(g);
  const at = (x, z, top, what) => ({ x, y: gy + top, z: GZ + z, what });
  // 1 near-left: a guard with spear and shield
  gateGuardModel(g, -2.3, 0, 2.4);
  // 2 far-left: a big pot in the corner
  { const jg = new THREE.Group(); jg.position.set(-2.4, 0, -2.4); g.add(jg); amph(jg, 0, 0, 1.05); }
  // 3 far-right: a burning torch on a post
  box(.12, 2, .12, 'wood', 2.4, 0, -2.4, g); cyl(.14, .1, .22, 7, mat('iron', '#3c3a38'), 2.4, 2, -2.4, g);
  { const fl = add(new THREE.ConeGeometry(.13, .45, 6), new THREE.MeshStandardMaterial({ color: '#ffb23a', emissive: '#ff8a1a', emissiveIntensity: 1.8, flatShading: true }), 2.4, 2.45, -2.4, g); fl.userData.dyn = 1; window.__fire = (window.__fire || []).concat(fl); }
  // 4 near-right: a rack of spears
  spearRack(g, 2.9, 0, 2.4);
  // 5 centre: a Roman seal set into the paving
  romanSeal(g, 0, 0, 0);
  station(1, r.room, r.name, 0, GZ, [0, 0, GZ - 10], [at(-2.3, 2.4, 1.6, W(0)), at(-2.4, -2.4, 1.4, W(1)), at(2.4, -2.4, 2.75, W(2)), at(2.9, 2.4, 2.4, W(3)), at(0, 0, .15, W(4))]);
});
// game-ready stall frame for the other trades: own awning colour, own goods in the crates (GST: colossae-shared.js, the library draws the same)
defBuilder('colossae.marketStall', r => {   // ROOMS 2-5 — a stall in the market street: args { stall: name in MARKET, slot: index in M1 }
  const m = MARKET.find(x => x.name === r.args.stall); if (!m) bookError(`${r.room} ${r.name}: unknown stall "${r.args.stall}"`);
  const slot = r.args.slot, W = j => r.objects[j].what;
  if (GST[m.name] && MODELS.gstall && CRATES && CRATES.low.length === 3 && CRATES.high.length === 4) {
    const [sx, sz, face] = M1[slot], cg = GST[m.name], g = gstallFrame(sx, sz, face, cg.tint);
    cg.ends(g);
    const order = [CRATES.low[0], CRATES.high[0], CRATES.high[3], CRATES.low[2], CRATES.low[1]];
    fillCrate(g, CRATES.high[1], cg.fill[0]); fillCrate(g, CRATES.high[2], cg.fill[1]); g.updateMatrixWorld(true);
    const L = order.map((c, j) => { const top = fillCrate(g, c, cg.loci[j][0]); const w = g.localToWorld(new THREE.Vector3(c.x * 1.35, top, c.z * 1.35)); return { x: w.x, y: w.y, z: w.z, what: W(j) }; });
    station(1, r.room, r.name, sx, sz, [sx + Math.sign(sx) * 6, 2, sz], L); return; }
  if (m.name === 'Pomegranates' && MODELS.gstall) {   // the game-ready fruit stall (BlackMike, CC BY 4.0)
    const [sx, sz, face] = M1[slot], k = 1.35, g = gstallFrame(sx, sz, face, '#ffffff'); g.children[0].traverse(o => { if (o.isMesh && (o.material.name || '').includes('FruitVeg')) o.visible = true; });
    P.basket(g, -2.35, 0, 1.6, '#c43a2e'); P.basket(g, 2.35, 0, 1.6, '#e0b44a');
    g.updateMatrixWorld(true);
    const L = (CRATES ? [CRATES.low[0], CRATES.high[0], CRATES.high[3], CRATES.low[2], CRATES.low[1]] : []).map((c, j) => { const w = g.localToWorld(new THREE.Vector3(c.x * k, c.y * k + .25, c.z * k)); return { x: w.x, y: w.y, z: w.z, what: W(j) }; });
    station(1, r.room, r.name, sx, sz, [sx + Math.sign(sx) * 6, 2, sz], L); return; }
  const [sx, sz, face] = M1[slot];
  const g = new THREE.Group(); g.position.set(sx, heightAt(sx, sz), sz); g.rotation.y = face; scene.add(g);
  ({ 'Fig Seller': () => { P.basket(g, -2.35, 0, 1.6, '#5b2a4c'); P.basket(g, 2.35, 0, 1.6, '#e0b44a'); P.barrel(g, 2.5, 0, -1.1); },
     'Wool Dyer': () => { P.bucket(g, -2.3, 0, 1.6); P.vat(g, 2.4, 0, 1.4, '#9a2a2a'); for (let k = 0; k < 3; k++) P.barrel(g, 2.5, 0, -1.2 + k * .7); },
     'Scribe’s Table': () => { P.chest(g, 2.4, 0, 1.5); box(.5, .9, .5, 'woodLt', -2.35, 0, 1.4, g); P.scrolls(g, -2.35, .9, 1.4); },
     'The Potter': () => { for (let k = 0; k < 5; k++) amph(g, -2.6 + (k % 3) * .45, 1.4 + (k > 2 ? .5 : 0), .7); P.bowlStack(g, 2.3, 0, 1.6); P.clay(g, 2.6, 0, .9); },
     'Pomegranates': () => { P.basket(g, -2.35, 0, 1.6, '#c43a2e'); P.basket(g, 2.35, 0, 1.6, '#e0b44a'); P.crates(g, 2.5, 0, -.8); },
     'Wine Jars': () => { for (let k = 0; k < 4; k++) P.barrel(g, -2.5, 0, -1.2 + k * .75); amph(g, 2.4, 1.5, .9); amph(g, 2.6, .8, .8); } })[m.name]?.();
  g.updateMatrixWorld(true);
  box(.8, 1.15, .7, 'wood', 0, 0, -.2, g); box(.9, .08, .8, 'woodLt', 0, 1.07, -.2, g);
  const FILL = { 'Fig Seller': ['fruit', '#5b2a5c'], 'Wool Dyer': ['cloth'], 'Scribe’s Table': ['scroll'], 'The Potter': ['pots'], 'Pomegranates': ['fruit', '#c43a2e'], 'Wine Jars': ['pots'] }[m.name];
  const fillAt = (x, y, z) => { const k = FILL[0];
    if (k === 'fruit') { for (let n = 0; n < 7; n++) add(new THREE.IcosahedronGeometry(.1, 1), mat('f' + FILL[1] + 's', FILL[1], { flatShading: false, roughness: .5 }), x + R(-.18, .18), y + .1 + (n > 4 ? .12 : 0), z + R(-.12, .12), g); }
    else if (k === 'cloth') { const c = ['#c94a3a', '#e0b44a', '#3f6f9a', '#7a3b6a', '#efe6d4'][(rnd() * 5) | 0]; box(.42, .14, .3, mat('w' + c, c), x, y, z, g); box(.4, .12, .28, mat('w#efe6d4', '#efe6d4'), x + .02, y + .14, z, g); }
    else if (k === 'scroll') { const sc = add(new THREE.CylinderGeometry(.05, .05, .36, 8), mat('papyrus', '#e8d6a8'), x, y + .05, z, g); sc.rotation.z = Math.PI / 2; sc.rotation.y = R(-.5, .5); }
    else { const jg = new THREE.Group(); jg.position.set(x, y, z); g.add(jg); amph(jg, 0, 0, R(.32, .45)); } };
  const n00 = g.children.length;
  for (const x of [-.55, -.2, .2, .55]) fillAt(x, H_NEAR, .55 + R(-.05, .1));
  for (const x of [-.6, -.2, .2, .6]) fillAt(x, H_FAR, -1);
  for (const x of [-1.6, -.95, .95, 1.6]) fillAt(x, H_FAR, -.78);
  const custom = m.props.map(fn => { const n0 = g.children.length; const [top, what] = fn(g); const o = g.children[n0]; const lp = o.position.clone(); lp.y = top; g.updateMatrixWorld(true); const w = g.localToWorld(lp); return { x: w.x, y: w.y, z: w.z, what }; });
  // align each prop's reported x/z with its slot even when the first child is offset
  station(1, r.room, r.name, sx, sz, [sx + Math.sign(sx) * 6, 2, sz], custom);
});
defBuilder('colossae.well', r => {   // ROOM 6 — the well (seen from the gate side): 1 bucket, 2 water carrier, 3 olive tree, 4 bench; args { z }
  const W = i => r.objects[i].what;
  {
  const wz = r.args.z, wy = heightAt(0, wz), at = (x, z, top, what) => ({ x, y: wy + top, z: wz + z, what });
  station(1, r.room, r.name, 0, wz, [0, 0, wz - 10], [at(-2, 2, .7, W(0)), at(-2.1, -1.8, 1.9, W(1)), at(2.5, -1.5, 3.2, W(2)), at(2.6, 2.6, .8, W(3))]);
  }
// well + olive tree + bench
{ const z = r.args.z;
  villageWell(scene, 0, heightAt(0, z), z);
  stoneBench(scene, 2.6, heightAt(3, z), z + 2.6);
  waterPail(scene, -2, heightAt(-2, z + 2), z + 2);
  waterCarrierModel(scene, -2.1, heightAt(-2.1, z - 1.8), z - 1.8);   // the woman at the well (was a townsperson in town.js)
  tree(2.5, z - 1.5, .9);
}
});
buildRooms(1);   // gate, four stalls, well: the order the book lists them in (random numbers are drawn in this order)
// market clutter: crates, sacks, straw, pigeons, a sleeping dog, lamps
for (const [x, z] of [[-4.6, 61], [4.6, 60.5], [-4.6, 49], [4.8, 48.5], [-4.6, 37.5], [4.6, 37]]) {
  const y = heightAt(x, z);
  for (let i = 0; i < 3; i++) { const st = box(R(.4, .9), .03, .05, 'straw', x + R(-1.5, 1.5), y + .02, z + R(-2, 2)); st.rotation.y = R(0, 3); }
}
for (let i = 0; i < 0; i++) { const x = R(-2.5, 2.5), z = R(34, 70), y = heightAt(x, z); const pg = new THREE.Group(); pg.position.set(x, y, z); pg.rotation.y = R(0, 6); scene.add(pg);
  const b = add(new THREE.IcosahedronGeometry(.13, 0), 'pigeon', 0, .14, 0, pg); b.scale.set(1.5, 1, 1); add(new THREE.IcosahedronGeometry(.07, 0), 'pigeon', .17, .25, 0, pg); }

for (const [x, z] of [[-6.8, 61.6], [6.8, 49.6], [-6.8, 37.6]]) { const y = heightAt(x, z); box(.03, .5, .03, 'dark', x, y + 2.2, z); add(new THREE.IcosahedronGeometry(.13, 0), mat('lamp', '#e2b062', { emissive: '#a86a1a', emissiveIntensity: .5 }), x, y + 2.15, z); }
// houses lining the street
for (let z = 70; z > 22; z -= 9) for (const s of [-1, 1]) house(s * R(14, 15.5), z + R(-1, 1), R(7, 9), R(7, 8.5), rnd() > .5 ? 2 : 1, s > 0 ? -Math.PI / 2 : Math.PI / 2);

