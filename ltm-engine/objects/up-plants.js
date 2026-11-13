// ---------- NEW (plan item N4): trees and plants of the land ----------
// Each built from a private generator (no R()), shared materials, one mesh per material (upBag). Library entries; no town uses them yet.
//   upFig      a fig tree: a low, wide, many-stemmed shrubby tree with big lobed leaves and green-purple figs (James 3:12, Matthew 7:16, 21:19)
//   upVine     a grapevine trained over a wooden trellis, with leaves and hanging bunches (John 15)
//   upAcacia   the acacia of the wilderness: a thin leaning trunk, a flat spreading umbrella crown (Exodus 25:5)
//   upTerebinth the terebinth (oak of the land): a short massive trunk and a broad rounded crown (Genesis 35:4, Isaiah 6:13)
//   upAlmond   an almond in blossom: dark bare branches clouded with white-pink flowers (Jeremiah 1:11, Numbers 17:8)
function upTreeBranches(B, bark, r, base, len, rad, depth, spread, up, out) {   // a simple recursive branching skeleton; leaf points go to out
  const [x, y, z, dx, dy, dz] = base, end = [x + dx * len, y + dy * len, z + dz * len];
  B.put(bark, upLimb([x, y, z], end, rad, rad * .68, 6, depth === 0));
  if (depth === 0) { out.push(end); return; }
  const n = depth > 1 ? 2 + (r() < .4 ? 1 : 0) : 3;
  for (let i = 0; i < n; i++) { const a = r() * 6.283; let nx = dx + Math.cos(a) * spread, ny = dy * up + .25, nz = dz + Math.sin(a) * spread; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    upTreeBranches(B, bark, r, [...end, nx, ny, nz], len * (.62 + r() * .15), rad * .68, depth - 1, spread, up, out); } }
const upLeaf = (w, l, lobes = 0) => { const s = new THREE.Shape(); if (!lobes) { s.moveTo(0, 0); s.quadraticCurveTo(w, l * .45, 0, l); s.quadraticCurveTo(-w, l * .45, 0, 0); }
  else { s.moveTo(0, 0); for (let i = 0; i <= lobes * 2; i++) { const a = -Math.PI / 2 + Math.PI * i / (lobes * 2), rr = i % 2 ? w * .55 : w; s.lineTo(Math.cos(a) * rr * (i % 2 ? 1 : 1.1) + 0, l * .5 + Math.sin(a) * l * .5 * (i % 2 ? .85 : 1)); } s.lineTo(0, 0); }
  return new THREE.ShapeGeometry(s, 3); };
function upFig(g, x, y, z, s = 1, seed = 1) { const r = upRng(9100 + seed), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); g.add(G);
  const bark = mat('upFigBark', '#a09484', { roughness: .9, flatShading: false }), leaf = mat('upFigLeaf', '#4e7a2e', { side: THREE.DoubleSide, roughness: .8 }), leaf2 = mat('upFigLeaf2', '#628a38', { side: THREE.DoubleSide, roughness: .8 }),
    fig = mat('upFig', '#6a4a5a', { roughness: .6, flatShading: false }), figG = mat('upFigG', '#8aa04a', { roughness: .6, flatShading: false }), tips = [];
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + r(), dx = Math.cos(a) * .55, dz = Math.sin(a) * .55, l = Math.hypot(dx, 1, dz);   // several smooth grey stems from the ground, leaning out
    upTreeBranches(B, bark, r, [Math.cos(a) * .1, 0, Math.sin(a) * .1, dx / l, 1 / l, dz / l], .9, .09, 2, .8, .7, tips); }
  for (const t of tips) for (let i = 0; i < 9; i++) { const lg = upLeaf(.17, .28, 2); lg.rotateX(-.9 - r() * .9); lg.rotateY(r() * 6.283); lg.translate(t[0] + (r() - .5) * .5, t[1] + (r() - .5) * .35, t[2] + (r() - .5) * .5); B.put(i % 2 ? leaf : leaf2, lg);
    if (i < 2) B.put(r() < .5 ? fig : figG, new THREE.SphereGeometry(.035, 7, 6).scale(1, 1.25, 1), t[0] + (r() - .5) * .3, t[1] - .08, t[2] + (r() - .5) * .3); }
  B.flush(G); return y + 2.9 * s; }
function upVine(g, x, y, z, s = 1, seed = 1) { const r = upRng(9200 + seed), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); g.add(G);
  const wd = mat('upTrellis', '#7a5a3a', { roughness: .9, map: TEX.wood }), stock = mat('upVineStock', '#5a4030', { roughness: 1, flatShading: false }), leaf = mat('upVineLeaf', '#5a8030', { side: THREE.DoubleSide, roughness: .8 }),
    leaf2 = mat('upVineLeaf2', '#7a9a3a', { side: THREE.DoubleSide, roughness: .8 }), grape = mat('upGrape', '#4a2848', { roughness: .35, flatShading: false }), W = 2.2, H = 1.9;
  for (const px of [-W / 2, W / 2]) for (const pz of [-.5, .5]) B.put(wd, new THREE.CylinderGeometry(.05, .06, H, 6), px, H / 2, pz);
  for (const pz of [-.5, .5]) B.put(wd, new THREE.BoxGeometry(W + .2, .07, .07), 0, H, pz);
  for (let i = 0; i < 6; i++) B.put(wd, new THREE.BoxGeometry(.05, .05, 1.2), -W / 2 + .2 + i * (W - .4) / 5, H + .06, 0);
  { const c = new THREE.CatmullRomCurve3([[0, 0, 0], [.06, .5, .04], [-.04, 1.0, -.03], [.07, 1.5, .04], [0, H + .1, 0]].map(p => new THREE.Vector3(...p))); B.put(stock, new THREE.TubeGeometry(c, 16, .05, 6, false)); }   // the old stock, gently twisting
  for (const sx of [-1, 1]) B.put(stock, upLimb([0, H + .1, 0], [sx * W / 2, H + .14, sx * .1], .03, .018, 5));
  for (let i = 0; i < 70; i++) { const lg = upLeaf(.14, .2, 2); lg.rotateX(-Math.PI / 2 + (r() - .5) * .8); lg.rotateY(r() * 6.283); lg.translate((r() - .5) * W, H + .1 + r() * .12, (r() - .5) * 1.1); B.put(i % 3 ? leaf : leaf2, lg); }
  for (let k = 0; k < 9; k++) { const bx = (r() - .5) * (W - .3), bz = (r() - .5) * .9; for (let i = 0; i < 14; i++) { const row = Math.floor(Math.sqrt(i * 2)), lat = (i - row * row / 2) * .02;
      B.put(grape, new THREE.SphereGeometry(.024, 6, 5), bx + lat + (r() - .5) * .02, H - .04 - row * .035, bz + (r() - .5) * .03); } }
  B.flush(G); return y + (H + .3) * s; }
function upAcacia(g, x, y, z, s = 1, seed = 1) { const r = upRng(9300 + seed), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); g.add(G);
  const bark = mat('upAcBark', '#5a4634', { roughness: 1, flatShading: false }), leaf = mat('upAcLeaf', '#7a8a3e', { roughness: .9 }), leaf2 = mat('upAcLeaf2', '#8e9a4a', { roughness: .9 });
  const lean = (r() - .5) * .5, top = [lean, 2.2, (r() - .5) * .3]; B.put(bark, upLimb([0, 0, 0], top, .13, .09, 7));
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + r(), e = [top[0] + Math.cos(a) * 1.3, 2.9 + r() * .3, top[2] + Math.sin(a) * 1.3]; B.put(bark, upLimb(top, e, .07, .03, 5));
    for (let i = 0; i < 3; i++) { const c = new THREE.IcosahedronGeometry(.9, 1); c.scale(1.2, .25, 1.2); c.translate(e[0] + (r() - .5) * .8, e[1] + .15 + r() * .1, e[2] + (r() - .5) * .8); B.put(i % 2 ? leaf : leaf2, c); } }
  B.flush(G); return y + 3.4 * s; }
function upTerebinth(g, x, y, z, s = 1, seed = 1) { const r = upRng(9400 + seed), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); g.add(G);
  const bark = mat('upTerBark', '#6a5a4a', { roughness: 1, flatShading: false }), leaf = mat('upTerLeaf', '#4a6a2e', { roughness: .9 }), leaf2 = mat('upTerLeaf2', '#5a7a34', { roughness: .9 }), tips = [];
  B.put(bark, upLimb([0, 0, 0], [0, 1.4, 0], .42, .32, 9));
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + r(), dx = Math.cos(a) * .9, dz = Math.sin(a) * .9, l = Math.hypot(dx, 1, dz); upTreeBranches(B, bark, r, [0, 1.3, 0, dx / l, 1 / l, dz / l], 1.4, .25, 2, .7, .8, tips); }
  for (const t of tips) for (let i = 0; i < 2; i++) { const c = new THREE.IcosahedronGeometry(1.0 + r() * .4, 1); c.scale(1, .75, 1); c.translate(t[0] + (r() - .5) * .6, t[1] + (r() - .5) * .3, t[2] + (r() - .5) * .6); B.put(i ? leaf : leaf2, c); }
  B.flush(G); return y + 6 * s; }
function upAlmond(g, x, y, z, s = 1, seed = 1) { const r = upRng(9500 + seed), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); g.add(G);
  const bark = mat('upAlBark', '#3e3028', { roughness: .9, flatShading: false }), bl = mat('upAlBloom', '#f6eef0', { roughness: .8, side: THREE.DoubleSide }), bl2 = mat('upAlBloom2', '#f2c8d4', { roughness: .8, side: THREE.DoubleSide }), tips = [];
  upTreeBranches(B, bark, r, [0, 0, 0, .05, 1, 0], 1.1, .11, 3, .9, .9, tips);
  for (const t of tips) for (let i = 0; i < 44; i++) { const f = new THREE.CircleGeometry(.055, 5); f.rotateX(-Math.PI / 2 + (r() - .5) * 2); f.rotateY(r() * 6.283); f.translate(t[0] + (r() - .5) * .7, t[1] + (r() - .5) * .45, t[2] + (r() - .5) * .7); B.put(i % 4 ? bl : bl2, f); }
  B.flush(G); return y + 3.6 * s; }
{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'plan N4', tags, kind: 'plant' });
  T('fig-tree', 'Fig tree with figs', ['tree', 'fruit', 'garden', 'gospel', 'james'], (g, x, y, z) => upFig(g, x, y, z, 1));
  T('grapevine-trellis', 'Grapevine on a trellis', ['vine', 'garden', 'fruit', 'gospel'], (g, x, y, z) => upVine(g, x, y, z, 1));
  T('acacia-tree', 'Acacia (wilderness tree)', ['tree', 'desert', 'tabernacle'], (g, x, y, z) => upAcacia(g, x, y, z, 1));
  T('terebinth', 'Terebinth (great oak of the land)', ['tree', 'hillside', 'landmark'], (g, x, y, z) => upTerebinth(g, x, y, z, .8));
  T('almond-in-blossom', 'Almond tree in blossom', ['tree', 'spring', 'prophets'], (g, x, y, z) => upAlmond(g, x, y, z, 1)); }
