// ---------- OBJECT LIBRARY: structures shared by the towns, and James's agora and harbour ----------
// kind "structure": houses (the Medieval Village MegaKit ones that both towns use, and James's flat-roofed ones), columns and walls, ships and the lighthouse,
// and the agora buildings of James 1 (copies of james-ltm/world/agora.js, set at the origin). The houses and ships call the town's own code
// (house(), townNE() in james-ltm/world/town-ne.js) so they cannot drift from it. Every builder is (g, x, y, z) => topY.
{
  const via = fn => (g, x, y, z) => viaScene(g, x, y, z, fn);
  const T = (fn, id, label, origin, kind, tags, args) => defObject(id, fn, { label, origin, tags, args, kind });

  // ---- houses (engine/props.js house(): the kit house, or the flat-roofed Near-Eastern one when a town sets HOOKS.house) ----
  T(via(() => { house(0, 0, 7, 6, 1, 0); }), 'plaster-house-one-storey', 'Plaster house, one storey, tiled roof', 'engine kit', 'structure', ['house', 'town', 'kit']);
  T(via(() => { house(0, 0, 8, 7, 2, 0); }), 'plaster-house-two-storey', 'Plaster house, two storeys, with shutters', 'engine kit', 'structure', ['house', 'town', 'kit']);
  T(via(() => { LIB_NE.neHouse(0, 0, 7, 6, 1, 0); }), 'mud-brick-house', 'Flat-roofed mud-brick house', 'james kit', 'structure', ['house', 'town', 'harbour']);
  T(via(() => { LIB_NE.neHouse(0, 0, 8, 7, 2, 0); }), 'mud-brick-house-two-storey', 'Flat-roofed house, two storeys', 'james kit', 'structure', ['house', 'town', 'harbour']);
  T(via(() => { LIB_NE.ship(0, 0, 0, 0); }), 'trading-ship', 'Trading ship with a square sail', 'james kit', 'structure', ['ship', 'harbour', 'sea']);
  T(via(() => { LIB_NE.lighthouse(0, 0); }), 'lighthouse', 'Lighthouse with a beacon fire', 'james kit', 'structure', ['harbour', 'light', 'tower']);

  // ---- columns and walls ----
  const column = (g, x, y, z, h = 4.2) => { cyl(.34, .38, .3, 10, 'marble', x, y, z, g); cyl(.26, .3, h - .6, 12, 'marble', x, y + .3, z, g); box(.7, .25, .7, 'marble', x, y + h - .3, z, g); return y + h; };
  T(column, 'marble-column', 'Marble column with base and capital', 'engine kit', 'structure', ['columns', 'marble', 'stoa']);
  T((g, x, y, z) => { box(14, .25, 2.4, 'marble', x, y, z, g); for (let i = 0; i < 5; i++) column(g, x - 6 + i * 3, y + .25, z, 4.2); box(14, .5, .9, 'marble', x, y + 4.7, z, g); box(14.4, .3, 2.6, 'wallTrim', x, y + 5.2, z, g); return y + 5.5; }, 'column-row', 'Row of five marble columns under a beam', 'engine kit', 'structure', ['columns', 'marble', 'stoa']);
  T(via(() => { stoneWall(-3, 0, 3, 0, 1.3); }), 'stone-wall-section', 'Section of dry stone wall', 'engine kit', 'structure', ['wall', 'stone']);
  const kitProp = (name, scale = 1) => (g, x, y, z) => { const o = kitPiece(name, g, x, y, z, 0); if (!o) return y; o.scale.setScalar(scale); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); return b.max.y - g.getWorldPosition(new THREE.Vector3()).y; };
  T(kitProp('Prop_Wagon'), 'wooden-wagon', 'Wooden wagon (MegaKit)', 'engine kit', 'structure', ['cart', 'travel', 'kit']);
  T(kitProp('Prop_Crate'), 'kit-crate', 'Wooden crate (MegaKit)', 'engine kit', 'object', ['container', 'kit']);
  T(kitProp('Prop_Chimney'), 'kit-chimney', 'Chimney stack (MegaKit)', 'engine kit', 'object', ['house', 'kit']);

  // ---- James 1: the agora (copies of james-ltm/world/agora.js, moved to the origin) ----
  // a colonnade (stoa): columns along one side, back wall, flat entablature and a roof
  function agoraStoa(xa, za, xb, zb, { depth = 4, h = 4.6, cols = 6, face = 1, wall = 'wall', col = 'marble', gap = null } = {}) {
    const L = Math.hypot(xb - xa, zb - za), ang = Math.atan2(zb - za, xb - xa), g = new THREE.Group();
    const cx = (xa + xb) / 2, cz = (za + zb) / 2; g.position.set(cx, heightAt(cx, cz), cz); g.rotation.y = -ang; scene.add(g);
    // local x runs along the stoa, local z points out towards the square (face = side of the square)
    const out = face, y = .05;
    box(L, .35, depth, 'marble', 0, y, out * 0, g).position.z = 0;
    box(L, h + .6, .5, wall, 0, y, -out * depth / 2, g);
    for (let i = 0; i < cols; i++) { const lx = -L / 2 + .6 + i * (L - 1.2) / (cols - 1); if (gap && lx > gap[0] && lx < gap[1]) continue;
      cyl(.34, .34, .3, 10, col, lx, y + .35, out * (depth / 2 - .4), g); cyl(.26, .3, h - .6, 12, col, lx, y + .65, out * (depth / 2 - .4), g); box(.7, .25, .7, col, lx, y + h + .05, out * (depth / 2 - .4), g); }
    box(L, .55, .9, 'marble', 0, y + h + .3, out * (depth / 2 - .4), g);
    box(L + .4, .3, depth + .9, mat('neRoof', '#d2b48a'), 0, y + h + .85, 0, g); box(L + .4, .45, .25, mat('neRoof', '#d2b48a'), 0, y + h + 1.15, out * (depth / 2 + .3), g);
    box(L, .3, depth, 'wallTrim', 0, y + h + .55, 0, g);
    return g; }
  T(via(() => agoraStoa(-6, 0, 6, 0, { face: 1, cols: 5 })), 'colonnade-stoa', 'Colonnade (stoa): columns, back wall and roof', 'james 1.4', 'structure', ['stoa', 'columns', 'marble', 'copy']);
  T((g, x, y, z) => viaScene(g, x + 18.2, y, z - 55, () => {
      const tx = -18.2, tz = 55, y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
      cyl(3.1, 3.2, .5, 8, 'marble', 0, 0, 0, g); const body = cyl(2.6, 2.6, 7.6, 8, mat('towerM', '#efe2c8'), 0, .5, 0, g); body.rotation.y = Math.PI / 8;
      const fr = cyl(2.72, 2.72, .9, 8, 'marble', 0, 7.1, 0, g); fr.rotation.y = Math.PI / 8;
      const rf = add(new THREE.ConeGeometry(2.9, 1.5, 8), 'stoneDk', 0, 8.75, 0, g); rf.rotation.y = Math.PI / 8; cyl(.12, .2, .5, 6, 'marble', 0, 9.4, 0, g);
      // sundial on the face towards the square
      { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#e8dcc4'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#6a5a48'; x.lineWidth = 3;
        for (let k = 0; k <= 8; k++) { const a = Math.PI * (k / 8); x.beginPath(); x.moveTo(64, 30); x.lineTo(64 - Math.cos(a) * 60, 30 + Math.sin(a) * 60); x.stroke(); } x.beginPath(); x.arc(64, 30, 58, 0, Math.PI); x.stroke();
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const d = add(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 2.45, 5.7, 0, g); d.rotation.y = Math.PI / 2; d.rotation.z = 0; }
      // wind gods in the frieze: little winged figures on every face
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, fx = Math.cos(a) * 2.75, fz = Math.sin(a) * 2.75; const w = box(.9, .5, .12, 'marble', fx, 7.3, fz, g); w.rotation.y = -a + Math.PI / 2; const bdy = box(.25, .55, .14, 'stoneDk', fx * 1.01, 7.2, fz * 1.01, g); bdy.rotation.y = -a + Math.PI / 2; }
      // doorway on the square side
      box(.12, 2.4, 1.3, 'dark', 2.42, .5, 1.1, g);
  }), 'tower-of-the-winds', 'Octagonal Tower of the Winds with a sundial', 'james 1.2', 'structure', ['tower', 'marble', 'sundial', 'copy']);
  T((g, x, y, z) => viaScene(g, x + 19.5, y, z - 42, () => {
      const tx = -19.5, tz = 42, y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
      cyl(5.3, 5.5, .6, 24, 'marble', 0, 0, 0, g); cyl(5.0, 5.0, .25, 24, 'marble', 0, .6, 0, g); cyl(3.4, 3.4, 4.2, 20, 'wall', 0, .85, 0, g);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; cyl(.24, .28, 4.1, 10, 'marble', Math.cos(a) * 4.5, .85, Math.sin(a) * 4.5, g); }
      cyl(4.85, 4.85, .55, 24, 'marble', 0, 4.95, 0, g); add(new THREE.SphereGeometry(4.7, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat('neDome', '#e2cba2'), 0, 5.5, 0, g); cyl(.35, .45, .8, 8, 'marble', 0, 10.1, 0, g);
      box(.15, 2.6, 1.5, 'dark', 3.38, .85, 0, g);
  }), 'tholos', 'Tholos: a round building with a ring of columns and a dome', 'james 1.3', 'structure', ['round', 'columns', 'dome', 'copy']);
  T((g, x, y, z) => viaScene(g, x - 17.5, y, z - 52, () => {
      const ex = 17.5, ez = 52, y = heightAt(ex, ez), g = new THREE.Group(); g.position.set(ex, y, ez); scene.add(g);
      for (let k = 0; k <= 12; k++) { const a = Math.PI / 2 + k / 12 * Math.PI; const bx = Math.cos(a) * -3.4, bz = Math.sin(a) * 3.4;
        const w = box(.95, 2.4, .5, 'wall', bx, 0, bz, g); w.rotation.y = -a; const s = box(.95, .5, .6, 'marble', bx * .85, 0, bz * .85, g); s.rotation.y = -a; }
      box(.4, 2.6, .4, 'marble', 0, 0, -3.6, g); box(.4, 2.6, .4, 'marble', 0, 0, 3.6, g);
  }), 'exedra', 'Half-round bench (exedra) with low walls', 'james 1.5', 'structure', ['bench', 'wall', 'copy']);
  T((g, x, y, z) => viaScene(g, x - 18, y, z - 61.5, () => {
      const px = 18, pz = 61.5, y = heightAt(px, pz), g = new THREE.Group(); g.position.set(px, y, pz); scene.add(g);
      box(6, 5.6, 9, 'wall', 1.6, 0, 0, g); box(6.4, .5, 9.4, mat('neRoof', '#d2b48a'), 1.6, 5.6, 0, g); box(2.6, .3, 9, 'marble', -2.6, 0, 0, g);
      for (const zz of [-3.6, -1.2, 1.2, 3.6]) { cyl(.24, .28, 3.6, 10, 'marble', -3.4, .3, zz, g); }
      box(1.6, .45, 9.4, 'marble', -3.1, 3.9, 0, g); box(3.4, .3, 9.8, mat('neRoof', '#d2b48a'), -2.4, 4.3, 0, g);
      box(.15, 2.4, 1.4, 'dark', -1.4, .3, 0, g);
  }), 'almshouse-portico', 'Almshouse portico: four columns, a pediment and a door', 'james 1.6', 'structure', ['columns', 'house', 'copy']);
  T((g, x, y, z) => viaScene(g, x, y, z - 64.5, () => { const z = 64.5, y = 0;
      box(27, .25, 2.4, 'marble', 0, y, z);
      for (const x of [-12, -9, -6, -3, 3, 6, 9, 12]) { cyl(.32, .32, .3, 10, 'marble', x, y + .25, z); cyl(.24, .28, 4.2, 12, 'marble', x, y + .55, z); box(.6, .22, .6, 'marble', x, y + 4.75, z); }
      box(27, .5, .9, 'marble', 0, y + 4.95, z); box(27.4, .3, 2.6, mat('neRoof', '#d2b48a'), 0, y + 5.45, z);
  }), 'gate-stoa-porch', 'Long columned porch (the Gate Stoa)', 'james 1.1', 'structure', ['stoa', 'columns', 'marble', 'copy']);
  T((g, x, y, z) => viaScene(g, x, y, z - 55, () => {
      const y = heightAt(0, 55); box(1.6, .5, 1.6, 'stone', 0, y, 55); box(1.2, .9, 1.2, 'marble', 0, y + .5, 55); box(1.4, .15, 1.4, 'marble', 0, y + 1.4, 55);
      for (const [x, z] of [[-1.6, 61], [1.6, 61], [-1.6, 49], [1.6, 49]]) { cyl(.2, .25, .5, 8, 'marble', x, heightAt(x, z), z); }
  }), 'agora-altar', 'Small marble altar with four posts', 'james kit', 'structure', ['altar', 'marble', 'copy']);
}
