// ---------- NEW (plan item N1): livestock from one parametric four-legged builder ----------
// upQuad(g, x, y, z, spec, opts) builds an animal standing on the ground at (x, y, z), facing +x before opts.ry, and returns the top height.
// spec (all lengths in metres, at the withers):
//   H withers height, L body length, W body width, belly (0-1 how deep the barrel hangs), neck [length, angle up from level, thickness],
//   head [length, depth, width], muzzle (0-1 how much the nose narrows), leg [thickness at top, at hoof], hoof colour, tail [length, tuft],
//   ears [length, droop 0-1], horns null | { kind: 'ox' | 'goat', len }, hump null | height (camel), mane bool (horse/donkey),
//   coat colour, belly colour, face colour, dewlap (0-1, the ox's throat fold)
// opts: { ry, graze (head down), parent }.  Built from tapered limbs and lofted shells, merged into one mesh per material.
// No R(): nothing random at all, so the same animal is the same everywhere.
const UQ = {
  ox:     { H: 1.35, L: 1.75, W: .62, belly: .55, neck: [.55, .25, .26], head: [.5, .26, .22], muzzle: .55, leg: [.085, .06], hoof: '#2a221e', tail: [.85, .14], ears: [.16, .1], horns: { kind: 'ox', len: .32 }, hump: null, mane: false, coat: '#8a5a34', bellyC: '#a87a54', face: '#7a4e2c', dewlap: .7 },
  goat:   { H: .72, L: .8, W: .3, belly: .4, neck: [.32, .7, .1], head: [.25, .13, .1], muzzle: .6, leg: [.035, .025], hoof: '#2a221e', tail: [.12, 0], ears: [.12, .8], horns: { kind: 'goat', len: .26 }, hump: null, mane: false, coat: '#3a302a', bellyC: '#5a4a3a', face: '#2e2620', dewlap: 0, beard: true },
  camel:  { H: 1.9, L: 1.55, W: .5, belly: .5, neck: [1.0, .35, .15], head: [.45, .2, .16], muzzle: .5, leg: [.08, .055], hoof: '#6a5040', tail: [.5, .1], ears: [.07, 0], horns: null, hump: .45, mane: false, coat: '#c9a06a', bellyC: '#d8b47e', face: '#b89060', dewlap: 0, knobKnees: true },
  horse:  { H: 1.5, L: 1.55, W: .45, belly: .35, neck: [.75, .95, .2], head: [.58, .22, .16], muzzle: .65, leg: [.07, .045], hoof: '#2a221e', tail: [.8, .35], ears: [.13, 0], horns: null, hump: null, mane: true, coat: '#6a3e22', bellyC: '#6a3e22', face: '#5a321a', dewlap: 0, maneC: '#1e1612' },
  donkey: { H: 1.1, L: 1.15, W: .4, belly: .45, neck: [.45, .7, .17], head: [.48, .21, .15], muzzle: .55, leg: [.055, .04], hoof: '#2a221e', tail: [.55, .12], ears: [.3, 0], horns: null, hump: null, mane: true, coat: '#8a8078', bellyC: '#cfc6ba', face: '#a49a90', dewlap: 0, maneC: '#3a3430', cross: true, mealy: true },
};
function upQuad(g, x, y, z, spec, o = {}) {
  const s = typeof spec === 'string' ? UQ[spec] : spec, A = new THREE.Group(); A.position.set(x, y, z); A.rotation.y = o.ry || 0; (o.parent || g).add(A);
  const coat = mat('uqCoat' + s.coat, s.coat, { roughness: .9, flatShading: false }), bel = mat('uqBelly' + s.bellyC, s.bellyC, { roughness: .9, flatShading: false }),
    face = mat('uqFace' + s.face, s.face, { roughness: .9, flatShading: false }), hoof = mat('uqHoof' + s.hoof, s.hoof, { roughness: .8 }), dark = mat('uqDark', '#1a1410'),
    horn = mat('uqHorn', '#d8ccb0', { roughness: .6, flatShading: false }), mane = mat('uqMane' + (s.maneC || s.coat), s.maneC || s.coat, { roughness: 1 });
  const bag = new Map(), put = (m, geo) => { if (!bag.has(m)) bag.set(m, []); bag.get(m).push(geo); }, V = (a, b, c) => [a, b, c];
  const H = s.H, L = s.L, W = s.W, legTop = H * .62, bodyMid = legTop + (H - legTop) * .45, bodyR = (H - legTop) * .62;
  // ---- body: a lofted barrel along x, deeper at the chest, a little higher at the withers and the rump ----
  const rings = []; for (let i = 0; i <= 10; i++) { const t = i / 10, u = t * 2 - 1, taper = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.6)), .5);
    const ry = bodyR * (.8 + .2 * taper) * (1 + s.belly * .25 * Math.max(0, .6 - Math.abs(u + .1))), rz = W / 2 * (.82 + .18 * taper);
    rings.push([u * L / 2, Math.max(.02, ry), Math.max(.02, rz), 0, Math.PI, 0, 0]); }
  { const pos = [], idx = [], seg = 12; for (let j = 0; j < rings.length; j++) { const [cx, ry, rz] = rings[j]; for (let k = 0; k <= seg; k++) { const a = k / seg * Math.PI * 2;
      const sn = Math.sin(a), deep = sn < 0 ? 1 + s.belly * .35 * Math.max(0, 1 - Math.abs(cx / (L / 2)) * 1.2) : 1; pos.push(cx, bodyMid + sn * ry * deep, Math.cos(a) * rz); } }   // the barrel hangs deeper below, smoothly
    for (let j = 0; j < rings.length - 1; j++) for (let k = 0; k < seg; k++) { const a = j * (seg + 1) + k, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, d, b, a, c, d); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setIndex(idx); bg.computeVertexNormals(); put(coat, bg);
    // end caps
    for (const e of [-1, 1]) { const cap = new THREE.SphereGeometry(1, 10, 8); const r0 = rings[e < 0 ? 1 : rings.length - 2]; cap.scale(L * .15, r0[1] * 1.0, r0[2] * 1.0); cap.translate(e * L * .38, bodyMid + r0[1] * .05, 0); put(coat, cap); } }
  if (s.hump) { const hp = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); hp.scale(L * .26, s.hump, W * .36); hp.translate(-L * .02, bodyMid + bodyR * .8, 0); put(coat, hp); }
  // ---- legs: upper and lower segments with a knee, angled like the real thing (hind hocks bend back), hooves ----
  for (const [fx, sd] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const front = fx > 0, lx = fx * L * .34, lz = sd * W * .3, knee = legTop * .48;
    const top = V(lx + (front ? 0 : -.04), bodyMid - bodyR * .2, lz), kn = V(lx + (front ? .02 : -.08 * H), knee, lz), ft = V(lx + (front ? .01 : -.02), .06, lz);
    put(coat, upLimb(top, kn, s.leg[0] * 1.5, s.leg[0], 7, false)); put(s.cross || s.mealy ? bel : coat, upLimb(kn, ft, s.leg[0] * .9, s.leg[1], 7, false));
    if (s.knobKnees) { const k = new THREE.SphereGeometry(s.leg[0] * 1.15, 8, 6); k.translate(...kn); put(coat, k); }
    const hf = new THREE.CylinderGeometry(s.leg[1] * 1.15, s.leg[1] * 1.35, .07, 8); hf.translate(ft[0], .035, ft[2]); put(hoof, hf); }
  // ---- neck and head ----
  const [nl, na, nt] = s.neck, graze = !!o.graze, ang = graze ? -.7 : na, shoulder = V(L * .4, bodyMid + bodyR * .3, 0), poll = V(shoulder[0] + Math.cos(ang) * nl, shoulder[1] + Math.sin(ang) * nl, 0);
  if (s.hump) { // the camel's neck dips forward and low, then rises to the head (an S)
    const m1 = V(shoulder[0] + nl * .45, shoulder[1] - nl * .12, 0), m2 = V(shoulder[0] + nl * .78, shoulder[1] + nl * .1, 0);
    poll[0] = shoulder[0] + nl * .82; poll[1] = shoulder[1] + nl * (graze ? -.5 : .5);
    for (const [a2, b2, r0, r1] of [[shoulder, m1, nt * 1.5, nt * 1.15], [m1, m2, nt * 1.15, nt], [m2, poll, nt, nt * .95]]) { put(coat, upLimb(a2, b2, r0, r1, 9)); const j = new THREE.SphereGeometry(r1, 9, 7); j.translate(...b2); put(coat, j); } }
  else put(coat, upLimb(shoulder, poll, nt * 1.35, nt, 9, false, s.W > .45 ? 1 : .8));

  if (s.dewlap) { const dw = new THREE.SphereGeometry(1, 8, 6); dw.scale(nl * .45, nt * 1.6 * s.dewlap, nt * .35); dw.translate((shoulder[0] + poll[0]) / 2, (shoulder[1] + poll[1]) / 2 - nt * .9, 0); put(coat, dw); }
  const [hl, hd, hw] = s.head, hAng = graze ? -1.35 : ang - 1.15, dir = V(Math.cos(hAng), Math.sin(hAng), 0), nose = V(poll[0] + dir[0] * hl, poll[1] + dir[1] * hl, 0);
  { const hg = new THREE.SphereGeometry(1, 12, 9); hg.scale(hd * .55, hd * .55, hw * .55); hg.translate(...poll); put(face, hg);
    put(face, upLimb(poll, nose, hd * .5, hd * .5 * s.muzzle, 10, true, hw / hd));
    const mz = new THREE.SphereGeometry(hd * .5 * s.muzzle * 1.05, 10, 8); mz.scale(1, 1, hw / hd * 1.1); mz.translate(...nose); put(s.mealy ? bel : face, mz);
    for (const e of [-1, 1]) { const ey = new THREE.SphereGeometry(Math.max(.012, hd * .07), 6, 5); ey.translate(poll[0] + dir[0] * hl * .12, poll[1] + hd * .22, e * hw * .48); put(dark, ey);
      const ns = new THREE.SphereGeometry(Math.max(.008, hd * .05), 5, 4); ns.translate(nose[0] + dir[0] * hd * .2, nose[1] + dir[1] * hd * .2, e * hw * .18 * s.muzzle); put(dark, ns); } }
  // ears: leaves from the back of the head, drooping by spec
  const [el, droop] = s.ears; for (const e of [-1, 1]) { const ear = new THREE.ConeGeometry(Math.max(.02, el * .28), el, 6); ear.scale(1, 1, .45);
    ear.translate(0, el / 2, 0); ear.rotateX(e * (.35 + droop * 1.5)); ear.rotateZ(-.25 - droop * .5); ear.translate(poll[0] - hd * .15, poll[1] + hd * .3, e * hw * .35); put(coat, ear); }
  if (s.horns) { for (const e of [-1, 1]) { const b = V(poll[0] - hd * .1, poll[1] + hd * .42, e * hw * .32);
      const pts = s.horns.kind === 'ox' ? [b, V(b[0] + .02, b[1] + .05, e * (hw * .32 + s.horns.len * .55)), V(b[0] + .06, b[1] + s.horns.len * .55, e * (hw * .32 + s.horns.len * .7))]
        : [b, V(b[0] - s.horns.len * .4, b[1] + s.horns.len * .7, e * (hw * .38)), V(b[0] - s.horns.len * .85, b[1] + s.horns.len * .75, e * (hw * .5))];
      put(horn, upLimb(pts[0], pts[1], hd * .1, hd * .08, 6, false)); put(horn, upLimb(pts[1], pts[2], hd * .08, .004, 6, true)); } }
  if (s.beard) { const bd = new THREE.ConeGeometry(hd * .18, hd * .9, 5); bd.rotateZ(Math.PI); bd.translate(nose[0] - dir[0] * hl * .25, nose[1] - hd * .7, 0); put(mane, bd); }
  if (s.mane) { // a crest of hair along the top of the neck, narrow side to side, a forelock between the ears
    const up = nt * (s.cross ? .55 : .8), a2 = V(shoulder[0] - .04, shoulder[1] + nt * 1.1, 0), b2 = V(poll[0] - hd * .1, poll[1] + hd * .45, 0);
    put(mane, upLimb([a2[0], a2[1] + up * .3, 0], [b2[0], b2[1] + up * .3, 0], up * .7, up * .5, 6, true, .25));
    const fl = new THREE.ConeGeometry(hd * .12, hd * .5, 5); fl.rotateZ(Math.PI * .85); fl.translate(poll[0] + hd * .05, poll[1] + hd * .3, 0); put(mane, fl); }
  if (s.cross) { const c1 = new THREE.BoxGeometry(L * .5, .012, .05); c1.translate(-.05, bodyMid + bodyR * 1.0, 0); put(mat('uqCross', '#4a4440'), c1); }   // the donkey's dark dorsal stripe
  // tail: hangs from the rump, with a tuft
  { const [tl, tf] = s.tail, root = V(-L * .48, bodyMid + bodyR * .55, 0), tip = V(-L * .55, root[1] - tl, 0);
    if (s.mane && !s.cross) { // the horse's long hair tail, falling in a soft curve
      const m1 = V(root[0] - .12, root[1] - tl * .25, 0), m2 = V(root[0] - .16, root[1] - tl * .65, 0), t2 = V(root[0] - .12, root[1] - tl, 0);
      put(mane, upLimb(root, m1, .05, .07, 7)); put(mane, upLimb(m1, m2, .07, .065, 7)); put(mane, upLimb(m2, t2, .065, .02, 7, true)); }
    else { put(coat, upLimb(root, tip, .025, .015, 5, false)); if (tf) { const tu = new THREE.SphereGeometry(1, 7, 6); tu.scale(tf * .22, tf * .5, tf * .22); tu.translate(tip[0], tip[1] - tf * .3, 0); put(s.mane ? mane : mat('uqTuft' + s.face, s.face), tu); } } }
  for (const [m, list] of bag) { const geo = upMerge(list); geo.computeVertexNormals(); const mesh = new THREE.Mesh(geo, m); mesh.castShadow = mesh.receiveShadow = true; A.add(mesh); }
  return y + Math.max(H + (s.hump || 0) + bodyR * .2, poll[1] + hd * .6 + (s.horns ? s.horns.len * .6 : 0) + (s.ears[1] < .3 ? s.ears[0] : 0)); }
{ const T = (id, label, kind, tags, fn) => defObject(id, fn, { label, origin: 'plan N1', tags, kind });
  T('ox', 'Ox', 'animal', ['farm', 'sacrifice', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'ox', { ry: .3 }));
  T('goat', 'Goat', 'animal', ['farm', 'livestock', 'sacrifice'], (g, x, y, z) => upQuad(g, x, y, z, 'goat', { ry: .3 }));
  T('camel', 'Camel', 'animal', ['travel', 'livestock', 'trade'], (g, x, y, z) => upQuad(g, x, y, z, 'camel', { ry: .3 }));
  T('horse', 'Horse', 'animal', ['travel', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'horse', { ry: .3 }));
  T('grey-donkey', 'Grey donkey', 'animal', ['travel', 'farm', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'donkey', { ry: .3 }));
  T('ox-grazing', 'Ox grazing', 'animal', ['farm', 'livestock'], (g, x, y, z) => upQuad(g, x, y, z, 'ox', { ry: .3, graze: true }));
  T('goats-grazing', 'Two goats grazing', 'animal', ['farm', 'livestock'], (g, x, y, z) => { upQuad(g, x - .4, y, z, 'goat', { ry: .4, graze: true }); return upQuad(g, x + .5, y, z + .3, { ...UQ.goat, coat: '#e8dcc4', bellyC: '#f0e6d4', face: '#d8ccb4' }, { ry: 2.4 }); }); }
