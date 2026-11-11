// ---------- OBJECT LIBRARY: helpers for the pieces that the towns build straight into the scene ----------
// Most of the town's furniture of the world (people, trees, stalls, houses, the well, the gate...) is built by engine functions that
// put their pieces into `scene` at world coordinates: person(x, z, ...), tree(x, z), stall(x, z, ...). The library entries
// wrap those functions (and copies of the town code that has no function of its own) so that each one is a standalone builder
//   (g, x, y, z) => topY
// like every other registry entry. viaScene() is the glue: it runs a builder with the town origin at (0, 0), collects whatever the
// builder added to `scene` into a group at (x, y, z) inside g, and returns the height of that group's top.
// The wrappers only run on the library page (and in books that name them); they draw random numbers in the same order as the
// town code, but nothing here runs when a town loads, so the towns are not affected.
function viaScene(g, x, y, z, make) {
  const sub = new THREE.Group(); sub.position.set(x, y, z); g.add(sub);
  const n0 = scene.children.length;
  try { make(sub); }
  finally { for (const o of scene.children.slice(n0)) sub.add(o); }
  g.updateWorldMatrix(true, false); sub.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(sub);
  return b.isEmpty() ? y : b.max.y - g.getWorldPosition(new THREE.Vector3()).y;
}
