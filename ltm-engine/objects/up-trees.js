// ---------- UPGRADE: olive trees (plan item L2, look change waiting for the owner) ----------
// upOlive(x, z, s, opts) places an olive tree on the ground. Three shapes per style are built once and shared (the UD.cypress pattern);
// each tree picks a shape, a turn and a size from a private generator seeded by its position. No R().
//   opts: { style: 'a' | 'b', y, parent }
//   style 'a' "gnarled": a twisted forked trunk and a canopy of many small leaf clusters in silver-green and dark green (≈400 triangles)
//   style 'b' "soft":    the same trunk under three soft rounded crowns, smooth-shaded, lit silver on top and dark below (≈450 triangles)
// The engine's tree() calls this when the town's theme says "trees": "a" or "b" (or the page has ?trees=a / ?trees=b);
// it first draws and discards exactly the random numbers the old tree drew, so the town's layout does not move.
const UT = {};
function utShape(style, v) {
  const key = style + v; if (UT[key]) return UT[key];
  const r = upRng(9001 + v * 7717 + (style === 'b' ? 31 : 0)), Rr = (a, b) => a + r() * (b - a), V = (x, y, z) => [x, y, z];
  // trunk: a short flared root, a leaning bole that twists, then two or three limbs out to the crown
  const lean = Rr(-.3, .3), tw = Rr(-.25, .25), bend = V(-lean * .5 + Rr(-.12, .12), .5, -tw * .5 + Rr(-.12, .12)), top = V(lean, .95, tw), parts = [];
  parts.push(upLimb(V(0, -.05, 0), bend, .3, .22, 7, false));                       // a short, thick, bent bole
  parts.push(upLimb(bend, top, .22, .17, 7, false));
  for (const [p, rad] of [[bend, .22], [top, .17]]) { const j = new THREE.IcosahedronGeometry(rad, 1); j.translate(...p); parts.push(j); }   // knuckles hide the joins
  const nl = 3 + (r() < .4 ? 1 : 0), tips = [];
  for (let k = 0; k < nl; k++) { const a = k / nl * Math.PI * 2 + Rr(-.45, .45), d = Rr(.95, 1.35), mid = V(lean + Math.cos(a) * d * .5, Rr(1.3, 1.5), tw + Math.sin(a) * d * .5), tip = V(lean + Math.cos(a) * d, Rr(1.75, 2.05), tw + Math.sin(a) * d);
    parts.push(upLimb(top, mid, .14, .09, 6, false)); parts.push(upLimb(mid, tip, .09, .045, 5, true)); tips.push(tip); }
  const trunk = upMerge(parts), dark = [], light = [];
  if (style === 'a') {
    for (const [tx, ty, tz] of tips) for (let i = 0; i < 6; i++) { const rr = Rr(.36, .52), g = new THREE.IcosahedronGeometry(rr, 0);
      g.scale(1, .55, 1); g.rotateY(Rr(0, 3)); g.translate(tx + Rr(-.6, .6), ty + Rr(-.15, .35) + (i > 3 ? .2 : 0), tz + Rr(-.6, .6)); (i % 3 === 0 ? dark : light).push(g); }
    // clusters over the middle so the crown reads as one wide, flat-topped dome
    for (let i = 0; i < 4; i++) { const g = new THREE.IcosahedronGeometry(Rr(.4, .52), 0); g.scale(1, .55, 1); g.translate(lean + Rr(-.45, .45), Rr(2.0, 2.3), tw + Rr(-.45, .45)); (i % 2 ? light : dark).push(g); }
  } else {
    // soft crowns: one rounded mass per limb plus one over the middle. The bulge depends on the vertex position, so shared corners stay joined.
    const hash = (x, y, z) => { const t = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + v * 9.1) * 43758.5453; return t - Math.floor(t); };
    for (const [tx, ty, tz, rad] of [...tips.map(t => [...t, Rr(.75, .9)]), [lean, 2.2, tw, Rr(.8, .95)]]) { const g = new THREE.IcosahedronGeometry(rad, 1), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = .88 + hash(Math.round(x * 100), Math.round(y * 100), Math.round(z * 100)) * .24; p.setXYZ(i, x * k, y * k * .6, z * k); }
      g.translate(tx, ty + .2, tz); g.deleteAttribute('normal'); g.deleteAttribute('uv'); const mg = mergeVertices(g); mg.computeVertexNormals(); light.push(mg); }
  }
  UT[key] = { trunk, light: light.length ? upMerge(light) : null, dark: dark.length ? upMerge(dark) : null };
  return UT[key];
}
function utMats(style) {
  const lf = M.leaf ? M.leaf.color.clone() : new THREE.Color('#6f7f3e'), silver = lf.clone().lerp(new THREE.Color('#b9bea2'), .35), dk = (M.leafDk ? M.leafDk.color.clone() : lf.clone().multiplyScalar(.75));
  return { trunk: mat('utBark', '#5e4632', { roughness: 1 }), light: mat('utLeaf' + style, '#' + silver.getHexString(), { flatShading: style === 'a', roughness: .95 }),
    dark: mat('utLeafDk' + style, '#' + dk.getHexString(), { flatShading: style === 'a', roughness: .95 }) }; }
function upOlive(x, z, s = 1, o = {}) {
  const style = o.style === 'b' ? 'b' : 'a', r = upRng(Math.round(x * 4099) ^ Math.round(z * 65537) ^ 0x011e), v = (r() * 3) | 0, sh = utShape(style, v), m = utMats(style);
  const g = new THREE.Group(); g.position.set(x, o.y ?? heightAt(x, z), z); g.rotation.y = r() * 6.283; g.scale.setScalar(s * (.9 + r() * .2)); (o.parent || scene).add(g);
  for (const k of ['trunk', 'light', 'dark']) if (sh[k]) { const mesh = new THREE.Mesh(sh[k], m[k]); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); }
  return g; }
