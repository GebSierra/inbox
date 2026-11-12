// ---------- ZONE 2: temple courtyard (Colossians 2) ----------
const TZ = 2;
{
  // courtyard paving & walls
  box(34, .25, 30, 'path', 0, heightAt(0, TZ) - .1, TZ);
  stoneWall(-17, TZ + 15, -4, TZ + 15, 1.3); stoneWall(4, TZ + 15, 17, TZ + 15, 1.3);
  for (const [x0, x1] of [[-17, -4], [4, 17]]) box(x1 - x0 + .4, .2, 1.1, 'marble', (x0 + x1) / 2, heightAt(0, TZ + 15) + 1.35, TZ + 15);
  for (const s2 of [-1, 1]) { box(1.2, 2.6, 1.2, 'marble', s2 * 4, heightAt(0, TZ + 15), TZ + 15); box(1.4, .3, 1.4, 'wallTrim', s2 * 4, heightAt(0, TZ + 15) + 2.6, TZ + 15); }
  stoneWall(-17, TZ + 15, -17, TZ - 15, 2.2); stoneWall(17, TZ + 15, 17, TZ - 15, 2.2); stoneWall(-17, TZ - 15, 17, TZ - 15, 2.2);
  // temple
  marbleTemple(TZ);
  // altar, statues
  for (const s of [-1, 1]) { const x = s * 10, z = TZ + 5, y = heightAt(x, z);
    box(1.5, .3, 1.5, 'marble', x, y, z); box(1.2, 1.4, 1.2, 'stone', x, y + .3, z); box(1.5, .25, 1.5, 'marble', x, y + 1.7, z);
    if (s < 0) { const pt = P.plaque(); const pq = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .38), new THREE.MeshStandardMaterial({ map: pt, roughness: .8 })); { const a = Math.atan2(0 - x, TZ + 9.5 - z); pq.position.set(x + Math.sin(a) * .72, y + .95, z + Math.cos(a) * .72); pq.rotation.y = a; } pq.userData.dyn = 1; scene.add(pq); }
    { const st = makeStatue(THREE, { pose: s < 0 ? 'philosopher' : 'festival', height: 2.3 }); st.position.set(x, y + 1.95, z); st.rotation.y = s > 0 ? -.5 : .5; st.traverse(o => { if (o.isMesh) o.userData.dyn = 1; }); st.userData.mergeInside = 1; scene.add(st); } }
  for (const s of [-1, 1]) cypress(s * 14, TZ - 11, 1);
  for (const s of [-1, 1]) for (const zz of [TZ - 2]) { const x = s * 14.5; cyl(.7, .6, .7, 8, 'clay', x, heightAt(x, zz), zz); add(new THREE.IcosahedronGeometry(.8, 0), 'leaf', x, heightAt(x, zz) + 1.3, zz); }
  window.__fire = [];
  altarWithFire(scene, 0, heightAt(0, TZ + 7), TZ + 7);
}
{ const hub = [0, TZ + 9.5];
  // courtyard clutter: benches against the walls, planters, a votive table, offerings
  for (const sx of [-1, 1]) { const bx = sx * 16.2; for (const bz of [TZ + 1, TZ + 7]) { box(.7, .45, 3, 'marble', bx, heightAt(bx, bz), bz); box(.8, .12, 3.2, 'marble', bx, heightAt(bx, bz) + .45, bz); } }
  for (const [px, pz] of [[-15.5, TZ - 8], [15.5, TZ - 8]]) { cyl(.55, .45, .6, 10, 'clay', px, heightAt(px, pz), pz); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(R(.3, .45), 0), k % 2 ? 'leaf' : 'leafDk', px + R(-.25, .25), heightAt(px, pz) + .8 + R(0, .3), pz + R(-.25, .25)); }
  booth(-11.5, TZ + 11, hub, '#efe4cc');
  { const keyTex = noRep(canvasTex(256, (x, w) => { x.fillStyle = '#e6d6b0'; x.fillRect(0, 0, w, w); x.strokeStyle = '#a8864a'; x.lineWidth = 5; x.strokeRect(10, 10, w - 20, w - 20); x.strokeRect(34, 34, w - 68, w - 68);
    x.lineWidth = 3; for (let i = 14; i < w - 14; i += 16) { x.beginPath(); x.moveTo(i, 16); x.lineTo(i, 28); x.lineTo(i + 10, 28); x.lineTo(i + 10, 20); x.lineTo(i + 5, 20); x.stroke(); x.beginPath(); x.moveTo(i, w - 16); x.lineTo(i, w - 28); x.lineTo(i + 10, w - 28); x.lineTo(i + 10, w - 20); x.stroke(); } for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(80,60,30,${R(0, .08)})`; x.fillRect(R(0, w), R(0, w), 2, 2); } }));
  const rg = box(4.2, .04, 3.4, new THREE.MeshStandardMaterial({ map: keyTex, roughness: 1 }), -11.5, heightAt(-11.5, TZ + 11) + .19, TZ + 11); rg.rotation.y = Math.atan2(hub[0] + 11.5, hub[1] - TZ - 11); }
  defAnchor('temple', [0, TZ]);   // the book places the five temple rooms relative to this
  buildRooms(2, 1, 4);   // Dove Sellers, Philosopher, Altar, Festival Statue (their camera tweaks are in the book)
  booth(11.5, TZ + 11, hub, '#7a2a20');
  buildRooms(2, 5, 5);   // The Locked Chest
}
// path market -> temple
drape(-2.5, TZ + 14, 2.5, 24, 'path');

