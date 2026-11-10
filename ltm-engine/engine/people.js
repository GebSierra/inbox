// ---------- townspeople (simple low-poly figures) ----------
function person(x, z, rot, tunic = '#c9a46a', opts = {}) {
  const y = opts.y ?? heightAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  const skin = mat('skin' + (opts.skin || 0), ['#c08a62', '#a8714c', '#d9a57c'][opts.skin || 0]); const tm = mat('tunic' + tunic, tunic, { map: TEX.cloth });
  for (const s of [-1, 1]) box(.11, .75, .12, skin, s * .1, 0, 0, g);
  add(new THREE.LatheGeometry([[.27, 0], [.25, .25], [.21, .55], [.19, .62], [.13, .66], [0, .68]].map(([a, b]) => new THREE.Vector2(a, b)), 9), tm, 0, .55, 0, g);
  if (opts.cloak) { const c = add(new THREE.CylinderGeometry(.24, .32, .7, 9, 1, true, Math.PI * .6, Math.PI * .8), mat('cloak' + opts.cloak, opts.cloak, { side: THREE.DoubleSide, map: TEX.cloth }), 0, .85, 0, g); }
  box(.12, .1, .15, skin, 0, 1.2, 0, g); add(new THREE.IcosahedronGeometry(.13, 1), skin, 0, 1.4, 0, g); add(new THREE.SphereGeometry(.135, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat('hair' + (opts.hair || 0), ['#3a2a1e', '#1e1612', '#6a4a2a', '#c8c0b0'][opts.hair || 0]), 0, 1.43, .01, g);
  if (opts.veil) add(new THREE.SphereGeometry(.16, 8, 6, 0, Math.PI * 2, 0, Math.PI * .6), mat('veil' + opts.veil, opts.veil, { side: THREE.DoubleSide }), 0, 1.38, .02, g);
  for (const s of [-1, 1]) { const a = box(.09, .5, .09, tm, s * .27, .78, 0, g); a.rotation.z = s * (opts.armsUp ? -.9 : .12); a.rotation.x = opts.armsUp ? -.5 : 0; const h = add(new THREE.IcosahedronGeometry(.055, 0), skin, s * (opts.armsUp ? .48 : .3), opts.armsUp ? 1.15 : .74, opts.armsUp ? .22 : 0, g); }
  if (opts.carry === 'jar') { const j = new THREE.Group(); j.position.set(0, 1.55, 0); g.add(j); amph(j, 0, 0, .55); }
  if (opts.carry === 'basket') cyl(.25, .2, .2, 8, 'basket', 0, 1.53, 0, g);
  return g;
}
