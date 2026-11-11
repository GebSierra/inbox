// ---------- UP-D: next-level planter, cypress, laurel wreath and garland, cloth bolts and Roman bed ----------
// Shared helpers (UD) and the builders that objects/nature.js (planter, cypress in engine/props.js) and objects/colossae.js (wreath, garland, bolts, bed2) call.
// Everything here uses a private generator (UD.rng): it NEVER draws from the town's seeded R(), so no room moves.
// Foliage is built into one vertex-coloured mesh (leaves are pointed ellipses in pairs along a branch); function declarations/const only, nothing runs at load.
const UD = (() => {
  const PI = Math.PI, V3 = (x, y, z) => new THREE.Vector3(x, y, z), X = V3(1, 0, 0), Y = V3(0, 1, 0), Z = V3(0, 0, 1);
  const rng = seed => { let s = (seed >>> 0) || 1; return (a = 0, b = 1) => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return a + (s / 4294967296) * (b - a); }; };
  const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);
  const jit = (hex, r, v = .12, h = .02) => { const c = new THREE.Color(hex); c.offsetHSL(r(-h, h), r(-.05, .05), r(-v, v)); return c; };
  const TX = {};
  const tex = (key, size, draw) => { if (!TX[key]) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size, rng(key.length * 977 + size));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.userData = {}; TX[key] = t; } return TX[key]; };
  // vertex-coloured, double-sided material shared by every leaf/foliage mesh
  const vcMat = () => mat('udVC', '#ffffff', { vertexColors: true, side: THREE.DoubleSide, roughness: .85 });

  // ---- accumulator: many small pieces -> one geometry with vertex colours ----
  class Acc {
    constructor() { this.p = []; this.c = []; this.m = new THREE.Matrix4(); this.v = new THREE.Vector3(); }
    add(geo, m, c) { const g = geo.index ? geo.toNonIndexed() : geo, pa = g.attributes.position, v = this.v;
      for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m); this.p.push(v.x, v.y, v.z); this.c.push(c.r, c.g, c.b); } }
    at(geo, pos, q, sc, c) { this.m.compose(pos, q || new THREE.Quaternion(), sc || V3(1, 1, 1)); this.add(geo, this.m, c); }
    box(w, h, d, x, y, z, c, ry = 0, rx = 0, rz = 0) { this.at(new THREE.BoxGeometry(w, h, d), V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), null, c); }
    ball(r, x, y, z, c, sx = 1, sy = 1, sz = 1) { this.at(new THREE.IcosahedronGeometry(r, 0), V3(x, y, z), null, V3(sx, sy, sz), c); }
    limb(a, b, r0, r1, c, sides = 5) { const d = b.clone().sub(a), L = d.length(); if (L < 1e-5) return;
      this.at(new THREE.CylinderGeometry(r1, r0, L, sides, 1, true), a.clone().add(b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()), null, c); }
    build() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.computeVertexNormals(); return g; }
  }
  // a pointed ellipse (base, two shoulders, a raised midrib, tip): 4 triangles, 1 long and 1 wide, pointing +Y
  let _leaf; const leafGeo = () => _leaf || (_leaf = (() => { const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -.5, .36, 0, .5, .36, 0, 0, .42, .13, 0, 1, 0], 3)); g.setIndex([0, 1, 3, 0, 3, 2, 1, 4, 3, 3, 4, 2]); return g.toNonIndexed(); })());
  // place one leaf: base at p, pointing along dir, its face turned toward `up`
  const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  function leaf(acc, p, dir, L, W, c, up, roll = 0) {
    _q.setFromUnitVectors(Y, dir); const z0 = Z.clone().applyQuaternion(_q), u = up.clone().addScaledVector(dir, -up.dot(dir));
    let ang = 0; if (u.lengthSq() > 1e-6) { u.normalize(); ang = Math.atan2(z0.clone().cross(u).dot(dir), z0.dot(u)); }
    _q2.setFromAxisAngle(dir, ang + roll).multiply(_q); acc.at(leafGeo(), p, _q2.clone(), V3(W, L, W), c); }
  // a polyline with arc-length parameter
  const poly = pts => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); const T = cum[cum.length - 1];
    const at = t => { const d = Math.max(0, Math.min(1, t)) * T; let i = 1; while (i < pts.length - 1 && cum[i] < d) i++; const f = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
      return { p: pts[i - 1].clone().lerp(pts[i], f), t: pts[i].clone().sub(pts[i - 1]).normalize() }; }; return { at, T }; };
  // a leafy twig: stem tube along pts with pairs of leaves (alternate pairs turned 90 degrees) at n nodes and a terminal leaf
  function spray(acc, pts, o, r) {
    const P = poly(pts), n = o.n, st = o.stem || [.012, .006], sc = o.stemCol || col('#6b5236'), up = o.up || Y;
    for (let i = 0; i < 4; i++) acc.limb(P.at(i / 4).p, P.at((i + 1) / 4).p, st[0] + (st[1] - st[0]) * i / 4, st[0] + (st[1] - st[0]) * (i + 1) / 4, sc, 4);
    for (let i = 0; i < n; i++) { const t = n > 1 ? .1 + .8 * i / (n - 1) : .5, { p, t: tan } = P.at(t), k = 1 - (o.taper ?? .35) * t;
      const ref = Math.abs(tan.y) < .9 ? Y : X, s0 = tan.clone().cross(ref).normalize(), s1 = tan.clone().cross(s0), ph = (i % 2) * PI / 2 + (o.phase || 0);
      for (let sd = 0; sd < 2; sd++) { const a = ph + sd * PI, side = s0.clone().multiplyScalar(Math.cos(a)).addScaledVector(s1, Math.sin(a)), op = (o.open ?? .8) + r(-.15, .15);
        const dir = tan.clone().multiplyScalar(Math.cos(op)).addScaledVector(side, Math.sin(op)); dir.y -= o.droop ?? .12; dir.normalize();
        leaf(acc, p, dir, o.L * k * r(.85, 1.15), o.W * k * r(.85, 1.15), jit(o.cols[Math.floor(r(0, o.cols.length))], r, .1), up, r(-.4, .4)); } }
    const e = P.at(1); leaf(acc, e.p, e.t.clone().addScaledVector(Y, o.tipLift ?? .1).normalize(), o.L * (1 - (o.taper ?? .35)) * 1.1, o.W * (1 - (o.taper ?? .35)), jit(o.cols[0], r, .08), up, r(-.3, .3));
    return e.p; }
  // ---- lathe helpers ----
  const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg);

  // ======================= CYPRESS (shared geometry, one coloured mesh + a plain core per tree) =======================
  const CY = []; const cyGeo = v => CY[v] || (CY[v] = (() => {
    const r = rng(4101 + v * 313), acc = new Acc(), base = M.cypress.color.clone(), H = 8;
    const prof = [[0, .62], [.1, .78], [.28, .88], [.5, .8], [.7, .56], [.86, .3], [1, .05]];
    const wAt = t => { for (let i = 1; i < prof.length; i++) if (t <= prof[i][0]) { const f = (t - prof[i - 1][0]) / (prof[i][0] - prof[i - 1][0]); return prof[i - 1][1] + (prof[i][1] - prof[i - 1][1]) * f; } return .05; };
    // trunk flare at the base (colour in the vertex colours, no extra material)
    acc.limb(V3(0, 0, 0), V3(0, 1.4, 0), .22, .12, col('#6b4a32', .9), 5); acc.limb(V3(.0, 0, 0), V3(0, .4, 0), .3, .2, col('#5b3e2a'), 5);
    const N = 12; const cone = new THREE.ConeGeometry(1, 2, 5, 1, true);
    for (let k = 0; k < 3; k++) for (let i = 0; i < N; i++) { const t = (i + .5 + (k ? .33 * k : 0) + r(-.25, .25)) / (N + .5), y = .55 + t * 7.0, w = wAt(Math.min(t, 1)) * r(.78, 1.08) * (k ? .9 - .08 * k : 1.04), h = (H / N) * r(1.0, 1.9);
      const a = r(0, PI * 2), off = w * r(.1, .5) * (k ? 1 : .5), tilt = r(.05, .3), c0 = col('#ffffff').lerpColors(base, base, 0).multiplyScalar(r(.72, 1.2));
      // tall five-sided cone clump: dark at its base, lit at its tip (colours are set per vertex below)
      const sub = new Acc(); sub.at(cone, V3(0, 0, 0), null, null, c0); const pa = sub.p;
      for (let q = 0; q < pa.length; q += 3) { const yy = (pa[q + 1] + 1) / 2, shade = .62 + .55 * yy; sub.c[q] *= shade; sub.c[q + 1] *= shade * 1.02; sub.c[q + 2] *= shade * .9; }
      const m = new THREE.Matrix4().compose(V3(Math.cos(a) * off, y, Math.sin(a) * off), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(a) * tilt, a, -Math.cos(a) * tilt)), V3(w, h / 2 * 1.0, w * r(.8, 1.1)));
      const v = new THREE.Vector3(); for (let q = 0; q < pa.length; q += 3) { v.set(pa[q], pa[q + 1], pa[q + 2]).applyMatrix4(m); acc.p.push(v.x, v.y, v.z); acc.c.push(sub.c[q], sub.c[q + 1], sub.c[q + 2]); } }
    return acc.build(); })());
  let _cyCore; const cyCore = () => _cyCore || (_cyCore = (() => { const g = new THREE.ConeGeometry(.66, 7.2, 6); g.translate(0, .8 + 3.6, 0); return g; })());
  const coreMat = () => mat('udCore', M.cypress.color.clone().multiplyScalar(.5).getStyle());
  const hash = (x, z, k) => { const s = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };
  function cypress(x, z, s, y) {
    const v = Math.floor(hash(x, z, 1) * 3), mesh = add(cyGeo(v), vcMat(), x, y, z);
    mesh.scale.set(s * (.88 + .24 * hash(x, z, 2)), s, s * (.88 + .24 * hash(x, z, 3))); mesh.rotation.set(0, hash(x, z, 4) * PI * 2, (hash(x, z, 5) - .5) * .09, 'YXZ');
    const core = add(cyCore(), coreMat(), x, y, z); core.scale.set(s, s, s); core.rotation.z = mesh.rotation.z; core.rotation.y = mesh.rotation.y; }

  // ======================= TERRACOTTA PLANTER WITH A FLOWERING BUSH =======================
  const potTex = () => tex('udPot', 256, (x, w, r) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, w);
    const g = x.createLinearGradient(0, 0, 0, w); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,70,40,.28)'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.fillStyle = 'rgba(255,235,215,.45)'; x.fillRect(0, 0, w, 20);                                                 // paler slip on the rim
    for (const [yy, hh] of [[34, 4], [44, 3], [112, 5], [124, 3], [188, 4]]) { x.fillStyle = 'rgba(70,32,16,.6)'; x.fillRect(0, yy, w, hh); }     // incised grooves
    x.strokeStyle = 'rgba(60,28,14,.75)'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= w; i += 16) x.lineTo(i, i % 32 ? 62 : 84); x.stroke();     // zig-zag band
    x.fillStyle = 'rgba(70,32,16,.5)'; for (let i = 0; i < w; i += 32) { x.beginPath(); x.moveTo(i, 100); x.lineTo(i + 8, 92); x.lineTo(i + 16, 100); x.fill(); }
    for (let i = 0; i < 26; i++) { const xx = r(0, w), yy = r(60, 200); x.fillStyle = `rgba(245,240,225,${r(.15, .4)})`; x.fillRect(xx, yy, r(1, 3), r(8, 40)); }   // lime-scale drips
    for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r(0, 1) < .5 ? '70,35,20' : '255,235,210'},${r(.03, .13)})`; x.fillRect(r(0, w), r(0, w), r(1, 3), r(1, 3)); }
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(30,20,12,.2)'; x.beginPath(); x.ellipse(r(0, w), r(150, 256), r(6, 18), r(4, 10), 0, 0, 7); x.fill(); } });
  const soilTex = () => tex('udSoil', 64, (x, w, r) => { x.fillStyle = '#5a4030'; x.fillRect(0, 0, w, w); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(${r(0, 1) < .5 ? '30,20,14' : '120,90,64'},${r(.2, .6)})`; x.fillRect(r(0, w), r(0, w), r(1, 3), r(1, 3)); } });
  function planter(g, x, y, z) {
    const r = rng(7771), O = [[0, 0], [.3, 0], [.34, .015], [.35, .05], [.33, .075], [.41, .15], [.5, .29], [.53, .41], [.5, .5], [.5, .54], [.56, .565], [.575, .6], [.53, .625], [.48, .6], [.46, .54], [.44, .5]];
    const pg = lathe(O, 14), uv = pg.attributes.uv, pp = pg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setY(i, pp.getY(i) / .62);
    add(pg, mat('udPot', '#d58656', { map: potTex(), flatShading: false, roughness: .6 }), x, y, z, g);
    // soil with a heap in the middle and a few pebbles
    const so = new THREE.CircleGeometry(.46, 12); so.rotateX(-PI / 2); add(so, mat('udSoil', '#ffffff', { map: soilTex() }), x, y + .51, z, g);
    const mound = add(new THREE.ConeGeometry(.3, .08, 8), 'udSoil', x, y + .53, z, g); mound.material = M.udSoil;
    for (let i = 0; i < 5; i++) { const a = r(0, 7), d = r(.15, .38); add(new THREE.IcosahedronGeometry(.032, 0), mat('udPebble', '#9a9082'), x + Math.cos(a) * d, y + .53, z + Math.sin(a) * d, g).scale.y = .6; }
    const acc = new Acc(), pal = ['#6f9a48', '#7fae52', '#5a8a3c', '#93b85e', '#4f7f38', '#a3c266'], up = V3(0, 1, .15).normalize(), tips = [];
    const S = 8; for (let s = 0; s < S; s++) { const a = s / S * PI * 2 + r(-.3, .3), tilt = (s === 0 ? .12 : r(.4, .8)), len = (s === 0 ? .6 : r(.36, .55)), dx = Math.cos(a), dz = Math.sin(a);
      const b0 = V3(dx * .05, .5, dz * .05), b1 = V3(dx * Math.sin(tilt) * len * .5 + b0.x, .5 + Math.cos(tilt) * len * .55, dz * Math.sin(tilt) * len * .5 + b0.z), b2 = V3(dx * Math.sin(tilt * 1.2) * len + b0.x, .5 + Math.cos(tilt * 1.1) * len, dz * Math.sin(tilt * 1.2) * len + b0.z);
      tips.push(spray(acc, [b0, b1, b2], { n: 7, L: .21, W: .1, cols: pal, up, open: .75, droop: .1, stem: [.016, .008] }, r));
      for (const tt of [.45, .72]) { const P = poly([b0, b1, b2]).at(tt), sa = a + (tt < .6 ? .9 : -.9) + r(-.4, .4), d = V3(Math.cos(sa) * .75, .6, Math.sin(sa) * .75).normalize(), e = P.p.clone().addScaledVector(d, r(.22, .3)), m = P.p.clone().addScaledVector(d, .1).add(V3(0, .03, 0));
        tips.push(spray(acc, [P.p, m, e], { n: 5, L: .19, W: .09, cols: pal, up, open: .8, droop: .12, stem: [.008, .005], phase: r(0, 3) }, r)); } }
    // berries (dark, in pairs) and little cream flowers at the tips
    tips.forEach((p, i) => { if (i % 3 === 0) { acc.ball(.03, p.x, p.y + .03, p.z, col('#f4e2d2'), 1, .7, 1); acc.ball(.014, p.x, p.y + .052, p.z, col('#e0b44a')); }
      else if (i % 4 === 1) { acc.ball(.026, p.x + .03, p.y - .02, p.z, col('#3a2438')); acc.ball(.022, p.x - .02, p.y - .05, p.z + .02, col('#4a2a3e')); } });
    add(acc.build(), vcMat(), x, y, z, g); return y + 1.3; }

  // ======================= LAUREL: crown on a carved bust-rest, and the garland =======================
  const laurelCols = ['#5a8a3a', '#6f9c46', '#4a7a33', '#86b050', '#628f3e'];
  // a leafy laurel branch along a polyline: leaves point along the growth, berries here and there
  function branch(acc, pts, o, r) { const P = poly(pts); spray(acc, pts, Object.assign({ cols: laurelCols, open: .55, droop: 0, tipLift: .05, taper: .25, stem: [.011, .006], stemCol: col('#5a4430') }, o), r);
    const nb = o.berries || 0; for (let i = 0; i < nb; i++) { const e = P.at(.15 + .7 * (i + r(0, .6)) / nb); acc.ball(.017, e.p.x + r(-.01, .01), e.p.y - .012, e.p.z + r(-.01, .01), col('#3a2630')); } }
  function ribbonBit(acc, a, b, w, c) { const d = b.clone().sub(a), L = d.length(); acc.at(new THREE.BoxGeometry(w, L, .004), a.clone().add(b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()), null, c); }
  function wreath(g, x, y, z) {
    const r = rng(2024), wood = 'woodLt';
    // the stand: a turned post on a round foot, a carved neck, shoulders and a plain head block that holds the crown
    add(lathe([[0, 0], [.27, 0], [.285, .03], [.25, .06], [.16, .09], [.075, .13], [.06, .22], [.08, .27], [.055, .33], [.04, .5], [.046, .8], [.04, 1.0], [.062, 1.06], [.05, 1.1], [.06, 1.16]], 10), wood, x, y, z, g);
    const sh = add(new THREE.IcosahedronGeometry(.22, 1), wood, x, y + 1.2, z, g); sh.scale.set(1, .32, .62);
    cyl(.075, .09, .12, 8, wood, x, y + 1.24, z, g);
    const hd = add(new THREE.IcosahedronGeometry(.17, 1), wood, x, y + 1.44, z, g); hd.scale.set(.95, 1.05, 1);
    cyl(.1, .1, .02, 10, bronze(), x, y + 1.1, z, g);
    // the crown: two branches from the back, tips meeting at the front, tied at the back with a ribbon
    const acc = new Acc(), Rr = .235, cy = 0, ring = (a0, a1, k) => { const pts = []; for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * i / 12; pts.push(V3(Math.sin(a) * Rr * k, cy + Math.sin(a * 2) * .012, -Math.cos(a) * Rr * k)); } return pts; };
    // angle 0 = straight back (-z); a branch runs round one side to just past the front
    branch(acc, ring(.2, PI - .08, 1), { n: 17, L: .15, W: .065, up: V3(0, 1, 0), berries: 5, open: .6 }, r);
    branch(acc, ring(-.2, -(PI - .08), 1.01).map(p => p), { n: 17, L: .15, W: .065, up: V3(0, 1, 0), berries: 5, open: .6, phase: .8 }, r);
    // ribbon: knot at the back and two tails with notched ends hanging down the neck
    const kb = V3(0, cy - .01, -Rr), rc = col('#9b2f2a'), rc2 = col('#c0453a');
    acc.ball(.026, kb.x, kb.y, kb.z - .01, rc);
    for (const [dx, bend] of [[-.03, -.03], [.035, .04]]) { const p0 = V3(dx * .3, kb.y - .01, kb.z - .02), p1 = V3(dx + bend * .4, kb.y - .17, kb.z - .06), p2 = V3(dx * 1.6 + bend, kb.y - .33, kb.z - .04);
      ribbonBit(acc, p0, p1, .036, rc2); ribbonBit(acc, p1, p2, .036, rc); acc.at(new THREE.ConeGeometry(.018, .035, 3), p2.clone().add(V3(0, -.016, 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(PI, 0, 0)), V3(1, 1, .1), rc); }
    const m = add(acc.build(), vcMat(), x, y + 1.5, z, g); m.rotation.x = .45;
    return y + 1.7; }
  function garland(g, x, y, z) {
    const r = rng(931), wood = 'wood';
    for (const sx of [-.55, .55]) { add(lathe([[0, 0], [.09, 0], [.1, .04], [.06, .08], [.04, .3], [.05, 1.6], [.065, 1.66], [.04, 1.7], [.05, 1.76], [.03, 1.8]], 7), wood, x + sx, y, z, g); }
    const acc = new Acc(), cat = t => V3(-.55 + t * 1.1, 1.72 - Math.sin(t * PI) * .5 + (t < .5 ? 0 : 0), 0);
    const half = (a0, a1, k) => { const pts = []; for (let i = 0; i <= 10; i++) pts.push(cat(a0 + (a1 - a0) * i / 10)); return pts; };
    branch(acc, half(.02, .52), { n: 16, L: .17, W: .075, up: V3(0, .6, 1).normalize(), berries: 3, open: .6, stem: [.016, .01] }, r);
    branch(acc, half(.98, .48), { n: 16, L: .17, W: .075, up: V3(0, .6, 1).normalize(), berries: 3, open: .6, stem: [.016, .01], phase: .8 }, r);
    for (let i = 1; i < 10; i += 2) { const p = cat(i / 10); acc.ball(.034, p.x, p.y - .04, p.z + .04, col(i % 4 === 1 ? '#c43a2e' : '#e0b44a')); }
    for (const sx of [-.55, .55]) { const b = V3(sx, 1.66, .05); acc.ball(.04, b.x, b.y, b.z, col('#c43a2e'), 1.4, 1, .7);
      for (const [c, o, bend] of [['#c43a2e', 0, .02], ['#3f6f9a', .07, -.03], ['#e0b44a', -.07, .035]]) { const p0 = V3(sx + o * .4, b.y - .03, .06), p1 = V3(sx + o + bend, b.y - .35, .07), p2 = V3(sx + o + bend * 1.8, b.y - .66, .06);
        ribbonBit(acc, p0, p1, .05, col(c)); ribbonBit(acc, p1, p2, .05, col(c, .9)); } }
    add(acc.build(), vcMat(), x, y, z, g); return y + 1.85; }

  // ======================= CLOTH BOLTS =======================
  const weave = kind => tex('udWeave' + kind, 128, (x, w, r) => { x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, w, w);
    if (kind === 'twill') { for (let i = -w; i < w * 2; i += 4) { x.strokeStyle = `rgba(0,0,0,${r(.06, .14)})`; x.lineWidth = 1.5; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + w, w); x.stroke(); } }
    else if (kind === 'check') { for (let i = 0; i < w; i += 32) { x.fillStyle = 'rgba(0,0,0,.14)'; x.fillRect(i, 0, 12, w); x.fillRect(0, i, w, 12); } for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${r(.03, .08)})`; x.fillRect(i, 0, 1, w); } }
    else { for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${r(.04, .1)})`; x.fillRect(i, 0, 1, w); x.fillStyle = `rgba(255,255,255,${r(.05, .12)})`; x.fillRect(0, i, w, 1); } }
    for (let i = 0; i < 150; i++) { x.fillStyle = `rgba(0,0,0,${r(.03, .07)})`; x.fillRect(r(0, w), r(0, w), r(1, 3), 1); } });
  const spiralGeo = (r0, r1, turns, w, a0) => { const n = Math.round(turns * 12), p = [], ix = [];
    for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + t * turns * 2 * PI, rr = r0 + (r1 - r0) * t; for (const s of [-1, 1]) p.push(Math.cos(a) * (rr + s * w / 2), Math.sin(a) * (rr + s * w / 2), 0);
      if (i < n) ix.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setIndex(ix); geo.computeVertexNormals(); return geo; };
  const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getStyle();
  // one rolled bolt lying along x at (x,y,z): faceted roll, woven border bands, loose outer lap, spiral end faces, core rod or open centre
  function bolt(g, x, y, z, r, L, c, bc, kind, rod, turn, ix) {
    const b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = turn; g.add(b);
    const cloth = mat('udB' + c + kind, c, { map: weave(kind) }), body = new THREE.CylinderGeometry(r, r, L, 10, 2), bp = body.attributes.position;
    for (let k = 0; k < bp.count; k++) if (Math.abs(bp.getY(k)) < 1e-4) { bp.setX(k, bp.getX(k) * 1.035); bp.setZ(k, bp.getZ(k) * 1.035); }
    body.computeVertexNormals(); body.rotateZ(PI / 2); add(body, cloth, 0, 0, 0, b);
    for (const e of [-1, 1]) for (const [off, w] of [[.065, .05], [.115, .014]]) { const rr = r * (1 + .035 * (1 - (L / 2 - off) / (L / 2))) + .003, bd = new THREE.CylinderGeometry(rr, rr, w, 10); bd.rotateZ(PI / 2);
      add(bd, mat('udBand' + bc, bc, { map: weave('plain') }), e * (L / 2 - off), 0, 0, b); }
    const la = .9 + ix * .7, lr = r * 1.035 + .004; add(new THREE.BoxGeometry(L * .97, .01, .1), cloth, 0, lr * Math.cos(la), lr * Math.sin(la), b).rotation.x = la + .06;
    for (const e of [-1, 1]) { const f = new THREE.Group(); f.position.x = e * L / 2; f.rotation.y = e * PI / 2; b.add(f);
      add(new THREE.CircleGeometry(r, 10), mat('udEnd' + c, shade(c, .8)), 0, 0, .001, f); add(spiralGeo(.035, r - .014, 3.5, .007, ix * 1.3 + e), mat('udLay' + c, shade(c, .5)), 0, 0, .003, f);
      if (!rod) add(new THREE.CircleGeometry(.032, 8), mat('udHole', '#2a2018'), 0, 0, .004, f); }
    if (rod) { const core = new THREE.CylinderGeometry(.026, .026, L + .07, 6); core.rotateZ(PI / 2); add(core, 'woodLt', 0, 0, 0, b); }
    return b; }
  // a stack of cloth folded flat: layers of different colours, a rounded fold on the front edge, selvedge stripes, twine
  function foldStack(g, x, y, z, w, d, cols, bcols, kinds) {
    let yy = y; const h = .05, r = rng(55);
    cols.forEach((c, i) => { const bc = bcols[i % bcols.length], sx = r(-.012, .012), sz = r(-.01, .01), cl = mat('udF' + c + kinds[i % kinds.length], c, { map: weave(kinds[i % kinds.length]) }), lay = new THREE.Group();
      lay.position.set(x + sx, yy, z + sz); lay.rotation.y = r(-.05, .05); g.add(lay);
      add(new THREE.BoxGeometry(w, h * .9, d), cl, 0, h * .45, 0, lay); const fold = add(new THREE.CylinderGeometry(h * .45, h * .45, w, 8), cl, 0, h * .45, d / 2, lay); fold.rotation.z = PI / 2;
      for (const e of [-1, 1]) { const bm = mat('udBand' + bc, bc, { map: weave('plain') }); add(new THREE.BoxGeometry(.028, h * .93, d + .002), bm, e * (w / 2 - .03), h * .45, 0, lay); add(new THREE.BoxGeometry(.008, h * .94, d + .003), bm, e * (w / 2 - .06), h * .45, 0, lay); }
      yy += h * .9 + .002; });
    const th = yy - y, tw = mat('udTwine', '#a8875a'); for (const tx of [-.1, .12]) add(new THREE.BoxGeometry(.016, th + .012, d + .016), tw, x + tx, y + (th - .006) / 2 + .002, z, g).material = tw;
    add(new THREE.IcosahedronGeometry(.02, 0), tw, x + .12, y + th + .012, z, g); return yy; }
  function bolts(g, x, y, z) {
    const r0 = .158, r1 = .15, r2 = .155, L = .84;
    bolt(g, x - .02, y + r0, z - .17, r0, L, '#8a2f2f', '#efe6d4', 'twill', 1, .04, 0); bolt(g, x + .03, y + r1, z + .15, r1, L * .96, '#3f6f9a', '#d9a640', 'plain', 0, -.05, 1);
    const ty = y + r0 + Math.sqrt((r0 + r2) ** 2 - (.16) ** 2) - .01; bolt(g, x, ty, z - .01, r2, L * .92, '#d9a640', '#7a3b6a', 'check', 1, .06, 2);
    foldStack(g, x + .05, y, z + .56, .6, .42, ['#efe6d4', '#7a3b6a', '#d9a640', '#3f6f9a', '#c94a3a'], ['#c94a3a', '#d9a640', '#7a3b6a'], ['plain', 'twill', 'plain', 'check', 'twill']);
    return y + ty - y + r2 + .03; }

  // ======================= ROMAN BED (lectus cubicularis) =======================
  const bedTex = k => k === 'blanket' ? tex('udBlanket', 128, (x, w, r) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, w);
      const bands = [[10, 14, '#7a2f24'], [30, 4, '#222'], [38, 4, '#222'], [52, 20, '#2f5f7a'], [80, 4, '#222'], [88, 4, '#222'], [102, 14, '#7a2f24']];
      for (const [yy, hh, c] of bands) { x.globalAlpha = .8; x.fillStyle = c; x.fillRect(0, yy, w, hh); x.globalAlpha = 1; }
      x.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i + 8, 54); x.lineTo(i + 14, 62); x.lineTo(i + 8, 70); x.lineTo(i + 2, 62); x.fill(); }
      for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(0,0,0,${r(.03, .09)})`; x.fillRect(i, 0, 1, w); } })
    : tex('udQuilt', 128, (x, w, r) => { x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, w, w); x.strokeStyle = 'rgba(80,60,30,.4)'; x.lineWidth = 1.5;
      for (let i = -w; i < w * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + w, w); x.stroke(); x.beginPath(); x.moveTo(i, w); x.lineTo(i + w, 0); x.stroke(); }
      for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(0,0,0,${r(.02, .07)})`; x.fillRect(r(0, w), r(0, w), r(1, 3), r(1, 2)); } });
  // thick curved scroll: centreline from the rail upward, over and in (s = 1 curls to +z, s = -1 to -z); extruded across the bed's width
  function fulcrum(y0, hs, R0, R1, wd, thick, s) { const c = [[0, y0], [0, y0 + hs]]; const cx = R0, cy = y0 + hs, n = 9;
    for (let i = 1; i <= n; i++) { const a = PI - PI * i / n, rr = R0 + (R1 - R0) * i / n * .6; c.push([cx + (rr * Math.cos(a)) * (1) - (R0 - rr) * 0 + (R0 - R0), cy + rr * Math.sin(a)]); }
    const L = [], Rr = []; for (let i = 0; i < c.length; i++) { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, k = thick / 2 * (1 - .35 * i / c.length);
      L.push([c[i][0] + nx * k, c[i][1] + ny * k]); Rr.push([c[i][0] - nx * k, c[i][1] - ny * k]); }
    let pts = L.concat(Rr.reverse()); if (s < 0) pts = pts.map(p => [-p[0], p[1]]).reverse(); const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: wd, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -wd / 2); geo.rotateY(-PI / 2); return geo; }
  let _leg; const legGeo = () => _leg || (_leg = lathe([[0, 0], [.05, 0], [.058, .025], [.044, .05], [.036, .085], [.055, .14], [.062, .18], [.05, .225], [.036, .27], [.052, .31], [.056, .34], [.046, .355], [.046, .43]], 7));
  function bed(g, x, y, z) {
    const bz = bronze(), leather = mat('udStrap', '#6d4526'), wool = mat('udMattress', '#dccaa0', { map: bedTex('quilt') }), lin = mat('udLinen', '#f1ead8', { map: weave('plain') }), blk = mat('udBlanket', '#ffffff', { map: bedTex('blanket') });
    const bolsterM = mat('udBolster', '#b4503a', { map: weave('twill') });
    // turned legs; the head legs rise into finials beside the scroll
    for (const [sx, sz, hh] of [[-1, -1, .93], [1, -1, .93], [-1, 1, .64], [1, 1, .64]]) { add(legGeo(), 'woodLt', x + sx * .55, y, z + sz * 1.05, g);
      cyl(.04, .046, hh - .43, 6, 'woodLt', x + sx * .55, y + .43, z + sz * 1.05, g); cyl(.058, .058, .03, 8, bz, x + sx * .55, y + .31, z + sz * 1.05, g);
      add(new THREE.IcosahedronGeometry(.052, 0), bz, x + sx * .55, y + hh + .03, z + sz * 1.05, g); }
    // frame: side rails and end rails
    for (const sx of [-.55, .55]) box(.07, .13, 2.1, 'woodLt', x + sx, y + .3, z, g); for (const sz of [-1.05, 1.05]) box(1.04, .13, .07, 'woodLt', x, y + .3, z + sz, g);
    // woven leather-strap lattice: straps across (with lashings round the side rails), straps along
    const acc = new Acc(), lc = col('#6d4526'), lc2 = col('#80562f');
    for (let i = 0; i < 12; i++) { const zz = -.96 + i * .174; acc.box(1.0, .012, .045, 0, .405, zz, i % 2 ? lc : lc2); for (const s of [-1, 1]) acc.box(.014, .1, .03, s * .59, .365, zz, col('#b89a68')); }
    for (let i = 0; i < 5; i++) acc.box(.04, .012, 2.0, -.4 + i * .2, .417, 0, i % 2 ? lc2 : lc);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) acc.box(.012, .03, .03, s * .59, .38, -.78 + i * .52, col('#a8875a'));
    add(acc.build(), vcMat(), x, y, z, g);
    // head scroll (fulcrum) with bronze rosettes, and a low foot board with a small scroll
    add(fulcrum(.37, .38, .22, .1, 1.0, .07, 1), 'woodLt', x, y, z - 1.05, g); for (const sx of [-.3, 0, .3]) cyl(.035, .035, .015, 8, bz, x + sx, y + .62, z - 1.015, g).rotation.x = PI / 2;
    add(fulcrum(.37, .13, .09, .045, 1.0, .06, -1), 'woodLt', x, y, z + 1.05, g); cyl(.03, .03, .015, 8, bz, x, y + .5, z + 1.08, g).rotation.x = PI / 2;
    // thin woven wool mattress, linen sheet turned down at the head, patterned blanket folded at the foot, a rolled bolster against the head scroll
    box(1.0, .085, 1.88, wool, x, y + .43, z - .04, g);
    box(1.04, .018, 1.14, lin, x, y + .515, z - .22, g); for (const sx of [-.525, .525]) box(.016, .1, 1.1, lin, x + sx, y + .44, z - .2, g);
    box(1.04, .018, .3, lin, x, y + .535, z - .41, g); add(new THREE.CylinderGeometry(.011, .011, 1.04, 6), lin, x, y + .542, z - .26, g).rotation.z = PI / 2;
    box(1.044, .004, .02, mat('udCuff', '#b0443a'), x, y + .554, z - .53, g);
    const bl = [[.0, .94, .44, .03], [-.006, .9, .43, -.02], [.004, .86, .42, .02]]; let by = y + .533;
    bl.forEach(([dx, w, d, rot], i) => { const m = box(1.02, .034, d, blk, x + dx, by, z + .58 + i * .012, g); m.rotation.y = rot * .3; by += .032; });
    for (let i = 0; i < 14; i++) box(.018, .01, .05, 'straw', x - .47 + i * .072, y + .52, z + .86, g);
    const bo = add(new THREE.CylinderGeometry(.09, .09, .8, 10), bolsterM, x, y + .6, z - .9, g); bo.rotation.z = PI / 2;
    for (const sx of [-1, 1]) { const e = add(new THREE.CylinderGeometry(.05, .09, .07, 10), bolsterM, x + sx * .435, y + .6, z - .9, g); e.rotation.z = sx * -PI / 2; cyl(.052, .052, .014, 8, bz, x + sx * .405, y + .6, z - .9, g).rotation.z = PI / 2; }
    return y + 1.0; }
  return { rng, Acc, cypress, planter, wreath, garland, bolts, bed, spray, poly };
})();
