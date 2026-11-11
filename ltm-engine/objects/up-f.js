// ---------- UP-F: the city wall ring, built from the same masonry as the city gate ----------
// Loaded after obj:up-a (it uses uaStoneMat: the coursed-ashlar and dressed-stone materials in each town's own stone colours).
// Public: cityWallRing(GZ, opts)  the whole ring (six runs, corner turrets, postern piers) that the towns' gate parts call;  ufCityWall(x0,z0,x1,z1,h,o)  one run.
// Field and garden walls stay with the plain stoneWall() in engine/props.js. Never calls R() except where the old stoneWall did: one R(.85,1.1) per 2.2 m
// segment, drawn and thrown away, so the towns' layout stream does not move. Decoration is marked userData.nocol so it adds no collision; the segment's core box
// is the same footprint as the old wall box (length x .8 wide), so walking is unchanged.
const UFC = {};
function ufMats(o) {
  const k = o.stone + '|' + o.stoneDk; if (UFC[k]) return UFC[k];
  return UFC[k] = { st: uaStoneMat(o.stone, 'Ash'), sd: uaStoneMat(o.stoneDk, 'Ash'), moss: uaStoneMat(o.stoneDk, 'Ash', '#c4ccac'), drd: uaStoneMat(o.stoneDk, 'Dr'), drl: uaStoneMat('marble', 'Dr'), dr: uaStoneMat(o.stone, 'Dr') };
}
// world-aligned texture coordinates for a box mesh inside a wall group: u runs along the wall (s0 = distance of the group's origin), v is the height (y0 = base height)
function ufUV(mesh, s0, y0) {
  const rep = mesh.material.map && mesh.material.map.userData && mesh.material.map.userData.rep; if (!rep) return mesh;
  const geo = mesh.geometry, p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, ox = mesh.position.x + s0, oy = mesh.position.y + y0, oz = mesh.position.z;
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i) + ox; v = p.getZ(i) + oz; } else if (az >= ax) { u = p.getX(i) + ox; v = p.getY(i) + oy; } else { u = p.getZ(i) + oz; v = p.getY(i) + oy; }
    uv.setXY(i, u * rep, v * rep); }
  uv.needsUpdate = true; return mesh;
}
function ufB(g, w, h, d, m, x, y, z, s0, y0) { const mesh = box(w, h, d, m, x, y, z, g); mesh.userData.nocol = 1; return ufUV(mesh, s0, y0); }
// a square turret / pier: size s, rising `up` above the wall top, merlons on every corner (and between them when size > 2)
function ufTurret(x, z, h, s, up, o, s0) {
  const M2 = ufMats(o), gy = heightAt(x, z), g = new THREE.Group(); g.position.set(x, gy - .5, z); scene.add(g);
  const hh = h + .5 + up, y0 = gy - .5, hs = s / 2;
  const core = ufUV(box(s, hh, s, M2.st, 0, 0, 0, g), s0, y0); core.userData.nocol = 1;
  ufB(g, s + .3, 1.05, s + .3, M2.moss, 0, 0, 0, s0, y0); ufB(g, s + .34, .1, s + .34, M2.drd, 0, 1.05, 0, s0, y0);
  ufB(g, s + .22, .1, s + .22, M2.drd, 0, hh - .7, 0, s0, y0); ufB(g, s + .4, .3, s + .4, M2.drl, 0, hh - .6, 0, s0, y0);
  const mer = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [a * (hs - .4), b * (hs - .4), 1]); if (s > 2) for (const q of [-1, 1]) { mer.push([q * (hs - .4), 0, 0], [0, q * (hs - .4), 0]); }
  for (const [a, b, c] of mer) ufB(g, c ? .8 : (a ? .6 : 1), .95, c ? .8 : (a ? 1 : .6), M2.sd, a, hh, b, s0, y0);
  return g;
}
// one straight run of city wall from (x0,z0) to (x1,z1), h metres above the ground (the gate's towers carry the same cornice line, see wallH in cityGate)
function ufCityWall(x0, z0, x1, z1, h = 3.6, opts = {}) {
  const o = Object.assign({ stone: 'stone', stoneDk: 'stoneDk', centre: [15, 15], run: 0 }, opts), M2 = ufMats(o);
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 2.2), gr = [];
  for (let i = 0; i <= n; i++) { const t = i / n; gr.push(heightAt(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)); }
  const base = gr.map((_, i) => (gr[Math.max(0, i - 1)] + gr[i] + gr[Math.min(n, i + 1)]) / 3 - .5);   // smoothed foundation line: the cornice runs level, not in steps
  for (let i = 0; i < n; i++) {
    if (!o.quiet) R(.85, 1.1);   // the old wall drew this for its random height; keep the stream where it was
    const ta = i / n, tb = (i + 1) / n, ax = x0 + (x1 - x0) * ta, az = z0 + (z1 - z0) * ta, bx = x0 + (x1 - x0) * tb, bz = z0 + (z1 - z0) * tb;
    const dx = bx - ax, dz = bz - az, Lh = Math.hypot(dx, dz), dy = base[i + 1] - base[i], Ls = Math.hypot(Lh, dy), by0 = (base[i] + base[i + 1]) / 2;
    const g = new THREE.Group(); g.position.set((ax + bx) / 2, by0, (az + bz) / 2); g.rotation.order = 'YZX'; g.rotation.y = -Math.atan2(dz, dx); g.rotation.z = Math.atan2(dy, Lh); scene.add(g);
    const hh = h + .5, s0 = (i + .5) * L / n + o.run * 13.7, y0 = by0, out = Math.sign(-dz * ((ax + bx) / 2 - o.centre[0]) + dx * ((az + bz) / 2 - o.centre[1])) || 1;
    const Lw = Ls * 1.02;
    const core = ufUV(add(new THREE.BoxGeometry(Lw, hh, .8), M2.st, 0, hh / 2, 0, g), s0, y0);                // the solid wall (this box is what blocks walking)
    ufB(g, Lw, 1.05, 1.0, M2.moss, 0, 0, 0, s0, y0); ufB(g, Lw, .1, 1.04, M2.drd, 0, 1.05, 0, s0, y0);       // mossy plinth and its dressed cap, as on the gate towers
    ufB(g, Lw, .1, .92, M2.drd, 0, hh - .7, 0, s0, y0); ufB(g, Lw, .3, 1.2, M2.drl, 0, hh - .6, 0, s0, y0);  // moulded cornice, same line as the gate's
    ufB(g, 1.0, .95, .6, i % 5 === 3 ? M2.st : M2.sd, 0, hh, 0, s0, y0);                                       // one merlon per segment
    if (i % 4 === 1) { ufB(g, 1.14, 1.05, 1.44, M2.moss, 0, 0, 0, s0, y0); ufB(g, 1.18, .1, 1.48, M2.drd, 0, 1.05, 0, s0, y0); ufB(g, 1.0, hh - 2.25, 1.3, M2.st, 0, 1.15, 0, s0, y0); ufB(g, 1.14, .1, 1.44, M2.drd, 0, hh - 1.1, 0, s0, y0); }   // a pilaster through both faces
    if (i % 4 === 3) { ufB(g, .34, 1.4, .06, M2.dr, 0, hh * .5 + .2, out * .4, s0, y0); ufB(g, .13, 1.1, .08, 'dark', 0, hh * .5 + .35, out * .41, s0, y0); }   // arrow slit on the outer face
  }
}
// the whole ring round a town whose gate stands at z = GZ: two runs from the gate towers (x = +-9.5), the three outer sides, corner turrets, and a pier on each side of the
// opening in the east wall. The runs are drawn in the same order as the six stoneWall calls they replace.
function cityWallRing(GZ, opts = {}) {
  const o = Object.assign({ stone: 'stone', stoneDk: 'stoneDk', h: 3.6 }, opts), h = o.h;
  const runs = [[-9.5, GZ, -70, GZ - 10], [-70, GZ - 10, -70, -40], [-70, -40, 46, -40], [9.5, GZ, 46, GZ - 10], [46, GZ - 10, 46, 8], [46, -4, 46, -40]];
  runs.forEach((r, i) => ufCityWall(r[0], r[1], r[2], r[3], h, Object.assign({}, o, { run: i })));
  [[-70, GZ - 10], [-70, -40], [46, -40], [46, GZ - 10]].forEach(([x, z], i) => ufTurret(x, z, h, 2.6, 1.0, o, 40 + i * 9));
  [[46, 8], [46, -4]].forEach(([x, z], i) => ufTurret(x, z, h, 1.7, .4, o, 80 + i * 9));
}
