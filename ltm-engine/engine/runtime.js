// ---------- player / controls ----------
const player = { x: 0, z: GZ + 16, yaw: 0, pitch: 0.02 };
const keys = {}; addEventListener('keydown', e => { keys[e.code] = 1; if (e.code === 'KeyN') go(1); if (e.code === 'KeyP') go(-1); }); addEventListener('keyup', e => keys[e.code] = 0);
let drag = null;
renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, id: e.pointerId, moved: false, turn: e.button === 2 || e.shiftKey }; });
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 6) drag.moved = true;
  if (overview) { if (touches.size >= 2) { /* handled by pinch/twist */ }
    else if (drag.turn) { doll.theta -= dx * .006; doll.phi = Math.max(.25, Math.min(1.4, doll.phi - dy * .005)); doll.userTilt = true; }
    else { const k = doll.dist * .0022 * (innerHeight > innerWidth ? 1.4 : 1); const sn = Math.sin(doll.theta), cs = Math.cos(doll.theta);
      doll.target.x -= (cs * dx + sn * dy) * k; doll.target.z -= (-sn * dx + cs * dy) * k; } }
  else { player.yaw -= dx * .005; player.pitch = Math.max(-1.2, Math.min(.8, player.pitch - dy * .004)); tween = null; }
  drag.x = e.clientX; drag.y = e.clientY; });
let lastTap = { t: 0, x: 0, y: 0 };
addEventListener('pointerup', e => { if (!drag || drag.id !== e.pointerId) return; const moved = drag.moved; drag = null; if (moved) { const h = document.getElementById('help'); if (h) h.hidden = true; }
  if (moved || e.target !== renderer.domElement) return;
  const now = performance.now();
  if (now - lastTap.t < 350 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) { walkTo(e.clientX, e.clientY); lastTap.t = 0; }
  else lastTap = { t: now, x: e.clientX, y: e.clientY }; });
// pinch / wheel zoom in dollhouse
renderer.domElement.addEventListener('wheel', e => { if (overview) { doll.dist = Math.max(12, Math.min(260, doll.dist * (1 + e.deltaY * .001))); e.preventDefault(); } }, { passive: false });
const touches = new Map(); let pinch0 = 0, twist0 = null, mid0 = null;
renderer.domElement.addEventListener('pointerdown', e => { touches.set(e.pointerId, e); if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); twist0 = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX); mid0 = (a.clientY + b.clientY) / 2; } });
addEventListener('pointermove', e => { if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, e); if (touches.size === 2 && overview) { const [a, b] = [...touches.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); if (pinch0) doll.dist = Math.max(12, Math.min(260, doll.dist * pinch0 / d)); pinch0 = d;
    const tw = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX); if (twist0 !== null) { let dt2 = tw - twist0; dt2 = Math.atan2(Math.sin(dt2), Math.cos(dt2)); doll.theta += dt2; } twist0 = tw;
    const mid = (a.clientY + b.clientY) / 2; if (mid0 !== null && Math.abs(mid - mid0) > 0) { doll.phi = Math.max(.25, Math.min(1.4, doll.phi + (mid - mid0) * .004)); doll.userTilt = true; } mid0 = mid;
    if (drag) drag.moved = true; } });
addEventListener('pointerup', e => { touches.delete(e.pointerId); pinch0 = 0; twist0 = mid0 = null; }); addEventListener('pointercancel', e => { touches.delete(e.pointerId); pinch0 = 0; twist0 = mid0 = null; });
// double-click to walk there (works in both views; from the dollhouse it drops you in)
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const pickables = () => scene.children.filter(o => o.isMesh && !(o.material && o.material.isShaderMaterial));
function walkTo(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(scene.children, true).find(h => !h.object.isSprite && !(h.object.material && h.object.material.isShaderMaterial));
  if (!hit) return; const p = hit.point;
  if (overview) { overview = false; player.yaw = doll.theta; player.pitch = -.05; player.x = p.x + Math.sin(doll.theta) * 6; player.z = p.z + Math.cos(doll.theta) * 6; }
  const yaw = Math.atan2(-(p.x - player.x), -(p.z - player.z));
  // stop a little short of walls / objects you clicked on
  const d = Math.hypot(p.x - player.x, p.z - player.z), stop = hit.object.geometry.type === 'PlaneGeometry' || hit.face.normal.y > .7 ? 0 : 1.5;
  const k = Math.max(0, (d - stop) / (d || 1));
  tween = { x: player.x + (p.x - player.x) * k, z: player.z + (p.z - player.z) * k, yaw, pitch: Math.max(-.35, Math.min(.1, player.pitch)) };
}
renderer.domElement.addEventListener('dblclick', e => e.preventDefault());
// joystick
const joy = document.getElementById('joy'), knob = document.getElementById('knob'); let jv = { x: 0, y: 0 }, jid = null;
joy.addEventListener('pointerdown', e => { jid = e.pointerId; joy.setPointerCapture(jid); e.stopPropagation(); });
joy.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; const r = joy.getBoundingClientRect(); let dx = e.clientX - r.left - 55, dy = e.clientY - r.top - 55; const d = Math.hypot(dx, dy); if (d > 45) { dx *= 45 / d; dy *= 45 / d; } jv = { x: dx / 45, y: dy / 45 }; knob.style.transform = `translate(${dx}px,${dy}px)`; tween = null; });
joy.addEventListener('pointerup', () => { jid = null; jv = { x: 0, y: 0 }; knob.style.transform = ''; });

let showNums = false; try { showNums = localStorage.getItem(STORE + '-nums') === '1'; } catch (e) {}
{ const fb = document.getElementById('fsbtn'), el = document.documentElement; if (!(el.requestFullscreen || el.webkitRequestFullscreen)) fb.hidden = true;
  fb.onclick = () => { try { if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (el.requestFullscreen || el.webkitRequestFullscreen).call(el)?.catch?.(() => {}); } catch (e) {} }; }
document.getElementById('infobtn').onclick = () => { const c = document.getElementById('credits'); c.hidden = !c.hidden; };
const numbtn = document.getElementById('numbtn'); const syncNum = () => { numbtn.textContent = `Verse numbers: ${showNums ? 'on' : 'off'}`; numbtn.setAttribute('aria-pressed', showNums); };
let showGems = false; try { showGems = localStorage.getItem(STORE + '-gems') === '1'; } catch (e) {}
const gembtn = document.getElementById('gembtn'); const syncGem = () => { gembtn.textContent = `Markers: ${showGems ? 'on' : 'off'}`; gembtn.setAttribute('aria-pressed', showGems); }; syncGem();
gembtn.onclick = () => { showGems = !showGems; syncGem(); try { localStorage.setItem(STORE + '-gems', showGems ? '1' : '0'); } catch (e) {} };
numbtn.onclick = () => { showNums = !showNums; syncNum(); try { localStorage.setItem(STORE + '-nums', showNums ? '1' : '0'); } catch (e) {} }; syncNum();
let idx = -1, tween = null, overview = false; const doll = { theta: -.45, phi: .95, dist: 150, target: new THREE.Vector3(28, 0, 22) };
function go(d) { const from = idx; idx = Math.max(0, Math.min(STATIONS.length - 1, idx + d)); const s = STATIONS[idx];
  const key = d > 0 ? `${s.ch}.${s.room}` : (STATIONS[from] ? `${STATIONS[from].ch}.${STATIONS[from].room}` : ''); let path = (VIA[key] || []).slice(); if (d < 0) path.reverse(); if (from === idx) path = [];
  const yaw = Math.atan2(-(s.look[0] - s.x), -(s.look[2] - s.z));
  const back = s.back || (s.banner ? 6 : 6.2); tween = { x: s.x + Math.sin(yaw) * back, z: s.z + Math.cos(yaw) * back, yaw, pitch: s.pitch ?? (s.banner ? (s.ch === 1 ? -0.12 : -0.24) : -0.38), path }; overview = false; }
document.getElementById('next').onclick = () => go(1); document.getElementById('prev').onclick = () => go(-1);
const mapbtn = document.getElementById('mapbtn');
mapbtn.onclick = () => { overview = !overview; tween = null; if (overview) { doll.target.set(player.x, 0, player.z - 20); doll.theta = player.yaw; doll.dist = 110; doll.userTilt = false; } mapbtn.textContent = overview ? 'Walk' : 'Bird’s-eye'; };

const hud = document.getElementById('hud'), hudZ = document.querySelector('#hud .z'), hudS = document.querySelector('#hud .s');
const clock = new THREE.Clock(); const perf = { n: 0, sum: 0 };
function groundY(x, z) {
  let y = heightAt(x, z);
  for (const [cz, hz, cx, hx, top] of RAISED) if (Math.abs(z - cz) < hz && Math.abs(x - cx) < hx) y = Math.max(y, top);   // bridge decks etc. (town part)
  return y;
}
function placeCamera() { camera.position.set(player.x, groundY(player.x, player.z) + 1.7, player.z); camera.rotation.set(0, 0, 0); camera.rotation.order = 'YXZ'; camera.rotation.y = player.yaw; camera.rotation.x = player.pitch; }
function frame() { window.__fc = (window.__fc || 0) + 1;
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime; WATER_T.value = t; for (const sh of SHIPS) { sh.position.y = sh.userData.y0 + Math.sin(t * .9 + sh.userData.ph) * (sh.userData.amp ?? .12); sh.rotation.z = Math.sin(t * .7 + sh.userData.ph) * (sh.userData.amp ? sh.userData.amp / .12 * .03 : .03); } perf.n++; perf.sum += dt; if (perf.n === 90) { if (perf.sum / 90 > 1 / 28 && !window.__fixed) useAO = false; }
  if (window.__smoke) for (const sm of window.__smoke) { const ph = (t * .25 + sm.userData.ph) % 1; sm.position.y = heightAt(0, TZ + 7) + 2.6 + ph * 4; sm.position.x = Math.sin(ph * 6 + sm.userData.ph * 9) * .4 + ph * .8; sm.scale.setScalar(.6 + ph * 2.2); sm.material.opacity = .22 * (1 - ph) * Math.min(1, ph * 6); }
  if (window.__fire) for (const f of window.__fire) { f.userData.h ??= f.scale.y; f.scale.y = f.userData.h * (1 + Math.sin(t * 9 + f.position.x * 17) * .3); f.rotation.y = t * 2 + f.position.z * 9; }
  let f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - jv.y;
  let s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + jv.x;
  if (keys.ArrowLeft) player.yaw += dt * 1.8; if (keys.ArrowRight) player.yaw -= dt * 1.8;
  if ((f || s) && overview) { const sp = doll.dist * .9 * dt; doll.target.x += (-Math.sin(doll.theta) * f + Math.cos(doll.theta) * s) * sp; doll.target.z += (-Math.cos(doll.theta) * f - Math.sin(doll.theta) * s) * sp; f = s = 0; }
  if ((f || s) && !window.__moved) { window.__moved = true; const h = document.getElementById('help'); if (h) h.hidden = true; }
  if (f || s) { tween = null; const mag = Math.min(1, Math.hypot(f, s)) / (Math.hypot(f, s) || 1); const sp = 3.6 * dt * (keys.ShiftLeft ? 2 : 1) * mag;
    const mx = (-Math.sin(player.yaw) * f + Math.cos(player.yaw) * s) * sp, mz = (-Math.cos(player.yaw) * f - Math.sin(player.yaw) * s) * sp;
    if (!blocked(player.x + mx, player.z + mz)) { player.x += mx; player.z += mz; }
    else if (!blocked(player.x + mx, player.z)) player.x += mx;
    else if (!blocked(player.x, player.z + mz)) player.z += mz; }
  if (tween && tween.path && tween.path.length) { const [wx, wz] = tween.path[0], ddx = wx - player.x, ddz = wz - player.z, dd = Math.hypot(ddx, ddz), st = Math.min(dd, 14 * dt);
    if (dd < .6) tween.path.shift(); else { player.x += ddx / dd * st; player.z += ddz / dd * st; let dy = Math.atan2(-ddx, -ddz) - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); player.yaw += dy * Math.min(1, dt * 5); player.pitch += (-.05 - player.pitch) * Math.min(1, dt * 4); } }
  else if (tween) { const k = 1 - Math.exp(-dt * 3); player.x += (tween.x - player.x) * k; player.z += (tween.z - player.z) * k;
    let dy = tween.yaw - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); player.yaw += dy * k; player.pitch += (tween.pitch - player.pitch) * k;
    if (Math.hypot(tween.x - player.x, tween.z - player.z) < .03 && Math.abs(dy) < .005) tween = null; }
  if (overview) { if (keys.KeyQ) doll.theta += dt * 1.4; if (keys.KeyE) doll.theta -= dt * 1.4; if (keys.KeyR) doll.dist = Math.max(12, doll.dist * (1 - dt)); if (keys.KeyF) doll.dist = Math.min(260, doll.dist * (1 + dt));
    if (!doll.userTilt) doll.phi = .45 + Math.min(1, (doll.dist - 12) / 160) * .65;
    doll.target.x = Math.max(-200, Math.min(240, doll.target.x)); doll.target.z = Math.max(-200, Math.min(220, doll.target.z)); doll.target.y = heightAt(doll.target.x, doll.target.z);
    const t = doll.target, want = new THREE.Vector3(t.x + Math.sin(doll.theta) * Math.cos(doll.phi) * doll.dist, t.y + Math.sin(doll.phi) * doll.dist, t.z + Math.cos(doll.theta) * Math.cos(doll.phi) * doll.dist);
    const minY = heightAt(want.x, want.z) + 3; if (want.y < minY) want.y = minY; camera.position.lerp(want, .18); camera.lookAt(t); }
  else { if (mapbtn.textContent !== 'Bird’s-eye') mapbtn.textContent = 'Bird’s-eye'; placeCamera(); }
  // HUD: nearest station
  const fpx = player.x - Math.sin(player.yaw) * 5.5, fpz = player.z - Math.cos(player.yaw) * 5.5;
  let best = null, bd = 1e9; for (const st of STATIONS) { const d = Math.hypot(st.x - fpx, st.z - fpz); if (d < bd) { bd = d; best = st; } for (const [li, lc] of st.loci.entries()) { lc.gem.rotation.y = t; lc.gem.position.y = lc.gy + .65 + Math.sin(t * 2 + lc.x) * .07;
    const on = tutLocus !== null && st === STATIONS[tutStation] && (tutLocus === 'all' || tutLocus === li); const since = st.seenAt === undefined ? 99 : t - st.seenAt, intro = since < 5; const sc = on ? 1.9 + Math.sin(t * 5) * .25 : (showGems || !intro ? 1 : Math.min(1, (5 - since) / .8)); lc.gem.scale.setScalar(sc); lc.gem.visible = showGems || on || intro; } }
  if (best && bd < 9 && !overview && best.ch !== window.__lastCh) { window.__lastCh = best.ch; hudZ.textContent = `Chapter ${best.ch + (CFG.chOffset || 0)}`; hudS.textContent = ZONE[best.ch - 1]; hud.classList.remove('gone'); clearTimeout(window.__hudT); window.__hudT = setTimeout(() => hud.classList.add('gone'), 5000); }
  if (best && bd < 9 && !overview && best.seenAt === undefined) { best.seenAt = t; hudZ.textContent = `Chapter ${best.ch + (CFG.chOffset || 0)} · ${ZONE[best.ch - 1]}`; hudS.textContent = best.name; hud.classList.remove('gone'); clearTimeout(window.__hudT); window.__hudT = setTimeout(() => hud.classList.add('gone'), 5000); }
  if (best && bd < 9 && !overview) { let nl = best.loci[0], nd = 1e9; for (const lc of best.loci) { const d = Math.hypot(lc.x - player.x, lc.z - player.z); if (d < nd) { nd = d; nl = lc; } }  idx = STATIONS.indexOf(best); }
  else if (false) { hudZ.textContent = CFG.name; hudS.textContent = overview ? (MOBILE ? 'Drag to fly · pinch for height · twist to turn · double-tap to land' : 'Drag to fly · scroll for height · right-drag to turn · double-click to land') : 'Walk the path, or press Next'; }

  if (tutCam) { window.__tutT0 ??= performance.now(); const k0 = Math.min(1, (performance.now() - window.__tutT0) / 1600), k = k0 * k0 * (3 - 2 * k0);
    let T; if (tutCam === 'fly') { const a = t * .12; T = { p: new THREE.Vector3(THEME.fly.p[0] + Math.sin(a) * 120, 95, THEME.fly.p[1] + Math.cos(a) * 120), l: new THREE.Vector3(THEME.fly.l[0], 0, THEME.fly.l[1]) }; } else T = tutCamTarget(tutCam);
    window.__tcp ??= camera.position.clone(); const kk = 1 - Math.exp(-dt * (tutCam === 'fly' ? 1.2 : 2.2)); window.__tcp.lerp(T.p, kk); camera.position.copy(window.__tcp); window.__tutLook = (window.__tutLook || T.l.clone()).lerp(T.l, kk); camera.lookAt(window.__tutLook);
    if (tutCycle && tutLocus === null || (tutCycle && TUT[tutI] && TUT[tutI].locus === undefined)) { const cur = Math.floor(t * 1.1) % 5; tutLocus = cur; for (const grp of [tutSquare, stallSquare]) (grp.userData.discs || []).forEach((d, j) => { if (d.isSprite) d.scale.setScalar(j === cur ? .9 : .55); else d.scale.setScalar(j === cur ? 1.5 : 1); }); } }
  if (false) { const gy = groundY(0, GZ); window.__tutT0 ??= performance.now(); window.__tutK = Math.min(1, (performance.now() - window.__tutT0) / 1400); const k = window.__tutK * window.__tutK * (3 - 2 * window.__tutK); camera.position.lerp(new THREE.Vector3(0, gy + 17, GZ + 13), k); camera.lookAt(0, gy, GZ + 4.5); }

  if (window.__fixed) { const [x, y, z, lx, ly, lz] = window.__fixed; camera.position.set(x, y, z); camera.lookAt(lx, ly, lz); }
  for (const l of ROOM_LIGHTS) l.intensity = camera.position.distanceTo(l.position) < 16 ? l.userData.base : 0;
  for (const f of FIRES) f.update(t, camera);
  if (camera.position.distanceTo(new THREE.Vector3(-11.5, 0, TZ + 11)) < 25) for (const m of PERCHED) m.update(dt);
  birdFrame(dt, t);
  if (useAO) composer.render(); else renderer.render(scene, camera);
  for (const st of STATIONS) for (const lc of st.loci) { const L = lc.label, d = camera.position.distanceTo(L.position); L.visible = !tutCam && (showNums || (tutLocus !== null && st === STATIONS[tutStation])) && (overview ? d < 60 : d < 14); L.material.opacity = overview ? 1 : Math.min(1, (14 - d) / 4); const k = lc.fy !== undefined ? .7 : .9; if (overview) L.scale.set(d * .022, d * .011, 1); else L.scale.set(k, k / 2, 1); }
  for (const z of ZONES) { z.visible = overview || tutCam === 'fly'; if (tutCam === 'fly') { const d = camera.position.distanceTo(z.position); z.scale.set(d * .26, d * .08, 1); z.material.opacity = 1; continue; } if (overview) { const d = camera.position.distanceTo(z.position); { const k = camera.aspect < 1 ? 1.7 : 1; z.scale.set(d * .16 * k, d * .05 * k, 1); } z.material.opacity = Math.min(1, Math.max(.35, (d - 15) / 40)); } }
  for (const st of STATIONS) if (st.banner) { const d = camera.position.distanceTo(st.banner.position); st.banner.visible = overview ? d < 160 : d < 22; if (overview) st.banner.scale.set(d * .06, d * .021, 1); else st.banner.scale.set(2.2, .76, 1); }
  renderer.autoClear = false; renderer.render(labelScene, camera); renderer.autoClear = true; window.__calls = renderer.info.render.calls; requestAnimationFrame(frame);
}
// fix station plinths that sit on the bridge deck
STATIONS.forEach(st => st.loci.forEach(lc => { if (lc.fy !== undefined) { lc.gy = lc.fy - .3; return; } lc.gy = groundY(lc.x, lc.z); lc.base.position.y = lc.gy + .08; lc.label.position.y = lc.gy + 1.15; }));
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.fov = fovFor(camera.aspect); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });
window.__go = i => { idx = i - 1; go(1); if (tween) { tween.path = []; player.x = tween.x; player.z = tween.z; } };
window.__blockedAt = (x, z) => blocked(x, z);
// ---- acceptance-test hooks ----
window.__dump = () => ({ title: BOOK, translation: 'ESV', verses: VERSES, districts: ZONE, rooms: STATIONS.map(st => ({ chapter: st.ch, room: st.room, name: st.name, verses: st.text.replace(BOOK + ' ', ''),
  loci: st.loci.map(l => ({ verse: `${st.ch}:${l.v}`, object: l.where.split(' · ').slice(1).join(' · ') || l.where, pos: [l.x, l.fy ?? l.gy ?? 0, l.z].map(v => +v.toFixed(2)) })),
  stop: { back: st.back ?? null, pitch: st.pitch ?? null, look: st.look.map(v => +(+v).toFixed(2)) } })) });
window.__snap = i => { idx = i - 1; go(1); if (tween) { tween.path = []; player.x = tween.x; player.z = tween.z; player.yaw = tween.yaw; player.pitch = tween.pitch; tween = null; } overview = false; };
// Support rays (__measure) need speed without changing a single result. Every mesh gets a world box, built once (static geometry; skinned / instanced
// meshes are always candidates), so only meshes over the spot are tested. Big merged meshes (the town's baked walls and roofs span the whole map) also
// get an xz grid of their triangles; a ray then tests a temporary mesh made of just the triangles under it, through three's own Mesh.raycast.
let SUPPORT = null; const BIG_TRIS = 4000, CELL = 3;
function supportIndex(o) { const g = o.geometry, pos = g.attributes.position, ix = g.index, n = (ix ? ix.count : pos.count) / 3, e = o.matrixWorld.elements, cells = new Map();
  const wx = i => e[0] * pos.getX(i) + e[4] * pos.getY(i) + e[8] * pos.getZ(i) + e[12], wz = i => e[2] * pos.getX(i) + e[6] * pos.getY(i) + e[10] * pos.getZ(i) + e[14];
  for (let t = 0; t < n; t++) { const a = ix ? ix.getX(t * 3) : t * 3, b = ix ? ix.getX(t * 3 + 1) : t * 3 + 1, c = ix ? ix.getX(t * 3 + 2) : t * 3 + 2, xa = wx(a), xb = wx(b), xc = wx(c), za = wz(a), zb = wz(b), zc = wz(c);
    const x0 = Math.floor(Math.min(xa, xb, xc) / CELL), x1 = Math.floor(Math.max(xa, xb, xc) / CELL), z0 = Math.floor(Math.min(za, zb, zc) / CELL), z1 = Math.floor(Math.max(za, zb, zc) / CELL);
    if ((x1 - x0 + 1) * (z1 - z0 + 1) > 400) { (cells.get('big') || cells.set('big', []).get('big')).push(t); continue; }   // giant triangles are tested everywhere
    for (let X = x0; X <= x1; X++) for (let Z = z0; Z <= z1; Z++) { const k = X + ',' + Z; (cells.get(k) || cells.set(k, []).get(k)).push(t); } }
  return { cells, n, ix }; }
function supportMesh(o, grid, x, z) { const ts = new Set(grid.cells.get('big') || []), m = .25;
  for (let X = Math.floor((x - m) / CELL); X <= Math.floor((x + m) / CELL); X++) for (let Z = Math.floor((z - m) / CELL); Z <= Math.floor((z + m) / CELL); Z++) for (const t of grid.cells.get(X + ',' + Z) || []) ts.add(t);
  if (!ts.size) return null; const src = o.geometry, idx = new Uint32Array(ts.size * 3); let k = 0;
  for (const t of ts) for (let j = 0; j < 3; j++) idx[k++] = grid.ix ? grid.ix.getX(t * 3 + j) : t * 3 + j;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', src.attributes.position); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.boundingBox = src.boundingBox; g.boundingSphere = src.boundingSphere;
  const pm = new THREE.Mesh(g, o.material); pm.matrixWorld.copy(o.matrixWorld); pm.userData = o.userData; return pm; }
function supportCandidates(x, y0, y1, z) { if (!SUPPORT) { scene.updateMatrixWorld(true); SUPPORT = []; scene.traverse(o => { if (!o.isMesh || !o.geometry) return; if (o.isSkinnedMesh || o.isInstancedMesh) { SUPPORT.push({ o, box: null }); return; }
      const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); if (!g.boundingSphere) g.computeBoundingSphere(); const n = (g.index ? g.index.count : g.attributes.position.count) / 3;
      SUPPORT.push({ o, box: g.boundingBox.clone().applyMatrix4(o.matrixWorld).expandByScalar(.05), big: n > BIG_TRIS && !g.morphAttributes.position, grid: null }); }); }
  const out = []; for (const c of SUPPORT) { const b = c.box; if (b && !(x >= b.min.x - .3 && x <= b.max.x + .3 && z >= b.min.z - .3 && z <= b.max.z + .3 && y1 >= b.min.y && y0 <= b.max.y)) continue;
    if (c.big) { c.grid ??= supportIndex(c.o); const pm = supportMesh(c.o, c.grid, x, z); if (pm) out.push(pm); } else out.push(c.o); }
  return out; }
window.__measure = i => { const st = STATIONS[i]; camera.updateMatrixWorld(); const rc = new THREE.Raycaster(), meshes = scene.children.filter(o => o.isMesh);
  const pts = st.loci.map(l => { const top = l.fy ?? l.gy ?? groundY(l.x, l.z), base = Math.min(top, groundY(l.x, l.z) + .3), mid = (top + base) / 2;
    const pb = new THREE.Vector3(l.x, base, l.z).project(camera), pm = new THREE.Vector3(l.x, mid, l.z).project(camera);
    let support = null; for (const [ox, oz] of [[0, 0], [.15, 0], [-.15, 0], [0, .15], [0, -.15]]) { rc.set(new THREE.Vector3(l.x + ox, top + .05, l.z + oz), new THREE.Vector3(0, -1, 0)); rc.far = 3; const hit = rc.intersectObjects(supportCandidates(l.x, top + .05 - 3, top + .05, l.z), false).filter(h => !h.object.userData.isGem && h.object.isMesh)[0]; if (hit && (support === null || hit.distance < support)) support = +hit.distance.toFixed(2); }
    return { sx: pb.x, sy: -pb.y, z: pb.z, mx: pm.x, my: -pm.y, mz: pm.z, support }; });
  return { name: st.name, ch: st.ch, room: st.room, pts }; };
// tests/fast.mjs: jump to stop i, put the camera exactly where frame() would, and measure - no frame is drawn
window.__stopMeasure = i => { window.__snap(i); placeCamera(); return window.__measure(i); };
window.__state = () => ({ idx, x: player.x, z: player.z, hud: hudS.textContent, n: STATIONS.length, moving: !!tween });
window.__blockers = () => { const out = [], rc = new THREE.Raycaster(); const meshes = scene.children.filter(o => o.isMesh && !o.userData.dyn);
  const view = st => { const yaw = Math.atan2(-(st.look[0] - st.x), -(st.look[2] - st.z)); const b = st.banner ? 5.6 : 6.2; return [st.x + Math.sin(yaw) * b, st.z + Math.cos(yaw) * b]; };
  for (let i = 0; i < STATIONS.length - 1; i++) { const nx = STATIONS[i + 1], pts = [view(STATIONS[i]), ...(VIA[`${nx.ch}.${nx.room}`] || []), view(nx)];
    for (let j = 0; j < pts.length - 1; j++) { const [ax, az] = pts[j], [bx, bz] = pts[j + 1];
      const a = new THREE.Vector3(ax, groundY(ax, az) + 1, az), b = new THREE.Vector3(bx, groundY(bx, bz) + 1, bz), d = b.clone().sub(a), L = d.length(); if (L < .01) continue; d.normalize();
      rc.set(a, d); rc.far = L; const h = rc.intersectObjects(meshes, false).filter(h => h.face && h.face.normal.y < .7);
      if (h.length) out.push(`${STATIONS[i].name} -> ${nx.name} leg ${j}: blocked at ${h[0].distance.toFixed(1)}m of ${L.toFixed(1)}m at (${h[0].point.x.toFixed(1)},${h[0].point.z.toFixed(1)})`); } }
  return out; };
window.__cam = (x, y, z, lx, ly, lz) => { overview = false; tween = null; window.__fixed = [x, y, z, lx, ly, lz]; };
