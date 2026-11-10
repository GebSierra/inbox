// ---------- ZONE 1: gate + market street (Colossians 1, six stalls) ----------
const GZ = 78;
{ // city wall + gate
  const tower = (x) => { const g = new THREE.Group(); g.position.set(x, heightAt(x, GZ), GZ); scene.add(g);
    box(6, 10, 6, 'stone', 0, 0, 0, g);
    for (let i = -1; i <= 1; i++) for (const [a, b] of [[i * 2, 2.6], [i * 2, -2.6], [2.6, i * 2], [-2.6, i * 2]]) box(1, 1, 1, 'stoneDk', a, 10, b, g);
    box(.9, 1.6, .2, 'dark', 0, 6, 3.02, g); };
  tower(-6.5); tower(6.5);
  box(7, 3, 6, 'stone', 0, 6.5, GZ); for (let i = -2; i <= 2; i++) box(.9, .9, .9, 'stoneDk', i * 1.5, 9.5, GZ + 2.5);
  { const gy0 = heightAt(0, GZ), sh = new THREE.Shape(); sh.moveTo(-3.5, 0); sh.lineTo(3.5, 0); sh.lineTo(3.5, 6.6); sh.lineTo(-3.5, 6.6); sh.lineTo(-3.5, 0);
    const hole = new THREE.Path(); hole.moveTo(-3.3, 0); hole.lineTo(-3.3, 3.2); hole.absarc(0, 3.2, 3.3, Math.PI, 0, true); hole.lineTo(3.3, 0); hole.lineTo(-3.3, 0); sh.holes.push(hole);
    const vg = new THREE.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false, curveSegments: 14 }); vg.translate(0, 0, -3); add(vg, 'stone', 0, gy0, GZ);
    for (const zz of [GZ + 3.02, GZ - 3.02]) { for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; const v = box(.55, .75, .2, 'stoneDk', Math.cos(a) * 3.55, gy0 + 3.2 + Math.sin(a) * 3.55 - .37, zz); v.rotation.z = a - Math.PI / 2; } }
    box(.9, .7, .25, 'marble', 0, gy0 + 6.75, GZ + 3.05); }
  stoneWall(-9.5, GZ, -70, GZ - 10, 4); stoneWall(-70, GZ - 10, -70, -40, 4); stoneWall(-70, -40, 46, -40, 4);
  stoneWall(9.5, GZ, 46, GZ - 10, 4); stoneWall(46, GZ - 10, 46, 8, 4); stoneWall(46, -4, 46, -40, 4);
}
const tex1 = stripeTex('#c1553b', '#efe2c4', 8), tex2 = stripeTex('#3f6f9a', '#efe7d4', 8), tex3 = stripeTex('#d9a640', '#c1553b', 6);
// road / cobbles
drape(-4, -2, 4, GZ + 6, 'path');
for (let z = GZ + 6; z > -2 && false; z -= 1.6) for (let x = -3; x <= 3; x += 1.6) {
  if (rnd() < .18) continue;
  const m = add(new THREE.CylinderGeometry(R(.5, .65), R(.55, .7), .06, 6), 'cobble', x + R(-.3, .3), heightAt(x, z) - .01, z + R(-.3, .3)); m.rotation.y = R(0, 3);
}
const M1 = [
  [-7, 64, Math.PI / 2, '#b9573e', g => fruit(g, '#6b2f5a')],                    // figs
  [7, 64, -Math.PI / 2, tex1, g => { for (let i = 0; i < 5; i++) amph(g, -1.4 + i * .7, .7, .8); for (let i = 0; i < 3; i++) amph(g, -1 + i, -.6, 1.2); }],
  [-7, 52, Math.PI / 2, '#7d9a62', g => { ['#c94a3a', '#3f6f9a', '#e0b44a', '#efe6d4'].forEach((c, i) => box(.7, .5, .9, mat('w' + c, c), -1.2 + i * .8, 1.12, .7, g)); }],
  [7, 52, -Math.PI / 2, tex3, g => fruit(g, '#c43a2e')],                         // pomegranates
  [-7, 40, Math.PI / 2, '#efe2c4', g => { box(1.3, .6, .7, 'woodLt', 0, 1.12, .7, g); for (let i = 0; i < 4; i++) { const s = add(new THREE.CylinderGeometry(.1, .1, .9, 6), 'wool', -1.2 + i * .25 + (i > 1 ? 2 : 0), 1.25, .6, g); s.rotation.z = Math.PI / 2; } cyl(.12, .1, .2, 6, 'dark', .3, 1.75, .7, g); }],
  [7, 40, -Math.PI / 2, tex2, g => { cyl(.5, .55, .5, 10, 'woodLt', -1, 1.12, .7, g); for (let i = 0; i < 4; i++) cyl(.32, .18, .22, 8, 'clay', .2 + i * .45, 1.12, .7, g); }],
];
M1.forEach(r => r[4] = () => {});
const STYLE = ['roof', 'awning', 'awning', 'cart', 'tent', 'roof'];   // by M1 index
M1.forEach(([x, z, f, c, gd], i) => { if (i === 2 || i === 3) return; if (MODELS.gstall && (i === 0 || i === 1 || i === 4 || i === 5)) return; stall(x, z, f, c, gd, STYLE[i]); });
