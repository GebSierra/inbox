// ---------- NEW (plan item N3): ground cover as instances ----------
// Each kind is ONE shared shape drawn many times by a THREE.InstancedMesh (one draw call per kind, however many there are):
//   grass tufts, wildflowers (white, yellow, red anemones, "lilies of the field"), Madonna lilies, rocks, thistles,
//   and field patches: standing wheat, ploughed rows, vineyard rows.
// upCover(g, kind, points, opts) places a kind at [[x, z, scale, turn], ...] (world or group coordinates; y from heightAt unless opts.flat).
// Library entries show each kind as a small patch. A town gets a scatter of them over its open ground only with the theme "ground": true
// or ?ground=1 (a look change, waiting for the owner): upGroundCover() runs in finish.js after the collision grid is built and before the
// merge, skips anything solid, the rooms' squares and low water, and draws no random numbers from the town (private generator).
const UGC = {};
function ugShape(kind) { if (UGC[kind]) return UGC[kind];
  const r = upRng(kind.length * 977 + 13), list = [], col = [], put = (geo, c) => { const n = geo.attributes.position.count, cc = new THREE.Color(c); const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = cc.r; a[i * 3 + 1] = cc.g; a[i * 3 + 2] = cc.b; }
      geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k); list.push(geo.index ? geo.toNonIndexed() : geo); };
  const blade = (x, z, h, lean, ry, c) => { const b = new THREE.BufferGeometry(), w = .012 + r() * .01; b.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, lean * .5, h * .6, 0, -w * .5 + lean * .5, h * .6, 0, w * .5 + lean * .5, h * .6, 0, lean, h, 0].slice(0, 18), 3));
    b.setIndex([0, 1, 2, 0, 2, 3, 1, 4, 2, 3, 2, 5, 2, 4, 5].slice(0, 15)); b.computeVertexNormals(); b.rotateY(ry); b.translate(x, 0, z); put(b, c); };
  const stem = (x, z, h, c = '#5a7a34') => { put(new THREE.CylinderGeometry(.004, .006, h, 3).translate(x, h / 2, z), c); };
  if (kind === 'grass') for (let i = 0; i < 7; i++) blade((r() - .5) * .08, (r() - .5) * .08, .14 + r() * .14, (r() - .5) * .1, r() * 6.28, ['#7a9a44', '#8aa850', '#6a8a3a', '#a8a868'][i % 4]);
  else if (kind === 'anemone' || kind === 'daisy' || kind === 'yellow') { const pc = kind === 'anemone' ? '#d8302a' : kind === 'daisy' ? '#f4f0e6' : '#e8c03a';
    for (let i = 0; i < 4; i++) blade((r() - .5) * .06, (r() - .5) * .06, .08 + r() * .05, (r() - .5) * .06, r() * 6.28, '#6a8a3a');
    for (let f = 0; f < 3; f++) { const x = (r() - .5) * .1, z = (r() - .5) * .1, h = .16 + r() * .1; stem(x, z, h);
      const pet = new THREE.CircleGeometry(.03, 6).rotateX(-Math.PI / 2 + .3).translate(x, h, z); put(pet, pc); put(new THREE.SphereGeometry(.008, 5, 4).translate(x, h + .004, z), kind === 'anemone' ? '#1e1610' : '#d8a020'); } }
  else if (kind === 'lily') { for (let i = 0; i < 6; i++) blade((r() - .5) * .05, (r() - .5) * .05, .2 + r() * .1, (r() - .5) * .08, r() * 6.28, '#5a7a34');
    stem(0, 0, .62); for (let f = 0; f < 3; f++) { const a = f * 2.1, t = new THREE.LatheGeometry([[0, 0], [.012, .02], [.03, .06], [.042, .075]].map(([u, v]) => new THREE.Vector2(u, v)), 6);
      t.rotateZ(Math.PI / 2 + .5).rotateY(a).translate(Math.cos(a) * .02, .56 - f * .04, Math.sin(a) * .02); put(t, '#f6f2e8'); } }
  else if (kind === 'rock') { const g = new THREE.DodecahedronGeometry(.18, 0), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * .55); g.translate(0, .05, 0); put(g, '#a49a8a'); }
  else if (kind === 'thistle') { for (let i = 0; i < 6; i++) { const a = i * 1.05, l = new THREE.ConeGeometry(.035, .22, 3).rotateZ(Math.PI / 2 - .5).rotateY(a).translate(Math.cos(a) * .09, .06, Math.sin(a) * .09); put(l, '#7a8a6a'); }
    for (let f = 0; f < 2; f++) { const x = f ? .05 : -.03, h = .38 + f * .1; stem(x, 0, h, '#6a7a5a'); put(new THREE.SphereGeometry(.028, 6, 5).translate(x, h, 0), '#8a7a6a'); put(new THREE.ConeGeometry(.024, .03, 6).translate(x, h + .03, 0), '#9a4aa8'); } }
  else if (kind === 'wheat') for (let i = 0; i < 6; i++) { const x = (r() - .5) * .14, z = (r() - .5) * .14, h = .75 + r() * .2, lean = (r() - .5) * .08; stem(x, z, h, '#c9a84a');
    put(new THREE.CylinderGeometry(.012, .008, .1, 4).translate(x + lean, h + .04, z), '#d8b456'); }
  else if (kind === 'vine') { put(new THREE.CylinderGeometry(.03, .035, 1.1, 5).translate(0, .55, 0), '#5a4028');                   // a stake, the vine twisting up it, a head of leaves and grapes
    for (let i = 0; i < 10; i++) { const a = r() * 6.28, y = .75 + r() * .45, d = .12 + r() * .14; put(new THREE.CircleGeometry(.07, 5).rotateX(-1.1 + r()).rotateY(a).translate(Math.cos(a) * d, y, Math.sin(a) * d), r() < .5 ? '#5a7a30' : '#6e8a3a'); }
    for (let k = 0; k < 2; k++) { const a = k * 3 + .5; for (let i = 0; i < 6; i++) put(new THREE.SphereGeometry(.018, 5, 4).translate(Math.cos(a) * .1 + (i % 2) * .02, .7 - Math.floor(i / 2) * .03, Math.sin(a) * .1), '#4a2a4a'); } }
  else if (kind === 'furrow') { const g = new THREE.CylinderGeometry(.12, .12, 1, 6, 1, false, 0, Math.PI).rotateZ(Math.PI / 2); g.scale(1, .55, 1); put(g, '#7a5a3a'); }   // a ridge along x   // one ridge of earth, a metre long
  const merged = mergeGeometries(list, false); merged.computeVertexNormals(); return (UGC[kind] = merged); }
const ugMat = () => M.ugMat || (M.ugMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, side: THREE.DoubleSide }));
function upCover(g, kind, pts, o = {}) {
  const im = new THREE.InstancedMesh(ugShape(kind), ugMat(), pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  pts.forEach(([x, z, sc = 1, ry = 0], i) => { q.setFromAxisAngle(up, ry); s3.set(sc, sc, sc); p3.set(x, o.flat ? (o.y || 0) : heightAt(x, z) - (o.sink || 0), z); m4.compose(p3, q, s3); im.setMatrixAt(i, m4); });
  // bounds of all the instances, so framing and culling see the whole patch
  im.instanceMatrix.needsUpdate = true; im.computeBoundingBox(); im.computeBoundingSphere(); im.castShadow = !!o.shadow; im.receiveShadow = true; im.userData.dyn = 1; im.userData.nocol = 1; im.frustumCulled = false; g.add(im); return im; }
// library patches (flat, around the origin of the plinth)
{ const grid = (n, sp, jit, seed) => { const r = upRng(seed), out = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push([(i - (n - 1) / 2) * sp + (r() - .5) * jit, (j - (n - 1) / 2) * sp + (r() - .5) * jit, .8 + r() * .5, r() * 6.28]); return out; };
  const patch = (kinds, top) => (g, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); g.add(G); for (const [k, pts, opt] of kinds) upCover(G, k, pts, { flat: true, ...opt }); return y + top; };
  const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'plan N3', tags, kind: 'plant' });
  T('grass-tufts', 'Grass tufts', ['ground', 'field', 'hillside'], patch([['grass', grid(7, .24, .2, 11)]], .3));
  T('wildflowers', 'Wildflowers in the grass (anemones, daisies, yellow)', ['ground', 'field', 'flowers', 'lilies'], patch([['grass', grid(6, .28, .2, 12)], ['anemone', grid(3, .5, .3, 13)], ['daisy', grid(3, .55, .4, 14).map(p => [p[0] + .2, p[1], p[2], p[3]])], ['yellow', grid(2, .6, .3, 15)]], .35));
  T('lilies-of-the-field', 'Lilies of the field (red anemones and white lilies)', ['ground', 'flowers', 'lilies', 'gospel'], patch([['grass', grid(6, .28, .2, 16)], ['anemone', grid(4, .38, .25, 17)], ['lily', [[-.3, .2, 1, .3], [.35, -.1, .9, 1.6], [0, -.4, 1.1, 2.8]]]], .7));
  T('rocks-scatter', 'Scattered rocks', ['ground', 'hillside', 'stone'], patch([['rock', grid(3, .5, .4, 18).map(p => [p[0], p[1], p[2] * 1.4, p[3]])], ['grass', grid(4, .4, .3, 19)]], .2));
  T('thistles', 'Thistles', ['ground', 'field', 'thorns'], patch([['thistle', grid(3, .45, .3, 20)], ['grass', grid(4, .4, .3, 21)]], .5));
  T('wheat-field', 'Standing wheat (a field patch)', ['field', 'farm', 'harvest'], patch([['wheat', grid(9, .17, .06, 22).map(p => [p[0], p[1], 1, p[3]])]], 1.0));
  T('ploughed-field', 'Ploughed rows', ['field', 'farm'], patch([['furrow', [-.72, -.48, -.24, 0, .24, .48, .72].flatMap(zz => [[-.5, zz, 1, 0], [.5, zz, 1, 0]])]], .1));
  T('vineyard-rows', 'Vineyard rows', ['field', 'farm', 'vine'], patch([['vine', [-.45, .45].flatMap(zz => [-.6, 0, .6].map(xx => [xx, zz, 1, xx * 3]))]], 1.25)); }
// ---- a town's scatter (only with theme "ground" or ?ground=1) ----
function upGroundCover() {
  if (!(THEME.ground || new URLSearchParams(location.search).has('ground')) || !STATIONS.length) return;
  // scattered where people look: within 45 m of each room, thinning out with distance; nothing on solid things, in the rooms or in low water
  const r = upRng(4243), low = Math.min(...STATIONS.map(s => heightAt(s.x, s.z))) - 1.5;
  const clearOf = (x, z, m) => !blocked(x, z) && heightAt(x, z) > low && STATIONS.every(s => Math.hypot(s.x - x, s.z - z) > m);
  const pick = (perRoom, sc, m = 4.5) => { const out = [];
    for (const st of STATIONS) { let n = 0; for (let t = 0; t < perRoom * 3 && n < perRoom; t++) { const a = r() * 6.283, d = m + Math.pow(r(), 1.6) * 45, x = st.x + Math.cos(a) * d, z = st.z + Math.sin(a) * d;
        if (clearOf(x, z, m)) { out.push([x, z, sc[0] + r() * (sc[1] - sc[0]), r() * 6.28]); n++; } } }
    return out; };
  upCover(scene, 'grass', pick(420, [1.4, 2.6]), { sink: .02 });
  upCover(scene, 'anemone', pick(45, [1.1, 1.6]));
  upCover(scene, 'daisy', pick(40, [1.1, 1.6]));
  upCover(scene, 'yellow', pick(30, [1.1, 1.6]));
  upCover(scene, 'rock', pick(18, [.7, 2.4], 13), { sink: .04, shadow: true });
  upCover(scene, 'thistle', pick(10, [1, 1.5], 13)); }
