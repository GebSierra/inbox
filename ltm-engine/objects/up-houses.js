// ---------- UPGRADE: Near-Eastern mud-brick houses (plan item L3, look change waiting for the owner) ----------
// James's houses come from TN.neHouse (james-ltm/world/town-ne.js) through HOOKS.house. When the theme says "houses": "dressed"
// (or the page has ?houses=dressed), this wraps that hook: the original house is built first, drawing exactly the random numbers it always
// did, and then dressed with things that draw none (a private generator seeded by position): a mud-plaster skin with large-scale blotches
// and a darker damp base course, a framed and recessed doorway with a threshold, lintels and sills on the windows, wooden water spouts
// through the parapet, and a reed mat or a small heap of firewood by some doors.
function uhoPlaster(base, key) { return mat('uhoWall' + key, '#ffffff', { roughness: .97, map: upTex('uhoPlaster' + key, 256, 256, (c, w, h, r) => {
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { const a = .02 + r() * .045; c.fillStyle = r() < .55 ? `rgba(90,60,30,${a})` : `rgba(255,248,230,${a})`; c.beginPath(); c.ellipse(r() * w, r() * h, 16 + r() * 60, 10 + r() * 40, r() * 3, 0, 7); c.fill(); }
  for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(70,50,30,${r() * .12})`; c.fillRect(r() * w, r() * h, 1.5, 1.5); }
  c.strokeStyle = 'rgba(80,56,32,.18)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 18; y += 6 + r() * 10; c.lineTo(x, y); } c.stroke(); }   // hairline cracks
  const gr = c.createLinearGradient(0, h * .78, 0, h); gr.addColorStop(0, 'rgba(70,45,25,0)'); gr.addColorStop(1, 'rgba(70,45,25,.22)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) }); }
function uhoDress(g, w, d, floors) {
  if (!g || !g.isObject3D) return g;
  const r = upRng(Math.round(g.position.x * 977) ^ Math.round(g.position.z * 7919) ^ 0x4e45), wallMs = [0, 1, 2, 3, 4].map(i => M['neWall' + i]).filter(Boolean);
  const beam = M.neBeam || mat('neBeam', '#6e4a2a'), dark = mat('uhoBase', '#8e7656', { roughness: 1 }), H = 3.2 * floors;
  // the walls get a plaster skin in their own colour; the boxes' faces each carry the whole texture, so it is drawn at a large scale
  const wins = [], doors = [];
  g.children.slice().forEach(o => { if (!o.isMesh) return; const k = wallMs.indexOf(o.material);
    if (k >= 0) o.material = uhoPlaster('#' + o.material.color.getHexString(), k);
    else if (o.material === M.neWin) wins.push(o); else if (o.material === M.neDoor && o.position.y < 1.6) doors.push(o); });   // (boxes are centred: a ground-floor door's centre is about 1 m up)
  box(w + .05, .42, d + .05, dark, 0, 0, 0, g);                                                       // damp base course
  for (const dr of doors) { const x = dr.position.x, z0 = d / 2;
    for (const s of [-1, 1]) box(.16, 2.25, .26, beam, x + s * .62, 0, z0 + .06, g);                  // jambs proud of the wall
    box(1.5, .12, .5, mat('uhoStep', '#b8a27c', { roughness: 1 }), x, 0, z0 + .25, g);               // threshold step
    if (r() < .45) { const mt = add(new THREE.PlaneGeometry(1.1, .7), mat('uhoMat', '#c9a660', { side: THREE.DoubleSide, roughness: 1 }), x + .1, .125, z0 + .9, g); mt.rotation.x = -Math.PI / 2; }
    else if (r() < .5) for (let i = 0; i < 5; i++) { const lg = add(new THREE.CylinderGeometry(.05, .05, .7, 5), mat('uhoLog', '#7a5a3a'), x + .95, .07 + (i > 2 ? .1 : 0), z0 + .35 + (i % 3) * .1, g); lg.rotation.z = Math.PI / 2; } }
  for (const wn of wins) { const p = wn.position.clone(); p.y -= (wn.geometry.parameters?.height || .9) / 2;   // the window's bottom edge
    // the window box lies on a wall face; put a lintel above and a sill below, a little proud of the wall
    const isFront = Math.abs(Math.abs(p.z) - d / 2) < .2, out = isFront ? Math.sign(p.z) : 0;
    if (isFront) { box(.95, .12, .2, beam, p.x, p.y + .92, p.z + out * .08, g); box(.85, .06, .18, dark, p.x, p.y - .06, p.z + out * .07, g); }
    else { box(.2, .12, .95, beam, p.x - .08, p.y + .92, p.z, g); box(.18, .06, .85, dark, p.x - .07, p.y - .06, p.z, g); } }
  // water spouts through the front parapet
  const ns = w > 5 ? 2 : 1; for (let i = 0; i < ns; i++) { const sx = ns === 1 ? (r() - .5) * w * .4 : (i ? 1 : -1) * w * .3;
    const sp = add(new THREE.BoxGeometry(.14, .1, .6), beam, sx, H + .08, d / 2 + .22, g); sp.rotation.x = -.18;
    add(new THREE.PlaneGeometry(.3, .9), mat('uhoStain', '#5a4028', { transparent: true, opacity: .22, depthWrite: false }), sx, H - .5, d / 2 + .012, g); }
  return g; }
{ const q = new URLSearchParams(location.search), want = (THEME.houses || q.get('houses')) === 'dressed';
  if (want && typeof HOOKS !== 'undefined' && HOOKS.house) { const base = HOOKS.house; HOOKS.house = (x, z, w, d, floors = 1, rot = 0) => uhoDress(base(x, z, w, d, floors, rot), w, d, floors); } }
// library preview (the library page only): the James house dressed, beside the plain one
if (/\/library\//.test(location.pathname)) defObject('mud-brick-house-dressed', (g, x, y, z) => viaScene(g, x, y, z, () => { const h = LIB_NE.neHouse(0, 0, 7, 6, 1, 0); uhoDress(h, 7, 6, 1); }),
  { label: 'Flat-roofed mud-brick house, dressed (option L3)', origin: 'plan L3', tags: ['house', 'town'], kind: 'structure' });
