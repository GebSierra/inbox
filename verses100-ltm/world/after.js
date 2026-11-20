// ---------- after the engine has finished: where you start, and test hooks ----------
// start at the first room, the Lookout (Genesis 1:1), facing it
if (STATIONS[0] && !overview) { const s = STATIONS[0], yaw = Math.atan2(-(s.look[0] - s.x), -(s.look[2] - s.z)), back = s.back || 7;
  idx = 0; tween = null; player.x = s.x + Math.sin(yaw) * back; player.z = s.z + Math.cos(yaw) * back; player.yaw = yaw; player.pitch = s.pitch ?? -.12; }
window.__project = (x, y, z) => { const v = new THREE.Vector3(x, y ?? heightAt(x, z), z).project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z]; };
window.__h = (x, z) => heightAt(x, z);

// ---------- tap a room's sign to read its passage, in the BSB or the ESV (owner, 2026-11-19) ----------
// The BSB (public domain) ships with the palace in verses.bsb.json; the ESV is read from verses.json when the owner adds it (keys like "John 3:16"),
// and until then the card links to the passage on esv.org. The choice of translation is remembered on this device.
{
  let BSB = {}, ESVT = {}, cur = null, tr = 'bsb';
  try { tr = localStorage.getItem(STORE + '-tr') || 'bsb'; } catch (e) {}
  const card = document.getElementById('passage'), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const CREDIT = { bsb: 'Berean Standard Bible (BSB), public domain.', esv: 'Scripture quotations are from the ESV® Bible, © Crossway.' };
  fetch('./verses.bsb.json').then(r => r.ok ? r.json() : {}).then(j => { BSB = j || {}; render(); }).catch(() => {});
  fetch('./verses.json').then(r => r.ok ? r.json() : {}).then(j => { ESVT = j || {}; render(); }).catch(() => {});
  function render() {
    if (!cur) return; const r = bookRoom(cur.ch, cur.room); if (!r) return;
    const bk = r.ref.replace(/ \d+:.*$/, ''), T = tr === 'esv' ? ESVT : BSB;
    const lines = r.verses.map(v => T[`${bk} ${v}`] ? `<p><sup>${esc(v.split(':')[1])}</sup> ${esc(T[`${bk} ${v}`])}</p>` : null);
    const body = lines.every(Boolean) ? lines.join('')
      : tr === 'esv' ? `<p class="pnone">The ESV text isn’t in this palace yet. <a href="https://www.esv.org/${encodeURIComponent(r.ref).replace(/%20/g, '+')}/" target="_blank" rel="noopener">Read ${esc(r.ref)} on esv.org</a></p>`
      : '<p class="pnone">Loading…</p>';
    card.innerHTML = `<div class="pc" role="dialog" aria-label="${esc(r.ref)}"><button class="px" aria-label="Close">×</button><div class="pr">${esc(r.ref)}</div><div class="pn">${esc(chTitle(cur.ch))} · ${esc(cur.name)}</div>`
      + `<div class="pt"><button data-t="bsb" aria-pressed="${tr === 'bsb'}">BSB</button><button data-t="esv" aria-pressed="${tr === 'esv'}">ESV</button></div><div class="pb">${body}</div><div class="pcr">${CREDIT[tr]}</div></div>`;
  }
  function open(st) { cur = st; card.hidden = false; render(); }
  function close() { cur = null; card.hidden = true; }
  card.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.classList.contains('px')) return close();
    if (b.dataset.t) { tr = b.dataset.t; try { localStorage.setItem(STORE + '-tr', tr); } catch (e2) {} render(); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && cur) close(); });
  // a tap (not a drag) on a sign
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), cv = renderer.domElement;
  const signAt = (cx, cy) => { const b = cv.getBoundingClientRect(); ndc.set((cx - b.left) / b.width * 2 - 1, -((cy - b.top) / b.height) * 2 + 1); rc.setFromCamera(ndc, camera);
    const signs = STATIONS.filter(s => s.banner && s.banner.visible); const hit = rc.intersectObjects(signs.map(s => s.banner), false)[0]; return hit ? signs.find(s => s.banner === hit.object) : null; };
  let down = null;
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  cv.addEventListener('pointerup', e => { if (!down || !document.getElementById('tut').hidden) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (moved < 8 && dt < 500) { const st = signAt(e.clientX, e.clientY); if (st) open(st); } });
  let lastHover = 0; cv.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || e.buttons) return; const t = performance.now(); if (t - lastHover < 120) return; lastHover = t; cv.style.cursor = signAt(e.clientX, e.clientY) ? 'pointer' : ''; });
  // the reference shown at the top of the screen opens the room you are at
  document.getElementById('hud').addEventListener('click', () => { const st = STATIONS[idx] || STATIONS[0]; if (st) open(st); });
  window.__openPassage = i => open(STATIONS[i]); window.__passageText = () => card.innerText;
}
// test hook: what does a ray from (x, y, z) in direction (dx, dy, dz) hit first? (finding stray geometry after the scenery is merged)
window.__probe = (x, y, z, dx, dy, dz) => { const rc = new THREE.Raycaster(new THREE.Vector3(x, y, z), new THREE.Vector3(dx, dy, dz).normalize()); rc.camera = camera; const h = rc.intersectObjects(scene.children, true).find(q => q.object.isMesh && !q.object.material.isShaderMaterial);
  if (!h) return null; const m = h.object.material; return { d: +h.distance.toFixed(2), p: h.point.toArray().map(v => +v.toFixed(2)), n: h.face && h.face.normal.toArray().map(v => +v.toFixed(2)), color: m && m.color && '#' + m.color.getHexString(), type: h.object.geometry.type, size: (() => { h.object.geometry.computeBoundingBox(); const s = h.object.geometry.boundingBox.getSize(new THREE.Vector3()); return s.toArray().map(v => +v.toFixed(1)); })() }; };
