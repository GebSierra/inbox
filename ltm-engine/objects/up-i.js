// ---------- UP-I: batch 3 of the plan's crude-object rebuilds (stool with tablets, open sewing chest, dining couch, basket of fish, cart wheel, flour sack, tall candle) ----------
// Each replaces its builder and registry entry, keeping the id, footprint and top height. The old fish basket drew 18 random numbers;
// the new one draws and discards exactly those 18 before using its own generator. The others drew none and draw none.
const uiWax = () => mat('uiWax', '#2e221a', { roughness: .45, flatShading: false });
const uiFrame = () => mat('uiFrame', '#a98a64', { roughness: .85, map: TEX.wood });
const uiBronze = () => mat('uiBronze', '#9a6a32', { metalness: .65, roughness: .38, flatShading: false });

// ---- stool with wax tablets: a stool with turned, splayed legs and a stretcher, a stack of framed tablets tied with cord, a stylus ----
P.stoolTablets = (g, x, y, z) => { const wk = uhWoodDk(), wd = uhWood(), r = upRng(6203);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) upLimbAdd(g, [x + a * .23, y, z + b * .18], [x + a * .19, y + .42, z + b * .14], .025, .02, wk, 7);
  for (const b of [-1, 1]) box(.38, .03, .03, wk, x, y + .16, z + b * .16, g);
  box(.5, .05, .4, wd, x, y + .42, z, g);
  for (let i = 0; i < 5; i++) { const t = new THREE.Group(); t.position.set(x + (r() - .5) * .03, y + .47 + i * .045, z + (r() - .5) * .03); t.rotation.y = (r() - .5) * .14; g.add(t);
    box(.42, .04, .32, uiFrame(), 0, 0, 0, t); box(.34, .006, .24, uiWax(), 0, .036, 0, t); }
  for (const s of [-1, 1]) box(.012, .24, .012, mat('upCord', '#6a4a2e'), x - .2, y + .46, z + s * .06, g);   // cord through the binding holes
  const st = add(new THREE.CylinderGeometry(.006, .009, .26, 6), mat('stylus', '#d8d8d0', { metalness: .4, roughness: .4 }), x + .05, y + .705, z + .05, g); st.rotation.set(0, .5, Math.PI / 2);
  return y + .75; };
OBJECTS.get('stool-with-tablets').fn = P.stoolTablets;

// ---- open sewing chest: a panelled chest on feet, iron corner straps and a hasp, the lid up on its hinges; inside, folded cloth, spools and shears ----
P.chestOpen = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk(), ir = uhIron(), H = .45, t = .05;
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.07, .05, .07, wk, x + a * .36, y, z + b * .21, g);
  const y0 = y + .05; box(.8, t, .5, wd, x, y0, z, g);
  box(.8, H - .05, t, wd, x, y0, z - .25 + t / 2, g); box(.8, H - .05, t, wd, x, y0, z + .25 - t / 2, g);
  box(t, H - .05, .5 - 2 * t, wd, x - .4 + t / 2, y0, z, g); box(t, H - .05, .5 - 2 * t, wd, x + .4 - t / 2, y0, z, g);
  for (const s of [-1, 1]) { box(.62, .02, .012, wk, x, y0 + .08, z + s * .257, g); box(.62, .02, .012, wk, x, y0 + .32, z + s * .257, g); }   // panel mouldings
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.03, H - .04, .03, ir, x + a * .395, y0, z + b * .245, g);       // iron corner straps
  box(.06, .1, .015, ir, x, y0 + .29, z + .258, g);                                                                            // hasp
  box(.7, .02, .4, mat('chestIn', '#5a3a26'), x, y0 + .06, z, g);
  // contents: folded cloth in two colours, three spools, shears
  box(.32, .1, .3, mat('uiClothR', '#a83c2e', { map: TEX.cloth }), x - .16, y0 + .08, z, g); box(.3, .06, .28, mat('uiClothB', '#3c5f8a', { map: TEX.cloth }), x - .17, y0 + .18, z + .01, g);
  [['#e8d8b0', .12], ['#b8402c', .2], ['#4a7a3a', .28]].forEach(([c, ox]) => { const sp = new THREE.Group(); sp.position.set(x + ox, y0 + .08, z - .08); g.add(sp);
    cyl(.035, .035, .01, 8, wk, 0, 0, 0, sp); cyl(.028, .028, .07, 8, mat('uiThread' + c, c, { flatShading: false }), 0, .01, 0, sp); cyl(.035, .035, .01, 8, wk, 0, .08, 0, sp); });
  for (const s of [-1, 1]) { const b = add(new THREE.BoxGeometry(.16, .008, .025), ir, x + .2, y0 + .09, z + .1 + s * .012, g); b.rotation.y = s * .12; }
  const lid = new THREE.Group(); lid.position.set(x, y + H + .02, z - .25); lid.rotation.x = -1.85; g.add(lid);
  box(.82, .07, .52, wd, 0, 0, .26, lid); box(.7, .015, .4, wk, 0, .07, .26, lid); box(.84, .08, .04, ir, 0, -.005, .5, lid);
  for (const s of [-.3, .3]) box(.06, .02, .08, ir, s, -.01, .02, lid);                                                       // hinges
  return y + .95; };
OBJECTS.get('open-sewing-chest').fn = P.chestOpen;

// ---- dining couch (lectus): turned legs, a frame with a curved headrest, a striped mattress, two cushions and a throw over the end ----
P.couch = (g, x, y, z) => { const wk = uhWoodDk(), wd = uhWood(), br = uiBronze();
  for (const a of [-1, 1]) for (const b of [-1, 1]) uaLathe([[.05, 0], [.035, .06], [.045, .14], [.03, .22], [.05, .28], [.04, .34], [0, .34]], wk, x + a * .68, y, z + b * .28, g, 8);
  box(1.5, .1, .7, wd, x, y + .34, z, g); for (const s of [-1, 1]) box(1.5, .03, .02, br, x, y + .37, z + s * .355, g);           // frame with a bronze edge
  const mat2 = mat('uiMattress', '#ffffff', { roughness: .95, flatShading: false, map: upTex('uiStripe', 64, 64, (c, w, h) => { c.fillStyle = '#e4d6b4'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a3a2a'; for (let i = 0; i < 4; i++) c.fillRect(i * 16, 0, 5, h); c.fillStyle = '#c99a3a'; for (let i = 0; i < 4; i++) c.fillRect(i * 16 + 7, 0, 2, h); }) });
  const mt = add(new THREE.BoxGeometry(1.42, .14, .64, 6, 2, 3), mat2, x, y + .51, z, g); { const p = mt.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, p.getY(i) * (1 - Math.abs(p.getZ(i)) * .9)); mt.geometry.computeVertexNormals(); }
  // the curved headrest (fulcrum) at the left end
  uaTube([[x - .7, y + .44, z - .26], [x - .74, y + .62, z - .2], [x - .66, y + .78, z - .05], [x - .72, y + .84, z + .1]], .035, wk, g, 10);
  uaTube([[x - .7, y + .44, z + .26], [x - .74, y + .62, z + .2], [x - .66, y + .78, z + .05]], .035, wk, g, 10);
  box(.06, .38, .5, wd, x - .71, y + .44, z, g);
  for (const [cx, rz, c] of [[-.5, .3, '#d8b464'], [-.25, .15, '#7a3a5a']]) { const cu = add(new THREE.SphereGeometry(.18, 12, 8), mat('uiCush' + c, c, { flatShading: false, roughness: .9 }), x + cx, y + .66, z - .12, g); cu.scale.set(1.2, .55, 1); cu.rotation.z = rz; }
  const th = add(new THREE.BoxGeometry(.4, .02, .76, 2, 1, 4), mat('uiThrow', '#3c5f8a', { map: TEX.cloth, side: THREE.DoubleSide }), x + .52, y + .6, z, g);
  { const p = th.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const zz = p.getZ(i); if (Math.abs(zz) > .3) p.setY(i, p.getY(i) - (Math.abs(zz) - .3) * 1.2); } th.geometry.computeVertexNormals(); }
  return y + .95; };
OBJECTS.get('dining-couch').fn = P.couch;

// ---- basket of fish: a woven basket with two rope handles, heaped with whole fish (bodies, tails, fins, an eye), a few reeds tucked in ----
P.fish = (g, x, y, z) => { for (let k = 0; k < 18; k++) rnd();                   // the old basket drew 18 random numbers
  const r = upRng(7393), wick = mat('uiWicker', '#c9a46a', { map: TEX.wicker, roughness: 1, side: THREE.DoubleSide });
  uaLathe([[0, 0], [.32, 0], [.38, .06], [.42, .28], [.43, .32], [.41, .33], [.37, .28], [.33, .06], [0, .05]], wick, x, y, z, g, 20);
  uaRing(.425, .025, mat('uiRim', '#9a7448'), x, y + .32, z, g, 20);
  for (const s of [-1, 1]) uaTube([[x + s * .4, y + .28, z - .1], [x + s * .5, y + .36, z], [x + s * .4, y + .28, z + .1]], .015, mat('uhCordL', '#6a4a2e'), g, 8);
  const silver = mat('uiFish', '#aeb9c2', { metalness: .45, roughness: .3, flatShading: false }), back = mat('uiFishBk', '#5d6e7a', { metalness: .3, roughness: .4, flatShading: false }), fin = mat('uiFin', '#8a96a0', { side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) { const f = new THREE.Group(), a = r() * 6.283, d = Math.sqrt(r()) * .26; f.position.set(x + Math.cos(a) * d, y + .3 + (.26 - d) * .35 + r() * .05, z + Math.sin(a) * d); f.rotation.set((r() - .5) * .5, r() * 6.283, (r() - .5) * .4); g.add(f);
    const L = .26 + r() * .1; const b = add(new THREE.SphereGeometry(.05, 10, 6), r() < .5 ? silver : back, 0, 0, 0, f); b.scale.set(L / .1, .8, .45);
    const tl = add(new THREE.ConeGeometry(.045, .09, 4), fin, -L * .55, 0, 0, f); tl.rotation.z = Math.PI / 2; tl.scale.set(1, 1, .25);
    const df = add(new THREE.ConeGeometry(.02, .05, 3), fin, 0, .04, 0, f); df.scale.set(1.8, 1, .25);
    add(new THREE.SphereGeometry(.008, 5, 4), mat('uiEye', '#111'), L * .4, .01, .02, f); }
  for (let i = 0; i < 4; i++) { const rd = add(new THREE.CylinderGeometry(.004, .004, .28, 3), mat('uiReed', '#9aa04a'), x + (r() - .5) * .3, y + .4, z + (r() - .5) * .3, g); rd.rotation.set((r() - .5) * 1.6, 0, (r() - .5) * 1.6); }
  return y + .55; };
OBJECTS.get('basket-of-fish').fn = P.fish;

// ---- cart wheel: a felloe rim in segments with an iron tyre, a turned hub with an iron band, eight tapered spokes, a stone chock at its foot ----
P.wheelUp = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk(), ir = uhIron(), R0 = .5, cy = y + .55;
  const rim = add(new THREE.TorusGeometry(R0, .045, 6, 32), wd, x, cy, z, g); rim.scale.z = 1.4;
  add(new THREE.TorusGeometry(R0 + .042, .012, 4, 32), ir, x, cy, z, g).scale.z = 3.2;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; box(.02, .1, .1, wk, x + Math.cos(a) * R0, cy + Math.sin(a) * R0 - .05, z, g).rotation.z = a; }   // felloe joints
  const hub = add(new THREE.CylinderGeometry(.08, .1, .22, 12), wk, x, cy, z, g); hub.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const bd = add(new THREE.TorusGeometry(.095, .012, 4, 14), ir, x, cy, z + s * .07, g); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; upLimbAdd(g, [x + Math.cos(a) * .09, cy + Math.sin(a) * .09, z], [x + Math.cos(a) * (R0 - .03), cy + Math.sin(a) * (R0 - .03), z], .026, .018, wd, 6); }
  const ch = add(new THREE.DodecahedronGeometry(.1, 0), mat('stoneDk'), x + .28, y + .05, z + .08, g); ch.scale.y = .6;
  return y + 1.1; };
OBJECTS.get('cart-wheel').fn = P.wheelUp;

// ---- sack of flour: a rough cloth sack with its neck rolled down, flour heaped inside, a cord, a wooden scoop in the flour, a little spilled ----
P.sackScoop = (g, x, y, z) => { const sack = mat('uiSack', '#cdb48a', { map: TEX.cloth, roughness: 1, side: THREE.DoubleSide, flatShading: false }), wd = uhWood();
  const geo = new THREE.LatheGeometry([[0, 0], [.24, .01], [.31, .1], [.33, .3], [.31, .5], [.27, .58], [.3, .6], [.32, .64], [.3, .66], [.25, .62]].map(([a, b]) => new THREE.Vector2(a, b)), 18);
  { const p = geo.attributes.position, r = upRng(881); for (let i = 0; i < p.count; i++) { const yy = p.getY(i), a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + Math.sin(a * 5 + yy * 6) * .04 + (yy < .3 ? Math.max(0, .3 - yy) * .15 : 0); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } geo.computeVertexNormals(); }
  add(geo, sack, x, y, z, g);
  uaRing(.315, .012, mat('uhCordL', '#6a4a2e'), x, y + .56, z, g, 20);
  const flour = mat('flour', '#f2ece0'); add(new THREE.SphereGeometry(.26, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), flour, x, y + .56, z, g).scale.y = .35;
  const sc = new THREE.Group(); sc.position.set(x + .06, y + .66, z + .02); sc.rotation.set(-.7, .4, 0); g.add(sc);
  uaLathe([[0, 0], [.045, 0], [.06, .05], [.055, .07], [.04, .02], [0, .015]], wd, 0, 0, 0, sc, 10);
  upLimbAdd(sc, [0, .04, 0], [0, .04, .2], .014, .012, wd, 6);
  for (const [dx, dz, s] of [[.3, .2, .1], [.36, .05, .06]]) { const sp = add(new THREE.SphereGeometry(s, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), flour, x + dx, y, z + dz, g); sp.scale.y = .15; }
  return y + .8; };
OBJECTS.get('flour-sack').fn = P.sackScoop;

// ---- tall candle: a bronze candlestick (round foot, knopped stem, drip pan), a beeswax candle with drips, a flame ----
COL_INLINE.tallCandle = (g, x, y, z) => { const br = uiBronze(), wax = mat('beeswax', '#f0d080', { flatShading: false, roughness: .6 });
  uaLathe([[.22, 0], [.24, .02], [.2, .05], [.08, .09], [.05, .14], [.07, .17], [.04, .2], [.045, .27], [.13, .3], [.14, .33], [.12, .34], [.05, .33], [0, .33]], br, x, y, z, g, 18);
  cyl(.065, .07, .47, 16, wax, x, y + .33, z, g);
  const r = upRng(1319); for (let i = 0; i < 5; i++) { const a = r() * 6.283, h = .08 + r() * .2, d = add(new THREE.CylinderGeometry(.012, .016, h, 6), wax, x + Math.cos(a) * .066, y + .8 - h / 2 - .02, z + Math.sin(a) * .066, g); }
  add(new THREE.CylinderGeometry(.004, .004, .03, 4), mat('uiWick', '#2a2018'), x, y + .815, z, g);
  flame(g, x, y + .82, z, 1.3); return y + 1.0; };
OBJECTS.get('tall-candle').fn = COL_INLINE.tallCandle;
