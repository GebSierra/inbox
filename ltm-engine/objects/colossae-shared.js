// ---------- SHARED BUILDERS: Colossae's places, built by the town AND shown in the object library (one source of truth) ----------
// These are the town's own pieces, lifted out of colossae-ltm/world/*.js and parameterised by where they stand. The town calls them at its real
// coordinates; the library (objects/colossae-places.js) calls the same functions at the origin on its flat stage.
// Loaded before the world parts (town.json "obj:colossae-shared"), so everything here is a function declaration: they only run when called.
// Random numbers (R/rnd) are drawn exactly where the old inline code drew them, so a town's random stream does not move.

// the city gate: two towers, the lintel and the vaulted arch, centred on x = 0 at z = GZ. Returns nothing (the parts go into `scene`).
// Every option is optional; with none, this is exactly Colossae's gate. No random numbers are drawn.
//   style      a named preset merged under your own options: 'colossae' (the defaults) or 'james' (James's agora gate, which is built the same way: see GATE_STYLES)
//   towerH     tower height in metres (10); the merlons sit on top of it
//   battlements  false leaves the towers and the lintel without merlons (true)
//   voussoirs  false leaves the dark arch-stones off both faces of the arch (true)
//   keystone   false leaves the marble plaque over the arch off (true)
//   slits      false leaves the dark arrow-slit door on the front of each tower off (true)
//   torches    true adds a bracket torch (bronze cup, emissive flame, no light) on each side of the arch, facing +z (false)
//   wallH      height of the city wall that meets the towers (3.6, so its cornice meets the arch's impost course): a string course goes round each tower at that wall's cornice line; 0 leaves it off
//   banners    true hangs a cloth banner from each tower, facing +z (false)
//   stone, stoneDk, trim, dark   material keys or materials for the wall stone, the dark merlon stone, the keystone and the slits ('stone', 'stoneDk', 'marble', 'dark')
//   bannerColor  banner cloth colour ('#a83a2a'),  bannerTrim  its fringe ('#d9a640')
const GATE_STYLES = { colossae: { inscription: '\u039A\u039F\u039B\u039F\u03A3\u03A3\u0391\u0399' }, james: { inscription: '\u0391\u0393\u039F\u03A1\u0391' } };
function cityGate(GZ, opts = {}) {
  const o = Object.assign({ towerH: 10, battlements: true, voussoirs: true, keystone: true, slits: true, torches: false, banners: false, wallH: 3.6,
    stone: 'stone', stoneDk: 'stoneDk', trim: 'marble', dark: 'dark', bannerColor: '#a83a2a', bannerTrim: '#d9a640' }, GATE_STYLES[opts.style || 'colossae'], opts);
  const H = o.towerH;
  // the town's own stone colours, with coursed ashlar for the walls and dressed stone for single blocks (see objects/up-a.js)
  const st = uaStoneMat(o.stone, 'Ash'), sd = uaStoneMat(o.stoneDk, 'Ash'), dr = uaStoneMat(o.stone, 'Dr'), drd = uaStoneMat(o.stoneDk, 'Dr'), drl = uaStoneMat(o.trim, 'Dr');
  const moss = typeof o.stoneDk === 'string' ? uaStoneMat(o.stoneDk, 'Ash', '#c4ccac') : o.stoneDk;
  const tower = (x) => { const g = new THREE.Group(); g.position.set(x, heightAt(x, GZ), GZ); scene.add(g);
    if (o.slits) { box(6, H, 4.4, st, 0, 0, 0, g); uaTowerFace(g, H, 1, true, st, drd, o); uaTowerFace(g, H, -1, false, st, drd, o); } else box(6, H, 6, st, 0, 0, 0, g);
    box(6.3, .6, 6.3, moss, (x < 0 ? -.15 : .15), 0, 0, g); box(6.4, .1, 6.4, drd, (x < 0 ? -.15 : .15), .6, 0, g);
    box(6.4, .3, 6.4, drl, 0, H - .6, 0, g); box(6.24, .1, 6.24, drd, 0, H - .7, 0, g);
    if (o.wallH && !o.torches && !o.banners) { box(6.3, .3, 6.3, drl, 0, o.wallH - .6, 0, g); box(6.2, .1, 6.2, drd, 0, o.wallH - .7, 0, g); }   // string course at the wall's cornice height, so the city wall's cornice runs straight into the tower
    if (o.battlements) for (let i = -1; i <= 1; i++) for (const [a, b] of [[i * 2, 2.6], [i * 2, -2.6], [2.6, i * 2], [-2.6, i * 2]]) box(1, 1, 1, sd, a, H, b, g);
    if (o.banners) { const sg = Math.sign(x), bx = -sg * 1.4; box(1.5, 2.6, .06, mat('gateBanner', o.bannerColor, { side: THREE.DoubleSide }), bx, 3.4, 3.06, g); box(1.5, .14, .08, mat('gateBannerTrim', o.bannerTrim), bx, 3.26, 3.07, g); box(1.7, .1, .1, 'wood', bx, 6.1, 3.08, g); } };
  tower(-6.5); tower(6.5);
  box(7, 3, 6, st, 0, 6.5, GZ); for (const sx of [-2.8, 2.8]) box(1.7, .3, 6.3, drl, sx, 8.95, GZ); box(7.3, .3, .3, drl, 0, 8.95, GZ - 3); if (o.battlements) for (let i = -2; i <= 2; i++) box(.9, .9, .9, sd, i * 1.5, 9.5, GZ + 2.5);
  { const gy0 = heightAt(0, GZ), sh = new THREE.Shape(); sh.moveTo(-3.5, 0); sh.lineTo(-3.3, 0); sh.lineTo(-3.3, 3.2); sh.absarc(0, 3.2, 3.3, Math.PI, 0, true); sh.lineTo(3.3, 0); sh.lineTo(3.5, 0); sh.lineTo(3.5, 6.6); sh.lineTo(-3.5, 6.6); sh.lineTo(-3.5, 0);   // one outline with the passage open at the bottom: a hole touching the bottom edge left a floor slab across the passage
    const vg = new THREE.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 14 }); vg.translate(0, 0, -3); add(vg, st, 0, gy0, GZ);
    if (o.voussoirs) {
      // irregular voussoirs through the whole passage (so you see them inside too), a keystone, an impost course and uneven jamb blocks
      const gz = new THREE.Group(); gz.position.set(0, gy0, GZ); scene.add(gz);
      uaVoussoirs(gz, 0, 3.2, 3.28, .42, .62, 13, -3.16, 3.16, [dr, drd, drl], 2207, .2);
      for (const sg of [-1, 1]) { box(.95, .2, 6.34, drl, sg * 3.66, 3.0, 0, gz); box(.8, .06, 6.4, drd, sg * 3.6, 3.2, 0, gz).position.y = 3.2;
        let yy = 0; [.74, .5, .7, .56, .5].forEach((h, i) => { const wd = i % 2 ? .62 : .92; box(wd, h - .03, 6.3, i % 2 ? dr : drd, sg * (3.22 + wd / 2), yy, 0, gz); yy += h; }); }
    }
    if (o.keystone) uaPlaque(scene, 0, gy0 + 7.78, GZ + 3, 3.0, 1.05, o.inscription, drl);
    if (o.torches) for (const sx of [-3.9, 3.9]) { box(.1, .9, .1, 'wood', sx, gy0 + 2.2, GZ + 3.1); cyl(.14, .09, .2, 7, mat('bronze', '#7a5230', { metalness: .4, roughness: .5 }), sx, gy0 + 3.05, GZ + 3.1);
      add(new THREE.SphereGeometry(.15, 7, 5), mat('lampGlow', '#ffd27a', { emissive: '#ff9a3a', emissiveIntensity: 1.4 }), sx, gy0 + 3.4, GZ + 3.1).castShadow = false; } }
}

// a rack of spears (spearRack_ at the end of this part), the Roman seal (objects/up-e.js)
function spearRack(g, x, y, z) { return spearRack_(g, x, y, z); }
function romanSeal(g, x, y, z) { return ueRomanSeal(g, x, y, z); }   // objects/up-e.js: a bronze medallion bedded flush in the paving, ringed with setting stones

// the well (upgraded: stone_well_ below), then the loose stones round it (draws 24 random numbers, exactly as before)
function villageWell(g, x, y, z) { const top = stoneWell_(g, x, y, z);
  for (let i = 0; i < 8; i++) { const a = R(0, 6), r = R(1.7, 2.3); add(new THREE.DodecahedronGeometry(R(.08, .16), 0), 'stoneDk', x + Math.cos(a) * r, y + .04, z + Math.sin(a) * r, g).scale.y = .5; }
  return top; }
function waterPail(g, x, y, z) { return waterPail_(g, x, y, z); }
function stoneBench(g, x, y, z) { return stoneBench_(g, x, y, z); }

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
function altarWithFire(g, x, y, z) { return altarOfFire(g, x, y, z); }   // built in objects/up-a.js

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

// ---- upgraded models (from the object-library pass): gate guard, spear rack, Roman seal, pail, well, water carrier, marble bench ----
// ---- helpers for the gate and well objects. None of them draws a random number from R(), so the town's seeded layout is untouched. ----
// A limb: a tapered cylinder from point p to point q (both [x,y,z] in g's coordinates).
function LIMB(g, p, q, r, m, seg = 7) {
  const a = new THREE.Vector3(...p), b = new THREE.Vector3(...q), d = b.clone().sub(a), len = d.length();
  const c = add(new THREE.CylinderGeometry(r, r * .85, len, seg), m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, g);
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return c;
}
// A spear head with its socket, on the end of a shaft. (x, y, z) is where the shaft ends, in the shaft's own coordinates, so the head can never drift off it.
function SPEARHEAD(g, x, y, z) {
  const steel = mat('spearSteel', '#c4cace', { metalness: .7, roughness: .3, side: THREE.DoubleSide }), brz = mat('spearSocket', '#8a6a2a', { metalness: .5, roughness: .45 });
  cyl(.034, .028, .16, 8, brz, x, y - .08, z, g);                                           // socket sleeve round the top of the shaft
  const ring = add(new THREE.TorusGeometry(.034, .008, 4, 8), brz, x, y - .12, z, g); ring.rotation.x = Math.PI / 2;
  const bl = add(new THREE.LatheGeometry([[0, 0], [.02, .015], [.052, .09], [.062, .16], [.046, .26], [.02, .34], [0, .4]].map(([a, b]) => new THREE.Vector2(a, b)), 8), steel, x, y + .04, z, g); bl.scale.z = .22;  // leaf-shaped blade
  box(.012, .3, .03, mat('spearRib', '#8f979c', { metalness: .7, roughness: .35 }), x, y + .08, z, g);   // central ridge
}
function LCG(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
// A marble canvas: warm white with grey-blue veins and a few soft clouds.
function marbleCanvas(seed = 5) {
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const k = c.getContext('2d'), r = LCG(seed);
  const gr = k.createLinearGradient(0, 0, N, N); gr.addColorStop(0, '#efebe0'); gr.addColorStop(.5, '#e4dfd2'); gr.addColorStop(1, '#f1eee6'); k.fillStyle = gr; k.fillRect(0, 0, N, N);
  for (let i = 0; i < 30; i++) { const x = r() * N, y = r() * N, rad = 40 + r() * 90, g2 = k.createRadialGradient(x, y, 0, x, y, rad); g2.addColorStop(0, `rgba(170,165,150,${.08 + r() * .1})`); g2.addColorStop(1, 'rgba(170,165,150,0)'); k.fillStyle = g2; k.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let v = 0; v < 7; v++) { let x = r() * N, y = -10, ang = Math.PI / 2 + (r() - .5) * 1.2; const w0 = 1 + r() * 2.4, col = v % 3 === 0 ? '90,100,115' : '110,105,95';
    for (let br = 0; br < 2; br++) { k.beginPath(); k.moveTo(x, y); let px = x, py = y, a = ang + br * (r() - .5) * .8; for (let j = 0; j < 22; j++) { a += (r() - .5) * .7; px += Math.cos(a) * 26; py += Math.sin(a) * 26; k.lineTo(px, py); } k.strokeStyle = `rgba(${col},${.45 + r() * .3})`; k.lineWidth = w0 * (br ? .6 : 1); k.stroke(); } }
  for (let i = 0; i < 700; i++) { k.fillStyle = `rgba(255,255,255,${r() * .1})`; k.fillRect(r() * N, r() * N, 2 + r() * 4, 1 + r() * 2); }
  return c;
}
// An open wooden pail (scale s) with staves, iron hoops, a bail and, if water is true, a pool of water below the rim.
function PAIL(g, x, y, z, s = 1, water = true) {
  const wood = mat('pailWood', '#9a6236', { side: THREE.DoubleSide, map: mat('wood', '#9a6236').map }), fe = mat('pailIron', '#3c3a38', { metalness: .5, roughness: .55 });
  add(new THREE.LatheGeometry([[0, 0], [.19, 0], [.25, .42], [.236, .42], [.18, .03], [0, .03]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 16), wood, x, y, z, g);
  { const t = add(new THREE.TorusGeometry(.243 * s, .012 * s, 4, 16), wood, x, y + .42 * s, z, g); t.rotation.x = Math.PI / 2; }
  for (const h of [.1, .3]) { const t = add(new THREE.TorusGeometry((.19 + .06 * h / .42 + .006) * s, .013 * s, 4, 16), fe, x, y + h * s, z, g); t.rotation.x = Math.PI / 2; }
  if (water) { cyl(.222 * s, .222 * s, .015 * s, 16, mat('pailWater', '#58b0b8', { roughness: .08, metalness: .15 }), x, y + .325 * s, z, g); const r = add(new THREE.TorusGeometry(.12 * s, .006 * s, 3, 16), mat('pailRipple', '#a8dde0'), x, y + .34 * s, z, g); r.rotation.x = Math.PI / 2; }
  add(new THREE.TorusGeometry(.245 * s, .012 * s, 4, 14, Math.PI), fe, x, y + .42 * s, z, g);
  return y + .66 * s;
}

const gateGuardModel = (g, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = Math.PI * .15; g.add(G);
    const skin = mat('skin0', '#c08a62'), red = mat('clothGuardRed', '#9a2a2a', { side: THREE.DoubleSide }), cape = mat('clothGuardCape', '#6a1a1a', { side: THREE.DoubleSide }), bz = mat('guardBronze', '#b98a3a', { metalness: .5, roughness: .4 }), leather = mat('leatherDk', '#4a2a1a'), gold = mat('guardGold', '#d8b04a', { metalness: .5, roughness: .35, side: THREE.DoubleSide });
    for (const s of [-1, 1]) { LIMB(G, [s * .1, .04, 0], [s * .1, .55, 0], .055, skin); cyl(.062, .052, .3, 8, bz, s * .1, .1, 0, G); box(.1, .04, .2, leather, s * .1, 0, .04, G); }   // legs, bronze greaves, sandals
    cyl(.2, .27, .36, 10, red, 0, .48, 0, G);                                                                            // tunic skirt
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, st = box(.07, .2, .02, leather, Math.cos(a) * .25, .5, Math.sin(a) * .25, G); st.rotation.y = -a + Math.PI / 2; }   // leather strips hanging from the belt
    cyl(.205, .2, .52, 10, bz, 0, .84, 0, G);                                                                            // breastplate
    for (const h of [.93, 1.05, 1.17]) { const t = add(new THREE.TorusGeometry(.215, .018, 4, 12), mat('guardBand', '#8a6a2a', { metalness: .5, roughness: .45 }), 0, h, 0, G); t.rotation.x = Math.PI / 2; }   // overlapping bands
    { const t = add(new THREE.TorusGeometry(.212, .03, 4, 12), leather, 0, .84, 0, G); t.rotation.x = Math.PI / 2; }     // belt
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(.085, 8, 6), bz, s * .25, 1.3, 0, G);                         // shoulder plates
    cyl(.05, .055, .12, 6, skin, 0, 1.33, 0, G);
    const hd = add(new THREE.IcosahedronGeometry(.115, 1), skin, 0, 1.47, .01, G); hd.scale.y = 1.08;                    // head
    add(new THREE.ConeGeometry(.02, .05, 4), skin, 0, 1.45, .12, G).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(.013, 5, 4), mat('eyeDk', '#1a0e08'), s * .045, 1.49, .105, G);
    add(new THREE.SphereGeometry(.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), bz, 0, 1.49, -.005, G);                  // helmet
    { const t = add(new THREE.TorusGeometry(.148, .014, 4, 14), bz, 0, 1.495, -.005, G); t.rotation.x = Math.PI / 2; }
    for (const s of [-1, 1]) box(.03, .13, .11, bz, s * .125, 1.36, .0, G);                                               // cheek guards
    box(.04, .1, .34, mat('guardPlume', '#b8302a'), 0, 1.6, -.01, G); box(.05, .035, .36, bz, 0, 1.58, -.01, G);          // crest
    add(new THREE.CylinderGeometry(.22, .3, .8, 10, 1, true, Math.PI * .6, Math.PI * .8), cape, 0, .55, -.02, G).position.y = .95;   // cloak down the back
    LIMB(G, [.26, 1.3, 0], [.35, 1.1, .08], .045, red); LIMB(G, [.35, 1.1, .08], [.34, 1.0, .2], .04, skin); add(new THREE.IcosahedronGeometry(.055, 0), skin, .34, 1.0, .2, G);        // right arm round the spear
    LIMB(G, [-.26, 1.3, 0], [-.3, 1.08, .1], .045, red); LIMB(G, [-.3, 1.08, .1], [-.34, 1.0, .06], .04, skin);                                                                  // left arm behind the shield
    const sp = new THREE.Group(); sp.position.set(.34, 0, .2); sp.rotation.z = -.03; G.add(sp);                              // the spear: shaft and head share one group
    cyl(.022, .026, 2.2, 7, 'woodLt', 0, 0, 0, sp); SPEARHEAD(sp, 0, 2.2, 0); cyl(.03, .026, .08, 7, bz, 0, 0, 0, sp);
    { const arc = (rad, h, ty, m) => add(new THREE.CylinderGeometry(rad, rad, h, 14, 1, true, -.62, 1.24), m, -.38, ty, -.33, G);   // the shield is a slice of a cylinder, curved round the body
      arc(.55, .95, 1.0, mat('clothShield', '#9a2a2a', { side: THREE.DoubleSide })); arc(.557, .07, .56, gold); arc(.557, .07, 1.44, gold);
      const bs = add(new THREE.SphereGeometry(.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), gold, -.38, 1.0, .22, G); bs.rotation.x = Math.PI / 2;     // boss
      for (const s of [-1, 1]) { const w = box(.02, .3, .01, gold, -.38 + s * .12, .86, .224, G); w.rotation.z = s * .5; } }                          // painted wings either side
    return y + 1.7; };
const waterCarrierModel = (g, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = .5; g.add(G);
    const skin = mat('skin1', '#a8714c'), dress = mat('clothDressW', '#c9a46a', { side: THREE.DoubleSide }), veil = mat('clothVeilW', '#efe4cc', { side: THREE.DoubleSide }), sash = mat('clothSashW', '#8a3a2a'), eye = mat('eyeDk', '#1a0e08');
    for (const s of [-1, 1]) box(.09, .04, .16, skin, s * .09, 0, .07, G);
    add(new THREE.LatheGeometry([[.3, 0], [.29, .1], [.25, .4], [.2, .7], [.16, .93], [.18, 1.05], [.25, 1.17], [.23, 1.25], [.11, 1.3], [.05, 1.33]].map(([a, b]) => new THREE.Vector2(a, b)), 14), dress, 0, 0, 0, G);   // long dress
    { const t = add(new THREE.TorusGeometry(.19, .026, 4, 14), sash, 0, .86, 0, G); t.rotation.x = Math.PI / 2; box(.05, .3, .03, sash, .06, .56, .19, G); }    // sash and its hanging end
    cyl(.045, .05, .12, 6, skin, 0, 1.28, 0, G);
    const hd = add(new THREE.IcosahedronGeometry(.145, 1), skin, 0, 1.47, 0, G); hd.scale.y = 1.08;
    add(new THREE.ConeGeometry(.025, .06, 4), skin, 0, 1.45, .14, G).rotation.x = Math.PI / 2; for (const s of [-1, 1]) add(new THREE.SphereGeometry(.012, 5, 4), eye, s * .055, 1.5, .125, G);
    add(new THREE.SphereGeometry(.175, 10, 7, 0, Math.PI * 2, 0, Math.PI * .6), veil, 0, 1.52, -.06, G);                          // veil over the hair
    add(new THREE.CylinderGeometry(.16, .22, .3, 10, 1, true, Math.PI * .6, Math.PI * .8), veil, 0, 1.42, -.03, G);             // and down over the shoulders at the back
    { const t = add(new THREE.TorusGeometry(.085, .035, 5, 12), mat('clothPad', '#b8503a'), 0, 1.66, 0, G); t.rotation.x = Math.PI / 2; }   // the folded cloth pad
    for (const s of [-1, 1]) { LIMB(G, [s * .23, 1.2, 0], [s * .34, 1.45, .02], .04, dress); LIMB(G, [s * .34, 1.45, .02], [s * .16, 1.76, 0], .033, skin); add(new THREE.IcosahedronGeometry(.045, 0), skin, s * .155, 1.77, 0, G); }   // arms up to the jar
    const j = new THREE.Group(); j.position.set(0, 1.68, 0); j.rotation.z = .04; G.add(j); amph(j, 0, 0, .5);
    return y + 2.3; };
const spearRack_ = (g, x, y, z) => { const L = 2.3, lean = .12;
    for (const sx of [-.58, .58]) { box(.09, 1.45, .09, 'wood', x + sx, y, z, g); box(.2, .05, .22, 'wood', x + sx, y, z, g); }
    for (const [h, off] of [[1.3, 1.3 * Math.tan(lean)], [.5, .5 * Math.tan(lean)]]) for (const s of [-1, 1]) box(1.3, .07, .05, 'wood', x, y + h - .035, z - .16 + off + s * .05, g);   // front and back rails at two heights
    for (let k = 0; k < 5; k++) { const sg = new THREE.Group(); sg.position.set(x - .44 + k * .22, y, z - .16); sg.rotation.x = lean + (k % 2) * .012; sg.rotation.z = (k - 2) * .012; g.add(sg);
      cyl(.022, .026, L, 7, 'woodLt', 0, 0, 0, sg); SPEARHEAD(sg, 0, L, 0); cyl(.03, .028, .05, 7, mat('spearSocket', '#8a6a2a', { metalness: .5, roughness: .45 }), 0, 0, 0, sg); }
    return y + 2.75; };
const waterPail_ = (g, x, y, z) => PAIL(g, x, y, z, 1, true);
const stoneBench_ = (g, x, y, z) => { const t = new THREE.CanvasTexture(marbleCanvas(5)); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    const m = mat('marbleBench', '#ffffff', { map: t, roughness: .28, metalness: .05, flatShading: false }), dk = mat('marbleBenchDk', '#cfc9bb', { map: t, roughness: .3, metalness: .05, flatShading: false });
    box(2.5, .13, .84, m, x, y + .47, z, g); box(2.3, .05, .66, dk, x, y + .42, z, g);                                       // seat slab and its lower step
    for (const s of [-1, 1]) { const e = add(new THREE.CylinderGeometry(.065, .065, 2.5, 10), m, x, y + .535, z + s * .42, g); e.rotation.z = Math.PI / 2; }   // rounded front and back edges
    for (const s of [-1, 1]) { const ex = x + s * 1.0;
      box(.38, .07, .86, dk, ex, y, z, g); box(.26, .3, .7, m, ex, y + .07, z, g);                                              // plinth and the end slab
      for (const f of [-1, 1]) { const v = add(new THREE.CylinderGeometry(.115, .115, .06, 14), m, ex, y + .4, z + f * .36, g); v.rotation.x = Math.PI / 2; const r = add(new THREE.TorusGeometry(.115, .02, 4, 14), dk, ex, y + .4, z + f * .39, g); }   // scroll on each face
      for (const f of [-1, 1]) { const r = add(new THREE.TorusGeometry(.09, .018, 4, 12), dk, ex + s * .131, y + .24, z + f * .12, g); r.rotation.y = Math.PI / 2; } }                                                            // carved rings on the outer faces
    return y + .6; };
const stoneWell_ = (g, x, y, z) => { const H = 1.1;
    add(new THREE.LatheGeometry([[.9, -.05], [1.62, -.05], [1.55, .2], [.9, .2]].map(([a, b]) => new THREE.Vector2(a, b)), 24), mat('stoneDk', '#8d8676', { side: THREE.DoubleSide }), x, y, z, g);     // stone apron round the base, open in the middle
    for (let c = 0; c < 2; c++) for (let i = 0; i < 14; i++) { const a = (i + c * .5) / 14 * Math.PI * 2, b = box(.54, H / 2, .44, (i + c) % 2 ? 'stone' : 'stoneDk', x + Math.cos(a) * 1.1, y + c * H / 2, z + Math.sin(a) * 1.1, g); b.rotation.y = -a; }
    add(new THREE.LatheGeometry([[.86, H], [1.36, H], [1.36, H + .07], [.86, H + .07]].map(([a, b]) => new THREE.Vector2(a, b)), 28), mat('rimM', '#e8e2d6', { side: THREE.DoubleSide }), x, y, z, g);   // marble coping
    const shaft = add(new THREE.CylinderGeometry(.88, .88, H + .1, 24, 1, true), mat('wellWall', '#4a4238', { side: THREE.BackSide }), x, y + (H + .1) / 2 - .05, z, g); shaft.castShadow = false;
    cyl(.88, .88, .02, 24, mat('wellWater2', '#2f7f88', { roughness: .05, metalness: .3, emissive: '#0c3036' }), x, y + .5, z, g);   // the water, close enough to the top to be seen
    for (const r of [.3, .55, .78]) { const t = add(new THREE.TorusGeometry(r, .008, 3, 28), mat('wellRipple', '#8fd0d4', { roughness: .2 }), x, y + .522, z, g); t.rotation.x = Math.PI / 2; }
    for (const s of [-1, 1]) { box(.12, 1.25, .12, 'wood', x + s * 1.1, y + H + .07, z, g); }                                // posts stand on the coping
    box(2.5, .12, .14, 'wood', x, y + 2.3, z, g); const ax = add(new THREE.CylinderGeometry(.09, .09, 2.5, 10), 'wood', x, y + 1.9, z, g); ax.rotation.z = Math.PI / 2;   // top beam and the roller
    box(.07, .5, .07, 'wood', x + 1.35, y + 1.4, z + .1, g); box(.07, .07, .3, 'wood', x + 1.35, y + 1.4, z + .22, g);        // crank
    ueWellBucket(g, x, y, z, y + 1.9, y + 1.02);                                                                              // twisted rope from the roller to the bail of a bucket hanging in the shaft (objects/up-e.js)
    return y + 2.4; };
