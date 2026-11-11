// ---------- OBJECT LIBRARY, upgrade batch B: hanging scales, honey jar, cloth stall, the scribe's and potter's stall frames ----------
// Helpers shared by these objects (all prefixed ub, none draws from the seeded layout random R(): they use ubRng):
//   ubRng, ubBatch (many small shapes -> one vertex-coloured mesh), ubLimb/ubStrand (cords, drips), ubVessel (thin-walled lathe pots),
//   ubLinen (the ONE weathered woven-linen material every awning of Batch B uses), ubStallCloth (restyles the cloth of the game-ready stall frame),
//   ubFringe (frayed hem threads), ubLash (rope lashings round a post), ubGoods (the goods of the scribe / potter crates, called from fillCrate).
// P.scale and P.honey are replaced here (colossae.js defines the old ones; this part loads after it).
function ubRng(seed) { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
const UBG = {}, UBMAT = {};
const ubG = (k, f) => UBG[k] || (UBG[k] = f());
const ubV = (a, b, c) => new THREE.Vector3(a, b, c);
function ubM(p, r, s) { return new THREE.Matrix4().compose(ubV(p[0], p[1], p[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0)), ubV(s ? s[0] : 1, s ? s[1] : 1, s ? s[2] : 1)); }
function ubVC(key, o) { return UBMAT[key] || (UBMAT[key] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, flatShading: false, ...o })); }
function ubLimbM(a, b, r0, r1) { const d = b.clone().sub(a), len = d.length() || 1e-4, q = new THREE.Quaternion().setFromUnitVectors(ubV(0, 1, 0), d.clone().normalize());
  return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), q, ubV(1, len, 1)); }
// a batch of coloured shapes merged into one mesh. Coordinates are centres.
function ubBatch() { const L = [];
  const B = { g(geo, m, col) { const q = geo.index ? geo.toNonIndexed() : geo.clone(); q.applyMatrix4(m); const n = q.attributes.position.count, c = new THREE.Color(col), ca = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b; } q.setAttribute('color', new THREE.BufferAttribute(ca, 3)); if (!q.attributes.uv) q.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2)); L.push(q); return B; },
    box(x, y, z, w, h, d, col, rot) { return B.g(ubG('box', () => new THREE.BoxGeometry(1, 1, 1)), ubM([x, y, z], rot, [w, h, d]), col); },
    cyl(x, y, z, rt, rb, h, seg, col, rot, open) { return B.g(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), ubM([x, y, z], rot), col); },
    sph(x, y, z, rx, ry, rz, col, seg = 8, rot) { return B.g(ubG('sph' + seg, () => new THREE.SphereGeometry(1, seg, Math.max(4, seg >> 1))), ubM([x, y, z], rot, [rx, ry, rz]), col); },
    lathe(pts, seg, x, y, z, col, rot, sc = 1) { return B.g(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), ubM([x, y, z], rot, [sc, sc, sc]), col); },
    geo(geo, x, y, z, col, rot, sc) { return B.g(geo, ubM([x, y, z], rot, sc), col); },
    limb(a, b, r0, r1, col, seg = 5) { const d = b.clone().sub(a), len = d.length() || 1e-4, q = new THREE.Quaternion().setFromUnitVectors(ubV(0, 1, 0), d.clone().normalize());
      return B.g(new THREE.CylinderGeometry(r1, r0, len, seg, 1, true), new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), q, ubV(1, 1, 1)), col); },
    mesh(parent, material, tri) { if (!L.length) return null; const m = mergeGeometries(L, false); if (tri) ubTriUV(m, tri); const o = add(m, material, 0, 0, 0, parent); return o; } };
  return B; }
// projects uv from position along the dominant normal axis (s = tiles per unit)
function ubTriUV(geo, s) { const p = geo.attributes.position; if (!geo.attributes.normal) geo.computeVertexNormals(); const n = geo.attributes.normal, uv = geo.attributes.uv || new THREE.BufferAttribute(new Float32Array(p.count * 2), 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); } else if (ax >= az) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); } uv.setXY(i, u * s, v * s); }
  geo.setAttribute('uv', uv); uv.needsUpdate = true; return geo; }
// tapered tube through points (cords, drips)
function ubStrandGeo(pts, r0, r1, sides = 5) { const n = pts.length, pos = [], uv = [], idx = [], up = ubV(0, 1, 0), alt = ubV(1, 0, 0);
  for (let i = 0; i < n; i++) { const d = pts[Math.min(i + 1, n - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize(), ref = Math.abs(d.y) > .9 ? alt : up, u = ubV(0, 0, 0).crossVectors(d, ref).normalize(), w = ubV(0, 0, 0).crossVectors(d, u).normalize(), r = r0 + (r1 - r0) * i / (n - 1);
    for (let k = 0; k < sides; k++) { const t = k / sides * Math.PI * 2, p = pts[i].clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(w, Math.sin(t) * r); pos.push(p.x, p.y, p.z); uv.push(k / sides, i / (n - 1)); } }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) { const a = i * sides + k, b = i * sides + (k + 1) % sides, c = a + sides, d = b + sides; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
// thin-walled lathe: outer profile [r, y] bottom-centre to lip, then back down the inside; returns the geometry (use DoubleSide-free materials)
function ubSmooth(pts, sub) { const c = new THREE.CatmullRomCurve3(pts.map(p => ubV(p[0], p[1], 0)), false, 'centripetal'), o = []; const n = (pts.length - 1) * sub; for (let i = 0; i <= n; i++) { const q = c.getPoint(i / n); o.push([Math.max(q.x, 0), q.y]); } o[0][0] = 0; return o; }
function ubVesselGeo(outer, thick, seg = 10) { const inner = []; for (let i = outer.length - 1; i >= 1; i--) inner.push([Math.max(outer[i][0] - thick, .002), outer[i][1] - (i === outer.length - 1 ? 0 : 0)]);
  inner.push([.002, outer[0][1] + thick]); return new THREE.LatheGeometry(outer.concat(inner).map(p => new THREE.Vector2(p[0], p[1])), seg); }

// ---------- the shared weathered linen of every Batch B awning and cloth ----------
function ubLinenTex() { if (UBG.linenTex) return UBG.linenTex; const r = ubRng(4417), S = 256, T = 4, N = S / T, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#eeeadc'; x.fillRect(0, 0, S, S);
  const warp = [], weft = []; for (let i = 0; i < N; i++) { warp.push((r() - .5) * .16); weft.push((r() - .5) * .12); }
  for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++) { const over = (cx + cy) & 1, l = Math.round(226 + (over ? warp[cx] : weft[cy]) * 90 + (over ? 11 : -9) + (r() - .5) * 9);
    x.fillStyle = `rgb(${l},${l - 2},${l - 7})`; x.fillRect(cx * T, cy * T, T, T); x.fillStyle = over ? 'rgba(70,50,28,.16)' : 'rgba(70,50,28,.12)'; if (over) x.fillRect(cx * T + T - 1, cy * T, 1, T); else x.fillRect(cx * T, cy * T + T - 1, T, 1); }
  for (let i = 0; i < 70; i++) { const l = r() < .5, px = r() * S, py = r() * S, len = 10 + r() * 34; x.fillStyle = l ? 'rgba(255,248,225,.22)' : 'rgba(80,58,30,.16)'; if (r() < .5) x.fillRect(px, py, 2, len); else x.fillRect(px, py, len, 2); }
  for (let i = 0; i < 16; i++) { const px = r() * S, py = r() * S, rad = 30 + r() * 60, fade = r() < .55; for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const gr = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rad); gr.addColorStop(0, fade ? 'rgba(255,250,232,.16)' : 'rgba(90,64,34,.11)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px + ox - rad, py + oy - rad, rad * 2, rad * 2); } }
  // a stitched seam where two loom strips meet (left edge of the tile): shadowed fold, double row of stitches
  const sg = x.createLinearGradient(0, 0, 14, 0); sg.addColorStop(0, 'rgba(50,36,18,.2)'); sg.addColorStop(1, 'rgba(50,36,18,0)'); x.fillStyle = sg; x.fillRect(0, 0, 14, S);
  x.fillStyle = 'rgba(255,248,228,.28)'; x.fillRect(14, 0, 3, S); x.fillStyle = 'rgba(48,34,16,.3)'; x.fillRect(S - 2, 0, 3, S); x.fillRect(0, 0, 1, S);
  for (let y = 0; y < S; y += 12) { x.fillStyle = 'rgba(70,52,30,.5)'; x.fillRect(5, y + 1, 2, 7); x.fillStyle = 'rgba(70,52,30,.4)'; x.fillRect(10, y + 6, 2, 6); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (UBG.linenTex = t); }
// linen in a colour (kept, but sun-faded and dusted so it sits with the weathered wood); `tile` metres per texture tile is set by the uv scale of the geometry
function ubLinen(tint, key) { const k = 'lin' + tint + (key || ''); if (UBMAT[k]) return UBMAT[k]; const t = ubLinenTex(), col = new THREE.Color(tint), hsl = {}; col.getHSL(hsl); col.setHSL(hsl.h, hsl.s * .95, Math.min(.9, hsl.l * 1.14)); col.lerp(new THREE.Color('#d9ccaa'), .05);
  return (UBMAT[k] = new THREE.MeshStandardMaterial({ color: col, map: t, bumpMap: t, bumpScale: 1.1, roughness: 1, side: THREE.DoubleSide, flatShading: false })); }
// frayed hem: a row of loose threads hanging from the points; used on the awning hems
function ubFringe(parent, pts, col, len, seed, dropDir) { if (!pts.length) return null; const r = ubRng(seed), pos = [], idx = [], dir = dropDir || ubV(0, -1, 0);
  pts.forEach((p, i) => { const L = len * (.55 + r() * .8), w = .0055, sx = ubV(1, 0, 0), side = ubV(0, 0, 1), j = (r() - .5) * .03, a = p.clone(), b = p.clone().addScaledVector(dir, L).addScaledVector(side, j).addScaledVector(sx, (r() - .5) * .02);
    const n0 = pos.length / 3; pos.push(a.x - w, a.y, a.z, a.x + w, a.y, a.z, b.x, b.y, b.z); idx.push(n0, n0 + 1, n0 + 2); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const o = add(g, UBMAT['fr' + col] || (UBMAT['fr' + col] = new THREE.MeshStandardMaterial({ color: col, roughness: 1, side: THREE.DoubleSide })), 0, 0, 0, parent); o.castShadow = false; return o; }
// rope: a few turns round a post at (x, y, z), a knot and two loose ends
function ubLash(g, x, y, z, rad, turns = 3, hang = .2) { const b = ubBatch(), rope = '#b09865', rope2 = '#8f7a50';
  for (let i = 0; i < turns; i++) b.g(ubG('lash', () => new THREE.TorusGeometry(1, .17, 4, 12)), ubM([x, y - i * .045, z], [Math.PI / 2 + (i - 1) * .06, 0, 0], [rad, rad, rad * 1.6]), i % 2 ? rope2 : rope);
  b.sph(x + rad * .9, y - turns * .045, z + rad * .55, .026, .026, .026, rope2, 6); b.limb(ubV(x + rad * .9, y - turns * .045, z + rad * .55), ubV(x + rad * 1.05, y - turns * .045 - hang, z + rad * .7), .008, .006, rope, 4);
  b.limb(ubV(x + rad * .85, y - turns * .045, z + rad * .5), ubV(x + rad * .75, y - turns * .045 - hang * .7, z + rad * .85), .008, .006, rope2, 4);
  const o = b.mesh(g, ubVC('rope', { roughness: 1 })); if (o) o.castShadow = false; return o; }

// ---------- the game-ready stall frame's cloth (gstallFrame calls this for every tinted awning; fruit stall keeps the model's own cloth) ----------
// The model's cloth is a smooth soft-shaded sheet. It is restyled in place (same drape): woven-linen map with seams, tint kept but faded, frayed hem threads, rope lashings.
function ubStallCloth(g, c, tint) {
  g.updateMatrixWorld(true); const cloths = []; c.traverse(o => { if (o.isMesh && (o.material.name || '').includes('Cloth')) cloths.push(o); });
  const m = ubLinen(tint, 'stall'); c.updateMatrixWorld(true);
  for (const o of cloths) { o.geometry = ubTriUV(o.geometry.clone(), .0135 / .75); o.material = m; o.castShadow = o.receiveShadow = true;
    // hem: boundary edges of the sheet that hang free (not the part resting on top), threaded every few cm
    const ge = o.geometry, p = ge.attributes.position, ix = ge.index, key = i => Math.round(p.getX(i) * 8) + ',' + Math.round(p.getY(i) * 8) + ',' + Math.round(p.getZ(i) * 8), cnt = new Map(), ed = [];
    if (!ix) continue; for (let i = 0; i < ix.count; i += 3) for (let e = 0; e < 3; e++) { const a = ix.getX(i + e), b = ix.getX(i + (e + 1) % 3), ka = key(a), kb = key(b), k = ka < kb ? ka + '|' + kb : kb + '|' + ka; const q = cnt.get(k); if (q) q.n++; else { const t = { n: 1, a, b }; cnt.set(k, t); ed.push(t); } }
    const pts = [], va = ubV(0, 0, 0), vb = ubV(0, 0, 0); let carry = 0; const step = .04;
    for (const t of ed) { if (t.n !== 1) continue; va.fromBufferAttribute(p, t.a).applyMatrix4(o.matrixWorld); vb.fromBufferAttribute(p, t.b).applyMatrix4(o.matrixWorld);
      const gy = g.worldToLocal(va.clone()), hy = g.worldToLocal(vb.clone()); if (gy.y < .5 && hy.y < .5) continue; const ln = gy.distanceTo(hy); let s = carry;
      while (s < ln) { pts.push(gy.clone().lerp(hy, s / (ln || 1))); s += step; } carry = s - ln; }
    if (pts.length > 300) { const k = Math.ceil(pts.length / 300); for (let i = pts.length - 1; i >= 0; i--) if (i % k) pts.splice(i, 1); }
    ubFringe(g, pts, new THREE.Color(m.color).multiplyScalar(.93).getStyle(), .06, 991 + cloths.indexOf(o)); }
  // rope lashings under the cloth where it rests on the four posts, with loose ends
  const post = [[-1.6, -1.2, 3.3], [1.6, -1.2, 3.3], [-1.6, 1.1, 2.75], [1.6, 1.1, 2.75]]; for (const [px, pz, py] of post) ubLash(g, px, py, pz, .12, 3, .22); }

// ---------- the goods of the scribe's and the potter's crates (called from fillCrate; keeps the seeded-random draws the old code made) ----------
function ubClay(k) { const d = { terra: ['#c47a4a', .6, 1], buff: ['#d8bc8c', .65, 1], red: ['#a84a2a', .4, 0], black: ['#2c2320', .22, 0], slip: ['#e4cfa6', .55, 0], dark: ['#7a4a2c', .5, 0] }[k]; const key = 'ubclay' + k;
  return UBMAT[key] || (UBMAT[key] = new THREE.MeshStandardMaterial({ color: d[0], roughness: d[1], map: d[2] ? TEX.pot : null, flatShading: false })); }
const UB_PROF = {
  oino: [[0, 0], [.045, 0], [.052, .012], [.088, .07], [.105, .135], [.088, .2], [.046, .24], [.038, .262], [.058, .288]],
  round: [[0, 0], [.05, 0], [.1, .04], [.12, .1], [.1, .17], [.052, .2], [.046, .235], [.066, .258]],
  tall: [[0, 0], [.03, 0], [.058, .05], [.075, .15], [.06, .235], [.03, .29], [.028, .335], [.05, .358]],
  bowl: [[0, 0], [.04, 0], [.045, .012], [.09, .05], [.122, .1], [.128, .112]],
  deep: [[0, 0], [.035, 0], [.05, .02], [.092, .07], [.1, .12], [.092, .15]],
  kylix: [[0, 0], [.028, 0], [.024, .02], [.026, .04], [.07, .052], [.098, .078], [.1, .095]],
  beaker: [[0, 0], [.028, 0], [.042, .06], [.05, .1], [.054, .115]],
  lamp: [[0, 0], [.03, 0], [.06, .018], [.066, .04], [.05, .058], [.0, .062]],
  inkpot: [[0, 0], [.04, 0], [.058, .03], [.052, .07], [.03, .09], [.03, .1], [.04, .108]],
  holder: [[0, 0], [.045, 0], [.05, .04], [.046, .1], [.052, .115]] };
// a pot into a batch: kind in UB_PROF, scale, handles (+x / +-x) at height fraction
function ubPot(B, name, x, y, z, s, col, ry, handles, thick = .005) { const key = 'v' + name + s; const geo = ubG(key, () => ubVesselGeo(UB_PROF[name].map(p => [p[0] * s, p[1] * s]), thick * s / .8 + .002, 10)); B.geo(geo, x, y, z, col, [0, ry, 0]);
  if (handles) { const P2 = UB_PROF[name], top = P2[P2.length - 2], mid = P2[Math.max(1, P2.length - 4)], ry2 = Math.cos(ry), sy2 = Math.sin(ry);
    const hr = (top[1] - mid[1]) * s / 2 + .004, cx = (top[0] + mid[0]) * s / 2 * .93, cy = (top[1] + mid[1]) * s / 2;
    for (const sd of handles === 2 ? [-1, 1] : [1]) B.g(ubG('hd' + hr.toFixed(3), () => new THREE.TorusGeometry(hr, .0105 * s / .8 + .004, 4, 7, Math.PI)), ubM([x + sd * cx * ry2, y + cy, z - sd * cx * sy2], [0, ry, sd > 0 ? -Math.PI / 2 : Math.PI / 2]), col); } }
function ubGoods(g, kind, x, y, z, w, d) {
  if (typeof kind !== 'string') return; const R0 = n => { for (let i = 0; i < n; i++) R(0, 1); }, r = ubRng((Math.round(x * 997) * 31 + Math.round(z * 991) * 17 + kind.length * 7) | 0);
  const plain = ubVC('ubplain', { roughness: .55 }), deco = ubVC('ubdeco', { roughness: .6, map: TEX.pot }), paper = ubVC('ubpaper', { roughness: .95 }), wood = ubVC('ubwood', { roughness: .8 }), B = ubBatch(), D = ubBatch(), tint = (hex, a) => new THREE.Color(hex).offsetHSL(0, 0, (r() - .5) * a).getStyle();
  const out = (extra) => { B.mesh(g, plain); D.mesh(g, deco); if (extra) extra(); };
  const cc = { terra: '#d4875a', buff: '#e2c9a0', red: '#b4552f', black: '#32282a', slip: '#e8d6b2' };
  if (kind === 'scrolls') { R0(7); const bw = Math.min(.38, w * .85), cols = ['#e8d6a8', '#dcc592', '#efe0b8', '#d4bc88'], rows = [4, 3, 2];
    rows.forEach((n, ri) => { for (let i = 0; i < n; i++) { const px = (i - (n - 1) / 2) * .074, py = .034 + ri * .062, col = tint(cols[(i + ri) % 4], .06), L = bw * (.88 + r() * .12);
        B.cyl(x, y + py, z + px, .033, .033, L, 8, col, [0, 0, Math.PI / 2], false); B.cyl(x + (r() - .5) * .03, y + py, z + px, .0355, .0355, .02, 8, ['#8a4a34', '#6a4a30'][i & 1], [0, 0, Math.PI / 2]);
        for (const sd of [-1, 1]) B.cyl(x + sd * (L / 2 + .008), y + py, z + px, .02, .02, .018, 6, '#6a4a2c', [0, 0, Math.PI / 2]); } });
    B.mesh(g, paper); return y + .25; }
  if (kind === 'tablets') { R0(10); const tw = Math.min(.34, w * .8), td = Math.min(.24, d * .7), cw = '#4a3624', wl = '#9a7048', wd = '#80583a', h = .03;
    for (let i = 0; i < 4; i++) { const col = i % 2 ? wl : wd, ox = (r() - .5) * .02, oz = (r() - .5) * .02; B.box(x + ox, y + h / 2 + i * (h + .004), z + oz, tw, h, td, col, [0, (r() - .5) * .18, 0]); B.box(x + ox, y + i * (h + .004) + .004, z + oz + td / 2, tw * .94, .006, .008, '#4a3020'); }
    const ty = y + 3 * (h + .004) + h, rim = .026; B.box(x, ty - .004, z, tw, .008, td, wd);
    for (const [bx, bz, bw2, bd] of [[0, td / 2 - rim / 2, tw, rim], [0, -td / 2 + rim / 2, tw, rim], [-tw / 2 + rim / 2, 0, rim, td], [tw / 2 - rim / 2, 0, rim, td]]) B.box(x + bx, ty + .004, z + bz, bw2, .012, bd, '#8a6038');
    B.box(x, ty - .001, z, tw - rim * 2, .006, td - rim * 2, cw);
    for (let l = 0; l < 5; l++) B.box(x + (r() - .5) * .04, ty + .003, z - td / 2 + rim + .02 + l * .028, tw * (.55 + r() * .3) , .002, .004, '#9a8062');
    B.cyl(x + tw / 2 - .005, ty + .008, z, .006, .006, tw * .02 + .04, 5, '#c9a064', [Math.PI / 2, 0, 0.0]); B.limb(ubV(x - tw / 2, ty + .01, z - td / 2 + .03), ubV(x - tw / 2 - .05, ty - .06, z - td / 2 + .06), .004, .004, '#6a4a30', 4);
    B.limb(ubV(x - .05, ty + .016, z + td / 2 - .045), ubV(x + .1, ty + .016, z + td / 2 - .035), .005, .002, '#c9b484', 4);
    // an open pair standing against the back
    for (const sd of [-1, 1]) B.box(x + .15 + sd * .03, y + .09, z - td / 2 - .02 + sd * .035, .22, .17, .018, sd < 0 ? wl : wd, [-.07, .0, 0]);
    B.mesh(g, wood); return y + .22; }
  if (kind === 'ink') { const dk = '#2a2630', cols = [dk, '#4a3030', '#2c3a40'];
    for (let i = 0; i < 3; i++) { const px = x + (i - 1) * w * .3, pz = z + (i === 1 ? -d * .18 : d * .12), s = [1, .85, 1][i]; ubPot(B, 'inkpot', px, y, pz, s * 1.35, cols[i], r() * 6, 0, .006); B.cyl(px, y + .082 * s * 1.35, pz, .028 * s * 1.35, .028 * s * 1.35, .004, 8, '#0c0a10', null); }
    const qx = x + w * .3, qz = z - d * .1; ubPot(B, 'holder', qx, y, qz, 1.05, '#b9693f', 0, 0, .006);
    for (let q = 0; q < 3; q++) { const tl = .24 + r() * .07, a = (q - 1) * .26, b2 = (r() - .5) * .3, top = ubV(qx + Math.sin(a) * .3 * tl, y + .06 + tl * Math.cos(a), qz + Math.sin(b2) * .3 * tl), bot = ubV(qx + Math.sin(a) * .01, y + .04, qz);
      B.limb(bot, top, .003, .0045, '#e8e0cc', 4); const mid = bot.clone().lerp(top, .62), van = [['#f2ead6'], ['#d8d0b8']][q % 2][0]; B.geo(ubG('vane', () => new THREE.SphereGeometry(1, 6, 4)), mid.x, mid.y + .02, mid.z, van, [0, 0, -a], [.011, .078, .002]); }
    B.sph(x - w * .15, y + .012, z + d * .2, .045, .02, .035, '#d8c8a0', 6);
    B.mesh(g, plain); return y + .3; }
  if (kind === 'letters') { R0(18);
    for (let i = 0; i < 6; i++) { const lx = (r() - .5) * .05, lz = (r() - .5) * .05, ry = (r() - .5) * .8, py = y + .008 + i * .019; B.box(x + lx, py, z + lz, w * .5, .015, d * .42, ['#eadbb0', '#e2d0a0', '#efe2bc'][i % 3], [0, ry, 0]); B.box(x + lx, py + .0085, z + lz, w * .5, .001, .006, '#8a7048', [0, ry, 0]); }
    const ty = y + .008 + 5 * .019 + .009; B.limb(ubV(x - w * .22, ty + .002, z), ubV(x + w * .22, ty + .002, z), .003, .003, '#7a5a38', 4); B.limb(ubV(x, ty + .002, z - d * .2), ubV(x, ty + .002, z + d * .2), .003, .003, '#7a5a38', 4);
    B.cyl(x, ty + .008, z, .03, .032, .012, 9, '#b8331f'); B.cyl(x, ty + .015, z, .02, .02, .004, 9, '#8f2514');
    for (const sd of [-1, 1]) { B.cyl(x + sd * w * .3, y + .04, z - d * .2, .028, .028, w * .28, 7, '#e0cf9c', [0, 0, Math.PI / 2]); B.cyl(x + sd * w * .3, y + .04, z - d * .2, .031, .031, .02, 7, '#a4331f', [0, 0, Math.PI / 2]); }
    B.mesh(g, paper); return y + .2; }
  if (kind === 'jugs') { const defs = [['oino', 1, 'terra', 1, 1], ['tall', .86, 'black', 0, 2], ['round', .9, 'buff', 1, 1], ['oino', .8, 'red', 0, 1]];
    defs.forEach(([nm, s, cn, dc, hd], i) => { const px = x + (i % 2 - .5) * w * .56, pz = z + ((i >> 1) - .5) * d * .52, col = cc[cn]; ubPot(dc ? D : B, nm, px, y, pz, s * 1.12, col, r() * 6.28, hd); }); out(); return y + .3; }
  if (kind === 'bowls') { const stack = (px, pz, list) => list.forEach(([nm, s, cn], i) => ubPot(i % 2 ? B : D, nm, px, y + i * .024 + .002, pz, s, cc[cn], r() * 6, 0, .004));
    stack(x - w * .26, z + d * .05, [['bowl', .92, 'terra'], ['bowl', .83, 'buff'], ['bowl', .74, 'terra']]); stack(x + w * .26, z - d * .05, [['deep', 1, 'red'], ['deep', .9, 'black'], ['deep', .8, 'buff'], ['deep', .7, 'terra']]);
    ubPot(B, 'bowl', x, y + .01, z + d * .3, .6, cc.black, 0, 0, .004); out(); return y + .18; }
  if (kind === 'lamps') { const cs = ['terra', 'black', 'buff', 'red'];
    for (let i = 0; i < 4; i++) { const lx = x + (i % 2 - .5) * w * .52, lz = z + ((i >> 1) - .5) * d * .5, ry = r() * 6.28, col = cc[cs[i]], tg = i % 2 ? D : B, ls = 1.25; ubPot(tg, 'lamp', lx, y, lz, ls, col, ry, 0, .004);
      const cr = Math.cos(ry), sr = Math.sin(ry); tg.cyl(lx + cr * .11, y + .045, lz - sr * .11, .02, .025, .075, 6, col, [0, ry, Math.PI / 2 - .05]); tg.cyl(lx + cr * .148, y + .05, lz - sr * .148, .014, .014, .008, 6, '#2a2018', [0, ry, Math.PI / 2]);
      tg.g(ubG('lring', () => new THREE.TorusGeometry(.026, .008, 4, 8)), ubM([lx - cr * .09, y + .058, lz + sr * .09], [0, ry + Math.PI / 2, 0], [1.25, 1.25, 1.25]), col); tg.cyl(lx, y + .074, lz, .022, .022, .004, 7, '#2a2018'); }
    out(); return y + .1; }
  if (kind === 'cups') { const defs = [['beaker', 1.25, 'buff', 0, 0], ['kylix', .8, 'black', 1, 2], ['beaker', 1.25, 'terra', 1, 0], ['kylix', .8, 'terra', 0, 2], ['deep', .62, 'red', 0, 0], ['beaker', 1.1, 'slip', 0, 1]];
    defs.forEach(([nm, s, cn, dc, hd], i) => { ubPot(dc ? D : B, nm, x + ((i % 3) - 1) * w * .32, y, z + ((i / 3 | 0) - .5) * d * .45, s, cc[cn], r() * 6.28, hd, .004); }); out(); return y + .12; }
  if (kind === 'honey') { for (let i = 0; i < 3; i++) { const jg = new THREE.Group(); jg.position.set(x + (i - 1) * w * .35, y, z); g.add(jg); ubHoneyJar(jg, 0, 0, 0, false); jg.scale.setScalar(.5); } return y + .35; }
}

// ---------- hanging scales: a balance with a turned upright, a pivoting beam, hung pans on cords, and graded weights ----------
P.scale = (g, x, y, z) => { const wd = ubBatch(), br = ubBatch(), cd = ubBatch(), W = '#7a5232', Wl = '#9a6e44', BR = '#b8893a', BD = '#8a6428', rope = '#6a5236', lead = '#6e6a64';
  const sub = new THREE.Group(); sub.position.set(x, y, z); g.add(sub);
  // plinth and turned upright (foot, swelling, rings, capital)
  wd.box(0, .022, 0, .98, .044, .25, '#5e4128'); wd.box(0, .052, 0, .94, .016, .22, Wl);
  wd.lathe([[0, .06], [.105, .06], [.105, .075], [.08, .092], [.058, .12], [.036, .15], [.036, .3], [.048, .322], [.036, .345], [.036, .52], [.05, .548], [.036, .576], [.032, .6], [.032, .7], [.045, .72], [.045, .74]], 10, 0, 0, 0, W);
  for (const sd of [-1, 1]) wd.box(0, .81, sd * .026, .11, .17, .014, Wl); wd.box(0, .74, 0, .11, .02, .066, W); wd.box(0, .905, 0, .12, .022, .07, W); wd.sph(0, .955, 0, .034, .034, .034, Wl, 8); wd.cyl(0, .94, 0, .012, .018, .03, 6, W);
  br.cyl(0, .82, 0, .011, .011, .085, 8, BR, [Math.PI / 2, 0, 0]); for (const sd of [-1, 1]) br.cyl(0, .82, sd * .047, .02, .02, .008, 8, BD, [Math.PI / 2, 0, 0]);
  // the beam, tilted a little: the grain side hangs lower
  const th = -.05, c = Math.cos(th), s = Math.sin(th), bm = new THREE.Group(); bm.position.set(0, .82, 0); bm.rotation.z = th; sub.add(bm);
  const bb = ubBatch(); bb.limb(ubV(-.44, 0, 0), ubV(0, 0, 0), .011, .022, BR, 6); bb.limb(ubV(0, 0, 0), ubV(.44, 0, 0), .022, .011, BR, 6); bb.cyl(0, 0, 0, .033, .033, .03, 10, BD, [Math.PI / 2, 0, 0]);
  bb.limb(ubV(0, 0, 0), ubV(0, .082, 0), .007, .002, BD, 4); for (const sd of [-1, 1]) { bb.sph(sd * .44, 0, 0, .018, .018, .018, BD, 6); bb.g(ubG('ring', () => new THREE.TorusGeometry(.016, .0045, 4, 8)), ubM([sd * .44, -.03, 0]), BR); }
  bb.mesh(bm, ubVC('ubbronze', { metalness: .55, roughness: .38 }));
  // pans on three cords each, converging to the ring on the beam end
  for (const sd of [-1, 1]) { const ex = sd * .44 * c - (-.03) * s, ey = .82 + sd * .44 * s + (-.03) * c, py = .44 + (sd > 0 ? -.015 : .015), R2 = .155, ring = ubV(ex, ey, 0);
    for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / 3 + (sd > 0 ? .2 : 0); cd.limb(ring, ubV(ex + Math.cos(a) * R2, py + .04, Math.sin(a) * R2), .0028, .0028, rope, 3); }
    br.geo(ubG('pan', () => ubVesselGeo([[0, 0], [.07, .004], [.125, .022], [.158, .048], [.164, .054]], .005, 14)), ex, py, 0, BR);
    br.g(ubG('panring', () => new THREE.TorusGeometry(.162, .006, 4, 14)), ubM([ex, py + .054, 0], [Math.PI / 2, 0, 0]), BD); br.cyl(ex, py - .006, 0, .035, .05, .016, 8, BD);
    if (sd > 0) { // grain heaped in the heavy pan, a scoop's worth
      const gr = ubBatch(); gr.sph(ex, py + .04, 0, .125, .05, .115, '#d6b86c', 9); gr.sph(ex - .02, py + .075, .01, .08, .035, .075, '#dec27a', 7); for (let i = 0; i < 9; i++) { const a = i * 2.4; gr.sph(ex + Math.cos(a) * .085, py + .085 - i * .002, Math.sin(a) * .075, .014, .01, .01, i % 2 ? '#c9a95a' : '#e6cc8a', 4); }
      gr.mesh(sub, ubVC('ubgrain', { roughness: 1, flatShading: true })); }
    else { for (let k = 0; k < 4; k++) br.cyl(ex - .02 + (k % 2) * .004, py + .005 + k * .0085, .02, .026, .026, .0072, 10, k % 2 ? '#c9a04a' : '#dcb458'); // coins on a pan
      br.lathe([[0, 0], [.028, 0], [.034, .008], [.03, .032], [.018, .048], [.012, .056], [.016, .06], [.0, .06]], 8, ex + .06, py + .005, -.045, lead); br.lathe([[0, 0], [.022, 0], [.027, .006], [.023, .026], [.012, .038], [.0, .04]], 8, ex + .02, py + .005, -.07, lead);
      for (let k = 0; k < 3; k++) br.cyl(ex + .07 + k * .006, py + .005 + k * .0085, .05, .02, .02, .007, 8, '#d0a850'); } }
  // calibrated weights on the plinth, graded, with a stamped band
  [[.34, .036, 1], [.405, .03, .86], [.455, .033, .7], [-.34, .03, .86], [-.4, .03, .7]].forEach(([wx, wz, sc], i) => { const col = i < 3 ? BR : lead; br.lathe([[0, 0], [.036, 0], [.042, .01], [.04, .03], [.03, .05], [.018, .066], [.012, .074], [.018, .082], [.01, .09], [.0, .09]], 8, wx, .062, .07 - wz * .6, col, null, sc * .85); });
  br.mesh(sub, ubVC('ubbronze', { metalness: .55, roughness: .38 })); wd.mesh(sub, ubVC('ubwoodS', { roughness: .8 })); cd.mesh(sub, ubVC('ubcord', { roughness: 1 })); return y + .99; };

// ---------- jar of honey ----------
function ubHoneyTex() { if (UBG.honeyTex) return UBG.honeyTex; const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d'), r = ubRng(31);
  x.fillStyle = '#b8703e'; x.fillRect(0, 0, 64, 128); for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(${r() < .5 ? '255,220,170' : '90,45,20'},${.05 + r() * .06})`; x.fillRect(r() * 64, r() * 128, 2, 2); }
  // dark brown glaze poured over the upper two thirds with irregular drips (v runs bottom->top along the outline, canvas y is flipped)
  x.fillStyle = '#5a3018'; x.beginPath(); x.moveTo(0, 0); x.lineTo(64, 0); for (let i = 64; i >= 0; i -= 2) x.lineTo(i, 100 - (Math.sin(i * .5) * 4 + (r() * 8) + (i % 14 < 3 ? 12 : 0))); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,200,120,.12)'; x.fillRect(0, 0, 64, 6); x.fillStyle = 'rgba(40,20,8,.3)'; x.fillRect(0, 100, 64, 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return (UBG.honeyTex = t); }
const UB_HONEY = [[0, 0], [.07, 0], [.088, .012], [.15, .07], [.19, .15], [.185, .24], [.15, .33], [.09, .4], [.082, .46], [.09, .5], [.11, .535], [.12, .55]];
function ubHoneyJar(g, x, y, z, full = true) { const s = 1, jar = ubG('honeyJar', () => ubVesselGeo(ubSmooth(UB_HONEY, 2), .014, 18));
  const m = UBMAT.honeyClay || (UBMAT.honeyClay = new THREE.MeshStandardMaterial({ color: '#ffffff', map: ubHoneyTex(), roughness: .38, flatShading: false }));
  add(jar, m, x, y, z, g); const hon = UBMAT.honey || (UBMAT.honey = new THREE.MeshStandardMaterial({ color: '#e0a22a', roughness: .12, metalness: 0, emissive: '#7a3f00', emissiveIntensity: .35, flatShading: false, side: THREE.DoubleSide }));
  // honey in the open mouth, a little below the rim, domed
  const surf = add(new THREE.SphereGeometry(.094, 12, 4, 0, Math.PI * 2, 0, .35), hon, x, y + .447, z, g); surf.scale.set(1, .22, 1); surf.castShadow = false;
  // a strand of honey run down the outside from the lip, ending in a fat drop, and a second short one
  const hv = (a, r0, rr, yt, yb, rad, hr, mm) => { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8, yy = yt + (yb - yt) * t, v = UB_HONEY.reduce((p, q, k) => (k && yy >= UB_HONEY[k - 1][1] && yy <= q[1]) ? UB_HONEY[k - 1][0] + (q[0] - UB_HONEY[k - 1][0]) * (yy - UB_HONEY[k - 1][1]) / (q[1] - UB_HONEY[k - 1][1]) : p, .1) + .006 + Math.sin(t * 3) * .002; pts.push(ubV(x + Math.cos(a) * v, y + yy, z + Math.sin(a) * v)); }
    const st = add(ubStrandGeo(pts, rad, rad * .75, 5), mm, 0, 0, 0, g); st.castShadow = false; const top = add(new THREE.SphereGeometry(rad * 1.1, 6, 4), mm, pts[0].x, pts[0].y, pts[0].z, g); top.castShadow = false; const e = pts[8]; const dr = add(new THREE.SphereGeometry(hr, 7, 5), mm, e.x, e.y - hr * .5, e.z, g); dr.scale.set(1, 1.5, 1); dr.castShadow = false; };
  hv(.5, 0, 0, .53, .27, .0125, .021, hon); hv(.5 + .55, 0, 0, .51, .37, .0095, .016, hon); hv(.5 - .5, 0, 0, .5, .41, .008, .013, hon);
  if (!full) return y + .65;
  // the dipper: turned head with grooves, long handle leaning over the lip, honey glazing its head
  const hd = ubBatch(), dk = ubV(x - .04, y + .485, z - .02), tip = ubV(x + .28, y + .69, z + .09); hd.limb(dk, tip, .0095, .0075, '#8a5a30', 6); hd.cyl(tip.x, tip.y, tip.z, .012, .012, .008, 6, '#6a4220', null);
  const dv = tip.clone().sub(dk).normalize(), dq = new THREE.Quaternion().setFromUnitVectors(ubV(0, 1, 0), dv), E = new THREE.Euler().setFromQuaternion(dq);
  hd.lathe([[0, -.034], [.018, -.03], [.03, -.02], [.032, -.012], [.022, -.008], [.034, 0], [.036, .01], [.024, .014], [.034, .024], [.03, .034], [.0, .04]], 9, dk.x - dv.x * .02, dk.y - dv.y * .02, dk.z - dv.z * .02, '#a0683a', [E.x, E.y, E.z]);
  hd.mesh(g, ubVC('ubdipper', { roughness: .75 })); const glaze = add(new THREE.SphereGeometry(.036, 8, 5), hon, dk.x - dv.x * .022, dk.y - dv.y * .022, dk.z - dv.z * .022, g); glaze.scale.set(1, 1, 1); glaze.castShadow = false; glaze.scale.multiplyScalar(.97);
  const tr = [ubV(dk.x - dv.x * .035, dk.y - dv.y * .035 - .012, dk.z - dv.z * .035), ubV(dk.x - dv.x * .04, y + .46, dk.z - dv.z * .04 + .004)]; add(ubStrandGeo(tr, .0045, .003, 4), hon, 0, 0, 0, g).castShadow = false;
  // a saucer with a piece of honeycomb dripping on it, set beside the jar
  const sx = x - .36, sz = z + .1, sc = UBMAT.saucer || (UBMAT.saucer = new THREE.MeshStandardMaterial({ color: '#c47a4a', map: TEX.pot, roughness: .6, flatShading: false }));
  add(ubG('saucer', () => ubVesselGeo([[0, 0], [.05, 0], [.09, .014], [.12, .03], [.126, .034]], .005, 14)), sc, sx, y, sz, g);
  const cb = ubBatch(), hx = [[0, 0], [.044, 0], [-.044, 0], [.022, .038], [-.022, .038], [.022, -.038], [-.022, -.038]]; hx.forEach(([a, b], i) => { cb.cyl(sx + a, y + .042 + (i === 0 ? .008 : 0), sz + b, .027, .027, .04 + (i === 0 ? .016 : 0), 6, ['#e8c35a', '#e0b648', '#ecc862'][i % 3], [0, Math.PI / 6, 0]); cb.cyl(sx + a, y + .062 + (i === 0 ? .016 : 0), sz + b, .019, .019, .006, 6, ['#d99a22', '#c98a18'][i & 1], [0, Math.PI / 6, 0]); });
  cb.mesh(g, ubVC('ubcomb', { roughness: .6, flatShading: true })); const pud = add(new THREE.CircleGeometry(.07, 12), hon, sx + .02, y + .036, sz - .03, g); pud.rotation.x = -Math.PI / 2; pud.scale.set(1, .8, 1); pud.castShadow = false;
  return y + .69; }
P.honey = (g, x, y, z) => ubHoneyJar(g, x, y, z, true);

// ---------- the cloth stall with a green awning: scalloped, sagging awning on posts, folded stacks, rolled bolts, hanging dyed cloth, measuring rod ----------
function ubSheetGeo(nx, nz, fn, sc) { const pos = [], uv = [], idx = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const q = fn(i / nx, j / nz, i, j); pos.push(q[0], q[1], q[2]); uv.push(q[0] * sc, (q[2] + q[1] * .6) * sc); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
function ubClothStall(g, x, y, z) { const sub = new THREE.Group(); sub.position.set(x, y, z); g.add(sub); const r = ubRng(2209);
  // posts (back 3.7, front 3.1), side rails, front/back beams
  for (const [a, b, h] of [[-1.8, -1.2, 3.52], [1.8, -1.2, 3.52], [-1.8, 1.2, 2.9], [1.8, 1.2, 2.9]]) { box(.15, h, .15, 'wood', a, 0, b, sub); box(.2, .06, .2, 'woodLt', a, h - .03, b, sub); }
  for (const sd of [-1, 1]) { const l = ubBatch(); l.limb(ubV(sd * 1.8, 3.4, -1.2), ubV(sd * 1.8, 2.8, 1.2), .05, .05, '#7a5434', 4); l.limb(ubV(sd * 1.8, 2.5, -1.2), ubV(sd * 1.8, 2.5, 1.2), .035, .035, '#7a5434', 4); l.mesh(sub, ubVC('ubwoodS', { roughness: .8 })); }
  box(3.7, .08, .1, 'wood', 0, 2.8, 1.2, sub); box(3.7, .08, .1, 'wood', 0, 3.4, -1.2, sub);
  // the awning: tied at four posts, sagging between them, slack folds running down from the ties, scalloped valance in front
  const NX = 45, NZ = 8, VR = 3, fe = (u, v) => 0; const W = 2.15, zb = -1.35, zf = 1.55, sc = 1 / .75;
  const roof = (xx, zz) => { const t = (zz - zb) / (zf - zb), base = 3.74 - t * .66, ex = Math.abs(xx) / W, sag = (1 - Math.min(1, ex * ex)) * (.15 * Math.pow(Math.abs(t - .5) * 2, 1.6) + .05), over = Math.max(0, Math.abs(xx) - 1.8), drop = over * over * 2.4 + Math.max(0, t - .92) * .4 + Math.max(0, .08 - t) * .5;
    const folds = .024 * Math.sin(xx * 6.8 + zz * 1.4 + .6) * (.3 + Math.abs(t - .5) * 1.4) + .014 * Math.sin(xx * 15 - zz * 2) * .6 + .02 * Math.sin((xx - Math.sign(xx) * 1.8) * 9 + zz * 4) * Math.min(1, Math.abs(xx) / 1.2) * (1 - Math.abs(t - .5)); return base - sag - drop + folds; };
  const awn = ubSheetGeo(NX + 0, NZ + VR, (u, v, i, j) => { const xx = (u - .5) * 2 * W; if (j <= NZ) { const zz = zb + (zf - zb) * j / NZ; return [xx, roof(xx, zz), zz]; }
    const k = j - NZ, ph = (i % 5) / 5, bulge = Math.sqrt(Math.max(0, 1 - Math.pow(ph * 2 - 1, 2))), len = .08 + .17 * bulge, f = k / VR; return [xx, roof(xx, zf) - len * f - Math.sin(xx * 5.5 + 1) * .008 * f, zf + .05 * f + Math.sin(f * 1.5) * .03]; }, sc);
  const awm = ubLinen('#7d9a62', 'cl'); const aw = add(awn, awm, 0, 0, 0, sub); aw.receiveShadow = true;
  { const pts = []; for (let i = 0; i <= NX; i++) { const p = awn.attributes.position, ix = (NZ + VR) * (NX + 1) + i; pts.push(ubV(p.getX(ix), p.getY(ix), p.getZ(ix))); } ubFringe(sub, pts, '#7d8f58', .05, 313);
    const pl = [], pr = []; for (let j = 0; j <= NZ + VR; j++) { const p = awn.attributes.position; for (const [arr, i] of [[pl, 0], [pr, NX]]) { const ix = j * (NX + 1) + i; arr.push(ubV(p.getX(ix), p.getY(ix), p.getZ(ix))); } } ubFringe(sub, pl.concat(pr), '#7d8f58', .045, 317); }
  // ties: rope lashings on the post heads, a loop over each corner, loose ends
  for (const [a, b, h] of [[-1.8, -1.2, 3.3], [1.8, -1.2, 3.3], [-1.8, 1.2, 2.7], [1.8, 1.2, 2.7]]) ubLash(sub, a, h, b, .13, 3, .26);
  for (const sd of [-1, 1]) { const o = ubBatch(); o.limb(ubV(sd * 2.0, roof(sd * 2.0, -1.3) - .02, -1.3), ubV(sd * 1.84, 3.3, -1.2), .012, .01, '#b09865', 4); o.limb(ubV(sd * 2.02, roof(sd * 2.02, 1.5) - .04, 1.5), ubV(sd * 1.86, 2.72, 1.2), .012, .01, '#b09865', 4); o.mesh(sub, ubVC('rope', { roughness: 1 })); }
  // counter with an apron of cloth, shelf and the goods
  box(3.6, .12, 1.3, 'woodLt', 0, 1, .7, sub); for (const sd of [-1, 1]) { box(.12, 1, .12, 'wood', sd * 1.6, 0, 1.2, sub); box(.12, 1, .12, 'wood', sd * 1.6, 0, .2, sub); } box(3.4, .06, .1, 'wood', 0, .45, 1.2, sub);
  const colors = ['#c94a3a', '#3f6f9a', '#e0b44a', '#efe6d4'], st = ubBatch(), edge = ubBatch();
  colors.forEach((c0, s) => { const cx = -1.38 + s * .86, n = 7 + s % 2, w0 = .66, d0 = .46; for (let i = 0; i < n; i++) { const ww = w0 * (.97 + r() * .06), dd = d0 * (.97 + r() * .05), hh = .043, py = 1.06 + .028 + i * hh * .94, col = new THREE.Color(c0).offsetHSL(0, 0, (i % 2 ? .04 : -.03) + (r() - .5) * .03).getStyle(), ox = (r() - .5) * .03, oz = (r() - .5) * .03;
      st.box(cx + ox, py, .5 + oz, ww, hh * .9, dd, col); st.cyl(cx + ox, py, .5 + oz + dd / 2, hh * .46, hh * .46, ww, 6, col, [0, 0, Math.PI / 2]); st.cyl(cx + ox, py, .5 + oz - dd / 2 + .01, hh * .42, hh * .42, ww * .98, 6, new THREE.Color(col).multiplyScalar(.92).getStyle(), [0, 0, Math.PI / 2]);
      if (i % 3 === 1) st.box(cx + ox, py + hh * .48, .5 + oz + dd * .38, ww * .98, .004, .012, new THREE.Color(c0).multiplyScalar(.6).getStyle()); }
    st.box(cx, 1.06 + .028 + n * .043 * .94 + .012, .5, .5, .006, .34, new THREE.Color(c0).multiplyScalar(1.06).getStyle()); });
  st.mesh(sub, ubVLinen('ubstack'), 1 / .75);
  // measuring rod along the counter front, with marks every hand and a brass tip
  const rod = ubBatch(), rx0 = -.1, rx1 = 1.65; rod.box((rx0 + rx1) / 2, 1.14, 1.25, rx1 - rx0, .03, .04, '#a47a4a'); for (let i = 0; i <= 17; i++) rod.box(rx0 + i * (rx1 - rx0) / 17, 1.157, 1.25, .006, .003, i % 5 === 0 ? .042 : .026, '#3a2818'); for (const e of [rx0, rx1]) rod.box(e, 1.14, 1.25, .018, .034, .044, '#b8893a');
  rod.limb(ubV(.2, 1.07, 1.0), ubV(.5, 1.07, 1.1), .012, .012, '#6a4a2c', 4); rod.mesh(sub, ubVC('ubwoodS', { roughness: .8 }));
  // back shelf with rolled bolts end-on (spiral cores), and two dyed cloths hung over the back beam
  box(2.1, .06, .55, 'woodLt', -.95, 1.45, -.95, sub); for (const sx of [-1.9, -.05]) box(.08, .5, .5, 'wood', sx, 1.0, -.95, sub);
  const bo = ubBatch(), bcol = ['#9a2f2f', '#d9b04a', '#3f6f9a', '#efe6d4', '#6a8a4a', '#7a3b6a'];
  [[6, 0], [5, .5]].forEach(([n, off], row) => { for (let i = 0; i < n; i++) { const bx = -1.78 + (i + off) * .2, by = 1.48 + .1 + row * .17, col = bcol[(i * 2 + row * 3) % 6], dk = new THREE.Color(col).multiplyScalar(.7).getStyle();
      bo.cyl(bx, by, -.95, .095, .095, .44, 9, col, [Math.PI / 2, 0, 0], true); bo.cyl(bx, by, -.727, .098, .098, .014, 9, dk, [Math.PI / 2, 0, 0]); bo.cyl(bx, by, -.728, .07, .07, .016, 9, col, [Math.PI / 2, 0, 0]); bo.cyl(bx, by, -.729, .034, .034, .018, 7, '#d8c08a', [Math.PI / 2, 0, 0]); bo.cyl(bx, by, -.95, .099, .099, .03, 9, dk, [Math.PI / 2, 0, 0]); } });
  bo.mesh(sub, ubVLinen('ubbolt'), 1 / .75);
  const hang = (cx, len, col1, col2, w2, seed) => { const rr = ubRng(seed), top = 3.38, geo = ubSheetGeo(18, 12, (u, v, i, j) => { const f = v, xx = cx + (u - .5) * w2, fold = Math.sin(u * Math.PI * 4 + seed) * (.012 + .045 * f) + Math.sin(u * 19 + seed) * .008 * f, yy = top - f * len + Math.sin(u * 7 + seed) * .012 * f; return [xx, yy, -1.2 + .09 + fold + f * .03]; }, 1 / .75), c = geo.attributes.position.count, ca = new Float32Array(c * 3), a = new THREE.Color(col1), b = new THREE.Color(col2), t = new THREE.Color();
    for (let k = 0; k < c; k++) { const f = Math.min(1, Math.max(0, (top - geo.attributes.position.getY(k)) / len)); t.copy(a).lerp(b, Math.pow(f, .8)); ca[k * 3] = t.r; ca[k * 3 + 1] = t.g; ca[k * 3 + 2] = t.b; } geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    const m = add(geo, ubLinenVC('hang'), 0, 0, 0, sub); const pts = []; for (let i = 0; i <= 18; i++) { const ix = 12 * 19 + i, p = geo.attributes.position; pts.push(ubV(p.getX(ix), p.getY(ix), p.getZ(ix))); } ubFringe(sub, pts, col2, .05, seed + 5); };
  box(.05, .05, 2.4, 'wood', 0, 0, 0, sub).visible = false; { const p2 = ubBatch(); p2.limb(ubV(-1.8, 3.38, -1.2 + .02), ubV(1.8, 3.38, -1.2 + .02), .035, .035, '#7a5434', 6); p2.mesh(sub, ubVC('ubwoodS', { roughness: .8 })); }
  hang(.55, 1.7, '#d9e0e8', '#27487a', .78, 11); hang(1.38, 1.35, '#e8d6b8', '#a8423a', .66, 23);
  return y + 3.8; }
function ubVLinen(key) { return UBMAT['vl' + key] || (UBMAT['vl' + key] = new THREE.MeshStandardMaterial({ vertexColors: true, map: ubLinenTex(), bumpMap: ubLinenTex(), bumpScale: .8, roughness: 1, flatShading: false })); }
function ubLinenVC(key) { return UBMAT['lvc' + key] || (UBMAT['lvc' + key] = new THREE.MeshStandardMaterial({ vertexColors: true, map: ubLinenTex(), bumpMap: ubLinenTex(), bumpScale: 1, roughness: 1, side: THREE.DoubleSide, flatShading: false })); }

// the registry captured the old builders when colossae.js loaded; point the two entries at the new ones
OBJECTS.get('hanging-scales').fn = P.scale; OBJECTS.get('honey-jar').fn = P.honey;
