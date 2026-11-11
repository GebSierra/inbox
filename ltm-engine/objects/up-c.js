// ---------- BATCH C: helpers + better townspeople, writing desk, wax tablets ----------
// Helpers (function declarations, so engine/people.js can use them whichever order the parts are listed in):
//   upLimb(a, b, r0, r1, seg, capped, flat, normal)  tapered limb between two points
//   upLoft(rings, seg, opt)                            lofted shell from elliptical rings [y, rx, rz, cz, w, f, tilt]
//   upBag()                                            collects geometry per material and merges it into one mesh per material
//   upPerson(g, tunic, opts)                           the townsperson builder behind person()
// None of this calls R(): variation comes from the tunic colour string and the opts.
const UPV = (x, y, z) => new THREE.Vector3(x, y, z);
function upLimb(a, b, r0, r1, seg = 6, capped = false, flat = 1, normal = null) {
  const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b), d = q.clone().sub(p), L = Math.max(d.length(), 1e-4), yA = d.clone().divideScalar(L);
  const geo = new THREE.CylinderGeometry(r1, r0, L, seg, 1, !capped); if (flat !== 1) geo.scale(1, 1, flat);
  let zA = normal ? new THREE.Vector3(...normal) : Math.abs(yA.z) < .9 ? UPV(0, 0, 1) : UPV(1, 0, 0);
  zA.sub(yA.clone().multiplyScalar(zA.dot(yA))); if (zA.lengthSq() < 1e-6) zA = Math.abs(yA.x) < .9 ? UPV(1, 0, 0) : UPV(0, 0, 1); zA.normalize();
  const xA = new THREE.Vector3().crossVectors(yA, zA).normalize(); zA.crossVectors(xA, yA);
  geo.applyMatrix4(new THREE.Matrix4().makeBasis(xA, yA, zA)); geo.translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2); return geo;
}
// rings: [y, rx, rz, cz = 0, w = PI, f = 0, tilt = 0]; w = half arc around opt.center (PI = the back, 0 = the front); f = fold amplitude; tilt raises the front edge
function upLoft(rings, seg = 8, o = {}) {
  const rs = rings.slice().sort((a, b) => a[0] - b[0]), n = rs.length, ctr = o.center ?? Math.PI, fr = o.freq ?? 5, ph = o.phase ?? 0, pos = [], uv = [], idx = [];
  for (let j = 0; j < n; j++) { const [y, rx, rz, cz = 0, w = Math.PI, f = 0, tl = 0] = rs[j];
    for (let k = 0; k <= seg; k++) { const t = ctr + (k / seg * 2 - 1) * w, m = 1 + f * Math.sin(fr * t + ph + j * .6);
      pos.push((o.ox || 0) + rx * m * Math.sin(t), (o.oy || 0) + y + tl * Math.cos(t), (o.oz || 0) + cz + rz * m * Math.cos(t)); uv.push(k / seg, j / Math.max(1, n - 1)); } }
  for (let j = 0; j < n - 1; j++) for (let k = 0; k < seg; k++) { const a = j * (seg + 1) + k, b = a + 1, c = a + seg + 1, d = c + 1; if (o.flip) idx.push(a, d, b, a, c, d); else idx.push(a, b, d, a, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function upSample(rings, y) { const rs = rings.slice().sort((a, b) => a[0] - b[0]); if (y <= rs[0][0]) return rs[0]; if (y >= rs[rs.length - 1][0]) return rs[rs.length - 1];
  for (let i = 0; i < rs.length - 1; i++) if (y <= rs[i + 1][0]) { const t = (y - rs[i][0]) / (rs[i + 1][0] - rs[i][0]); return rs[i].map((v, k) => v + ((rs[i + 1][k] ?? v) - v) * t); } }
function upMerge(list) {
  let n = 0; const gs = list.map(g => { const q = g.index ? g.toNonIndexed() : g; if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return q; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  for (const q of gs) { P.set(q.attributes.position.array, o * 3); N.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) U.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.BufferAttribute(U, 2)); return g;
}
function upBag() { const B = new Map(); let tris = 0;
  const bag = { put(m, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { if (rx || ry || rz) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'))); if (x || y || z) geo.translate(x, y, z);
      if (!B.has(m)) B.set(m, []); B.get(m).push(geo); tris += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3; return geo; },
    box(m, w, h, d, x, y, z, rx, ry, rz) { return bag.put(m, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz); },
    into(other, fn) { for (const [m, l] of B) for (const geo of l) other.put(m, fn(geo)); B.clear(); },
    flush(parent) { for (const [m, l] of B) add(upMerge(l), m, 0, 0, 0, parent); B.clear(); return tris; } };
  return bag; }

function upPerson(g, tunic, opts) {
  const sk = opts.skin || 0, skinM = mat('skin' + sk, ['#c08a62', '#a8714c', '#d9a57c'][sk]), tm = mat('tunic' + tunic, tunic, { map: TEX.cloth });
  let h = 0; for (let i = 0; i < tunic.length; i++) h += tunic.charCodeAt(i);
  const who = opts.who || (tunic === '#7a3b6a' ? 'purple' : tunic === '#5a4a6a' ? 'plum' : ''), fem = opts.fem ?? !!(opts.veil || opts.carry),
    hairIdx = opts.hair || 0, hairM = mat('hair' + hairIdx, ['#3a2a1e', '#1e1612', '#6a4a2a', '#c8c0b0'][hairIdx]);
  const col = new THREE.Color(tunic), dk = '#' + col.clone().multiplyScalar(.55).getHexString();
  const trimM = who === 'purple' ? mat('upTrimGold', '#c9a24a') : who === 'plum' ? mat('upTrimCream', '#e2d6b8') : mat('uptrim' + tunic, dk);
  const leather = mat('upLeather', '#5a3a22'), sole = mat('upSole', '#3a2616'), brass = mat('upBrass', '#b8893a', { metalness: .5, roughness: .4 }), eyeM = mat('upEye', '#1c1410'), lipM = mat('upLip', '#8a4a3a');
  const bw = who === 'purple' ? 1.14 : who === 'plum' ? .88 : fem ? .84 : [.96, 1, 1.05][h % 3], belly = who === 'purple' ? 1.5 : who === 'plum' ? .9 : 1;
  const hem = fem ? .1 : who === 'plum' ? .47 : .52, B = upBag(), S = (a, b) => Math.sqrt(a * b);
  // ---- tunic: rings [y, rx, rz, cz, w, f] (top to bottom), folds grow towards the hem
  const T = fem ? [[1.31, .06, .055, 0, Math.PI, 0], [1.285, .135, .08, 0, Math.PI, 0], [1.22, .15 * bw / .84 * .84, .09, 0, Math.PI, 0], [1.14, .145, .1, 0, Math.PI, .005], [1.04, .115, .088, 0, Math.PI, .01], [.96, .13, .1, 0, Math.PI, .015], [.78, .185, .125, 0, Math.PI, .025], [.5, .24, .165, 0, Math.PI, .035], [hem, .29, .2, 0, Math.PI, .045]]
    : [[1.31, .06, .055, 0, Math.PI, 0], [1.285, .16 * bw, .085, 0, Math.PI, 0], [1.24, .185 * bw, .1, 0, Math.PI, 0], [1.15, .175 * bw, .105 * S(belly, 1), 0, Math.PI, 0], [1.04, .16 * bw, .1 * belly, 0, Math.PI, .004], [.96, .155 * bw, .1 * belly, 0, Math.PI, .004], [.9, .17 * bw, .115 * belly, 0, Math.PI, .01], [.74, .19 * bw, .125 * S(belly, 1), 0, Math.PI, .022], [hem, .215 * Math.max(bw, .96), .145, 0, Math.PI, .035]];
  B.put(tm, upLoft(T, 10, { freq: fem ? 6 : 5 }));
  { const a = upSample(T, hem + .05), b = T.find(r => r[0] === hem); B.put(trimM, upLoft([[hem + .05, a[1] * 1.012, a[2] * 1.012, 0, Math.PI, a[5]], [hem, b[1] * 1.012, b[2] * 1.012, 0, Math.PI, b[5]]], 10, { freq: fem ? 6 : 5 })); }
  // ---- belt (cingulum), buckle and coin pouch
  const by = fem ? 1.0 : .93, bs = upSample(T, by + .025);
  B.put(leather, upLoft([[by + .05, bs[1] * 1.04 + .003, bs[2] * 1.04 + .003, 0, Math.PI, 0], [by, bs[1] * 1.05 + .003, bs[2] * 1.05 + .003, 0, Math.PI, 0]], 10));
  B.box(brass, .045, .05, .012, 0, by, bs[2] * 1.05 + .004);
  if (who || h % 3 === 0) { const ps = who === 'plum' ? 1 : -1, px = ps * bs[1] * .72, pz = bs[2] * .8 + .03;
    B.put(leather, new THREE.SphereGeometry(.048, 6, 4), px, by - .08, pz + .02); B.put(leather, upLimb([px, by + .02, pz - .01], [px, by - .04, pz + .02], .006, .006, 4)); }
  // ---- legs and sandals
  for (const s of [-1, 1]) { const x = s * .088, fz = s * (who === 'plum' ? -.03 : .02) + (who === 'purple' ? s * .015 : 0), ry = s * .1;
    if (!fem) { B.put(skinM, upLimb([x, hem + .1, 0], [x, .31, -.01], .058, .05, 6)); B.put(skinM, upLimb([x, .31, -.01], [x, .08, fz * .2], .05, .03, 6)); }
    const bx = x, bz = fz + .035;
    B.put(sole, new THREE.BoxGeometry(.09, .016, .245), bx, .008, bz + .03, 0, ry, 0);
    { const foot = new THREE.BoxGeometry(.074, .038, .21), p = foot.attributes.position; for (let i = 0; i < p.count; i++) { if (p.getZ(i) < 0) p.setX(i, p.getX(i) * .72); if (p.getZ(i) > 0 && p.getY(i) > 0) p.setY(i, p.getY(i) - .012); } B.put(skinM, foot, bx, .035, bz + .03, 0, ry, 0); }
    B.put(leather, new THREE.BoxGeometry(.088, .014, .03), bx, .05, bz + .03, 0, ry, 0); B.put(leather, new THREE.BoxGeometry(.084, .016, .026), bx, .056, bz - .02, .5, ry, 0);
    B.put(leather, upLimb([x, .085, fz * .2], [x, .105, fz * .2], .037, .037, 6)); }
  // ---- arms: two-bone IK from the shoulder to a wrist target, hand built along the forearm
  const pose = opts.armsUp ? (who ? 'call' : 'up') : who === 'plum' ? 'offer' : opts.carry ? 'carry' : 'rest', sx = (fem ? .13 : .17 * bw) + .015, L1 = .28, L2 = .24, sleeveLong = who === 'plum';
  const ik = (S, W, hint) => { const d = W.clone().sub(S); let D = d.length(); const dir = d.clone().divideScalar(D); D = Math.min(D, L1 + L2 - .004); const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
    const hn = hint.clone().sub(dir.clone().multiplyScalar(hint.dot(dir))).normalize(); return S.clone().add(dir.clone().multiplyScalar(a)).add(hn.multiplyScalar(hh)); };
  const armW = fem ? .046 : .052, held = [];
  for (const s of [-1, 1]) { const S0 = UPV(s * sx, 1.255, 0); let W, hint, nrm;
    if (pose === 'up') { W = UPV(s * .4, 1.36, .22); hint = UPV(s, -.3, -.2); nrm = [0, 0, 1]; }
    else if (pose === 'call') { if (s < 0) { W = UPV(-.37, 1.43, .15); hint = UPV(-1, -.5, -.3); nrm = [0, 0, 1]; } else { W = UPV(.12, 1.03, .3); hint = UPV(1, -.3, -.3); nrm = [0, 1, 0]; } }
    else if (pose === 'offer') { if (s < 0) { W = UPV(-.16, 1.1, .4); hint = UPV(-1, -.6, -.1); nrm = [0, 1, 0]; } else { W = UPV(.09, 1.13, .26); hint = UPV(.8, -.5, -.1); nrm = [0, 0, 1]; } }
    else if (pose === 'carry') { if (s < 0) { W = UPV(-.17, 1.56, .03); hint = UPV(-1, 0, -.4); nrm = [1, 0, 0]; } else { W = UPV(.2 + .03 * bw, .82, .07); hint = UPV(.6, 0, -.8); nrm = [-1, 0, 0]; } }
    else { W = UPV(s * (.21 + .04 * bw), .76, .05); hint = UPV(s * .6, 0, -.8); nrm = [-s, 0, 0]; }
    const E = ik(S0, W, hint), e = [E.x, E.y, E.z], w = [W.x, W.y, W.z];
    if (sleeveLong) { B.put(tm, upLimb([S0.x, S0.y, S0.z], e, armW + .012, armW + .004, 6)); const c = W.clone().sub(E).multiplyScalar(.82).add(E); B.put(tm, upLimb(e, [c.x, c.y, c.z], armW + .004, armW - .006, 6)); B.put(trimM, upLimb([c.x, c.y, c.z], [c.x + (W.x - E.x) * .09, c.y + (W.y - E.y) * .09, c.z + (W.z - E.z) * .09], armW - .004, armW - .006, 6));
      B.put(skinM, upLimb([c.x, c.y, c.z], w, armW - .014, .028, 6)); }
    else { const m = S0.clone().lerp(E, .5); B.put(skinM, upLimb([S0.x, S0.y, S0.z], e, armW - .004, armW - .012, 6)); B.put(tm, upLimb([S0.x, S0.y, S0.z], [m.x, m.y, m.z], armW + .012, armW + .007, 6)); B.put(skinM, upLimb(e, w, armW - .012, .03, 6)); }
    const fd = W.clone().sub(E).normalize(), hd = fd.clone(); B.put(skinM, upLimb(w, [W.x + hd.x * .075, W.y + hd.y * .075, W.z + hd.z * .075], .033, .024, 5, false, .6, nrm));
    const th = UPV(...nrm).cross(fd).multiplyScalar(s * (pose === 'rest' ? -1 : 1)).normalize(); B.put(skinM, upLimb([W.x + hd.x * .02 + th.x * .014, W.y + hd.y * .02 + th.y * .014, W.z + hd.z * .02 + th.z * .014], [W.x + hd.x * .055 + th.x * .028, W.y + hd.y * .055 + th.y * .028, W.z + hd.z * .055 + th.z * .028], .011, .007, 4));
    held.push([s, W, fd]); }
  // ---- things held
  if (who === 'purple') { const [, W] = held[1]; B.put(mat('upBolt', '#8a4a7a', { map: TEX.cloth }), new THREE.BoxGeometry(.26, .1, .13), W.x - .02, W.y + .035, W.z + .04, 0, .15, 0); B.put(trimM, new THREE.BoxGeometry(.265, .014, .135), W.x - .02, W.y + .048, W.z + .04, 0, .15, 0);
    const sud = mat('upSud', '#e6dcc2', { map: TEX.cloth }); B.put(sud, upLimb([.13, 1.31, .02], [.15, .86, .12], .05, .045, 4, false, .18, [0, 0, 1])); B.put(sud, upLimb([.13, 1.31, -.02], [.15, .8, -.115], .05, .045, 4, false, .18, [0, 0, 1])); }
  if (who === 'plum') { const [, W] = held[1]; B.put(mat('upFrame', '#8a5c3a'), new THREE.BoxGeometry(.15, .21, .022), W.x + .01, W.y + .09, W.z + .03, -.35, 0, .1); B.put(mat('upWaxD', '#2e231b'), new THREE.BoxGeometry(.11, .17, .01), W.x + .01, W.y + .09, W.z + .043, -.35, 0, .1); }
  // ---- cloak (open at the front), with a brooch
  const cloakC = opts.cloak || (who === 'plum' ? '#86693f' : '');
  if (cloakC) { const cm = mat('cloak' + cloakC, cloakC, { side: THREE.DoubleSide, map: TEX.cloth }), cy = who === 'plum' ? .52 : .46;
    const C = [[1.32, .1, .075, 0, 2.4, 0], [1.28, .25, .145, -.005, 2.15, 0], [1.12, .27, .16, -.012, 1.95, .01], [.9, .29, .18, -.02, 1.8, .03], [.7, .31, .2, -.03, 1.72, .05], [cy, .33, .22, -.04, 1.66, .06]];
    B.put(cm, upLoft(C, 9, { freq: 4 })); B.put(brass, new THREE.OctahedronGeometry(.02, 0), -.17, 1.25, .1); }
  // ---- neck and head
  B.put(skinM, upLimb([0, 1.26, 0], [0, 1.34, .012], .038, .033, 6));
  const Hd = upBag(), hy = 1.307, hz = .012, HR = [[0, .026, .034, .062], [.035, .058, .07, .035], [.08, .072, .085, .02], [.13, .077, .095, .012], [.16, .076, .097, .01], [.188, .07, .092, 0], [.21, .05, .07, -.01], [.222, .012, .02, -.01]];
  Hd.put(skinM, upLoft(HR, 8, { oy: hy, oz: hz }));
  const fz = y => { const r = upSample(HR, y); return r[3] + r[2] * .93; };
  Hd.put(skinM, new THREE.ConeGeometry(.02, .055, 4).rotateX(1.35).scale(.8, 1, 1), 0, hy + .108, hz + fz(.108) - .003 + .012);
  for (const s of [-1, 1]) { Hd.box(skinM, .014, .042, .03, s * .079, hy + .1, hz + .0); Hd.box(eyeM, .026, .01, .012, s * .034, hy + .122, hz + fz(.122) * .97); Hd.box(hairM, .04, .008, .012, s * .034, hy + .145, hz + fz(.145) * .985, 0, 0, s * -.1); }
  const hs = who === 'purple' ? 'full' : who === 'plum' ? 'tuft' : !fem && hairIdx === 3 ? 'short' : '';
  if (!hs) Hd.box(lipM, .036, .007, .008, 0, hy + .058, hz + fz(.058) * .985);
  if (hs) { const k = hs === 'full' ? 1 : hs === 'short' ? .55 : .5, top = hs === 'tuft' ? .035 : .125, BR = hs === 'tuft' ? [[.035, .05 * k + .02, .06 * k + .03, .045, .8], [.005, .04 * k + .02, .06 * k + .03, .06, .7], [-.03, .016, .03, .075, .5]]
      : [[.125, .082, .102, .012, 1.8], [.09, .08, .1, .022, 1.55], [.05, .066 + .01 * k, .088 + .01 * k, .036 + .012 * k, 1.45], [.01, .04 + .014 * k, .066 + .016 * k, .05 + .02 * k, 1.25], [-.03 * k - .01, .02, .04 + .02 * k, .068 + .016 * k, .8]];
    Hd.put(hairM, upLoft(BR, 8, { center: 0, oy: hy, oz: hz })); if (hs === 'tuft') Hd.put(hairM, upLimb([0, hy + .04, hz + .1], [0, hy - .005, hz + .12], .018, .012, 4)); }
  // hair, cap, veil
  const hr = [[.1, .084, .104, .012, 1.5], [.15, .09, .109, .008, 2.3], [.185, .083, .103, 0, 2.85], [.208, .063, .083, -.01, Math.PI], [.223, .02, .03, -.01, Math.PI]];
  if (who === 'plum') { Hd.put(mat('upFelt', '#9a8a6e', { map: TEX.cloth }), upLoft([[.108, .094, .108, .006, Math.PI, .01, .06], [.16, .092, .106, .004, Math.PI, 0, .03], [.2, .077, .092, -.004, Math.PI, 0, .01], [.226, .052, .066, -.004, Math.PI], [.248, .03, .04, .02, Math.PI], [.262, .008, .012, .05, Math.PI]], 9, { oy: hy, oz: hz }));
    Hd.put(hairM, upLoft([[.09, .082, .103, .01, 1.6], [.125, .088, .108, .01, 1.7]], 7, { oy: hy, oz: hz })); }
  else if (opts.veil) { const vm = mat('veil' + opts.veil, opts.veil, { side: THREE.DoubleSide });
    B.put(vm, upLoft([[1.54, .03, .04, 0, Math.PI], [1.525, .085, .1, .004, Math.PI], [1.46, .108, .122, .006, 2.6], [1.4, .114, .128, .006, 2.55], [1.33, .17, .14, 0, 2.75, .02], [1.2, .2, .16, 0, 2.6, .03], [1.0, .21, .17, 0, 2.5, .04]], 10, { freq: 4 })); }
  else if (fem) { Hd.put(hairM, upLoft(hr, 8, { oy: hy, oz: hz })); Hd.put(hairM, new THREE.SphereGeometry(.05, 6, 4), 0, hy + .15, hz - .105); }
  else if (hs === 'short') Hd.put(hairM, upLoft([[.095, .083, .103, .012, 1.6], [.14, .088, .108, .008, 1.9], [.17, .082, .102, 0, 1.9]], 8, { oy: hy, oz: hz }));
  else { Hd.put(hairM, upLoft(hr, 8, { oy: hy, oz: hz }));
    if (hairIdx === 1 || who === 'purple') for (let i = 0; i < (who === 'purple' ? 10 : 7); i++) { const a = who === 'purple' ? 1.1 + i * .62 : 1.2 + i * .62; Hd.put(hairM, new THREE.OctahedronGeometry(.032, 0).scale(1, .7, 1), Math.sin(a) * .08, hy + (i % 3 ? .185 : .205), hz - .01 + Math.cos(a) * .09); } }
  Hd.into(B, q => q.translate(0, -hy, -hz).scale(1.07, 1.07, 1.07).translate(0, hy, hz));
  const tris = B.flush(g);
  if (opts.carry === 'jar') { const j = new THREE.Group(); j.position.set(0, 1.55, 0); g.add(j); amph(j, 0, 0, .55); }
  if (opts.carry === 'basket') cyl(.25, .2, .2, 8, 'basket', 0, 1.53, 0, g);
  g.userData.tris = tris;
}

// ---------- canvas textures (private generator, never R()) ----------
const UPT = {};
function upRng(seed) { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
function upTex(key, w, h, draw) { if (!UPT[key]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h, upRng(key.length * 7919 + w)); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = {}; UPT[key] = t; } return UPT[key]; }
// rows of text-like scribbles: short strokes grouped into words
function upInk(x, rnd, x0, y0, wCol, rows, lh, size, ink, lw = 1.5) {
  x.strokeStyle = ink; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round';
  for (let r = 0; r < rows; r++) { let px = x0 + (r % 6 === 3 ? size * 1.4 : 0); const y = y0 + r * lh, end = x0 + wCol - (rnd() < .3 ? rnd() * wCol * .4 : 0);
    while (px < end) { const wl = 2 + (rnd() * 5 | 0); for (let k = 0; k < wl && px < end; k++) { const s = size * (.7 + rnd() * .5); x.beginPath(); x.moveTo(px + rnd() * s * .5, y); x.lineTo(px + rnd() * s * .7, y + s * (.5 + rnd() * .5)); if (rnd() < .6) x.lineTo(px + rnd() * s * .8, y + s * (.2 + rnd() * .8)); if (rnd() < .25) x.lineTo(px + s * .1, y + s); x.stroke(); px += size * .75; } px += size * 1.0; } } }
function upPapyrusDraw(cols, rows) { return (x, w, h, rnd) => {
  x.fillStyle = '#e4d0a0'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${150 + rnd() * 40 | 0},${110 + rnd() * 30 | 0},50,${.05 + rnd() * .07})`; x.beginPath(); x.ellipse(rnd() * w, rnd() * h, 14 + rnd() * 40, 8 + rnd() * 24, rnd() * 3, 0, 7); x.fill(); }
  for (let y = 0; y < h; y += 2) { x.strokeStyle = rnd() < .5 ? `rgba(120,86,40,${.07 + rnd() * .1})` : `rgba(255,245,214,${.1 + rnd() * .14})`; x.lineWidth = 1; x.beginPath(); const a = rnd() * w, b = a + 30 + rnd() * 160; x.moveTo(a, y + rnd()); x.lineTo(b, y + rnd() * 1.4); x.stroke(); x.beginPath(); x.moveTo(a - w * .6, y + 1); x.lineTo(b - w * .6, y + rnd()); x.stroke(); }
  for (let i = 0; i < 140; i++) { x.strokeStyle = `rgba(110,78,36,${.05 + rnd() * .08})`; x.beginPath(); const px = rnd() * w, py = rnd() * h; x.moveTo(px, py); x.lineTo(px + (rnd() - .5) * 5, py + 6 + rnd() * 24); x.stroke(); }
  x.fillStyle = 'rgba(100,70,30,.16)'; x.fillRect(w * .5 - 1, 0, 2, h); x.fillStyle = 'rgba(255,248,224,.22)'; x.fillRect(w * .5 + 1, 0, 1.5, h);
  const gr = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(110,76,30,.32)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  if (cols) { const cw = (w - 40) / cols; for (let c = 0; c < cols; c++) upInk(x, rnd, 20 + c * cw + 4, 16, cw - 16, rows, (h - 34) / rows, 8, 'rgba(38,26,18,.9)'); } }; }
// a sheet lying in the XZ plane, edges and one corner curling up
function upSheet(w, h, curl = 1, sx = 6, sy = 5) {
  const g = new THREE.PlaneGeometry(w, h, sx, sy).rotateX(-Math.PI / 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (w / 2), v = p.getZ(i) / (h / 2), e = Math.max(0, Math.max(Math.abs(u), Math.abs(v)) - .7) / .3, c = Math.max(0, (u + v) / 2 - .55) / .45;
    p.setY(i, curl * (.016 * e * e + .03 * c * c * c) + .0012 * Math.sin(u * 5 + v * 3)); }
  g.computeVertexNormals(); return g; }

// ---------- Papyrus and quill: a scribe's slanted desk ----------
function upDesk(g, x, y, z) {
  const D = new THREE.Group(); D.position.set(x, y, z); g.add(D); const Bd = upBag(), S = new THREE.Group(), Bs = upBag();
  const ph = .22, ps = -.065, pf = .21, th = Math.atan2(.11, pf - ps), L = Math.hypot(pf - ps, .11);
  const deskWood = mat('upDeskTop', '#b08458', { map: upTex('deskwood', 256, 128, (c, w, h, r) => {
    c.fillStyle = '#c9a070'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(${70 + r() * 40 | 0},${40 + r() * 30 | 0},20,${.1 + r() * .22})`; c.lineWidth = .6 + r() * 1.6; const yy = r() * h; c.beginPath(); c.moveTo(0, yy); for (let k = 1; k <= 8; k++) c.lineTo(k * w / 8, yy + Math.sin(k * 1.3 + i) * 2.5 + (r() - .5) * 1.5); c.stroke(); }
    for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(240,215,170,${.08 + r() * .14})`; c.lineWidth = 1; const yy = r() * h, xx = r() * w; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 10 + r() * 50, yy + (r() - .5) * 3); c.stroke(); }
    for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(20,16,26,${.14 + r() * .24})`; c.beginPath(); c.ellipse(w * .6 + r() * w * .38, h * .1 + r() * h * .5, 2 + r() * 7, 1.5 + r() * 5, r() * 3, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(60,40,20,.25)'; c.fillRect(0, 0, w, 3); c.fillRect(0, h - 3, w, 3); }) });
  const wood = mat('upDeskSide', '#9c7048', { map: TEX.wood }), woodDk = mat('upDeskDk', '#6e4a2c'), bronze = mat('upBronze', '#9a6a2a', { metalness: .55, roughness: .4, side: THREE.DoubleSide });
  // two side trestles (profile extruded across), stretchers with through-tenons, pegs
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-pf + .02, 0); sh.lineTo(.215, 0); sh.lineTo(.215, ph - .02); sh.lineTo(-ps, ph - .02); sh.lineTo(-pf, .09); sh.lineTo(-pf + .02, .09); sh.closePath(); const hp = new THREE.Path(); hp.moveTo(-.15, .03); hp.lineTo(.12, .03); hp.lineTo(.12, .165); hp.lineTo(.065, .165); hp.lineTo(-.15, .079); hp.closePath(); sh.holes.push(hp);
    const eg = new THREE.ExtrudeGeometry(sh, { depth: .028, bevelEnabled: false }).rotateY(Math.PI / 2); Bd.put(wood, eg, s * .275 - .014 + (s > 0 ? .0 : 0), 0, 0);
    for (const [pz, py] of [[-.15, .05], [.13, .035], [-.1, .17]]) Bd.put(woodDk, new THREE.CylinderGeometry(.008, .008, .007, 6).rotateZ(Math.PI / 2), s * (.289 + .003), py, pz);
    for (const [tz, ty] of [[.16, .045], [-.17, .045]]) Bd.box(woodDk, .014, .05, .024, s * .29, ty - .025, tz); }
  for (const [tz, ty] of [[.16, .045], [-.17, .045]]) Bd.box(wood, .56, .05, .022, 0, ty - .025, tz);
  Bd.box(wood, .58, .02, .15, 0, ph - .02, -.14); Bd.box(woodDk, .58, .03, .016, 0, ph, -.207);
  // slanted writing surface (slope frame S: origin at the top edge of the slope, +z runs down the slope, +y is the surface normal)
  S.position.set(0, ph, ps); S.rotation.x = th; D.add(S);
  Bs.put(deskWood, new THREE.BoxGeometry(.6, .02, L), 0, -.01, L / 2); Bs.box(woodDk, .6, .02, .016, 0, -.004, L - .005, 0, 0, 0);
  for (const rs of [-1, 1]) Bs.put(woodDk, new THREE.BoxGeometry(.012, .012, L), rs * .296, .006, L / 2);
  // sheets: a blank sheet underneath, the long text sheet, a loose letter on the right
  const sheet = (key, cols, rows) => mat(key, '#ffffff', { map: upTex(key, 256, 192, upPapyrusDraw(cols, rows)), side: THREE.DoubleSide, flatShading: false, roughness: .95 });
  const mBlank = sheet('upPapBlank', 0, 0), mA = sheet('upPapA', 2, 12), mB = sheet('upPapB', 1, 8);
  { const m = new THREE.Mesh(upSheet(.27, .2, 1, 5, 4), mBlank); m.position.set(-.02, .0006, .15); m.rotation.y = .22; m.castShadow = m.receiveShadow = true; S.add(m); }
  { const m = new THREE.Mesh(upSheet(.3, .21, .8, 6, 5), mA); m.position.set(-.06, .0022, .15); m.rotation.y = -.03; m.castShadow = m.receiveShadow = true; S.add(m); }
  { const m = new THREE.Mesh(upSheet(.16, .21, 1.2, 4, 5), mB); m.position.set(.185, .0036, .155); m.rotation.y = -.13; m.castShadow = m.receiveShadow = true; S.add(m); }
  // the scroll, half unrolled: papyrus roll with end discs and wooden knobs
  const mRoll = mat('upPapRoll', '#d9c28c', { map: upTex('upPapBlank', 256, 192, upPapyrusDraw(0, 0)), flatShading: false, roughness: .95 });
  Bs.put(mRoll, new THREE.CylinderGeometry(.027, .027, .21, 12).rotateX(Math.PI / 2), -.205, .027, .15);
  for (const e of [-1, 1]) { Bs.put(woodDk, new THREE.CylinderGeometry(.0235, .0235, .003, 10).rotateX(Math.PI / 2), -.205, .027, .15 + e * .1055); Bs.put(wood, new THREE.CylinderGeometry(.008, .008, .026, 6).rotateX(Math.PI / 2), -.205, .027, .15 + e * .119); Bs.put(wood, new THREE.CylinderGeometry(.013, .013, .004, 8).rotateX(Math.PI / 2), -.205, .027, .15 + e * .133); }
  // reed pen (split nib) and ruler lying near the lower lip
  const reed = mat('upReed', '#b49454'), nib = mat('upNib', '#5a3e22');
  { const a = [.02, .0062, .272], b = [.19, .0062, .262]; Bs.put(reed, upLimb(a, b, .0036, .0058, 6)); Bs.put(nib, upLimb([a[0] - .018, .0062, a[2] + .001], a, .0008, .0036, 4)); Bs.box(woodDk, .0012, .0012, .012, a[0] - .014, .0058, a[2] + .0012);
    for (const t of [.35, .7]) Bs.put(woodDk, upLimb([a[0] + (b[0] - a[0]) * t, .0062, a[2] + (b[2] - a[2]) * t], [a[0] + (b[0] - a[0]) * (t + .03), .0062, a[2] + (b[2] - a[2]) * (t + .03)], .0062, .0062, 6)); }
  { const rm = mat('upRuler', '#e0cfa4', { map: upTex('ruler', 256, 16, (c, w, h, r) => { c.fillStyle = '#d8c28e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a2a1c'; for (let i = 0; i <= 24; i++) { c.lineWidth = i % 6 ? 1 : 2; c.beginPath(); c.moveTo(i * w / 24, 0); c.lineTo(i * w / 24, i % 6 ? 6 : 10); c.stroke(); } }) });
    Bs.put(rm, new THREE.BoxGeometry(.25, .004, .02), -.115, .002, .272, 0, .02, 0); }
  // things on the back shelf: bronze inkwell (open, thin-walled, ink below the rim) with its hinged lid, pounce pot, sponge, penknife
  const lathe = (pts, seg = 12) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg);
  const ix = .185, iz = -.14;
  Bd.put(bronze, lathe([[0, 0], [.027, 0], [.031, .004], [.032, .02], [.029, .029], [.021, .034], [.018, .04], [.0165, .04], [.0165, .032], [.0245, .027], [.0285, .02], [.0285, .006], [0.0, .006]]), ix, ph, iz);
  Bd.put(mat('upInk', '#14121a', { roughness: .25 }), new THREE.CircleGeometry(.0172, 10).rotateX(-Math.PI / 2), ix, ph + .027, iz);
  Bd.put(bronze, lathe([[.0215, 0], [.0235, .003], [.02, .012], [.011, .018], [.0045, .019], [.0045, .025], [.008, .028], [.0, .028]], 10).translate(0, 0, .0185).rotateX(-1.75), ix, ph + .04, iz - .0185);
  { const a = [ix + .004, ph + .03, iz], b = [ix + .045, ph + .17, iz + .018]; Bd.put(mat('upQuillShaft', '#d8cba8'), upLimb(a, b, .0022, .0014, 5)); const c = [(a[0] * .4 + b[0] * .6), (a[1] * .4 + b[1] * .6), (a[2] * .4 + b[2] * .6)];
    Bd.put(mat('upQuillVane', '#efe6d2', { side: THREE.DoubleSide }), upLimb([a[0] * .6 + b[0] * .4, a[1] * .6 + b[1] * .4, a[2] * .6 + b[2] * .4], [b[0] + .004, b[1] + .018, b[2] + .002], .005, .0012, 5, false, .22, [0, 0, 1])); }
  Bd.put(mat('upPounce', '#b9693f', { side: THREE.DoubleSide }), lathe([[0, 0], [.022, 0], [.03, .01], [.032, .03], [.027, .048], [.02, .056], [.019, .062], [.012, .066], [0, .066]], 10), .07, ph, -.145);
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; Bd.put(woodDk, new THREE.CircleGeometry(.0026, 5).rotateX(-Math.PI / 2), .07 + (i ? Math.cos(a) * .0065 : 0), ph + .0665, -.145 + (i ? Math.sin(a) * .0065 : 0)); }
  Bd.put(mat('upSponge', '#cfa45a'), new THREE.IcosahedronGeometry(.03, 0).scale(1.2, .78, 1), -.2, ph + .024, -.14);
  Bd.put(mat('upSpongeDk', '#8a6a34'), new THREE.IcosahedronGeometry(.008, 0), -.19, ph + .04, -.13); Bd.put(mat('upSpongeDk', '#8a6a34'), new THREE.IcosahedronGeometry(.007, 0), -.21, ph + .036, -.15);
  Bd.put(woodDk, new THREE.BoxGeometry(.075, .012, .014), -.075, ph + .006, -.1, 0, .35, 0);
  { const bl = new THREE.BoxGeometry(.055, .0018, .014), p = bl.attributes.position; for (let i = 0; i < p.count; i++) if (p.getX(i) > 0) p.setZ(i, p.getZ(i) * .15); Bd.put(mat('upIron', '#6a6a68', { metalness: .5, roughness: .5 }), bl, -.075 + Math.cos(.35) * .062, ph + .0075, -.1 - Math.sin(.35) * .062, 0, .35, 0); }
  Bd.flush(D); Bs.flush(S); return y + .36;
}

// ---------- Stack of wax tablets (tabulae ceratae) ----------
function upTablets(g, x, y, z, sc = 1, nR = 4) {
  for (let i = 0; i < nR; i++) { R(-.03, .03); R(-.2, .2); }
  const D = new THREE.Group(); D.position.set(x, y, z); D.scale.setScalar(sc); g.add(D); const W = .19, Dp = .26, bd = .018;
  const grain = mat('upTabWood', '#a98a64', { map: upTex('tabwood', 256, 128, (c, w, h, r) => { c.fillStyle = '#c79c68'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) { c.strokeStyle = `rgba(${80 + r() * 40 | 0},${48 + r() * 24 | 0},22,${.12 + r() * .26})`; c.lineWidth = .5 + r() * 1.8; const yy = r() * h; c.beginPath(); c.moveTo(0, yy); for (let k = 1; k <= 8; k++) c.lineTo(k * w / 8, yy + Math.sin(k * .9 + i) * 3); c.stroke(); }
    c.fillStyle = 'rgba(60,36,18,.35)'; c.beginPath(); c.ellipse(w * .7, h * .4, 10, 5, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(60,36,18,.3)'; c.beginPath(); c.ellipse(w * .7, h * .4, 18, 9, 0, 0, 7); c.stroke(); }) });
  const waxM = k => mat('upWax' + k, '#ffffff', { map: upTex('upWax' + k, 128, 192, (c, w, h, r) => { c.fillStyle = '#2b2019'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(70,52,38,${.15 + r() * .2})`; c.fillRect(r() * w, r() * h, 8 + r() * 30, 1 + r() * 2); }
      upInk(c, r, 10, 12, w - 20, k ? 9 : 13, (h - 28) / (k ? 9 : 13), 7, 'rgba(216,190,136,.95)', 1.3); }), flatShading: false, roughness: .45 });
  const cordM = mat('upCord', '#6a4a2e'), holeM = mat('upHole', '#1a120c'), bronze = mat('upBronze', '#9a6a2a', { metalness: .55, roughness: .4, side: THREE.DoubleSide });
  const cord = (B, a, b) => B.put(cordM, upLimb(a, b, .0032, .0032, 4));
  // one open leaf lying flat: slab, raised border, recessed wax with incised lines; spine side towards x = spine
  const leaf = (B, cx, spine, k) => { const x0 = cx - W / 2, fr = new THREE.Shape(), hole = new THREE.Path(); fr.moveTo(-W / 2, -Dp / 2); fr.lineTo(W / 2, -Dp / 2); fr.lineTo(W / 2, Dp / 2); fr.lineTo(-W / 2, Dp / 2); fr.closePath();
    hole.moveTo(-W / 2 + bd, -Dp / 2 + bd); hole.lineTo(-W / 2 + bd, Dp / 2 - bd); hole.lineTo(W / 2 - bd, Dp / 2 - bd); hole.lineTo(W / 2 - bd, -Dp / 2 + bd); hole.closePath(); fr.holes.push(hole);
    B.put(grain, new THREE.BoxGeometry(W, .012, Dp), cx, .006, 0); B.put(grain, new THREE.ExtrudeGeometry(fr, { depth: .01, bevelEnabled: false }).rotateX(-Math.PI / 2), cx, .012, 0);
    B.put(waxM(k), new THREE.PlaneGeometry(W - 2 * bd, Dp - 2 * bd).rotateX(-Math.PI / 2), cx, .0165, 0);
    for (const hz of [-.065, .065]) B.put(holeM, new THREE.CircleGeometry(.006, 6).rotateX(-Math.PI / 2), cx + spine * (W / 2 - bd / 2), .0222, hz); };
  // a closed stack of n leaves bound with a cord loop through the spine holes (spine at -x)
  const closed = (px, pz, ry, py, n, w, d) => { const G = new THREE.Group(); G.position.set(px, py, pz); G.rotation.y = ry; D.add(G); const B = upBag(), h = n * .016 + (n - 1) * .004;
    for (let i = 0; i < n; i++) { B.put(grain, new THREE.BoxGeometry(w, .016, d), 0, .008 + i * .02, 0); if (i) B.put(holeM, new THREE.BoxGeometry(w - .012, .005, d - .012), 0, i * .02 - .002, 0); }
    for (const hz of [-d * .25, d * .25]) { const xe = -w / 2; cord(B, [xe + .026, h + .003, hz], [xe - .004, h + .003, hz]); cord(B, [xe - .005, h + .003, hz], [xe - .005, -.003, hz]); cord(B, [xe - .004, -.003, hz], [xe + .026, -.003, hz]); B.put(holeM, new THREE.CircleGeometry(.006, 6).rotateX(-Math.PI / 2), xe + .014, h + .0012, hz); }
    B.put(cordM, new THREE.OctahedronGeometry(.0065, 0), -w / 2 + .02, h + .006, d * .25); cord(B, [-w / 2 + .02, h + .005, d * .25], [-w / 2 + .055, h + .004, d * .25 + .045]); cord(B, [-w / 2 + .02, h + .005, d * .25], [-w / 2 + .03, h + .004, d * .25 + .06]);
    B.flush(G); return h; };
  const B0 = upBag();
  leaf(B0, -W / 2 - .006, 1, 0); leaf(B0, W / 2 + .006, -1, 1);
  for (const hz of [-.065, .065]) { cord(B0, [-.0455 + (-.0), .0245, hz], [.0455, .0245, hz]); B0.put(cordM, new THREE.OctahedronGeometry(.0058, 0), 0, .026, hz); cord(B0, [.0, .0245, hz], [.012, .0245, hz + .035]); }
  // stylus (bronze): pointed end, two rings, flat spatula to smooth the wax out
  { const a = [-.15, .031, .07], b = [-.04, .031, -.075]; B0.put(bronze, upLimb(a, b, .0045, .0058, 6)); B0.put(bronze, upLimb([a[0] - .026, a[1] - .0005, a[2] + .0334], a, .0007, .0045, 6));
    const dx = b[0] - a[0], dz = b[2] - a[2], dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl; B0.put(bronze, new THREE.BoxGeometry(.03, .0035, .02), b[0] + ux * .02, b[1], b[2] + uz * .02, 0, Math.atan2(-uz, ux) + 0, 0);
    for (const t of [.42, .6]) B0.put(bronze, upLimb([a[0] + dx * t, a[1], a[2] + dz * t], [a[0] + dx * (t + .035), a[1], a[2] + dz * (t + .035)], .0075, .0075, 6)); }
  B0.flush(D);
  const h1 = closed(.1, -.012, .1, .022, 4, W - .004, Dp - .01);
  { // a polyptych with its cover hinged open: two closed leaves, a wax leaf, and the cover swung back on the cord loops
    const G = new THREE.Group(); G.position.set(.085, .022 + h1 + .003, -.01); G.rotation.y = -.12; D.add(G); const B = upBag(), w = W - .01, d = Dp - .02, top = .036 + .022;
    for (let i = 0; i < 2; i++) { B.put(grain, new THREE.BoxGeometry(w, .016, d), 0, .008 + i * .02, 0); if (i) B.put(holeM, new THREE.BoxGeometry(w - .012, .005, d - .012), 0, i * .02 - .002, 0); }
    B.put(holeM, new THREE.BoxGeometry(w - .012, .005, d - .012), 0, .038, 0);
    for (const hz of [-d * .25, d * .25]) { const xe = -W / 2; cord(B, [xe + .026, top + .003, hz], [xe - .004, top + .003, hz]); cord(B, [xe - .005, top + .003, hz], [xe - .005, -.003, hz]); cord(B, [xe - .004, -.003, hz], [xe + .026, -.003, hz]); }
    B.put(cordM, new THREE.OctahedronGeometry(.0065, 0), -W / 2 + .02, top + .006, d * .25); B.flush(G);
    const L3 = new THREE.Group(); L3.position.y = .036; G.add(L3); const B3 = upBag(); leaf(B3, 0, 1, 1); B3.flush(L3);
    const C = new THREE.Group(); C.position.set(-W / 2, top, 0); C.rotation.z = -1.2; G.add(C); const BC = upBag(); leaf(BC, -W / 2, 1, 0); BC.flush(C); }
  return y + (.022 + h1 + .3) * sc;
}
