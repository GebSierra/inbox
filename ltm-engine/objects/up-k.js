// ---------- UP-K: the heavier weak objects (plan section 3B, second list): the two-faced herm, the fishing net on poles, the small boat,
// the half-round bench (exedra), the small agora altar. Each replaces its registry entry (and P.<name> where it has one), keeping the
// footprint and top height. None of the old builders here drew random numbers; these draw from private generators.
// (The woman with a water jar is rebuilt on upPerson in objects/colossae-shared.js, so the town and the library share it.)
const ukMarble = () => mat('ukMarble', '#f2ede2', { roughness: .45, flatShading: false });
const ukMarbleDk = () => mat('ukMarbleDk', '#cfc6b4', { roughness: .6, flatShading: false });

// ---- two-faced herm: a moulded base, a tapering square shaft with the herm's shoulder stubs, a Janus head looking both ways:
//      each face with brow, eyes, nose, lips, a curled beard, and curled hair running over the crown ----
function ukJanusFace(g, s, mb, dk) {          // s = +1 front, -1 back; the face looks along +z*s
  const f = new THREE.Group(); f.rotation.y = s > 0 ? 0 : Math.PI; g.add(f); const r = upRng(s > 0 ? 71 : 113);
  add(new THREE.SphereGeometry(.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * .6), mb, 0, .04, .1, f).scale.set(1.05, 1.15, .7);       // the face's front surface
  add(new THREE.BoxGeometry(.2, .03, .05), mb, 0, .1, .17, f);                                                                // brow ridge
  for (const e of [-1, 1]) { add(new THREE.SphereGeometry(.022, 8, 6), mb, e * .05, .07, .175, f).scale.set(1.2, .7, .5);
    add(new THREE.SphereGeometry(.009, 6, 4), dk, e * .05, .07, .184, f); }                                                    // eyelids and pupils
  const nose = add(new THREE.ConeGeometry(.024, .09, 4), mb, 0, .03, .19, f); nose.rotation.x = .25; nose.scale.set(1, 1, .7);
  add(new THREE.BoxGeometry(.06, .012, .02), mat('ukLip', '#d8cbb4'), 0, -.03, .175, f);
  // a full beard of curls, from the cheeks down to a rounded point
  for (let i = 0; i < 26; i++) { const t = i / 26, a = (t - .5) * 2.6, yy = -.02 - Math.abs(Math.cos(a)) * .09 - r() * .03;
    add(new THREE.IcosahedronGeometry(.022 + r() * .01, 0), mb, Math.sin(a) * .1, yy, .1 + Math.cos(a) * .07, f); }
  for (let i = 0; i < 6; i++) add(new THREE.IcosahedronGeometry(.024, 0), mb, (r() - .5) * .07, -.14 - r() * .04, .14, f);
  for (let i = 0; i < 10; i++) { const a = (i / 9 - .5) * 2.4; add(new THREE.IcosahedronGeometry(.026, 0), mb, Math.sin(a) * .115, .15 + Math.cos(a) * .02, .06 + Math.cos(a) * .05, f); }   // forelock curls
  return f; }
OBJECTS.get('two-faced-herm').fn = (g, x, y, z) => { const mb = ukMarble(), md = ukMarbleDk(), dk = mat('ukEye', '#5a5040');
  box(.8, .12, .7, md, x, y, z, g); box(.7, .06, .6, mb, x, y + .12, z, g);
  // the shaft tapers to the top, square in section
  const sh = add(new THREE.CylinderGeometry(.22, .26, 1.32, 4), mat('ukMarbleF', '#f2ede2', { roughness: .45, flatShading: true }), x, y + .84, z, g); sh.rotation.y = Math.PI / 4; sh.scale.set(1.15, 1, 1);
  for (const s of [-1, 1]) box(.12, .12, .14, mb, x + s * .24, y + 1.38, z, g);                                                 // shoulder stubs
  box(.5, .05, .44, md, x, y + 1.5, z, g); box(.44, .06, .38, mb, x, y + 1.55, z, g);                                         // the capital
  add(new THREE.CylinderGeometry(.09, .11, .16, 10), mb, x, y + 1.66, z, g);                                                   // neck
  const hd = new THREE.Group(); hd.position.set(x, y + 1.93, z); hd.scale.setScalar(1.45); g.add(hd);
  add(new THREE.SphereGeometry(.15, 16, 12), mb, 0, 0, 0, hd).scale.set(.95, 1.1, 1.15);
  ukJanusFace(hd, 1, mb, dk); ukJanusFace(hd, -1, mb, dk);
  const r = upRng(331); for (let i = 0; i < 18; i++) { const a = r() * Math.PI, b = (r() - .5) * 2.2; add(new THREE.IcosahedronGeometry(.03, 0), mb, Math.sin(b) * .14, .1 + Math.sin(a) * .06, Math.cos(a) * .14, hd); }   // hair over the crown
  return y + 2.2; };

// ---- fishing net on poles: two leaning poles, a cord between them, a net hanging in loose catenary sags with a real mesh,
//      cork floats on the head-rope and stone sinkers along the foot ----
P.net = (g, x, y, z) => { const wd = uhWood(), cord = mat('ukCord', '#8a7454', { roughness: 1 });
  for (const s of [-1, 1]) upLimbAdd(g, [x + s * .55, y, z + .05], [x + s * .5, y + 1.3, z], .03, .025, wd, 6);
  uaTube([[x - .5, y + 1.25, z], [x, y + 1.2, z], [x + .5, y + 1.25, z]], .007, cord, g, 10);
  const net = mat('ukNet', '#ffffff', { transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: 1, map: upTex('ukNet', 128, 128, (c, w, h) => { c.clearRect(0, 0, w, h);
    c.strokeStyle = '#6a5a40'; c.lineWidth = 2.2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + 64, h); c.stroke(); c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 - 64, h); c.stroke(); } }) });
  net.map.wrapS = net.map.wrapT = THREE.RepeatWrapping; net.map.repeat.set(4, 4);
  const geo = new THREE.PlaneGeometry(1, 1.05, 12, 10), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i) + .525, sag = Math.cos(u * Math.PI) * .04 * (1 - v);   // hangs from the top, bellies out a little at the bottom
    p.setXYZ(i, u, v - (1 - Math.cos(u * Math.PI * 1.1)) * .04, sag + Math.sin(u * 9 + v * 4) * .012); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, net); m.position.set(x, y + .18, z); m.castShadow = true; g.add(m);
  const cork = mat('ukCork', '#c9a46a'), stone = mat('stoneDk');
  for (let i = 0; i < 6; i++) { const u = -.42 + i * .168; add(new THREE.CylinderGeometry(.025, .025, .04, 8), cork, x + u, y + 1.21, z + .01, g).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 7; i++) { const u = -.45 + i * .15; add(new THREE.IcosahedronGeometry(.022, 0), stone, x + u, y + .2 - (1 - Math.cos(u * Math.PI * 1.1)) * .04, z + .03, g); }
  return y + 1.3; };
OBJECTS.get('fishing-net').fn = P.net;

// ---- small boat: a planked hull (rising bow and stern, ribs, thwarts, gunwale), oars laid across, a coil of rope and a jar ----
P.boat = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk(), L = 1.9, W = .86, H = .38;
  const hullM = mat('ukHull', '#ffffff', { side: THREE.DoubleSide, roughness: .9, map: upTex('ukPlanks', 64, 128, (c, w, h, r) => { c.fillStyle = '#8a5a34'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(${r() < .5 ? '255,230,190' : '40,24,12'},${.05 + r() * .08})`; c.fillRect(0, i * 16, w, 16); c.fillStyle = 'rgba(30,18,8,.6)'; c.fillRect(0, i * 16 + 15, w, 1); } }) });
  // hull shell: rings across the length, each a U whose half-width and depth follow the boat's lines
  const N = 14, S = 10, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) { const t = i / N, u = t * 2 - 1, hw = W / 2 * Math.pow(Math.max(0, 1 - u * u), .6), rise = .1 * u * u * u * u * 1.6, dep = H * (1 - .5 * u * u);
    for (let k = 0; k <= S; k++) { const a = (k / S) * Math.PI; pos.push(Math.cos(a) * hw, H + rise - Math.sin(a) * dep, u * L / 2); uv.push(k / S, t); } }
  for (let i = 0; i < N; i++) for (let k = 0; k < S; k++) { const a = i * (S + 1) + k, b = a + 1, c = a + S + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); hg.setIndex(idx); hg.computeVertexNormals();
  const hull = new THREE.Mesh(hg, hullM); hull.position.set(x, y, z); hull.castShadow = hull.receiveShadow = true; g.add(hull);
  for (const s of [-1, 1]) uaTube(Array.from({ length: 9 }, (_, i) => { const u = i / 8 * 2 - 1; return [x + s * W / 2 * Math.pow(Math.max(0, 1 - u * u), .6), y + H + .1 * Math.pow(u, 4) * 1.6 + .01, z + u * L / 2]; }), .018, wk, g, 16);   // gunwales
  for (const u of [-.5, -.1, .3, .6]) { const hw = W / 2 * Math.pow(1 - u * u, .6) * .92; uaTube(Array.from({ length: 7 }, (_, k) => { const a = k / 6 * Math.PI; return [x + Math.cos(a) * hw, y + H - Math.sin(a) * H * (1 - .5 * u * u) * .95, z + u * L / 2]; }), .012, wk, g, 10); }   // ribs
  for (const u of [-.25, .35]) box(W * .82 * Math.pow(1 - u * u, .6), .03, .12, wd, x, y + H - .1, z + u * L / 2, g);                 // thwarts
  for (const s of [-1, 1]) { const oar = new THREE.Group(); oar.position.set(x + s * .12, y + H - .06, z + .05); oar.rotation.set(0, s * .08, 0); g.add(oar);
    upLimbAdd(oar, [0, 0, -.7], [0, 0, .5], .014, .014, wd, 6); box(.09, .012, .26, wd, 0, -.006, .62, oar); }
  uaRing(.08, .018, mat('ukCord', '#8a7454'), x, y + .12, z - .55, g, 14); uaRing(.05, .018, mat('ukCord', '#8a7454'), x, y + .15, z - .55, g, 12);
  uaLathe([[0, 0], [.04, 0], [.07, .06], [.06, .13], [.03, .16], [.035, .18], [0, .17]], mat('clay'), x + .15, y + .1, z + .55, g, 10);
  return y + .41; };
OBJECTS.get('small-boat').fn = P.boat;
