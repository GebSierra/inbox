// ---------- UP-J: batch 4 of the plan's crude-object rebuilds (household shrine, bronze hand mirror, cradle, wall shelf of scrolls, stool with a spindle) ----------
// Each replaces its builder and registry entry, keeping the id, footprint and top height; none of the old builders drew random numbers.
// (The gold ingot on its touchstone, also on the plan's list, was already rebuilt in detail for James and is left as it is.)
const ujMarble = () => mat('ujMarble', '#f0ebe0', { roughness: .5, flatShading: false });
const ujPaint = () => mat('ujPaint', '#b8402c', { roughness: .7 });

// ---- household shrine (lararium): a stepped base, a back wall painted with a garland and a serpent, two fluted columns, a pediment,
//      and inside two little figures, an oil lamp burning and an offering dish ----
P.miniTemple = (g, x, y, z) => { const mb = ujMarble(), br = uiBronze();
  box(1.2, .15, .9, 'marble', x, y, z, g); box(1.05, .15, .78, 'marble', x, y + .15, z, g);
  const wall = mat('ujLarWall', '#ffffff', { roughness: .8, map: upTex('ujLarWall', 128, 160, (c, w, h, r) => { c.fillStyle = '#c8573a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8d6b0'; c.fillRect(6, 6, w - 12, h - 12);
    c.strokeStyle = '#4a7a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(14, 30); c.quadraticCurveTo(w / 2, 70, w - 14, 30); c.stroke();   // a garland
    c.fillStyle = '#b8402c'; for (let i = 0; i < 7; i++) { const t = i / 6, xx = 14 + t * (w - 28), yy = 30 + Math.sin(t * Math.PI) * 20; c.beginPath(); c.arc(xx, yy, 3, 0, 7); c.fill(); }
    c.strokeStyle = '#3a4a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(20, h - 22); for (let i = 0; i <= 12; i++) c.lineTo(20 + i * (w - 40) / 12, h - 34 + Math.sin(i * 1.3) * 9); c.stroke();   // the guardian serpent
    c.fillStyle = '#3a4a2a'; c.beginPath(); c.arc(w - 20, h - 34 + Math.sin(12 * 1.3) * 9, 5, 0, 7); c.fill(); }) });
  box(.9, 1.05, .1, mb, x, y + .3, z - .3, g); const face = add(new THREE.PlaneGeometry(.78, .95), wall, x, y + .82, z - .248, g); face.receiveShadow = true;
  for (const sx of [-.33, .33]) { uaLathe([[.08, 0], [.075, .04], [.06, .06], [.055, .88], [.07, .92], [.085, .95], [0, .95]], mb, x + sx, y + .3, z + .25, g, 12);
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; box(.008, .78, .008, mat('ujFlute', '#d8d0c0'), x + sx + Math.cos(a) * .058, y + .38, z + .25 + Math.sin(a) * .058, g); } }
  box(.95, .14, .7, mb, x, y + 1.3, z, g); box(.98, .03, .73, ujPaint(), x, y + 1.38, z, g);
  const pd = gableRoof(.85, .62, .28, mb, x, y + 1.44, z, 0, g); pd.scale.set(.6, 1, .75);
  add(new THREE.SphereGeometry(.05, 8, 6), br, x, y + 1.75, z + .3, g);
  // inside: two dancing household gods (lares) in bronze, a lamp, an offering dish with fruit
  for (const s of [-1, 1]) { const f = new THREE.Group(); f.position.set(x + s * .17, y + .3, z - .12); f.rotation.y = -s * .3; g.add(f);
    box(.08, .03, .08, mb, 0, 0, 0, f); uaLathe([[.045, 0], [.03, .12], [.022, .2], [0, .2]], br, 0, .03, 0, f, 8); add(new THREE.SphereGeometry(.025, 8, 6), br, 0, .25, 0, f);
    upLimbAdd(f, [0, .2, 0], [s * .07, .27, .02], .007, .006, br, 5); }
  const lp = add(new THREE.SphereGeometry(.045, 10, 6), mat('clay'), x, y + .33, z + .05, g); lp.scale.set(1.3, .45, .9); flame(g, x + .055, y + .34, z + .05, .7);
  uaLathe([[0, 0], [.06, 0], [.08, .02], [0, .015]], br, x + .02, y + .3, z + .2, g, 12);
  for (const [dx, dz, c] of [[0, .2, '#b8402c'], [.04, .22, '#e0a040']]) add(new THREE.SphereGeometry(.022, 8, 6), mat('ujFruit' + c, c, { flatShading: false }), x + dx, y + .33, z + dz, g);
  return y + 1.8; };
OBJECTS.get('mini-temple').fn = P.miniTemple;

// ---- bronze hand mirror on a stand: a footed wooden base, a turned post with a cradle, the mirror's polished disc with a
//      bevelled rim, a decorated back and a handle, propped at an angle, a comb and a small flask beside it ----
OBJECTS.get('bronze-hand-mirror').fn = (g, x, y, z) => { const wk = uhWoodDk(), br = uiBronze();
  const polish = mat('ujPolish', '#e6c48a', { metalness: .35, roughness: .22, flatShading: false, emissive: '#4a3214', emissiveIntensity: .5 });   // polished bronze: kept light, as there is nothing for a true mirror to reflect
  box(.8, .1, .5, wk, x, y, z, g); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.08, .03, .08, wk, x + a * .34, y - .02, z + b * .2, g);
  uaLathe([[.09, 0], [.07, .05], [.05, .1], [.045, .5], [.07, .54], [.05, .6], [0, .6]], wk, x, y + .1, z, g, 10);
  const cy0 = y + 1.2, m = new THREE.Group(); m.position.set(x, cy0, z); m.rotation.x = -.15; g.add(m);
  const disc = add(new THREE.CylinderGeometry(.44, .44, .03, 40), polish, 0, 0, 0, m); disc.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(.445, .03, 6, 40), br, 0, 0, 0, m);
  const back = add(new THREE.CircleGeometry(.4, 32), mat('ujMirBack', '#ffffff', { metalness: .6, roughness: .4, side: THREE.DoubleSide, map: upTex('ujMirBack', 128, 128, (c, w, h) => { c.fillStyle = '#8a5a26'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c99a4a'; c.lineWidth = 3; for (const rr of [56, 44, 20]) { c.beginPath(); c.arc(w / 2, h / 2, rr, 0, 7); c.stroke(); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 32, h / 2 + Math.sin(a) * 32, 4, 0, 7); c.fill(); } }) }), 0, 0, -.017, m);
  back.rotation.y = Math.PI;
  uaLathe([[.035, 0], [.025, .06], [.03, .1], [.022, .28], [.035, .32], [0, .32]], br, 0, -.76, 0, m, 10);                       // the handle, resting in the post
  uaTube([[-.12, -.58, .02], [-.08, -.48, .02], [0, -.45, .02], [.08, -.48, .02], [.12, -.58, .02]], .014, br, m, 10);            // the cradle
  // a bone comb and a little perfume flask on the base
  const cb = new THREE.Group(); cb.position.set(x - .24, y + .1, z + .12); cb.rotation.y = .4; g.add(cb); box(.14, .012, .05, mat('ujBone', '#e8dcc0'), 0, 0, 0, cb);
  for (let i = 0; i < 9; i++) box(.006, .01, .03, mat('ujBone', '#e8dcc0'), -.06 + i * .015, 0, .035, cb);
  uaLathe([[0, 0], [.03, 0], [.04, .04], [.012, .08], [.012, .11], [.02, .12], [0, .12]], mat('ujFlask', '#4a8a9a', { roughness: .2, metalness: .1, flatShading: false }), x + .26, y + .1, z + .1, g, 10);
  return cy0 + .56; };

// ---- cradle: a wooden cradle on rockers, turned corner posts with knobs, spindled sides, a hood at the head, a mattress, a blanket and a rattle ----
P.cradle2 = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk();
  for (const sx of [-1, 1]) { const rk = add(new THREE.TorusGeometry(.6, .025, 5, 20, .9), wk, x + sx * .28, y + .62, z, g); rk.rotation.set(0, Math.PI / 2, Math.PI * 1.5 - .45); }   // rockers
  box(.8, .04, .5, wd, x, y + .16, z, g);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { uaLathe([[.025, 0], [.022, .4], [.03, .42], [0, .42]], wk, x + a * .38, y + .08, z + b * .23, g, 8); add(new THREE.SphereGeometry(.035, 8, 6), wk, x + a * .38, y + .52, z + b * .23, g); }
  for (const sz of [-1, 1]) { box(.76, .03, .03, wd, x, y + .2, z + sz * .23, g); box(.76, .03, .03, wd, x, y + .44, z + sz * .23, g);
    for (let i = -4; i <= 4; i++) uaLathe([[.009, 0], [.014, .1], [.009, .21], [0, .21]], wd, x + i * .08, y + .22, z + sz * .23, g, 6); }
  for (const sx of [-1, 1]) box(.03, .28, .46, wd, x + sx * .38, y + .2, z, g);
  const hood = add(new THREE.CylinderGeometry(.27, .27, .2, 14, 1, true, 0, Math.PI), mat('ujHood', '#9a6a40', { side: THREE.DoubleSide, map: TEX.wood }), x - .28, y + .44, z, g); hood.rotation.set(0, 0, Math.PI / 2);   // axis along x, the half-round arching over the head end
  box(.72, .06, .42, mat('ujMat', '#efe6d0', { map: TEX.cloth }), x, y + .2, z, g);
  const bl = add(new THREE.BoxGeometry(.5, .03, .46, 3, 1, 3), mat('babyblanket', '#d9a640', { map: TEX.cloth, side: THREE.DoubleSide }), x + .1, y + .29, z, g);
  { const p = bl.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const zz = p.getZ(i); if (Math.abs(zz) > .18) p.setY(i, p.getY(i) - (Math.abs(zz) - .18) * .7); } bl.geometry.computeVertexNormals(); }
  add(new THREE.SphereGeometry(.07, 10, 8), mat('ujPillow', '#f4ece0', { flatShading: false }), x - .25, y + .3, z, g).scale.set(.8, .5, 1.3);
  const rt = new THREE.Group(); rt.position.set(x + .22, y + .33, z - .1); rt.rotation.z = .4; g.add(rt);
  add(new THREE.SphereGeometry(.03, 8, 6), mat('clay'), 0, .05, 0, rt); upLimbAdd(rt, [0, -.04, 0], [0, .03, 0], .008, .008, wd, 5);
  return y + .7; };
OBJECTS.get('cradle').fn = P.cradle2;

// ---- wall shelf of scrolls: two uprights, two shelves on carved brackets, scrolls with knobs and tags stacked in a pigeonhole rack, a capsa (scroll bucket) below ----
P.wallShelf = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk();
  for (const sx of [-.48, .48]) box(.06, 1.92, .06, wk, x + sx, y, z - .15, g);
  for (const h of [1.05, 1.55]) { box(1.0, .05, .42, wd, x, y + h, z, g); box(1.0, .04, .02, wk, x, y + h + .01, z + .21, g);
    for (const sx of [-.4, .4]) uaTube([[x + sx, y + h - .24, z - .17], [x + sx, y + h - .1, z - .1], [x + sx, y + h - .02, z + .1]], .02, wk, g, 8); }
  box(1.0, .05, .08, wd, x, y + 1.9, z - .15, g);
  const pap = mat('ujScroll', '#ffffff', { roughness: .9, flatShading: false, map: upTex('ujScroll', 64, 32, (c, w, h, r) => { c.fillStyle = '#e8d6a8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(120,90,40,${r() * .15})`; c.fillRect(0, r() * h, w, 1); } }) });
  const knob = mat('ujKnob', '#3a2414'), tags = ['#b8402c', '#3c5f8a', '#c99a3a', '#4a7a3a'], r = upRng(3917);
  for (const [h, n] of [[1.08, 7], [1.58, 6]]) for (let i = 0; i < n; i++) { const row = i % 2, col = Math.floor(i / 2), sx = x - .32 + col * .2 + row * .1, sy = y + h + .06 + row * .1, L = .34 + r() * .06;
    const sc = add(new THREE.CylinderGeometry(.05, .05, L, 10), pap, sx, sy, z - .02, g); sc.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) { const kn = add(new THREE.CylinderGeometry(.018, .018, .03, 8), knob, sx, sy, z - .02 + s * (L / 2 + .015), g); kn.rotation.x = Math.PI / 2; }
    if (r() < .6) box(.04, .05, .005, mat('ujTag' + i % 4, tags[i % 4]), sx, sy - .07, z - .02 + L / 2 - .01, g); }
  // a leather scroll bucket on the floor with three scrolls standing in it
  const lt = mat('ujCapsa', '#6a3e22', { roughness: .8, flatShading: false }); uaLathe([[.15, 0], [.16, .02], [.17, .4], [.18, .42], [0, .42]], lt, x + .2, y, z + .05, g, 14);
  uaRing(.172, .01, uhBrass(), x + .2, y + .3, z + .05, g, 16);
  for (let i = 0; i < 3; i++) { const a = i * 2.1; const sc = add(new THREE.CylinderGeometry(.045, .045, .55, 10), pap, x + .2 + Math.cos(a) * .07, y + .45, z + .05 + Math.sin(a) * .07, g); sc.rotation.set(Math.sin(a) * .12, 0, Math.cos(a) * .12); }
  return y + 1.95; };
OBJECTS.get('wall-shelf-of-scrolls').fn = P.wallShelf;

// ---- stool with a spindle: a three-legged stool, on it a distaff wound with a fluffy cloud of wool and a drop spindle hanging from a thread, a basket of spun yarn at its foot ----
P.stoolSpindle = (g, x, y, z) => { const wd = uhWood(), wk = uhWoodDk(), wool = mat('ujWool', '#f2ece0', { roughness: 1, flatShading: false });
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + .5; upLimbAdd(g, [x + Math.cos(a) * .24, y, z + Math.sin(a) * .17], [x + Math.cos(a) * .16, y + .55, z + Math.sin(a) * .12], .024, .02, wk, 6); }
  const seat = add(new THREE.CylinderGeometry(.27, .26, .06, 18), wd, x, y + .55, z, g); seat.scale.z = .75;
  // the distaff lies across the seat; its wool head hangs a little over the edge
  const ds = add(new THREE.CylinderGeometry(.012, .016, .55, 6), wd, x - .02, y + .62, z, g); ds.rotation.z = Math.PI / 2 - .12;
  for (const [dx, dy, s] of [[.2, .66, .12], [.27, .69, .09], [.15, .7, .08], [.23, .74, .07]]) add(new THREE.IcosahedronGeometry(s, 2), wool, x + dx, y + dy, z, g);
  // the drop spindle hangs from a thread off the front of the seat, the spun yarn wound on its shaft
  const sx = x - .18, sz = z + .18; box(.003, .2, .003, wool, sx, y + .38, sz, g);
  upLimbAdd(g, [sx, y + .14, sz], [sx, y + .38, sz], .008, .006, wd, 5);
  uaLathe([[0, 0], [.04, 0], [.045, .015], [0, .02]], wk, sx, y + .15, sz, g, 12);                                               // the whorl
  add(new THREE.SphereGeometry(.03, 10, 8), mat('ujYarn', '#e6dcc6', { flatShading: false }), sx, y + .24, sz, g).scale.set(1, 1.6, 1);
  // a small basket of yarn balls at the foot
  uaLathe([[0, 0], [.1, 0], [.12, .08], [.115, .09], [.1, .015], [0, .01]], mat('uiWicker', '#c9a46a', { map: TEX.wicker, side: THREE.DoubleSide }), x + .3, y, z + .12, g, 14);
  for (const [dx, dz, c] of [[.27, .1, '#e6dcc6'], [.33, .14, '#b8402c'], [.3, .16, '#3c5f8a']]) add(new THREE.SphereGeometry(.045, 10, 8), mat('ujBall' + c, c, { flatShading: false }), x + dx, y + .08, z + dz, g);
  return y + .9; };
OBJECTS.get('stool-with-spindle').fn = P.stoolSpindle;
