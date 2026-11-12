// ---- collision grid: footprints of solid things you would bump into ----
const CG = { x0: -260, z0: -260, n: 1100, r: .5 }; CG.cells = new Uint8Array(CG.n * CG.n);
function blocked(x, z) { const R2 = .28; for (const [ox, oz] of [[0, 0], [R2, 0], [-R2, 0], [0, R2], [0, -R2]]) { const i = Math.floor((x + ox - CG.x0) / CG.r), j = Math.floor((z + oz - CG.z0) / CG.r); if (i < 0 || j < 0 || i >= CG.n || j >= CG.n) return true; if (CG.cells[j * CG.n + i]) return true; } return false; }
// ---- merge static scenery into one draw call per material (big win on phones) ----
{
  scene.updateMatrixWorld(true);
  { const bb = new THREE.Box3();
    scene.traverse(o => { if (!o.isMesh || o.userData.dyn || o.userData.nocol || o.material.isShaderMaterial || o.geometry.attributes.color || o.material.transparent || o.isSprite) return; for (let q = o; q; q = q.parent) if (!q.visible && !(q === o && o.material === M.dark)) return;
      bb.setFromObject(o); const sx = bb.max.x - bb.min.x, sz = bb.max.z - bb.min.z; if (sx > 40 || sz > 40 || (sx < .02 && sz < .02)) return;
      const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2, gy = groundY(cx, cz);
      if (bb.min.y > gy + 1.8 || bb.max.y < gy + .45) return;          // overhead, or low enough to step over
      // a rotated thin wall: rasterise along its length instead of filling its whole bounding box
      const pos = o.geometry.parameters, isWall = !!(pos && pos.width && pos.depth !== undefined && Math.min(pos.width, pos.depth) < .9 && Math.max(pos.width, pos.depth) > 2.5);
      if (isWall && sx > 1 && sz > 1) { const L = Math.max(pos.width, pos.depth), d = new THREE.Vector3(pos.width >= pos.depth ? 1 : 0, 0, pos.width >= pos.depth ? 0 : 1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())); const c = o.getWorldPosition(new THREE.Vector3());
        for (let t2 = -L / 2; t2 <= L / 2; t2 += .25) { const i = Math.floor((c.x + d.x * t2 - CG.x0) / CG.r), j = Math.floor((c.z + d.z * t2 - CG.z0) / CG.r); if (i >= 0 && j >= 0 && i < CG.n && j < CG.n) CG.cells[j * CG.n + i] = 1; } return; }
      const i0 = Math.floor((bb.min.x - CG.x0) / CG.r), i1 = Math.floor((bb.max.x - CG.x0) / CG.r), j0 = Math.floor((bb.min.z - CG.z0) / CG.r), j1 = Math.floor((bb.max.z - CG.z0) / CG.r);
      for (let j = Math.max(0, j0); j <= Math.min(CG.n - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(CG.n - 1, i1); i++) CG.cells[j * CG.n + i] = 1; });
    // keep the walkways themselves clear (gates, doorways, bridge deck)
    const clear = (x0, z0, x1, z1) => { for (let z = z0; z <= z1; z += .25) for (let x = x0; x <= x1; x += .25) { const i = Math.floor((x - CG.x0) / CG.r), j = Math.floor((z - CG.z0) / CG.r); if (i >= 0 && j >= 0 && i < CG.n && j < CG.n) CG.cells[j * CG.n + i] = 0; } };
    for (const w of WALKWAYS) clear(...w);   // [x0, z0, x1, z1] boxes from the town part
  }
  const groups = new Map(), kill = [];
  const hidden = []; scene.traverse(o => { if (o.isMesh && !o.userData.dyn) { let v = true; for (let q = o; q; q = q.parent) if (!q.visible) { v = false; break; } if (!v) hidden.push(o); } }); hidden.forEach(o => o.parent.remove(o));
  // S9 colour bake: untextured standard materials that differ only in colour share one merged mesh, the colour written into each vertex.
  // Vertex-coloured meshes without a texture (the mountains) join too, their colours multiplied by their material's colour.
  const MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'lightMap', 'bumpMap', 'displacementMap', 'alphaMap'];
  const bakeKey = m => { if (Array.isArray(m) || m.type !== 'MeshStandardMaterial' || m.transparent || m.opacity !== 1 || m.alphaTest || MAPS.some(k => m[k]) || m.emissive.getHex() !== 0
      || m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile || (m.clippingPlanes && m.clippingPlanes.length) || m.wireframe) return null;
    return ['bake', m.roughness, m.metalness, m.flatShading, m.side, m.envMap ? m.envMap.uuid : '', m.envMapIntensity, m.depthWrite, m.depthTest, m.polygonOffset, m.polygonOffsetFactor, m.polygonOffsetUnits, m.toneMapped, m.fog, m.dithering, m.vertexColors ? 1 : 0].join('|'); };
  scene.traverse(o => {
    if (!o.isMesh || o.userData.dyn || o.material.isShaderMaterial || o.material.transparent) return;
    const bk = bakeKey(o.material), hasCol = !!o.geometry.attributes.color;
    if (hasCol && !(bk && o.material.vertexColors)) return;           // vertex colours with a texture (the ground) keep their own mesh
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (bk) { const c = o.material.color, n = g.attributes.position.count, src = g.attributes.color && o.material.vertexColors ? g.attributes.color : null, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { a[i * 3] = c.r * (src ? src.getX(i) : 1); a[i * 3 + 1] = c.g * (src ? src.getY(i) : 1); a[i * 3 + 2] = c.b * (src ? src.getZ(i) : 1); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(a, 3)); }
    else if (g.attributes.color) g.deleteAttribute('color');
    g.morphAttributes = {}; g.clearGroups();
    const key = (bk ? bk.replace(/\|[01]$/, '') : o.material.uuid) + (o.castShadow ? 's' : 'n');
    if (!groups.has(key)) groups.set(key, { m: o.material, bake: !!bk, cast: o.castShadow, list: [] });
    groups.get(key).list.push(g); kill.push(o);
  });
  for (const o of kill) o.parent.remove(o);
  for (const { m, bake, cast, list } of groups.values()) { const merged = mergeGeometries(list, false); if (!merged) continue;
    let mm = m; if (bake) { mm = m.clone(); mm.color.setRGB(1, 1, 1); mm.vertexColors = true; mm.name = 'baked'; mm.needsUpdate = true; }
    const mesh = new THREE.Mesh(merged, mm); mesh.castShadow = cast; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; scene.add(mesh); }
  const empties = []; scene.traverse(o => { if (o.isGroup && !o.children.length) empties.push(o); }); empties.forEach(o => o.parent && o.parent.remove(o));
}
// ---- the bird you fly as in bird's-eye view ----
const bird = new THREE.Group(); scene.add(bird); bird.visible = false;
{ const white = new THREE.MeshStandardMaterial({ color: '#f4f1ea', flatShading: true, roughness: .8 }), grey = new THREE.MeshStandardMaterial({ color: '#b9b4ab', flatShading: true }), beak = new THREE.MeshStandardMaterial({ color: '#e0a03a', flatShading: true });
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 0), white); body.scale.set(.75, .6, 1.5); bird.add(body);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), white); head.position.set(0, .1, -.45); bird.add(head);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(.05, .16, 4), beak); bk.rotation.x = -Math.PI / 2; bk.position.set(0, .08, -.62); bird.add(bk);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.16, .4, 3), grey); tail.rotation.x = Math.PI / 2; tail.scale.set(1.4, 1, .25); tail.position.set(0, .02, .52); bird.add(tail);
  bird.userData.wings = [-1, 1].map(sd => { const w = new THREE.Group(); w.position.set(sd * .18, .08, -.05); bird.add(w);
    const sh = new THREE.Shape(); sh.moveTo(0, -.18); sh.lineTo(sd * .95, .02); sh.lineTo(sd * .7, .2); sh.lineTo(0, .2);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: '#efebe2', flatShading: true, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; w.add(m);
    const tip = new THREE.Mesh(new THREE.ShapeGeometry((() => { const t = new THREE.Shape(); t.moveTo(sd * .7, .2); t.lineTo(sd * .95, .02); t.lineTo(sd * 1.1, .14); return t; })()), new THREE.MeshStandardMaterial({ color: '#6d6a66', side: THREE.DoubleSide })); tip.rotation.x = -Math.PI / 2; w.add(tip);
    w.userData.sd = sd; return w; });
  bird.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.dyn = 1; } });
}
let birdT = 0, lastTheta = 0, bank = 0, takeoff = 0, birdMixer = null;
if (MODELS.bird) { bird.clear(); const bm = MODELS.bird; bm.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.dyn = 1; o.frustumCulled = false; } });
  const bb = new THREE.Box3().setFromObject(bm), sz = bb.getSize(new THREE.Vector3()); const k = 1.1 / Math.max(sz.x, sz.z); const w = new THREE.Group(); w.scale.setScalar(k); w.add(bm); w.rotation.y = Math.PI; bird.add(w);
  if (BIRD_ANIM && BIRD_ANIM.length) { birdMixer = new THREE.AnimationMixer(bm); birdMixer.clipAction(BIRD_ANIM[0]).play(); } bird.userData.wings = []; }
function birdFrame(dt, t) {
  if (!overview) { bird.visible = false; takeoff = 0; return; }
  bird.visible = true; takeoff = Math.min(1, takeoff + dt * .8); if (birdMixer) birdMixer.update(dt);
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const dist = 5 + 2 * (1 - takeoff); const p = camera.position.clone().addScaledVector(fwd, dist).addScaledVector(up, -1.25 - (1 - takeoff) * 2);
  bird.position.copy(p);
  let turn = doll.theta - lastTheta; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); lastTheta = doll.theta; bank += (Math.max(-.6, Math.min(.6, turn * 25)) - bank) * Math.min(1, dt * 4);
  bird.quaternion.copy(camera.quaternion); bird.rotateX(.25); bird.rotateZ(bank);
  const glide = (Math.sin(t * .7) + 1) / 2 > .65; const fl = glide ? .15 : Math.sin(t * 11) * .75;   // flap, with the odd glide
  for (const w of bird.userData.wings) w.rotation.z = w.userData.sd * fl;
  bird.position.y += Math.sin(t * 11) * (glide ? 0 : .04);
}
{ const el = document.getElementById('lpct'), bar = document.getElementById('lbar'); if (el) el.textContent = 'Lighting the lamps…'; if (bar) bar.style.width = '95%'; }
// ---- S10 light pool: a few real point lights follow the strongest lamps and fires near the camera ----
// Every point light in the scene costs every pixel, even at zero intensity. So the town's lights become "sources" (taken out of the scene,
// still driven as before: ROOM_LIGHTS switch with distance, fires flicker), and POOL real lights copy the strongest sources at the camera
// each frame, fading in and out over a quarter second when they change. Towns with no more lights than the pool are left as they are.
const LP = { n: MOBILE ? 3 : 4, src: [], slots: [], t: 0, on: false };
function lpCollect() { scene.updateMatrixWorld(true); const found = []; scene.traverse(o => { if (o.isPointLight && !LP.slots.includes(o)) found.push(o); });
  for (const l of found) { LP.src.push({ l, w: l.getWorldPosition(new THREE.Vector3()) }); l.parent.remove(l); } }
{ let n = 0; scene.traverse(o => { if (o.isPointLight) n++; });
  if (n > LP.n && !new URLSearchParams(location.search).has('alllights')) { lpCollect(); LP.on = true;
    for (let i = 0; i < LP.n; i++) { const l = new THREE.PointLight('#ffffff', 0, 10, 1.5); l.userData.k = 0; scene.add(l); LP.slots.push(l); } } }
function lightPool() { if (!LP.on) return; const now = performance.now(), dt = Math.min(.25, (now - (LP.t || now)) / 1000); LP.t = now;
  if (window.__fc === 3) lpCollect();                          // lights added by parts after finish.js (world/after.js) join the pool too
  // rank by how bright each light looks from the camera (intensity over distance squared), among lights whose reach comes near it.
  // A small fire glow beside you beats a big lamp in the next room.
  const cam = camera.position, want = [];
  for (const s of LP.src) { const I = s.l.intensity; if (!(I > 0)) continue; const r = s.l.distance || 40, d = cam.distanceTo(s.w); if (d > r + 12) continue;
    want.push([I / Math.max(1, d * d), s]); }
  want.sort((a, b) => b[0] - a[0]); const top = want.slice(0, LP.n).map(w => w[1]);
  for (const sl of LP.slots) { if (sl.userData.src && !top.includes(sl.userData.src)) sl.userData.leaving = true; }
  for (const s of top) if (!LP.slots.some(sl => sl.userData.src === s)) { const free = LP.slots.find(sl => !sl.userData.src) || LP.slots.filter(sl => sl.userData.leaving).sort((a, b) => a.userData.k - b.userData.k)[0]; if (free) { free.userData.src = s; free.userData.k = 0; free.userData.leaving = false; } }
  for (const sl of LP.slots) { const s = sl.userData.src; if (!s) { sl.intensity = 0; continue; }
    if (sl.userData.leaving && top.includes(s)) sl.userData.leaving = false;
    sl.userData.k = Math.max(0, Math.min(1, sl.userData.k + (sl.userData.leaving ? -dt : dt) * 4));
    if (sl.userData.leaving && sl.userData.k === 0) { sl.userData.src = null; sl.intensity = 0; continue; }
    sl.position.copy(s.w); sl.color.copy(s.l.color); sl.distance = s.l.distance; sl.decay = s.l.decay; sl.intensity = s.l.intensity * sl.userData.k; } }
window.__lightPool = () => ({ on: LP.on, sources: LP.src.length, active: LP.slots.filter(s => s.intensity > 0).length, wanted: LP.src.filter(s => s.l.intensity > 0 && camera.position.distanceTo(s.w) < (s.l.distance || 40) + 12).length });
// S7 (look change, waiting for the owner): on phones, halve every texture of 256 px or more before it is uploaded, about a quarter of
// the texture memory. Labels and banners (sprites) keep full size. On with ?halftex, or "halfTex": true in a town's theme; phones only.
if (MOBILE && (THEME.halfTex || new URLSearchParams(location.search).has('halftex'))) { const done = new Set();
  scene.traverse(o => { if (!o.isMesh || o.isSprite) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) { if (!m || m.isSpriteMaterial) continue;
    for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'bumpMap', 'aoMap', 'alphaMap']) { const t = m[k]; if (!t || !t.isTexture || !t.source || done.has(t.source)) continue; done.add(t.source);
      const im = t.source.data; if (!im || !(im.width >= 256) || !(im.height >= 16)) continue;
      const c = document.createElement('canvas'); c.width = im.width >> 1; c.height = im.height >> 1; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      t.source.data = c; t.source.needsUpdate = true; } } }); }
// compile every shader program before the first frame without freezing the page (S6): the bar keeps moving, and phones that
// compile in parallel (KHR_parallel_shader_compile) finish sooner
{ const bar = document.getElementById('lbar'); let w = 95; const creep = setInterval(() => { w = Math.min(99, w + .25); if (bar) bar.style.width = w + '%'; }, 100);
  try { await renderer.compileAsync(scene, camera); } catch (e) { console.warn('compileAsync failed; the first frame compiles instead', e); }
  clearInterval(creep); }
frame();
// ---- the town stands still, so draw the sun's shadow map once and redraw it only when something changes (S2) ----
// Twice a second a watcher looks at every shadow-casting mesh that was not merged. One that moves (a fire, a ship, an animated
// figure) stops casting a shadow while it moves, so no frozen shadow is left behind, and casts again after 2 s at rest.
// One that is shown, hidden, added or removed (the Tabernacle roof in bird's-eye) redraws the map once. refreshShadows() forces it.
function refreshShadows() { sun.shadow.needsUpdate = true; }
sun.shadow.autoUpdate = false; refreshShadows();
{ const seen = new Map(); let tick = 0;
  const sig = o => { const a = Array.from(o.matrixWorld.elements); if (o.isSkinnedMesh) for (const b of o.skeleton.bones) a.push(...b.matrixWorld.elements); return a; };
  const shown = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  setInterval(() => { tick++; let redraw = false; const now = new Set();
    scene.traverse(o => { if (!o.isMesh || o.matrixAutoUpdate === false || !(o.castShadow || o.userData.shOff)) return; now.add(o);
      const s = sig(o), v = shown(o), p = seen.get(o);
      if (!p) { seen.set(o, { s, v, still: tick }); if (v) redraw = true; return; }   // tick 1 redraws once: parts after finish.js (world/after.js) add casters too
      if (v !== p.v) { p.v = v; redraw = true; }
      if (s.some((x, i) => Math.abs(x - p.s[i]) > 1e-5)) { p.s = s; p.still = tick; if (o.castShadow) { o.castShadow = false; o.userData.shOff = 1; if (v) redraw = true; } }
      else if (o.userData.shOff && tick - p.still >= 4) { o.castShadow = true; o.userData.shOff = 0; if (v) redraw = true; } });
    for (const o of seen.keys()) if (!now.has(o)) { seen.delete(o); redraw = true; }
    if (redraw) refreshShadows(); }, 500); }
window.__ready = true;
requestAnimationFrame(() => requestAnimationFrame(() => { document.getElementById('lbar').style.width = '100%'; setTimeout(() => document.getElementById('loader').classList.add('done'), 250); }));

// ---- book data check: the rooms were built from books/<book>.json (rooms.js); this confirms the book and the built town agree ----
{ const issues = [];
  if (BOOKDATA) {
    for (const c of BOOKDATA.chapters.filter(c => c.chapter <= BUILT)) for (const r of c.rooms) { const st = STATIONS.find(s => s.ch === c.chapter && s.room === r.room);
      if (!st) { issues.push(`missing room ${c.chapter}.${r.room} ${r.name}`); continue; }
      if (!BUILT_ROOMS.has(`${c.chapter}.${r.room}`)) issues.push(`${c.chapter}.${r.room}: not built through the book`);
      if (st.name !== r.name) issues.push(`${c.chapter}.${r.room}: built "${st.name}", book says "${r.name}"`);
      if (st.text !== `${BOOK} ${r.verses}`) issues.push(`${c.chapter}.${r.room}: built for ${st.text}, book says ${r.verses}`);
      const spots = r.objects.filter(o => !o.extra);   // "extra" objects are dressing without a verse (a room of 3 verses may stand 5 objects)
      if (st.loci.length !== spots.length) issues.push(`${c.chapter}.${r.room}: ${st.loci.length} spots built, ${spots.length} objects in book`);
      else spots.forEach((o, i) => { const w = st.loci[i].where.split(' · ').slice(1).join(' · ') || st.loci[i].where; if (w !== o.what) issues.push(`${c.chapter}.${r.room} spot ${i + 1}: built "${w}", book says "${o.what}"`); }); }
    for (const st of STATIONS) if (!bookRoom(st.ch, st.room)) issues.push(`built room ${st.ch}.${st.room} ${st.name} is not in the book`); }
  window.__bookCheck = issues; if (issues.length) console.warn('book/engine mismatch:', issues); }
// ---- ?fps shows a frame-rate readout, for measuring on a real phone ----
if (new URLSearchParams(location.search).has('fps')) { const el = Object.assign(document.createElement('div'), { style: 'position:fixed;left:8px;top:8px;z-index:30;font:12px monospace;background:#000a;color:#fff;padding:3px 6px;border-radius:4px' }); document.body.appendChild(el);
  let n = 0, t0 = performance.now(); (function tick() { n++; const t = performance.now(); if (t - t0 > 1000) { el.textContent = `${(n * 1000 / (t - t0)).toFixed(0)} fps`; n = 0; t0 = t; } requestAnimationFrame(tick); })(); }
window.__scene = scene; window.__labelScene = labelScene; window.__CG = CG;   // test hooks (tools/fingerprint.mjs)
