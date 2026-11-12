// ---------- THE CAMP OF ISRAEL round the tabernacle (Numbers 2–3) ----------
// The Levites camp close round the court (Gershon west, Kohath south, Merari north; Moses and Aaron east, at the door),
// the twelve tribes further out in four camps, each under its standard: Judah east, Reuben south, Ephraim west, Dan north.
const tentMs = ['#2e2724', '#3a302a', '#4a3a2e', '#33291f', '#56463a'].map((c, i) => mat('campTent' + i, c, { map: TEX.cloth }));
function campTent(x, z, rot, s = 1) {
  const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = rot; scene.add(g);
  const w = 3.6 * s, d = 2.6 * s, h = 1.7 * s, m = tentMs[(rnd() * tentMs.length) | 0];
  const sh = new THREE.Shape(); sh.moveTo(-d / 2, 0); sh.lineTo(-d / 2 + .15, h * .55); sh.lineTo(0, h); sh.lineTo(d / 2 - .15, h * .55); sh.lineTo(d / 2, 0); sh.lineTo(-d / 2, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.translate(0, 0, -w / 2);
  const t = add(geo, m, 0, 0, 0, g); t.rotation.y = Math.PI / 2;
  box(w * .35, h * .5, .04, mat('campDoor', '#1a1512'), 0, 0, d / 2 + .01, g);                 // the dark doorway
  if (rnd() < .35) { box(1.2 * s, .05, .8 * s, mat('campMat', '#a8874e'), R(-1, 1), .02, d / 2 + .9, g); }
  return g;
}
// the standard of each camp: a tall pole with a coloured banner (Num 2:2)
function standard(x, z, col) { const y = heightAt(x, z); cyl(.05, .06, 6, 6, 'wood', x, y, z); const f = box(1.4, .9, .03, mat('std' + col, col, { side: THREE.DoubleSide }), x + .72, y + 4.9, z); f.userData.dyn = 1; }
// an acacia: the wood of the tabernacle (Ex 25:5)
function acacia(x, z, s = 1) { const y = heightAt(x, z);
  const t = cyl(.1 * s, .18 * s, 2.4 * s, 6, 'trunk', x, y, z); t.rotation.z = R(-.15, .15);
  for (let i = 0; i < 3; i++) { const a = R(0, 6.3), r = R(.6, 1.5) * s; const c = add(new THREE.IcosahedronGeometry(1.3 * s, 0), i % 2 ? 'leaf' : 'leafDk', x + Math.cos(a) * r, y + 2.6 * s + R(-.1, .2), z + Math.sin(a) * r); c.scale.set(1.5, .35, 1.3); } }
{
  const CX = 0, CZ = -22.86;                                    // the centre of the court
  const placed = [];
  const free = (x, z, gap) => !placed.some(([a, b]) => Math.hypot(a - x, b - z) < gap);
  const inCourt = (x, z, m) => Math.abs(x) < COURT.x + m && z < COURT.zE + m && z > COURT.zW - m;
  const avenue = (x, z) => Math.abs(x) < 7 && z > -2;          // keep the way to the gate open
  // the Levites, close in
  for (let i = 0; i < 900 && placed.length < 90; i++) { const x = R(-36, 36), z = R(-72, 26); if (inCourt(x, z, 9) || !inCourt(x, z, 24) || avenue(x, z) || !free(x, z, 5.6)) continue;
    placed.push([x, z]); campTent(x, z, Math.atan2(CX - x, CZ - z) + R(-.3, .3), R(.85, 1)); }
  // the tribes, further out, in four camps with a gap between them on the diagonals
  for (let i = 0; i < 5000 && placed.length < 420; i++) { const a = R(0, Math.PI * 2), r = R(52, 150), x = CX + Math.cos(a) * r * 1.05, z = CZ + Math.sin(a) * r;
    const diag = Math.abs(Math.abs(Math.cos(a)) - Math.abs(Math.sin(a))) < .12; if (diag || avenue(x, z) || !free(x, z, 6.2)) continue;
    placed.push([x, z]); campTent(x, z, Math.atan2(CX - x, CZ - z) + R(-.4, .4), R(.9, 1.15)); }
  // the four standards: Judah (east), Reuben (south), Ephraim (west), Dan (north)
  standard(9, 46, '#3f6f2a'); standard(-58, CZ, '#b23a2a'); standard(0, CZ - 64, '#2f4f95'); standard(58, CZ + 3, '#d9a640');
  // Moses and Aaron at the door (Num 3:38)
  campTent(-11, 12, Math.PI, 1.1); campTent(11, 12, Math.PI, 1.1);
  // flocks and herds outside the camp, a few acacias in the wadi
  for (let i = 0; i < 18; i++) sheep(R(160, 200), R(-60, 10));
  for (let i = 0; i < 12; i++) sheep(R(-210, -170), R(-20, 40));
  for (let i = 0; i < 26; i++) { const x = R(-240, 240), z = R(-220, 200); if (Math.hypot(x - CX, z - CZ) > 175) acacia(x, z, R(.8, 1.2)); }
  // a family bringing a lamb to the gate (Lev 1:3)
  person(-2.2, 7.5, Math.PI + .3, '#8a5a3a', { cloak: '#5a3a2a', hair: 2 }); person(-1.2, 8.3, Math.PI, '#c9a46a', { veil: '#e8dcc4', skin: 1 }); sheep(-.4, 6.6);
  person(3.4, 9.5, Math.PI - .4, '#3f6f9a', { cloak: '#2a3a5a' });
}
