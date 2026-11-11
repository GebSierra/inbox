// ---------- ZONE 4: bridge & road out (Colossians 4) ----------
const BZ = 2, BX = RIVER_X(BZ);
{
  stoneArchBridge(BX, BZ);
  // road east
  drape(BX + 16, BZ - 2, BX + 70, BZ + 2, 'path');
  for (let x = BX + 17; x < BX + 70; x += 1.1) for (const s of [-1, 1]) { const m = box(R(.6, 1), .25, .5, 'stoneDk', x, heightAt(x, BZ + s * 2.3) - .05, BZ + s * 2.3); m.rotation.y = R(-.2, .2); }
  // waystation
  const wx = BX + 42, wz = BZ - 9; waystationPorch(wx, wz);
  // cart & milestone
  handCart(scene, wx + 7, heightAt(wx + 7, wz), wz + 4);
}
defAnchor('bridge', [BX, BZ]);   // the book places the four river rooms relative to this
buildRooms(4);   // Fishermen’s Landing, Washing Place, Milestone, Waystation Porch

if (MODELS.stall) { for (const [x, z, r] of [[-9.6, 29.5, Math.PI], [9.8, 75, 0]]) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = r; scene.add(g); const c = MODELS.stall.clone(true); c.scale.setScalar(.9); g.add(c); } }
