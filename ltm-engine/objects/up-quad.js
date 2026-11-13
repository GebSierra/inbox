// ---------- NEW (plan item N1): livestock, refined ----------
// upQuad(g, x, y, z, kind, opts) builds a standing animal on the ground at (x, y, z), facing +x before opts.ry, and returns its top height.
//   kind: 'horse' | 'donkey' | 'ox' | 'goat' | 'camel', or a template object (see UQ_T)   opts: { ry, graze, coat, parent }
// Every body part is ONE smooth tube that follows a side-view path through the animal's anatomy, with its own depth and width at each
// point, so shoulders, withers, back, hips and jaw flow into each other instead of being stuck-on parts:
//   body   (rump → hips → loin → barrel → girth → withers → chest)
//   neck+head in one piece (neck base → crest → poll → forehead → face → muzzle), so the head grows out of the neck
//   each leg (top inside the body → elbow/stifle → knee/hock → fetlock → pastern → hoof), the hoof in its own material
//   tail
// Ears, eyes, nostrils, horns, beard, mane, hump and the donkey's cross are added on the finished shapes. All coordinates below are
// in metres for an animal of the template's size; nothing random is drawn.
const UQ_T = {
  horse: { col: ['#7a4426', '#5e3218', '#2a1c14'], hoof: '#2a221e', mane: '#1e1612', muzzle: '#4a2a1a', H: 1.5,
    body: { p: [[-.82, 1.12], [-.66, 1.2], [-.38, 1.2], [0, 1.12], [.32, 1.14], [.58, 1.2], [.76, 1.1], [.84, 1.0]], h: [.1, .25, .3, .34, .35, .32, .24, .1], w: [.08, .23, .25, .27, .27, .23, .17, .07] },
    neck: { p: [[.56, 1.16], [.74, 1.36], [.88, 1.58], [.98, 1.76], [1.07, 1.74], [1.17, 1.57], [1.26, 1.41], [1.31, 1.33], [1.335, 1.29]],
            h: [.3, .24, .17, .13, .15, .12, .095, .085, .06], w: [.2, .14, .1, .09, .115, .1, .08, .075, .05], poll: 3, eye: 4, nose: 7 },
    legF: { x: .58, z: .15, p: [[.58, 1.02], [.55, .8], [.56, .46], [.57, .16], [.6, .08], [.62, 0]], r: [.1, .075, .05, .048, .042, .055] },
    legH: { x: -.56, z: .15, p: [[-.6, 1.08], [-.45, .8], [-.7, .52], [-.64, .16], [-.61, .08], [-.6, 0]], r: [.16, .1, .055, .048, .042, .055] },
    tail: { p: [[-.82, 1.22], [-.94, 1.06], [-.98, .8], [-.95, .58]], r: [.05, .08, .07, .02], hair: true },
    ears: { len: .14, w: .045, tilt: .15, droop: 0 }, crest: .07 },
  donkey: { col: ['#8c8278', '#c9c0b4', '#3a3430'], hoof: '#2a221e', mane: '#3a3430', muzzle: '#d8d0c4', H: 1.1, cross: true, mealy: true,
    body: { p: [[-.6, .82], [-.48, .9], [-.26, .9], [0, .84], [.22, .85], [.4, .9], [.52, .82], [.58, .74]], h: [.08, .2, .24, .27, .27, .25, .19, .08], w: [.07, .19, .21, .23, .23, .19, .14, .06] },
    neck: { p: [[.4, .87], [.54, 1.0], [.64, 1.14], [.7, 1.26], [.78, 1.25], [.87, 1.1], [.94, .98], [.98, .92], [1.0, .9]],
            h: [.24, .2, .15, .13, .15, .125, .1, .095, .065], w: [.17, .12, .095, .095, .115, .1, .085, .08, .05], poll: 3, eye: 4, nose: 7 },
    legF: { x: .42, z: .12, p: [[.42, .74], [.4, .58], [.41, .33], [.42, .12], [.44, .06], [.45, 0]], r: [.08, .06, .04, .038, .034, .042] },
    legH: { x: -.42, z: .12, p: [[-.45, .8], [-.33, .58], [-.52, .37], [-.47, .12], [-.45, .06], [-.44, 0]], r: [.12, .08, .042, .038, .034, .042] },
    tail: { p: [[-.6, .9], [-.66, .76], [-.68, .56], [-.67, .44]], r: [.03, .025, .02, .015], tuft: .12 },
    ears: { len: .3, w: .065, tilt: .1, droop: 0 }, crest: .045 },
  ox: { col: ['#8a5530', '#a8774e', '#3a2618'], hoof: '#2a221e', muzzle: '#3a3028', H: 1.35, horns: 'ox', dewlap: true,
    body: { p: [[-.9, 1.02], [-.74, 1.12], [-.42, 1.1], [0, 1.02], [.36, 1.04], [.62, 1.12], [.82, 1.02], [.9, .9]], h: [.12, .28, .34, .4, .42, .38, .3, .12], w: [.12, .32, .34, .36, .36, .31, .24, .1] },
    neck: { p: [[.6, 1.04], [.82, 1.1], [.98, 1.12], [1.08, 1.13], [1.14, 1.08], [1.22, .94], [1.3, .8], [1.34, .74], [1.36, .71]],
            h: [.36, .3, .24, .18, .17, .15, .12, .11, .06], w: [.27, .21, .17, .15, .16, .14, .12, .12, .05], poll: 3, eye: 4, nose: 7 },
    legF: { x: .6, z: .2, p: [[.6, .82], [.57, .62], [.58, .36], [.59, .13], [.62, .06], [.64, 0]], r: [.13, .1, .065, .06, .055, .065] },
    legH: { x: -.62, z: .2, p: [[-.66, .92], [-.52, .64], [-.74, .42], [-.68, .13], [-.65, .06], [-.64, 0]], r: [.2, .12, .068, .06, .055, .065] },
    tail: { p: [[-.9, 1.12], [-.96, .9], [-.97, .6], [-.96, .38]], r: [.035, .025, .02, .015], tuft: .16 },
    ears: { len: .16, w: .06, tilt: 1.35, droop: .15 } },
  goat: { col: ['#3a2e26', '#4e3e32', '#1e1612'], hoof: '#2a221e', muzzle: '#2a201a', H: .72, horns: 'goat', beard: true,
    body: { p: [[-.4, .54], [-.32, .6], [-.16, .6], [0, .56], [.16, .57], [.3, .62], [.38, .56], [.42, .5]], h: [.05, .12, .14, .16, .17, .15, .11, .05], w: [.05, .12, .13, .15, .15, .12, .09, .04] },
    neck: { p: [[.28, .6], [.36, .7], [.42, .8], [.45, .88], [.51, .87], [.56, .8], [.6, .74], [.625, .705], [.64, .69]],
            h: [.13, .1, .075, .065, .075, .06, .045, .038, .025], w: [.09, .065, .05, .05, .06, .05, .038, .032, .02], poll: 3, eye: 4, nose: 7 },
    legF: { x: .3, z: .07, p: [[.3, .48], [.28, .36], [.29, .2], [.3, .07], [.31, .035], [.32, 0]], r: [.045, .032, .02, .019, .017, .022] },
    legH: { x: -.3, z: .07, p: [[-.32, .52], [-.24, .36], [-.36, .24], [-.33, .07], [-.32, .035], [-.31, 0]], r: [.07, .045, .022, .019, .017, .022] },
    tail: { p: [[-.4, .64], [-.45, .7], [-.47, .74]], r: [.03, .03, .01] },
    ears: { len: .12, w: .035, tilt: 1.2, droop: .5 } },
  camel: { col: ['#c49a62', '#d8b27c', '#6a5038'], hoof: '#6a5040', muzzle: '#a88458', H: 1.9, hump: true, pads: true,
    body: { p: [[-.72, 1.4], [-.56, 1.5], [-.3, 1.52], [0, 1.48], [.3, 1.5], [.52, 1.5], [.68, 1.38], [.74, 1.26]], h: [.1, .24, .28, .32, .34, .32, .26, .1], w: [.08, .21, .23, .25, .25, .22, .17, .07] },
    neck: { p: [[.55, 1.4], [.8, 1.2], [1.02, 1.12], [1.2, 1.24], [1.32, 1.5], [1.38, 1.76], [1.42, 1.9], [1.48, 1.94], [1.62, 1.86], [1.72, 1.78], [1.76, 1.75]],
            h: [.28, .17, .13, .12, .12, .11, .1, .11, .085, .065, .04], w: [.2, .12, .09, .085, .085, .08, .08, .1, .08, .065, .03], poll: 6, eye: 7, nose: 9 },
    legF: { x: .5, z: .16, p: [[.52, 1.24], [.48, .98], [.5, .58], [.52, .2], [.56, .07], [.6, 0]], r: [.11, .075, .055, .045, .05, .09] },
    legH: { x: -.5, z: .16, p: [[-.54, 1.3], [-.36, .96], [-.6, .6], [-.55, .2], [-.52, .07], [-.5, 0]], r: [.15, .08, .055, .045, .05, .09] },
    tail: { p: [[-.72, 1.52], [-.8, 1.3], [-.82, 1.04], [-.8, .9]], r: [.03, .025, .02, .015], tuft: .12 },
    ears: { len: .07, w: .035, tilt: .5, droop: .2 } },
};
// a tube along a side-view path [[x, y], ...] (smoothed with Catmull-Rom), at depth z0; h = half its depth (in the plane of the path),
// w = half its width (along z). Rings are slightly squarer than ellipses (sq), and below the path line each ring can hang deeper (deep).
// Returns { geo, at(i) } where at(i) gives the smoothed point, tangent and normal nearest to control point i.
function uqTube(P, h, w, o = {}) {
  const seg = o.seg || 14, per = o.per || 5, z0 = o.z || 0, deep = o.deep || 0, sq = o.sq ?? .85, n = P.length;
  const cr = (a, b, c, d, t) => { const t2 = t * t, t3 = t2 * t; return .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); };
  const pts = [], hs = [], ws = [], ctl = [];
  for (let i = 0; i < n - 1; i++) { const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n - 1, i + 2)]; ctl.push(pts.length);
    for (let k = 0; k < per; k++) { const t = k / per, s = t * t * (3 - 2 * t); pts.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); hs.push(h[i] + (h[i + 1] - h[i]) * s); ws.push(w[i] + (w[i + 1] - w[i]) * s); } }
  ctl.push(pts.length); pts.push(P[n - 1]); hs.push(h[n - 1]); ws.push(w[n - 1]);
  const N = pts.length, pos = [], uv = [], idx = [], tan = [], nor = [];
  for (let j = 0; j < N; j++) { const p0 = pts[Math.max(0, j - 1)], p1 = pts[Math.min(N - 1, j + 1)]; let tx = p1[0] - p0[0], ty = p1[1] - p0[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx; tan.push([tx, ty]); nor.push([nx, ny]);
    for (let k = 0; k <= seg; k++) { const a = k / seg * Math.PI * 2, s = Math.sin(a), c = Math.cos(a), ss = Math.sign(s) * Math.pow(Math.abs(s), sq), cc = Math.sign(c) * Math.pow(Math.abs(c), sq);
      const hh = hs[j] * (s < 0 ? 1 + deep : 1); pos.push(pts[j][0] + nx * hh * ss, pts[j][1] + ny * hh * ss, z0 + ws[j] * cc); uv.push(k / seg, j / (N - 1)); } }
  for (let j = 0; j < N - 1; j++) for (let k = 0; k < seg; k++) { const a = j * (seg + 1) + k, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, d, b, a, c, d); }
  // closing caps: a fan to each end's centre
  if (o.caps !== false) for (const [j, flip] of [[0, true], [N - 1, false]]) { const r0 = pos.length / 3;
    for (let k = 0; k <= seg; k++) { const q = (j * (seg + 1) + k) * 3; pos.push(pos[q], pos[q + 1], pos[q + 2]); uv.push(.5, j ? 1 : 0); }
    const ci = pos.length / 3; pos.push(pts[j][0], pts[j][1], z0); uv.push(.5, j ? 1 : 0);
    for (let k = 0; k < seg; k++) { const a = r0 + k, b = a + 1; if (flip) idx.push(ci, b, a); else idx.push(ci, a, b); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return { geo, at: i => { const j = ctl[i]; return { p: pts[j], t: tan[j], n: nor[j], h: hs[j], w: ws[j] }; } }; }
// a soft coat texture: short directional hairs and gentle mottling, tinted by the material colour
const uqHair = () => upTex('uqHair', 128, 128, (c, w, h, r) => { c.fillStyle = '#d8d8d8'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${.04 + r() * .05})`; c.beginPath(); c.ellipse(r() * w, r() * h, 8 + r() * 24, 6 + r() * 16, r() * 3, 0, 7); c.fill(); }
  for (let i = 0; i < 900; i++) { c.strokeStyle = `rgba(${r() < .5 ? '255,255,255' : '40,30,20'},${.05 + r() * .08})`; c.lineWidth = 1; const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y + 3 + r() * 3); c.stroke(); } });
function upQuad(g, x, y, z, kind, o = {}) {
  const T = typeof kind === 'string' ? UQ_T[kind] : kind, col = o.coat || T.col, A = new THREE.Group(); A.position.set(x, y, z); A.rotation.y = o.ry || 0; (o.parent || g).add(A);
  const hairMap = uqHair(), key = col.join('');
  const coat = mat('uqC' + key, col[0], { roughness: .92, flatShading: false, map: hairMap }), pale = mat('uqP' + key, col[1], { roughness: .92, flatShading: false, map: hairMap }),
    dark = mat('uqD' + key, col[2], { roughness: .85, flatShading: false }), hoof = mat('uqHoof' + T.hoof, T.hoof, { roughness: .6, flatShading: false }),
    muz = mat('uqM' + T.muzzle, T.muzzle, { roughness: .7, flatShading: false }), eyeM = mat('uqEye', '#120c08', { roughness: .2, flatShading: false }),
    horn = mat('uqHorn', '#d9ccb0', { roughness: .5, flatShading: false }), hair = mat('uqMane' + (T.mane || col[2]), T.mane || col[2], { roughness: 1, flatShading: false });
  const bag = new Map(), put = (m, geo) => { if (!bag.has(m)) bag.set(m, []); bag.get(m).push(geo); };
  // ---- body ----
  const B = T.body; put(coat, uqTube(B.p, B.h, B.w, { seg: 14, per: 4, deep: .12, sq: .8 }).geo);
  if (T.hump) { const hp = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55); hp.scale(.36, .42, .2); hp.translate(.02, 1.66, 0); put(coat, hp); }
  // ---- neck and head in one tube; grazing swings it down about the neck's base until the muzzle nears the ground ----
  let NP = T.neck.p.map(p => p.slice());
  if (o.graze) { const [bx, by] = NP[0]; let ang = 0; const R2 = ([px, py], [cx, cy], aa) => { const dx = px - cx, dy = py - cy; return [cx + dx * Math.cos(aa) - dy * Math.sin(aa), cy + dx * Math.sin(aa) + dy * Math.cos(aa)]; }, pi = T.neck.poll;
      // the neck swings down about its base; the head then turns back up a little about the poll, so the face points down and forward
      const rot = a => { const q = T.neck.p.map((pt, i) => i ? R2(pt, [bx, by], a) : pt.slice()); for (let i = pi + 1; i < q.length; i++) q[i] = R2(q[i], q[pi], -a * .45); return q; };
    for (ang = 0; ang > -2.2; ang -= .05) { NP = rot(ang); if (NP[NP.length - 1][1] < .08 + T.neck.h[T.neck.h.length - 1]) break; } }
  const NK = uqTube(NP, T.neck.h, T.neck.w, { seg: 12, per: 4, sq: .9 }); put(coat, NK.geo);
  // jowl: the broad flat cheek behind and below the eye that makes a head wedge-shaped (strongest on horses and donkeys)
  { const e = NK.at(T.neck.eye), k = T.crest ? 1.15 : .95, j = new THREE.SphereGeometry(1, 12, 9); j.scale(e.h * 1.05 * k, e.h * 1.0 * k, e.w * 1.06);
    j.rotateZ(Math.atan2(e.t[1], e.t[0])); j.translate(e.p[0] - e.n[0] * e.h * .38 - e.t[0] * e.h * .3, e.p[1] - e.n[1] * e.h * .38 - e.t[1] * e.h * .3, 0); put(coat, j); }
  // muzzle: the last stretch of the face in its own colour, a soft rounded nose with nostrils
  { const nz = NK.at(T.neck.nose), tip = NK.at(T.neck.p.length - 1), m = new THREE.SphereGeometry(1, 12, 9); m.scale(Math.hypot(tip.p[0] - nz.p[0], tip.p[1] - nz.p[1]) * 1.1 + nz.h * .25, nz.h * 1.1, nz.w * 1.08);
    m.rotateZ(Math.atan2(tip.p[1] - nz.p[1], tip.p[0] - nz.p[0])); m.translate((nz.p[0] + tip.p[0]) / 2, (nz.p[1] + tip.p[1]) / 2, 0); put(muz, m);
    for (const s of [-1, 1]) { const ns = new THREE.SphereGeometry(nz.w * .22, 6, 5); ns.scale(1, 1.4, .6); ns.translate(tip.p[0] - tip.t[0] * nz.w * .3 + tip.n[0] * nz.h * .2, tip.p[1] - tip.t[1] * nz.w * .3 + tip.n[1] * nz.h * .2, s * nz.w * .55); put(eyeM, ns); } }
  // eyes: on the sides of the head, set a little high, with a lid of coat
  { const e = NK.at(T.neck.eye); for (const s of [-1, 1]) { const ex = e.p[0] + e.n[0] * e.h * .35, ey = e.p[1] + e.n[1] * e.h * .35, ez = s * e.w * .9, r = Math.max(.012, e.h * .2);
      const eb = new THREE.SphereGeometry(r, 10, 8); eb.translate(ex, ey, ez); put(eyeM, eb); const lid = new THREE.SphereGeometry(r * 1.25, 10, 6, 0, Math.PI * 2, 0, Math.PI * .45); lid.translate(ex, ey + r * .1, ez); put(coat, lid); } }
  // ears: hollow leaves from the poll, pointing up and back (tilt) and out, drooping by template
  { const pl = NK.at(T.neck.poll), E = T.ears; for (const s of [-1, 1]) { const ear = new THREE.LatheGeometry([[0, 0], [E.w * .8, E.len * .12], [E.w, E.len * .4], [E.w * .7, E.len * .75], [0, E.len]].map(([u, v]) => new THREE.Vector2(u, v)), 10); ear.scale(1, 1, .4);
      ear.rotateX(s * (E.tilt * .6 + E.droop * 1.2)); ear.rotateZ(.35 + E.droop * .6); ear.translate(pl.p[0] - pl.t[0] * pl.h * .3 + pl.n[0] * pl.h * .55, pl.p[1] - pl.t[1] * pl.h * .3 + pl.n[1] * pl.h * .55, s * pl.w * .55); put(coat, ear); } }
  // horns
  if (T.horns) { const pl = NK.at(T.neck.poll), bx = pl.p[0] + pl.n[0] * pl.h * .7, by = pl.p[1] + pl.n[1] * pl.h * .7;
    for (const s of [-1, 1]) { const path = T.horns === 'ox'
        ? [[bx, by, s * pl.w * .7], [bx + .02, by + .04, s * (pl.w + .12)], [bx + .06, by + .14, s * (pl.w + .22)], [bx + .02, by + .26, s * (pl.w + .25)]]   // out, then up and forward: the lyre of the region's cattle
        : [[bx, by, s * pl.w * .4], [bx - .05, by + .1, s * pl.w * .55], [bx - .15, by + .17, s * pl.w * .75], [bx - .25, by + .15, s * pl.w * .9]];   // the goat's scimitar, sweeping back
      const c = new THREE.CatmullRomCurve3(path.map(p => new THREE.Vector3(...p))), tg = new THREE.TubeGeometry(c, 12, 1, 7, false), q = tg.attributes.position, base = T.horns === 'ox' ? .045 : .022;
      // taper the tube from base to tip
      for (let i = 0; i < q.count; i++) { const t = Math.floor(i / 8) / 12, pt = c.getPoint(Math.min(1, t)), r = base * (1 - t * .85); q.setXYZ(i, pt.x + (q.getX(i) - pt.x) * r, pt.y + (q.getY(i) - pt.y) * r, pt.z + (q.getZ(i) - pt.z) * r); }
      tg.computeVertexNormals(); put(horn, tg); } }
  if (T.beard) { const nz = NK.at(T.neck.nose), bd = new THREE.ConeGeometry(nz.w * .5, nz.h * 2.6, 6); bd.rotateZ(Math.PI); bd.translate(nz.p[0] - .02, nz.p[1] - nz.h * 1.8, 0); put(dark, bd); }
  if (T.dewlap) { const a = NK.at(1), b = NK.at(3), dl = new THREE.SphereGeometry(1, 12, 8); dl.scale(Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]) * .55, .16, .05); dl.translate((a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2 - a.h * .75, 0); put(coat, dl); }
  // mane: a crest of hair along the top of the neck (narrow), and a forelock
  if (T.crest) { const top = [], th = [], tw = []; for (let i = 0; i <= T.neck.poll; i++) { const a = NK.at(i); top.push([a.p[0] - a.n[0] * -a.h * .9, a.p[1] + a.n[1] * a.h * .9]); th.push(T.crest * (i === 0 ? .5 : 1)); tw.push(T.crest * .35); }
    put(hair, uqTube(top, th, tw, { seg: 8, per: 4, sq: 1 }).geo); }
  // ---- legs: coat down to the fetlock, hoof below; mealy (pale) lower legs on the donkey; camel's knee callus and broad pads ----
  for (const [L, front] of [[T.legF, true], [T.legH, false]]) for (const s of [-1, 1]) {
    const p = L.p, r = L.r, z0 = s * L.z;
    { const [ax, ay] = p[0], [bx, by] = p[1], m = new THREE.SphereGeometry(1, 10, 8), len = Math.hypot(bx - ax, by - ay);   // shoulder / thigh muscle, blending into the body
      const t = .3; m.scale(r[0] * (front ? .7 : .72), len * .32 + r[1] * .4, r[0] * .42); m.rotateZ(Math.atan2(by - ay, bx - ax) + Math.PI / 2);   // sits high, mostly inside the body, shaping the flank above the leg
      m.translate(ax + (bx - ax) * t, ay + (by - ay) * t, z0 * .55); put(coat, m); }
    { // the upper leg is broad front-to-back but flat side-to-side where it leaves the body (a thigh, not a balloon)
      const rr = front ? [r[1] * 1.15, r[1], r[2], r[3]] : [r[0] * .8, r[1] * 1.1, r[2], r[3]], ww = front ? rr.map(v => v * .85) : [rr[0] * .55, rr[1] * .65, rr[2] * .85, rr[3] * .85];
      put(coat, uqTube(p.slice(0, 4), rr, ww, { z: z0, seg: 8, per: 4, sq: .95 }).geo); }   // from inside the body, slim enough at the top not to fold
    put(T.mealy ? pale : coat, uqTube(p.slice(2, 5), r.slice(2, 5), r.slice(2, 5).map(v => v * .88), { z: z0, seg: 8, per: 2, sq: .95 }).geo);
    if (T.pads) { const pd = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); pd.scale(r[5] * 1.2, .06, r[5]); pd.translate(p[5][0], 0, z0); put(hoof, pd);
      if (front) { const cl = new THREE.SphereGeometry(r[2] * 1.15, 8, 6); cl.translate(p[2][0] + .02, p[2][1], z0); put(dark, cl); } }
    else put(hoof, uqTube([p[4], [p[5][0], .005]], [r[4] * 1.05, r[5]], [r[4] * 1.05, r[5]], { z: z0, seg: 8, per: 2, sq: .9 }).geo); }
  // ---- tail ----
  { const tl = T.tail, tt = uqTube(tl.p, tl.r, tl.r, { seg: 8, per: 4, sq: 1 }); put(tl.hair ? hair : coat, tt.geo);
    if (tl.tuft) { const end = tl.p[tl.p.length - 1], tu = new THREE.SphereGeometry(1, 8, 7); tu.scale(tl.tuft * .22, tl.tuft * .5, tl.tuft * .22); tu.translate(end[0], end[1] - tl.tuft * .35, 0); put(dark, tu); } }
  let top = 0; for (const [m, list] of bag) { const geo = mergeGeometries(list.map(q => { const c = q.index ? q.toNonIndexed() : q; for (const k of Object.keys(c.attributes)) if (!['position', 'normal', 'uv'].includes(k)) c.deleteAttribute(k);
      if (!c.attributes.uv) c.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; }), false);
    geo.computeBoundingBox(); top = Math.max(top, geo.boundingBox.max.y); const mesh = new THREE.Mesh(geo, m); mesh.castShadow = mesh.receiveShadow = true; A.add(mesh); }
  return y + top; }
{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'plan N1', tags, kind: 'animal' });
  T('ox', 'Ox', ['farm', 'sacrifice', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'ox', { ry: .3 }));
  T('goat', 'Goat', ['farm', 'livestock', 'sacrifice'], (g, x, y, z) => upQuad(g, x, y, z, 'goat', { ry: .3 }));
  T('camel', 'Camel', ['travel', 'livestock', 'trade'], (g, x, y, z) => upQuad(g, x, y, z, 'camel', { ry: .3 }));
  T('horse', 'Horse', ['travel', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'horse', { ry: .3 }));
  T('grey-donkey', 'Grey donkey', ['travel', 'farm', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'donkey', { ry: .3 }));
  T('ox-grazing', 'Ox grazing', ['farm', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'ox', { ry: .3, graze: true }));
  T('goats-grazing', 'Two goats grazing', ['farm', 'livestock'], (g, x, y, z) => { upQuad(g, x - .4, y, z, 'goat', { ry: .4, graze: true });
    return upQuad(g, x + .5, y, z + .3, 'goat', { ry: 2.4, coat: ['#e6dac4', '#f0e8d8', '#b8ab94'] }); }); }
