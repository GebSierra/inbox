// ---------- ZONE 4: bridge & road out (Colossians 4) ----------
const BZ = 2, BX = RIVER_X(BZ);
{
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
  // road east
  drape(BX + 16, BZ - 2, BX + 70, BZ + 2, 'path');
  for (let x = BX + 17; x < BX + 70; x += 1.1) for (const s of [-1, 1]) { const m = box(R(.6, 1), .25, .5, 'stoneDk', x, heightAt(x, BZ + s * 2.3) - .05, BZ + s * 2.3); m.rotation.y = R(-.2, .2); }
  // waystation
  const wx = BX + 42, wz = BZ - 9; const ws = house(wx, wz, 9, 6, 1, 0);
  for (let i = -1; i <= 1; i++) cyl(.2, .25, 2.6, 6, 'wood', wx + i * 3, heightAt(wx, wz), wz + 4.5);
  box(9, .2, 2.4, 'roofDk', wx, heightAt(wx, wz) + 2.6, wz + 4);
  // cart & milestone
  box(2.4, .5, 1.4, 'woodLt', wx + 7, heightAt(wx + 7, wz) + .6, wz + 4); for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(.6, .6, .15, 10), 'wood', wx + 7, heightAt(wx + 7, wz) + .6, wz + 4 + s * .8); w.rotation.x = Math.PI / 2; }
}
defAnchor('bridge', [BX, BZ]);   // the book places the four river rooms relative to this
buildRooms(4);   // Fishermen’s Landing, Washing Place, Milestone, Waystation Porch

if (MODELS.stall) { for (const [x, z, r] of [[-9.6, 29.5, Math.PI], [9.8, 75, 0]]) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = r; scene.add(g); const c = MODELS.stall.clone(true); c.scale.setScalar(.9); g.add(c); } }
