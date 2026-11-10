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
  // altar, statues
  box(2.4, 1.2, 1.6, 'stone', 0, heightAt(0, TZ + 7), TZ + 7); box(2.7, .25, 1.9, 'marble', 0, heightAt(0, TZ + 7) + 1.2, TZ + 7);
  for (const s of [-1, 1]) { const x = s * 10, z = TZ + 5, y = heightAt(x, z);
    box(1.5, .3, 1.5, 'marble', x, y, z); box(1.2, 1.4, 1.2, 'stone', x, y + .3, z); box(1.5, .25, 1.5, 'marble', x, y + 1.7, z);
    if (s < 0) { const pt = P.plaque(); const pq = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .38), new THREE.MeshStandardMaterial({ map: pt, roughness: .8 })); { const a = Math.atan2(0 - x, TZ + 9.5 - z); pq.position.set(x + Math.sin(a) * .72, y + .95, z + Math.cos(a) * .72); pq.rotation.y = a; } pq.userData.dyn = 1; scene.add(pq); }
    { const st = makeStatue(THREE, { pose: s < 0 ? 'philosopher' : 'festival', height: 2.3 }); st.position.set(x, y + 1.95, z); st.rotation.y = s > 0 ? -.5 : .5; st.traverse(o => { if (o.isMesh) o.userData.dyn = 1; }); scene.add(st); } }
  for (const s of [-1, 1]) cypress(s * 14, TZ - 11, 1);
  for (const s of [-1, 1]) for (const zz of [TZ - 2]) { const x = s * 14.5; cyl(.7, .6, .7, 8, 'clay', x, heightAt(x, zz), zz); add(new THREE.IcosahedronGeometry(.8, 0), 'leaf', x, heightAt(x, zz) + 1.3, zz); }
  { const ay = heightAt(0, TZ + 7) + 1.45; window.__fire = [];
    { const ay2 = heightAt(0, TZ + 7); for (const sd of [-1, 1]) { const og = new THREE.Group(); og.position.set(sd * .75, ay2 + 1.45, TZ + 7.5); scene.add(og); P.offerings(og, 0, 0, 0); } box(2.75, .3, .08, mat('frieze', '#c9a24a', { metalness: .3 }), 0, ay2 + .75, TZ + 7.96); }
    { const fire = makeFire(THREE, { scale: .5 }); fire.position.set(0, ay - .05, TZ + 7); fire.traverse(o => o.userData.dyn = 1); scene.add(fire); FIRES.push(fire); }
  }
  for (const [ax, ay2] of [[0, 2.6], [-7, 0], [7, 0]]) add(new THREE.OctahedronGeometry(.45, 0), mat('acro', '#c79a3a', { metalness: .3 }), ax, heightAt(0, TZ - 6) + 8.4 + ay2, TZ - .65);
}
{ const hub = [0, TZ + 9.5], sT = heightAt(10, TZ + 5) + 4.75;
  // courtyard clutter: benches against the walls, planters, a votive table, offerings
  for (const sx of [-1, 1]) { const bx = sx * 16.2; for (const bz of [TZ + 1, TZ + 7]) { box(.7, .45, 3, 'marble', bx, heightAt(bx, bz), bz); box(.8, .12, 3.2, 'marble', bx, heightAt(bx, bz) + .45, bz); } }
  for (const [px, pz] of [[-15.5, TZ - 8], [15.5, TZ - 8]]) { cyl(.55, .45, .6, 10, 'clay', px, heightAt(px, pz), pz); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(R(.3, .45), 0), k % 2 ? 'leaf' : 'leafDk', px + R(-.25, .25), heightAt(px, pz) + .8 + R(0, .3), pz + R(-.25, .25)); }
  booth(-11.5, TZ + 11, hub, '#efe4cc');
  { const keyTex = noRep(canvasTex(256, (x, w) => { x.fillStyle = '#e6d6b0'; x.fillRect(0, 0, w, w); x.strokeStyle = '#a8864a'; x.lineWidth = 5; x.strokeRect(10, 10, w - 20, w - 20); x.strokeRect(34, 34, w - 68, w - 68);
    x.lineWidth = 3; for (let i = 14; i < w - 14; i += 16) { x.beginPath(); x.moveTo(i, 16); x.lineTo(i, 28); x.lineTo(i + 10, 28); x.lineTo(i + 10, 20); x.lineTo(i + 5, 20); x.stroke(); x.beginPath(); x.moveTo(i, w - 16); x.lineTo(i, w - 28); x.lineTo(i + 10, w - 28); x.lineTo(i + 10, w - 20); x.stroke(); } for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(80,60,30,${R(0, .08)})`; x.fillRect(R(0, w), R(0, w), 2, 2); } }));
  const rg = box(4.2, .04, 3.4, new THREE.MeshStandardMaterial({ map: keyTex, roughness: 1 }), -11.5, heightAt(-11.5, TZ + 11) + .19, TZ + 11); rg.rotation.y = Math.atan2(hub[0] + 11.5, hub[1] - TZ - 11); }
  room(2, 1, 'Dove Sellers', -11.5, TZ + 11, hub, { dais: 'none', spread: [1.25, .95], big: 1.25, props: [[P.dovesBig, 'dove cages with doves on top'], [P.birdPerch, 'doves on a perch'], [P.scale, 'money-changer’s scales'], [P.coinTable, 'table of coins'], [P.sack, 'sack of seed']] });
  room(2, 2, 'The Philosopher', -10, TZ + 5, hub, { dais: 'none', centre: { top: sT, what: 'statue of the philosopher' }, spread: [1.3, 1.05], big: 1.3, props: [[P.scrollRack, 'rack of scrolls'], [P.brazier, 'burning brazier'], [P.stoolTablets, 'wax tablets on a stool'], [P.basin, 'water basin'], [null]] });
  room(2, 3, 'The Altar', 0, TZ + 7, [0, TZ + 12.8], { dais: 'none', spread: [2.3, 1.5], centre: { top: heightAt(0, TZ + 7) + 2.4, what: 'altar fire' }, big: 1.2, props: [[P.brazier, 'left brazier'], [P.garland, 'garland of laurel'], [P.offerings, 'bowl of offerings'], [P.brazier, 'right brazier'], [null]] });
  room(2, 4, 'The Festival Statue', 10, TZ + 5, hub, { dais: 'none', spread: [1.3, 1.05], big: 1.3, centre: { top: sT, what: 'festival statue' }, props: [[(g, x, y, z) => P.basket(g, x, y, z, '#b07a3a', 8), 'basket of bread'], [P.garland, 'garland with ribbons'], [P.wreath, 'laurel wreath'], [P.wineJugs, 'wine jugs'], [null]] });
  for (const st of STATIONS) if (st.ch === 2 && (st.room === 2 || st.room === 4)) { st.back = 6.4; st.pitch = .0; }
  for (const st of STATIONS) if (st.ch === 2 && (st.room === 1 || st.room === 5)) { st.back = 5; st.pitch = -.2; }
  for (const st of STATIONS) if (st.ch === 2 && (st.room === 2 || st.room === 4) && st.banner) st.banner.position.y += 3.4;
  booth(11.5, TZ + 11, hub, '#7a2a20');
  room(2, 5, 'The Locked Chest', 11.5, TZ + 11, hub, { dais: 'none', spread: [1.45, 1.05], big: 1.15, props: [[P.honey, 'honey jar ("do not taste")'], [P.bolts, 'folded cloth ("do not handle")'], [P.padlockChest, 'chest with gold padlock ("do not touch")'], [P.bowlStack, 'stack of bowls'], [P.ropeBarrier, 'rope barrier']] });
  STATIONS[STATIONS.length - 1].back = 5; STATIONS[STATIONS.length - 1].pitch = -.2;
}
// path market -> temple
drape(-2.5, TZ + 14, 2.5, 24, 'path');

