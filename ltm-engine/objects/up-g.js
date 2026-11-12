// ---------- UP-G: batch 1 of the plan's crude-object rebuilds (brazier, water basin, candelabrum, water trough, signpost, milestone, traveller's pack) ----------
// Each replaces P.<name> and the registry entry, keeping the id, footprint and top height. The old builders drew no random numbers,
// and neither do these (variation, where any, comes from ugRng). Uses up-a's lathe/tube/ring helpers and up-c's upTex/upLimb.
const ugRng = seed => upRng(seed);
const ugBronze = () => mat('ugBronze', '#9a6a32', { metalness: .65, roughness: .38 });
const ugBronzeDk = () => mat('ugBronzeDk', '#5e3e1e', { metalness: .55, roughness: .5 });
const ugMarble = () => mat('ugMarble', '#efe9dc', { roughness: .45, flatShading: false, side: THREE.DoubleSide });
const ugWater = () => mat('ugWater', '#5fa6a4', { roughness: .08, metalness: .1, flatShading: false });
const ugStone = () => mat('ugStone', '#b7aa94', { roughness: .95, map: TEX.stone, side: THREE.DoubleSide });
const ugLeather = () => mat('ugLeather', '#7a4a2a', { roughness: .85, flatShading: false });
const ugLeatherDk = () => mat('ugLeatherDk', '#4a2c18', { roughness: .8, flatShading: false });
const ugCord = () => mat('ugCord', '#c2a678', { roughness: 1 });
// a lion's-paw foot: a pad and three toes, for bronze stands
function ugPaw(g, x, y, z, ry, s, m) { const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; f.scale.setScalar(s); g.add(f);
  add(new THREE.SphereGeometry(.06, 8, 6), m, 0, .03, 0, f).scale.set(1, .7, 1.2);
  for (const t of [-1, 0, 1]) add(new THREE.SphereGeometry(.028, 6, 5), m, t * .035, .018, .07, f); return f; }

// ---- brazier: a bronze tripod on lion's feet, a ring tying the legs, a deep bowl with a rolled rim, glowing coals and fire ----
P.brazier = (g, x, y, z) => { const b = ugBronze(), bd = ugBronzeDk(), H = 1;
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .3, c = Math.cos(a), s = Math.sin(a);
    // each leg bows outward: foot wide, waist in, top under the bowl
    upLimbAdd(g, [x + c * .32, y + .07, z + s * .32], [x + c * .19, y + .55, z + s * .19], .028, .02, b);
    upLimbAdd(g, [x + c * .19, y + .55, z + s * .19], [x + c * .26, y + H - .02, z + s * .26], .02, .024, b);
    ugPaw(g, x + c * .32, y, z + s * .32, Math.atan2(c, s), 1, bd);
    add(new THREE.SphereGeometry(.035, 8, 6), b, x + c * .26, y + H - .02, z + s * .26, g); }
  uaRing(.19, .014, b, x, y + .55, z, g, 18);
  // the bowl: an outer wall, a thick rolled lip, and an inner wall, so it reads as a real vessel from above
  uaLathe([[0, 0], [.16, .01], [.3, .1], [.37, .2], [.39, .24], [.37, .26], [.33, .22], [.25, .14], [0, .1]], b, x, y + H - .05, z, g, 20);
  uaRing(.38, .02, bd, x, y + H + .19, z, g, 22);
  // coals heaped under the flame
  const coal = mat('ugCoal', '#2a1a14', { roughness: 1 }), ember = mat('ugEmber', '#ff6a1e', { emissive: '#ff4a10', emissiveIntensity: 1.4 }), r = ugRng(77);
  for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = r() * .24, e = add(new THREE.IcosahedronGeometry(.04 + r() * .03, 0), i % 3 ? coal : ember, x + Math.cos(a) * d, y + H + .07 + (.24 - d) * .25, z + Math.sin(a) * d, g); e.rotation.set(r() * 3, r() * 3, 0); }
  const f = makeFire(THREE, { scale: .2, light: false }); f.position.set(x, y + H + .16, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return y + 1.7; };
OBJECTS.get('brazier').fn = P.brazier;
// upLimb returns a geometry; this adds it as a mesh
function upLimbAdd(g, a, b, r0, r1, m, seg = 7) { const mesh = new THREE.Mesh(upLimb(a, b, r0, r1, seg, true), typeof m === 'string' ? M[m] : m); mesh.castShadow = mesh.receiveShadow = true; g.add(mesh); return mesh; }

// ---- water basin (labrum): a plinth, a fluted pedestal, a wide marble bowl with a thick rim, water a hand below the rim ----
P.basin = (g, x, y, z) => { const mb = ugMarble();
  box(.42, .06, .42, 'marble', x, y, z, g); box(.36, .04, .36, 'marble', x, y + .06, z, g);
  uaLathe([[.14, 0], [.13, .03], [.1, .05], [.085, .12], [.075, .45], [.085, .55], [.11, .6], [.12, .63], [0, .63]], mb, x, y + .1, z, g, 16);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(.012, .32, .012, mat('ugFlute', '#d9d1c1', { roughness: .6 }), x + Math.cos(a) * .078, y + .23, z + Math.sin(a) * .078, g); }   // flutes
  uaLathe([[0, 0], [.1, 0], [.26, .05], [.38, .14], [.41, .18], [.41, .2], [.37, .2], [.34, .16], [.22, .09], [0, .07]], mb, x, y + .73, z, g, 26);
  cyl(.335, .335, .005, 26, ugWater(), x, y + .885, z, g);
  return y + .98; };
OBJECTS.get('water-basin').fn = P.basin;

// ---- candelabrum: tripod on paws, a slender shaft with knops, a dish on top and three arms, each with an oil lamp and flame ----
P.candelabrum = (g, x, y, z) => { const b = ugBronze(), bd = ugBronzeDk();
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .5, c = Math.cos(a), s = Math.sin(a);
    upLimbAdd(g, [x, y + .16, z], [x + c * .21, y + .05, z + s * .21], .02, .016, b, 6); ugPaw(g, x + c * .23, y, z + s * .23, Math.atan2(c, s), .75, bd); }
  uaLathe([[.045, 0], [.06, .03], [.03, .08], [.02, .1], [0, .1]], b, x, y + .12, z, g, 10);
  uaLathe([[.017, 0], [.012, 1.25], [0, 1.25]], b, x, y + .22, z, g, 8);
  for (const h of [.4, .8, 1.15]) uaLathe([[.014, 0], [.032, .025], [.014, .05], [0, .05]], bd, x, y + .2 + h, z, g, 10);
  uaLathe([[0, 0], [.07, 0], [.11, .03], [.1, .045], [0, .02]], b, x, y + 1.47, z, g, 14);   // the top dish
  for (const [a, h] of [[-.28, 1.45], [0, 1.68], [.28, 1.45]]) {
    if (a) uaTube([[x, y + 1.36, z], [x + a * .45, y + 1.4, z], [x + a * .85, y + h - .1, z], [x + a, y + h - .03, z]], .012, b, g, 10);
    else uaLathe([[.012, 0], [.012, .2], [0, .2]], b, x, y + 1.48, z, g, 6);
    // a little oil lamp: round body, a spout, a handle loop
    const lp = add(new THREE.SphereGeometry(.05, 10, 6), b, x + a, y + h, z, g); lp.scale.set(1, .45, .8);
    const sp = add(new THREE.CylinderGeometry(.012, .02, .06, 6), b, x + a + .05, y + h + .005, z, g); sp.rotation.z = Math.PI / 2;
    uaRing(.02, .006, bd, x + a - .055, y + h + .02, z, g, 8, 0);
    flame(g, x + a + .075, y + h + .01, z, .8); }
  return y + 1.85; };
OBJECTS.get('candelabrum').fn = P.candelabrum;

// ---- water trough: a hollow cut-stone trough on two low feet, chipped corners, water below the rim, a spout block at one end ----
P.trough = (g, x, y, z) => { const st = ugStone(), W = 1.2, D = .55, H = .45, t = .07;
  for (const sx of [-1, 1]) box(.16, .06, D * .9, 'stoneDk', x + sx * W * .34, y, z, g);
  box(W, .07, D, st, x, y + .06, z, g);                                                       // floor
  for (const sz of [-1, 1]) box(W, H - .06, t, st, x, y + .06, z + sz * (D - t) / 2, g);       // long walls
  for (const sx of [-1, 1]) box(t, H - .06, D - 2 * t, st, x + sx * (W - t) / 2, y + .06, z, g);
  box(W + .02, .035, .02, mat('ugRimShade', '#9a8d78'), x, y + H - .035, z + D / 2 - .002, g);   // a worn edge line along the front lip
  const r = ugRng(311); for (const [cx, cz] of [[-1, -1], [1, 1], [1, -1]]) { const c = add(new THREE.IcosahedronGeometry(.05, 0), mat('ugChip', '#cfc4b0'), x + cx * (W / 2 - .02), y + H - .02, z + cz * (D / 2 - .02), g); c.scale.set(1, .5, 1); c.rotation.y = r() * 3; }
  box(W - 2 * t - .01, .01, D - 2 * t - .01, ugWater(), x, y + H - .1, z, g);
  box(.24, H + .32, .14, 'stoneDk', x - W / 2 + .2, y, z - D / 2 - .07, g);                   // the spout block standing behind the back wall
  const sp = add(new THREE.CylinderGeometry(.018, .022, .2, 8), mat('ugIronD', '#3a3632', { metalness: .4 }), x - W / 2 + .2, y + H + .16, z - D / 2 + .1, g); sp.rotation.x = Math.PI / 2;
  return y + .55; };
OBJECTS.get('water-trough').fn = P.trough;

// ---- signpost: a weathered post on a heap of stones, two arrow boards with lettering, a cap on top ----
P.signpost = (g, x, y, z) => { const r = ugRng(53);
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, s = add(new THREE.IcosahedronGeometry(.09 + r() * .05, 0), 'stoneDk', x + Math.cos(a) * .17, y + .05, z + Math.sin(a) * .17, g); s.scale.y = .7; s.rotation.y = r() * 3; }
  box(.11, 2.0, .11, 'wood', x, y, z, g); const cap = add(new THREE.ConeGeometry(.1, .12, 4), 'woodLt', x, y + 2.06, z, g); cap.rotation.y = Math.PI / 4;
  const sign = name => mat('ugBoard' + name, '#ffffff', { roughness: .9, map: upTex('ugSign' + name, 128, 32, (c, w, h) => { c.fillStyle = '#b08458'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(60,40,20,.25)'; for (let i = 0; i < 40; i++) c.fillRect(i * 3.2, 0, 1, h); c.fillStyle = '#3a2614'; c.font = 'bold 19px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2 + 1); }) });
  // two arrow boards pointing to the neighbouring towns, each lettered on its front face only
  for (const [h, ry, dir, name] of [[1.78, .5, 1, 'ΛΑΟΔΙΚΕΙΑ'], [1.45, -.6, -1, 'ΙΕΡΑΠΟΛΙΣ']]) { const arm = new THREE.Group(); arm.position.set(x, y + h, z); arm.rotation.y = ry; g.add(arm);
    const X = v => v * dir, sh = new THREE.Shape(); sh.moveTo(X(-.38), -.1); sh.lineTo(X(.3), -.1); sh.lineTo(X(.42), 0); sh.lineTo(X(.3), .1); sh.lineTo(X(-.38), .1); sh.lineTo(X(-.38), -.1);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: .045, bevelEnabled: false }); geo.translate(0, 0, -.0225);
    const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + .38 * (dir > 0 ? 1 : 0) + (dir < 0 ? .42 : 0)) / .8, (p.getY(i) + .1) / .2);
    geo.clearGroups(); geo.addGroup(0, Infinity, 0);
    const front = new THREE.Mesh(geo, sign(name)); front.castShadow = front.receiveShadow = true; front.position.x = dir * .38; arm.add(front);
    box(.05, .05, .07, 'wood', 0, -.025, 0, arm); }                                           // a peg through the post
  return y + 2.15; };
OBJECTS.get('signpost').fn = P.signpost;

// ---- milestone: a Roman column on a square base, an inscribed band (the miles to the next town), a worn domed top ----
P.milestone = (g, x, y, z) => { const mb = mat('ugMile', '#e4dccb', { roughness: .8, flatShading: false });
  box(.9, .22, .9, 'stoneDk', x, y, z, g); box(.78, .08, .78, 'stone', x, y + .22, z, g);
  uaLathe([[.37, 0], [.38, .05], [.36, .1], [.34, 1.2], [.3, 1.36], [.18, 1.43], [0, 1.45]], mb, x, y + .3, z, g, 20);
  const ins = upTex('ugMileText', 256, 96, (c, w, h, rnd) => { c.fillStyle = '#e4dccb'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(90,80,60,${rnd() * .12})`; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    c.fillStyle = '#5a4a36'; c.textAlign = 'center'; c.font = 'bold 26px serif'; c.fillText('IMP·CAES', w / 2, 34); c.font = 'bold 30px serif'; c.fillText('M·P·XII', w / 2, 74); });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.352, .356, .42, 24, 1, true, -Math.PI / 2.4, Math.PI / 1.2), mat('ugMileBand', '#ffffff', { map: ins, roughness: .8, flatShading: false }));
  band.position.set(x, y + 1.06, z); band.castShadow = band.receiveShadow = true; g.add(band);
  return y + 1.75; };
OBJECTS.get('milestone').fn = P.milestone;

// ---- traveller's pack: a leather satchel with a flap, buckle straps and seams, a rolled blanket tied on top, a water skin at the side ----
COL_INLINE.travellersPack = (g, x, y, z) => { const lt = ugLeather(), ld = ugLeatherDk();
  const body = add(new THREE.BoxGeometry(.55, .46, .3, 2, 2, 2), lt, x, y + .23, z, g); { const p = body.geometry.attributes.position;   // round the box into a soft bag
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i); p.setXYZ(i, px * (1 - Math.abs(py) * .18), py, pz * (1 - Math.abs(px) * .35)); } body.geometry.computeVertexNormals(); }
  body.position.y = y + .23;
  const flap = add(new THREE.BoxGeometry(.5, .025, .32), ld, x, y + .47, z, g); flap.rotation.x = .05;
  box(.5, .2, .02, ld, x, y + .27, z + .155, g);                                                // flap front
  for (const sx of [-.15, .15]) { box(.04, .36, .315, mat('ugStrap', '#3a2212'), x + sx, y + .12, z, g); box(.05, .04, .01, mat('ugBuckle', '#b08a3a', { metalness: .6, roughness: .4 }), x + sx, y + .2, z + .162, g); }
  const roll = add(new THREE.CylinderGeometry(.13, .13, .62, 14), mat('blanketB', '#2f5f9a'), x, y + .63, z, g); roll.rotation.z = Math.PI / 2;
  for (const sx of [-.27, .27]) { const e = add(new THREE.CircleGeometry(.11, 12), mat('ugRollEnd', '#244a78'), x + sx * 1.15, y + .63, z, g); e.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; }
  for (const sx of [-.18, .18]) uaRing(.135, .01, ugCord(), x + sx, y + .63, z, g, 14, 0).rotation.y = Math.PI / 2;
  const sk = add(new THREE.SphereGeometry(.12, 10, 8), mat('ugSkin', '#8a6a44', { flatShading: false, roughness: .7 }), x + .33, y + .16, z + .02, g); sk.scale.set(.6, 1.2, .8);
  add(new THREE.CylinderGeometry(.02, .025, .06, 6), ld, x + .33, y + .3, z + .02, g);
  return y + .8; };
OBJECTS.get('travellers-pack').fn = COL_INLINE.travellersPack;
