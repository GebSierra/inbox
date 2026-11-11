// engine kit: perched birds, the vignette (a room's square of five objects), booths and room().
// The prop builders (P.basket, ...) live in the object library: ltm-engine/objects/colossae.js.
const PERCHED = [];
function realBird(g, x, y, z, size = .28, ry = 0) { if (!MODELS.bird) return false; const b = SkeletonUtils.clone(MODELS.bird); const bb = new THREE.Box3().setFromObject(MODELS.bird), sz = bb.getSize(new THREE.Vector3());
  const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = ry; w.scale.setScalar(size / Math.max(sz.x, sz.z)); b.traverse(o => { if (o.isMesh) { o.userData.dyn = 1; o.castShadow = true; o.frustumCulled = false; o.material = (KMAT.__dove ??= Object.assign(o.material.clone(), { map: null, color: new THREE.Color('#f4f2ec') })); } }); w.add(b); g.add(w);
  if (BIRD_ANIM && BIRD_ANIM[0]) { const m = new THREE.AnimationMixer(b); const a = m.clipAction(BIRD_ANIM[0]); a.play(); a.time = R(0, 1); m.timeScale = .25; PERCHED.push(m); } return true; }
// a "room" laid out as a square of five objects, seen from the viewer side:
// 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre
function vignette({ x, z, viewer, props, dais = 'stone', spread = [1.6, 1.15], centre, rug = '#9a4a3a', minY = -99, big = 1.35 }) {
  spread = [spread[0] * (1 + (big - 1) * .55), spread[1] * (1 + (big - 1) * .55)];
  const y = Math.max(minY, heightAt(x, z)); const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.atan2(viewer[0] - x, viewer[1] - z); scene.add(g);
  let base = 0;
  if (dais === 'stone') { box(spread[0] * 2 + 1.2, 2.6, spread[1] * 2 + 1.2, 'stone', 0, -2.3, 0, g); box(spread[0] * 2 + 1.35, .1, spread[1] * 2 + 1.35, 'marble', 0, .25, 0, g); base = .35; }
  else if (dais === 'low') { box(spread[0] * 2 + 1.1, .16, spread[1] * 2 + 1.1, 'marble', 0, 0, 0, g); base = .16; }
  else if (dais === 'pier') { uePier(g, spread); base = .1; }
  else if (dais === 'planks') { const W2 = spread[0] * 2 + 2, D2 = spread[1] * 2 + 1.8; for (let i = 0; i < 11; i++) box(W2, .12, D2 / 11 * .95, 'woodLt', 0, -.02, -D2 / 2 + (i + .5) * D2 / 11, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(.12, .12, 1.6, 7, 'wood', sx * W2 / 2, -1.5, sz * D2 / 2, g); base = .1; }
  else if (dais === 'stones') { for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; const st = add(new THREE.DodecahedronGeometry(R(.18, .3), 0), 'stoneDk', Math.cos(a) * (spread[0] + .6), .05, Math.sin(a) * (spread[1] + .5), g); st.scale.y = .6; } base = 0; }
  else if (dais === 'rug') { box(spread[0] * 2 + .9, .04, spread[1] * 2 + .9, mat('rug' + rug, rug), 0, 0, 0, g); box(spread[0] * 2 + .5, .05, spread[1] * 2 + .5, mat('rugIn', '#d8b06a'), 0, 0, 0, g); base = .05; }
  g.updateMatrixWorld(true);
  return props.map(([fn, what], i) => {
    const [lx, lz] = [LOCAL[i][0] * spread[0], LOCAL[i][1] * spread[1]];
    let w;
    if (i === 4 && centre) w = g.localToWorld(new THREE.Vector3(lx, centre.top - y, lz));
    else { const sg = new THREE.Group(); sg.position.set(lx, base, lz); sg.scale.setScalar(big); g.add(sg); const top = fn(sg, 0, 0, 0); sg.updateMatrixWorld(true); w = sg.localToWorld(new THREE.Vector3(0, top, 0)); } return { x: w.x, y: w.y, z: w.z, what: i === 4 && centre ? centre.what : what };
  });
}
const VIA = {};
function booth(x, z, viewer, col) { const g = new THREE.Group(); g.position.set(x, heightAt(x, z), z); g.rotation.y = Math.atan2(viewer[0] - x, viewer[1] - z); scene.add(g);
  box(4.4, .18, 3.6, 'stone', 0, 0, 0, g); for (const [a, b] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) { cyl(.12, .14, 3, 8, 'woodLt', a, .18, b, g); }
  const cl = box(4.6, .08, 3.8, mat('booth' + col, col, { map: TEX.cloth, side: THREE.DoubleSide }), 0, 3.15, 0, g); cl.rotation.x = .12;
  for (let i = 0; i < 40; i++) for (const zz of [1.95, -1.95]) box(.03, .22, .03, mat('tassel', '#d8c8a0'), -2.2 + i * .113, 2.95, zz, g);
  for (let i = 0; i < 32; i++) for (const xx of [2.3, -2.3]) box(.03, .22, .03, mat('tassel', '#d8c8a0'), xx, 2.95, -1.8 + i * .113, g);
  box(4.6, .35, .06, mat('booth' + col), 0, 3.0, 1.95, g); box(4.6, .35, .06, mat('booth' + col), 0, 3.0, -1.95, g);
  box(4.2, .9, .12, mat('booth' + col), 0, 2.1, -1.75, g); }
function room(ch, n, name, x, z, viewer, opts) {
  if (ch > BUILT) return;
  const custom = vignette({ x, z, viewer, ...opts });
  station(ch, n, name, x, z, [x - (viewer[0] - x), 0, z - (viewer[1] - z)], custom); STATIONS[STATIONS.length - 1].back = Math.min(ch === 2 ? 4.6 : 5.8, Math.max(4.6, Math.hypot(viewer[0] - x, viewer[1] - z) * 1.1));
}
const H_NEAR = 1.12, H_FAR = 1.7;
const LOCAL = [[-1, 1], [-1, -1], [1, -1], [1, 1], [0, 0]];   // near-left, far-left, far-right, near-right, centre   // counter top, back shelf top
