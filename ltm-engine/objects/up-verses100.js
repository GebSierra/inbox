// ---------- NEW (verses100-ltm): glory beams, light shining out from behind a place ----------
// upGlory(g, x, y, z, o): a fan of soft shafts of light radiating from one point (the source sits behind a tent, a rock, a doorway), with a
// glow at the source. Each shaft is a sprite anchored at the source (sprite.center at its foot), so it always faces the viewer and rotates
// about the source; the fan breathes and sways slowly through the engine's FIRES updaters. Additive, never written to depth, kept out of
// the merge and the ambient-occlusion pass (objects/up-effects.js helpers). Private generator (no R()).
//   Additive warm-gold shafts (over dark trees they glow instead of greying like smoke); set the source low behind the object so it hides the hub.
//   Defaults: eleven even shafts with gaps between them, bright along their length (no bright base or blob at the hub), rising mostly upwards;
//   formerly: nine broad, tall shafts (god-rays) rising mostly upwards; the hub is dim, meant to sit hidden behind the object.
//   o: { n: shafts, len: [min, max] metres, width: [min, max], spread: radians either side of straight up, color, opacity, glow: size of the source glow }
function upGlory(g, x, y, z, o = {}) {
  const G = ufxGroup(g, x, y, z), r = upRng(Math.round(x * 31) ^ Math.round(z * 17) ^ 23);
  const n = o.n || 11, [l0, l1] = o.len || [10, 17], [w0, w1] = o.width || [.35, 1.15], spread = o.spread ?? .8, op = o.opacity ?? .55, col = o.color || '#ffb840';
  // one shaft: bright at its foot, fading to nothing at its tip, soft at both edges
  const tex = UFX.shaft || (UFX.shaft = canvasTex(128, (c, w) => { c.clearRect(0, 0, w, w); const img = c.createImageData(w, w);
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { const u = (i + .5) / w, v = 1 - (j + .5) / w, edge = Math.pow(Math.sin(Math.PI * u), 2.0), fall = Math.pow(1 - v, .55) * Math.min(1, v * 10 + .1);
      const k = (j * w + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * edge * fall); }
    c.putImageData(img, 0, 0); }));
  const shafts = [];
  for (let i = 0; i < n; i++) { const t = n === 1 ? .5 : i / (n - 1), a = -spread + 2 * spread * t + (r() - .5) * .14;
    // a few broad, tall, soft shafts rising mostly upwards (god-rays), varied in width, length and strength: light, not a drawn sunburst
    const s = ufxSprite(G, tex, col, op, o.additive ?? true); s.center.set(.5, 0);
    const len = (l0 + (l1 - l0) * r()) * (1 - .25 * Math.abs(a) / Math.max(spread, .01)) * (i % 2 ? .78 : 1), wd = w0 + (w1 - w0) * r();
    s.scale.set(wd, len, 1); s.material.rotation = a; shafts.push({ s, a, ph: r() * 6.3, sp: .25 + r() * .35, op: op * (.6 + .4 * r()) }); }
  const glowTex = UFX.glow || (UFX.glow = canvasTex(128, (c, w) => { const gr = c.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  const core = ufxSprite(G, glowTex, '#ffd27a', .18, true); core.scale.setScalar(o.glow || 1.2);
  const halo = ufxSprite(G, glowTex, col, .0, true); halo.visible = false;
  FIRES.push({ update(t) { const sway = Math.sin(t * .11) * .03;
    for (const u of shafts) { u.s.material.rotation = u.a + sway; u.s.material.opacity = u.op * (.75 + .25 * Math.sin(t * u.sp + u.ph)); }
    core.material.opacity = .16 + .04 * Math.sin(t * .9); } });
  G.userData.frameBox = [l1 * 1.6, l1]; return y + 1; }

{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'verses100 1.1, 1.3', tags, kind: 'effect' });
  T('glory-beams', 'Glory: shafts of light shining out from behind', ['light', 'glory', 'creation', 'radiance'], (g, x, y, z, o) => upGlory(g, x, y, z, o || {})); }

// ---------- NEW (verses100-ltm 6.1): a garden tomb cut into a rock outcrop, its round stone rolled aside ----------
// upGardenTomb(g, x, y, z): a low cliff of weathered rock with a dressed face, a dark low doorway (front = local +z), the groove the stone
// runs in, and the great round stone rolled back to the right. About 6 m wide, 3.6 m high, 4 m deep. Returns the top. Private generator.
function upGardenTomb(g, x, y, z) {
  const G = new THREE.Group(); G.position.set(x, y, z); g.add(G); const r = upRng(Math.round(x * 7) ^ Math.round(z * 13) ^ 41);
  const rockM = mat('utRock', '#b9ab92'), rockDk = mat('utRockDk', '#9c8f78'), face = mat('utFace', '#cdbfa4'), dark = mat('utDark', '#1d1712'), lime = mat('utLime', '#ddd2bc');
  for (const m of [rockM, rockDk, face, lime]) { m.map = TEX.stone; m.needsUpdate = true; }
  // the outcrop: overlapping weathered boulders behind and round the dressed face
  for (const [bx, by, bz, s, sy] of [[-2.2, .9, -1.2, 1.9, .9], [0, 1.5, -1.6, 2.3, .85], [2.2, .9, -1.2, 1.9, .9], [-1.2, 2.5, -1.4, 1.5, .7], [1.3, 2.4, -1.3, 1.5, .7], [-3, .5, .1, 1.1, .8], [3.1, .5, .2, 1.0, .8]]) {
    const b = add(new THREE.DodecahedronGeometry(s, 1), r() > .4 ? rockM : rockDk, bx, by, bz, G); b.scale.set(1, sy, .8); b.rotation.set(r() * .6, r() * 3, r() * .4); }
  // the dressed face, with a low doorway cut into it and a lintel line
  box(4.4, 2.6, .5, face, 0, 0, .15, G);
  box(1.0, 1.35, .22, dark, -.5, .05, .32, G);                                  // the doorway: dark and low, you would stoop to go in
  box(1.3, .12, .14, lime, -.5, 1.42, .4, G);                                   // the cut lintel
  box(3.6, .14, .34, rockDk, .4, 0, .62, G);                                    // the groove the stone rolls in
  // the round stone, rolled back to the right of the door
  const st = add(new THREE.CylinderGeometry(.95, .95, .38, 22), lime, 1.55, .97, .62, G); st.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(.2, .2, .4, 10), rockDk, 1.55, .97, .63, G).rotation.x = Math.PI / 2;
  // grass and a few plants at the foot of the rock
  for (let k = 0; k < 7; k++) { const s2 = add(new THREE.IcosahedronGeometry(.22 + r() * .18, 0), mat('utLeaf', '#6f8a46'), -2.8 + r() * 5.6, .12, .7 + r() * .4, G); s2.scale.y = .7; }
  return y + 3.6; }
{ const T = (id, label, tags, kind, fn) => defObject(id, fn, { label, origin: 'verses100 6.1', tags, kind });
  T('garden-tomb', 'Garden tomb cut in the rock, the round stone rolled away', ['tomb', 'resurrection', 'garden', 'rock'], 'structure', (g, x, y, z) => upGardenTomb(g, x, y, z)); }

// ---------- NEW (verses100-ltm 7.5): a traveller leaning on his walking stick (the Crossroads, Proverbs 3:5) ----------
// The shared person builder (objects/up-c.js upPerson) in a dusty travelling cloak, the staff in his right hand, the whole figure tilted
// a little onto it, as a tired man rests his weight at a fork in the road.
{ defObject('traveller-with-walking-stick', (g, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p);
    const lean = new THREE.Group(); lean.rotation.z = -.07; lean.rotation.x = .03; p.add(lean);
    upPerson(lean, '#9c8460', { pose: 'stand', prop: 'staff', cloak: '#6e5a40', hair: 2 }); return y + 1.75; },
  { label: 'Traveller leaning on his walking stick', origin: 'verses100 7.5', tags: ['traveller', 'road', 'old', 'staff'], kind: 'person' }); }
