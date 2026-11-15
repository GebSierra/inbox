// ---------- UPGRADE: the black goat-hair tent of the camp (owner, 2026-11-14: "make the tents surrounding the Tabernacle look better") ----------
// upTent(g, x, y, z, rot, s, col, o) builds a desert tent: a long low roof of woven goat-hair strips over three ridge poles, sagging between
// them, the cloth pulled out at the sides by guy ropes to stakes, the back and ends walled, the front raised on two poles as an awning over
// a dark open interior, a striped dividing curtain, and (some) a rug, a water jar and hearth stones at the door. Front is +z before rot.
//   s: size; col: the cloth colour (hex); o.mat: draw the rug (the old tent's 35% roll is passed in); o.seed: varies jar, hearth and rope angles
// One shared woven texture, tinted per tent colour; no R() (the camp's own random draws are made by its caller exactly as before).
const UTENT = {};
const utWeave = () => UTENT.weave || (UTENT.weave = upTex('utWeave', 128, 128, (c, w, h, r) => { c.fillStyle = '#d8d8d8'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { c.fillStyle = `rgba(0,0,0,${.18 + r() * .12})`; c.fillRect(0, y, w, 2); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, y + 3, w, 1); }
  c.fillStyle = 'rgba(255,236,200,.32)'; c.fillRect(0, 36, w, 5); c.fillRect(0, 100, w, 5); c.fillStyle = 'rgba(255,236,200,.16)'; c.fillRect(0, 44, w, 2); c.fillRect(0, 108, w, 2);   // the paler bands woven into goat-hair cloth   // the seams between the woven strips
  for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${.05 + r() * .07})`; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1); } }));   // coarse hair weave
const utCloth = col => { const k = 'utCloth' + col; return M[k] || (M[k] = new THREE.MeshStandardMaterial({ color: col, map: utWeave(), roughness: 1, side: THREE.DoubleSide, flatShading: false })); };
function upTent(g, x, y, z, rot = 0, s = 1, col = '#3a302a', o = {}) {
  const r = upRng(Math.round(x * 811) ^ Math.round(z * 1307) ^ (o.seed || 0)), G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = rot; G.scale.setScalar(s); g.add(G);
  const B = upBag(), cloth = utCloth(col), dark = mat('utInside', '#14100c', { roughness: 1, side: THREE.DoubleSide }), pole = mat('utPole', '#6a5034', { roughness: .9 }),
    rope = mat('utRope', '#9a8a6a', { roughness: 1 }), W = 3.8, D = 2.8, H = 1.75, eave = .55, sx = 10, sz = 7;
  // ---- roof: a cloth grid; ridge at z = 0, sloping to the eaves at the sides, sagging between the three ridge poles ----
  const roofY = (u, v) => { const ridge = H - .34 * Math.pow(Math.sin(Math.PI * ((u + 1) * 1.5 % 1)), 2) * (Math.abs(u) < .98 ? 1 : 0), fall = Math.pow(Math.abs(v), 1.35);
    return ridge - (ridge - eave - .35) * fall - (v > 0 ? 0 : .18 * fall); };
  { const pos = [], uv = [], idx = [];
    for (let j = 0; j <= sz; j++) for (let i = 0; i <= sx; i++) { const u = i / sx * 2 - 1, v = j / sz * 2 - 1, front = v > .55 ? (v - .55) / .45 : 0;
      // the front third lifts into an awning: flatter and higher, reaching out beyond the walls
      pos.push(u * W / 2, roofY(u, v) + front * front * .55, v * D / 2 + front * .55); uv.push(u * 2.2, v * 1.6); }
    for (let j = 0; j < sz; j++) for (let i = 0; i < sx; i++) { const a = j * (sx + 1) + i, b = a + 1, c = a + sx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals(); B.put(cloth, geo); }
  // ---- walls: the back hangs from the back eave to the ground, with a little flare; the two ends close the sides ----
  { const back = new THREE.PlaneGeometry(W, .001, 8, 1), p = back.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (W / 2), top = p.getY(i) > 0; p.setXYZ(i, p.getX(i), top ? roofY(u, -1) : .14 + Math.sin(u * 7) * .04, top ? -D / 2 : -D / 2 - .08 + Math.sin(u * 9) * .03); }   // the hem hangs a hand above the sand
    back.computeVertexNormals(); B.put(cloth, back); }
  for (const e of [-1, 1]) { const pts = []; for (let j = 0; j <= 6; j++) { const v = j / 6 * 2 - 1; if (v > .55) break; pts.push([v * D / 2, roofY(e, v)]); }
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0] - .1, 0); for (const [vz, vy] of pts) sh.lineTo(vz, vy); sh.lineTo(pts[pts.length - 1][0], 0); sh.lineTo(pts[0][0] - .1, 0);
    const end = new THREE.ShapeGeometry(sh, 2); end.rotateY(-Math.PI / 2); end.translate(e * W / 2, 0, 0); { const q = end.attributes.uv; for (let k = 0; k < q.count; k++) q.setXY(k, q.getX(k) * .6, q.getY(k) * .6); } B.put(cloth, end); }
  // ---- the dark interior and the dividing curtain (red and cream stripes) between the men's and the women's halves ----
  { const sh = new THREE.Shape(), n = 8; sh.moveTo(-W * .48, 0); for (let i = 0; i <= n; i++) { const u = (i / n * 2 - 1) * .96; sh.lineTo(u * W / 2, roofY(u, -.3) - .05); } sh.lineTo(W * .48, 0); sh.lineTo(-W * .48, 0);
    B.put(dark, new THREE.ShapeGeometry(sh).translate(0, 0, -D * .15)); }   // the shadowed inside, under the roof only
  { const cur = mat('utCurtain', '#ffffff', { roughness: .95, side: THREE.DoubleSide, map: upTex('utCurtain', 64, 64, (c, w, h) => { c.fillStyle = '#e4d6b4'; c.fillRect(0, 0, w, h); const cols = ['#8a2a22', '#2a2622', '#c99a3a'];
      for (let i = 0; i < 8; i++) { c.fillStyle = cols[i % 3]; c.fillRect(0, i * 8 + 2, w, 3); } }) });
    B.put(cur, new THREE.PlaneGeometry(D * .78, H * .82).rotateY(Math.PI / 2).translate(-W * .12, H * .41, -.15)); }
  // ---- poles: the three ridge poles show in the open front; two awning poles; the tent pegs and ropes ----
  for (const px of [-W / 3, 0, W / 3]) B.put(pole, upLimb([px, 0, 0], [px, roofY(px / (W / 2), 0), 0], .035, .03, 5));
  const fy = roofY(-.6, 1) + .55, fz = D / 2 + .55;
  for (const px of [-W * .32, W * .32]) B.put(pole, upLimb([px, 0, fz - .05], [px, fy - .02, fz], .03, .026, 5));
  const stake = (a, b) => { B.put(rope, upLimb(a, b, .008, .008, 3)); B.put(pole, upLimb([b[0], 0, b[2]], [b[0], .18, b[2]], .018, .012, 4)); };
  for (const px of [-W * .42, 0, W * .42]) stake([px, eave + .3, -D / 2 - .02], [px * 1.08, 0, -D / 2 - .9 - r() * .2]);   // back
  for (const e of [-1, 1]) { stake([e * W / 2, eave + .4, -D / 4], [e * (W / 2 + .95), 0, -D / 4 - .2]); stake([e * W * .32, fy, fz], [e * (W * .32 + .7), 0, fz + .8 + r() * .2]); }   // ends and the awning
  // ---- at the door: a rug (when the camp rolled one), and from the tent's own seed a water jar and a ring of hearth stones ----
  if (o.mat) { const rug = mat('utRug', '#ffffff', { roughness: 1, map: upTex('utRug', 64, 64, (c, w, h) => { c.fillStyle = '#8a3a26'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8b46a'; c.fillRect(4, 4, w - 8, h - 8); c.fillStyle = '#8a3a26'; c.fillRect(8, 8, w - 16, h - 16);
      c.fillStyle = '#2a2a3a'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(w / 2, 12 + i * 11); c.lineTo(w / 2 + 8, 17 + i * 11); c.lineTo(w / 2, 22 + i * 11); c.lineTo(w / 2 - 8, 17 + i * 11); c.fill(); } }) });
    B.put(rug, new THREE.PlaneGeometry(1.3, .85).rotateX(-Math.PI / 2).translate(o.rugX || 0, .015, D / 2 + .55)); }
  if (r() < .5) B.put(mat('clay'), new THREE.LatheGeometry([[0, 0], [.1, 0], [.17, .12], [.15, .3], [.07, .38], [.08, .44], [0, .43]].map(([a, b]) => new THREE.Vector2(a, b)), 9).translate(W * .4, 0, D / 2 + .25));
  if (r() < .4) { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; B.put(mat('stoneDk'), new THREE.DodecahedronGeometry(.07, 0).scale(1, .6, 1).translate(-W * .25 + Math.cos(a) * .22, .03, D / 2 + 1.5 + Math.sin(a) * .22)); }
    B.put(mat('utAsh', '#3a3430', { roughness: 1 }), new THREE.CircleGeometry(.16, 8).rotateX(-Math.PI / 2).translate(-W * .25, .01, D / 2 + 1.5)); }
  B.flush(G); return y + (H + .1) * s; }
{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'tabernacle camp', tags, kind: 'structure' });
  T('goat-hair-tent', 'Black goat-hair tent', ['tent', 'camp', 'desert', 'tabernacle'], (g, x, y, z) => upTent(g, x, y, z, 0, 1, '#3a302a', { mat: true, seed: 3 }));
  T('goat-hair-tent-brown', 'Brown goat-hair tent', ['tent', 'camp', 'desert', 'tabernacle'], (g, x, y, z) => upTent(g, x, y, z, 0, 1, '#56463a', { seed: 8 })); }
