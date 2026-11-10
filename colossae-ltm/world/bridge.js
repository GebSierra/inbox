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
room(4, 1, 'Fishermen’s Landing', BX - 4.6, BZ + 8.5, [BX - 8.2, BZ + 4.2], { minY: -.7, dais: 'planks', spread: [1.7, 1.4], props: [[(g, x, y, z) => { const b = new THREE.Group(); b.position.set(x - .3, y - .35, z); b.scale.setScalar(.7); b.rotation.y = .4; g.add(b); return y - .35 + P.boat(b, 0, 0, 0) * .7; }, 'fishing boat'], [(g, x, y, z) => (placePart(g, 'stall', ['Jemuran_low003', 'Fish_low002', 'Fish_low004', 'Fish_low014'], x, y, z, .6, Math.PI / 2), box(.5, .5, .5, mat('fishCrate', '#8a6040', { map: TEX.wood }), x, y, z, g), y + .55) ?? P.net(g, x, y, z), 'fish drying rack'], [(g, x, y, z) => placePart(g, 'stall', 'Cylinder114', x, y, z, .8) ?? P.bucket(g, x, y, z), 'wicker basket'], [P.fish, 'basket of fish'], [(g, x, y, z) => placePart(g, 'stall', 'Crate_low153', x, y, z, 1.1) ?? P.crates(g, x, y, z), 'wooden crate']] });
room(4, 2, 'Washing Place', BX + 11.5, BZ + 8.5, [BX + 15, BZ + 3.6], { minY: -.7, dais: 'planks', spread: [1.5, 1.3], props: [[P.washtub, 'washtub'], [P.rack, 'drying laundry'], [P.saltJar, 'jar of salt'], [P.sack, 'sack of grain'], [(g, x, y, z) => { const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = Math.PI / 2; g.add(d); return P.donkey(d, 0, 0, 0); }, 'donkey']] });
room(4, 3, 'The Milestone', BX + 30, BZ + 8.2, [BX + 30, BZ + 2.4], { dais: 'stones', props: [[P.signpost, 'signpost'], [P.trough, 'water trough'], [P.wheelUp, 'cart wheel'], [(g, x, y, z) => { const b = box(.55, .5, .3, mat('leather', '#7a4a2a'), x, y, z, g); box(.57, .08, .32, mat('leatherDk', '#4a2a1a'), x, y + .3, z, g); const r = add(new THREE.CylinderGeometry(.13, .13, .6, 10), mat('blanketB', '#2f5f9a'), x, y + .63, z, g); r.rotation.z = Math.PI / 2; return y + .8; }, 'traveller’s pack'], [P.milestone, 'milestone']] });
room(4, 4, 'Waystation Porch', BX + 42, BZ - 3.2, [BX + 42, BZ + 1.4], { dais: 'planks', spread: [1.7, .9], big: 1.2, props: [[(g, x, y, z) => { cyl(.06, .1, .62, 6, 'wood', x, y, z, g); cyl(.5, .5, .06, 10, 'woodLt', x, y + .62, z, g); box(.42, .03, .3, mat('papyrus', '#e8d6a8'), x, y + .68, z, g); cyl(.05, .05, .015, 10, mat('seal', '#b8331f'), x, y + .71, z, g); return y + .75; }, 'sealed letter on a table'], [P.scrolls, 'scroll shelf'], [(g, x, y, z) => { cyl(.2, .24, .05, 12, bronze(), x, y, z, g); cyl(.04, .06, .25, 8, bronze(), x, y + .05, z, g); cyl(.12, .12, .05, 10, bronze(), x, y + .3, z, g); cyl(.07, .075, .45, 12, mat('beeswax', '#f0d080', { flatShading: false, roughness: .6 }), x, y + .35, z, g); flame(g, x, y + .82, z, 1.3); return y + 1.0; }, 'tall candle']] });

if (MODELS.stall) { for (const [x, z, r] of [[-9.6, 29.5, Math.PI], [9.8, 75, 0]]) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = r; scene.add(g); const c = MODELS.stall.clone(true); c.scale.setScalar(.9); g.add(c); } }
