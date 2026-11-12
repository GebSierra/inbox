// ---------- UP-JAMES-CIVIC: James's civic buildings (agora bays, wall gates, the synagogue, the rich man's house) ----------
// Loaded after obj:up-f (uses ufTurret for the gate towers). Every identifier starts with jc. Never calls R(): variation comes from jcRand (a private LCG),
// so the towns' seeded layout never moves. Builders take world positions and return the group; the library entries at the end show them on the stage.
// History notes (owner's request, also in the town's "i" panel): the synagogue follows the owner's brief of 2026-11-12 (first-century Galilean/Judean
// type: inward-facing tiered benches, Doric columns, flat timber roof, ashlar and painted plaster with red bands, stepped mikva'ot in the courtyard);
// the rich man's house is a walled suburban estate house just outside the town, among its fields (James 5:1-6).

const jcRand = (s => () => ((s = (s * 48271) % 2147483647) - 1) / 2147483646)(9157);
const jcM = {
  red: () => mat('jcRed', '#a3402e'), plaster: () => mat('jcPlaster', '#eadbbd'), ash: () => mat('jcAshlar', '#d9c6a0'), ashDk: () => mat('jcAshlarDk', '#c2ab84'),
  beam: () => mat('jcBeam', '#6e4a2c'), roof: () => mat('jcRoof', '#b89a74'), water: () => mat('jcWater', '#4f8f96', { roughness: .15, metalness: .1 }),
  parch: () => mat('jcParch', '#e6d3a6'), ochre: () => mat('jcOchre', '#d6a35c'), gold: () => mat('jcGold', '#c9a03a', { metalness: .5, roughness: .4 }),
};
// flagstone texture, world-mapped (u, v = metres / 2) so big slabs never stretch it
let jcFlagT = null;
function jcFlagMat() {
  if (jcFlagT) return jcFlagT;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#cdb78f'; x.fillRect(0, 0, 256, 256);
  const rows = [0, 70, 130, 196, 256]; for (let r = 0; r < 4; r++) { let cx = 0; while (cx < 256) { const w = 50 + jcRand() * 60, v = 180 + jcRand() * 40 | 0; x.fillStyle = `rgb(${v},${v * .9 | 0},${v * .72 | 0})`; x.fillRect(cx + 2, rows[r] + 2, Math.min(w, 256 - cx) - 4, rows[r + 1] - rows[r] - 4); cx += w; } }
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(90,70,50,${jcRand() * .12})`; x.fillRect(jcRand() * 256, jcRand() * 256, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return jcFlagT = new THREE.MeshStandardMaterial({ map: t, roughness: .95 });
}
function jcWorldUV(mesh, k = .5) {
  mesh.updateMatrixWorld(true); const geo = mesh.geometry, p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); const ay = Math.abs(n.getY(i)), ax = Math.abs(n.getX(i));
    uv.setXY(i, (ay > .5 ? v.x : ax > .5 ? v.z : v.x) * k, (ay > .5 ? v.z : v.y) * k); }
  uv.needsUpdate = true; return mesh;
}
// a straight wall from (x0,z0) to (x1,z1) in group g's local frame, base y, height h, thickness t; returns the mesh
function jcWall(g, x0, z0, x1, z1, y, h, t, m) { const L = Math.hypot(x1 - x0, z1 - z0); const w = box(L, h, t, m, (x0 + x1) / 2, y, (z0 + z1) / 2, g); w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); return w; }
// a plastered wall with the red dado and cornice bands on both faces, and ashlar quoins at both ends
function jcPaintedWall(g, x0, z0, x1, z1, y, h, t = .6, quoins = true) {
  const L = Math.hypot(x1 - x0, z1 - z0), a = -Math.atan2(z1 - z0, x1 - x0), w = new THREE.Group(); w.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); w.rotation.y = a; g.add(w);
  box(L, h, t, jcM.plaster(), 0, 0, 0, w);
  for (const s of [-1, 1]) { const d = box(L, .95, .04, jcM.red(), 0, .05, s * (t / 2 + .02), w); d.userData.nocol = 1; const c = box(L, .45, .04, jcM.red(), 0, h - .75, s * (t / 2 + .02), w); c.userData.nocol = 1; }
  const cap = box(L + .1, .22, t + .14, jcM.ash(), 0, h, 0, w); cap.userData.nocol = 1;
  if (quoins) for (const e of [-1, 1]) for (let k = 0, yy = 0; yy < h - .1; k++) { const bh = .42, q = box(k % 2 ? .55 : .85, bh - .03, t + .06, k % 2 ? jcM.ashDk() : jcM.ash(), e * (L / 2 - (k % 2 ? .275 : .425)), yy, 0, w); q.userData.nocol = 1; yy += bh; }
  return w;
}
// a plain Doric column: base, shaft, echinus and square abacus
function jcDoric(g, x, y, z, h, r = .28) { cyl(r * 1.25, r * 1.3, .22, 12, jcM.ash(), x, y, z, g); cyl(r * .9, r, h - .62, 12, jcM.plaster(), x, y + .22, z, g); cyl(r * 1.25, r * .9, .18, 12, jcM.ash(), x, y + h - .4, z, g); box(r * 2.9, .22, r * 2.9, jcM.ash(), x, y + h - .22, z, g); }

// ---- the agora ring: a partition wall between two bays (the end of a stoa), and the lintel across a bay's mouth ----
function jcBayWall(x0, z0, x1, z1, h = 5.6) { const g = new THREE.Group(); g.position.set(0, heightAt((x0 + x1) / 2, (z0 + z1) / 2), 0); scene.add(g);
  jcWall(g, x0, z0, x1, z1, 0, h, .7, 'wall'); const c = jcWall(g, x0, z0, x1, z1, h, .3, .95, 'marble'); c.userData.nocol = 1; return g; }
function jcBayLintel(x0, z0, x1, z1, y = 4.7) { const g = new THREE.Group(); g.position.set(0, heightAt((x0 + x1) / 2, (z0 + z1) / 2), 0); scene.add(g);
  const b = jcWall(g, x0, z0, x1, z1, y, .7, .9, 'marble'); b.userData.nocol = 1; const t = jcWall(g, x0, z0, x1, z1, y + .7, .25, 1.1, 'wallTrim'); t.userData.nocol = 1; return g; }
// the inner gateway between the gate court and the square: two piers and a lintel, centred on x = 0, opening +-ow
function jcPropylon(z, ow = 3.5, hw = 7.5, d = 4) { const y = heightAt(0, z), g = new THREE.Group(); g.position.set(0, y, z); scene.add(g);
  for (const s of [-1, 1]) { box(hw - ow, 5.6, d, 'wall', s * (ow + hw) / 2, 0, 0, g); box(hw - ow + .3, .3, d + .3, 'marble', s * (ow + hw) / 2, 5.6, 0, g); cyl(.3, .34, 4.6, 12, 'marble', s * (ow - .45), 0, d / 2 + .2, g); }
  const l = box(ow * 2 + .4, 1, d, 'marble', 0, 4.6, 0, g); l.userData.nocol = 1; box(hw * 2 + .4, .35, d + .6, mat('neRoof', '#d2b48a'), 0, 5.9, 0, g).userData.nocol = 1;
  return g; }

// ---- a gate in the city wall: two square towers on the ends of the opening and a lintel with a parapet over it ----
// a, b = the opening's ends ({a, b} from cityWallRing); doors = true hangs two open wooden doors
function jcWallGate(a, b, o = {}) {
  const st = { stone: 'stone', stoneDk: 'stoneDk' }, h = o.h || 3.6, dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  ufTurret(a[0] - ux * .9, a[1] - uz * .9, h, 3, 1.6, st, 300 + a[0], 4); ufTurret(b[0] + ux * .9, b[1] + uz * .9, h, 3, 1.6, st, 310 + b[0], 4);
  const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, y = Math.max(heightAt(a[0], a[1]), heightAt(b[0], b[1]), heightAt(cx, cz)), g = new THREE.Group(); g.position.set(cx, y, cz); g.rotation.y = -Math.atan2(dz, dx); scene.add(g);
  const M2 = ufMats(st), top = 4.2;
  box(L + .4, 1.5, 1.6, M2.st, 0, top, 0, g).userData.nocol = 1; box(L + .7, .3, 1.9, M2.drl, 0, top + 1.5, 0, g).userData.nocol = 1;
  for (let k = 0; k < Math.floor(L / 1.6); k++) for (const s of [-1, 1]) box(.8, .8, .4, M2.sd, -L / 2 + .8 + k * 1.6, top + 1.8, s * .7, g).userData.nocol = 1;
  box(L - .2, .35, 1.7, M2.drd, 0, top - .35, 0, g).userData.nocol = 1;   // the lintel's dressed soffit
  if (o.doors !== false) for (const s of [-1, 1]) { const d = box(.14, 3.6, L / 2 - .2, mat('jcGateDoor', '#5a3a22'), s * (L / 2 - .15), 0, 1.2 + (L / 4), g); d.userData.nocol = 1; }
  return g;
}

// ---- the synagogue (James 2): owner's brief, see the header. Centred on (x, z), front (entrance side) facing -x towards the avenue. ----
// Local frame: +x away from the avenue, standing on the avenue facing +x the LEFT is -z. Courtyard platform 26 x 26 m, 1 m high, with two sunken stepped basins (mikva'ot)
// front-right; the building 16 x 14.5 m: the assembly hall, the scroll storeroom on the left, a columned portico on the right. Returns { group, raised } where raised are
// RAISED entries (world [cz, hz, cx, hx, top]) for walking on the platform, the floors and the steps.
function jcSynagogue(x, z) {
  const y0 = heightAt(x, z), g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g); g.updateMatrixWorld(true);
  const P = 1.0, F = P + .5, WH = 4.8, flag = jcFlagMat();
  // courtyard platform: rows of 1 m with the two basin holes left open
  const holes = [[-11, 2, -7, 5], [-11, 8, -7, 11]];
  for (let rz = -13; rz < 13; rz++) { let xs = -13; const cuts = holes.filter(h => rz >= h[1] && rz < h[3]).sort((p, q) => p[0] - q[0]);
    for (const h of cuts) { if (h[0] > xs) jcWorldUV(box(h[0] - xs, P, 1, flag, (xs + h[0]) / 2, 0, rz + .5, g)); xs = h[2]; }
    if (xs < 13) jcWorldUV(box(13 - xs, P, 1, flag, (xs + 13) / 2, 0, rz + .5, g)); }
  for (const [kx, kz, kw, kd] of [[0, -13, 26.3, .3], [0, 13, 26.3, .3], [-13, 0, .3, 26.3], [13, 0, .3, 26.3]]) box(kw, .16, kd, jcM.ashDk(), kx, P - .1, kz, g).userData.nocol = 1;   // a dressed kerb round the edge
  // steps up from the avenue (front, -x), centred
  for (let k = 0; k < 4; k++) jcWorldUV(box(.45, P * (k + 1) / 5, 7, flag, -13.2 - (3 - k) * .45 - .2, 0, 0, g));
  // the two mikva'ot: plastered pits with steps down along one side and water at the bottom
  for (const [hx0, hz0, hx1, hz1] of holes) { const wz = (hz0 + hz1) / 2, ww = hz1 - hz0;
    box(hx1 - hx0, .05, ww, mat('jcPit', '#b9a582'), (hx0 + hx1) / 2, 0, wz, g);
    for (let k = 0; k < 4; k++) box(.55, P - (k + 1) * .2, ww, jcM.plaster(), hx0 + .275 + k * .55, 0, wz, g);
    const w = box(hx1 - hx0 - 2.2, .32, ww - .02, jcM.water(), hx1 - (hx1 - hx0 - 2.2) / 2, 0, wz, g); w.userData.nocol = 1;
    for (const [a0, b0, a1, b1] of [[hx0, hz0, hx1, hz0], [hx0, hz1, hx1, hz1], [hx1, hz0, hx1, hz1]]) { const r = jcWall(g, a0, b0, a1, b1, P - .02, .12, .25, jcM.ash()); r.userData.nocol = 1; } }
  // building floors: hall and storeroom on a low podium, the portico floor
  const X0 = -4, X1 = 12, Z0 = -5, Z1 = 5.5, SZ0 = -9;
  jcWorldUV(box(X1 - X0 + .6, .5, Z1 - SZ0 + .6, flag, (X0 + X1) / 2, P, (SZ0 + Z1) / 2, g)); jcWorldUV(box(X1 - X0 + .6, .5, 3.6, flag, (X0 + X1) / 2, P, Z1 + 2.1, g));
  // walls (door gaps: main door front-left, storeroom door, side door to the portico)
  const W = (a0, b0, a1, b1, q) => jcPaintedWall(g, a0, b0, a1, b1, F, WH, .6, q);
  W(X0, -2.2, X0, Z1); W(X0, Z0, X0, -3.8, false);                       // front wall, the main door between z -3.8 and -2.2
  W(X1, SZ0, X1, Z1);                                                    // back wall (hall and storeroom)
  W(X0, Z1, 5.3, Z1); W(6.7, Z1, X1, Z1, false);                         // right wall onto the portico, side door at x 6
  W(X0, Z0, 5.3, Z0, false); W(6.7, Z0, X1, Z0, false);                  // hall / storeroom wall, inner doorway at x 6
  W(X0, SZ0, X1, SZ0); W(X0, SZ0, X0, Z0, false);                        // the storeroom's outer walls
  // the stepped main entrance: a framed ashlar portal with a panelled door standing open, and steps down to the courtyard
  for (const s of [-1, 1]) box(.7, 3.4, .5, jcM.ash(), X0 - .1, F, -3 + s * 1.05, g);
  box(.8, .5, 2.8, jcM.ash(), X0 - .1, F + 3.4, -3, g); box(1.1, .2, 3.1, jcM.ashDk(), X0 - .2, F + 3.9, -3, g);
  { const d = box(.08, 3.2, 1.4, jcM.beam(), X0 + .55, F, -3.7 + .7, g); d.rotation.y = 1.2; d.position.set(X0 + .75, F, -3.55); d.userData.nocol = 1; for (let k = 0; k < 3; k++) { const p = box(.1, .8, 1.1, mat('jcDoorPanel', '#5b3b22'), X0 + .74, F + .35 + k * 1, -3.55, g); p.rotation.y = 1.2; p.userData.nocol = 1; } }
  for (let k = 0; k < 3; k++) jcWorldUV(box(.4, P + (k + 1) * .5 / 3 - P + P, 2.4, flag, X0 - .5 - (2 - k) * .4, 0, -3, g));
  // inward-facing tiered benches on all four walls of the hall, broken at the doors
  const T = [[1.8, .45], [1.2, .9], [.6, 1.35]], hx0 = X0 + .3, hx1 = X1 - .3, hz0 = Z0 + .3, hz1 = Z1 - .3;
  for (const [d, h] of T) {
    const B = (a0, b0, a1, b1) => { if (a1 - a0 > .05 && b1 - b0 > .05) box(a1 - a0, h, b1 - b0, jcM.ash(), (a0 + a1) / 2, F, (b0 + b1) / 2, g); };
    B(hx0, hz0, hx0 + d, -3.9); B(hx0, -2.1, hx0 + d, hz1);                          // front (door gap)
    B(hx1 - d, hz0, hx1, hz1);                                                        // back
    B(hx0 + d, hz1 - d, 5.2, hz1); B(6.8, hz1 - d, hx1 - d, hz1);                     // right (side door gap)
    B(hx0 + d, hz0, 5.2, hz0 + d); B(6.8, hz0, hx1 - d, hz0 + d);                     // left (storeroom door gap)
  }
  // the interior colonnade on the inner edge of the benches, carrying architraves and the ceiling joists
  const cx0 = hx0 + 2.1, cx1 = hx1 - 2.1, cz0 = hz0 + 2.1, cz1 = hz1 - 2.1, CH = WH - .5, cols = [];
  for (let k = 0; k < 5; k++) { const cx = cx0 + (cx1 - cx0) * k / 4; cols.push([cx, cz0], [cx, cz1]); } cols.push([cx0, (cz0 + cz1) / 2], [cx1, (cz0 + cz1) / 2]);
  for (const [cx, cz] of cols) jcDoric(g, cx, F, cz, CH, .26);
  for (const cz of [cz0, cz1]) { const a = box(cx1 - cx0 + .8, .4, .5, jcM.beam(), (cx0 + cx1) / 2, F + CH, cz, g); a.userData.nocol = 1; }
  for (const cx of [cx0, cx1]) { const a = box(.5, .4, cz1 - cz0 + .8, jcM.beam(), cx, F + CH, (cz0 + cz1) / 2, g); a.userData.nocol = 1; }
  for (let k = 0; k <= 10; k++) { const jx = X0 + .4 + (X1 - X0 - .8) * k / 10; const j = box(.22, .26, Z1 - Z0, jcM.beam(), jx, F + WH - .3, (Z0 + Z1) / 2, g); j.userData.nocol = 1; }
  // the flat earth roof: timber deck seen from below, a packed-earth slab and a low parapet
  box(X1 - X0 + .6, .12, Z1 - SZ0 + .6, mat('jcDeck', '#8a6440'), (X0 + X1) / 2, F + WH - .04, (SZ0 + Z1) / 2, g).userData.nocol = 1;
  box(X1 - X0 + .9, .35, Z1 - SZ0 + .9, jcM.roof(), (X0 + X1) / 2, F + WH + .08, (SZ0 + Z1) / 2, g).userData.nocol = 1;
  // two wooden reading lecterns in the middle of the floor, each with an unrolled scroll
  for (const [lx, lz, r] of [[2.2, -.9, .25], [6.8, 1.1, -.25]]) { const L = new THREE.Group(); L.position.set(lx, F, lz); L.rotation.y = r; g.add(L);
    box(.5, .08, .5, jcM.beam(), 0, 0, 0, L); box(.12, 1.05, .12, jcM.beam(), 0, .08, 0, L); const t = box(.9, .07, .62, jcM.beam(), 0, 1.15, 0, L); t.rotation.z = -.28;
    const sc = box(.72, .02, .5, jcM.parch(), 0, 1.21, 0, L); sc.rotation.z = -.28; for (const e of [-1, 1]) { const rl = cyl(.05, .05, .58, 8, jcM.beam(), e * .36, 1.18 - e * .1, -.29, L); rl.rotation.x = Math.PI / 2; } }
  // the scroll storeroom: tall scrolls on wooden rollers standing upright along the back, and a lidded chest
  for (let k = 0; k < 7; k++) { const sx = 4.35 + k * .55, sz = SZ0 + .75; cyl(.13, .13, .9, 10, jcM.parch(), sx, F + .12, sz, g); for (const e of [-1, 1]) { cyl(.035, .035, 1.2, 6, jcM.beam(), sx + e * .12, F, sz, g); add(new THREE.SphereGeometry(.06, 6, 4), jcM.beam(), sx + e * .12, F + 1.22, sz, g); } }
  box(4.2, .1, .6, jcM.beam(), 6, F, SZ0 + .75, g);
  box(1.4, .7, .8, jcM.beam(), X1 - 2.2, F, SZ0 + 1, g); box(1.5, .14, .9, mat('jcLid', '#5e3d22'), X1 - 2.2, F + .7, SZ0 + 1, g); box(1.42, .06, .1, jcM.gold(), X1 - 2.2, F + .45, SZ0 + 1.42, g);
  box(X1 - X0 - .6, .12, 4 - .6, mat('jcDeck', '#8a6440'), (X0 + X1) / 2, F + WH - .04, (SZ0 + Z0) / 2, g).userData.nocol = 1;
  // the covered portico along the right wing: columns, a roof, and the elders' bench on the inner wall
  const PZ = Z1 + 3.5;
  for (let k = 0; k < 5; k++) jcDoric(g, X0 + .4 + (X1 - X0 - .8) * k / 4, F, PZ - .4, 3.6, .25);
  box(X1 - X0 + .6, .45, .6, jcM.ash(), (X0 + X1) / 2, F + 3.6, PZ - .4, g).userData.nocol = 1;
  for (let k = 0; k <= 6; k++) box(.18, .22, 3.8, jcM.beam(), X0 + .2 + (X1 - X0 - .4) * k / 6, F + 3.85, Z1 + 1.8, g).userData.nocol = 1;
  box(X1 - X0 + .8, .3, 4.1, jcM.roof(), (X0 + X1) / 2, F + 4.05, Z1 + 1.8, g).userData.nocol = 1;
  box(X1 - X0 - 1, .45, .55, jcM.ash(), (X0 + X1) / 2, F, Z1 + .62, g); box(X1 - X0 - 1, .1, .62, jcM.ashDk(), (X0 + X1) / 2, F + .45, Z1 + .62, g);
  for (const [px, pz] of [[X0 - .1, Z1 + 1.8]]) box(.6, .5, 3.6, flag, px, P, pz, g);   // a step at the portico's open front end
  // walking: platform, steps (half height), floors
  const raised = [[z, 13, x, 13, y0 + P], [z, 3.5, x - 13.9, .9, y0 + P * .5], [z + (SZ0 + Z1) / 2, (Z1 - SZ0) / 2 + .3, x + (X0 + X1) / 2, (X1 - X0) / 2 + .3, y0 + F], [z + Z1 + 2.1, 1.8, x + (X0 + X1) / 2, (X1 - X0) / 2 + .3, y0 + F]];
  return { group: g, raised };
}

// ---- the rich man's house (James 5): a walled estate house just outside the town. Centred on (x, z), the gate in the wall faces -z. ----
function jcRichHouse(x, z) {
  const y0 = heightAt(x, z), g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g); g.updateMatrixWorld(true);
  const flag = jcFlagMat();
  // the estate wall (ochre plaster on a stone footing) with a gate on the -z side
  const ew = (a0, b0, a1, b1) => { jcWall(g, a0, b0, a1, b1, 0, .6, .8, 'stoneDk'); jcWall(g, a0, b0, a1, b1, .6, 2.2, .6, jcM.ochre()); const c = jcWall(g, a0, b0, a1, b1, 2.8, .2, .8, jcM.ash()); c.userData.nocol = 1; };
  ew(-9, -9, -1.8, -9); ew(1.8, -9, 9, -9); ew(9, -9, 9, 9); ew(9, 9, -9, 9); ew(-9, 9, -9, -9);
  for (const s of [-1, 1]) { box(1, 3.8, 1, jcM.ash(), s * 2.3, 0, -9, g); box(.12, 3, 1.7, mat('jcGateDoor', '#5a3a22'), s * 1.75, 0, -8.1, g).userData.nocol = 1; }
  box(5.6, .5, 1.2, jcM.ash(), 0, 3.8, -9, g).userData.nocol = 1;
  // a paved garden court with a pool
  jcWorldUV(box(17, .08, 6, flag, 0, 0, -5.6, g)); box(4, .35, 2.4, jcM.ash(), 0, 0, -5.6, g); box(3.6, .1, 2, jcM.water(), 0, .28, -5.6, g).userData.nocol = 1;
  // the house: two storeys, a columned porch below and an open loggia above, a flat roof with a parapet
  box(16, .4, 7.5, jcM.ash(), 0, 0, 4.6, g);
  box(16, 3.4, 6.5, jcM.plaster(), 0, .4, 5.4, g); box(16, 3.2, 6.5, jcM.ochre(), 0, 3.8, 5.4, g);
  for (const s of [-1, 1]) { const d = box(16.05, .6, .05, jcM.red(), 0, .5, 5.4 + s * 3.26, g); d.userData.nocol = 1; }
  for (let k = 0; k < 6; k++) jcDoric(g, -7.2 + k * 2.88, .4, 1.4, 3.4, .22);
  box(16.3, .35, 1.6, jcM.ash(), 0, 3.8, 1.5, g).userData.nocol = 1;
  for (let k = 0; k < 6; k++) cyl(.14, .16, 2.4, 10, 'marble', -7.2 + k * 2.88, 4.15, 1.6, g);
  for (let k = 0; k < 11; k++) box(.12, .7, .12, jcM.ash(), -7.5 + k * 1.5, 4.15, 1.0, g).userData.nocol = 1;
  box(16, .12, 1.0, jcM.ash(), 0, 4.85, 1.0, g).userData.nocol = 1;
  box(16.6, .3, 8, jcM.roof(), 0, 7.0, 4.9, g).userData.nocol = 1; box(16.6, .5, .25, jcM.ash(), 0, 7.3, 1.0, g).userData.nocol = 1;
  box(1.4, 2.6, .1, 'dark', 0, .4, 2.12, g); for (const s of [-1, 1]) for (const yy of [1.4, 4.9]) box(.9, 1.1, .08, 'dark', s * 5, yy, 2.13, g);
  // a granary block on the east side of the court: his stored-up wealth (5:2-3), jars at the door
  box(4, 3, 5, jcM.plaster(), 6.4, 0, -4.4, g); box(4.3, .3, 5.3, jcM.roof(), 6.4, 3, -4.4, g).userData.nocol = 1; box(.1, 2.2, 1.2, 'dark', 4.38, 0, -4.4, g);
  for (const [jx, jz] of [[3.6, -6.6], [3.6, -2.4], [3.2, -3.0]]) { const j = add(new THREE.SphereGeometry(.4, 10, 7), mat('jcJar', '#b0623e'), jx, .4, jz, g); j.scale.y = 1.3; cyl(.15, .2, .25, 8, mat('jcJar', '#b0623e'), jx, .85, jz, g); }
  return g;
}

// ---- library entries ----
{ const T = (fn, id, label, origin, tags) => defObject(id, (g, x, y, z) => viaScene(g, x, y, z, fn), { label, origin, tags, kind: 'structure' });
  T(() => { jcSynagogue(0, 0); }, 'synagogue-galilean', 'Synagogue: inward-facing benches, lecterns, scroll room, portico and mikva’ot', 'james 2', ['synagogue', 'benches', 'columns', 'water']);
  T(() => { jcRichHouse(0, 0); }, 'rich-mans-house', 'Rich man’s walled estate house with a granary', 'james 5', ['house', 'estate', 'wall']);
  T(() => { jcWallGate([-4, 0], [4, 0]); }, 'wall-gate-small', 'Small gate in the city wall: two towers and a lintel', 'james 3', ['gate', 'wall', 'stone']); }
