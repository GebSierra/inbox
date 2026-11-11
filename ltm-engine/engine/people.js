// ---------- townspeople (low-poly figures; the figure itself is built by upPerson() in objects/up-c.js) ----------
function person(x, z, rot, tunic = '#c9a46a', opts = {}) {
  const y = opts.y ?? heightAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  upPerson(g, tunic, opts);
  return g;
}
