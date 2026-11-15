// ---------- Scenery: the library's new animals, people and plants placed in the towns (owner approved, 2026-11-14) ----------
// Background dressing only: never in a room. upScenery() runs in finish.js after the collision grid is built and before the merge (so the
// pieces merge like any static scenery), and before the ground cover (so grass keeps off them). Each group names a room to stand near;
// a spot is searched for with a private generator (no R()), and must be open ground: nothing solid within the group's radius, not paved,
// gentle, at least 12 m from every room and 6 m from every verse spot, and (with out: true) outside the town's TOWN area. A placed group
// marks its footprint in the collision grid so walkers go round it. Groups whose room is missing, or that find no spot, are skipped.
const USC = {
  som: [
    { near: 'The Sheepfold', r: 7, d: [14, 40], put: (x, z, a) => { person(x, z, a + Math.PI, '#a89070', { pose: 'walk', prop: 'crook', cloak: '#6a5238', hair: 2 });
        for (const [dx, dz, g] of [[2, 1.4, 1], [-1.6, 2.2, 0], [1, 3.2, 1], [3, -.8, 0], [-2.4, -.6, 1]]) upQuad(scene, x + dx, heightAt(x + dx, z + dz), z + dz, 'goat', { ry: a + dx, graze: !!g, coat: dx > 0 ? null : ['#e6dac4', '#f0e8d8', '#b8ab94'] }); } },
    { near: 'The Seat', r: 4, d: [12, 55], put: (x, z) => upMeadow(x, z, 5, true) },
    { near: 'The Bee Bank', r: 5, d: [14, 34], put: (x, z) => upMeadow(x, z, 5, true) },
    { near: 'The Threshing Floor', r: 7, d: [16, 40], out: true, put: (x, z, a) => { upWheat(x, z, 9, 6, a); person(x + Math.cos(a) * 5.2, z - Math.sin(a) * 5.2, a + 1.4, '#b8a070', { pose: 'kneel', prop: 'sickle', hair: 2 }); } },
    { near: 'The Lookout', r: 4, d: [14, 36], put: (x, z) => upFig(scene, x, heightAt(x, z), z, 1, 2) },
    { near: "The Shepherds' Camp", r: 5, d: [14, 36], put: (x, z, a) => { upQuad(scene, x, heightAt(x, z), z, 'donkey', { ry: a }); upAlmond(scene, x + 3, heightAt(x + 3, z + 1), z + 1, 1, 4); } },
  ],
  james: [
    { near: 'The Almshouse', r: 2.5, d: [12, 40], paving: true, put: (x, z, a) => { person(x, z, a, '#5a2a6a', { pose: 'stand', arms: 'reach', ring: true, cloak: '#c9a24a', hair: 1 });   // James 2:2-3
        const sx = x + Math.cos(a) * 2.2, sz = z - Math.sin(a) * 2.2; upStool(sx, sz, a + Math.PI); person(sx, sz, a + Math.PI, '#8a7a62', { pose: 'sit', prop: 'bowl', hair: 2, skin: 1, y: heightAt(sx, sz) }); } },
    { near: 'The Lamp Porch', r: 4, d: [14, 70], put: (x, z, a) => { upFig(scene, x, heightAt(x, z), z, 1, 3); upVine(scene, x + 4 * Math.cos(a), heightAt(x + 4 * Math.cos(a), z + 4 * Math.sin(a)), z + 4 * Math.sin(a), .9, 2); } },   // James 3:12
    { near: 'The Gate', r: 4, d: [14, 40], put: (x, z, a) => upQuad(scene, x, heightAt(x, z), z, 'horse', { ry: a }) },   // James 3:3
    { near: 'The Gate', r: 8, d: [30, 90], out: true, put: (x, z, a) => { upWheat(x, z, 12, 8, a);   // James 5:4, the reapers of the fields
        for (const k of [-1, 1]) person(x + Math.cos(a) * 7 + k * 2, z - Math.sin(a) * 7 + k, a + Math.PI / 2, k > 0 ? '#b8a070' : '#9a8a60', { pose: 'kneel', prop: 'sickle', hair: k > 0 ? 2 : 1 }); } },
  ],
  colossae: [
    { near: 'The Milestone', r: 8, d: [20, 70], out: true, put: (x, z, a) => { upQuad(scene, x, heightAt(x, z), z, 'ox', { ry: a, graze: true }); upQuad(scene, x + 3, heightAt(x + 3, z + 2), z + 2, 'ox', { ry: a + 2.6 });
        upQuad(scene, x - 3, heightAt(x - 3, z + 2.5), z + 2.5, 'donkey', { ry: a + 1.2, graze: true }); } },
    { near: 'Fishermen’s Landing', r: 2.5, d: [12, 26], paving: true, put: (x, z, a) => person(x, z, a, '#7a8a96', { pose: 'stand', prop: 'net', hair: 1 }) },
  ],
  tabernacle: [
    { at: [182, -30], r: 10, d: [0, 30], put: (x, z, a) => { for (const [dx, dz, g] of [[0, 0, 1], [3.4, 1.8, 0], [-2.6, 2.6, 1], [1, 5, 0]]) upQuad(scene, x + dx, heightAt(x + dx, z + dz), z + dz, 'ox', { ry: a + dx * .7, graze: !!g });
        for (const [dx, dz, g] of [[6, -2, 1], [7.5, .5, 0], [5, 3, 1], [8, 3.5, 1], [6.5, 6, 0], [4, -3.5, 0]]) upQuad(scene, x + dx, heightAt(x + dx, z + dz), z + dz, 'goat', { ry: a - dz, graze: !!g, coat: dz > 2 ? ['#e6dac4', '#f0e8d8', '#b8ab94'] : null }); } },
    { at: [-190, 10], r: 8, d: [0, 30], put: (x, z, a) => { for (const [dx, dz, g] of [[0, 0, 1], [2.6, 1.6, 0], [-2, 2.4, 1], [3.6, -1.8, 1], [-3.2, -1, 0]]) upQuad(scene, x + dx, heightAt(x + dx, z + dz), z + dz, 'goat', { ry: a + dz, graze: !!g, coat: dx < 0 ? ['#e6dac4', '#f0e8d8', '#b8ab94'] : null });
        person(x + 4.5, z + 3, a + 2.6, '#a89070', { pose: 'stand', prop: 'staff', cloak: '#5a4632', hair: 3 }); } },
  ],
};
// a meadow of the gospel's lilies of the field: grass, red anemones and a few white lilies (Matthew 6:28)
function upMeadow(x, z, rad, lilies) { const r = upRng(Math.round(x * 31) ^ Math.round(z * 17)), pts = n => Array.from({ length: n }, () => { const a = r() * 6.283, d = Math.sqrt(r()) * rad; return [x + Math.cos(a) * d, z + Math.sin(a) * d, .9 + r() * .6, r() * 6.28]; });
  upCover(scene, 'grass', pts(70), { sink: .02 }); upCover(scene, 'anemone', pts(60)); upCover(scene, 'daisy', pts(14)); if (lilies) upCover(scene, 'lily', pts(9)); }
// a field of standing wheat, w by d metres, turned by a
function upWheat(x, z, w, d, a) { const r = upRng(Math.round(x * 13) ^ Math.round(z * 29)), out = [], c = Math.cos(a), s = Math.sin(a);
  for (let i = 0; i < w / .32; i++) for (let j = 0; j < d / .32; j++) { const u = -w / 2 + i * .32 + (r() - .5) * .12, v = -d / 2 + j * .32 + (r() - .5) * .12; out.push([x + u * c + v * s, z - u * s + v * c, .9 + r() * .25, r() * 6.28]); }
  upCover(scene, 'wheat', out, { sink: .03 }); }
function upStool(x, z, a) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = a; scene.add(g); const wd = mat('upStoolW', '#8a5c36', { roughness: .9 });
  add(new THREE.BoxGeometry(.5, .05, .4), wd, 0, .44, -.05, g); for (const [p, q] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = add(new THREE.CylinderGeometry(.025, .03, .44, 6), wd, p * .2, 0, -.05 + q * .15, g); l.position.y = .22; } }
function upScenery() {
  const list = USC[STORE]; if (!list || new URLSearchParams(location.search).has('noscenery')) return;
  const r = upRng(70707), low = STATIONS.length ? Math.min(...STATIONS.map(s => heightAt(s.x, s.z))) - 1.5 : -1e9, spots = STATIONS.flatMap(s => s.loci.map(l => [l.x, l.z]));
  const paved = typeof upPavedMask === 'function' ? upPavedMask() : () => false, inTown = (x, z) => typeof TOWN === 'function' && TOWN(x, z) > 0;
  const ok = (x, z, rad, out, pav) => { if (heightAt(x, z) < low || (out && inTown(x, z))) return false;
    if (STATIONS.some(s => Math.hypot(s.x - x, s.z - z) < 12 + rad) || spots.some(([a, b]) => Math.hypot(a - x, b - z) < 6 + rad)) return false;
    for (let k = 0; k < 9; k++) { const aa = k / 8 * 6.283, dd = k ? rad : 0, px = x + Math.cos(aa) * dd, pz = z + Math.sin(aa) * dd; if (blocked(px, pz) || (!pav && paved(px, pz))) return false; }
    const sl = Math.max(Math.abs(heightAt(x + rad, z) - heightAt(x - rad, z)), Math.abs(heightAt(x, z + rad) - heightAt(x, z - rad))); return sl < rad * .5; };
  for (const grp of list) { const st = grp.near ? STATIONS.find(s => s.name === grp.near) : null, A = grp.at || (st && [st.x, st.z]); if (!A) continue;
    let found = null; for (let t = 0; t < 600 && !found; t++) { const a = r() * 6.283, d = grp.d[0] + r() * (grp.d[1] - grp.d[0]), x = A[0] + Math.cos(a) * d, z = A[1] + Math.sin(a) * d; if (ok(x, z, grp.r, grp.out, grp.paving)) found = [x, z]; }
    if (!found) { console.warn('[scenery] no spot for a group near', grp.near || grp.at); continue; }
    const [x, z] = found, face = A ? Math.atan2(A[0] - x, A[1] - z) : 0; grp.put(x, z, face);
    for (let j = -grp.r; j <= grp.r; j += CG.r) for (let i = -grp.r; i <= grp.r; i += CG.r) if (i * i + j * j < grp.r * grp.r * .45) { const I = Math.floor((x + i - CG.x0) / CG.r), J = Math.floor((z + j - CG.z0) / CG.r); if (I >= 0 && J >= 0 && I < CG.n && J < CG.n) CG.cells[J * CG.n + I] = 1; }
    (window.__scenery ??= []).push([grp.near || 'at', Math.round(x), Math.round(z)]); } }
