// ---------- after the engine has finished: where you start, and test hooks ----------
// start at the first room, the Lookout (Genesis 1:1), facing it
if (STATIONS[0] && !overview) { const s = STATIONS[0], yaw = Math.atan2(-(s.look[0] - s.x), -(s.look[2] - s.z)), back = s.back || 7;
  idx = 0; tween = null; player.x = s.x + Math.sin(yaw) * back; player.z = s.z + Math.cos(yaw) * back; player.yaw = yaw; player.pitch = s.pitch ?? -.12; }
window.__project = (x, y, z) => { const v = new THREE.Vector3(x, y ?? heightAt(x, z), z).project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z]; };
window.__h = (x, z) => heightAt(x, z);
