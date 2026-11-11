// ---------- OBJECT LIBRARY: structures shared by the towns, and James's agora and harbour ----------
// kind "structure": houses (the Medieval Village MegaKit ones that both towns use, and James's flat-roofed ones), columns and walls, ships and the lighthouse,
// and the agora buildings of James 1 (james-shared.js builders, which james-ltm/world/agora.js calls too). The houses and ships call the town's own code
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

  // ---- James 1: the agora (james-shared.js: the town's own builders, called here at the origin) ----
  T(via(() => agoraStoa(-6, 0, 6, 0, { face: 1, cols: 5 })), 'colonnade-stoa', 'Colonnade (stoa): columns, back wall and roof', 'james 1.4', 'structure', ['stoa', 'columns', 'marble']);
  T(via(() => towerOfTheWinds(0, 0)), 'tower-of-the-winds', 'Octagonal Tower of the Winds with a sundial', 'james 1.2', 'structure', ['tower', 'marble', 'sundial']);
  T(via(() => tholos(0, 0)), 'tholos', 'Tholos: a round building with a ring of columns and a dome', 'james 1.3', 'structure', ['round', 'columns', 'dome']);
  T(via(() => exedra(0, 0)), 'exedra', 'Half-round bench (exedra) with low walls', 'james 1.5', 'structure', ['bench', 'wall']);
  T(via(() => almshousePortico(0, 0)), 'almshouse-portico', 'Almshouse portico: four columns, a pediment and a door', 'james 1.6', 'structure', ['columns', 'house']);
  T(via(() => gateStoaPorch(0)), 'gate-stoa-porch', 'Long columned porch (the Gate Stoa)', 'james 1.1', 'structure', ['stoa', 'columns', 'marble']);
  T(via(() => agoraAltar(0)), 'agora-altar', 'Small marble altar with four posts', 'james kit', 'structure', ['altar', 'marble']);
}
