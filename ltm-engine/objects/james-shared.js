// ---------- SHARED BUILDERS: James's agora, built by the town AND shown in the object library (one source of truth) ----------
// The buildings of the agora, lifted out of james-ltm/world/agora.js and parameterised by where they stand. The town calls them at its real
// coordinates; the library (objects/structures.js) calls the same functions at the origin of its flat stage.
// Loaded before the world parts (town.json "obj:james-shared"); only function declarations, so nothing runs until a town or the library calls them.

// a colonnade (stoa): columns along one side, back wall, flat entablature and a tiled lean-to roof
function agoraStoa(xa, za, xb, zb, { depth = 4, h = 4.6, cols = 6, face = 1, wall = 'wall', col = 'marble', gap = null } = {}) {
  const L = Math.hypot(xb - xa, zb - za), ang = Math.atan2(zb - za, xb - xa), g = new THREE.Group();
  const cx = (xa + xb) / 2, cz = (za + zb) / 2; g.position.set(cx, heightAt(cx, cz), cz); g.rotation.y = -ang; scene.add(g);
  // local x runs along the stoa, local z points out towards the square (face = side of the square)
  const out = face, y = .05;
  box(L, .35, depth, 'marble', 0, y, out * 0, g).position.z = 0;
  box(L, h + .6, .5, wall, 0, y, -out * depth / 2, g);
  for (let i = 0; i < cols; i++) { const lx = -L / 2 + .6 + i * (L - 1.2) / (cols - 1); if (gap && lx > gap[0] && lx < gap[1]) continue;
    cyl(.34, .34, .3, 10, col, lx, y + .35, out * (depth / 2 - .4), g); cyl(.26, .3, h - .6, 12, col, lx, y + .65, out * (depth / 2 - .4), g); box(.7, .25, .7, col, lx, y + h + .05, out * (depth / 2 - .4), g); }
  box(L, .55, .9, 'marble', 0, y + h + .3, out * (depth / 2 - .4), g);
  box(L + .4, .3, depth + .9, mat('neRoof', '#d2b48a'), 0, y + h + .85, 0, g); box(L + .4, .45, .25, mat('neRoof', '#d2b48a'), 0, y + h + 1.15, out * (depth / 2 + .3), g);
  box(L, .3, depth, 'wallTrim', 0, y + h + .55, 0, g);
  return g; }

// 2 · Tower of the Winds: an octagonal marble tower with a sundial face and wind reliefs
function towerOfTheWinds(tx, tz) {
  const y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
  cyl(3.1, 3.2, .5, 8, 'marble', 0, 0, 0, g); const body = cyl(2.6, 2.6, 7.6, 8, mat('towerM', '#efe2c8'), 0, .5, 0, g); body.rotation.y = Math.PI / 8;
  const fr = cyl(2.72, 2.72, .9, 8, 'marble', 0, 7.1, 0, g); fr.rotation.y = Math.PI / 8;
  const rf = add(new THREE.ConeGeometry(2.9, 1.5, 8), 'stoneDk', 0, 8.75, 0, g); rf.rotation.y = Math.PI / 8; cyl(.12, .2, .5, 6, 'marble', 0, 9.4, 0, g);
  // sundial on the face towards the square
  { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#e8dcc4'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#6a5a48'; x.lineWidth = 3;
    for (let k = 0; k <= 8; k++) { const a = Math.PI * (k / 8); x.beginPath(); x.moveTo(64, 30); x.lineTo(64 - Math.cos(a) * 60, 30 + Math.sin(a) * 60); x.stroke(); } x.beginPath(); x.arc(64, 30, 58, 0, Math.PI); x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const d = add(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 2.45, 5.7, 0, g); d.rotation.y = Math.PI / 2; d.rotation.z = 0; }
  // wind gods in the frieze: little winged figures on every face
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, fx = Math.cos(a) * 2.75, fz = Math.sin(a) * 2.75; const w = box(.9, .5, .12, 'marble', fx, 7.3, fz, g); w.rotation.y = -a + Math.PI / 2; const bdy = box(.25, .55, .14, 'stoneDk', fx * 1.01, 7.2, fz * 1.01, g); bdy.rotation.y = -a + Math.PI / 2; }
  // doorway on the square side
  box(.12, 2.4, 1.3, 'dark', 2.42, .5, 1.1, g);
}

// 3 · The Tholos: a round building with a ring of columns, a dome and a dark doorway
function tholos(tx, tz) {
  const y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
  cyl(5.3, 5.5, .6, 24, 'marble', 0, 0, 0, g); cyl(5.0, 5.0, .25, 24, 'marble', 0, .6, 0, g); cyl(3.4, 3.4, 4.2, 20, 'wall', 0, .85, 0, g);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; cyl(.24, .28, 4.1, 10, 'marble', Math.cos(a) * 4.5, .85, Math.sin(a) * 4.5, g); }
  cyl(4.85, 4.85, .55, 24, 'marble', 0, 4.95, 0, g); add(new THREE.SphereGeometry(4.7, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat('neDome', '#e2cba2'), 0, 5.5, 0, g); cyl(.35, .45, .8, 8, 'marble', 0, 10.1, 0, g);
  box(.15, 2.6, 1.5, 'dark', 3.38, .85, 0, g);
}

// 5 · The Mirror Court: a half-round bench (exedra) with low walls
function exedra(ex, ez) {
  const y = heightAt(ex, ez), g = new THREE.Group(); g.position.set(ex, y, ez); scene.add(g);
  for (let k = 0; k <= 12; k++) { const a = Math.PI / 2 + k / 12 * Math.PI; const bx = Math.cos(a) * -3.4, bz = Math.sin(a) * 3.4;
    const w = box(.95, 2.4, .5, 'wall', bx, 0, bz, g); w.rotation.y = -a; const s = box(.95, .5, .6, 'marble', bx * .85, 0, bz * .85, g); s.rotation.y = -a; }
  box(.4, 2.6, .4, 'marble', 0, 0, -3.6, g); box(.4, 2.6, .4, 'marble', 0, 0, 3.6, g);
}

// 6 · The Almshouse Portico: four columns under a pediment, a door into the almshouse
function almshousePortico(px, pz) {
  const y = heightAt(px, pz), g = new THREE.Group(); g.position.set(px, y, pz); scene.add(g);
  box(6, 5.6, 9, 'wall', 1.6, 0, 0, g); box(6.4, .5, 9.4, mat('neRoof', '#d2b48a'), 1.6, 5.6, 0, g); box(2.6, .3, 9, 'marble', -2.6, 0, 0, g);
  for (const zz of [-3.6, -1.2, 1.2, 3.6]) { cyl(.24, .28, 3.6, 10, 'marble', -3.4, .3, zz, g); }
  box(1.6, .45, 9.4, 'marble', -3.1, 3.9, 0, g); box(3.4, .3, 9.8, mat('neRoof', '#d2b48a'), -2.4, 4.3, 0, g);
  box(.15, 2.4, 1.4, 'dark', -1.4, .3, 0, g);
}

// 1 · The Gate Stoa: a columned porch across the court just inside the gate (centred on x = 0)
function gateStoaPorch(z) {
  const y = heightAt(0, z);
  box(27, .25, 2.4, 'marble', 0, y, z);
  for (const x of [-12, -9, -6, -3, 3, 6, 9, 12]) { cyl(.32, .32, .3, 10, 'marble', x, y + .25, z); cyl(.24, .28, 4.2, 12, 'marble', x, y + .55, z); box(.6, .22, .6, 'marble', x, y + 4.75, z); }
  box(27, .5, .9, 'marble', 0, y + 4.95, z); box(27.4, .3, 2.6, mat('neRoof', '#d2b48a'), 0, y + 5.45, z);
}

// the sacred centre of the square: a small altar with four posts (clear of the walking lanes), centred on x = 0
function agoraAltar(z) { const y = heightAt(0, z); box(1.6, .5, 1.6, 'stone', 0, y, z); box(1.2, .9, 1.2, 'marble', 0, y + .5, z); box(1.4, .15, 1.4, 'marble', 0, y + 1.4, z);
  for (const [x, pz] of [[-1.6, z + 6], [1.6, z + 6], [-1.6, z - 6], [1.6, z - 6]]) { cyl(.2, .25, .5, 8, 'marble', x, heightAt(x, pz), pz); } }
