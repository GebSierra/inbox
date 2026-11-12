// ---------- the Mount: a hilltop meadow above the lake (Matthew 5:1, "he went up on the mountain, and when he sat down…") ----------
// The path climbs from the lake (south) onto the hilltop and runs north up the middle.
// Rooms run clockwise: up the left side (east, +x) from the top of the path, then back down the right side (west, -x).
// At the head of the walk, on the crown of the hill, a rock outcrop: the place where he sat.
const GZ = -40, TZ = 26, HX = 0, HZ = 400;          // GZ: where you arrive (player starts at GZ + 16); TZ: the crown; HX/HZ unused (no houseRoom here)
const RAISED = [];
const WALKWAYS = [];
const CROWN = [0, 26];

// the crown of the hill: a low rock outcrop, olive trees, the crowd sitting on the grass
{
  const [cx, cz] = CROWN, y = heightAt(cx, cz);
  const rockM = mat('somRock', '#a39684');
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, r = R(1.2, 2.6), s = R(.7, 1.3);
    const m = add(new THREE.DodecahedronGeometry(s, 0), rockM, cx + Math.cos(a) * r, y + s * .35, cz + Math.sin(a) * r * .7); m.rotation.set(R(0, 3), R(0, 3), R(0, 3)); m.scale.y = .6; }
  const seat = add(new THREE.DodecahedronGeometry(1.4, 0), rockM, cx, y + .45, cz); seat.scale.set(1.3, .5, 1);
  // the disciples, sitting round him (5:1), and the crowds further down the slope
  const ROBES = ['#8a5a3a', '#3f6f9a', '#c9a46a', '#7a8a5a', '#a8714c', '#5a4a6a', '#d9c39a', '#9a5a3a'];
  for (let i = 0; i < 12; i++) { const a = Math.PI * (1.15 + i / 11 * .7), r = R(4.2, 5.2), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r * .8;
    person(x, z, Math.atan2(cx - x, cz - z), ROBES[i % ROBES.length], { y: heightAt(x, z), cloak: i % 3 ? undefined : '#5a3a2a', hair: i % 4 }); }
  for (let i = 0; i < 46; i++) { const x = R(-60, 60), z = R(-80, -26); if (Math.abs(x) < 6) continue;
    person(x, z, Math.atan2(-x, cz - z) + R(-.3, .3), ROBES[(rnd() * ROBES.length) | 0], { y: heightAt(x, z), veil: rnd() > .6 ? '#e8dcc4' : undefined }); }
}
// olive trees and scrub round the meadow, keeping the walk and the rooms clear
{
  const clear = (x, z) => (Math.abs(x) < 26 && z > -22 && z < 32) || (Math.abs(x) < 6 && z < 0);
  for (let i = 0; i < 260; i++) { const x = R(-150, 150), z = R(-90, 140); if (clear(x, z)) continue; const r = rnd(); if (r < .45) tree(x, z, R(.7, 1.1)); else if (r < .55) cypress(x, z, R(.8, 1.1)); else shrub(x, z, R(.9, 1.5)); }
  for (let i = 0; i < 16; i++) sheep(R(60, 110), R(30, 80));
  for (const [x, z] of [[-34, -60], [42, -50]]) stoneWall(x, z, x + 18, z, .7);
}
// fishing boats drawn up on the beach below
for (const [x, r] of [[-14, .3], [-8, -.2], [12, .1]]) { const z = SHORE + 2, b = new THREE.Group(); b.position.set(x, heightAt(x, z), z); b.rotation.y = r; scene.add(b);
  add(new THREE.CylinderGeometry(.9, .6, 5, 8, 1, true, 0, Math.PI), 'wood', 0, .9, 0, b).rotation.set(Math.PI / 2, 0, Math.PI); }

// ---------- chapter 5 (engine chapter 1): rooms from books/matthew.json ----------
buildRooms(1);
// walking routes: the path in from the lake, then between the rooms along the middle walk
VIA['1.1'] = [[0, GZ + 16], [0, -12]];
VIA['1.3'] = [[0, 12], [0, 18], [-2, 18]];
zoneLabel(5 - 0, 'The Hillside', 0, 4);
