// ---------- two ways to use the same hill: five-verse rooms (the owner's method) or the outline's own sections ----------
// "Rooms" (default): the engine's room banners and spot markers, as in every other town.
// "Outline": the room banners and markers are hidden; signposts with the outline headings (books/matthew.json "outline")
// stand at the first object of each section instead. The objects, their order and the walk do not change.
let outlineMode = false; try { outlineMode = localStorage.getItem(STORE + '-outline') === '1'; } catch (e) {}
const SIGNS = [];
{
  const st1 = STATIONS.filter(s => s.ch === 1), loci = st1.flatMap(s => s.loci);
  for (const sec of (BOOKDATA && BOOKDATA.outline) || []) {
    const lc = loci.find(l => l.v === sec.from); if (!lc) continue;
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
