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
  mesh.updateMatrixWorld(true); const geo = mesh.geometry, p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, v = new THREE.Vector3(), w = new THREE.Vector3(), nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); w.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); const ay = Math.abs(w.y), ax = Math.abs(w.x);   // world-space normal, so turned walls map correctly
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
// Local frame: +x away from the avenue, standing on the avenue facing +x the LEFT is -z. Courtyard platform 29 x 26 m (front edge FX), 1 m high, with two sunken stepped basins (mikva'ot)
// front-right; the building 16 x 14.5 m: the assembly hall, the scroll storeroom on the left, a columned portico on the right. Returns { group, raised } where raised are
// RAISED entries (world [cz, hz, cx, hx, top]) for walking on the platform, the floors and the steps.
function jcSynagogue(x, z) {
  const y0 = heightAt(x, z), g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g); g.updateMatrixWorld(true);
  const P = 1.0, F = P + .5, WH = 4.8, flag = jcFlagMat();
  // courtyard platform: rows of 1 m with the two basin holes left open
  const FX = -16, holes = [[-12, 2, -8, 5], [-12, 8, -8, 11]];   // FX: the courtyard's front edge (owner 2026-11-12: a little wider in front)
  for (let rz = -13; rz < 13; rz++) { let xs = FX; const cuts = holes.filter(h => rz >= h[1] && rz < h[3]).sort((p, q) => p[0] - q[0]);
    for (const h of cuts) { if (h[0] > xs) jcWorldUV(box(h[0] - xs, P, 1, flag, (xs + h[0]) / 2, 0, rz + .5, g)); xs = h[2]; }
    if (xs < 13) jcWorldUV(box(13 - xs, P, 1, flag, (xs + 13) / 2, 0, rz + .5, g)); }
  for (const [kx, kz, kw, kd] of [[(FX + 13) / 2, -13, 13.3 - FX, .3], [(FX + 13) / 2, 13, 13.3 - FX, .3], [FX, 0, .3, 26.3], [13, 0, .3, 26.3]]) box(kw, .16, kd, jcM.ashDk(), kx, P - .1, kz, g).userData.nocol = 1;   // a dressed kerb round the edge
  // steps up from the avenue (front, -x), centred
  for (let k = 0; k < 4; k++) jcWorldUV(box(.45, P * (k + 1) / 5, 7, flag, FX - .2 - (3 - k) * .45 - .2, 0, 0, g));
  // the back steps (owner 2026-11-12): a smaller flight of the same kind off the courtyard's right-hand (+z) edge, beyond the porch, where you leave
  for (let k = 0; k < 3; k++) jcWorldUV(box(4, P * (k + 1) / 4, .45, flag, 7, 0, 13 + .2 + (2 - k) * .45 + .225, g));
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
  W(X0, Z1, 1.7, Z1); W(3.1, Z1, X1, Z1, false);                         // right wall onto the portico, side door at x 2.4
  W(X0, Z0, 3.8, Z0, false); W(8.2, Z0, X1, Z0, false);                  // hall / storeroom wall, a wide inner doorway (x 3.8..8.2) so the scrolls are seen from the hall
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
    B(hx0 + d, hz1 - d, 1.6, hz1); B(3.2, hz1 - d, hx1 - d, hz1);                     // right (side door gap)
    B(hx0 + d, hz0, 3.7, hz0 + d); B(8.3, hz0, hx1 - d, hz0 + d);                     // left (storeroom door gap)
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
  for (const [lx, lz, r] of [[2.6, -1.0, 0], [2.6, 1.5, 0]]) { const L = new THREE.Group(); L.position.set(lx, F, lz); L.rotation.y = r; g.add(L);
    box(.5, .08, .5, jcM.beam(), 0, 0, 0, L); box(.12, 1.05, .12, jcM.beam(), 0, .08, 0, L); const t = box(.9, .07, .62, jcM.beam(), 0, 1.15, 0, L); t.rotation.z = -.28;
    const sc = box(.72, .02, .5, jcM.parch(), 0, 1.21, 0, L); sc.rotation.z = -.28; for (const e of [-1, 1]) { const rl = cyl(.05, .05, .58, 8, jcM.beam(), e * .36, 1.18 - e * .1, -.29, L); rl.rotation.x = Math.PI / 2; } }
  // the scroll storeroom: tall scrolls on wooden rollers standing upright along the back, and a lidded chest
  for (let k = 0; k < 7; k++) { const sx = 2.4 + k * .55, sz = SZ0 + .75; cyl(.13, .13, .9, 10, jcM.parch(), sx, F + .12, sz, g); for (const e of [-1, 1]) { cyl(.035, .035, 1.2, 6, jcM.beam(), sx + e * .12, F, sz, g); add(new THREE.SphereGeometry(.06, 6, 4), jcM.beam(), sx + e * .12, F + 1.22, sz, g); } }
  box(4.2, .1, .6, jcM.beam(), 4.05, F, SZ0 + .75, g);
  box(1.4, .7, .8, jcM.beam(), 8.2, F, SZ0 + 1, g); box(1.5, .14, .9, mat('jcLid', '#5e3d22'), 8.2, F + .7, SZ0 + 1, g); box(1.42, .06, .1, jcM.gold(), 8.2, F + .45, SZ0 + 1.42, g);
  box(X1 - X0 - .6, .12, 4 - .6, mat('jcDeck', '#8a6440'), (X0 + X1) / 2, F + WH - .04, (SZ0 + Z0) / 2, g).userData.nocol = 1;
  // the covered portico along the right wing: columns, a roof, and the elders' bench on the inner wall
  const PZ = Z1 + 3.5;
  for (let k = 0; k < 5; k++) jcDoric(g, X0 + .4 + (X1 - X0 - .8) * k / 4, F, PZ - .4, 3.6, .25);
  box(X1 - X0 + .6, .45, .6, jcM.ash(), (X0 + X1) / 2, F + 3.6, PZ - .4, g).userData.nocol = 1;
  for (let k = 0; k <= 6; k++) box(.18, .22, 3.8, jcM.beam(), X0 + .2 + (X1 - X0 - .4) * k / 6, F + 3.85, Z1 + 1.8, g).userData.nocol = 1;
  box(X1 - X0 + .8, .3, 4.1, jcM.roof(), (X0 + X1) / 2, F + 4.05, Z1 + 1.8, g).userData.nocol = 1;
  for (const [b0, b1] of [[X0 + .5, 1.6], [3.2, X1 - .5]]) { box(b1 - b0, .45, .55, jcM.ash(), (b0 + b1) / 2, F, Z1 + .62, g); box(b1 - b0, .1, .62, jcM.ashDk(), (b0 + b1) / 2, F + .45, Z1 + .62, g); }   // the elders' bench, open at the side door
  jcRahabWindow(g, 5.9, P, 10.1);   // (owner 2026-11-18: make the scarlet cord read clearly) a stretch of house wall with a window, the scarlet cord let down from it (James 2:25, Joshua 2:15-21)
  for (const [px, pz] of [[X0 - .1, Z1 + 1.8]]) box(.6, .5, 3.6, flag, px, P, pz, g);   // a step at the portico's open front end
  // walking: platform, steps (half height), floors
  const raised = [[z, 13, x + (FX + 13) / 2, (13 - FX) / 2, y0 + P], [z + 13.9, .75, x + 7, 2, y0 + P * .5], [z, 3.5, x + FX - .9, .9, y0 + P * .5], [z + (SZ0 + Z1) / 2, (Z1 - SZ0) / 2 + .3, x + (X0 + X1) / 2, (X1 - X0) / 2 + .3, y0 + F], [z + Z1 + 2.1, 1.8, x + (X0 + X1) / 2, (X1 - X0) / 2 + .3, y0 + F]];
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
  jcWorldUV(box(17, .08, 6, flag, 0, 0, -5.6, g)); box(2.6, .3, 1.6, jcM.ash(), -6.4, 0, -6.6, g); box(2.2, .1, 1.2, mat('jcPoolWater', '#5ab0c0', { roughness: .1, emissive: '#1a4a54', emissiveIntensity: .5 }), -6.4, .24, -6.6, g).userData.nocol = 1;
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
  for (const [sx, sz, r] of [[4.0, -1.9, .58], [5.3, -7.7, .75], [7.1, -7.7, .75]]) { cyl(r, r + .05, 1.3, 12, jcPlasterMat('#d8c4a0'), sx, 0, sz, g); const d = add(new THREE.SphereGeometry(r + .01, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), jcPlasterMat('#c8b08a'), sx, 1.3, sz, g); d.scale.y = .8; box(.36, .36, .06, 'dark', sx - .2, .9, sz - r, g).userData.nocol = 1; }   // domed grain bins (the granary's store)
  return g;
}

// ---- a stretch of plastered house wall with a window, and a scarlet cord let down from the window to the ground (Rahab, Joshua 2:15-21; James 2:25) ----
// In group g's frame, centred on (x, z) on the floor y, the window's face towards -z. 1.8 m wide, 2.7 m high; the window sill is 1.3 m up. Returns the sill's height.
function jcRahabWindow(g, x, y, z) {
  const red = mat('jcScarlet', '#c4161c'), W = 1.8, H = 2.7, T = .38, w0 = 1.3, w1 = 2.05, ww = .7, f = new THREE.Group(); f.position.set(x, y, z); g.add(f);
  box(W, w0, T, jcM.plaster(), 0, 0, 0, f); box(W, H - w1, T, jcM.plaster(), 0, w1, 0, f);                       // below and above the window
  for (const s of [-1, 1]) box((W - ww) / 2, w1 - w0, T, jcM.plaster(), s * (ww / 2 + (W - ww) / 4), w0, 0, f);     // either side of it
  box(W + .02, .5, T + .04, jcM.red(), 0, .05, 0, f).userData.nocol = 1;                                           // red dado band
  box(ww + .3, .12, T + .16, jcM.ash(), 0, w0 - .1, -.04, f); box(ww + .3, .14, T + .1, jcM.ash(), 0, w1, 0, f); // dressed sill and lintel
  for (const s of [-1, 1]) box(.12, w1 - w0, T + .08, jcM.ash(), s * (ww / 2 + .06), w0, 0, f);
  box(ww, w1 - w0, .04, mat('jcShutterDk', '#2a1a10'), 0, w0, T / 2 - .02, f).userData.nocol = 1;                  // the dark room beyond
  const sh = box(.36, w1 - w0 - .06, .05, mat('jcShutter', '#6a4426'), -ww / 2 - .2, w0 + .03, -T / 2 - .18, f); sh.rotation.y = .9; sh.userData.nocol = 1;   // a shutter swung open
  box(W + .2, .18, T + .3, jcM.ash(), 0, H, 0, f).userData.nocol = 1;                                              // coping
  // the cord: knotted round a peg in the sill, hanging down the wall in a gentle curve, a coil on the ground
  cyl(.04, .04, .22, 6, jcM.beam(), .18, w0 + .02, -T / 2 - .12, f).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(.07, .028, 6, 10), red, .18, w0 + .06, -T / 2 - .14, f).userData.nocol = 1;
  const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push(new THREE.Vector3(.18 + Math.sin(t * 3) * .05, w0 - t * (w0 - .05), -T / 2 - .16 - Math.sin(t * Math.PI) * .08)); }
  const cord = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .032, 6, false), red, 0, 0, 0, f); cord.userData.nocol = 1;
  const coil = add(new THREE.TorusGeometry(.16, .032, 6, 14), red, .3, .03, -T / 2 - .32, f); coil.rotation.x = Math.PI / 2; coil.userData.nocol = 1;
  return y + w0;
}

// ---- the craftsmen's street (James 4): shop units, a colonnade, and the smith's furnishings ----
// One shop unit in world coordinates: x from xa to xb, its front (onto the portico) at zf and its back at zb. o.open: an open front (a room shop) with only a beam
// across it; otherwise a front wall with a doorway. o.left / o.right: build that party wall (neighbours share one). o.col: wall colour. Flat roof at 3.4 m.
function jcShopUnit(xa, xb, zf, zb, o = {}) {
  const cx = (xa + xb) / 2, cz = (zf + zb) / 2, y = heightAt(cx, cz), g = new THREE.Group(); g.position.set(0, y, 0); scene.add(g); g.updateMatrixWorld(true);
  const H = 3.4, wm = jcPlasterMat(o.col || '#e2cfaa', o.open ? .42 : 0), s = Math.sign(zb - zf), U = m => jcWorldUV(m, .5);
  jcWorldUV(box(Math.abs(xb - xa), .1, Math.abs(zb - zf), jcFlagMat(), cx, 0, cz, g));
  if (o.left !== false) U(jcWall(g, xa, zf, xa, zb, 0, H, .3, wm)); if (o.right !== false) U(jcWall(g, xb, zf, xb, zb, 0, H, .3, wm));
  U(jcWall(g, xa, zb, xb, zb, 0, H, .3, wm));
  if (o.open) for (const [a0, a1] of [[xa + .15, xb - .15]]) { const d = box(a1 - a0, .9, .04, jcPlasterMat('#c06a48', .3), (a0 + a1) / 2, .05, zb - s * .17, g); d.userData.nocol = 1; }   // a painted dado inside
  if (o.open) { const b = box(Math.abs(xb - xa), .5, .35, jcM.beam(), cx, H - .5, zf, g); b.userData.nocol = 1; }
  else { const d = o.door ?? cx; U(jcWall(g, xa, zf, d - .65, zf, 0, H, .3, wm)); U(jcWall(g, d + .65, zf, xb, zf, 0, H, .3, wm)); const l = box(1.3, H - 2.3, .3, wm, d, 2.3, zf, g); l.userData.nocol = 1;
    box(1.2, 2.25, .05, 'dark', d, 0, zf + s * .1, g).userData.nocol = 1; }
  box(Math.abs(xb - xa) + .2, .25, Math.abs(zb - zf) + .2, mat('neRoof', '#d2b48a'), cx, H, cz, g).userData.nocol = 1;
  if (o.open) { const c = box(Math.abs(xb - xa) - .3, .04, Math.abs(zb - zf) - .3, jcPlasterMat('#f2e8d4', .55), cx, H - .05, cz, g); c.userData.nocol = 1; }
  if (o.open) for (const lx of [Math.min(xa, xb) + .17, Math.max(xa, xb) - .17]) { const l = jcWorldUV(box(.04, H - .1, Math.abs(zb - zf) - .32, wm, lx, 0, cz, g), .5); l.userData.nocol = 1; }   // the shop's own plaster lining on both side walls (a neighbour's wall may be another colour)   // a light lime-washed ceiling inside an open shop
  return g;
}
// ---- objects made for the craftsmen's street after the first blind-critic round (2026-11-18): each reads clearly from its outline ----
function jcLamp(g, x, y, z, I = 6, d = 7, col = '#ffb070') { const l = new THREE.PointLight(col, I, d, 1.4); l.position.set(x, y, z); g.add(l); return l; }   // pooled by the engine (finish.js light pool)
// light wood with a painted grain (box UVs: lines run across each face)
let jcGrainT = null;
function jcGrain() { if (jcGrainT) return jcGrainT; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 26; i++) { const yy = i * 5 + jcRand() * 3; x.strokeStyle = `rgba(90,55,25,${.18 + jcRand() * .25})`; x.lineWidth = 1 + jcRand() * 1.5; x.beginPath(); x.moveTo(0, yy); for (let k = 1; k <= 8; k++) x.lineTo(k * 16, yy + Math.sin(k + i) * 2); x.stroke(); }
  for (let i = 0; i < 4; i++) { x.strokeStyle = 'rgba(80,45,20,.35)'; x.beginPath(); x.ellipse(jcRand() * 128, jcRand() * 128, 6, 3, 0, 0, 7); x.stroke(); }
  jcGrainT = new THREE.CanvasTexture(c); jcGrainT.colorSpace = THREE.SRGBColorSpace; return jcGrainT; }
const jcWoodLt = () => mat('jcWoodLtG', '#c09060', { map: jcGrain(), emissive: '#3a2410', emissiveIntensity: .3 });
const jcBronzeM = () => mat('jcBronze', '#b8873a', { metalness: .5, roughness: .35, emissive: '#3a2410', emissiveIntensity: .4 });
const jcFlameM = () => mat('jcFlame', '#ff6a1a', { emissive: '#ff4a0a', emissiveIntensity: 1.4, transparent: true, opacity: .9 });
function jcTongues(g, x, y, z, s = 1) { for (const [fx, fz, h] of [[0, 0, .55], [.14, .08, .4], [-.13, -.05, .42], [.05, -.12, .35]]) { const c = add(new THREE.ConeGeometry(.09 * s, h * s, 6), jcFlameM(), x + fx * s, y + h * s / 2, z + fz * s, g); c.userData.dyn = 1; } }
const jcGlowM = () => mat('jcGlow', '#ffb35a', { emissive: '#ff7a1a', emissiveIntensity: 1.6 });
// a soft warm pool of light on the floor (firelight without a real light): additive radial gradient
let jcPoolT = null;
function jcLightPool(g, x, y, z, r = 1.6, a = .5) { if (!jcPoolT) { const c = document.createElement('canvas'); c.width = c.height = 128; const k = c.getContext('2d'); const gr = k.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,170,80,1)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); k.fillStyle = gr; k.fillRect(0, 0, 128, 128); jcPoolT = new THREE.CanvasTexture(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: jcPoolT, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + .03, z); m.userData.dyn = 1; g.add(m); return m; }
function jcWhiteCloth(g, x, y, z) {   // a low bench with rolled bolts of bright white linen, stacked 3 then 2, and one bolt unrolled down the front
  box(1.1, .3, .65, jcWoodLt(), x, y, z, g); const w = mat('jcLinenRoll2', '#ffffff', { map: jcWeave(), emissive: '#c8c0b0', emissiveIntensity: .7 }), end = mat('jcLinenEnd', '#e8e0cc', { emissive: '#5a5448', emissiveIntensity: .4 }), r = .14;
  [[3, 0], [2, 1]].forEach(([n, row]) => { for (let k = 0; k < n; k++) { const bx = x + (k - (n - 1) / 2) * r * 2.1, by = y + .3 + r + row * r * 1.75; const c = cyl(r, r, .6, 14, w, bx, by - .3, z, g); c.rotation.x = Math.PI / 2; c.position.set(bx, by, z);
    for (const e of [-1, 1]) { const d = add(new THREE.TorusGeometry(r * .55, .012, 4, 12), end, bx, by, z + e * .301, g); d.userData.nocol = 1; } } });
  return y + .3 + r * 2 + r * 1.75 + .05; }
let jcWeaveT = null;
function jcWeave() { if (jcWeaveT) return jcWeaveT; const c = document.createElement('canvas'); c.width = c.height = 64; const k = c.getContext('2d'); k.fillStyle = '#fff'; k.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 64; i += 4) { k.fillStyle = 'rgba(150,140,120,.18)'; k.fillRect(i, 0, 1, 64); k.fillRect(0, i + 2, 64, 1); } jcWeaveT = new THREE.CanvasTexture(c); jcWeaveT.colorSpace = THREE.SRGBColorSpace; jcWeaveT.wrapS = jcWeaveT.wrapT = THREE.RepeatWrapping; jcWeaveT.repeat.set(3, 3); return jcWeaveT; }
function jcLedgerDesk(g, x, y, z) {   // a writing table at desk height with an open ledger, an inkpot and a stylus
  const wood = jcWoodLt(); box(1.2, .06, .7, wood, x, y + .72, z, g); for (const [a, b] of [[-.52, -.28], [.52, -.28], [-.52, .28], [.52, .28]]) box(.06, .72, .06, wood, x + a, y, z + b, g);
  for (const s2 of [-1, 1]) { const pg = box(.42, .03, .56, mat('jcPage', '#fbf3dc', { emissive: '#5a5240', emissiveIntensity: .5 }), x + s2 * .22, y + .78, z, g); pg.rotation.z = -s2 * .08; }
  for (const s2 of [-1, 1]) for (let k = 0; k < 7; k++) box(.32, .006, .012, mat('jcInk', '#2a2420'), x + s2 * .22, y + .805, z - .22 + k * .07, g);
  cyl(.05, .06, .1, 8, mat('jcInkpot', '#2a3a5a'), x + .48, y + .78, z - .2, g); const st = box(.01, .01, .3, mat('jcStylus', '#c8b48a'), x + .45, y + .82, z + .05, g); st.rotation.y = .5;
  return y + .85; }
function jcIncenseStand(g, x, y, z) {   // a bronze bowl of glowing coals on a tall stand, with a thin wisp of smoke rising from it
  const b = mat('jcBronzeBright', '#d8a048'); cyl(.2, .25, .08, 10, b, x, y, z, g); cyl(.05, .07, .59, 8, b, x, y + .08, z, g); cyl(.14, .1, .1, 8, b, x, y + .65, z, g);
  const bowl = add(new THREE.SphereGeometry(.24, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), b, x, y + .98, z, g); bowl.material = b;
  const coal = cyl(.2, .2, .04, 10, jcGlowM(), x, y + .92, z, g); jcLamp(g, x, y + 1.1, z, 2.5, 3, '#ff9a4a');
  const lid = add(new THREE.SphereGeometry(.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), b, x, y + .98, z, g); lid.material = b; lid.scale.y = .7; for (let k = 0; k < 8; k++) add(new THREE.SphereGeometry(.03, 4, 3), jcGlowM(), x + Math.cos(k * .8) * .17, y + 1.03, z + Math.sin(k * .8) * .17, g);   // a pierced lid with embers showing
  for (let k = 0; k < 8; k++) { const sm = new THREE.MeshBasicMaterial({ color: '#f4eee6', transparent: true, opacity: .45 - k * .045, depthWrite: false }); const p = add(new THREE.SphereGeometry(.05 + k * .014, 8, 6), sm, x + Math.sin(k * .9) * (.03 + k * .01), y + 1.12 + k * .11, z + Math.cos(k * .9) * .03, g); p.userData.dyn = 1; p.userData.nocol = 1; }
  jcLightPool(g, x, y, z, 1.0, .35); return y + 1.0; }
function jcCoinChest(g, x, y, z) {   // a banded wooden chest with its lid thrown back, heaped with gold coins, a few spilled on the floor
  const wood = mat('jcChestWood', '#b07a46', { emissive: '#3a2410', emissiveIntensity: .35 }), gold = mat('jcCoin', '#ffd25a', { metalness: .4, roughness: .25, emissive: '#a8740c', emissiveIntensity: .9 });
  box(1.0, .55, .6, wood, x, y, z, g); for (const s2 of [-1, 1]) box(.05, .57, .62, mat('jcIron', '#6e737c'), x + s2 * .35, y, z, g);
  const lid = box(1.0, .08, .6, wood, x, y + .55, z - .3, g); lid.geometry.translate(0, 0, -.3); lid.position.z = z - .3; lid.rotation.x = -1.9;
  const heap = add(new THREE.SphereGeometry(.45, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), gold, x, y + .52, z, g); heap.scale.set(1.1, .7, .7); for (let k = 0; k < 10; k++) { const c = cyl(.05, .05, .015, 10, gold, x - .4 + (k % 5) * .2, y + .55, z + .32 + Math.floor(k / 5) * .04, g); c.rotation.x = 1.2; }
  for (let k = 0; k < 7; k++) { const c = cyl(.05, .05, .015, 10, gold, x - .5 + (k % 4) * .2 + (k > 3 ? .1 : 0), y, z + .42 + (k > 3 ? .12 : 0), g); c.rotation.x = .1 * k; }
  jcLightPool(g, x, y, z, .9, .35); return y + .75; }
function jcKickWheel(g, x, y, z) {   // a potter's kick wheel: a low flywheel, a shaft, a flat wheel-head with a pot taking shape, and the potter's stool
  const wood = jcWoodLt(), clay = mat('wetclay', '#9a5a3a');
  cyl(.45, .45, .14, 18, wood, x, y + .02, z, g); cyl(.4, .4, .02, 18, mat('jcSpoke', '#8a6440'), x, y + .165, z, g);   // the heavy kick wheel
  cyl(.08, .08, .4, 8, jcWoodLt(), x, y + .16, z, g); cyl(.34, .34, .06, 20, jcWoodLt(), x, y + .56, z, g); cyl(.35, .35, .012, 20, mat('jcSlip', '#b07a54'), x, y + .62, z, g);   // the shaft and the wheel head
  const wet = mat('jcWetClay', '#d0946a', { roughness: .3, emissive: '#4a2410', emissiveIntensity: .3 }); const pot = add(new THREE.LatheGeometry([0, .12, .17, .19, .15, .12, .13].map((r, k) => new THREE.Vector2(r, k * .05)), 14), wet, x, y + .64, z, g); pot.material = wet;
  return y + .95; }
function jcDomedKiln(g, x, y, z) {   // a domed kiln with a glowing arched mouth and a short chimney, firelight on the floor
  const clay = jcPlasterMat('#c98a5e', .15), dk = jcPlasterMat('#8a5a3a');
  const d = add(new THREE.SphereGeometry(.8, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), clay, x, y + .25, z, g); d.scale.y = 1.2; cyl(.82, .86, .25, 14, dk, x, y, z, g);
  const mouth = new THREE.Shape(); mouth.moveTo(-.22, 0); mouth.lineTo(-.22, .22); mouth.absarc(0, .22, .22, Math.PI, 0, true); mouth.lineTo(.22, 0); mouth.lineTo(-.22, 0);
  const m = add(new THREE.ShapeGeometry(mouth), jcGlowM(), x, y + .05, z + .79, g); m.userData.nocol = 1;
  const rim = add(new THREE.TorusGeometry(.25, .05, 6, 12, Math.PI), dk, x, y + .27, z + .8, g); rim.userData.nocol = 1;
  cyl(.14, .17, .6, 8, dk, x + .25, y + .95, z - .25, g); flame(g, x, y + .1, z + .7, 1.4);
  jcLightPool(g, x, y, z + 1.0, 1.6, .55); jcLamp(g, x, y + .6, z + 1.2, 8, 6, '#ff9a4a'); return y + 1.25; }
function jcBowlStack(g, x, y, z) {   // a bench with stacks of light terracotta bowls
  box(1.1, .45, .5, jcWoodLt(), x, y, z, g); const lt = mat('jcClayLt', '#d89a68');
  for (const [bx, n] of [[-.3, 5], [.05, 4], [.35, 3]]) for (let k = 0; k < n; k++) { const b = add(new THREE.SphereGeometry(.16, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lt, bx, y + .45 + .2 + k * .07, z, g); b.rotation.x = Math.PI; b.material = lt; }
  return y + .45 + .2 + 5 * .07; }
function jcQuenchTrough(g, x, y, z) {   // a stone quenching trough brimming with bright water, a pair of tongs resting across it
  const st = jcPlasterMat('#b8a488'); box(1.3, .4, .6, st, x, y, z, g); for (const [rx, rz, rw, rd] of [[0, .27, 1.3, .08], [0, -.27, 1.3, .08], [.61, 0, .08, .6], [-.61, 0, .08, .6]]) box(rw, .22, rd, st, x + rx, y + .4, z + rz, g);
  box(1.14, .03, .46, mat('jcWaterBright', '#7ad8e8', { roughness: .05, emissive: '#3a8a94', emissiveIntensity: .8 }), x, y + .57, z, g); box(.7, .005, .06, mat('jcGlint', '#e8fbff', { emissive: '#a8e8f0', emissiveIntensity: .8 }), x - .1, y + .6, z - .08, g).userData.nocol = 1;
  for (const d of [-.03, .03]) box(.035, .03, .72, mat('jcIron', '#8e949e'), x + .42 + d, y + .62, z, g); return y + .6; }
function jcWashtub(g, x, y, z) {   // a big wooden washtub of soapy water with a paddle
  const w = jcWoodLt(); cyl(.85, .75, .6, 14, w, x, y, z, g); for (const yy of [.12, .46]) cyl(.87, .87, .05, 14, mat('jcIron', '#8e949e'), x, y + yy, z, g);
  cyl(.8, .8, .03, 14, mat('jcSuds', '#eef4f2', { emissive: '#4a5250', emissiveIntensity: .6 }), x, y + .55, z, g);
  for (let k = 0; k < 7; k++) add(new THREE.SphereGeometry(.1, 6, 4), mat('jcSuds', '#eef4f2'), x - .45 + k * .15, y + .58, z + (k % 2 ? .18 : -.15), g);
  const p = box(.06, 1.1, .12, w, x + .3, y + .3, z - .1, g); p.rotation.z = .5; return y + .6; }
function jcBucket(g0, x0, y0, z0) {   // a big light-wood bucket of water with a rope handle
  const g = new THREE.Group(); g.position.set(x0, y0, z0); g.scale.setScalar(1.3); g0.add(g); const x = 0, y = 0, z = 0; jcLightPool(g0, x0, y0, z0, .9, .25);
  const w = jcWoodLt(); cyl(.34, .28, .55, 12, w, x, y, z, g); for (const yy of [.1, .42]) cyl(.35, .35, .04, 12, mat('jcIron', '#8e949e'), x, y + yy, z, g);
  cyl(.31, .31, .02, 12, mat('jcWaterBright', '#6ac8d8'), x, y + .5, z, g); const h = add(new THREE.TorusGeometry(.3, .02, 5, 14, Math.PI), mat('jcRope', '#c8b48a'), x, y + .55, z, g); h.userData.nocol = 1; return y0 + 1.1; }
function jcDyeVat(g, x, y, z) {   // a wide, low stone dye vat, open, brimming with glossy crimson dye; a paddle dipping in, red stains down the side
  const st = jcPlasterMat('#c4b294'); cyl(.6, .62, .55, 14, st, x, y, z, g); const rim = add(new THREE.TorusGeometry(.6, .05, 6, 18), jcPlasterMat('#d0bc9c'), x, y + .57, z, g); rim.rotation.x = Math.PI / 2;
  cyl(.56, .56, .02, 14, mat('jcDye', '#d82a3a', { roughness: .05, metalness: .2, emissive: '#7a0a18', emissiveIntensity: .8 }), x, y + .58, z, g);
  const pd = new THREE.Group(); pd.position.set(x + .2, y + .58, z + .05); pd.rotation.z = -.2; g.add(pd); box(.05, .6, .05, jcWoodLt(), 0, -.1, 0, pd); box(.16, .22, .03, jcWoodLt(), 0, -.12, 0, pd);
  return y + .7; }
function jcJarRack(g, x, y, z) {   // a big two-tier rack of shipping amphorae packed in straw
  const w = jcWoodLt(); for (const s2 of [-1, 1]) box(.08, 1.4, .5, w, x + s2 * .8, y, z, g); for (const yy of [.05, .7]) box(1.7, .06, .5, w, x, y + yy, z, g);
  box(1.6, .1, .44, mat('jcStraw', '#d8c078'), x, y + .76, z, g);
  for (const [yy, n] of [[.11, 4], [.82, 4]]) for (let k = 0; k < n; k++) { const ax = x - .6 + k * .4, c = k % 2 ? mat('jcClayLt', '#d89a68') : mat('jcClay', '#b0623e');
    const a = add(new THREE.LatheGeometry([0, .1, .15, .16, .13, .06, .05, .07].map((r, j) => new THREE.Vector2(r, j * .075)), 10), c, ax, y + yy, z, g); a.material = c; }
  return y + 1.4; }
function jcJarPyramid(g, x, y, z) {   // six jars stacked 3-2-1, each resting on the two below, in terracotta, ochre and black glaze
  const cs = [mat('jcClay', '#b0623e'), mat('jcOchreJar', '#d8a048'), mat('jcCreamJar', '#ead6b2', { roughness: .5, emissive: '#4a3a24', emissiveIntensity: .3 })], r = .15; box(1.05, .06, .4, jcWoodLt(), x, y, z, g);
  [[3, 0], [2, 1], [1, 2]].forEach(([n, row]) => { for (let k = 0; k < n; k++) { const jx = x + (k - (n - 1) / 2) * r * 2.05, jy = y + .06 + r + row * r * 1.75, c = cs[(k + row * 2) % 3];
    add(new THREE.SphereGeometry(r, 10, 7), c, jx, jy, z, g); cyl(.05, .07, .08, 8, c, jx, jy + r * .85, z, g); } });
  return y + .06 + r * 2 + 2 * r * 1.75 + .1; }
function jcTripodBrazier(g0, x0, y0, z0) {   // a bronze tripod holding a heaped bowl of glowing coals
  const g = new THREE.Group(); g.position.set(x0, y0, z0); g.scale.setScalar(1.12); g0.add(g); const x = 0, y = 0, z = 0;
  for (let k = 0; k < 12; k++) { const e = add(new THREE.DodecahedronGeometry(.07 + (k % 3) * .02, 0), k % 3 ? jcGlowM() : mat('jcCoalDk', '#3a2a22'), Math.cos(k * 2.1) * (.08 + (k % 4) * .06), .9 + (k % 3) * .04, Math.sin(k * 2.1) * (.08 + (k % 4) * .06), g); e.rotation.set(k, k * 2, 0); }
  const b = mat('jcBronzeBright', '#d8a048', { metalness: .4, roughness: .3, emissive: '#6a4010', emissiveIntensity: .6 }); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + Math.PI / 2, l = box(.08, .78, .08, b, x + Math.cos(a) * .34, y, z + Math.sin(a) * .34, g); l.rotation.z = Math.cos(a) * .3; l.rotation.x = -Math.sin(a) * .3; add(new THREE.SphereGeometry(.06, 6, 4), b, x + Math.cos(a) * .36, y + .03, z + Math.sin(a) * .36, g); }
  const bowl = add(new THREE.SphereGeometry(.45, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), b, x, y + .85, z, g); bowl.material = b; const cm = add(new THREE.SphereGeometry(.4, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat('jcEmber', '#ff5a1a', { emissive: '#ff3a0a', emissiveIntensity: 1.5 }), x, y + .78, z, g); cm.scale.y = .45;
  jcTongues(g, x, y + .82, z, 1); jcLightPool(g, x, y, z, 1.1, .3); jcLamp(g, x, y + 1.3, z, 3, 4, '#ff8a3a'); return y0 + 1.15; }

// speckled lime plaster (world-mapped), one material per colour; glow > 0 adds a faint warm emissive for shop interiors (lamplight, no real light)
let jcPlT = null; const jcPlM = {};
function jcPlasterMat(col, glow = 0) { const k = col + '|' + glow; if (jcPlM[k]) return jcPlM[k];
  if (!jcPlT) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 60; i++) { const v = 185 + jcRand() * 70 | 0; x.fillStyle = `rgba(${v},${v * .95 | 0},${v * .86 | 0},.4)`; x.beginPath(); x.ellipse(jcRand() * 256, jcRand() * 256, 20 + jcRand() * 50, 12 + jcRand() * 30, jcRand() * 3, 0, 7); x.fill(); }
    for (let i = 0; i < 3000; i++) { const v = 150 + jcRand() * 80 | 0; x.fillStyle = `rgba(${v},${v * .92 | 0},${v * .82 | 0},${.1 + jcRand() * .25})`; x.fillRect(jcRand() * 256, jcRand() * 256, 1 + jcRand() * 2, 1 + jcRand() * 2); }
    for (let i = 0; i < 25; i++) { x.strokeStyle = `rgba(110,90,70,${.15 + jcRand() * .2})`; x.lineWidth = 1; x.beginPath(); let px = jcRand() * 256, py = jcRand() * 256; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (jcRand() - .5) * 30; py += jcRand() * 20; x.lineTo(px, py); } x.stroke(); }
    jcPlT = new THREE.CanvasTexture(c); jcPlT.colorSpace = THREE.SRGBColorSpace; jcPlT.wrapS = jcPlT.wrapT = THREE.RepeatWrapping; }
  return jcPlM[k] = new THREE.MeshStandardMaterial({ color: col, map: jcPlT, roughness: .95, emissive: glow ? new THREE.Color(col).multiplyScalar(.85) : 0x000000, emissiveIntensity: glow }); }
// a workbench against the back wall, behind the room's centre, laid with the trade's small things: it fills the room without touching any of the five spots
function jcWorkbench(g, x, z, kind) {
  const w = jcWoodLt(); box(1.8, .08, .55, w, x, .78, z, g); for (const sx of [-.8, .8]) box(.08, .78, .5, w, x + sx, 0, z, g); box(1.7, .06, .45, w, x, .2, z, g);
  const iron = mat('jcIron', '#8e949e'), top = .86;
  if (kind === 'smith') { for (let k = 0; k < 3; k++) { const h = box(.06, .06, .35, w, x - .6 + k * .3, top + .03, z, g); h.rotation.y = .2 * k; box(.16, .1, .08, iron, x - .6 + k * .3, top, z - .17, g); }
    for (let k = 0; k < 4; k++) box(.5, .05, .06, iron, x + .45, top + k * .05, z - .1 + k * .02, g); for (let k = 0; k < 3; k++) box(.2, .1, .12, mat('jcIngot', '#b87a4a', { metalness: .4 }), x + .5, .26 + k * .1, z, g); }
  else if (kind === 'fuller') { for (let k = 0; k < 4; k++) box(.55, .06, .4, mat(k % 2 ? 'jcLinen2' : 'jcLinen', k % 2 ? '#efe6d2' : '#fbf8f0'), x - .4, top + k * .06, z, g);
    const jg = add(new THREE.SphereGeometry(.14, 8, 6), mat('jcClayLt', '#d89a68'), x + .45, top + .14, z, g); jg.scale.y = 1.2; box(.3, .12, .2, mat('jcSoap', '#e8dcb0'), x + .1, top, z, g); }
  else if (kind === 'merchant') { for (let k = 0; k < 4; k++) { const sc = cyl(.05, .05, .42, 8, mat('papyrus', '#f2e6c4'), x - .5, top + .05 + (k % 2) * .09, z - .1 + Math.floor(k / 2) * .14, g); sc.rotation.z = Math.PI / 2; }
    const sb = box(.7, .03, .03, mat('jcBronze', '#b8873a'), x + .4, top + .45, z, g); box(.03, .45, .03, mat('jcBronze', '#b8873a'), x + .4, top, z, g); for (const e of [-1, 1]) cyl(.1, .06, .03, 10, mat('jcBronze', '#b8873a'), x + .4 + e * .3, top + .3, z, g);   // a balance
    for (let k = 0; k < 3; k++) cyl(.05, .05, .015, 10, mat('jcCoin', '#ffd25a'), x + .05 + k * .09, top, z + .1, g); }
  else if (kind === 'potter') { for (let k = 0; k < 5; k++) { const pt = add(new THREE.LatheGeometry([0, .07, .1, .09, .06, .07].map((r, j) => new THREE.Vector2(r, j * .05)), 8), k % 2 ? mat('wetclay', '#9a5a3a') : mat('jcClayLt', '#d89a68'), x - .6 + k * .3, top, z, g); }
    const cl = add(new THREE.DodecahedronGeometry(.18, 0), mat('wetclay', '#9a5a3a'), x + .2, .32, z, g); cl.scale.y = .7; }
}
// dressing for an open shop: a trade's clutter along its back and side walls, clear of the five spots (spots: centre cx,cz, +-2.4 across, +-1.6 deep).
// f = +1 when the shop runs from its front towards +z, -1 towards -z. kind: 'smith' | 'fuller' | 'merchant' | 'potter'
function jcDressShop(kind, cx, cz, f) {
  const y = heightAt(cx, cz) + .1, g = new THREE.Group(); g.position.set(cx, y, cz); if (f < 0) g.rotation.y = Math.PI; scene.add(g);   // local +z = towards the back wall
  const back = 2.55, iron = mat('jcIron', '#8e949e', { metalness: .45, roughness: .35, emissive: '#3a3630', emissiveIntensity: .7 }), clay = mat('jcClay', '#b0623e'), clayLt = mat('jcClayLt', '#c98a5a');
  const jar = (x, z, s = 1, m = clay) => { const j = add(new THREE.SphereGeometry(.22 * s, 10, 7), m, x, .22 * s * 1.25, z, g); j.scale.y = 1.25; cyl(.08 * s, .11 * s, .14 * s, 8, m, x, .5 * s, z, g); };
  const shelf = (x, n, m) => { for (const s2 of [-1, 1]) box(.06, 1.7, .32, jcM.beam(), x + s2 * .75, 0, back, g); for (const yy of [.4, .95, 1.5]) { box(1.56, .05, .34, jcM.beam(), x, yy, back, g);
      for (let k = 0; k < n; k++) { const j = add(new THREE.SphereGeometry(.11, 8, 6), k % 2 ? m : clayLt, x - .55 + k * (1.1 / (n - 1)), yy + .13, back, g); j.scale.y = 1.2; } } };
  if (kind === 'smith') {
    jcWorkbench(g, 0, back - .15, 'smith');
    box(1.1, .7, .04, jcWoodLt(), -1.7, 1.25, back + .05, g); for (let k = 0; k < 4; k++) { box(.03, .5, .03, iron, -2.1 + k * .26, 1.35, back, g); box(k % 2 ? .14 : .05, .08, .06, iron, -2.1 + k * .26, 1.32, back - .02, g); }   // tongs and hammers on the wall
    cyl(.22, .18, .4, 10, jcWoodLt(), 3.25, 0, .3, g); cyl(.2, .2, .02, 10, mat('jcWaterBright', '#6ac8d8'), 3.25, .38, .3, g); for (let k = 0; k < 3; k++) box(.36, .1, .14, mat('jcIngot', '#b87a4a', { metalness: .4 }), 3.25, k * .1, 1.0, g);   // a water bucket, iron bars
  } else if (kind === 'fuller') {
    jcWorkbench(g, 0, back - .15, 'fuller'); for (let k = 0; k < 3; k++) { const rl = cyl(.13, .13, .55, 12, mat('jcLinenRoll', '#ffffff'), -3.2, .13 + k * .02, .6 + k * .3, g); rl.rotation.x = Math.PI / 2; rl.position.set(-3.2, .13, .6 + k * .3); }   // rolled cloth
    jcLamp(g, 2.2, 2.2, 0, 5, 7, '#ffd0a0');   // stool, scrub board, a fill lamp over the tubs
  } else if (kind === 'merchant') {
    box(1.6, .02, 1.1, mat('rug#9a4a3a', '#9a4a3a'), 0, 0, -.2, g); box(1.4, .025, .9, mat('rugIn', '#d8b06a'), 0, 0, -.2, g); box(1.1, .03, .6, mat('rug#9a4a3a', '#9a4a3a'), 0, 0, -.2, g);   // a bordered rug
    for (const [sx, sz, s] of [[3.2, .2, 1], [3.3, .75, .85], [3.15, 1.25, .9]]) { const sk = add(new THREE.SphereGeometry(.3 * s, 8, 6), mat('jcSack', '#c8a878', { emissive: '#3a2a18', emissiveIntensity: .3 }), sx, .28 * s, sz, g); sk.scale.y = 1.15; }   // sacks of goods
    for (const [cy, cz2, w2] of [[0, 2.0, .6], [.45, 2.05, .5]]) box(w2, .45, .5, jcWoodLt(), -3.1, cy, cz2, g);   // crates
    box(1.2, .04, .25, jcWoodLt(), 1.7, 1.5, back, g); for (let k = 0; k < 4; k++) { const j = add(new THREE.SphereGeometry(.1, 8, 6), k % 2 ? clay : clayLt, 1.25 + k * .3, 1.64, back, g); j.scale.y = 1.3; }   // a wall shelf of small jars
    jcLamp(g, 0, 2.1, -1.2, 5, 7, '#ffd8b0');   // a fill lamp over the merchant

  } else if (kind === 'potter') {
    shelf(-2.9, 5, mat('jcClayBuff', '#d8b48a'));
    jar(-3.3, -.2, 1.0, mat('jcClayBuff', '#d8b48a')); 
    jcWorkbench(g, 0, back - .15, 'potter');
  }
  jcLightPool(g, 0, 0, .3, 3.2, .26);   // the lamp's warm pool on the floor
  // a clay lamp hanging from the beam, glowing
  jcLamp(g, 0, 2.4, 1.2, 10, 10, '#ffc890');
  box(.02, .6, .02, mat('jcRope', '#c8b48a'), 0, 2.75, 1.2, g); add(new THREE.SphereGeometry(.1, 8, 5), mat('jcGlow', '#ffb35a', { emissive: '#ff7a1a', emissiveIntensity: 1.6 }), 0, 2.7, 1.2, g);
  return g; }
// a colonnade along a street: columns at the given x positions on the line zc, an architrave, and a lean-to roof from the columns back to the shop fronts at zs
function jcColonnade(xs, zc, zs, x0, x1) {
  const cx = (x0 + x1) / 2, y = heightAt(cx, zc), g = new THREE.Group(); g.position.set(0, y, 0); scene.add(g);
  for (const x of xs) jcDoric(g, x, 0, zc, 3.1, .22);
  box(x1 - x0, .3, .45, jcM.ash(), cx, 3.1, zc, g).userData.nocol = 1;
  box(x1 - x0, .18, Math.abs(zs - zc) + .5, mat('neRoof', '#d2b48a'), cx, 3.35, (zc + zs) / 2, g).userData.nocol = 1;
  return g;
}
function jcAnvil(g, x, y, z) {   // a smith's anvil on a stump
  const iron = mat('jcIron', '#8e949e', { metalness: .45, roughness: .35, emissive: '#3a3630', emissiveIntensity: .7 });
  cyl(.3, .34, .5, 10, jcWoodLt(), x, y, z, g); box(.6, .14, .26, iron, x, y + .5, z, g); box(.36, .16, .2, iron, x, y + .64, z, g); box(.7, .12, .3, iron, x, y + .8, z, g);
  const horn = add(new THREE.ConeGeometry(.12, .4, 8), iron, x - .52, y + .86, z, g); horn.rotation.z = Math.PI / 2;
  box(.1, .06, .32, jcM.beam(), x + .15, y + .92, z + .05, g); box(.12, .1, .1, iron, x + .15, y + .92, z + .22, g);   // a hammer lying on it
  return y + .95; }
function jcForge(g, x, y, z) {   // a stone forge with glowing coals, flames and a hood
  const fs = jcPlasterMat('#a89478'), fsd = jcPlasterMat('#8a7860');
  box(1.3, .85, 1.0, fs, x, y, z, g); box(1.1, .06, .8, mat('ember', '#ff8a3a', { emissive: '#ff5a1a', emissiveIntensity: .9 }), x, y + .85, z, g);
  jcTongues(g, x, y + .88, z + .1, 1.4); flame(g, x, y + .9, z + .1, 1.6);
  add(new THREE.SphereGeometry(.2, 8, 6), mat('jcGlow', '#ffb35a', { emissive: '#ff7a1a', emissiveIntensity: 1.6 }), x, y + .95, z + .1, g).scale.y = .4;
  box(1.3, .5, .3, fsd, x, y + .85, z - .35, g); const hood = add(new THREE.CylinderGeometry(.25, .62, .9, 4), fs, x, y + 1.8, z - .25, g); hood.rotation.y = Math.PI / 4; box(.38, .6, .38, fsd, x, y + 2.25, z - .25, g); box(.78, .52, .04, mat('jcSoot', '#2a1c14'), x, y + .18, z + .505, g).userData.nocol = 1; const fm = add(new THREE.TorusGeometry(.3, .06, 6, 12, Math.PI), fsd, x, y + .5, z + .53, g); fm.userData.nocol = 1; box(.5, .26, .03, mat('jcFireDeep', '#ff8a2a', { emissive: '#ff4a0a', emissiveIntensity: 1.2 }), x, y + .2, z + .51, g).userData.nocol = 1; add(new THREE.CircleGeometry(.24, 12, 0, Math.PI), mat('jcFireDeep', '#ff8a2a', { emissive: '#ff4a0a', emissiveIntensity: 1.2 }), x, y + .46, z + .515, g).userData.nocol = 1; for (let k = 0; k < 6; k++) add(new THREE.DodecahedronGeometry(.06, 0), jcGlowM(), x - .18 + k * .07, y + .24 + (k % 2) * .04, z + .53, g).userData.nocol = 1;   // back, hood and flue behind the fire   // back, hood and flue
  box(.5, .4, .4, mat('jcBellows', '#6a4426'), x + .9, y + .5, z, g);
  jcLightPool(g, x, y, z + .9, 1.5, .4); jcLamp(g, x, y + 1.3, z + .6, 7, 6, '#ff8a3a');
  return y + 1.0; }
function jcBladeRack(g, x, y, z) {   // a wooden rack of new sword blades
  const steel = mat('jcSteel', '#dfe4ea', { metalness: .5, roughness: .25, emissive: '#5a5e66', emissiveIntensity: .6 });
  for (const s of [-1, 1]) box(.08, 1.3, .08, jcM.beam(), x + s * .55, y, z, g); box(1.2, .08, .1, jcM.beam(), x, y + 1.2, z, g); box(1.2, .08, .25, jcM.beam(), x, y + .1, z, g);
  for (let k = 0; k < 5; k++) { const bx = x - .44 + k * .22, bl = new THREE.Group(); bl.position.set(bx, y + .15, z + .12); bl.rotation.z = (k - 2) * .06; bl.rotation.x = -.18; g.add(bl);   // blades leaning out of the rack, points down
    box(.09, 1.05, .025, steel, 0, 0, 0, bl); add(new THREE.ConeGeometry(.045, .14, 4), steel, 0, -.06, 0, bl).rotation.x = Math.PI;
    box(.26, .05, .07, mat('jcBronze', '#b8873a', { metalness: .5, roughness: .35 }), 0, 1.05, 0, bl); box(.05, .2, .05, mat('leather', '#7a4a2a'), 0, 1.1, 0, bl); add(new THREE.SphereGeometry(.04, 6, 4), mat('jcBronze', '#b8873a'), 0, 1.33, 0, bl); }
  return y + 1.3; }

// ---- the farm and vineyard (James 5) ----
// a rock-cut winepress: a treading floor cut into a low outcrop, a channel, and a lower collecting vat stained with juice (Isaiah 5:2). Centred on the treading floor; the vat lies to -z.
function jcWinepress(g, x, y, z) {
  const rock = mat('jcRock', '#b8a07a'), rockDk = mat('jcRockDk', '#8f7a5a'), juice = mat('juice', '#6a1a2a', { roughness: .3 });
  const f = new THREE.Group(); f.position.set(x, y, z); g.add(f);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, r = add(new THREE.DodecahedronGeometry(.55, 0), k % 2 ? rock : rockDk, Math.cos(a) * 1.25, .12, Math.sin(a) * 1.25, f); r.scale.set(1, .55, 1); }   // the outcrop round it
  for (const [bx, bz, bw, bd] of [[0, 1.05, 2.3, .2], [0, -1.05, 2.3, .2], [1.05, 0, .2, 1.9], [-1.05, 0, .2, 1.9]]) box(bw, .5, bd, rock, bx, 0, bz, f);   // the floor's rim
  box(1.9, .3, 1.9, rockDk, 0, 0, 0, f); box(1.8, .03, 1.8, juice, 0, .3, 0, f).userData.nocol = 1;                       // the treading floor, stained
  for (let k = 0; k < 9; k++) { const gp = add(new THREE.SphereGeometry(.07, 6, 4), mat('jcGrape', '#4a2a5a'), -.6 + (k % 3) * .55, .36, -.5 + Math.floor(k / 3) * .5, f); gp.scale.y = .8; }   // a few crushed grapes
  box(.3, .2, .9, rockDk, 0, 0, -1.45, f); box(.14, .03, .9, juice, 0, .2, -1.45, f).userData.nocol = 1;                  // the channel
  cyl(.75, .7, .45, 14, rock, 0, 0, -2.4, f); cyl(.62, .62, .03, 14, juice, 0, .3, -2.4, f).userData.nocol = 1;          // the vat
  return y + .5; }
// a two-storey stone field watchtower: a cool store below, a lookout above with a parapet and a shade of branches, a door, a window and an outside ladder
function jcWatchtower(g, x, y, z) {
  const st = jcPlasterMat('#c0aa82'), stDk = jcPlasterMat('#a08a64'), f = new THREE.Group(); f.position.set(x, y, z); g.add(f);
  box(3.6, .4, 3.6, stDk, 0, 0, 0, f);
  for (let k = 0; k < 9; k++) box(3.3 - (k % 2) * .06, .6, 3.3 - (k % 2) * .06, k % 2 ? stDk : st, 0, .4 + k * .6, 0, f);   // coursed fieldstone, 5.4 m
  box(1.0, 1.9, .1, mat('jcDoorWarm', '#6a4a2a', { emissive: '#5a3010', emissiveIntensity: .6 }), 0, .4, 1.66, f).userData.nocol = 1; box(.04, 1.9, .08, jcM.beam(), -.5, .4, 1.7, f); box(.04, 1.9, .08, jcM.beam(), .5, .4, 1.7, f); box(1.3, .25, .3, stDk, 0, 2.3, 1.62, f);                 // door and lintel (facing +z)
  box(.5, .6, .1, 'dark', .8, 3.4, 1.66, f).userData.nocol = 1;                                                          // window of the upper floor
  for (const [px, pz, pw, pd] of [[0, 1.6, 3.3, .2], [0, -1.6, 3.3, .2], [1.6, 0, .2, 3.3], [-1.6, 0, .2, 3.3]]) box(pw, .7, pd, st, px, 5.8, pz, f);   // parapet
  for (const [a, b] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) box(.1, 1.5, .1, jcM.beam(), a, 5.8, b, f);
  box(2.8, .08, 2.8, mat('jcBranches', '#7a7a3a'), 0, 7.3, 0, f);                                                        // a shade of branches on poles
  const lad = new THREE.Group(); lad.position.set(-1.9, 0, .6); lad.rotation.z = -.2; f.add(lad);                         // a ladder up the side
  for (const s2 of [-1, 1]) box(.06, 6.2, .06, jcM.beam(), 0, 0, s2 * .25, lad); for (let k = 0; k < 14; k++) box(.05, .05, .5, jcM.beam(), 0, .4 + k * .42, 0, lad);
  return y + 6.5; }

function jcSheepskin(g0, x0, y0, z0) { const g = new THREE.Group(); g.position.set(x0, y0, z0); g.scale.setScalar(1.3); g0.add(g); const x = 0, y = 0, z = 0;   // a creamy fleece spread over a low stone to dry, wool tufts all over, legs splayed
  box(1.2, .25, .8, jcPlasterMat('#9a8a6e'), x, y, z, g); const hide = new THREE.Shape(); hide.moveTo(-.6, -.3); for (const [a, b] of [[-.75, -.5], [-.4, -.35], [.4, -.38], [.78, -.52], [.62, 0], [.8, .5], [.4, .38], [-.4, .4], [-.78, .52], [-.62, 0]]) hide.lineTo(a, b); hide.lineTo(-.6, -.3);
  const w = mat('jcFleece', '#d8c090', { emissive: '#2a2010', emissiveIntensity: .25, roughness: 1 }), h = add(new THREE.ShapeGeometry(hide), w, x, y + .27, z, g); h.rotation.x = -Math.PI / 2; h.userData.nocol = 1; const e = add(new THREE.ShapeGeometry(hide), mat('jcHide', '#8a6440'), x, y + .26, z, g); e.rotation.x = -Math.PI / 2; e.scale.set(1.12, 1.12, 1); e.userData.nocol = 1; h.scale.set(.92, .92, 1);
  for (let k = 0; k < 70; k++) { const a = k * 2.4, r = .05 + (k % 10) * .046; add(new THREE.IcosahedronGeometry(.07 + (k % 3) * .015, 0), w, x + Math.cos(a) * r * 1.15, y + .29, z + Math.sin(a) * r * .75, g).scale.y = .55; }
  return y0 + .5; }
function jcFigTree(g, x, y, z) {   // a broad, low fig tree: a grey forked trunk, a wide dome of big leaves, purple figs
  const bark = mat('jcFigBark', '#8a8070'); cyl(.2, .32, 1.5, 8, bark, x, y, z, g); cyl(.4, .45, .12, 8, bark, x, y, z, g); for (const a of [0, 2.1, 4.2]) { const b = new THREE.Group(); b.position.set(x, y + 1.4, z); b.rotation.y = -a; g.add(b); const l = cyl(.09, .15, .9, 6, bark, 0, 0, 0, b); l.rotation.z = -.7; l.position.set(.3, .35, 0); }
  const lf = [mat('jcFigLeaf', '#4e7a2e', { roughness: .8 }), mat('jcFigLeaf2', '#6a9a3a', { roughness: .8 })];
  for (let k = 0; k < 14; k++) { const a = k * 2.4, r = k < 6 ? .9 : .45; const c = add(new THREE.IcosahedronGeometry(.62 - (k % 3) * .08, 0), lf[k % 2], x + Math.cos(a) * r, y + 2.0 + (k % 4) * .18 + (k < 6 ? 0 : .35), z + Math.sin(a) * r, g); c.scale.y = .7; }
  for (let k = 0; k < 12; k++) { const a = k * 1.9; add(new THREE.SphereGeometry(.07, 6, 4), mat(k % 2 ? 'jcFigG' : 'jcFigP', k % 2 ? '#8a9a4a' : '#5a3a5a'), x + Math.cos(a) * 1.3, y + 1.75 + (k % 3) * .2, z + Math.sin(a) * 1.3, g); }
  return y + 2.9; }
function jcReaper(g, x, y, z) {   // a labourer standing with a big iron sickle held out, a sheaf at his feet
  viaScene(g, x, y, z, () => { person(0, 0, -.4, '#b89a6a', { skin: 2, hair: 1, y: 0 }); });
  const iron = mat('jcSickleIronDark', '#4e535c', { metalness: .5, roughness: .45, emissive: '#16181c', emissiveIntensity: .3, side: THREE.DoubleSide }); iron.name = 'jcSickleIron';
  const sk = new THREE.Group(); sk.position.set(x - .313, y + .822, z - .05); sk.rotation.set(0, 0, .55); g.add(sk);   // the grip passes through his own right hand (rest-pose wrist, upPerson), the blade tilted out away from his arm
    cyl(.028, .032, .32, 8, mat('jcSickleGrip', '#d0a46c', { emissive: '#4a3018', emissiveIntensity: .3 }), 0, -.14, 0, sk); add(new THREE.SphereGeometry(.035, 8, 6), mat('jcSickleGrip', '#d0a46c'), 0, -.15, 0, sk);   // pale wooden handle with a knob
  const R = .17, cy = .16 + R, sh = new THREE.Shape(), N = 18, a0 = -Math.PI / 2, a1 = Math.PI * .85;   // a tapering crescent: thick at the handle, a sharp point at the tip; the spine towards the body, the point away
  for (let k = 0; k <= N; k++) { const a = a0 + (a1 - a0) * k / N, p = [Math.cos(a) * R, cy + Math.sin(a) * R]; k ? sh.lineTo(...p) : sh.moveTo(...p); }
  for (let k = N; k >= 0; k--) { const a = a0 + (a1 - a0) * k / N, w = .06 * (1 - k / N) + .005, r = R - w; sh.lineTo(Math.cos(a) * r, cy + Math.sin(a) * r); }
  const bl = add(new THREE.ExtrudeGeometry(sh, { depth: .016, bevelEnabled: false }), iron, 0, 0, -.008, sk); bl.material = iron; bl.scale.x = -1;
  const ed = new THREE.Shape(); for (let k = 0; k <= N; k++) { const a = a0 + (a1 - a0) * k / N, r = R - (.06 * (1 - k / N) + .005); k ? ed.lineTo(Math.cos(a) * r, cy + Math.sin(a) * r) : ed.moveTo(Math.cos(a) * r, cy + Math.sin(a) * r); }
  for (let k = N; k >= 0; k--) { const a = a0 + (a1 - a0) * k / N, r = R - (.06 * (1 - k / N) + .005) + .014 * (1 - k / N * .7); ed.lineTo(Math.cos(a) * r, cy + Math.sin(a) * r); }
  const eg = add(new THREE.ExtrudeGeometry(ed, { depth: .02, bevelEnabled: false }), mat('jcSickleEdge', '#d8dde4', { metalness: .6, roughness: .2, emissive: '#5a5e66', emissiveIntensity: .5, side: THREE.DoubleSide }), 0, 0, -.01, sk); eg.scale.x = -1;   // the bright honed cutting edge
  box(.045, .05, .045, mat('jcSickleIronDk', '#3a3d42'), 0, .155, 0, sk);                                           // the iron ferrule where blade meets handle
  for (let k = 0; k < 16; k++) { const st = box(.035, .9, .035, mat('jcStraw', '#d8c078'), x - .55 + (k % 4) * .06, y, z - .35 + Math.floor(k / 4) * .06, g); st.rotation.z = (k % 4 - 1.5) * .08; } box(.3, .07, .3, mat('jcRope', '#c8b48a'), x - .46, y + .35, z - .26, g);
  return y + 1.9; }
function jcVineArbour(g0, x0, y0, z0) { const g = new THREE.Group(); g.position.set(x0, y0, z0); g.scale.setScalar(1.25); g0.add(g); const x = 0, y = 0, z = 0;   // one big old vine on a pergola: a twisted trunk, a roof of leaves and heavy purple bunches hanging under it
  const w = jcWoodLt(), vb = mat('jcVineBark', '#5a4030'), lf = [mat('jcVineLf', '#5a8a2e'), mat('jcVineLf2', '#7aa83a')], gr = mat('jcGrape', '#5a2a6a', { roughness: .4, emissive: '#2a0a3a', emissiveIntensity: .4 });
  for (const [a, b] of [[-.9, -.6], [.9, -.6], [-.9, .6], [.9, .6]]) box(.1, 1.9, .1, w, x + a, y, z + b, g); for (const b of [-.6, .6]) box(2.0, .08, .1, w, x, y + 1.9, z + b, g); for (let k = 0; k < 5; k++) box(.06, .06, 1.4, w, x - .8 + k * .4, y + 1.96, z, g);
  for (let k = 0; k < 6; k++) { const t = cyl(.07, .09, .4, 6, vb, x + Math.sin(k * 1.3) * .08, y + k * .33, z + Math.cos(k * 1.3) * .06, g); t.rotation.z = Math.sin(k) * .25; }
  for (let k = 0; k < 16; k++) { const c = add(new THREE.IcosahedronGeometry(.32, 0), lf[k % 2], x - .85 + (k % 4) * .57, y + 2.05 + (k % 3) * .06, z - .5 + Math.floor(k / 4) * .33, g); c.scale.y = .5; }
  for (const [bx, bz] of [[-.6, -.35], [-.15, .3], [.35, -.3], [.7, .25], [.05, -.05]]) for (let k = 0; k < 10; k++) add(new THREE.SphereGeometry(.06, 6, 4), gr, x + bx + ((k % 3) - 1) * .07, y + 1.8 - Math.floor(k / 3) * .1, z + bz + (k % 2) * .05, g);
  return y0 + 2.7; }
function jcDryTrough(g, x, y, z) {   // a long stone water trough, empty: a dry, cracked floor and a dusty rim
  const st = jcPlasterMat('#d4c4a4'); box(1.8, .2, .8, st, x, y, z, g); for (const [rx, rz, rw, rd] of [[0, .34, 1.8, .12], [0, -.34, 1.8, .12], [.84, 0, .12, .8], [-.84, 0, .12, .8]]) box(rw, .45, rd, st, x + rx, y + .2, z + rz, g);
  const fl = box(1.56, .02, .56, mat('jcDryMud', '#b89a6a'), x, y + .2, z, g); for (let k = 0; k < 7; k++) { const c = box(.4, .005, .015, mat('jcCrack', '#6a5238'), x - .55 + k * .18, y + .225, z - .15 + (k % 3) * .14, g); c.rotation.y = k * .9; }
  return y + .7; }
function jcFlourSack(g, x, y, z) {   // a fat, slumped sack of flour sitting on the ground, its neck rolled open, white flour heaped in the mouth and a little spilled
  const sk = mat('jcSackcloth', '#c8a878', { map: jcWeave(), emissive: '#3a2a18', emissiveIntensity: .25 }), fl = mat('jcFlour', '#f6f2ea', { emissive: '#6a6660', emissiveIntensity: .4 });
  const b = add(new THREE.LatheGeometry([[0, 0], [.34, .02], [.4, .2], [.38, .45], [.3, .62], [.26, .7]].map(([r, h]) => new THREE.Vector2(r, h)), 12), sk, x, y, z, g); b.material = sk;
  add(new THREE.TorusGeometry(.27, .05, 6, 12), sk, x, y + .7, z, g).rotation.x = Math.PI / 2; const h = add(new THREE.SphereGeometry(.24, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), fl, x, y + .66, z, g); h.scale.y = .5;
  const sp = add(new THREE.CircleGeometry(.22, 10), fl, x + .38, y + .015, z - .2, g); sp.rotation.x = -Math.PI / 2; sp.scale.set(1.4, .8, 1); sp.userData.nocol = 1;
  return y + .8; }
// ---- library entries ----
{ const T = (fn, id, label, origin, tags) => defObject(id, (g, x, y, z) => viaScene(g, x, y, z, fn), { label, origin, tags, kind: 'structure' });
  T(() => { jcSynagogue(0, 0); }, 'synagogue-galilean', 'Synagogue: inward-facing benches, lecterns, scroll room, portico and mikva’ot', 'james 2', ['synagogue', 'benches', 'columns', 'water']);
  T(() => { jcRichHouse(0, 0); }, 'rich-mans-house', 'Rich man’s walled estate house with a granary', 'james 5', ['house', 'estate', 'wall']);
  T(() => { jcWallGate([-4, 0], [4, 0]); }, 'wall-gate-small', 'Small gate in the city wall: two towers and a lintel', 'james 3', ['gate', 'wall', 'stone']);
  T(() => { jcShopUnit(-4, 4, 3, -3, { open: true }); jcColonnade([-4, 0, 4], 4.4, 3, -4.5, 4.5); }, 'open-shop-with-colonnade', 'Open-fronted shop behind a colonnade (Sardis street)', 'james 4', ['shop', 'street', 'columns']); }
// the smith's furnishings and the window with the scarlet cord, usable as room objects (g, x, y, z) => top
defObject('white-cloth-bolts', jcWhiteCloth, { label: 'Bolts of undyed white cloth on a bench', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('ledger-desk', jcLedgerDesk, { label: 'Writing table with an open ledger, inkpot and stylus', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('incense-stand', jcIncenseStand, { label: 'Bronze incense stand with glowing coals and smoke', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('open-coin-chest', jcCoinChest, { label: 'Open chest heaped with gold coins', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('kick-wheel', jcKickWheel, { label: 'Potter\u2019s kick wheel with a pot taking shape', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('domed-kiln', jcDomedKiln, { label: 'Domed kiln with a glowing arched mouth', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('bowl-stack-bench', jcBowlStack, { label: 'Bench with stacks of terracotta bowls', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('tripod-brazier', jcTripodBrazier, { label: 'Bronze tripod with a bowl of glowing coals', origin: 'james 4', tags: ['craft', 'street'], kind: 'object' });
defObject('rock-cut-winepress', jcWinepress, { label: 'Rock-cut winepress: treading floor, channel and vat', origin: 'james 5', tags: ['farm', 'vineyard', 'wine', 'stone'], kind: 'structure' });
defObject('field-watchtower', jcWatchtower, { label: 'Two-storey stone field watchtower with a ladder', origin: 'james 5', tags: ['farm', 'vineyard', 'tower', 'stone'], kind: 'structure' });
defObject('quench-trough', jcQuenchTrough, { label: 'Stone quenching trough of bright water', origin: 'james 4', tags: ['smith', 'water', 'stone'], kind: 'object' });
defObject('big-washtub', jcWashtub, { label: 'Big wooden washtub of soapy water with a paddle', origin: 'james 4', tags: ['fuller', 'water', 'wood'], kind: 'object' });
defObject('big-bucket', jcBucket, { label: 'Big light-wood bucket of water with a rope handle', origin: 'james 4', tags: ['fuller', 'water'], kind: 'object' });
defObject('stone-dye-vat', jcDyeVat, { label: 'Stone dye vat of crimson dye with a stirring pole', origin: 'james 4', tags: ['fuller', 'dye'], kind: 'object' });
defObject('amphora-rack', jcJarRack, { label: 'Two-tier rack of shipping amphorae in straw', origin: 'james 4', tags: ['merchant', 'pottery'], kind: 'object' });
defObject('jar-pyramid-321', jcJarPyramid, { label: 'Jars stacked 3-2-1 on a board', origin: 'james 4', tags: ['potter', 'pottery'], kind: 'object' });
defObject('merchant-lapis-tunic', (g, x, y, z) => viaScene(g, x, y, z, () => { person(0, 0, -.5, '#2f6fd0', { skin: 1, hair: 2, y: 0 }); }), { label: 'Merchant in a bright lapis-blue tunic', origin: 'james 4', tags: ['merchant', 'man'], kind: 'person' });
defObject('fleece-on-stone', jcSheepskin, { label: 'Sheepskin fleece spread on a stone', origin: 'james 5', tags: ['farm', 'wool', 'sheep'], kind: 'object' });
defObject('fig-tree-broad', jcFigTree, { label: 'Broad fig tree with purple figs', origin: 'james 5', tags: ['farm', 'tree', 'fig'], kind: 'plant' });
defObject('reaper-with-sickle', jcReaper, { label: 'Reaper standing with a big sickle and a sheaf', origin: 'james 5', tags: ['farm', 'harvest', 'man'], kind: 'person' });
defObject('ox-standing-small', (g, x, y, z) => { const s = new THREE.Group(); s.position.set(x - .4, y, z); s.scale.setScalar(.78); g.add(s); upQuad(s, 0, 0, 0, 'ox', { ry: .3 }); return y + 1.2; }, { label: 'Smaller ox standing', origin: 'james 5', tags: ['farm', 'livestock'], kind: 'animal' });
defObject('ox-grazing-small', (g, x, y, z) => { const s = new THREE.Group(); s.position.set(x, y, z); s.scale.setScalar(.72); g.add(s); upQuad(s, 0, 0, 0, 'ox', { ry: .3, graze: true, coat: ['#a8693a', '#c8986a', '#4a3020'] }); return y + 1.1; }, { label: 'Smaller light-brown ox grazing', origin: 'james 5', tags: ['farm', 'livestock'], kind: 'animal' });
defObject('vine-arbour-grapes', jcVineArbour, { label: 'Old vine on a pergola, heavy with grapes', origin: 'james 5', tags: ['vineyard', 'vine', 'grapes'], kind: 'plant' });
defObject('dry-stone-trough', jcDryTrough, { label: 'Empty stone water trough with a dry, cracked floor', origin: 'james 5', tags: ['farm', 'water', 'drought'], kind: 'object' });
defObject('flour-sack-open', jcFlourSack, { label: 'Fat sack of flour, open, flour heaped in its mouth', origin: 'james 5', tags: ['farm', 'food', 'flour'], kind: 'object' });
defObject('anvil', jcAnvil, { label: 'Anvil on a stump, with a hammer', origin: 'james 4', tags: ['smith', 'iron', 'tools'], kind: 'object' });
defObject('smith-forge', jcForge, { label: 'Smith\u2019s forge with glowing coals and a hood', origin: 'james 4', tags: ['smith', 'fire', 'stone'], kind: 'object' });
defObject('blade-rack', jcBladeRack, { label: 'Rack of new sword blades', origin: 'james 4', tags: ['smith', 'weapons', 'iron'], kind: 'object' });
defObject('window-scarlet-cord', (g, x, y, z) => jcRahabWindow(g, x, y, z), { label: 'House wall with a window and a scarlet cord let down from it', origin: 'james 2', tags: ['rahab', 'window', 'cord', 'wall'], kind: 'structure' });
