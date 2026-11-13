// ---------- MODES: what the learner wants to do (engine/modes.js) ----------
// Opt-in per town: town.json "modes": { "default": "esv", "enabled": ["verse","ideas","test","free"],
//   "translations": [ { "id": "esv", "label": "ESV", "file": "verses.json", "credit": "..." }, { "id": "bsb", ... } ] }.
// A town without that block loads none of this (the part is not even listed) and behaves exactly as before.
//   verse  - the default: tutorial, stops, verse cards (everything the engine always did)
//   ideas  - "Big ideas": a guided tour of three ideas per chapter, each placed on a landmark of the chapter's district
//            (books/<book>.json: chapter.ideas[] + chapter.ideasOverview, see books/book.schema.json)
//   test   - flashcards, no typing: reference -> text, text -> reference
//   free   - just look around (no markers, verse numbers, banners or tutorial)
// The mode is remembered on the device (localStorage <store>-mode), the Bible version too (<store>-ver). URL: ?mode=verse|ideas|test|free (not remembered).
// Hooks into other parts: window.__mdHide (runtime.js hides gems / verse numbers / banners), window.__mdText + __mdLabel (tutorial.js verse cards).
// Names here start with md / Mode. Nothing here calls R(): the scene is unchanged; idea markers are only created when Big ideas is first used.
var MD = CFG.modes || null;
if (MD) {
  const Q = new URLSearchParams(location.search), $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lsGet = k => store.get(`${STORE}-${k}`), lsSet = (k, v) => store.set(`${STORE}-${k}`, v);
  const cnum = ch => ch + (CFG.chOffset || 0);
  const ALL = ['verse', 'ideas', 'test', 'free'];
  const NAMES = { verse: 'Verse by verse', ideas: 'Big ideas', test: 'Test yourself', free: 'Free roam' }, SHORT = { verse: 'Verses', ideas: 'Ideas', test: 'Test', free: 'Free' };

  // ---- Bible versions ----
  const TR = MD.translations && MD.translations.length ? MD.translations : [{ id: 'esv', label: 'ESV', file: 'verses.json', credit: 'Scripture quotations from the ESV® Bible, © Crossway.' }];
  const TEXT = {}, LOADING = {}, TFAIL = {};
  let ver = lsGet('ver'); if (!TR.some(t => t.id === ver)) ver = MD.default && TR.some(t => t.id === MD.default) ? MD.default : TR[0].id;
  const trOf = id => TR.find(t => t.id === id) || TR[0], tShort = id => trOf(id).id.toUpperCase();
  const loadText = id => LOADING[id] ??= fetch('./' + trOf(id).file).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => (TEXT[id] = j)).catch(() => { TFAIL[id] = 1; return null; });
  const textOK = () => !TFAIL[TR[0].id];
  window.__mdText = ref => { const t = TEXT[ver]; return t ? t[ref] : (trOf(ver).file === 'verses.json' ? VTEXT[ref] : undefined); };
  window.__mdLabel = () => tShort(ver);
  const syncCredit = () => { const c = $('scrcredit'); if (c) c.textContent = trOf(ver).credit || ''; };
  const verseLine = ref => window.__mdText(ref);

  // ---- state ----
  let MODE = 'verse', prevMode = 'verse', tour = null;
  const hasIdeas = () => !!BOOKDATA && BOOKDATA.chapters.some(c => c.ideas && c.ideas.length && c.chapter <= BUILT);
  const avail = m => (MD.enabled || ALL).includes(m) && (m !== 'ideas' || hasIdeas()) && (m !== 'test' || (textOK() && (MD.enabled || ALL).includes('test')));
  const cancelTut = () => { if (tutI >= 0) { const k = STORE + '-tut-done', had = store.get(k); tutEnd(); if (!had) try { localStorage.removeItem(k); } catch (e) {} } };
  const mapbtnEl = $('mapbtn');

  // ---- DOM ----
  const dom = document.createElement('div');
  dom.innerHTML = `<button id="mdbtn" aria-haspopup="true" aria-expanded="false"><small>MODE</small><span id="mdcur"></span></button>
<div id="mdmenu" hidden></div>
<div id="mdcard" hidden><div class="card" id="mdcardin"></div></div>
<div id="mdstart" class="mdov" hidden><div class="mdbox"><h2>What are you interested in?</h2>
  <button class="mdbig" data-m="verse">Memorize verse by verse</button>
  <button class="mdbig alt" data-m="ideas">Memorize the big ideas of each chapter</button>
  <button class="mdbig alt" data-m="free">Just look around for now</button>
  <p class="mdfoot">You can switch any time from the top.</p></div></div>
<div id="mdtest" class="mdov" hidden><div class="mdbox mdt" id="mdtestin"></div></div>`;
  while (dom.firstChild) document.body.appendChild(dom.firstChild);
  const cardEl = $('mdcard'), cardIn = $('mdcardin');

  // ---- the mode button and menu ----
  const syncBtn = () => { $('mdcur').textContent = SHORT[MODE]; };
  const closeMenu = () => { $('mdmenu').hidden = true; $('mdbtn').setAttribute('aria-expanded', 'false'); };
  function renderMenu() {
    const items = ALL.filter(avail).map(m => `<button class="mdrow${m === MODE ? ' on' : ''}" data-m="${m}"><span>${NAMES[m]}</span><i>${m === MODE ? '✓' : ''}</i></button>`).join('');
    const vers = TR.length > 1 && textOK() ? `<div class="mdvr"><span>Bible version</span><div>${TR.map(t => `<button class="${t.id === ver ? 'on' : ''}" data-v="${t.id}">${esc(t.label)}</button>`).join('')}</div></div>` : '';
    $('mdmenu').innerHTML = items + vers;
  }
  $('mdbtn').onclick = e => { e.stopPropagation(); const m = $('mdmenu'); if (m.hidden) { renderMenu(); m.hidden = false; $('mdbtn').setAttribute('aria-expanded', 'true'); const c = $('credits'); if (c) c.hidden = true; } else closeMenu(); };
  $('mdmenu').onclick = e => { e.stopPropagation(); const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.m) { closeMenu(); setMode(b.dataset.m); } else if (b.dataset.v) setVer(b.dataset.v); };
  addEventListener('pointerdown', e => { if (!$('mdmenu').hidden && !e.target.closest('#mdmenu,#mdbtn')) closeMenu(); }, true);
  function setVer(id) { if (id === ver) return; loadText(id).then(j => { if (!j) { const m = $('mdmenu'); if (!m.hidden) m.insertAdjacentHTML('beforeend', '<p class="mdfoot">That version is not available right now.</p>'); return; }
    ver = id; lsSet('ver', id); syncCredit(); if (!$('mdmenu').hidden) renderMenu(); if (tutI >= 0) tutShow(tutI); if (tour) renderCard(); if (TS.on) renderTest(); }); }

  // ---- mode switching ----
  const hideBases = hide => STATIONS.forEach(st => st.loci.forEach(l => { if (l.base) l.base.visible = !hide; }));
  function setMode(m, o = {}) {
    if (m !== 'verse' && !avail(m)) return;
    endTour(); closeTest(true); closeMenu();
    if (m === 'test' && MODE !== 'test') prevMode = MODE === 'ideas' ? 'free' : MODE;
    MODE = m; window.__mdHide = m !== 'verse'; hideBases(m !== 'verse');
    for (const k of ALL) document.body.classList.toggle('md-' + k, k === m);
    syncBtn(); if (m !== 'verse') cancelTut();
    if (o.persist !== false && m !== 'test') lsSet('mode', m);
    if (m === 'ideas') startIdeas(); else if (m === 'test') openTest();
  }

  // ---- go() in the tour: Prev / Next (and N / P) step through the ideas ----
  const goOrig = go;
  go = function (d) { if (MODE === 'ideas' && tour) return stepTour(d); if (MODE === 'test') return; return goOrig(d); };

  // =========================================================== BIG IDEAS
  const chOf = ch => bookChapter(ch), ideasOf = ch => (chOf(ch) && chOf(ch).ideas) || [];
  const chList = () => BOOKDATA ? BOOKDATA.chapters.filter(c => c.ideas && c.ideas.length && c.chapter <= BUILT).map(c => c.chapter) : [];
  const P = (s, what) => pos(s, what);
  const MK = { built: false, list: new Map() };
  function numSprite(n) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#58c7c2'; g.strokeStyle = '#17434a'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#10343a'; g.font = 'bold 76px Georgia'; g.textAlign = 'center'; g.fillText(n, 64, 90);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); }
  function buildMarkers() {
    if (MK.built) return; MK.built = true;
    const gm = new THREE.MeshStandardMaterial({ color: '#58c7c2', emissive: '#1b8a94', emissiveIntensity: .9, flatShading: true });
    const geo = new THREE.OctahedronGeometry(.4, 0);
    for (const ch of chList()) ideasOf(ch).forEach((it, k) => { const w = it.anchor.where, [x, z] = P(w.at, `idea ${it.id} where`), y = groundY(x, z) + (w.top ?? 4);
      const gem = new THREE.Mesh(geo, gm); gem.position.set(x, y, z); gem.userData.dyn = 1; gem.userData.mdMark = 1; gem.visible = false; scene.add(gem);
      const sp = numSprite(k + 1); sp.position.set(x, y + 1, z); sp.visible = false; labelScene.add(sp);
      MK.list.set(`${ch}.${k}`, { ch, k, gem, sp, x, y, z }); });
  }
  function mdTick(now) { requestAnimationFrame(mdTick); if (!MK.built) return; const t = now / 1000, cp = camera.position;
    for (const m of MK.list.values()) { const show = MODE === 'ideas' && !!tour && tour.intro === undefined && !tour.end && m.ch === tour.ch && (tour.k < 0 || tour.k === m.k); m.gem.visible = m.sp.visible = show; if (!show) continue;
      const cur = tour.k === m.k, d = Math.max(4, cp.distanceTo(m.gem.position)), s = Math.max(1, d * (overview ? .1 : .1)) * (cur ? 1.25 + Math.sin(t * 4) * .12 : .75);
      m.gem.rotation.y = t * 1.5; m.gem.scale.setScalar(s); m.gem.position.y = m.y + Math.sin(t * 2 + m.k) * .12 * s; m.sp.position.set(m.x, m.y + .55 * s + .3 * Math.max(1, d * .05), m.z);
      const ss = Math.max(.7, d * .045) * (cur ? 1.2 : .85); m.sp.scale.set(ss, ss, 1); m.sp.material.opacity = cur ? 1 : .8; } }
  requestAnimationFrame(mdTick);

  const showCard = html => { cardIn.innerHTML = html; cardEl.hidden = false; document.body.classList.add('mdcard'); };
  const hideCard = () => { cardEl.hidden = true; document.body.classList.remove('mdcard'); };
  const XBTN = '<button class="mdx" data-a="skip">Skip tour</button>';
  const INTRO = [
    { t: 'Big ideas, big places', b: '<p>Each chapter has its own region.</p><p class="mdsub">Watch the town: four chapters, four districts.</p>' },
    { t: 'Three ideas per chapter', b: '<p>Pick three big ideas per chapter and give each one a place.</p><p class="mdsub">You will see each idea at its place. Your own picture of it will work best.</p>' },
  ];
  function flyOn() { tutCam = 'fly'; window.__tutT0 = undefined; tutCycle = false; window.__tcp = undefined; window.__tutLook = undefined; }
  function flyOff() { if (tutCam === 'fly') { tutCam = null; window.__tcp = undefined; window.__tutLook = undefined; } }
  function startIdeas() {
    buildMarkers(); const chs = chList(), want = +lsGet('ideas-ch'); const ch = chs.includes(want) ? want : chs[0];
    if (!lsGet('ideas-intro')) { tour = { intro: 0, ch }; flyOn(); renderCard(); } else showOverview(ch);
  }
  function endTour() { if (tour && tour.ov) { overview = false; tween = null; } flyOff(); tour = null; hideCard(); if (mapbtnEl.textContent === 'Walk') mapbtnEl.textContent = 'Bird’s-eye'; }
  function showOverview(ch) {
    flyOff(); const c = chOf(ch), ov = c.ideasOverview || {}, [x, z] = ov.at ? P(ov.at, 'ideasOverview') : [0, 0];
    tour = { ch, k: -1, ov: true }; lsSet('ideas-ch', String(ch)); overview = true; tween = null; doll.target.set(x, 0, z); doll.theta = ov.theta ?? 0; doll.dist = ov.dist ?? 60; doll.userTilt = false; mapbtnEl.textContent = 'Walk'; renderCard();
  }
  function showIdea(ch, k, dir) {
    const it = ideasOf(ch)[k]; if (!it) return; const fromOv = !tour || tour.ov || tour.intro !== undefined || tour.end, prevK = tour ? tour.k : -1;
    flyOff(); tour = { ch, k, verses: false }; overview = false; if (mapbtnEl.textContent === 'Walk') mapbtnEl.textContent = 'Bird’s-eye';
    const v = it.anchor.view, [sx, sz] = P(v.stand, `${it.id} stand`), [ax, az] = P(it.anchor.where.at, `${it.id} where`);
    let via = (v.via || []).map((p, i) => P(p, `${it.id} via ${i}`));
    if (!fromOv && dir < 0 && ideasOf(ch)[prevK]) via = (ideasOf(ch)[prevK].anchor.view.via || []).map((p, i) => P(p, 'via')).reverse();
    if (fromOv) { const s0 = via.length ? via.shift() : [sx, sz]; const n0 = via.length ? via[0] : [sx, sz]; player.x = s0[0]; player.z = s0[1]; player.yaw = Math.atan2(-(n0[0] - s0[0]), -(n0[1] - s0[1])); player.pitch = -.02; }
    const yaw = Math.atan2(-(ax - sx), -(az - sz)), eye = groundY(sx, sz) + 1.7, ty = groundY(ax, az) + (it.anchor.where.top ?? 4) * (v.aim ?? .5), dist = Math.hypot(ax - sx, az - sz);
    const half = Math.tan(camera.fov * Math.PI / 360), my = groundY(ax, az) + (it.anchor.where.top ?? 4) + .6;
    const pitch = v.pitch ?? Math.max(-.6, Math.min(.5, Math.max(Math.atan2(ty - eye, dist) - Math.atan(.3 * half), Math.atan2(my - eye, dist) - Math.atan(.8 * half))));
    tween = { x: sx, z: sz, yaw, pitch, path: via }; renderCard();
  }
  function stepTour(d) {
    if (!tour) return; const chs = chList();
    if (tour.intro !== undefined) { const n = tour.intro + d; if (n < 0) return; if (n >= INTRO.length) { lsSet('ideas-intro', '1'); showOverview(tour.ch); } else { tour.intro = n; renderCard(); } return; }
    if (tour.end) { if (d < 0) showIdea(chs[chs.length - 1], 2, 1); return; }
    const { ch, k } = tour, i = chs.indexOf(ch), n = ideasOf(ch).length;
    if (d > 0) { if (k < 0) showIdea(ch, 0, 1); else if (k < n - 1) showIdea(ch, k + 1, 1); else if (i < chs.length - 1) showOverview(chs[i + 1]); else { tour = { ch, k, end: true }; renderCard(); } }
    else { if (k > 0) showIdea(ch, k - 1, -1); else if (k === 0) showOverview(ch); else if (i > 0) showIdea(chs[i - 1], ideasOf(chs[i - 1]).length - 1, -1); }
  }
  const rangeText = ref => { let ch = null, h = ''; for (const part of ref.split(',').map(x => x.trim())) { const m = /^(?:(\d+):)?(\d+)(?:–(\d+))?$/.exec(part); if (!m) continue; if (m[1]) ch = m[1]; const a = +m[2], b = +(m[3] || m[2]);
      for (let v = a; v <= b; v++) { const t = verseLine(`${ch}:${v}`); if (t) h += `<p class="vt"><sup>${v}</sup> ${esc(t)}</p>`; } } return h || '<p class="mdsub">The text is loading…</p>'; };
  function renderCard() {
    if (!tour) return; const chs = chList();
    if (tour.intro !== undefined) { const s = INTRO[tour.intro], last = tour.intro === INTRO.length - 1;
      showCard(`${XBTN}<div class="step">Big ideas · ${tour.intro + 1} of ${INTRO.length}</div><h2>${s.t}</h2>${s.b}<div class="row"><button class="ghost" data-a="back"${tour.intro ? '' : ' hidden'}>Back</button><span class="sp"></span><button data-a="next">${last ? 'Show me' : 'Next'}</button></div>`); return; }
    if (tour.end) { showCard(`<div class="step">Big ideas</div><h2>That is the tour</h2><p>Twelve ideas, twelve places. Walk through each region in your mind and see your pictures.</p><div class="row"><button class="ghost" data-a="back">Back</button><span class="sp"></span><button class="ghost" data-a="again">Start over</button><button data-a="free">Free roam</button></div>`); return; }
    const ch = tour.ch, ideas = ideasOf(ch), zone = `Chapter ${cnum(ch)} · ${ZONE[ch - 1]}`, short = `Chapter ${cnum(ch)}`;
    if (tour.k < 0) { showCard(`${XBTN}<div class="step">${esc(zone)}</div><h2>Three big ideas live here</h2><ol class="mdlist">${ideas.map((it, i) => `<li><b>${i + 1}</b> ${esc(it.title)}</li>`).join('')}</ol>
      <div class="mdchs">${chs.map(c => `<button class="${c === ch ? 'on' : ''}" data-ch="${c}" aria-label="Chapter ${cnum(c)}">${cnum(c)}</button>`).join('')}</div>
      <div class="row"><button class="ghost" data-a="back"${chs.indexOf(ch) ? '' : ' hidden'}>Back</button><span class="sp"></span><button data-a="next">Start</button></div>`); return; }
    const it = ideas[tour.k], last = tour.k === ideas.length - 1, nxt = last ? (chs.indexOf(ch) < chs.length - 1 ? 'Next chapter ▶' : 'Finish') : 'Next ▶';
    if (tour.verses) { showCard(`${XBTN}<div class="step">${esc(BOOK)} ${esc(it.verses)} · ${tShort(ver)}</div>${rangeText(it.verses)}<div class="row"><button class="ghost" data-a="idea">Back to idea</button><span class="sp"></span><button data-a="next">${nxt}</button></div>`); return; }
    showCard(`${XBTN}<div class="step">${esc(short)} · Idea ${tour.k + 1} of ${ideas.length}</div><h2>${esc(it.title)}</h2><div class="mdref">${esc(BOOK)} ${esc(it.verses)} · at ${esc(it.anchor.label)}</div><p>${esc(it.summary)}</p>
      <p class="ex">${esc(it.example)}</p><p class="mdnote">Your own image will work even better: make it bigger, funnier, stranger.</p>
      <div class="row"><button class="ghost" data-a="back">Back</button><span class="sp"></span><button class="ghost" data-a="verses">See the verses</button><button data-a="next">${nxt}</button></div>`);
  }
  cardIn.onclick = e => { const b = e.target.closest('button'); if (!b || !tour) return;
    if (b.dataset.ch) { showOverview(+b.dataset.ch); return; }
    switch (b.dataset.a) {
      case 'skip': endTour(); lsSet('ideas-intro', '1'); setMode('free', { persist: false }); break;
      case 'next': if (tour.verses) { tour.verses = false; } stepTour(1); break;
      case 'back': stepTour(-1); break;
      case 'verses': tour.verses = true; renderCard(); break;
      case 'idea': tour.verses = false; renderCard(); break;
      case 'again': showOverview(chList()[0]); break;
      case 'free': setMode('free', { persist: false }); break;
    } };
  // How it works, in the ideas mode, shows the short intro again
  { const hb = $('howbtn'); const old = hb.onclick; hb.onclick = e => { if (MODE === 'ideas') { endTour(); tour = { intro: 0, ch: +(lsGet('ideas-ch')) || chList()[0] }; flyOn(); renderCard(); } else if (MODE === 'verse') old && old.call(hb, e); }; }
  // test hooks: jump straight to a stop (no walking), like window.__snap does for the verse stops
  window.__mdJump = (ch, k) => { if (MODE !== 'ideas') setMode('ideas', { persist: false }); flyOff(); showIdea(ch, k, 1); if (tween) { tween.path = []; player.x = tween.x; player.z = tween.z; player.yaw = tween.yaw; player.pitch = tween.pitch; tween = null; } };
  window.__mdOverview = ch => { if (MODE !== 'ideas') setMode('ideas', { persist: false }); showOverview(ch); };
  window.__mdMode = () => ({ mode: MODE, ver, tour: tour && { ...tour } });
  // test hook: the legs of the tour, checked like __blockers() checks the verse routes
  window.__mdBlockers = () => { const out = [], rc = new THREE.Raycaster(), meshes = scene.children.filter(o => o.isMesh && !o.userData.dyn);
    for (const ch of chList()) { const list = ideasOf(ch); let prev = null;
      list.forEach((it, k) => { const v = it.anchor.view, stand = P(v.stand, 'stand'), pts = [...(prev ? [prev] : []), ...(v.via || []).map(p => P(p, 'via')), stand];
        if (blocked(stand[0], stand[1])) out.push(`${it.id}: the stand ${stand} is inside something`);
        for (let j = 0; j < pts.length - 1; j++) { const [ax, az] = pts[j], [bx, bz] = pts[j + 1], a = new THREE.Vector3(ax, groundY(ax, az) + 1, az), b = new THREE.Vector3(bx, groundY(bx, bz) + 1, bz), d = b.clone().sub(a), L = d.length(); if (L < .01) continue; d.normalize();
          rc.set(a, d); rc.far = L; const h = rc.intersectObjects(meshes, false).filter(h => h.face && h.face.normal.y < .7); if (h.length) out.push(`${it.id} leg ${j}: blocked at ${h[0].distance.toFixed(1)}m of ${L.toFixed(1)}m at (${h[0].point.x.toFixed(1)},${h[0].point.z.toFixed(1)})`); }
        prev = stand; }); }
    return out; };

  // =========================================================== TEST YOURSELF
  const TS = { on: false, scope: lsGet('t-scope') || 'all', dir: lsGet('t-dir') || 'mixed', q: [], cur: null, got: 0, total: 0, first: 0, seen: 0, missed: [], rev: false, shown: false, done: false };
  let KNOWN = {}; try { KNOWN = JSON.parse(lsGet('test') || '{}') || {}; } catch (e) {}
  const testEl = $('mdtest'), testIn = $('mdtestin');
  const refsFor = scope => { const out = []; VERSES.forEach((n, i) => { const ch = i + 1; if (ch > BUILT || (scope !== 'all' && +scope !== ch)) return; for (let v = 1; v <= n; v++) out.push(`${ch}:${v}`); }); return out.filter(r => verseLine(r)); };
  const refName = r => { const [c, v] = r.split(':').map(Number); return `${BOOK} ${cnum(c)}:${v}`; };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pickDir = () => TS.dir === 'ref' ? false : TS.dir === 'txt' ? true : Math.random() < .5;
  function whereIs(ref) { const [ch, v] = ref.split(':').map(Number), room = Math.ceil(v / 5), st = STATIONS.find(s => s.ch === ch && s.room === room); if (!st) return null; const l = st.loci.find(x => x.v === v), parts = l ? l.where.split(' · ') : [];
    return { st, zone: `Chapter ${cnum(ch)} · ${ZONE[ch - 1]}`, room: st.name, spot: parts[0] || '', obj: parts.slice(1).join(' · ') }; }
  function openTest() { TS.on = true; TS.q = []; TS.cur = null; TS.done = false; testEl.hidden = false; renderTest(); loadText(ver).then(() => { if (TS.on) renderTest(); }); }
  function closeTest(silent) { if (!TS.on) return; TS.on = false; testEl.hidden = true; if (!silent && MODE === 'test') setMode(avail(prevMode) || prevMode === 'verse' ? prevMode : 'free', { persist: false }); }
  function startTest(refs) {
    shuffle(refs); refs.sort((a, b) => (KNOWN[a] === 2) - (KNOWN[b] === 2)); const deck = refs.slice(0, 20);
    Object.assign(TS, { q: deck.map(r => ({ ref: r, rev: pickDir(), tries: 0 })), got: 0, total: deck.length, first: 0, seen: 0, missed: [], done: false, shown: false }); nextCard(); }
  function nextCard() { TS.cur = TS.q.shift() || null; TS.shown = false; if (!TS.cur) TS.done = true; renderTest(); }
  function answer(ok) { const c = TS.cur; if (!c) return; if (c.tries === 0) { TS.seen++; if (ok) TS.first++; else TS.missed.push(c.ref); KNOWN[c.ref] = Math.max(KNOWN[c.ref] || 0, ok ? 2 : 1); lsSet('test', JSON.stringify(KNOWN)); }
    c.tries++; if (ok) TS.got++; else { c.rev = pickDir(); TS.q.splice(Math.min(TS.q.length, 3 + Math.floor(Math.random() * 3)), 0, c); } nextCard(); }
  const chips = (k, list, cur) => `<div class="mdchips" data-k="${k}">${list.map(([v, l]) => `<button data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  function renderTest() {
    if (!TS.on) return; const vtxt = ref => verseLine(ref);
    if (!TS.cur && !TS.done) { // picker
      const refs = refsFor(TS.scope), known = refs.filter(r => KNOWN[r] === 2).length, have = TEXT[ver] || (trOf(ver).file === 'verses.json' && Object.keys(VTEXT).length);
      testIn.innerHTML = `<h2>Test yourself</h2><div class="mdlab">What to practice</div>${chips('scope', [['all', 'Whole book'], ...chList2().map(c => [c, `Chapter ${cnum(c)}`])], TS.scope)}
        <div class="mdlab">Direction</div>${chips('dir', [['ref', 'Reference → text'], ['txt', 'Text → reference'], ['mixed', 'Mixed']], TS.dir)}
        ${TR.length > 1 ? `<div class="mdlab">Bible version</div>${chips('ver', TR.map(t => [t.id, esc(t.label)]), ver)}` : ''}
        <p class="mdfoot">${have ? `You knew ${known} of ${refs.length} verses so far.` : 'Loading the verses…'}</p>
        <button class="mdbig" data-a="start"${have && refs.length ? '' : ' disabled'}>Start</button><button class="mdbig alt" data-a="close">Close</button>`; return; }
    if (TS.done) { const miss = TS.missed.length;
      testIn.innerHTML = `<h2>Done</h2><p class="mdbigtxt">${TS.first} of ${TS.seen}</p><p class="mdsub">right the first time${miss ? `, ${miss} to look at again` : ''}.</p>
        ${miss ? '<button class="mdbig" data-a="redo">Practice the missed ones</button>' : ''}<button class="mdbig${miss ? ' alt' : ''}" data-a="again">Test again</button><button class="mdbig alt" data-a="close">Close</button>`; return; }
    const c = TS.cur, r = c.rev, w = TS.shown ? whereIs(c.ref) : null, lab = tShort(ver);
    const front = r ? `<div class="mdv">“${esc(vtxt(c.ref) || '')}”</div><div class="mdq">Where is this?</div>` : `<div class="mdq">What does ${esc(refName(c.ref))} say?</div>`;
    let back = '';
    if (TS.shown) back = r ? `<div class="mdans"><b>${esc(refName(c.ref))}</b>${w ? `<div class="mdwhere">${esc(w.zone)}<br>${esc(w.room)} · ${esc(w.spot)}${w.obj ? ': ' + esc(w.obj) : ''}</div>` : ''}</div>`
      : `<div class="mdans"><div class="mdv">“${esc(vtxt(c.ref) || '')}”</div><small>${esc(refName(c.ref))} · ${lab}</small></div>`;
    testIn.innerHTML = `<div class="mdtop"><span class="mdscore">${TS.got} of ${TS.total} got it</span><button class="mdlink" data-a="done">Done</button></div>${front}${back}
      ${TS.shown ? `${r && w ? '<button class="mdbig alt" data-a="there">Take me there</button>' : ''}<div class="mdtwo"><button class="mdbig alt" data-a="no">Not yet</button><button class="mdbig" data-a="yes">Got it</button></div>` : '<button class="mdbig" data-a="reveal">Reveal answer</button>'}`;
  }
  const chList2 = () => VERSES.map((n, i) => i + 1).filter(c => c <= BUILT);
  testIn.onclick = e => { const b = e.target.closest('button'); if (!b) return; const chip = b.closest('.mdchips');
    if (chip) { const k = chip.dataset.k, v = b.dataset.v; if (k === 'ver') { setVer(v); return; } TS[k] = v; lsSet(k === 'scope' ? 't-scope' : 't-dir', v); renderTest(); return; }
    switch (b.dataset.a) {
      case 'start': startTest(refsFor(TS.scope)); break; case 'close': closeTest(); break;
      case 'reveal': TS.shown = true; renderTest(); break; case 'yes': answer(true); break; case 'no': answer(false); break;
      case 'done': TS.cur = null; TS.done = true; TS.q = []; renderTest(); break;
      case 'again': TS.cur = null; TS.done = false; renderTest(); break;
      case 'redo': { const refs = TS.missed.slice(); TS.cur = null; TS.done = false; startTest(refs); break; }
      case 'there': { const w = whereIs(TS.cur.ref); if (w) flyToStation(STATIONS.indexOf(w.st)); break; }
    } };
  function flyToStation(i) { const st = STATIONS[i]; closeTest(true); TS.cur = null; setMode('verse');
    overview = true; tween = null; doll.target.set(st.x, 0, st.z); doll.theta = Math.atan2(st.x - st.look[0], st.z - st.look[2]); doll.dist = 55; doll.userTilt = false;
    setTimeout(() => { idx = i - 1; goOrig(1); if (tween) { tween.path = []; player.x = tween.x; player.z = tween.z; player.yaw = tween.yaw; player.pitch = tween.pitch; tween = null; } overview = false; }, 1600); }

  // =========================================================== START
  { let initial = 'verse', first = false; const um = Q.get('mode'), sm = lsGet('mode');
    if (ALL.includes(um) && avail(um)) initial = um; else if (ALL.includes(sm) && avail(sm)) initial = sm; else first = !Q.has('notut');
    document.body.classList.add('md-' + initial); syncBtn(); syncCredit();
    loadText(ver).then(j => { if (!j) { /* no verses file: hide Test and versions */ if (MODE === 'test') setMode('verse', { persist: false }); } else if (tutI >= 0) tutShow(tutI); });
    const st = $('mdstart'); st.querySelector('[data-m="ideas"]').hidden = !hasIdeas();
    if (first) { cancelTut(); st.hidden = false; }
    st.onclick = e => { const b = e.target.closest('button'); if (!b) return; st.hidden = true; const m = b.dataset.m; setMode(m);
      if (m === 'verse' && !store.get(STORE + '-tut-done')) tutShow(0); };
    if (initial !== 'verse') setMode(initial, { persist: false }); else { MODE = 'verse'; window.__mdHide = false; }
    syncBtn(); }
}
