// ---------- two ways to use the same hill: five-verse rooms (the owner's method) or the outline's own sections ----------
// "Rooms" (default): the engine's room banners and spot markers, as in every other town.
// "Outline": the room banners and markers are hidden; signposts with the outline headings (books/matthew.json "outline")
// stand at the first object of each section instead. The objects, their order and the walk do not change.
let outlineMode = false; try { outlineMode = localStorage.getItem(STORE + '-outline') === '1'; } catch (e) {}
const SIGNS = [];
{
  for (const sec of (BOOKDATA && BOOKDATA.outline) || []) {
    const lc = STATIONS.filter(s => s.ch === (sec.ch || 1)).flatMap(s => s.loci).find(l => l.v === sec.from); if (!lc) continue;
    const s = label2(sec.title, sec.ref); s.material.color.set('#e8f0ff');
    s.position.set(lc.x, (lc.fy ?? heightAt(lc.x, lc.z)) + 1.9, lc.z); s.visible = false; labelScene.add(s); SIGNS.push(s);
  }
  for (const st of STATIONS) if (st.banner) st.banner.onBeforeRender = () => { st.banner.material.opacity = outlineMode ? 0 : 1; };
}
{ // the switch, in the "i" panel next to Markers and Verse numbers
  const tg = document.querySelector('#credits .tg'), b = document.createElement('button'); b.id = 'modebtn'; tg.prepend(b);
  const sync = () => { b.textContent = `Layout: ${outlineMode ? 'Outline' : '5-verse rooms'}`; b.setAttribute('aria-pressed', outlineMode); stationMat.visible = !outlineMode; gembtn.disabled = outlineMode; };
  b.onclick = () => { outlineMode = !outlineMode; sync(); try { localStorage.setItem(STORE + '-outline', outlineMode ? '1' : '0'); } catch (e) {} };
  sync();
}
window.__outline = () => ({ on: outlineMode, signs: SIGNS.length });
(function signs() {
  for (const s of SIGNS) { const d = camera.position.distanceTo(s.position); s.visible = outlineMode && (overview ? d < 160 : d < 24);
    if (overview) s.scale.set(d * .05, d * .0175, 1); else s.scale.set(1.9, .66, 1); }
  requestAnimationFrame(signs);
})();

// ---------- start at the first room, the Seat (5:1–5), facing it: the owner's chosen opening view (2026-11-17) ----------
if (STATIONS[0] && !overview) { const s = STATIONS[0], yaw = Math.atan2(-(s.look[0] - s.x), -(s.look[2] - s.z)), back = s.back || 6;
  idx = 0; tween = null; player.x = s.x + Math.sin(yaw) * back; player.z = s.z + Math.cos(yaw) * back; player.yaw = yaw; player.pitch = s.pitch ?? -.12; }
// test hook for the planning map: world point -> screen pixel with the current camera
window.__project = (x, y, z) => { const v = new THREE.Vector3(x, y ?? heightAt(x, z), z).project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z]; };
window.__h = (x, z) => heightAt(x, z);

// ---------- model showcase for the blind model critic: window.__showModel(id, angle) builds a library model alone on a plain floor ----------
{ const SX = 40, SZ = 112; let cur = null; const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshStandardMaterial({ color: '#c8b48a', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(SX, heightAt(SX, SZ) + .02, SZ); floor.receiveShadow = true; floor.visible = false; scene.add(floor);
  window.__showModel = (id, angle = .5, dist) => { if (cur) { scene.remove(cur); cur = null; } const e = OBJECTS.get(id); if (!e) return 'missing ' + id;
    floor.visible = true; cur = new THREE.Group(); cur.position.set(SX, heightAt(SX, SZ) + .02, SZ); scene.add(cur); const top = e.fn(cur, 0, 0, 0) || 1;
    cur.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(cur), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), d = dist || Math.max(1.6, Math.max(sz.x, sz.y, sz.z) * 1.25);
    window.__cam(c.x + Math.sin(angle) * d, c.y + d * .3, c.z + Math.cos(angle) * d, c.x, c.y, c.z); return 'ok'; }; }
