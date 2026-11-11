// ---------- OBJECT LIBRARY: the places of Colossae (Colossians 1-4) and the town pieces that are not in a book room's vignette ----------
// Colossae's custom rooms (kind "custom" in books/colossians.json: the city gate, the market stalls, the well, the family-house rooms, the bridge)
// build their things inline in colossae-ltm/world/*.js, so these entries give every one of them a stable id: a person, a plant, a stall, a structure.
// The pieces the town builds itself (the gate, the well, the temple, the altar, the family house, the bridge, the waystation, the stoa, the shrine...) are
// functions in colossae-shared.js that the town calls at its real coordinates and these entries call at the origin, so there is one source of truth; the
// ones that call engine functions (person, stall, tree, gstallFrame, houseRoom...) go through the engine. Entries tagged "copy" would be copies of town code.
// Colossae's town does not load this file (only colossae-shared.js).
// Every builder is (g, x, y, z) => topY and works at the origin of g; viaScene() (lib-util.js) collects what the town code puts in `scene`.
{
  const via = fn => (g, x, y, z) => viaScene(g, x, y, z, fn);
  const T = (fn, id, label, origin, kind, tags, args) => defObject(id, fn, { label, origin, tags, args, kind });

  // ================= 1.1 the city gate (colossae-shared.js cityGate/spearRack/romanSeal, used by colossae-ltm/world/gate.js and market.js) =================
  T((g, x, y, z) => viaScene(g, x, y, z, () => cityGate(0)), 'city-gate', 'City gate: two towers and a vaulted arch', 'colossae 1.1', 'structure', ['gate', 'wall', 'stone']);
  T(spearRack, 'spear-rack', 'Rack of spears', 'colossae 1.1', 'object', ['gate', 'war', 'wood']);
  T(romanSeal, 'roman-seal', 'Roman seal set into the paving', 'colossae 1.1', 'object', ['gate', 'metal', 'writing']);
  T((g, x, y, z) => { amph(g, x, z, 1.05, y); return y + 1.43; }, 'amphora', 'Big clay amphora', 'colossae 1.1', 'object', ['pottery', 'container', 'gate']);

  // ================= 1.2-1.5 the market stalls (engine stall(), colossae-ltm/world/gate.js and market.js) =================
  const stallOf = (cloth, goods, style) => (g, x, y, z) => viaScene(g, x, y, z, () => { stall(0, 0, 0, typeof cloth === 'function' ? cloth() : cloth, goods, style); });
  T(stallOf('#b9573e', g => fruit(g, '#6b2f5a'), 'roof'), 'stall-figs-tiled-roof', 'Fig stall with a tiled roof', 'colossae 1.2', 'structure', ['market', 'stall', 'food']);
  T(stallOf(() => stripeTex('#c1553b', '#efe2c4', 8), g => { for (let i = 0; i < 5; i++) amph(g, -1.4 + i * .7, .7, .8); for (let i = 0; i < 3; i++) amph(g, -1 + i, -.6, 1.2); }, 'awning'), 'stall-amphorae-awning', 'Amphora stall with a striped awning', 'colossae 1.2', 'structure', ['market', 'stall', 'pottery']);
  T(stallOf('#7d9a62', g => { ['#c94a3a', '#3f6f9a', '#e0b44a', '#efe6d4'].forEach((c, i) => box(.7, .5, .9, mat('w' + c, c), -1.2 + i * .8, 1.12, .7, g)); }, 'awning'), 'stall-cloth-awning', 'Cloth stall with a green awning', 'colossae 1.3', 'structure', ['market', 'stall', 'textile']);
  T(stallOf(() => stripeTex('#d9a640', '#c1553b', 6), g => fruit(g, '#c43a2e'), 'cart'), 'stall-fruit-cart', 'Fruit cart with a striped awning', 'colossae 1.5', 'structure', ['market', 'stall', 'cart', 'food']);
  T(stallOf('#efe2c4', g => { box(1.3, .6, .7, 'woodLt', 0, 1.12, .7, g); for (let i = 0; i < 4; i++) { const s = add(new THREE.CylinderGeometry(.1, .1, .9, 6), 'wool', -1.2 + i * .25 + (i > 1 ? 2 : 0), 1.25, .6, g); s.rotation.z = Math.PI / 2; } cyl(.12, .1, .2, 6, 'dark', .3, 1.75, .7, g); }, 'tent'), 'stall-wool-tent', 'Wool seller’s tent', 'colossae 1.3', 'structure', ['market', 'stall', 'tent', 'textile']);
  T(stallOf(() => stripeTex('#3f6f9a', '#efe7d4', 8), g => { cyl(.5, .55, .5, 10, 'woodLt', -1, 1.12, .7, g); for (let i = 0; i < 4; i++) cyl(.32, .18, .22, 8, 'clay', .2 + i * .45, 1.12, .7, g); }, 'roof'), 'stall-pottery-tiled-roof', 'Pottery stall with a tiled roof', 'colossae 1.4', 'structure', ['market', 'stall', 'pottery']);

  // the game-ready stall frame (BlackMike, CC BY 4.0) with the goods of each trade in its crates (GST in colossae-shared.js, shared with "colossae.marketStall")
  const gstallOf = name => (g, x, y, z) => viaScene(g, x, y, z, () => {
    if (!MODELS.gstall || !CRATES || CRATES.low.length !== 3 || CRATES.high.length !== 4) return;
    const s = GST[name], f = gstallFrame(0, 0, 0, s.tint); s.ends(f);
    fillCrate(f, CRATES.high[1], s.fill[0]); fillCrate(f, CRATES.high[2], s.fill[1]);
    [CRATES.low[0], CRATES.high[0], CRATES.high[3], CRATES.low[2], CRATES.low[1]].forEach((c, j) => fillCrate(f, c, s.loci[j][0])); });
  T(gstallOf('Fig Seller'), 'stall-frame-fig-seller', 'Market stall frame: fig seller', 'colossae 1.2', 'structure', ['market', 'stall', 'model', 'food']);
  T(gstallOf('Scribe’s Table'), 'stall-frame-scribe', 'Market stall frame: scribe’s table', 'colossae 1.3', 'structure', ['market', 'stall', 'model', 'writing']);
  T(gstallOf('The Potter'), 'stall-frame-potter', 'Market stall frame: the potter', 'colossae 1.4', 'structure', ['market', 'stall', 'model', 'pottery']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => { if (!MODELS.gstall) return; const f = gstallFrame(0, 0, 0, '#ffffff'); f.children[0].traverse(o => { if (o.isMesh && (o.material.name || '').includes('FruitVeg')) o.visible = true; });
    P.basket(f, -2.35, 0, 1.6, '#c43a2e'); P.basket(f, 2.35, 0, 1.6, '#e0b44a'); }), 'stall-frame-fruit', 'Market stall frame: fruit stall with its own fruit', 'colossae 1.5', 'structure', ['market', 'stall', 'model', 'food']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => { if (!MODELS.stall) return; const sg = new THREE.Group(); sg.rotation.y = 0; scene.add(sg); const c = MODELS.stall.clone(true); c.scale.setScalar(.9); sg.add(c); }), 'traditional-market-stall', 'Traditional market stall (model)', 'colossae kit', 'structure', ['market', 'stall', 'model']);

  // ================= 1.6 the well (colossae-shared.js villageWell/stoneBench/waterPail, used by "colossae.well") =================
  T(villageWell, 'village-well', 'Stone well with a windlass and bucket', 'colossae 1.6', 'structure', ['well', 'water', 'stone']);
  T(waterPail, 'water-pail', 'Pail of water', 'colossae 1.6', 'object', ['well', 'water', 'container']);
  T(stoneBench, 'stone-bench', 'Stone bench', 'colossae 1.6', 'object', ['well', 'stone', 'furniture']);

  // ================= 2 the temple courtyard (colossae-shared.js marbleTemple/altarWithFire, used by colossae-ltm/world/temple.js) =================
  // the temple stands with its front towards +z and is centred on the origin by viaScene(.., z + 6)
  T((g, x, y, z) => viaScene(g, x, y, z + 6, () => marbleTemple(0)), 'marble-temple', 'Marble temple with a columned porch and pediment', 'colossae 2.2', 'structure', ['temple', 'marble', 'columns']);
  const pedestal = (g, x, y, z) => { box(1.5, .3, 1.5, 'marble', x, y, z, g); box(1.2, 1.4, 1.2, 'stone', x, y + .3, z, g); box(1.5, .25, 1.5, 'marble', x, y + 1.7, z, g); return y + 1.95; };
  const statueOn = pose => (g, x, y, z) => { const t = pedestal(g, x, y, z); const st = makeStatue(THREE, { pose, height: 2.3 }); st.position.set(x, t, z); st.rotation.y = pose === 'festival' ? -.5 : .5; g.add(st); return t + 2.3 + .35; };
  T(statueOn('philosopher'), 'philosopher-statue', 'Marble philosopher on a pedestal', 'colossae 2.2', 'object', ['statue', 'marble', 'temple']);
  T(statueOn('festival'), 'festival-statue', 'Marble festival figure on a pedestal', 'colossae 2.4', 'object', ['statue', 'marble', 'temple']);
  T(altarWithFire, 'altar-with-fire', 'Stone altar with a burning fire and offerings', 'colossae 2.3', 'structure', ['temple', 'fire', 'altar']);
  T((g, x, y, z) => { box(.7, .45, 3, 'marble', x, y, z, g); box(.8, .12, 3.2, 'marble', x, y + .45, z, g); return y + .57; }, 'marble-bench', 'Marble bench', 'colossae 2.1', 'object', ['temple', 'marble', 'furniture']);
  T(via(() => booth(0, 0, [0, 10], '#efe4cc')), 'tasselled-booth', 'Booth with a tasselled cloth roof', 'colossae 2.1', 'structure', ['temple', 'cloth', 'booth']);

  // ================= 3 the family house (colossae-shared.js romanAtrium, used by colossae-ltm/world/family-house.js) =================
  T((g, x, y, z) => viaScene(g, x, y, z, () => romanAtrium(0, 0)), 'roman-house-atrium', 'Roman house around an open atrium with an upper gallery', 'colossae 3.1', 'structure', ['house', 'columns', 'marble']);
  // the five interior rooms: houseRoom() builds the walls, floor, ceiling beams and lights of one room; the room opens towards +z here
  const roomShell = (build, out) => (g, x, y, z) => { const pv = new THREE.Group(); pv.position.set(x, y, z); pv.rotation.y = out > 0 ? Math.PI : 0; g.add(pv); return y + viaScene(pv, 0, 0, -out * 6.9, build); };   // the room faces the camera (+z)
  T(roomShell(() => {
    houseRoom(HX, HZ + 7, 2.78, panelTex('#2c3e6a', '#5a3a26', '#1e1a18'), 'bw');
  }, 1), 'loom-room-shell', 'House room with blue panelled walls and a black and white floor', 'colossae 3.1', 'structure', ['house', 'room', 'interior']);
  T(roomShell(() => {
    houseRoom(HX, HZ - 7, 2.78, panelTex('#2f5a3e', '#efe2c4', '#1e1a18'), 'meander');
  }, -1), 'bedroom-shell', 'House room with green walls and a meander floor', 'colossae 3.2', 'structure', ['house', 'room', 'interior']);
  T(roomShell(() => {
    houseRoom(HX, HZ - 7, 4.78, panelTex('#9a2a20', '#efe2c4', '#1e1a18', 4), 'multi');
  }, -1), 'dining-room-shell', 'Wide house room with red panelled walls', 'colossae 3.3', 'structure', ['house', 'room', 'interior']);
  T(roomShell(() => {
    houseRoom(HX, HZ - 7, 2.78, noRep(canvasTex(512, (x, w) => { x.fillStyle = '#d4a868'; x.fillRect(0, 0, w, w); for (let i = 0; i < 5; i++) { const g2 = x.createRadialGradient(w / 2 + R(-60, 60), w * .35, 10, w / 2, w * .35, R(90, 170)); g2.addColorStop(0, 'rgba(40,30,20,.06)'); g2.addColorStop(1, 'rgba(40,30,20,0)'); x.fillStyle = g2; x.fillRect(0, 0, w, w); } for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(80,50,20,${R(0, .07)})`; x.fillRect(R(0, w), R(0, w), 3, 3); } })), 'earth', '#ffb070');
  }, -1), 'kitchen-shell', 'House room with ochre walls and an earth floor', 'colossae 3.4', 'structure', ['house', 'room', 'interior']);
  T(roomShell(() => {
    houseRoom(HX, HZ + 7, 2.78, panelTex('#1e2a4a', '#c99a3a', '#141210'), 'multi', '#ffb870');
  }, 1), 'shrine-room-shell', 'House room with night-blue walls and gold trim', 'colossae 3.5', 'structure', ['house', 'room', 'interior']);

  // the dining room's furniture comes from the table model (Modular Medieval Table, GameWorldStudio, CC BY 4.0)
  const TABLE = ['medieval_Table_4', 'medieval_chair_2', 'medieval_chair001_19', 'medieval_chair003_21', 'medieval_chair004_22', 'medieval_fruit_bowl_12', 'medieval_Apple001_31', 'medieval_Apple002_32', 'medieval_Apple003_33', 'medieval_Apple004_34', 'medieval_Apple005_35', 'medieval_Apple006_36', 'medieval_Apple007_37', 'medieval_pear001_41', 'medieval_pear002_42', 'medieval_pear003_43', 'wine_jug_28', 'medieval_candle_7', 'Circle001_6', 'medieval_dish_30', 'medieval_mug_13', 'medieval_mug001_15', 'medieval_water_jar001_27', 'Medieval_Knife002_25'];
  const tableSet = (g, x, y, z) => { if (!MODELS.table) return y; const s = new THREE.Group(); s.position.set(x, y + .02, z); s.rotation.y = Math.PI / 2; s.scale.setScalar(.82); g.add(s);
    for (const n of TABLE) { const o = MODELS.table.getObjectByName(n); if (!o) continue; const c = o.clone(true); o.matrixWorld.decompose(c.position, c.quaternion, c.scale); s.add(c); }
    s.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(s); s.position.y += y - b.min.y; return b.max.y + (y - b.min.y); };
  T(tableSet, 'dining-table-with-chairs', 'Dining table with four chairs, fruit, jug and candle', 'colossae 3.3', 'structure', ['house', 'furniture', 'model', 'food']);
  const modelPiece = (names, scale = .82) => (g, x, y, z) => placePart(g, 'table', names, x, y, z, scale, 0) ?? y;
  T(modelPiece(['medieval_chair_2']), 'carved-chair', 'Carved dining chair (model)', 'colossae 3.3', 'object', ['house', 'furniture', 'model']);
  T(modelPiece(['medieval_chair001_19']), 'woven-back-chair', 'Chair with a woven back (model)', 'colossae 3.3', 'object', ['house', 'furniture', 'model']);
  T(modelPiece(['medieval_fruit_bowl_12', 'medieval_Apple001_31', 'medieval_Apple002_32', 'medieval_Apple003_33', 'medieval_pear001_41', 'medieval_pear002_42']), 'bowl-of-apples-and-pears', 'Bowl of apples and pears (model)', 'colossae 3.3', 'object', ['house', 'food', 'model']);
  T(modelPiece(['wine_jug_28']), 'wine-jug-model', 'Jug of wine (model)', 'colossae 3.3', 'object', ['house', 'food', 'pottery', 'model']);
  T(modelPiece(['medieval_candle_7']), 'candle-model', 'Candle (model)', 'colossae 3.3', 'object', ['house', 'light', 'model']);
  T(modelPiece(['medieval_mug_13']), 'clay-mug-model', 'Clay mug (model)', 'colossae 3.3', 'object', ['house', 'pottery', 'model']);

  // ================= 4 the bridge and the road (colossae-shared.js stoneArchBridge/waystationPorch/handCart, used by colossae-ltm/world/bridge.js) =================
  T((g, x, y, z) => viaScene(g, x, y, z, () => stoneArchBridge(0, 0)), 'stone-arch-bridge', 'Three-arch stone bridge over the river', 'colossae 4.2', 'structure', ['bridge', 'river', 'stone']);
  T(via(() => waystationPorch(0, 0)), 'waystation', 'Waystation house with a porch on posts', 'colossae 4.4', 'structure', ['house', 'road', 'travel']);
  T(handCart, 'hand-cart', 'Hand cart on two wheels', 'colossae 4.3', 'object', ['travel', 'wood', 'cart']);

  // ================= the town around the rooms (colossae-ltm/world/town.js) =================
  T(marbleStoa, 'marble-stoa', 'Long marble stoa with nine columns', 'colossae kit', 'structure', ['stoa', 'columns', 'marble']);
  T(roundShrine, 'round-shrine', 'Round shrine with a ring of columns', 'colossae kit', 'structure', ['shrine', 'columns', 'marble']);
  T(via(() => { house(0, 0, 12, 9, 3, Math.PI / 2); }), 'insula-three-storey', 'Three-storey apartment block', 'colossae kit', 'structure', ['house', 'town']);
}
