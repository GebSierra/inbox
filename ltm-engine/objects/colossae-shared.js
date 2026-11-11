// ---------- SHARED BUILDERS: Colossae's places, built by the town AND shown in the object library (one source of truth) ----------
// These are the town's own pieces, lifted out of colossae-ltm/world/*.js and parameterised by where they stand. The town calls them at its real
// coordinates; the library (objects/colossae-places.js) calls the same functions at the origin on its flat stage.
// Loaded before the world parts (town.json "obj:colossae-shared"), so everything here is a function declaration: they only run when called.
// Random numbers (R/rnd) are drawn exactly where the old inline code drew them, so a town's random stream does not move.

// the city gate: two towers, the lintel and the vaulted arch, centred on x = 0 at z = GZ
function cityGate(GZ) {
  const tower = (x) => { const g = new THREE.Group(); g.position.set(x, heightAt(x, GZ), GZ); scene.add(g);
    box(6, 10, 6, 'stone', 0, 0, 0, g);
    for (let i = -1; i <= 1; i++) for (const [a, b] of [[i * 2, 2.6], [i * 2, -2.6], [2.6, i * 2], [-2.6, i * 2]]) box(1, 1, 1, 'stoneDk', a, 10, b, g);
    box(.9, 1.6, .2, 'dark', 0, 6, 3.02, g); };
  tower(-6.5); tower(6.5);
  box(7, 3, 6, 'stone', 0, 6.5, GZ); for (let i = -2; i <= 2; i++) box(.9, .9, .9, 'stoneDk', i * 1.5, 9.5, GZ + 2.5);
  { const gy0 = heightAt(0, GZ), sh = new THREE.Shape(); sh.moveTo(-3.5, 0); sh.lineTo(3.5, 0); sh.lineTo(3.5, 6.6); sh.lineTo(-3.5, 6.6); sh.lineTo(-3.5, 0);
    const hole = new THREE.Path(); hole.moveTo(-3.3, 0); hole.lineTo(-3.3, 3.2); hole.absarc(0, 3.2, 3.3, Math.PI, 0, true); hole.lineTo(3.3, 0); hole.lineTo(-3.3, 0); sh.holes.push(hole);
    const vg = new THREE.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 14 }); vg.translate(0, 0, -3); add(vg, 'stone', 0, gy0, GZ);
    for (const zz of [GZ + 3.02, GZ - 3.02]) { for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; const v = box(.55, .75, .2, 'stoneDk', Math.cos(a) * 3.55, gy0 + 3.2 + Math.sin(a) * 3.55 - .37, zz); v.rotation.z = a - Math.PI / 2; } }
    box(.9, .7, .25, 'marble', 0, gy0 + 6.75, GZ + 3.05); }
}

// a rack of spears (g, x, y, z) => top y
function spearRack(g, x, y, z) { box(1.2, .1, .12, 'wood', x, y + 1.3, z, g); for (const sx of [-.55, .55]) box(.08, 1.4, .08, 'wood', x + sx, y, z, g);
  for (let k = 0; k < 4; k++) { const sp = box(.04, 2.3, .04, 'woodLt', x - .4 + k * .26, y, z - .1, g); sp.rotation.x = .12; add(new THREE.ConeGeometry(.05, .22, 4), mat('iron', '#3c3a38'), x - .4 + k * .26, y + 2.35, z + .18, g); } return y + 2.5; }

// the Roman seal set into the paving
function romanSeal(g, x, y, z) { const c = document.createElement('canvas'); c.width = c.height = 256; const k = c.getContext('2d');
    k.fillStyle = '#9a6a2a'; k.beginPath(); k.arc(128, 128, 126, 0, 7); k.fill(); k.strokeStyle = '#e0b84a'; k.lineWidth = 8; k.beginPath(); k.arc(128, 128, 112, 0, 7); k.stroke();
    k.strokeStyle = '#6a8a3a'; k.lineWidth = 6; for (const sd of [-1, 1]) { k.beginPath(); k.arc(128, 140, 80, Math.PI / 2 + sd * .4, Math.PI / 2 + sd * 2.2, sd < 0); k.stroke(); }
    k.fillStyle = '#f0d070'; k.font = 'bold 54px Georgia'; k.textAlign = 'center'; k.fillText('SPQR', 128, 150);
    k.beginPath(); k.moveTo(128, 40); k.lineTo(150, 80); k.lineTo(128, 70); k.lineTo(106, 80); k.closePath(); k.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = add(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ map: t, metalness: .5, roughness: .45 }), x, y + .06, z, g); s.rotation.x = -Math.PI / 2; s.castShadow = false; return y + .08; }

// the well: ring of stones, posts and beam, base, rim, shaft, water, windlass, rope and bucket, and the loose stones round it (draws 24 random numbers)
function villageWell(g, x, y, z) { const o = y;
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const b = box(.52, .72, .42, i % 2 ? 'stone' : 'stoneDk', x + Math.cos(a) * 1.1, o, z + Math.sin(a) * 1.1, g); b.rotation.y = -a; }
  box(.1, 1.9, .1, 'wood', x - 1, o, z, g); box(.1, 1.9, .1, 'wood', x + 1, o, z, g); box(2.2, .1, .1, 'wood', x, o + 1.85, z, g);
  cyl(1.45, 1.55, .25, 16, 'stoneDk', x, o - .05, z, g); { const rim = add(new THREE.RingGeometry(.88, 1.32, 24), mat('rimM', '#e8e2d6', { side: THREE.DoubleSide }), x, o + .73, z, g); rim.rotation.x = -Math.PI / 2; const shaft = add(new THREE.CylinderGeometry(.88, .88, 2.4, 20, 1, true), mat('shaft', '#2a221c', { side: THREE.BackSide }), x, o + .73 - 1.2, z, g); shaft.castShadow = false; cyl(.87, .87, .02, 20, mat('wellWater', '#1e3a3c', { roughness: .05, metalness: .2 }), x, o - 1.2, z, g); }
  const wl = add(new THREE.CylinderGeometry(.11, .11, 2, 10), 'wood', x, o + 1.45, z, g); wl.rotation.z = Math.PI / 2;
  box(.07, .5, .07, 'wood', x + 1.15, o + 1.35, z + .2, g); box(.25, .07, .07, 'wood', x + 1.15, o + 1.85, z + .3, g);
  box(.02, .75, .02, mat('rope', '#a8885a'), x, o + .85, z, g); cyl(.17, .14, .28, 10, 'wood', x, o + .6, z, g);
  for (let i = 0; i < 8; i++) { const a = R(0, 6), r = R(1.7, 2.3); add(new THREE.DodecahedronGeometry(R(.08, .16), 0), 'stoneDk', x + Math.cos(a) * r, o + .04, z + Math.sin(a) * r, g).scale.y = .5; }
  return o + 1.95; }
// a pail of water
function waterPail(g, x, y, z) { cyl(.24, .19, .4, 12, 'wood', x, y, z, g); cyl(.21, .21, .02, 12, mat('basinW', '#8fd8d4'), x, y + .37, z, g); return y + .4; }
// a stone bench
function stoneBench(g, x, y, z) { box(2.4, .2, .8, 'stone', x, y + .45, z, g); box(.3, .45, .6, 'stone', x - .9, y, z, g); box(.3, .45, .6, 'stone', x + .9, y, z, g); return y + .65; }

// the marble temple, front towards +z, its centre at (0, TZ - 6): steps, cella, porch, pediment with figures, roof, lamps (lit by one point light)
function marbleTemple(TZ) {
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
  // steps to front
  for (let i = 0; i < 4; i++) box(6, .4, .8, 'marble', 0, i * .4 - .4, 6.8 - i * .8, g);
  for (const [ax, ay2] of [[0, 2.6], [-7, 0], [7, 0]]) add(new THREE.OctahedronGeometry(.45, 0), mat('acro', '#c79a3a', { metalness: .3 }), ax, heightAt(0, TZ - 6) + 8.4 + ay2, TZ - .65);
}

// the altar of the temple courtyard: stone altar with a marble top, offerings, a gilt frieze and a burning fire (adds the fire to FIRES)
function altarWithFire(g, x, y, z) { box(2.4, 1.2, 1.6, 'stone', x, y, z, g); box(2.7, .25, 1.9, 'marble', x, y + 1.2, z, g);
  for (const sd of [-1, 1]) { const og = new THREE.Group(); og.position.set(x + sd * .75, y + 1.45, z + .5); g.add(og); P.offerings(og, 0, 0, 0); }
  box(2.75, .3, .08, mat('frieze', '#c9a24a', { metalness: .3 }), x, y + .75, z + .96, g);
  const f = makeFire(THREE, { scale: .5 }); f.position.set(x, y + 1.4, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return y + 2.3; }

// the Roman house around its atrium (centre HX, HZ): walls, peristyle, upper gallery, porch, door, garden and impluvium (draws 20 random numbers)
function romanAtrium(HX, HZ) {
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

// the three-arch stone bridge over the river, centred on (BX, BZ), the deck at y = 1.1
function stoneArchBridge(BX, BZ) {
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
}

// the waystation: a house with a porch on posts under a lean-to roof (the house draws its own random numbers)
function waystationPorch(wx, wz) { const ws = house(wx, wz, 9, 6, 1, 0);
  for (let i = -1; i <= 1; i++) cyl(.2, .25, 2.6, 6, 'wood', wx + i * 3, heightAt(wx, wz), wz + 4.5);
  box(9, .2, 2.4, 'roofDk', wx, heightAt(wx, wz) + 2.6, wz + 4); return ws; }
// a hand cart on two wheels
function handCart(g, x, y, z) { box(2.4, .5, 1.4, 'woodLt', x, y + .6, z, g); for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(.6, .6, .15, 10), 'wood', x, y + .6, z + s * .8, g); w.rotation.x = Math.PI / 2; } return y + 1.1; }

// the long marble stoa with nine columns
function marbleStoa(g, x, y, z) { box(6, .4, 26, 'marble', x, y, z, g); box(2, 6, 26, 'wallTrim', x - 2.5, y, z, g); for (let i = 0; i < 9; i++) cyl(.3, .35, 5.2, 10, 'marble', x + 2.4, y + .4, z - 12 + i * 3, g); box(6.4, .6, 26.4, 'marble', x, y + 5.6, z, g); gableRoof(6.6, 26.6, 1.6, 'roof', x, y + 6.2, z, 0, g); return y + 7.8; }
// the round shrine: a ring of twelve columns round a drum, under a cone roof
function roundShrine(g, x, y, z) { cyl(4.2, 4.6, .8, 16, 'marble', x, y, z, g); cyl(2.6, 2.6, 4, 14, 'wallTrim', x, y + .8, z, g);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cyl(.22, .26, 4, 8, 'marble', x + Math.cos(a) * 3.7, y + .8, z + Math.sin(a) * 3.7, g); }
  cyl(4.2, 4.2, .5, 16, 'marble', x, y + 4.8, z, g); add(new THREE.ConeGeometry(4.5, 2.2, 16), 'roof', x, y + 6.4, z, g); return y + 7.5; }

// the game-ready stall frames' trades (BlackMike frame, CC BY 4.0): awning tint, the goods in each crate (loci: [what to fill, its label]), the two top crates' fill, and the
// extras at the stall's ends. Used by colossae-ltm/world/market.js ("colossae.marketStall") and by the library's stall-frame entries. Only closures run later, no random numbers here.
const GST = {
  'Fig Seller': { tint: '#7a3b6a', fill: [{ fruit: '#4a2048', r: .07 }, { fruit: '#6a7a3a', r: .07 }], loci: [[{ fruit: '#5b2a5c', r: .075 }, 'crate of purple figs'], [{ fruit: '#4a2048', r: .07 }, 'crate of dark figs'], [{ fruit: '#6a7a3a', r: .07 }, 'crate of green figs'], [{ fruit: '#7a3a6a', r: .075 }, 'crate of ripe figs'], [{ fruit: '#5b2a5c', r: .072 }, 'crate of figs']],
    ends: g => { P.basket(g, -2.35, 0, 1.6, '#5b2a4c'); P.basket(g, 2.35, 0, 1.6, '#e0b44a'); P.barrel(g, 2.5, 0, -1.1); } },
  'Scribe’s Table': { tint: '#3f6f9a', fill: ['letters', 'tablets'], loci: [['scrolls', 'crate of scrolls'], ['tablets', 'wax tablets'], ['ink', 'ink pots and quills'], ['letters', 'sealed letters'], ['scrolls', 'scrolls for sale']], ends: g => { P.chest(g, 2.4, 0, 1.5); } },
  'The Potter': { tint: '#d9a640', fill: ['cups', 'bowls'], loci: [['jugs', 'little jugs'], ['bowls', 'stacked bowls'], ['lamps', 'clay oil lamps'], ['cups', 'drinking cups'], ['jugs', 'painted jugs']], ends: g => { for (let k = 0; k < 5; k++) amph(g, -2.6 + (k % 3) * .45, 1.4 + (k > 2 ? .5 : 0), .7); P.kiln(g, 2.5, 0, -.6); } },
};
