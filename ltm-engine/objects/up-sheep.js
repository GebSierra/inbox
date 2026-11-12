// ---------- UPGRADE: sheep (plan item L1) ----------
// upSheep(x, z, opts) places a sheep of the region on the ground: fat-tailed, cream wool in overlapping puffs, a dark face and
// drooping ears, like the Awassi of today (first built for the Tabernacle camp, owner-approved there). Head toward +x before ry.
//   opts: { ry, s (scale), lamb (true = a lamb), graze (true/false; default: about 4 in 10 graze), coat (0-4), parent }
// The engine's sheep(x, z) calls this. No R(): each sheep's look comes from a private generator seeded by its position,
// so the same sheep looks the same on every load and the town's random stream is untouched.
const US_WOOL = ['#efe8da', '#e8dfcc', '#f3eee4', '#8a6a4a', '#3a302a'];
function upSheep(x, z, o = {}) {
  const rnd2 = upRng(Math.round(x * 7919) ^ Math.round(z * 104729) ^ 0x5eed), Rr = (a, b) => a + rnd2() * (b - a);
  const wool = US_WOOL.map((c, i) => mat('usWool' + i, c, { flatShading: true, roughness: 1 }));
  const face = [mat('usFace0', '#3a2c24', { roughness: .9 }), mat('usFace1', '#6a4a34', { roughness: .9 })], hoof = mat('usHoof', '#2a221e'), eye = mat('usEye', '#120d0a');
  const lamb = !!o.lamb, g = new THREE.Group(); g.position.set(x, o.y ?? heightAt(x, z), z); g.rotation.y = o.ry ?? Rr(0, 6.3);
  g.scale.setScalar((o.s ?? Rr(.85, 1.05)) * (lamb ? .55 : 1)); (o.parent || scene).add(g);
  const k = rnd2(), wm = wool[o.coat ?? (k < .08 ? 4 : k < .18 ? 3 : (rnd2() * 3) | 0)], fm = face[rnd2() < .3 ? 1 : 0];
  // a lamb: shorter body, longer legs for its size, bigger head
  const L = lamb ? 1.08 : 1, body = lamb ? .86 : 1, head = lamb ? 1.28 : 1, th = lamb ? 1.3 : 1;
  const puffs = [[0, .74, 0, .34], [.24, .78, 0, .3], [-.24, .76, 0, .3], [.1, .7, .14, .27], [.1, .7, -.14, .27], [-.12, .7, .15, .27], [-.12, .7, -.15, .27], [0, .9, 0, .25], [.34, .74, 0, .23], [-.38, .7, 0, .24]];
  const lift = (L - 1) * .44;                                                        // the body rides higher on a lamb's longer legs
  for (const [px, py, pz, r] of puffs) add(new THREE.IcosahedronGeometry(r * body * Rr(.92, 1.08), 1), wm, px * body, py + lift + Rr(-.02, .02), pz * body, g);
  if (!lamb) add(new THREE.IcosahedronGeometry(.17, 1), wm, -.52, .6, 0, g).scale.set(.9, 1.15, 1.1);   // the fat tail
  else add(new THREE.IcosahedronGeometry(.08, 1), wm, -.42 * body, .72 + lift, 0, g).scale.set(.7, 1.4, .8);   // a short lamb's tail
  for (const [lx, lz] of [[.26, .11], [.26, -.11], [-.26, .11], [-.26, -.11]]) { cyl(.035 * th, .042 * th, .44 * L, 6, fm, lx * body, .04, lz, g); cyl(.047 * th, .047 * th, .05, 6, hoof, lx * body, 0, lz, g); }
  const hd = new THREE.Group(), graze = o.graze ?? rnd2() < .4; hd.position.set(.46 * body, .86 + lift, 0); hd.scale.setScalar(head);
  hd.rotation.z = graze ? -1.05 : Rr(-.25, .1); hd.rotation.y = Rr(-.35, .35); g.add(hd);
  add(new THREE.CylinderGeometry(.09, .12, .22, 7), wm, .04, -.02, 0, hd).rotation.z = -1.2;                // neck wool
  add(new THREE.IcosahedronGeometry(.13, 1), fm, .17, 0, 0, hd).scale.set(1.25, 1, .85);                    // skull
  add(new THREE.IcosahedronGeometry(.085, 1), fm, .3, -.06, 0, hd).scale.set(1.2, .85, .8);                 // muzzle
  add(new THREE.IcosahedronGeometry(.085, 1), wm, .12, .1, 0, hd).scale.set(1, .6, 1.1);                    // a tuft of wool on the crown
  for (const sd of [-1, 1]) { const ear = add(new THREE.IcosahedronGeometry(.07, 0), fm, .13, -.02, sd * .13, hd); ear.scale.set(.6, .35, 1.6); ear.rotation.x = sd * .7;   // long, drooping
    add(new THREE.SphereGeometry(.015, 5, 4), eye, .24, .04, sd * .075, hd); }
  return g; }
