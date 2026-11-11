// ---------- OBJECT LIBRARY: the places of Colossae (Colossians 1-4) and the town pieces that are not in a book room's vignette ----------
// Colossae's custom rooms (kind "custom" in books/colossians.json: the city gate, the market stalls, the well, the family-house rooms, the bridge)
// build their things inline in colossae-ltm/world/*.js, so these entries give every one of them a stable id: a person, a plant, a stall, a structure.
// Entries marked "copy" are copies of that town code, set at the origin; the ones that call engine functions (person, stall, tree, gstallFrame, houseRoom...)
// go through the engine and so cannot drift from the towns. The towns themselves are unchanged and do not load this part.
// Every builder is (g, x, y, z) => topY and works at the origin of g; viaScene() (lib-util.js) collects what the town code puts in `scene`.
{
  const via = fn => (g, x, y, z) => viaScene(g, x, y, z, fn);
  const T = (fn, id, label, origin, kind, tags, args) => defObject(id, fn, { label, origin, tags, args, kind });

  // ================= 1.1 the city gate (copy of colossae-ltm/world/gate.js and market.js, "colossae.gate") =================
  const cityGate = (g, x, y, z) => viaScene(g, x, y, z, sub => {
    const tower = tx => { const t = new THREE.Group(); t.position.set(tx, 0, 0); sub.add(t); box(6, 10, 6, 'stone', 0, 0, 0, t);
      for (let i = -1; i <= 1; i++) for (const [a, b] of [[i * 2, 2.6], [i * 2, -2.6], [2.6, i * 2], [-2.6, i * 2]]) box(1, 1, 1, 'stoneDk', a, 10, b, t);
      box(.9, 1.6, .2, 'dark', 0, 6, 3.02, t); };
    tower(-6.5); tower(6.5);
    box(7, 3, 6, 'stone', 0, 6.5, 0, sub); for (let i = -2; i <= 2; i++) box(.9, .9, .9, 'stoneDk', i * 1.5, 9.5, 2.5, sub);
    const sh = new THREE.Shape(); sh.moveTo(-3.5, 0); sh.lineTo(3.5, 0); sh.lineTo(3.5, 6.6); sh.lineTo(-3.5, 6.6); sh.lineTo(-3.5, 0);
    const hole = new THREE.Path(); hole.moveTo(-3.3, 0); hole.lineTo(-3.3, 3.2); hole.absarc(0, 3.2, 3.3, Math.PI, 0, true); hole.lineTo(3.3, 0); hole.lineTo(-3.3, 0); sh.holes.push(hole);
    const vg = new THREE.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 14 }); vg.translate(0, 0, -3); add(vg, 'stone', 0, 0, 0, sub);
    for (const zz of [3.02, -3.02]) for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; const v = box(.55, .75, .2, 'stoneDk', Math.cos(a) * 3.55, 3.2 + Math.sin(a) * 3.55 - .37, zz, sub); v.rotation.z = a - Math.PI / 2; }
    box(.9, .7, .25, 'marble', 0, 6.75, 3.05, sub); });
  T(cityGate, 'city-gate', 'City gate: two towers and a vaulted arch', 'colossae 1.1', 'structure', ['gate', 'wall', 'stone', 'copy']);
  const spearRack = (g, x, y, z) => { box(1.2, .1, .12, 'wood', x, y + 1.3, z, g); for (const sx of [-.55, .55]) box(.08, 1.4, .08, 'wood', x + sx, y, z, g);
    for (let k = 0; k < 4; k++) { const sp = box(.04, 2.3, .04, 'woodLt', x - .4 + k * .26, y, z - .1, g); sp.rotation.x = .12; add(new THREE.ConeGeometry(.05, .22, 4), mat('iron', '#3c3a38'), x - .4 + k * .26, y + 2.35, z + .18, g); } return y + 2.5; };
  T(spearRack, 'spear-rack', 'Rack of spears', 'colossae 1.1', 'object', ['gate', 'war', 'wood', 'copy']);
  const seal = (g, x, y, z) => { const c = document.createElement('canvas'); c.width = c.height = 256; const k = c.getContext('2d');
    k.fillStyle = '#9a6a2a'; k.beginPath(); k.arc(128, 128, 126, 0, 7); k.fill(); k.strokeStyle = '#e0b84a'; k.lineWidth = 8; k.beginPath(); k.arc(128, 128, 112, 0, 7); k.stroke();
    k.strokeStyle = '#6a8a3a'; k.lineWidth = 6; for (const sd of [-1, 1]) { k.beginPath(); k.arc(128, 140, 80, Math.PI / 2 + sd * .4, Math.PI / 2 + sd * 2.2, sd < 0); k.stroke(); }
    k.fillStyle = '#f0d070'; k.font = 'bold 54px Georgia'; k.textAlign = 'center'; k.fillText('SPQR', 128, 150);
    k.beginPath(); k.moveTo(128, 40); k.lineTo(150, 80); k.lineTo(128, 70); k.lineTo(106, 80); k.closePath(); k.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = add(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ map: t, metalness: .5, roughness: .45 }), x, y + .06, z, g); s.rotation.x = -Math.PI / 2; s.castShadow = false; return y + .08; };
  T(seal, 'roman-seal', 'Roman seal set into the paving', 'colossae 1.1', 'object', ['gate', 'metal', 'writing', 'copy']);
  T((g, x, y, z) => { amph(g, x, z, 1.05, y); return y + 1.43; }, 'amphora', 'Big clay amphora', 'colossae 1.1', 'object', ['pottery', 'container', 'gate']);

  // ================= 1.2-1.5 the market stalls (engine stall(), colossae-ltm/world/gate.js and market.js) =================
  const stallOf = (cloth, goods, style) => (g, x, y, z) => viaScene(g, x, y, z, () => { stall(0, 0, 0, typeof cloth === 'function' ? cloth() : cloth, goods, style); });
  T(stallOf('#b9573e', g => fruit(g, '#6b2f5a'), 'roof'), 'stall-figs-tiled-roof', 'Fig stall with a tiled roof', 'colossae 1.2', 'structure', ['market', 'stall', 'food']);
  T(stallOf(() => stripeTex('#c1553b', '#efe2c4', 8), g => { for (let i = 0; i < 5; i++) amph(g, -1.4 + i * .7, .7, .8); for (let i = 0; i < 3; i++) amph(g, -1 + i, -.6, 1.2); }, 'awning'), 'stall-amphorae-awning', 'Amphora stall with a striped awning', 'colossae 1.2', 'structure', ['market', 'stall', 'pottery']);
  T(stallOf('#7d9a62', g => { ['#c94a3a', '#3f6f9a', '#e0b44a', '#efe6d4'].forEach((c, i) => box(.7, .5, .9, mat('w' + c, c), -1.2 + i * .8, 1.12, .7, g)); }, 'awning'), 'stall-cloth-awning', 'Cloth stall with a green awning', 'colossae 1.3', 'structure', ['market', 'stall', 'textile']);
  T(stallOf(() => stripeTex('#d9a640', '#c1553b', 6), g => fruit(g, '#c43a2e'), 'cart'), 'stall-fruit-cart', 'Fruit cart with a striped awning', 'colossae 1.5', 'structure', ['market', 'stall', 'cart', 'food']);
  T(stallOf('#efe2c4', g => { box(1.3, .6, .7, 'woodLt', 0, 1.12, .7, g); for (let i = 0; i < 4; i++) { const s = add(new THREE.CylinderGeometry(.1, .1, .9, 6), 'wool', -1.2 + i * .25 + (i > 1 ? 2 : 0), 1.25, .6, g); s.rotation.z = Math.PI / 2; } cyl(.12, .1, .2, 6, 'dark', .3, 1.75, .7, g); }, 'tent'), 'stall-wool-tent', 'Wool seller’s tent', 'colossae 1.3', 'structure', ['market', 'stall', 'tent', 'textile']);
  T(stallOf(() => stripeTex('#3f6f9a', '#efe7d4', 8), g => { cyl(.5, .55, .5, 10, 'woodLt', -1, 1.12, .7, g); for (let i = 0; i < 4; i++) cyl(.32, .18, .22, 8, 'clay', .2 + i * .45, 1.12, .7, g); }, 'roof'), 'stall-pottery-tiled-roof', 'Pottery stall with a tiled roof', 'colossae 1.4', 'structure', ['market', 'stall', 'pottery']);

  // the game-ready stall frame (BlackMike, CC BY 4.0) with the goods of each trade in its crates (copy of "colossae.marketStall")
  const GST = {
    'Fig Seller': { tint: '#7a3b6a', fill: ['#4a2048', '#6a7a3a'].map(c => ({ fruit: c, r: .07 })), loci: [{ fruit: '#5b2a5c', r: .075 }, { fruit: '#4a2048', r: .07 }, { fruit: '#6a7a3a', r: .07 }, { fruit: '#7a3a6a', r: .075 }, { fruit: '#5b2a5c', r: .072 }],
      ends: g => { P.basket(g, -2.35, 0, 1.6, '#5b2a4c'); P.basket(g, 2.35, 0, 1.6, '#e0b44a'); P.barrel(g, 2.5, 0, -1.1); } },
    'Scribe’s Table': { tint: '#3f6f9a', fill: ['letters', 'tablets'], loci: ['scrolls', 'tablets', 'ink', 'letters', 'scrolls'], ends: g => { P.chest(g, 2.4, 0, 1.5); } },
    'The Potter': { tint: '#d9a640', fill: ['cups', 'bowls'], loci: ['jugs', 'bowls', 'lamps', 'cups', 'jugs'], ends: g => { for (let k = 0; k < 5; k++) amph(g, -2.6 + (k % 3) * .45, 1.4 + (k > 2 ? .5 : 0), .7); P.kiln(g, 2.5, 0, -.6); } },
  };
  const gstallOf = name => (g, x, y, z) => viaScene(g, x, y, z, () => {
    if (!MODELS.gstall || !CRATES || CRATES.low.length !== 3 || CRATES.high.length !== 4) return;
    const s = GST[name], f = gstallFrame(0, 0, 0, s.tint); s.ends(f);
    fillCrate(f, CRATES.high[1], s.fill[0]); fillCrate(f, CRATES.high[2], s.fill[1]);
    [CRATES.low[0], CRATES.high[0], CRATES.high[3], CRATES.low[2], CRATES.low[1]].forEach((c, j) => fillCrate(f, c, s.loci[j])); });
  T(gstallOf('Fig Seller'), 'stall-frame-fig-seller', 'Market stall frame: fig seller', 'colossae 1.2', 'structure', ['market', 'stall', 'model', 'food']);
  T(gstallOf('Scribe’s Table'), 'stall-frame-scribe', 'Market stall frame: scribe’s table', 'colossae 1.3', 'structure', ['market', 'stall', 'model', 'writing']);
  T(gstallOf('The Potter'), 'stall-frame-potter', 'Market stall frame: the potter', 'colossae 1.4', 'structure', ['market', 'stall', 'model', 'pottery']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => { if (!MODELS.gstall) return; const f = gstallFrame(0, 0, 0, '#ffffff'); f.children[0].traverse(o => { if (o.isMesh && (o.material.name || '').includes('FruitVeg')) o.visible = true; });
    P.basket(f, -2.35, 0, 1.6, '#c43a2e'); P.basket(f, 2.35, 0, 1.6, '#e0b44a'); }), 'stall-frame-fruit', 'Market stall frame: fruit stall with its own fruit', 'colossae 1.5', 'structure', ['market', 'stall', 'model', 'food']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => { if (!MODELS.stall) return; const sg = new THREE.Group(); sg.rotation.y = 0; scene.add(sg); const c = MODELS.stall.clone(true); c.scale.setScalar(.9); sg.add(c); }), 'traditional-market-stall', 'Traditional market stall (model)', 'colossae kit', 'structure', ['market', 'stall', 'model']);

  // ================= 1.6 the well (copy of "colossae.well") =================
  const well = (g, x, y, z) => { const o = y;
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const b = box(.52, .72, .42, i % 2 ? 'stone' : 'stoneDk', x + Math.cos(a) * 1.1, o, z + Math.sin(a) * 1.1, g); b.rotation.y = -a; }
    box(.1, 1.9, .1, 'wood', x - 1, o, z, g); box(.1, 1.9, .1, 'wood', x + 1, o, z, g); box(2.2, .1, .1, 'wood', x, o + 1.85, z, g);
    cyl(1.45, 1.55, .25, 16, 'stoneDk', x, o - .05, z, g); { const rim = add(new THREE.RingGeometry(.88, 1.32, 24), mat('rimM', '#e8e2d6', { side: THREE.DoubleSide }), x, o + .73, z, g); rim.rotation.x = -Math.PI / 2; const shaft = add(new THREE.CylinderGeometry(.88, .88, 2.4, 20, 1, true), mat('shaft', '#2a221c', { side: THREE.BackSide }), x, o + .73 - 1.2, z, g); shaft.castShadow = false; cyl(.87, .87, .02, 20, mat('wellWater', '#1e3a3c', { roughness: .05, metalness: .2 }), x, o - 1.2, z, g); }
    const wl = add(new THREE.CylinderGeometry(.11, .11, 2, 10), 'wood', x, o + 1.45, z, g); wl.rotation.z = Math.PI / 2;
    box(.07, .5, .07, 'wood', x + 1.15, o + 1.35, z + .2, g); box(.25, .07, .07, 'wood', x + 1.15, o + 1.85, z + .3, g);
    box(.02, .75, .02, mat('rope', '#a8885a'), x, o + .85, z, g); cyl(.17, .14, .28, 10, 'wood', x, o + .6, z, g);
    for (let i = 0; i < 8; i++) { const a = R(0, 6), r = R(1.7, 2.3); add(new THREE.DodecahedronGeometry(R(.08, .16), 0), 'stoneDk', x + Math.cos(a) * r, o + .04, z + Math.sin(a) * r, g).scale.y = .5; }
    return o + 1.95; };
  T(well, 'village-well', 'Stone well with a windlass and bucket', 'colossae 1.6', 'structure', ['well', 'water', 'stone', 'copy']);
  T((g, x, y, z) => { cyl(.24, .19, .4, 12, 'wood', x, y, z, g); cyl(.21, .21, .02, 12, mat('basinW', '#8fd8d4'), x, y + .37, z, g); return y + .4; }, 'water-pail', 'Pail of water', 'colossae 1.6', 'object', ['well', 'water', 'container']);
  T((g, x, y, z) => { box(2.4, .2, .8, 'stone', x, y + .45, z, g); box(.3, .45, .6, 'stone', x - .9, y, z, g); box(.3, .45, .6, 'stone', x + .9, y, z, g); return y + .65; }, 'stone-bench', 'Stone bench', 'colossae 1.6', 'object', ['well', 'stone', 'furniture']);

  // ================= 2 the temple courtyard (copy of colossae-ltm/world/temple.js) =================
  // the temple stands with its front towards +z and is centred on the origin by viaScene(.., z + 6)
  const temple = (g, x, y, z) => viaScene(g, x, y, z + 6, () => { const TZ = 0;
      const g = new THREE.Group(); g.position.set(0, heightAt(0, TZ - 6), TZ - 6); scene.add(g);
      for (let i = 0; i < 3; i++) box(16 - i * 1.2, .5, 12 - i * 1.2, 'marble', 0, i * .5, 0, g);
      box(9, 6, 7, 'wallTrim', 0, 1.5, -1, g); box(2.6, 4.2, .2, mat('bronze', '#7a5230', { metalness: .4, roughness: .5 }), 0, 1.5, 2.52, g); box(3.2, .45, .35, 'marble', 0, 5.7, 2.55, g); for (const sx of [-1.45, 1.45]) box(.35, 4.2, .3, 'marble', sx, 1.5, 2.55, g);
      for (let i = 0; i < 6; i++) for (const zz of [4.6, -4.6]) cyl(.42, .5, 6, 10, 'marble', -6 + i * 2.4, 1.5, zz, g);
      for (let k = -1; k <= 1; k++) for (const xx of [-6, 6]) cyl(.42, .5, 6, 10, 'marble', xx, 1.5, k * 2.3, g);
      box(14.2, .8, 10.6, 'marble', 0, 7.5, 0, g);
      { const pl = new THREE.PointLight('#ffc27a', 1.8, 7, 1.6); pl.position.set(0, 4, 3.6); g.add(pl); for (const sx of [-1.8, 1.8]) { cyl(.12, .16, 1.3, 7, mat('bronze', '#7a5230', { metalness: .4, roughness: .5 }), sx, 1.5, 3.4, g); add(new THREE.SphereGeometry(.14, 7, 5), mat('lampGlow', '#ffd27a', { emissive: '#ff9a3a', emissiveIntensity: 1.4 }), sx, 2.95, 3.4, g); } }
      const r = gableRoof(14.2, 10.6, 2.6, 'roof', 0, 8.3, 0, Math.PI / 2, g); r.scale.set(.75, 1, 1.0); if (KMAT.MI_RoundTiles) { r.material = KMAT.MI_RoundTiles; worldUV(r.geometry, .35); }
      // pediment
      const pd = gableRoof(13.4, .2, 2.2, mat('ped', '#e3dccd'), 0, 8.3, 5.35, 0, g);
      for (let i = -4; i <= 4; i++) { const hgt = 1.6 * (1 - Math.abs(i) / 5.2); if (hgt < .35) continue; const fig = new THREE.Group(); fig.position.set(i * 1.25, 8.4, 5.5); g.add(fig);
        add(new THREE.CylinderGeometry(.16, .26, hgt * .75, 6), 'marble', 0, 0, 0, fig); add(new THREE.IcosahedronGeometry(.14, 0), 'marble', 0, hgt * .75 + .12, 0, fig); if (Math.abs(i) > 2) fig.rotation.z = Math.sign(i) * -.9; }
      box(2.2, .5, .12, mat('tymp', '#c9a24a', { metalness: .4, roughness: .5 }), 0, 9.95, 5.46, g);
      box(14.8, .35, 11.2, 'wallTrim', 0, 8.15, 0, g); box(14.4, .2, 10.8, 'marble', 0, 7.3, 0, g);
      for (let i = -6.6; i <= 6.6; i += 1.1) for (const zz of [5.3, -5.3]) box(.35, .55, .08, 'stoneDk', i, 7.7, zz, g);
      for (let i = 0; i < 6; i++) for (const zz of [4.6, -4.6]) { box(1.05, .3, 1.05, 'marble', -6 + i * 2.4, 7.2, zz, g); box(1.1, .3, 1.1, 'marble', -6 + i * 2.4, 1.5, zz, g); }
      for (let i = 0; i < 4; i++) box(6, .4, .8, 'marble', 0, i * .4 - .4, 6.8 - i * .8, g);
      for (const [ax, ay2] of [[0, 2.6], [-7, 0], [7, 0]]) add(new THREE.OctahedronGeometry(.45, 0), mat('acro', '#c79a3a', { metalness: .3 }), ax, heightAt(0, TZ - 6) + 8.4 + ay2, TZ - .65);
  });
  T(temple, 'marble-temple', 'Marble temple with a columned porch and pediment', 'colossae 2.2', 'structure', ['temple', 'marble', 'columns', 'copy']);
  const pedestal = (g, x, y, z) => { box(1.5, .3, 1.5, 'marble', x, y, z, g); box(1.2, 1.4, 1.2, 'stone', x, y + .3, z, g); box(1.5, .25, 1.5, 'marble', x, y + 1.7, z, g); return y + 1.95; };
  const statueOn = pose => (g, x, y, z) => { const t = pedestal(g, x, y, z); const st = makeStatue(THREE, { pose, height: 2.3 }); st.position.set(x, t, z); st.rotation.y = pose === 'festival' ? -.5 : .5; g.add(st); return t + 2.3 + .35; };
  T(statueOn('philosopher'), 'philosopher-statue', 'Marble philosopher on a pedestal', 'colossae 2.2', 'object', ['statue', 'marble', 'temple']);
  T(statueOn('festival'), 'festival-statue', 'Marble festival figure on a pedestal', 'colossae 2.4', 'object', ['statue', 'marble', 'temple']);
  const altar = (g, x, y, z) => { box(2.4, 1.2, 1.6, 'stone', x, y, z, g); box(2.7, .25, 1.9, 'marble', x, y + 1.2, z, g);
    for (const sd of [-1, 1]) { const og = new THREE.Group(); og.position.set(x + sd * .75, y + 1.45, z + .5); g.add(og); P.offerings(og, 0, 0, 0); }
    box(2.75, .3, .08, mat('frieze', '#c9a24a', { metalness: .3 }), x, y + .75, z + .95, g);
    const f = makeFire(THREE, { scale: .5 }); f.position.set(x, y + 1.4, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return y + 2.3; };
  T(altar, 'altar-with-fire', 'Stone altar with a burning fire and offerings', 'colossae 2.3', 'structure', ['temple', 'fire', 'altar', 'copy']);
  T((g, x, y, z) => { box(.7, .45, 3, 'marble', x, y, z, g); box(.8, .12, 3.2, 'marble', x, y + .45, z, g); return y + .57; }, 'marble-bench', 'Marble bench', 'colossae 2.1', 'object', ['temple', 'marble', 'furniture']);
  T(via(() => booth(0, 0, [0, 10], '#efe4cc')), 'tasselled-booth', 'Booth with a tasselled cloth roof', 'colossae 2.1', 'structure', ['temple', 'cloth', 'booth']);

  // ================= 3 the family house (copy of colossae-ltm/world/family-house.js; the library's world part puts HX = HZ = 0) =================
  const atrium = (g, x, y, z) => viaScene(g, x, y, z, () => {
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
  });
  T(atrium, 'roman-house-atrium', 'Roman house around an open atrium with an upper gallery', 'colossae 3.1', 'structure', ['house', 'columns', 'marble', 'copy']);
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

  // ================= 4 the bridge and the road (copy of colossae-ltm/world/bridge.js) =================
  const bridge = (g, x, y, z) => viaScene(g, x, y, z, () => { const BX = 0, BZ = 0;
      const g = new THREE.Group(); g.position.set(BX, 0, BZ); scene.add(g);
      const deckY = 1.1;
      box(26, .6, 4.5, 'stone', 0, deckY, 0, g);
      for (const s of [-1, 1]) { box(26, 1.15, .45, 'stoneDk', 0, deckY + .6, s * 2.1, g); box(26.2, .18, .62, 'marble', 0, deckY + 1.75, s * 2.1, g); for (let i = -12; i <= 12; i += 3) box(.6, 1.45, .6, 'stone', i, deckY + .6, s * 2.1, g); }
      for (const x of [-3.7, 3.7]) { const fo = add(new THREE.TorusGeometry(2.1, .28, 4, 14), mat('foam', '#f4fbf8', { roughness: .4 }), x, -1.66, 0, g); fo.rotation.x = Math.PI / 2; fo.scale.set(.75, 1.25, 1); fo.castShadow = false; }
      for (const x of [-11, -3.7, 3.7, 11]) { box(2.2, deckY + 4.5, 4.4, 'stone', x, -4.5, 0, g); box(2.6, .35, 4.6, 'stoneDk', x, -1.8, 0, g);
        if (Math.abs(x) < 5) for (const s of [-1, 1]) { const cw = add(new THREE.CylinderGeometry(1.55, 1.55, 3.2, 3), 'stone', x, -2.9, s * 2.6, g); cw.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; cw.scale.z = .7; } }
      for (const s of [-1, 1]) { box(5, 4.5, 5.8, 'stone', s * 13.7, -4.5, 0, g);  }
      // arches: spandrel block with semicircular opening, ring of voussoirs
      for (const cx of [-7.35, 0, 7.35]) {
        const sh = new THREE.Shape(); sh.moveTo(-2.65, -4.5); sh.lineTo(2.65, -4.5); sh.lineTo(2.65, deckY); sh.lineTo(-2.65, deckY); sh.lineTo(-2.65, -4.5);
        const hole = new THREE.Path(); hole.moveTo(-2.6, -4.5); hole.lineTo(-2.6, -1.6); hole.absarc(0, -1.6, 2.6, Math.PI, 0, true); hole.lineTo(2.6, -4.5); hole.lineTo(-2.6, -4.5); sh.holes.push(hole);
        const eg = new THREE.ExtrudeGeometry(sh, { depth: 4.4, bevelEnabled: false, curveSegments: 6 }); eg.translate(0, 0, -2.2);
        add(eg, 'stone', cx, 0, 0, g);
        for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8; for (const zz of [2.25, -2.25]) { const v = box(.5, .7, .14, 'stoneDk', cx + Math.cos(a) * 2.95, -1.6 + Math.sin(a) * 2.95 - .35, zz, g); v.rotation.z = a - Math.PI / 2; } }
      }
      // ramps
      for (const s of [-1, 1]) { const x = s * 15, y = heightAt(BX + x, BZ); box(5, Math.max(.3, deckY + .6 - y), 4.5, 'stone', x, y, 0, g); }
  });
  T(bridge, 'stone-arch-bridge', 'Three-arch stone bridge over the river', 'colossae 4.2', 'structure', ['bridge', 'river', 'stone', 'copy']);
  T(via(() => { house(0, 0, 9, 6, 1, 0); for (let i = -1; i <= 1; i++) cyl(.2, .25, 2.6, 6, 'wood', i * 3, 0, 4.5); box(9, .2, 2.4, 'roofDk', 0, 2.6, 4); }), 'waystation', 'Waystation house with a porch on posts', 'colossae 4.4', 'structure', ['house', 'road', 'travel']);
  T((g, x, y, z) => { box(2.4, .5, 1.4, 'woodLt', x, y + .6, z, g); for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(.6, .6, .15, 10), 'wood', x, y + .6, z + s * .8, g); w.rotation.x = Math.PI / 2; } return y + 1.1; }, 'hand-cart', 'Hand cart on two wheels', 'colossae 4.3', 'object', ['travel', 'wood', 'cart']);

  // ================= the town around the rooms (colossae-ltm/world/town.js) =================
  T((g, x, y, z) => { box(6, .4, 26, 'marble', x, y, z, g); box(2, 6, 26, 'wallTrim', x - 2.5, y, z, g); for (let i = 0; i < 9; i++) cyl(.3, .35, 5.2, 10, 'marble', x + 2.4, y + .4, z - 12 + i * 3, g); box(6.4, .6, 26.4, 'marble', x, y + 5.6, z, g); gableRoof(6.6, 26.6, 1.6, 'roof', x, y + 6.2, z, 0, g); return y + 7.8; }, 'marble-stoa', 'Long marble stoa with nine columns', 'colossae kit', 'structure', ['stoa', 'columns', 'marble', 'copy']);
  T((g, x, y, z) => { cyl(4.2, 4.6, .8, 16, 'marble', x, y, z, g); cyl(2.6, 2.6, 4, 14, 'wallTrim', x, y + .8, z, g);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cyl(.22, .26, 4, 8, 'marble', x + Math.cos(a) * 3.7, y + .8, z + Math.sin(a) * 3.7, g); }
    cyl(4.2, 4.2, .5, 16, 'marble', x, y + 4.8, z, g); add(new THREE.ConeGeometry(4.5, 2.2, 16), 'roof', x, y + 6.4, z, g); return y + 7.5; }, 'round-shrine', 'Round shrine with a ring of columns', 'colossae kit', 'structure', ['shrine', 'columns', 'marble', 'copy']);
  T(via(() => { house(0, 0, 12, 9, 3, Math.PI / 2); }), 'insula-three-storey', 'Three-storey apartment block', 'colossae kit', 'structure', ['house', 'town']);
}
