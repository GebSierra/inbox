// ---------- NEW (plan item N7): water and boats ----------
//   upWaterSurface(g, x, y, z, w, d, o)  James's sea as a reusable surface: a w × d sheet with moving ripples and sun glints, the
//       shallows paler toward an edge. o: { color, shallow: '+z'|'-z'|'+x'|'-x'|'all'|null, band (metres of shallows), opacity, glint }
//       Driven by the engine's shared water clock (WATER_T), so it moves with the town's sea.
//   upFishingBoat(g, x, y, z, o)  a Galilee fishing boat (about 8 × 2.3 m, like the first-century boat found at Ginosar): planked hull with a
//       tarred bottom, stem and stern posts, small decks fore and aft, a mast with the sail furled on its yard, four oars out in their
//       tholes, a steering oar, a dragnet heaped in the stern and hung over the side, a basket of fish. o: { rot, oars: 'out'|'in', bob, sail }
// Private generator (no R()). The boat's top Y is returned so a figure can be stood in it.
function upWaterSurface(g, x, y, z, w = 20, d = 20, o = {}) {
  const geo = new THREE.PlaneGeometry(w, d, 1, 1); geo.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({ color: o.color || '#3f8a9a', roughness: .2, metalness: .1, transparent: true, opacity: o.opacity ?? .94 });
  const band = (o.band ?? 8).toFixed(2), sh = o.shallow === undefined ? 'all' : o.shallow, glint = (o.glint ?? .35).toFixed(2);
  // distance to the shallow edge, in the sheet's own coordinates (vL), so the surface can be moved and turned
  const edge = { '+z': `${(d / 2).toFixed(2)} - vL.z`, '-z': `vL.z + ${(d / 2).toFixed(2)}`, '+x': `${(w / 2).toFixed(2)} - vL.x`, '-x': `vL.x + ${(w / 2).toFixed(2)}`,
    all: `min(min(${(w / 2).toFixed(2)} - abs(vL.x), ${(d / 2).toFixed(2)} - abs(vL.z)), 1e4)` }[sh];
  m.onBeforeCompile = s => { s.uniforms.uT = WATER_T;
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW; varying vec3 vL;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.)).xyz; vL = transformed;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vW; varying vec3 vL;').replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float r = sin(vW.z*.7 + uT*1.3 + sin(vW.x*.9)) * sin(vW.x*1.1 - uT*.9 + vW.z*.25);
     float shore = ${edge ? `1. - smoothstep(1., ${band}, ${edge})` : '0.'};
     gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.55,.82,.8), shore * .55);
     gl_FragColor.rgb += vec3(.35,.22,.1) * smoothstep(.65, 1., r) * ${glint};
     gl_FragColor.rgb += vec3(.25) * shore * (.5 + .5*sin(vW.x*.8 + uT*2.));`); };
  const wm = new THREE.Mesh(geo, m); wm.position.set(x, y, z); if (o.rot) wm.rotation.y = o.rot; wm.userData.dyn = 1; wm.receiveShadow = true; wm.castShadow = false; g.add(wm);
  if (STORE === 'library') FIRES.push({ update(t) { WATER_T.value = t; } });   // the library's stage has no town loop to move the water clock
  return y; }

function upFishingBoat(g, x, y, z, o = {}) {
  const r = upRng(Math.round(x * 53) ^ Math.round(z * 71) ^ 21), B = upBag(), G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = o.rot || 0; g.add(G);
  const L = 8, W = 2.3, H = 1.2, keelY = -.55;   // y = 0 is the waterline
  const planks = mat('ufbPlanks', '#ffffff', { side: THREE.DoubleSide, roughness: .85, flatShading: false, map: upTex('ufbPlanks', 64, 256, (c, w, h, rr) => {
    c.fillStyle = '#8e6440'; c.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { c.fillStyle = `rgba(${rr() < .5 ? '255,226,180' : '40,22,10'},${.05 + rr() * .1})`; c.fillRect(0, i * 16, w, 16); c.fillStyle = 'rgba(30,16,6,.55)'; c.fillRect(0, i * 16 + 15, w, 1); }
    c.fillStyle = '#231a14'; c.fillRect(0, 0, w, 60); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 59, w, 3); }) });   // pitch below the waterline (the bottom of the texture)
  const wd = mat('ufbWood', '#7a5434', { roughness: .9, map: TEX.wood }), wdk = mat('ufbWoodDk', '#4e3420', { roughness: .9, map: TEX.wood }),
    cord = mat('ufbCord', '#a08a62', { roughness: 1 }), sail = mat('ufbSail', '#e8dcc0', { roughness: 1, map: TEX.cloth, side: THREE.DoubleSide }),
    net = mat('ufbNet', '#ffffff', { roughness: 1, transparent: true, alphaTest: .3, side: THREE.DoubleSide, map: upTex('ufbNet', 64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#6a5a40'; c.lineWidth = 1.6;
      for (let i = -64; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); } }) }),
    netHeap = mat('ufbNetHeap', '#6e5e44', { roughness: 1 }), fishM = mat('ufbFish', '#9aa4a8', { metalness: .3, roughness: .4, flatShading: false });
  // ---- hull: rings along the length; half-width and depth follow the lines, the sheer rising at bow (+z) and stern ----
  const hw = u => W / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.4)), .55), sheer = u => H * .62 + .35 * Math.pow(Math.abs(u), 3) + (u > 0 ? .08 * u : 0), dep = u => (H * .62 - keelY) * (1 - .35 * u * u);
  { const N = 24, S = 12, pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) { const u = i / N * 2 - 1, half = hw(u), top = sheer(u), dp = dep(u);
      for (let k = 0; k <= S; k++) { const a = k / S * Math.PI, sy = Math.sin(a); pos.push(Math.cos(a) * half * (1 - .12 * sy * sy), top - Math.pow(sy, .8) * dp, u * L / 2); uv.push(i / N * 3, 1 - Math.abs(k / S - .5) * 2 * .999); } }
    for (let i = 0; i < N; i++) for (let k = 0; k < S; k++) { const a = i * (S + 1) + k, b = a + 1, c = a + S + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); hg.setIndex(idx); hg.computeVertexNormals(); B.put(planks, hg); }
  // ---- gunwales, stem and stern posts, keel, ribs, thwarts, the small decks ----
  for (const s of [-1, 1]) B.put(wdk, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => { const u = (i / 12 * 2 - 1) * .985; return new THREE.Vector3(s * hw(u), sheer(u) + .02, u * L / 2); })), 30, .045, 5));
  for (const e of [-1, 1]) { const u = e * .99, top = sheer(u); B.put(wdk, upLimb([0, top - dep(u) * .9, e * L / 2 * .99], [0, top + (e > 0 ? .45 : .3), e * (L / 2 + .12)], .07, .05, 6)); }
  for (let i = 1; i < 11; i++) { const u = i / 11 * 2 - 1, half = hw(u) * .97, top = sheer(u), dp = dep(u) * .96;
    B.put(wd, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 7 }, (_, k) => { const a = k / 6 * Math.PI, sy = Math.sin(a); return new THREE.Vector3(Math.cos(a) * half * (1 - .12 * sy * sy), top - Math.pow(sy, .8) * dp + .02, u * L / 2); })), 10, .03, 4)); }
  for (const u of [-.35, .05, .4]) B.put(wd, new THREE.BoxGeometry(hw(u) * 1.9, .06, .26), 0, sheer(u) - .22, u * L / 2);
  B.put(wd, new THREE.BoxGeometry(hw(-.8) * 1.8, .05, 1.0), 0, sheer(-.8) - .18, -.8 * L / 2 + .2);   // stern deck, where the steersman sits (Mark 4:38: "in the stern, asleep on a cushion")
  B.put(mat('ufbCushion', '#8a3a2a', { roughness: 1, flatShading: false }), new THREE.CapsuleGeometry(.14, .4, 3, 8).rotateZ(Math.PI / 2), 0, sheer(-.8) - .06, -.8 * L / 2 + .25);
  B.put(wd, new THREE.BoxGeometry(hw(.82) * 1.7, .05, .8), 0, sheer(.82) - .16, .82 * L / 2 - .2);
  // ---- mast with the sail furled on its yard ----
  const mz = .22 * L / 2, mTop = 6.2; B.put(wdk, upLimb([0, keelY + .1, mz], [0, mTop, mz], .09, .06, 7));
  if (o.sail === 'set') { B.put(sail, new THREE.PlaneGeometry(4.2, 3.6, 6, 4).translate(0, mTop - 2.1, mz + .12)); B.put(wd, upLimb([-2.3, mTop - .25, mz + .1], [2.3, mTop - .25, mz + .1], .045, .04, 6)); }
  else { const yy = mTop - .4; B.put(wd, upLimb([-2.6, yy - .35, mz + .1], [2.6, yy + .1, mz + .1], .05, .035, 6));
    B.put(sail, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-2.3, yy - .44, mz + .12], [-1, yy - .52, mz + .14], [0, yy - .42, mz + .14], [1.2, yy - .3, mz + .14], [2.3, yy - .08, mz + .12]].map(p => new THREE.Vector3(...p))), 20, .13, 7));   // the furled sail along the yard
    for (const px of [-1.6, -.4, .8, 1.9]) B.put(cord, new THREE.TorusGeometry(.15, .012, 4, 10).rotateY(Math.PI / 2).translate(px, yy - .44 + px * .07, mz + .13)); }
  for (const [px, pz] of [[-hw(.22) + .05, mz], [hw(.22) - .05, mz], [0, .93 * L / 2], [0, -.9 * L / 2]]) B.put(cord, upLimb([0, mTop - .1, mz], [px, sheer(pz / (L / 2)), pz], .01, .01, 3));   // stays
  // ---- oars: two a side in their tholes; out over the water, or shipped along the thwarts ----
  for (const s of [-1, 1]) for (const u of [-.18, .22]) { const top = sheer(u), px = s * hw(u), pz = u * L / 2;
    B.put(wdk, upLimb([px, top, pz], [px, top + .16, pz], .02, .02, 4));   // thole pin
    const a = o.oars === 'in' ? [0, top + .05, pz - 1.5 * s * .3] : [px - s * 1.3, top + .3, pz - .3], b = o.oars === 'in' ? [s * .3, top + .05, pz + 1.5] : [px + s * 2.6, -.05, pz + .45];
    B.put(wd, upLimb(a, b, .028, .024, 5)); const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], l = Math.hypot(dx, dy, dz), bl = new THREE.BoxGeometry(.2, .025, .7);
    bl.lookAt(new THREE.Vector3(dx, dy, dz)); bl.translate(b[0] - dx / l * .3, b[1] - dy / l * .3, b[2] - dz / l * .3); B.put(wd, bl); }   // the blade
  { const u = -.92, top = sheer(u); B.put(wd, upLimb([hw(-.85) + .05, top + .5, -L / 2 + .3], [hw(-.85) + .35, -.6, -L / 2 - .5], .04, .035, 5)); B.put(wd, new THREE.BoxGeometry(.06, .7, .3).translate(hw(-.85) + .34, -.45, -L / 2 - .45)); }   // steering oar on the starboard quarter
  // ---- the dragnet heaped in the stern, a length hung over the side, a basket of fish ----
  { for (let i = 0; i < 22; i++) { const c = new THREE.IcosahedronGeometry(.22 + r() * .14, 0); c.scale(1.2, .45, 1); c.translate((r() - .5) * 1.1, sheer(-.55) - .45 + r() * .18, -.55 * L / 2 + (r() - .5) * 1.1); B.put(netHeap, c); }
    const ng = new THREE.PlaneGeometry(2.6, 1.6, 10, 6), p = ng.attributes.position; for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i); p.setXYZ(i, -hw(-.3) - .02 - (.8 - py) * .25 - Math.sin(px * 3) * .03, sheer(-.3) - (.8 - py) * .95 + .02, -.3 * L / 2 + px); }
    ng.computeVertexNormals(); B.put(net, ng);
    for (let i = 0; i < 9; i++) B.put(cord, new THREE.CylinderGeometry(.03, .03, .05, 6).translate(-hw(-.3) - .4 - (r() * .05), sheer(-.3) - 1.55 + .02, -.3 * L / 2 - 1.2 + i * .3));   // the net's sinker stones along the foot
    for (let i = 0; i < 8; i++) B.put(mat('ufbFloat', '#c8b48a', { flatShading: false }), new THREE.SphereGeometry(.05, 6, 5).translate(-hw(-.3) - .03, sheer(-.3) + .03, -.3 * L / 2 - 1.2 + i * .34)); }
  { const bx = .45, bz = .55 * L / 2 - 1.2, by = sheer(.27) - .62;   // the basket, on the floorboards
    B.put(mat('ufbBasket', '#b08a50', { roughness: 1, map: TEX.wood }), new THREE.CylinderGeometry(.32, .26, .34, 12, 1, true).translate(bx, by + .17, bz));
    for (let i = 0; i < 11; i++) { const f = new THREE.SphereGeometry(.07, 7, 5); f.scale(3.2, .7, 1); f.rotateY(r() * 6.28); f.rotateZ((r() - .5) * .5); f.translate(bx + (r() - .5) * .3, by + .3 + r() * .08, bz + (r() - .5) * .3); B.put(fishM, f); } }
  B.flush(G);
  if (o.bob) { G.userData.y0 = y; G.userData.ph = r() * 6; G.userData.amp = .06; SHIPS.push(G); }
  return y + H; }

{ const T = (id, label, tags, kind, fn) => defObject(id, fn, { label, origin: 'plan N7', tags, kind });
  T('galilee-fishing-boat', 'Fishing boat of Galilee (oars out)', ['boat', 'fishing', 'galilee', 'gospel', 'sea', 'net'], 'structure', (g, x, y, z) => upFishingBoat(g, x, y + .55, z, { oars: 'out' }));
  T('galilee-fishing-boat-beached', 'Fishing boat of Galilee (oars shipped)', ['boat', 'fishing', 'galilee', 'gospel', 'shore'], 'structure', (g, x, y, z) => upFishingBoat(g, x, y + .55, z, { oars: 'in' }));
  T('water-surface', 'Water surface (sea, lake or pool)', ['water', 'sea', 'lake', 'pool', 'river'], 'effect', (g, x, y, z) => upWaterSurface(g, x, y + .05, z, 8, 8, { shallow: 'all', band: 2 })); }
