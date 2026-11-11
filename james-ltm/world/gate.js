// ---------- the city gate: the way into the agora (James 1) ----------
const GZ = 78;
{ // city wall + gate
  cityGate(GZ, { style: 'james' });   // the library's 'city-gate-james' (objects/colossae-shared.js)
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
