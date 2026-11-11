// ---------- OBJECT LIBRARY PREVIEW PAGE ----------
// Runs as the last part of the library page (see town.json): the shared engine parts, the whole object registry and this file share one scope.
// Every registered object gets a card. Thumbnails are rendered one at a time with the engine's single WebGL renderer (core.js) into images;
// a click opens a larger view that you can drag to rotate (the same renderer moves into the dialog while it is open).
// Which rooms use an object is read from the books listed in town.json ("books").
{
  const CORNERS = ['near-left', 'far-left', 'far-right', 'near-right', 'centre'];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const T_W = 320, T_H = 240;                                    // thumbnail size in pixels (4:3)
  const FOV = 30;                                                // the same framing for every object: the bounding sphere fills the view
  window.__library = { count: 0, thumbs: 0, errors: [], leaks: [], done: false };

  // ---- the registry, in a sensible order: by town, chapter and room of origin ----
  const originKey = o => { const m = /^(\w+) (\d+)\.(\d+)$/.exec(o); return m ? [m[1], +m[2], +m[3]] : [(o.split(' ')[0] || ''), 99, 0]; };
  const TOWN_ORDER = { colossae: 0, james: 1, engine: 2 };
  const KINDS = [['all', 'All'], ['object', 'Objects'], ['person', 'People'], ['plant', 'Plants'], ['animal', 'Animals'], ['structure', 'Structures'], ['effect', 'Effects']];
  const entries = [...OBJECTS.values()].sort((a, b) => { const A = originKey(a.origin), B = originKey(b.origin);
    return (TOWN_ORDER[A[0]] ?? 9) - (TOWN_ORDER[B[0]] ?? 9) || A[1] - B[1] || A[2] - B[2] || a.label.localeCompare(b.label); });
  window.__library.count = entries.length;

  // ---- which rooms use which object ----
  const usage = new Map();      // id -> [{ book, ch, room, name, spot, kind }]
  const books = [];
  for (const b of CFG.books || []) {
    try { const r = await fetch(b.path); if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); books.push({ ...b, data: j });
      for (const c of j.chapters) for (const r2 of c.rooms) for (const [kind, list] of [['', r2.objects], ['fallback', r2.fallback && r2.fallback.objects]]) (list || []).forEach((o, i) => {
        if (!o.id || o.id === 'TODO') return; if (!usage.has(o.id)) usage.set(o.id, []);
        usage.get(o.id).push({ book: j.book, ch: c.chapter, room: r2.room, name: r2.name, spot: CORNERS[i] || String(i + 1), what: o.what, kind, extra: !!o.extra }); }); }
    catch (e) { console.error(`[library] could not read ${b.path}: ${e.message}`); window.__library.errors.push(`book ${b.path}: ${e.message}`); } }
  const useText = u => `${u.book} ${u.ch}.${u.room} · ${u.name} · ${u.spot}${u.kind ? ' (fallback)' : ''}${u.extra ? ' (extra)' : ''}`;

  // ---- the stage: neutral warm light on a small round plinth ----
  const libScene = new THREE.Scene(); libScene.background = new THREE.Color('#efe6d6');
  libScene.add(new THREE.HemisphereLight('#fff4e2', '#b9a98f', 1.5));
  const key = new THREE.DirectionalLight('#ffe6c4', 2.6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02;
  libScene.add(key, key.target);
  const plinthMat = new THREE.MeshStandardMaterial({ color: '#d9cbb4', roughness: .95, flatShading: true });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.04, .12, 48), plinthMat); plinth.receiveShadow = true; libScene.add(plinth);
  const stage = new THREE.Group(); libScene.add(stage);
  const cam = new THREE.PerspectiveCamera(FOV, T_W / T_H, .05, 400);
  renderer.toneMappingExposure = 1.0;
  const stash = document.createElement('div'); stash.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden'; document.body.appendChild(stash); stash.appendChild(renderer.domElement);

  // build one object on the stage (always from the same random seed, so the thumbnail and the big view agree)
  const seedFor = id => { let h = 2166136261; for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return (h % 2147483646) + 1; };
  let cur = null;
  function show(e) {
    clearStage(); seed = seedFor(e.id);
    const g = new THREE.Group(), f0 = FIRES.length, s0 = scene.children.length; stage.add(g);
    try { e.fn(g, 0, 0, 0, ...e.args); } catch (err) { console.error(`[library] ${e.id}: ${err.message}`); window.__library.errors.push(`${e.id}: ${err.message}`); }
    if (scene.children.length > s0) { window.__library.leaks.push(e.id); console.warn(`[library] ${e.id} added ${scene.children.length - s0} object(s) to the town scene instead of its group`); while (scene.children.length > s0) scene.remove(scene.children[scene.children.length - 1]); }
    const lights = []; g.traverse(o => { if (o.isLight) lights.push(o); }); lights.forEach(l => l.parent.remove(l));   // thumbnails use the stage light only
    g.updateMatrixWorld(true);
    const box = new THREE.Box3(); g.traverse(o => { if (!o.isMesh || !o.geometry || !o.visible) return; let v = true; for (let q = o; q && q !== g; q = q.parent) if (!q.visible) v = false; if (!v) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); });
    if (box.isEmpty()) box.set(new THREE.Vector3(-.3, 0, -.3), new THREE.Vector3(.3, .6, .3));
    const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3()), R0 = Math.max(.35, size.length() / 2);
    const floor = Math.min(0, box.min.y) - .01, rad = Math.max(.7, Math.hypot(size.x, size.z) / 2 * 1.2 + .15);
    plinth.scale.set(rad, 1, rad); plinth.position.set(ctr.x, floor - .06, ctr.z);
    const corners = []; for (const X of [box.min.x, box.max.x]) for (const Y of [box.min.y, box.max.y]) for (const Z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(X, Y, Z).sub(ctr));
    cur = { e, g, f0, fires: FIRES.slice(f0), ctr, R0, size, rad, floor, corners, spin: .6, pitch: e.kind === 'structure' ? .5 : .38, zoom: 1 };
    key.position.set(ctr.x - R0 * 1.2, floor + R0 * 3.2, ctr.z + R0 * 1.6); key.target.position.copy(ctr);
    const sc = key.shadow.camera, sr = Math.max(R0, rad) * 1.5; sc.left = -sr; sc.right = sr; sc.top = sr; sc.bottom = -sr; sc.near = .1; sc.far = R0 * 12; sc.updateProjectionMatrix();
    return cur;
  }
  function clearStage() { if (!cur) return; stage.remove(cur.g); cur.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); FIRES.length = cur.f0; cur = null; }
  // frame the bounding BOX: the camera backs off just far enough that all eight corners of the object's box are inside the view
  // (a long bridge or a low stall is framed by its own shape, not by the sphere around it)
  const _dir = new THREE.Vector3(), _right = new THREE.Vector3(), _up = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0);
  function frame(aspect) {
    const c = cur, cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    _dir.set(Math.sin(c.spin) * cp, sp, Math.cos(c.spin) * cp);                       // from the centre towards the camera
    _right.crossVectors(_Y, _dir).normalize(); _up.crossVectors(_dir, _right);
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV / 2)), tanH = tanV * aspect;
    let D = .5; for (const v of c.corners) D = Math.max(D, v.dot(_dir) + Math.max(Math.abs(v.dot(_right)) / tanH, Math.abs(v.dot(_up)) / tanV));
    D *= 1.08 * c.zoom;
    cam.aspect = aspect; cam.updateProjectionMatrix();
    cam.position.set(c.ctr.x + _dir.x * D, c.ctr.y + _dir.y * D, c.ctr.z + _dir.z * D); cam.lookAt(c.ctr);
  }
  const tick = t => { if (cur) for (const f of cur.fires) f.update && f.update(t, cam); };

  // ---- the cards ----
  const grid = $('grid'), q = $('q'), chips = $('chips'), count = $('count');
  const towns = [...new Set(entries.map(e => originKey(e.origin)[0]))].sort((a, b) => (TOWN_ORDER[a] ?? 9) - (TOWN_ORDER[b] ?? 9));
  let filterTown = 'all', filterKind = 'all', filterText = '';
  const cards = new Map();
  for (const e of entries) {
    const us = usage.get(e.id) || [], el = document.createElement('button'); el.className = 'card'; el.type = 'button'; el.dataset.id = e.id;
    el.dataset.hay = [e.id, e.label, e.origin, e.kind, ...e.tags, ...us.map(useText)].join(' ').toLowerCase(); el.dataset.town = originKey(e.origin)[0]; el.dataset.kind = e.kind;
    el.innerHTML = `<span class="ph"><img alt="" width="${T_W}" height="${T_H}"></span><span class="id">${esc(e.id)}</span><span class="lb">${esc(e.label)}</span><span class="or">${esc(e.origin || '')}${e.kind !== 'object' ? ` · ${esc(e.kind)}` : ''}</span>` +
      `<span class="tg">${e.tags.map(t => `<i>${esc(t)}</i>`).join('')}</span><span class="us">${us.length ? esc(useText(us[0])) + (us.length > 1 ? ` <b>+${us.length - 1} more</b>` : '') : '<em>not used in a room yet</em>'}</span>`;
    el.addEventListener('click', () => openBig(e)); grid.appendChild(el); cards.set(e.id, el);
  }
  const kinds = $('kchips'), present = new Set(entries.map(e => e.kind));
  const chipRow = (el, list, attr) => { el.innerHTML = list.map(([v, t]) => `<button type="button" class="chip" data-${attr}="${esc(v)}" aria-pressed="${v === 'all'}">${esc(t)}</button>`).join('');
    el.addEventListener('click', ev => { const b = ev.target.closest('.chip'); if (!b) return; if (attr === 'k') filterKind = b.dataset.k; else filterTown = b.dataset.t; el.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b))); applyFilter(); }); };
  chipRow(chips, [['all', 'All'], ...towns.map(t => [t, t[0].toUpperCase() + t.slice(1)])], 't');
  chipRow(kinds, KINDS.filter(([k]) => k === 'all' || present.has(k)), 'k');
  q.addEventListener('input', () => { filterText = q.value.trim().toLowerCase(); applyFilter(); });
  function applyFilter() { let n = 0; for (const el of cards.values()) { const ok = (filterTown === 'all' || el.dataset.town === filterTown) && (filterKind === 'all' || el.dataset.kind === filterKind) && (!filterText || filterText.split(/\s+/).every(w => el.dataset.hay.includes(w))); el.hidden = !ok; if (ok) n++; }
    count.textContent = `${n} of ${entries.length} objects`; }
  applyFilter();
  $('sub').textContent = `${entries.length} objects from ${books.map(b => b.name).join(' and ')}: each card shows the object’s id, label, origin, kind and the rooms that use it.`;

  // ---- thumbnails: one at a time, a pause between so the page stays responsive ----
  let bigOpen = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function thumbs() {
    renderer.setPixelRatio(1);
    for (const e of entries) {
      while (bigOpen) await sleep(200);
      const c = show(e); renderer.setPixelRatio(1); renderer.setSize(T_W, T_H, false); frame(T_W / T_H); tick(1.0);
      renderer.render(libScene, cam);
      const img = cards.get(e.id).querySelector('img'); try { img.src = renderer.domElement.toDataURL('image/jpeg', .88); } catch (err) { window.__library.errors.push(`${e.id}: thumbnail ${err.message}`); }
      cards.get(e.id).dataset.size = c.size.toArray().map(v => v.toFixed(2)).join('×'); cards.get(e.id).classList.add('rendered'); window.__library.thumbs++;
      clearStage(); await sleep(0);
    }
    window.__library.done = true; $('status').textContent = ''; document.body.classList.add('ready');
  }

  // ---- the large view: drag to rotate, wheel / pinch to zoom ----
  const modal = $('modal'), bigStage = $('bigstage'), info = $('info'); let raf = 0, last = null;
  function sizeBig() { const w = Math.max(160, bigStage.clientWidth), h = Math.max(160, bigStage.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h); if (cur) frame(w / h); }
  function loop(t) { raf = requestAnimationFrame(loop); if (!cur) return; frame(bigStage.clientWidth / Math.max(1, bigStage.clientHeight)); tick(t / 1000); renderer.render(libScene, cam); }
  function openBig(e) {
    bigOpen = true; modal.hidden = false; document.body.classList.add('modal'); last = document.activeElement; bigStage.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    show(e); sizeBig();
    const us = usage.get(e.id) || [], c = cur;
    info.innerHTML = `<h2>${esc(e.label)}</h2><p class="mono">${esc(e.id)}</p><p>${esc(e.origin || 'no origin')} · ${esc(e.kind)} · about ${c.size.toArray().map(v => v.toFixed(1)).join(' × ')} m (w × h × d)</p>` +
      `<p class="tg">${e.tags.map(t => `<i>${esc(t)}</i>`).join('')}</p><h3>Used in</h3>` + (us.length ? `<ul>${us.map(u => `<li>${esc(useText(u))}<br><small>${esc(u.what)}</small></li>`).join('')}</ul>` : '<p><em>No room uses it yet.</em></p>') +
      (e.args.length ? `<p class="mono">default arguments: ${esc(JSON.stringify(e.args))}</p>` : '') + '<p class="hint">Drag to rotate · scroll or pinch to zoom</p>';
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); $('close').focus();
  }
  function closeBig() { if (modal.hidden) return; cancelAnimationFrame(raf); modal.hidden = true; document.body.classList.remove('modal'); clearStage(); stash.appendChild(renderer.domElement); renderer.domElement.style.cssText = ''; bigOpen = false; if (last && last.focus) last.focus(); }
  $('close').addEventListener('click', closeBig); modal.addEventListener('click', ev => { if (ev.target === modal) closeBig(); }); addEventListener('keydown', ev => { if (ev.key === 'Escape') closeBig(); });
  addEventListener('resize', () => { if (!modal.hidden) sizeBig(); });
  { const ptr = new Map(); let pinch = 0;
    bigStage.addEventListener('pointerdown', ev => { if (!cur) return; bigStage.setPointerCapture(ev.pointerId); ptr.set(ev.pointerId, [ev.clientX, ev.clientY]); pinch = 0; renderer.domElement.style.cursor = 'grabbing'; });
    bigStage.addEventListener('pointermove', ev => { const p = ptr.get(ev.pointerId); if (!p || !cur) return;
      if (ptr.size === 1) { cur.spin -= (ev.clientX - p[0]) * .01; cur.pitch = Math.max(.05, Math.min(1.45, cur.pitch + (ev.clientY - p[1]) * .008)); }
      ptr.set(ev.pointerId, [ev.clientX, ev.clientY]);
      if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) cur.zoom = Math.max(.35, Math.min(2.5, cur.zoom * pinch / d)); pinch = d; } });
    const up = ev => { ptr.delete(ev.pointerId); pinch = 0; renderer.domElement.style.cursor = 'grab'; };
    bigStage.addEventListener('pointerup', up); bigStage.addEventListener('pointercancel', up);
    bigStage.addEventListener('wheel', ev => { if (!cur) return; ev.preventDefault(); cur.zoom = Math.max(.35, Math.min(2.5, cur.zoom * Math.exp(ev.deltaY * .001))); }, { passive: false }); }

  { const el = document.getElementById('loader'); if (el) el.classList.add('done'); }
  $('status').textContent = 'Rendering thumbnails…';
  window.__libraryOpen = id => openBig(OBJECTS.get(id)); window.__libraryClose = closeBig;
  // test hook for tools/angles.mjs: render one object from a given angle (?angles skips the thumbnail run so the renderer is free)
  window.__libraryAngle = (id, spin, pitch, w = 640, h = 480, zoom = 1) => { const e = OBJECTS.get(id); if (!e) throw new Error('no object ' + id); bigStage.appendChild(renderer.domElement);
    show(e); cur.spin = spin; cur.pitch = pitch; cur.zoom = zoom; renderer.setPixelRatio(1); renderer.setSize(w, h, false); frame(w / h); tick(1.0); renderer.render(libScene, cam);
    const url = renderer.domElement.toDataURL('image/png'); clearStage(); stash.appendChild(renderer.domElement); return url; };
  if (/[?&]angles\b/.test(location.search)) { window.__library.done = true; $('status').textContent = ''; } else thumbs().catch(e => { console.error('[library] thumbnails stopped:', e); window.__library.errors.push('thumbnails: ' + e.message); $('status').textContent = 'Thumbnails stopped: ' + e.message; });
}
