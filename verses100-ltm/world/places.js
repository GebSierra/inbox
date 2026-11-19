// ---------- shared helpers, the ground, and the one room builder every room of this palace uses ----------
// Passage mode (town.json "passages": true): one room per passage, one spot per verse, in the method's fixed order as seen from the path:
// 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre, 6 the way out (the sixth verse of a six-verse passage).
// A room is described entirely in books/verses100.json and built by 'v100.room' below:
//   "args": { "h": 2.2 } or { "spread": [lateral, depth] }   half-size of the square of spots (metres)
//           "floor": { "ground": [x, z], "plus": dy }          a raised floor (the synagogue platform, the upper floor of the house)
//           "scale": 1.15                                      default size of the room's library objects
//   each object: "id" (library) or "place": true (a feature of the place), "what", and optionally
//           "at": [f, s] (metres forward from the room centre, metres right), "lift", "scale", "rot", "mark" (marker height above the floor)
//   "extra": true objects stand in the room without a verse and need their own "at".

// the room's frame: forward (away from the viewer) and right, in world x/z, as station() works them out
function roomFrame(r) { const [x, z] = r.at, [vx, vz] = r.viewer; let fx = x - vx, fz = z - vz; const l = Math.hypot(fx, fz); fx /= l; fz /= l;
  return { x, z, fx, fz, yaw: Math.atan2(vx - x, vz - z), y: heightAt(x, z), at: (f, s) => [x + fx * f - fz * s, z + fz * f + fx * s] }; }
// put a library object down at (x, y, z), its front (local +z) turned by rot; returns the height of its top
function v100Put(id, x, z, rot = 0, s = 1, y = heightAt(x, z), args) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; g.scale.setScalar(s); scene.add(g);
  const e = OBJECTS.get(id); if (!e) { console.warn('[v100] missing library object ' + id); return y + 1; } e.fn(g, 0, 0, 0, ...(args || e.args || []));
  if (e.kind === 'effect') return y + 1;   // light, smoke and glow are centred on their source: leave them where they are
  g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); if (bb.isEmpty()) return y + 1;
  // some library pieces are built at the world origin: set every piece down on its own spot
  const c = bb.getCenter(new THREE.Vector3()); if (Math.hypot(c.x - x, c.z - z) > 2.5) { g.position.x -= c.x - x; g.position.z -= c.z - z; }
  if (Math.abs(bb.min.y - y) > .4) g.position.y -= bb.min.y - y;
  g.updateMatrixWorld(true); return new THREE.Box3().setFromObject(g).max.y; }
// a group standing at room coordinates (f, s), turned with the room (local +z = towards the viewer)
function atRoom(F, f, s, y) { const [x, z] = F.at(f, s), g = new THREE.Group(); g.position.set(x, y ?? heightAt(x, z), z); g.rotation.y = F.yaw; scene.add(g); return g; }
const roomOf = (ch, n) => { const r = bookRoom(ch, n); return r && r.at ? r : null; };

defBuilder('v100.room', (r, { ch }) => {
  const a = r.args || {}, F = roomFrame(r), [L, D] = a.spread || [a.h ?? 2.4, a.h ?? 2.4];
  const DEF = [[-D, -L], [D, -L], [D, L], [-D, L], [0, 0], [D + 1.7, 0]];
  const fy = a.floor !== undefined ? num(a.floor, `${r.name} floor`) : null;
  const baseY = (x, z) => fy !== null ? Math.max(fy, heightAt(x, z)) : heightAt(x, z);
  const out = []; let vi = 0;
  for (const o of r.objects) {
    const [f, s] = o.at || (o.extra ? [0, 0] : DEF[vi]), [x, z] = F.at(f, s), y0 = baseY(x, z);
    let top;
    if (o.place) top = y0 + (o.lift ?? .12);
    else top = v100Put(o.id, x, z, F.yaw + (o.rot || 0), o.scale ?? a.scale ?? 1.15, y0 + (o.lift || 0), o.args);
    if (!o.extra) { out.push({ x, z, y: o.mark !== undefined ? y0 + o.mark : top, what: o.what }); vi++; }
  }
  station(ch, r.room, r.name, F.x, F.z, [F.x + F.fx, 0, F.z + F.fz], out);
  const st = STATIONS[STATIONS.length - 1]; st.back = r.back ?? 7; st.bookBack = true; st.pitch = r.pitch ?? -.17;
});

// ---------- the ground ----------
// level pads under every room of the built districts (not the knoll: its hump is the place)
if (BOOKDATA) for (const c of BOOKDATA.chapters) if (c.chapter <= BUILT) for (const r of c.rooms) if (r.at && !(r.args && (r.args.knoll || r.args.floor))) FLAT.push([r.at[0], r.at[1], 4.6, 4.6]);
FLAT.push([SO[0] - 3.5, SO[1] + 1.5, 16.5, 14.5]);   // the synagogue (as in James)
FLAT.push([23, 0, 25, 13]);                         // the tabernacle court
FLAT.push([78, 0, 21, 13.5]);                       // the Father's House and its yard
{
  const SX = 620, SZ = 560, N = 300, CX = -40;
  const g = new THREE.PlaneGeometry(SX, SZ, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cGrass = new THREE.Color('#a3ad62'), cGrass2 = new THREE.Color('#8f9a52'), cPath = new THREE.Color('#d9bf8e'), cDry = new THREE.Color('#c8b47a'), cFlower = new THREE.Color('#c9b04e');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + CX, z = p.getZ(i); p.setX(i, x);
    p.setY(i, heightAt(x, z));
    const c = cGrass.clone().lerp(cGrass2, (Math.sin(x * .13) * Math.cos(z * .11) + 1) / 2);
    const n2 = Math.sin(x * .041 + 2) * Math.sin(z * .047) + Math.sin(x * .09 - z * .07) * .5; if (n2 > .7) c.lerp(cFlower, .35); else if (n2 < -.6) c.lerp(new THREE.Color('#738f47'), .4);
    if (x > -104) c.lerp(cDry, .35);                                                  // the town and the plain beyond: drier, trodden ground
    if (ROAD_D(x, z) < 2.2 || (x > -104 && Math.abs(z) < 2.2 && x < 96)) c.lerp(cPath, .6);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = R(150, 255) | 0; x.fillStyle = `rgba(${v},${v * .96 | 0},${v * .88 | 0},${R(.15, .5)})`; x.fillRect(R(0, 256), R(0, 256), R(1, 4), R(1, 3)); }
    for (let i = 0; i < 200; i++) { x.strokeStyle = `rgba(90,110,50,${R(.2, .5)})`; x.lineWidth = 1; const a = R(0, 256), b = R(0, 256); x.beginPath(); x.moveTo(a, b); x.lineTo(a + R(-3, 3), b - R(3, 8)); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(120, 120); t.anisotropy = 8; return t; })();
  const t = add(g.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, map: gtex }));
  t.castShadow = false; t.geometry.computeVertexNormals();
}
// distant hills all round
function hillDome(x, z, r, h, c) {
  c = new THREE.Color(c).lerp(SKY, Math.min(.45, Math.max(0, (Math.hypot(x + 40, z) - 180) / 420)));
  const g = new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = R(.92, 1.08); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  const m = add(g, new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1 }), x, -4, z); m.scale.set(r, h, r * R(.7, 1)); m.castShadow = false;
}
for (let i = 0; i < 11; i++) hillDome(-360 + i * 65, -330 + R(-30, 30), R(70, 110), R(30, 55), i % 2 ? '#8b9358' : '#988e60');
for (let i = 0; i < 11; i++) hillDome(-360 + i * 65, 330 + R(-30, 30), R(80, 120), R(40, 70), i % 3 ? '#86955a' : '#958d5e');
hillDome(-420, 0, 120, 60, '#8f965c'); hillDome(320, 0, 120, 50, '#8f965c');

// ---------- small builders shared by the districts ----------
const stoneM = mat('v100Stone', '#cdbd9f'), stoneDkM = mat('v100StoneDk', '#a99a80'), mudM = mat('v100Mud', '#c9a77a'), plasterM = mat('v100Plaster', '#ede0c6'),
  darkM = mat('v100Dark', '#2a2018'), reedM = mat('v100Reed', '#b8a070'), linenM = mat('v100Linen', '#f4efe2'), waterM = mat('v100Water', '#6fa8bc', { metalness: .2, roughness: .15 });
stoneM.map = TEX.stone; stoneDkM.map = TEX.stone; plasterM.map = TEX.plaster; mudM.map = TEX.plaster; reedM.map = TEX.wicker; linenM.map = TEX.cloth;
for (const m of [stoneM, stoneDkM, plasterM, mudM, reedM, linenM]) m.needsUpdate = true;
// a straight wall between two points (its own height above the lower end)
function wallSeg(x0, z0, x1, z1, h, th = .6, m = stoneM, y) { const L = Math.hypot(x1 - x0, z1 - z0), y0 = y ?? Math.min(heightAt(x0, z0), heightAt(x1, z1)) - .15;
  const w = box(L, h + .15, th, m, (x0 + x1) / 2, y0, (z0 + z1) / 2); w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return w; }
// a first-century house: thick walls, flat roof of beams and reeds, a dark doorway on its front (local +z)
// o.door, o.win: local x of the doorway and the window (default -w*.2, w*.25)
function flatHouse(x, z, w, d, hgt, rot, m = mudM, o = {}) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z) - .1, z); g.rotation.y = rot; scene.add(g);
  box(w, hgt, d, m, 0, 0, 0, g); for (let k = 0; k < Math.floor(w / .6); k++) box(.14, .14, d + .3, 'wood', -w / 2 + .3 + k * .6, hgt - .1, 0, g);
  box(w + .1, .14, d + .1, reedM, 0, hgt, 0, g); for (const e of [d / 2, -d / 2]) box(w + .1, .3, .14, m, 0, hgt + .1, e, g);
  const dx = o.door ?? -w * .2, wx = o.win ?? w * .25;
  box(.95, 1.8, .06, darkM, dx, 0, d / 2 + .02, g); box(1.15, .16, .12, 'wood', dx, 1.8, d / 2 + .04, g);
  box(.45, .4, .06, darkM, wx, 1.35, d / 2 + .02, g); return g; }
function rock(x, z, s, y) { const m = add(new THREE.DodecahedronGeometry(s, 0), rnd() > .4 ? stoneM : stoneDkM, x, (y ?? heightAt(x, z)) + s * .3, z); m.rotation.set(R(0, 3), R(0, 3), R(0, 3)); m.scale.y = .65; return m; }
// scatter: trees and shrubs outside a list of keep-clear boxes [x0, z0, x1, z1]
function scatter(x0, z0, x1, z1, n, keep, fn) { let k = 0, tries = 0; while (k < n && tries++ < n * 20) { const x = R(x0, x1), z = R(z0, z1);
  if (ROAD_D(x, z) < 4.5 || keep.some(([a, b, c, d]) => x > a && x < c && z > b && z < d)) continue; fn(x, z); k++; } }
