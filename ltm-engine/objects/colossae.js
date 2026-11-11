// ---------- OBJECT LIBRARY: Colossae's market, temple, house and bridge props ----------
// Every builder has the signature (g, x, y, z, ...extra) => topY and works in g's local coordinates; see objects/james.js for the contract.
// They live in the table P (P.basket, P.loom2, ...) because the Colossae stalls and interiors call them directly; the registry at the end of
// this part gives each one a stable library id, a label, an origin and tags, so that books/<book>.json rooms can name them and the
// library preview page (ltm-engine/library/) can show them.
function iron() { return mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }); } function bronze() { return mat('bronze', '#9a6a2a', { metalness: .55, roughness: .4 }); }
var P; P = {
  basket: (g, x, y, z, c, n = 12) => { cyl(.42, .32, .32, 8, 'basket', x, y, z, g); for (let i = 0; i < n; i++) add(new THREE.IcosahedronGeometry(.11, 0), mat('f' + c, c), x + R(-.25, .25), y + .36 + R(0, .14), z + R(-.25, .25), g); return y + .55; },
  scale: (g, x, y, z) => { box(.08, .9, .08, 'wood', x, y, z, g); box(.9, .05, .05, 'dark', x, y + .88, z, g); for (const s of [-1, 1]) { cyl(.18, .14, .05, 8, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x + s * .42, y + .5, z, g); box(.01, .38, .01, 'dark', x + s * .42, y + .52, z, g); } return y + .95; },
  crates: (g, x, y, z) => { box(.6, .45, .5, 'woodLt', x, y, z, g); box(.5, .4, .45, 'wood', x + .05, y + .45, z, g).rotation.y = .3; return y + .9; },
  // Burlap sack of grain, low-poly: a lumpy, slumped belly (lathe profile pushed about by fixed waves, no random numbers so the town's
  // seeded layout is untouched), gathered pleats into a neck tied with a rope (knot and two loose ends), then a floppy pleated mouth,
  // tipped a little, whose edge folds over and hangs down round a heap of grain in colour c. About 0.65 wide and 0.72 tall; returns y + .7.
  sack: (g, x, y, z, c = '#e2c46a') => {
    const V = (pts) => pts.map(([a, b]) => new THREE.Vector2(a, b)), burlap = mat('sackBurlap', '#c4a476'), rope = mat('sackRope', '#7d5f3a');
    const body = new THREE.LatheGeometry(V([[0, 0], [.22, 0], [.29, .03], [.315, .1], [.31, .19], [.285, .29], [.23, .38], [.155, .45], [.1, .5]]), 12);
    const p = body.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), t = py / .5, a = Math.atan2(pz, px), s = Math.sin(Math.PI * Math.min(t, 1));
      const k = 1 + (.08 * Math.sin(3 * a + 1.3) + .045 * Math.sin(5 * a + .4)) * s + .06 * Math.cos(2 * a) * (1 - t)  // lumpy belly, sagging foot
        + .28 * Math.cos(6 * a) * t ** 3;                                                                                // pleats gathered at the neck
      p.setXYZ(i, px * k + .03 * t * t, py * (1 - .06 * Math.cos(a - .6) * t), pz * k * .93); }                 // slumps and leans a little
    body.computeVertexNormals(); add(body, burlap, x, y, z, g);
    const top = new THREE.Group(); top.position.set(x + .03, y + .47, z); top.rotation.set(.06, 0, -.1); g.add(top);   // neck and mouth, tipped
    const band = add(new THREE.TorusGeometry(.102, .03, 4, 10), rope, 0, .03, 0, top); band.rotation.x = Math.PI / 2;  // rope band round the neck
    add(new THREE.IcosahedronGeometry(.045, 0), rope, .13, .03, .04, top);                                            // the knot
    for (const [dz, rz, h] of [[.02, -.2, .16], [.08, -.6, .12]]) { const e = add(new THREE.CylinderGeometry(.016, .011, h, 4), rope, .15 + h * .2, -.04, dz, top); e.rotation.z = rz; }
    const prof = [[.09, 0], [.1, .05], [.14, .1], [.18, .135], [.215, .14], [.235, .11], [.225, .07]], W = [0, .2, .5, .8, 1, 1, 1];  // flare, then the folded-over hem
    const mouth = new THREE.LatheGeometry(V(prof), 18), q = mouth.attributes.position;
    for (let i = 0; i < q.count; i++) { const a = Math.atan2(q.getZ(i), q.getX(i)), u = W[i % prof.length], f = 1 + (.12 * Math.cos(9 * a) + .08 * Math.sin(2 * a + 1)) * u;  // floppy pleats
      q.setXYZ(i, q.getX(i) * f, q.getY(i) + (.03 * Math.sin(3 * a + .5) - .015 * Math.cos(9 * a)) * u, q.getZ(i) * f); }
    mouth.computeVertexNormals(); add(mouth, mat('sackBurlapIn', '#c4a476', { side: THREE.DoubleSide }), 0, 0, 0, top);
    const heap = add(new THREE.SphereGeometry(.17, 9, 3, 0, Math.PI * 2, 0, Math.PI / 2), mat('grain' + c, c), 0, .08, 0, top); heap.scale.y = .85;  // heaped grain
    return y + .7; },
  bigJar: (g, x, y, z, c = 'clay', s = 1) => { const m = add(new THREE.LatheGeometry([[0, 0], [.12, .01], [.2, .06], [.28, .22], [.31, .4], [.3, .6], [.24, .78], [.15, .88], [.1, .95], [.13, 1], [.14, 1.03]].map(([a, b]) => new THREE.Vector2(a * s, b * s)), 16), c, x, y, z, g); return y + 1.05 * s; },
  honey: (g, x, y, z) => { const t = P.bigJar(g, x, y, z, mat('honey', '#d9a43a', { roughness: .4 }), .6); add(new THREE.SphereGeometry(.09, 6, 4), mat('honeyDrip', '#f0b840', { roughness: .2 }), x + .14, y + .5, z, g); return t; },
  vat: (g, x, y, z, c) => { cyl(.38, .33, .5, 10, 'wood', x, y, z, g); cyl(.33, .33, .03, 10, mat('dye' + c, c, { roughness: .2 }), x, y + .48, z, g); box(.04, .7, .04, 'woodLt', x + .15, y + .3, z, g).rotation.z = .5; return y + .8; },
  rack: (g, x, y, z) => { for (const s of [-1, 1]) box(.06, 1.4, .06, 'wood', x + s * .5, y, z, g); box(1.1, .05, .05, 'wood', x, y + 1.38, z, g); ['#c94a3a', '#e0b44a', '#3f6f9a'].forEach((c, i) => box(.28, .8, .02, mat('w' + c, c), x - .33 + i * .33, y + .58, z, g)); return y + 1.45; },
  bolts: (g, x, y, z) => { ['#7a3b6a', '#3f6f9a', '#c94a3a', '#e0b44a'].forEach((c, i) => { const b = add(new THREE.CylinderGeometry(.12, .12, .8, 8), mat('w' + c, c), x, y + .12 + (i % 2) * .22 + (i > 1 ? .22 : 0), z + (i % 2 ? .13 : -.13), g); b.rotation.z = Math.PI / 2; }); return y + .7; },
  wool: (g, x, y, z) => { cyl(.4, .32, .35, 8, 'basket', x, y, z, g); for (let i = 0; i < 5; i++) add(new THREE.IcosahedronGeometry(.17, 0), 'wool', x + R(-.2, .2), y + .4, z + R(-.2, .2), g); return y + .6; },
  loom: (g, x, y, z) => { for (const s of [-1, 1]) box(.07, 1.5, .07, 'wood', x + s * .45, y, z, g); box(1, .07, .07, 'wood', x, y + 1.45, z, g); box(.8, 1.1, .02, mat('loomcloth', '#9a4a3a'), x, y + .3, z, g); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(.05, 5, 3), 'clay', x - .35 + i * .14, y + .2, z + .05, g); return y + 1.55; },
  scrolls: (g, x, y, z) => { box(.9, .05, .35, 'wood', x, y, z, g); box(.9, .05, .35, 'wood', x, y + .36, z, g); for (const sx of [-.43, .43]) box(.04, .72, .35, 'wood', x + sx, y, z, g); for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const s = add(new THREE.CylinderGeometry(.06, .06, .62, 8), mat('papyrus', '#e8d6a8'), x + R(-.05, .05), y + .11 + r * .36 + i * .0, z - .1 + i * .07, g); s.rotation.z = Math.PI / 2 + R(-.08, .08); s.position.y += (i % 2) * .1; for (const e of [-1, 1]) { const k = add(new THREE.CylinderGeometry(.025, .025, .06, 6), 'wood', s.position.x + e * .34, s.position.y, s.position.z, g); k.rotation.z = Math.PI / 2; } } return y + .78; },
  desk: (g, x, y, z) => upDesk(g, x, y, z),
  tablets: (g, x, y, z) => upTablets(g, x, y, z),
  lamps: (g, x, y, z) => { box(.05, 1.2, .05, 'dark', x, y, z, g); box(.6, .04, .04, 'dark', x, y + 1.18, z, g); for (const s of [-1, 0, 1]) { box(.01, .25, .01, 'dark', x + s * .27, y + .95, z, g); add(new THREE.SphereGeometry(.09, 6, 4), mat('lamp', '#e2b062', { emissive: '#a86a1a', emissiveIntensity: .6 }), x + s * .27, y + .9, z, g); } return y + 1.25; },
  chest: (g, x, y, z) => { box(.6, .38, .4, 'wood', x, y, z, g); box(.62, .06, .42, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x, y + .38, z, g); for (let i = 0; i < 5; i++) cyl(.05, .05, .02, 8, mat('coin', '#e0b84a', { metalness: .7, roughness: .3 }), x + R(-.2, .2), y + .45 + i * .02, z, g); return y + .55; },
  wheel: (g, x, y, z) => { cyl(.12, .12, .5, 6, 'wood', x, y, z, g); cyl(.4, .4, .07, 12, 'woodLt', x, y + .5, z, g); P.bowl(g, x, y + .57, z); return y + .75; },
  bowl: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.14, 0], [.2, .1], [.22, .16]].map(([a, b]) => new THREE.Vector2(a, b)), 9), mat('wetclay', '#9a5a3a', { side: THREE.DoubleSide }), x, y, z, g); return y + .2; },
  kiln: (g, x, y, z) => { const d = add(new THREE.SphereGeometry(.55, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 'clay', x, y, z, g); box(.3, .3, .1, mat('ember', '#ff8a3a', { emissive: '#c84a10', emissiveIntensity: 1 }), x, y + .05, z + .5, g); return y + .6; },
  bowlStack: (g, x, y, z) => { const m = mat('bowlStackClay', '#b9693f', { side: THREE.DoubleSide }); for (let i = 0; i < 5; i++) { add(new THREE.LatheGeometry([[0, 0], [.14, 0], [.2, .1], [.22, .14]].map(([a, b2]) => new THREE.Vector2(a, b2)), 9), m, x, y + i * .06, z, g); } return y + .4; },  // double-sided: a lathe is a single wall, so the far side and inside vanished from the back
  jarPyramid: (g, x, y, z) => { for (let i = 0; i < 3; i++) amph(g, x - .3 + i * .3, z, .45); g.children.slice(-3).forEach(o => o.position.y = y); for (let i = 0; i < 2; i++) amph(g, x - .15 + i * .3, z, .45); g.children.slice(-2).forEach(o => o.position.y = y + .6); return y + 1.2; },
  clay: (g, x, y, z) => { add(new THREE.DodecahedronGeometry(.3, 0), mat('wetclay', '#9a5a3a'), x, y + .22, z, g).scale.y = .7; box(.3, .03, .1, 'woodLt', x + .3, y, z, g); return y + .45; },
  press: (g, x, y, z) => { cyl(.35, .38, .3, 9, 'stone', x, y, z, g); box(.08, .7, .08, 'wood', x, y + .3, z, g); box(.8, .07, .07, 'wood', x, y + .95, z, g); cyl(.2, .2, .03, 9, mat('juice', '#8a1f2a', { roughness: .2 }), x, y + .3, z, g); return y + 1; },
  cage: (g, x, y, z) => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(.015, .55, .015, 'dark', x + Math.cos(a) * .22, y, z + Math.sin(a) * .22, g); } add(new THREE.SphereGeometry(.24, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), 'wood', x, y + .55, z, g); const b = add(new THREE.IcosahedronGeometry(.09, 0), mat('bird', '#e0b44a'), x, y + .25, z, g); b.scale.set(1.4, 1, 1); return y + .85; },
  herbs: (g, x, y, z) => { box(.9, .04, .04, 'wood', x, y + 1.1, z, g); for (let i = 0; i < 4; i++) { box(.01, .2, .01, 'straw', x - .33 + i * .22, y + .9, z, g); add(new THREE.ConeGeometry(.08, .3, 5), i % 2 ? 'leaf' : 'green', x - .33 + i * .22, y + .72, z, g).rotation.x = Math.PI; } return y + 1.15; },
  rackJars: (g, x, y, z) => { box(1, .06, .5, 'wood', x, y + .55, z, g); for (const s of [-1, 1]) box(.06, .9, .5, 'wood', x + s * .48, y, z, g); for (let i = 0; i < 3; i++) { amph(g, x - .3 + i * .3, z, .55); g.children[g.children.length - 1].position.y = y + .58; } return y + 1.2; },
  cups: (g, x, y, z) => { box(.6, .04, .4, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x, y, z, g); for (let i = 0; i < 4; i++) cyl(.06, .045, .12, 7, 'clay', x - .18 + (i % 2) * .36, y + .04, z + (i > 1 ? .1 : -.1), g); return y + .2; },
  skin: (g, x, y, z) => { const s = add(new THREE.IcosahedronGeometry(.3, 1), 'cloak', x, y + .3, z, g); s.scale.set(1.3, .8, .8); add(new THREE.ConeGeometry(.06, .2, 5), 'dark', x + .4, y + .38, z, g).rotation.z = -1.2; return y + .55; },
  sign: (g, c) => { box(.06, .5, .06, 'wood', 0, 2.3, 1.85, g); const sg = box(1.1, .45, .06, mat('sign' + c, c), 0, 1.95, 1.9, g); return 0; },
};
Object.assign(P, {
  scrollRack: (g, x, y, z) => { for (const sx of [-.42, .42]) for (const sz of [-.15, .15]) box(.05, 1.25, .05, 'woodLt', x + sx, y, z + sz, g); for (const h of [.05, .45, .85]) { box(.9, .04, .34, 'woodLt', x, y + h, z, g); for (let i = 0; i < 6; i++) { const sc = add(new THREE.CylinderGeometry(.055, .055, .42, 8), mat('scrollC', '#c8a070'), x - .3 + (i % 3) * .3, y + h + .06 + (i > 2 ? .1 : 0), z - .06 + (i > 2 ? .1 : 0), g); sc.rotation.z = Math.PI / 2; } } return y + 1.3; },
  stoolTablets: (g, x, y, z) => { box(.5, .05, .4, 'woodLt', x, y + .42, z, g); for (const [a, b] of [[-.2, -.15], [.2, -.15], [-.2, .15], [.2, .15]]) box(.05, .42, .05, 'wood', x + a, y, z + b, g); for (let i = 0; i < 6; i++) box(.42, .035, .32, i % 2 ? 'woodLt' : 'wood', x, y + .47 + i * .04, z, g); return y + .75; },
  dovesBig: (g, x, y, z) => { const t = P.cageStack(g, x, y, z); for (const dx of [-.3, -.1, .1, .3]) { if (realBird(g, x + dx, t, z + R(-.08, .08), .42, R(0, 6))) continue; const d = new THREE.Group(); d.position.set(x + dx, t, z + R(-.08, .08)); d.rotation.y = R(-.6, .6); d.scale.setScalar(.8); g.add(d); add(new THREE.IcosahedronGeometry(.09, 1), mat('dove', '#ffffff'), 0, .08, 0, d).scale.set(1.5, 1, 1); add(new THREE.IcosahedronGeometry(.055, 1), mat('dove', '#ffffff'), .12, .16, 0, d); add(new THREE.ConeGeometry(.015, .05, 4), mat('beak', '#e0a03a'), .18, .16, 0, d).rotation.z = -Math.PI / 2; } return t + .35; },
  garland: (g, x, y, z) => UD.garland(g, x, y, z),
  wreath: (g, x, y, z) => UD.wreath(g, x, y, z),
  wineJugs: (g, x, y, z) => { for (const [dx, dz, sc] of [[-.25, 0, .65], [.2, .1, .55], [0, -.25, .5]]) { const j = new THREE.Group(); j.position.set(x + dx, y, z + dz); g.add(j); amph(j, 0, 0, sc); } // spilled wine: an irregular, lobed puddle (fixed sine wobble, no random numbers, so the town's seeded layout is untouched),
    // longer one way than the other, with a few splashed drops around it
    const wine = mat('wineSpill', '#6a1a2a', { roughness: .2 }), pts = [];
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r = .3 * (1 + .16 * Math.sin(3 * a + .7) + .1 * Math.sin(5 * a + 2.1) + .06 * Math.sin(9 * a + .3) + .05 * Math.sin(13 * a + 1.2));
      pts.push(new THREE.Vector2(Math.cos(a) * r * 1.2, Math.sin(a) * r * .85)); }
    const puddle = new THREE.ShapeGeometry(new THREE.Shape(pts)); puddle.rotateX(-Math.PI / 2); add(puddle, wine, x, y + .01, z + .3, g);
    for (const [dx, dz, s] of [[.4, .12, .035], [.36, .42, .025], [-.3, .45, .03], [.1, .55, .02]]) cyl(s, s, .02, 7, wine, x + dx, y + .01, z + dz, g);
    return y + .95; },
  brazier: (g, x, y, z) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, l = box(.05, 1, .05, bronze(), x + Math.cos(a) * .22, y, z + Math.sin(a) * .22, g); l.rotation.z = Math.cos(a) * .15; } add(new THREE.LatheGeometry([[0, 0], [.22, .02], [.34, .18], [.36, .24]].map(([a, b]) => new THREE.Vector2(a, b)), 14), bronze(), x, y + 1, z, g);
    const f = makeFire(THREE, { scale: .2, light: false }); f.position.set(x, y + 1.16, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return y + 1.7; },
  offerings: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.2, 0], [.32, .08], [.34, .12]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat('bowlM', '#e9dcc0', { side: THREE.DoubleSide, map: TEX.pot }), x, y, z, g);
    for (let i = 0; i < 8; i++) add(new THREE.IcosahedronGeometry(.07, 1), mat('fr' + ['#c43a2e', '#e0b44a', '#5b2a5c'][i % 3], ['#c43a2e', '#e0b44a', '#5b2a5c'][i % 3], { flatShading: false }), x + R(-.18, .18), y + .12 + (i > 5 ? .08 : 0), z + R(-.18, .18), g); return y + .3; },
  padlockChest: (g, x, y, z) => { box(1.0, .5, 1.0, 'marble', x, y, z, g); box(1.1, .1, 1.1, 'marble', x, y + .5, z, g); const t = P.bigChest(g, x, y + .6, z);
    const gold = mat('gold', '#e0b84a', { metalness: .8, roughness: .3 }); box(.42, .42, .12, gold, x, y + .9, z + .42, g); { const pl = new THREE.PointLight('#ffd9a0', 3, 4, 1.5); pl.position.set(x, y + 2, z + 1); g.add(pl); } const sh = add(new THREE.TorusGeometry(.11, .035, 6, 12, Math.PI), gold, x, y + 1.12, z + .4, g);
    for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) { const lk = add(new THREE.TorusGeometry(.05, .015, 4, 8), gold, x + sd * (.12 + i * .08), y + 1.02 - i * .06, z + .38, g); lk.rotation.y = i % 2 ? Math.PI / 2 : 0; } return t + .1; },
  plaque: (g, x, y, z) => { const c = document.createElement('canvas'); c.width = 256; c.height = 96; const k = c.getContext('2d'); k.fillStyle = '#d8ccb4'; k.fillRect(0, 0, 256, 96); k.fillStyle = '#5a4a3a'; k.font = 'bold 30px Georgia'; k.textAlign = 'center'; k.fillText('ΦΙΛΟΣΟΦΙΑ', 128, 42); k.fillText('ΕΣΤΙ ΒΙΟΥ', 128, 80);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; },
  cageStack: (g, x, y, z) => { let t = y; for (const [dx, dy] of [[-.25, 0], [.25, 0], [0, .62]]) { const c = new THREE.Group(); c.position.set(x + dx, y + dy, z); g.add(c);
      box(.5, .04, .4, 'wood', 0, 0, 0, c); box(.5, .04, .4, 'wood', 0, .56, 0, c); for (let i = 0; i < 6; i++) for (const zz of [-.19, .19]) box(.015, .56, .015, 'woodLt', -.23 + i * .092, 0, zz, c);
      if (!realBird(c, 0, .05, 0, .42, R(0, 6))) { const b = add(new THREE.IcosahedronGeometry(.1, 1), mat('dove', '#f4f1ea'), 0, .14, 0, c); b.scale.set(1.5, 1, 1); add(new THREE.IcosahedronGeometry(.06, 1), mat('dove', '#f4f1ea'), .13, .24, 0, c); } t = Math.max(t, y + dy + .62); } return t; },
  birdPerch: (g, x, y, z) => { box(.06, 1.3, .06, 'wood', x, y, z, g); box(.7, .05, .05, 'wood', x, y + 1.25, z, g);
    for (const dx of [-.25, 0, .25]) { if (realBird(g, x + dx, y + 1.28, z, .42, R(0, 6))) continue; add(new THREE.IcosahedronGeometry(.09, 1), mat('dove', '#f4f1ea'), x + dx, y + 1.36, z, g).scale.set(1.4, 1, 1); add(new THREE.IcosahedronGeometry(.055, 1), mat('dove', '#f4f1ea'), x + dx + .1, y + 1.45, z, g); add(new THREE.ConeGeometry(.015, .04, 4), mat('beak', '#e0a03a'), x + dx + .16, y + 1.45, z, g).rotation.z = -Math.PI / 2; } return y + 1.55; },
  coinTable: (g, x, y, z) => { box(.8, .06, .55, 'woodLt', x, y + .7, z, g); for (const [a, b] of [[-.35, -.22], [.35, -.22], [-.35, .22], [.35, .22]]) box(.05, .7, .05, 'wood', x + a, y, z + b, g);
    for (let st = 0; st < 5; st++) for (let i = 0; i < 3 + st % 3; i++) cyl(.05, .05, .015, 10, mat('coin', '#e0b84a', { metalness: .7, roughness: .3 }), x - .25 + st * .12, y + .76 + i * .016, z - .1 + (st % 2) * .15, g); box(.2, .1, .14, mat('leather', '#7a4a2a'), x + .25, y + .76, z + .12, g); return y + .9; },
  bigChest: (g, x, y, z) => { box(1.1, .6, .65, 'wood', x, y, z, g); const lid = add(new THREE.CylinderGeometry(.33, .33, 1.1, 12, 1, false, 0, Math.PI), 'wood', x, y + .6, z, g); lid.rotation.z = Math.PI / 2;  // half-pipe lid: its length runs along the chest's length (x), arch up
    for (const k of [-.4, 0, .4]) { box(.07, .62, .67, mat('brass', '#b8893a', { metalness: .55, roughness: .35 }), x + k, y - .01, z, g); const st = add(new THREE.TorusGeometry(.335, .03, 4, 12, Math.PI), mat('brass', '#b8893a'), x + k, y + .6, z, g); st.rotation.y = Math.PI / 2; }
    box(.22, .26, .06, iron(), x, y + .4, z + .34, g); const lk = add(new THREE.TorusGeometry(.07, .02, 5, 10), iron(), x, y + .32, z + .37, g); return y + 1.0; },
  ropeBarrier: (g, x, y, z) => { for (const sx of [-.5, .5]) { cyl(.06, .08, .9, 8, bronze(), x + sx, y, z, g); add(new THREE.SphereGeometry(.07, 8, 5), bronze(), x + sx, y + .95, z, g); }
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(x - .5 + t, y + .85 - Math.sin(t * Math.PI) * .2, z)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .025, 5), mat('ropeRed', '#9a2a20'), 0, 0, 0, g); return y + 1.05; },
  figBowl: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.18, 0], [.3, .05], [.4, .16], [.44, .26], [.42, .27]].map(([a, b]) => new THREE.Vector2(a, b)), 18), mat('bowlM', '#e9dcc0', { side: THREE.DoubleSide, map: TEX.pot, flatShading: false, roughness: .6 }), x, y, z, g);
    const fig = new THREE.LatheGeometry([[0, 0], [.05, .01], [.085, .05], [.09, .09], [.07, .13], [.03, .17], [.015, .2]].map(([a, b]) => new THREE.Vector2(a, b)), 9);
    for (let i = 0; i < 9; i++) { const f = add(fig, mat('figM', '#5b2a5c', { flatShading: false, roughness: .5 }), x + R(-.25, .25), y + .16 + (i > 5 ? .1 : 0), z + R(-.2, .2), g); f.rotation.set(R(-.6, .6), R(0, 6), R(-.6, .6)); }
    for (const k of [-1, 1]) { const h = add(new THREE.SphereGeometry(.085, 9, 6, 0, Math.PI), mat('figCut', '#c4505a'), x + .5 + k * .12, y + .02, z + .25, g); h.rotation.x = -Math.PI / 2; h.scale.z = .5; } return y + .35; },
  barrel: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.28, 0], [.33, .2], [.35, .4], [.33, .6], [.28, .8], [0, .8]].map(([a, b]) => new THREE.Vector2(a, b)), 14), 'wood', x, y, z, g); for (const h of [.12, .4, .68]) { const r = h === .4 ? .355 : .31; const t = add(new THREE.TorusGeometry(r, .018, 4, 16), mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }), x, y + h, z, g); t.rotation.x = Math.PI / 2; } return y + .82; },
  plank: (g, x, y, z, r = 0) => { const b = box(1.4, .05, .22, 'woodLt', x, y, z, g); b.rotation.y = r; return y + .05; },
});
P.chest = (g, x, y, z) => { box(.7, .4, .45, 'wood', x, y, z, g); const lid = add(new THREE.CylinderGeometry(.225, .225, .7, 10, 1, false, 0, Math.PI), 'wood', x, y + .4, z, g); lid.rotation.z = Math.PI / 2;  // half-pipe lid: its length runs along the chest's length (x), arch up
  for (const k of [-.24, 0, .24]) { box(.05, .42, .47, mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }), x + k, y - .005, z, g); const st = add(new THREE.TorusGeometry(.228, .02, 4, 10, Math.PI), mat('iron', '#3c3a38'), x + k, y + .4, z, g); st.rotation.y = Math.PI / 2; }
  box(.1, .12, .03, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x, y + .32, z + .24, g); return y + .65; };
P.bucket = (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.2, 0], [.25, .42], [.24, .44], [0, .44]].map(([a, b]) => new THREE.Vector2(a, b)), 14), 'wood', x, y, z, g); for (const h of [.08, .34]) { const t = add(new THREE.TorusGeometry(h > .2 ? .245 : .21, .016, 4, 16), mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }), x, y + h, z, g); t.rotation.x = Math.PI / 2; }
  cyl(.22, .22, .02, 14, mat('dyeBlue', '#2f5f9a', { roughness: .2 }), x, y + .38, z, g); const hd = add(new THREE.TorusGeometry(.24, .012, 4, 12, Math.PI), mat('iron', '#3c3a38'), x, y + .44, z, g); hd.rotation.z = .3; return y + .7; };
P.bolts = (g, x, y, z) => UD.bolts(g, x, y, z);
const _basket = P.basket; P.basket = (g, x, y, z, c, n = 12) => {
  if (MODELS.stall) { const top = placePart(g, 'stall', 'Cylinder133', x, y, z, .62, R(0, 6)); for (let i = 0; i < n; i++) { const a = R(0, Math.PI * 2), r2 = R(0, .1); add(new THREE.IcosahedronGeometry(.07, 1), mat('f' + c + 's', c, { flatShading: false, roughness: .5 }), x + Math.cos(a) * r2, top - .04 + (i % 3) * .045, z + Math.sin(a) * r2, g); } return top; } const t = _basket(g, x, y, z, c, n); const rim = add(new THREE.TorusGeometry(.42, .03, 5, 16), 'basket', x, y + .32, z, g); rim.rotation.x = Math.PI / 2; return t; };
Object.assign(P, {
  bed: (g, x, y, z) => { box(1, .4, 1.7, 'woodLt', x, y, z, g); box(.9, .2, 1.6, 'wool', x, y + .4, z, g); box(.7, .15, .35, mat('pillow', '#e8dcc4'), x, y + .6, z - .6, g); box(.93, .07, .9, mat('blanket', '#3f6f9a'), x, y + .6, z + .3, g); return y + .75; },
  cradle: (g, x, y, z) => { box(.55, .35, .85, 'wood', x, y + .14, z, g); for (const s of [-1, 1]) { const r = box(.08, .1, 1, 'woodLt', x + s * .22, y, z, g); } box(.45, .1, .5, mat('babyblanket', '#e0b44a'), x, y + .49, z + .1, g); return y + .65; },
  basin: (g, x, y, z) => { cyl(.08, .14, .75, 6, 'marble', x, y, z, g); add(new THREE.LatheGeometry([[0, 0], [.18, 0], [.32, .12], [.36, .2]].map(([a, b]) => new THREE.Vector2(a, b)), 10), mat('basinM', '#e9e2d4', { side: THREE.DoubleSide }), x, y + .75, z, g); cyl(.3, .3, .02, 10, mat('basinW', '#8fd8d4', { roughness: .1 }), x, y + .88, z, g); return y + .98; },
  couch: (g, x, y, z) => { box(1.5, .45, .7, 'wood', x, y, z, g); box(1.5, .5, .15, 'wood', x, y + .45, z - .28, g);   // wooden frame, same wood as the sewing chest
    const pil = add(new THREE.SphereGeometry(.22, 10, 7), mat('pillowCouch', '#d8b464'), x - .4, y + .56, z - .08, g); pil.scale.set(1.25, .5, 1); pil.rotation.x = -.25; return y + .95; },   // a soft, rounded cushion leaning on the back
  lyre: (g, x, y, z) => { box(.12, .5, .12, 'wood', x, y, z, g); box(.55, .15, .2, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x, y + .5, z, g); for (const s of [-1, 1]) { const a = box(.07, .7, .07, mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), x + s * .22, y + .62, z, g); a.rotation.z = -s * .25; } box(.62, .05, .05, 'wood', x, y + 1.27, z, g); for (let i = -2; i <= 2; i++) box(.01, .65, .01, 'wool', x + i * .07, y + .64, z, g); return y + 1.32; },
  table: (g, x, y, z, c = '#c43a2e') => { cyl(.06, .1, .62, 6, 'wood', x, y, z, g); cyl(.5, .5, .06, 10, 'woodLt', x, y + .62, z, g); return P.basket(g, x, y + .68, z, c, 9); },
  pot: (g, x, y, z) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const l = box(.05, .5, .05, 'dark', x + Math.cos(a) * .3, y, z + Math.sin(a) * .3, g); } cyl(.42, .34, .45, 10, mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }), x, y + .35, z, g); cyl(.38, .38, .03, 10, mat('stew', '#7a4a22'), x, y + .78, z, g); box(.3, .1, .3, mat('ember', '#ff8a3a', { emissive: '#c84a10', emissiveIntensity: 1 }), x, y, z, g); return y + .85; },
  spindle: (g, x, y, z) => { box(.5, .45, .5, 'wood', x, y, z, g); cyl(.02, .02, .9, 5, 'woodLt', x, y + .45, z, g); add(new THREE.IcosahedronGeometry(.18, 0), 'wool', x, y + 1.05, z, g); return y + 1.25; },
  shrine: (g, x, y, z) => { box(.75, 1, .5, 'stone', x, y, z, g); box(.7, .6, .45, 'wallTrim', x, y + 1, z, g); for (const s of [-1, 1]) cyl(.04, .04, .6, 6, 'marble', x + s * .3, y + 1, z + .24, g); gableRoof(.7, .45, .25, 'marble', x, y + 1.6, z, 0, g); add(new THREE.IcosahedronGeometry(.1, 0), mat('bronze', '#7a5230'), x, y + 1.25, z, g); return y + 1.9; },
  tripod: (g, x, y, z) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const l = box(.04, 1, .04, mat('bronze', '#7a5230', { metalness: .4, roughness: .5 }), x + Math.cos(a) * .18, y, z + Math.sin(a) * .18, g); l.rotation.z = Math.cos(a) * .15; l.rotation.x = -Math.sin(a) * .15; } cyl(.25, .15, .15, 9, mat('bronze', '#7a5230', { metalness: .4, roughness: .5 }), x, y + 1, z, g); add(new THREE.ConeGeometry(.12, .5, 6), mat('smoke', '#d8d4cc'), x, y + 1.4, z, g); return y + 1.65; },
  boat: (g, x, y, z) => { const L = .95, W = .4, H = .34, hull = mat('boatWood', '#8a5a34', { side: THREE.DoubleSide });
    // an open hull: at each station along the length, a floor and two sides flaring up to the gunwales; bow and stern rise to points
    const pos = [], idx = [], N = 14, S = [];
    const V = (a, b, c) => { pos.push(a, b, c); return pos.length / 3 - 1; };
    for (let i = 0; i <= N; i++) { const t = -1 + 2 * i / N, e = Math.abs(t), zz = t * L, fl = .05 + .16 * e * e, bw = W * .72 * (1 - e ** 3) + .02, tp = H + .12 * e ** 3, wd = W * (1 - e ** 4);
      S.push({ bl: V(-bw, fl, zz), br: V(bw, fl, zz), tl: V(-wd, tp, zz), tr: V(wd, tp, zz) }); }
    for (let i = 0; i < N; i++) { const p = S[i], q = S[i + 1];
      idx.push(p.bl, p.br, q.br, p.bl, q.br, q.bl);     // floor
      idx.push(p.br, p.tr, q.tr, p.br, q.tr, q.br);     // starboard side
      idx.push(p.tl, q.bl, p.bl, p.tl, q.tl, q.bl); }   // port side
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, hull, x, y, z, g);
    box(.72, .04, .1, 'woodLt', x, y + .27, z - .35, g); box(.72, .04, .1, 'woodLt', x, y + .27, z + .35, g);   // two thwarts (seats)
    const oar = box(.05, .05, 1.8, 'woodLt', x + .36, y + .37, z, g); oar.rotation.y = .1; return y + .45; },
  net: (g, x, y, z) => { for (const s of [-1, 1]) box(.07, 1.3, .07, 'wood', x + s * .55, y, z, g); const n = box(1.1, .9, .03, mat('netM', '#6f6250'), x, y + .4, z, g); n.rotation.x = .12; for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(.05, 5, 3), 'cork', x - .45 + i * .3, y + .4, z + .05, g); return y + 1.35; },
  fish: (g, x, y, z) => { cyl(.42, .32, .32, 8, 'basket', x, y, z, g); for (let i = 0; i < 6; i++) { const f = add(new THREE.IcosahedronGeometry(.1, 0), mat('fishM', '#b8c4cc', { metalness: .4, roughness: .3 }), x + R(-.2, .2), y + .38, z + R(-.2, .2), g); f.scale.set(2.4, .6, .7); f.rotation.y = R(0, 3); } return y + .55; },
  bucket: (g, x, y, z) => { cyl(.25, .2, .4, 9, 'wood', x, y, z, g); cyl(.22, .22, .02, 9, mat('basinW', '#8fd8d4'), x, y + .36, z, g); const h = add(new THREE.TorusGeometry(.22, .02, 4, 8, Math.PI), 'dark', x, y + .4, z, g); return y + .65; },
  washtub: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.42, 0], [.5, .45], [.5, .47]].map(([a, b]) => new THREE.Vector2(a, b)), 16), mat('tubWood', '#9a6236', { side: THREE.DoubleSide, map: mat('wood', '#9a6236').map }), x, y, z, g); /* open top, double-sided so you see the inside */ for (const h of [.1, .36]) { const t = add(new THREE.TorusGeometry(h > .2 ? .49 : .44, .02, 4, 18), iron(), x, y + h, z, g); t.rotation.x = Math.PI / 2; } for (const sd of [-1, 1]) box(.12, .14, .08, 'wood', x + sd * .5, y + .42, z, g); cyl(.45, .45, .02, 14, mat('washWater', '#6fbfbb', { roughness: .2 }), x, y + .225, z, g); /* water about halfway up */ box(.42, .04, .3, mat('w#efe6d4', '#efe6d4', { map: TEX.cloth }), x + .38, y + .45, z, g).rotation.z = -.5; return y + .55; },
  washtubOld: (g, x, y, z) => { cyl(.55, .48, .35, 10, 'wood', x, y, z, g); cyl(.5, .5, .02, 10, mat('basinW', '#8fd8d4'), x, y + .32, z, g); box(.5, .05, .3, mat('w#efe6d4', '#efe6d4'), x + .1, y + .35, z, g).rotation.y = .5; return y + .5; },
  saltJar: (g, x, y, z) => { const t = P.bigJar(g, x, y, z, mat('saltJ', '#e6dfd2'), .7); add(new THREE.ConeGeometry(.12, .12, 7), 'wool', x, y + .76, z, g); return t; },
  donkey: (g, x, y, z) => { const gm = mat('donkeyM', '#8e8578', { flatShading: true }), lt = mat('donkeyL', '#d8d0c4'), dk = mat('donkeyD', '#4a4038');
    const b = add(new THREE.CapsuleGeometry(.32, .75, 4, 10), gm, x, y + 1.0, z, g); b.rotation.x = Math.PI / 2;
    for (const [a, c] of [[.17, .38], [-.17, .38], [.17, -.38], [-.17, -.38]]) { cyl(.06, .05, .72, 6, gm, x + a, y + .02, z + c, g); box(.11, .08, .13, dk, x + a, y, z + c, g); }
    const nk = add(new THREE.CylinderGeometry(.14, .2, .55, 8), gm, x, y + 1.3, z + .55, g); nk.rotation.x = .7;
    const hd = add(new THREE.CapsuleGeometry(.14, .38, 4, 8), gm, x, y + 1.55, z + .82, g); hd.rotation.x = 1.15; const sn = add(new THREE.SphereGeometry(.12, 8, 6), lt, x, y + 1.45, z + 1.02, g); sn.scale.set(1, .85, 1);
    for (const sd of [-1, 1]) { const e = add(new THREE.ConeGeometry(.06, .38, 5), gm, x + sd * .09, y + 1.88, z + .72, g); e.rotation.set(-.25, 0, sd * .2); add(new THREE.SphereGeometry(.025, 5, 4), dk, x + sd * .1, y + 1.62, z + .9, g); }
    box(.06, .3, .5, dk, x, y + 1.42, z + .52, g).rotation.x = .7; const tl = cyl(.025, .02, .5, 5, gm, x, y + .7, z - .62, g); tl.rotation.x = .3;
    for (const sd of [-1, 1]) { box(.16, .38, .45, mat('saddle', '#a8331f', { map: TEX.cloth }), x + sd * .38, y + .82, z, g); box(.17, .06, .46, mat('leatherDk', '#4a2a1a'), x + sd * .38, y + 1.0, z, g); } box(.7, .06, .5, mat('saddle', '#a8331f'), x, y + 1.33, z, g); return y + 1.95; },
  donkeyOld: (g, x, y, z) => { const gm = mat('donkeyM', '#8e8578'); const b = add(new THREE.IcosahedronGeometry(.42, 1), gm, x, y + 1, z, g); b.scale.set(.8, .75, 1.5);
    for (const [a, c] of [[.18, .4], [-.18, .4], [.18, -.4], [-.18, -.4]]) box(.1, .8, .1, gm, x + a, y, z + c, g);
    const n = add(new THREE.IcosahedronGeometry(.22, 0), gm, x, y + 1.35, z + .7, g); n.scale.set(.8, 1, 1.6); for (const s of [-1, 1]) { const e = add(new THREE.ConeGeometry(.06, .35, 4), gm, x + s * .1, y + 1.65, z + .6, g); e.rotation.z = -s * .25; }
    for (const s of [-1, 1]) box(.15, .4, .5, mat('saddle', '#9a4a3a'), x + s * .38, y + .9, z, g); return y + 1.85; },
  signpost: (g, x, y, z) => { box(.1, 2.1, .1, 'wood', x, y, z, g); for (const [h, r] of [[1.85, .5], [1.5, -.6]]) { const a = box(.9, .2, .05, 'woodLt', x, y + h, z, g); a.rotation.y = r; } return y + 2.15; },
  trough: (g, x, y, z) => { box(1.2, .45, .55, 'stone', x, y, z, g); box(1.05, .02, .4, mat('basinW', '#8fd8d4'), x, y + .43, z, g); return y + .55; },
  wheelUp: (g, x, y, z) => { const w = add(new THREE.TorusGeometry(.5, .06, 5, 12), 'wood', x, y + .55, z, g); for (let i = 0; i < 4; i++) { const sp = box(.04, 1, .04, 'woodLt', x, y + .05, z, g); sp.position.y = y + .55; sp.rotation.z = i * Math.PI / 4; } return y + 1.1; },
  milestone: (g, x, y, z) => { cyl(.35, .42, 1.7, 8, 'marble', x, y, z, g); cyl(.37, .37, .12, 8, 'stoneDk', x, y + 1.2, z, g); return y + 1.75; },
  herbStand: (g, x, y, z) => { for (const s of [-1, 1]) box(.06, 1.25, .06, 'wood', x + s * .5, y, z, g); return P.herbs(g, x, y, z); },
});
mat('cork', '#c9a564');
Object.assign(P, {
  loom2: (g, x, y, z) => { const fr = new THREE.Group(); fr.position.set(x, y, z); fr.rotation.x = -.22; g.add(fr);
    for (const sx of [-.55, .55]) box(.09, 2.3, .09, 'woodLt', sx, 0, 0, fr); for (const yy of [.25, 1.25, 2.2]) box(1.25, .08, .1, 'woodLt', 0, yy, 0, fr);
    for (let i = -10; i <= 10; i++) box(.008, 1.0, .008, 'wool', i * .045, 1.2, .02, fr);
    box(.95, .55, .02, mat('loomBlue', '#3f6f9a', { map: TEX.cloth }), 0, .65, .03, fr); box(.95, .04, .03, mat('loomStripe', '#efe6d4'), 0, .9, .04, fr);
    for (let i = -2; i <= 2; i++) { box(.008, .35, .008, 'straw', i * .2, .95, -.08, fr); add(new THREE.ConeGeometry(.06, .14, 6), 'clay', i * .2, .9, -.08, fr).rotation.x = Math.PI; }
    box(.12, .5, .4, 'woodLt', -.55, 0, -.25, g === fr ? g : fr); return y + 2.2; },
  // Six bolts of woven cloth stacked 3-2-1. Each bolt is a faceted roll, slightly fuller in the middle, with woven border bands near its ends,
  // the step of its loose outer lap, and its rolled layers (a spiral) on both end faces around a wooden core rod or an open centre.
  // The per-bolt variation (radius, length, slight turn and slide) is fixed in the table, not drawn from R(), so the town's random sequence is unchanged.
  // One bolt is tied with twine; the bottom outer one has its loose end hanging down onto the floor.
  boltPyr: (g, x, y, z) => { const PI = Math.PI, shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getStyle();
    const B = [ // [cloth, border, radius, length, turn, slide, core rod?]   bottom row, middle row, top
      ['#3f6f9a', '#efe6d4', .168, .88, .05, .02, 1], ['#7a3b6a', '#d9a640', .172, .92, -.04, -.03, 0], ['#d9a640', '#7a3b6a', .164, .85, .07, .01, 1],
      ['#c94a3a', '#efe6d4', .165, .9, -.06, .035, 0], ['#3f6f9a', '#d9a640', .16, .86, .03, -.025, 1], ['#efe6d4', '#c94a3a', .158, .83, -.05, 0, 1]];
    // centres (z, y) in the stack: the bottom row sits on the floor; each upper bolt rests on the two below it
    const C = [[-.355, B[0][2]], [0, B[1][2]], [.355, B[2][2]]];
    const rest = (a, b, r) => { const [z1, y1] = C[a], [z2, y2] = C[b], R1 = B[a][2] + r, R2 = B[b][2] + r, dz = z2 - z1, dy = y2 - y1, d = Math.hypot(dz, dy);
      const k = (R1 * R1 - R2 * R2 + d * d) / (2 * d), h = Math.sqrt(R1 * R1 - k * k); return [z1 + (k * dz - h * dy) / d, y1 + (k * dy + h * dz) / d + .002]; };
    C.push(rest(0, 1, B[3][2]), rest(1, 2, B[4][2])); C.push(rest(3, 4, B[5][2]));
    // a flat spiral strip (the rolled layers seen on an end face), in the XY plane facing +Z
    const spiral = (r0, r1, turns, w, a0) => { const n = Math.round(turns * 12), p = [], ix = [];
      for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + t * turns * 2 * PI, rr = r0 + (r1 - r0) * t; for (const s of [-1, 1]) p.push(Math.cos(a) * (rr + s * w / 2), Math.sin(a) * (rr + s * w / 2), 0);
        if (i < n) ix.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setIndex(ix); geo.computeVertexNormals(); return geo; };
    B.forEach(([c, bc, r, L, turn, slide, rod], i) => { const [cz, cy] = C[i], b = new THREE.Group(); b.position.set(x + slide, y + cy, z + cz); b.rotation.y = turn; g.add(b);
      const cloth = mat('w' + c, c, { map: TEX.cloth });
      // the roll: ten facets, the middle ring pushed out a little so it is not a machined tube
      const body = new THREE.CylinderGeometry(r, r, L, 10, 2); const bp = body.attributes.position;
      for (let k = 0; k < bp.count; k++) if (Math.abs(bp.getY(k)) < 1e-4) { bp.setX(k, bp.getX(k) * 1.035); bp.setZ(k, bp.getZ(k) * 1.035); }
      body.computeVertexNormals(); body.rotateZ(PI / 2); add(body, cloth, 0, 0, 0, b);
      // woven border: a wide band and a thin line near each end
      for (const e of [-1, 1]) for (const [off, w] of [[.065, .05], [.115, .014]]) { const rr = r * (1 + .035 * (1 - (L / 2 - off) / (L / 2))) + .003;
        const band = new THREE.CylinderGeometry(rr, rr, w, 10); band.rotateZ(PI / 2); add(band, mat('bpBand' + bc, bc, { map: TEX.cloth }), e * (L / 2 - off), 0, 0, b); }
      // the loose outer lap: a thin strip lying along the roll, its free edge lifted
      const la = .9 + i * .7, lr = r * 1.035 + .004, lap = add(new THREE.BoxGeometry(L * .97, .01, .1), cloth, 0, lr * Math.cos(la), lr * Math.sin(la), b); lap.rotation.x = la + .06;
      // end faces: darker cut face, the spiral of rolled layers, and a core rod or an open centre
      for (const e of [-1, 1]) { const f = new THREE.Group(); f.position.x = e * L / 2; f.rotation.y = e * PI / 2; b.add(f);
        add(new THREE.CircleGeometry(r, 10), mat('bpEnd' + c, shade(c, .8)), 0, 0, .001, f);
        add(spiral(.035, r - .014, 3.5, .007, i * 1.3 + e), mat('bpLayer' + c, shade(c, .5)), 0, 0, .003, f);
        if (!rod) add(new THREE.CircleGeometry(.032, 8), mat('bpHole', '#2a2018'), 0, 0, .004, f); }
      if (rod) { const core = new THREE.CylinderGeometry(.026, .026, L + .07, 6); core.rotateZ(PI / 2); add(core, 'woodLt', 0, 0, 0, b); } });
    // twine tied round the top bolt, with a knot
    { const [cz, cy] = C[5], [, , r, , turn, slide] = B[5], t = new THREE.Group(); t.position.set(x + slide, y + cy, z + cz); t.rotation.y = turn; g.add(t);
      for (const s of [-1, 1]) { const ring = add(new THREE.TorusGeometry(r * 1.03 + .006, .009, 4, 14), mat('bpTwine', '#a8875a'), s * .17, 0, 0, t); ring.rotation.y = PI / 2; }
      add(new THREE.IcosahedronGeometry(.02, 0), 'bpTwine', .17, r * 1.03 + .012, 0, t); }
    // the loose end of the bottom outer bolt: wraps round its outer side, falls to the floor and lies there in a soft fold
    { const [c, , r, L, turn, slide] = B[2], [cz, cy] = C[2], t = new THREE.Group(); t.position.set(x + slide, y + cy, z + cz); t.rotation.y = turn; g.add(t);
      // path down the cloth: [z out, y, ripple height on the floor]; across it five columns, the outer ones rippling into soft folds
      const lr = r * 1.035 + .006, path = [.6, .3, 0, -.3].map(a => [lr * Math.cos(a), lr * Math.sin(a), 0])
        .concat([[lr + .035, -r * .6, 0], [lr + .07, -r + .01, .006], [lr + .13, -r + .004, .022], [lr + .19, -r + .004, .03], [lr + .24, -r + .006, .018]]);
      const W = .48, COLS = [-1, -.5, 0, .5, 1], RIP = [0, 1, -.4, .8, .1], N = COLS.length, last = path.length - 1, p = [], ix = [], uv = [];
      path.forEach(([pz, py, h], k) => { COLS.forEach((s, j) => { const fz = k === last ? s * .035 : 0;   // the cut end runs a little on the slant
          p.push(-.04 + s * W / 2 * (1 - h * 1.5), py + Math.max(0, RIP[j] * h), pz + fz + (k > 3 ? RIP[j] * h * .5 : 0)); uv.push(0, 0); });
        if (k < last) for (let q = 0; q < N - 1; q++) { const a = N * k + q; ix.push(a, a + N, a + 1, a + 1, a + N, a + N + 1); } });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix); geo.computeVertexNormals();
      add(geo, mat('bpTail' + c, c, { map: TEX.cloth, side: THREE.DoubleSide }), 0, 0, 0, t); }
    return y + 1.0; },
  chestOpen: (g, x, y, z) => { const H = .45, t = .05;   // open-topped box: floor and four walls, so the mouth shows the dark inside (no solid top)
    box(.8, t, .5, 'wood', x, y, z, g); box(.8, H, t, 'wood', x, y, z - .25 + t / 2, g); box(.8, H, t, 'wood', x, y, z + .25 - t / 2, g);
    box(t, H, .5 - 2 * t, 'wood', x - .4 + t / 2, y, z, g); box(t, H, .5 - 2 * t, 'wood', x + .4 - t / 2, y, z, g);
    for (const k of [-.3, .3]) for (const s of [-.26, .26]) box(.05, H + .02, .02, iron(), x + k, y - .01, z + s, g);   // iron bands on the front and back walls only
    box(.7, .02, .4, mat('chestIn', '#5a3a26'), x, y + .1, z, g);   // inside floor, well below the rim
    const lid = new THREE.Group(); lid.position.set(x, y + .45, z - .25); lid.rotation.x = -1.85; g.add(lid); box(.8, .08, .5, 'wood', 0, 0, .25, lid); box(.82, .1, .05, iron(), 0, 0, .48, lid); return y + .95; },
  woolBasket: (g, x, y, z) => { const top = (MODELS.stall ? placePart(g, 'stall', 'Cylinder133', x, y, z, .75) : (cyl(.38, .3, .45, 10, 'basket', x, y, z, g), y + .45));
    for (let i = 0; i < 7; i++) add(new THREE.IcosahedronGeometry(R(.09, .13), 1), 'wool', x + R(-.16, .16), top - .05 + R(0, .1), z + R(-.16, .16), g);
    const h = add(new THREE.TorusGeometry(.37, .025, 5, 12, Math.PI), 'basket', x, top, z, g);   // handle ends sit on the rim
    for (const sd of [-1, 1]) add(new THREE.CylinderGeometry(.03, .03, .1, 5), 'basket', x + sd * .37, top - .03, z, g);   // tucked into the rim
    return top + .37; },
  stoolSpindle: (g, x, y, z) => { box(.55, .07, .42, 'woodLt', x, y + .55, z, g); for (const [a, b] of [[-.22, -.16], [.22, -.16], [-.22, .16], [.22, .16]]) box(.06, .55, .06, 'wood', x + a, y, z + b, g); box(.44, .04, .04, 'wood', x, y + .2, z - .16, g); box(.44, .04, .04, 'wood', x, y + .2, z + .16, g);
    const sp = add(new THREE.CylinderGeometry(.02, .02, .45, 6), 'woodLt', x - .1, y + .66, z, g); sp.rotation.z = Math.PI / 2; add(new THREE.IcosahedronGeometry(.15, 1), 'wool', x + .1, y + .74, z, g); return y + .9; },
  bed2: (g, x, y, z) => UD.bed(g, x, y, z),
  cradle2: (g, x, y, z) => { box(.8, .08, .5, 'woodLt', x, y + .25, z, g); for (const sx of [-.4, .4]) box(.06, .6, .5, 'wood', x + sx, y, z, g);
    for (let i = -3; i <= 3; i++) for (const sz of [-.25, .25]) box(.025, .3, .025, 'woodLt', x + i * .11, y + .33, z + sz, g); box(.8, .04, .04, 'wood', x, y + .62, z - .25, g); box(.8, .04, .04, 'wood', x, y + .62, z + .25, g);
    const bl = box(.55, .1, .4, mat('babyblanket', '#d9a640', { map: TEX.cloth }), x + .05, y + .34, z, g); bl.rotation.z = .15; return y + .7; },
  candelabrum: (g, x, y, z) => { cyl(.22, .26, .06, 10, bronze(), x, y, z, g); cyl(.025, .03, 1.6, 8, bronze(), x, y + .05, z, g);
    for (const [a, h] of [[-.28, 1.45], [0, 1.68], [.28, 1.45]]) { if (a) { const arm = box(.3, .025, .025, bronze(), x + a / 2, y + h - .02, z, g); } cyl(.08, .04, .06, 9, bronze(), x + a, y + h, z, g); flame(g, x + a, y + h + .05, z); } return y + 1.85; },
  rack2: (g, x, y, z) => { for (const sx of [-.7, .7]) { box(.07, 1.75, .07, 'woodLt', x + sx, y, z, g); box(.07, .07, .5, 'wood', x + sx, y, z, g); } box(1.5, .06, .06, 'woodLt', x, y + 1.72, z, g);
    ['#b8331f', '#d9a640', '#2f5f9a'].forEach((c, i) => { const tx = x - .42 + i * .42, m = mat('tunic' + c, c, { map: TEX.cloth }); const hg = add(new THREE.TorusGeometry(.13, .012, 4, 8, Math.PI), 'wood', tx, y + 1.53, z, g);
      box(.03, .1, .03, 'wood', tx, y + 1.62, z, g); const t = add(new THREE.CylinderGeometry(.13, .19, .8, 8), m, tx, y + 1.1, z, g); t.scale.z = .45; for (const sd of [-1, 1]) { const sl = box(.12, .26, .1, m, tx + sd * .18, y + 1.25, z, g); sl.rotation.z = sd * .5; } }); return y + 1.8; },
  // Domed household bread oven: a hand-built mud dome (lumpy, leaning a little, soot above the mouth and round the vent) on a plinth of
  // mud-brick courses, a thick arched mouth facing +z with glowing embers and two small flames, scored round loaves on the front ledge,
  // a wooden peel leaning on the right and a few split logs at the back. Footprint about 1.6 × 1.45 m, dome top about 1.1 m.
  oven2: (g, x, y, z) => {
    const H = .45, PW = 1.3, ZB = -.62, ZF = .8, DZ = z - .2, DR = .57, MZ = DZ + .44, MD = .22;   // plinth height/width/back/front, dome centre and radius, mouth frame start and depth
    const hsh = (a, b, c) => { const s = Math.sin(Math.round(a * 1e3) * 12.9898 + Math.round(b * 1e3) * 78.233 + Math.round(c * 1e3) * 37.719) * 43758.5453; return s - Math.floor(s); };   // stable per-position noise
    let q = 0; const rr = (lo, hi) => lo + hsh(q++, .37, 1.1) * (hi - lo);   // own fixed jitter: R() would shift the town's shared random sequence
    const C = s => new THREE.Color(s), tint = (geo, fn) => { const p = geo.attributes.position, col = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) fn(p.getX(i), p.getY(i), p.getZ(i)).toArray(col, i * 3); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo; };
    const soot = C('#2b2019'), clay = C('#cfab80'), rimC = C('#c39468'), sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    // plinth: a mortar core, a plastered top slab and three courses of chunky, uneven mud bricks
    box(PW - .06, H - .03, ZF - ZB - .06, mat('ovenMortar', '#7e6046'), x, y, z + (ZB + ZF) / 2, g);
    const bm = ['#b07e52', '#9d6f47', '#bf9065', '#a7764b'].map((c, i) => mat('ovenBrick' + i, c, { map: TEX.plaster }));
    for (let c = 0; c < 3; c++) { const by = y + c * .145, bh = .13;
      for (const side of [-1, 1]) { const zz = z + (side < 0 ? ZB : ZF) + side * -.035;   // front and back faces, bricks along x
        for (let bx = -PW / 2 + (c % 2 ? .16 : 0); bx < PW / 2 - .02; bx += .32) { const l = Math.min(.3, PW / 2 - bx) - rr(0, .03); if (l < .08) continue; const b = box(l, bh - rr(0, .02), .1, bm[(c * 7 + Math.round(bx * 10) + side) & 3], x + bx + l / 2 + .01, by, zz + rr(-.01, .01), g); b.rotation.y = rr(-.03, .03); } }
      for (const side of [-1, 1]) { const xx = x + side * (PW / 2 - .035);   // left and right faces, bricks along z
        for (let bz = ZB + (c % 2 ? 0 : .17); bz < ZF - .02; bz += .34) { const l = Math.min(.32, ZF - bz) - rr(0, .03); if (l < .08) continue; const b = box(.1, bh - rr(0, .02), l, bm[(c * 5 + Math.round(bz * 10) + side + 4) & 3], xx + rr(-.01, .01), by, z + bz + l / 2 + .01, g); b.rotation.y = rr(-.03, .03); } } }
    box(PW + .04, .06, ZF - ZB + .04, mat('ovenSlab', '#c7a57c', { map: TEX.plaster }), x, y + H - .045, z + (ZB + ZF) / 2, g);
    // dome: a lathed beehive profile pushed in and out by smooth bumps and noise, leaning slightly; soot shading in vertex colours
    const prof = [[1, 0], [1.03, .1], [1.0, .26], [.93, .43], [.81, .6], [.63, .76], [.42, .88], [.22, .95], [.13, .96]].map(([r, h]) => new THREE.Vector2(r * DR, h * DR * 1.1));
    const dg = new THREE.LatheGeometry(prof, 16, Math.PI / 16), dp = dg.attributes.position;
    for (let i = 0; i < dp.count; i++) { const px = dp.getX(i), py = dp.getY(i), pz = dp.getZ(i), a = Math.atan2(pz, px), t = py / (DR * 1.056);
      const k = 1 + .045 * Math.sin(3 * a + 1.3) + .03 * Math.sin(5 * a + t * 4) + (hsh(px, py, pz) - .5) * .05 * Math.min(1, t * 4);
      const dent = pz > 0 && Math.abs(px) < .2 && py < .4;   // the dome wall is pushed in behind the mouth so the arch opens onto a dark oven chamber
      dp.setXYZ(i, px * k + .035 * t * t, py * (1 + (hsh(pz, px, 1) - .5) * .03), dent ? .24 : pz * k - .02 * t * t); }
    tint(dg, (px, py, pz) => { const front = sm(.25, .85, pz / DR) * Math.exp(-px * px / .06) * sm(.12, .3, py) * (1 - sm(.62, .9, py / DR)), top = sm(.8, .96, py / DR) * .7, base = (1 - sm(0, .12, py)) * .25;
      const c = clay.clone().multiplyScalar(.93 + hsh(px, pz, py) * .12); return c.lerp(soot, Math.min(.85, front * .9 + top + base)); });
    add(dg, mat('ovenDome', '#ffffff', { vertexColors: true, map: TEX.plaster, roughness: .95 }), x, y + H + .005, DZ, g);
    // vent: a small chimney collar at the crown, black inside, with a faint wisp of smoke
    const vx = x + .035, vy = y + H + DR * 1.056 - .02;
    cyl(.065, .09, .08, 7, mat('ovenRimSoot', '#4a372a', { map: TEX.plaster }), vx, vy, DZ - .02, g); add(new THREE.CircleGeometry(.05, 7), mat('ovenHole', '#120c08'), vx, vy + .082, DZ - .02, g).rotation.x = -Math.PI / 2;
    { const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(new THREE.Vector3(Math.sin(t * 6) * .05 * (1 + t), t * .3, Math.cos(t * 5) * .03 - t * .04)); }
      const w = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, .03, 5), new THREE.MeshStandardMaterial({ color: '#cfc8bc', transparent: true, opacity: .45, depthWrite: false }), vx, vy + .1, DZ - .02, g); w.castShadow = false; w.userData.dyn = 1; }
    // mouth: a thick horseshoe arch of fired clay pushed out from the dome, its inside and lintel blackened by smoke
    const AR = .18, AO = .29, AS = .18, sh = new THREE.Shape();   // inner and outer arch radius, springing height
    sh.moveTo(-AO, 0); sh.lineTo(-AO, AS); sh.absarc(0, AS, AO, Math.PI, 0, true); sh.lineTo(AO, 0); sh.lineTo(AR, 0); sh.lineTo(AR, AS); sh.absarc(0, AS, AR, 0, Math.PI, false); sh.lineTo(-AR, 0); sh.closePath();
    const ag = new THREE.ExtrudeGeometry(sh, { depth: MD, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 1, curveSegments: 7 });
    tint(ag, (px, py, pz) => { const d = Math.hypot(px, Math.max(0, py - AS)), inner = 1 - sm(AR + .01, AR + .09, d), lintel = sm(AS, AO + AS, py) * Math.exp(-px * px / .05) * .75;
      return rimC.clone().multiplyScalar(.92 + hsh(px, py, pz) * .14).lerp(soot, Math.min(.9, inner * .95 + lintel)); });
    add(ag, mat('ovenRim', '#ffffff', { vertexColors: true, map: TEX.plaster }), x, y + H, MZ, g);
    // inside the mouth: a dark glowing back, a bed of embers and two small flickering flames, with a warm light spilling onto the ledge
    const ib = new THREE.Shape(); ib.moveTo(-AR, 0); ib.lineTo(-AR, AS); ib.absarc(0, AS, AR, Math.PI, 0, true); ib.lineTo(AR, 0); ib.closePath();
    const back = add(new THREE.ShapeGeometry(ib, 7), new THREE.MeshStandardMaterial({ color: '#1c0e07', emissive: '#8a2a08', emissiveIntensity: 1.3, roughness: 1 }), x, y + H, DZ + .25, g); back.userData.dyn = 1; back.castShadow = false;
    const em = new THREE.MeshStandardMaterial({ color: '#ff8a2a', emissive: '#ff5a10', emissiveIntensity: 1.8, roughness: 1, flatShading: true }), emD = new THREE.MeshStandardMaterial({ color: '#3a1c10', emissive: '#a8300a', emissiveIntensity: .8, roughness: 1, flatShading: true });
    for (let i = 0; i < 16; i++) { const e = add(new THREE.IcosahedronGeometry(rr(.03, .055), 0), i % 3 ? em : emD, x + rr(-.14, .14), y + H + .02, DZ + rr(.3, .5), g); e.scale.y = .6; e.userData.dyn = 1; e.castShadow = false; }
    const fm = new THREE.MeshStandardMaterial({ color: '#ff9a2a', emissive: '#ff5a0a', emissiveIntensity: 1.5, roughness: 1, flatShading: true });
    for (const [fx, fz, s] of [[-.05, .36, 1.4], [.07, .4, 1.05], [-.02, .45, .8]]) { const f = add(new THREE.ConeGeometry(.045 * s, .17 * s, 5), fm, x + fx, y + H + .085 * s, DZ + fz, g); f.castShadow = false; f.userData.dyn = 1; (window.__fire ||= []).push(f); }
    { const pl = new THREE.PointLight('#ff8a3a', 1.8, 2.2, 2); pl.position.set(x, y + H + .18, MZ + MD + .12); g.add(pl); }
    // two round loaves, scored into eight wedges as Roman bakers did, on the ledge in front of the mouth
    const loaf = (lx, ly, lz, s, ry = 0) => { const l = add(new THREE.SphereGeometry(.12 * s, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat('ovenLoaf', '#b8743a', { roughness: .8 }), lx, ly, lz, g); l.scale.y = .7; l.rotation.y = ry;
      for (let k = 0; k < 4; k++) { const cut = box(.15 * s, .01, .012, mat('ovenLoafCut', '#8f5a2c'), lx, ly + .074 * s, lz, g); cut.rotation.y = ry + k * Math.PI / 4; } };
    loaf(x - .43, y + H + .01, z + ZF - .17, 1, .2); loaf(x + .44, y + H + .01, z + ZF - .19, .9, .5);
    // a wooden peel leaning against the right of the dome, blade up, and a few split logs stacked at the back
    { const pe = new THREE.Group(); pe.position.set(x + .8, y, z - .12); pe.rotation.z = .3; g.add(pe);
      cyl(.022, .026, .82, 6, 'woodLt', 0, 0, 0, pe); const bl = add(new THREE.CylinderGeometry(.15, .15, .025, 9), 'woodLt', 0, .95, 0, pe); bl.rotation.z = Math.PI / 2; bl.scale.set(1, 1, 1.15); box(.04, .1, .07, 'woodLt', 0, .78, 0, pe); }
    for (const [lx, ly, lz] of [[-.36, 0, -.04], [-.36, 0, .07], [-.36, .1, .015], [.0, 0, 0]]) { const lg = add(new THREE.CylinderGeometry(.05, .055, .42, 6), 'wood', x + lx + (lz > .05 ? .05 : 0), y + ly + .05, z + ZB - .1 + lz, g); lg.rotation.z = Math.PI / 2; lg.rotation.y = rr(-.15, .15); }
    return y + H + DR * 1.056 + .07; },
  herbRack: (g, x, y, z) => { for (const sx of [-.65, .65]) { box(.07, 1.6, .07, 'wood', x + sx, y, z, g); const ft = box(.07, .07, .55, 'wood', x + sx, y, z, g); } box(1.45, .06, .06, 'wood', x, y + 1.55, z, g);
    for (let i = 0; i < 6; i++) { const hx = x - .55 + i * .22; box(.01, .15, .01, 'straw', hx, y + 1.4, z, g); const c = i === 3 ? '#9a6a3a' : ['#5f7a3e', '#7c9450', '#6f8a46'][i % 3];
      for (let k = 0; k < 4; k++) { const lf = add(new THREE.ConeGeometry(.04, .32, 4), mat('herb' + c, c), hx + R(-.04, .04), y + 1.22, z + R(-.04, .04), g); lf.rotation.x = Math.PI + R(-.2, .2); } } return y + 1.6; },
  sackScoop: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.26, .02], [.32, .25], [.3, .5], [.2, .6], [.24, .66]].map(([a, b]) => new THREE.Vector2(a, b)), 12), mat('sack', '#cdb48a', { map: TEX.cloth }), x, y, z, g);
    cyl(.2, .2, .02, 10, mat('flour', '#f2ece0'), x, y + .62, z, g); const sc = box(.12, .06, .3, 'woodLt', x + .08, y + .7, z, g); sc.rotation.x = -.8; return y + .8; },
  bowlTall: (g, x, y, z) => { for (let i = 0; i < 9; i++) add(new THREE.LatheGeometry([[0, 0], [.2, 0], [.3, .1], [.33, .14]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat('bowlC', '#a8623a', { side: THREE.DoubleSide, flatShading: false, roughness: .6 }), x, y + i * .085, z, g); return y + .9; },
  tripodPot: (g, x, y, z) => { const top = new THREE.Vector3(x, y + 1.5, z);
    const leg = (p, q) => { const d = q.clone().sub(p), m = add(new THREE.CylinderGeometry(.02, .02, d.length(), 6), iron(), (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, g); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .3; leg(new THREE.Vector3(x + Math.cos(a) * .32, y, z + Math.sin(a) * .32), top); }   // each leg runs from the ground to the apex
    add(new THREE.SphereGeometry(.05, 8, 6), iron(), x, y + 1.5, z, g);   // the apex where the three legs meet
    box(.02, .48, .02, iron(), x, y + 1.02, z, g); add(new THREE.SphereGeometry(.24, 12, 8, 0, Math.PI * 2, Math.PI * .35, Math.PI * .65), mat('ironPot', '#3c3a38', { side: THREE.DoubleSide, metalness: .4, roughness: .6 }), x, y + .75, z, g); cyl(.2, .2, .02, 10, mat('stew', '#7a4a22'), x, y + .82, z, g);
    add(new THREE.SphereGeometry(.05, 7, 5), mat('onion', '#e8dcc4'), x + .08, y + .86, z + .05, g); add(new THREE.SphereGeometry(.045, 7, 5), mat('beetRoot', '#7a2a3a'), x - .09, y + .86, z - .06, g);   // vegetables in the stew
    add(new THREE.ConeGeometry(.035, .2, 6), mat('carrotV', '#e0722a'), x - .02, y + .85, z + .1, g).rotation.set(0, .6, Math.PI / 2);
    add(new THREE.ConeGeometry(.035, .18, 6), mat('carrotV', '#e0722a'), x + .1, y + .85, z - .04, g).rotation.set(0, -.9, Math.PI / 2);
    add(new THREE.ConeGeometry(.04, .22, 5), 'green', x + .02, y + .9, z - .1, g).rotation.set(.2, 0, .5);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.DodecahedronGeometry(.08, 0), 'stone', x + Math.cos(a) * .32, y + .04, z + Math.sin(a) * .32, g); }
    for (let i = 0; i < 3; i++) { const lg = box(.5, .07, .07, 'wood', x, y + .06, z, g); lg.rotation.y = i * 1.05; } { const f = makeFire(THREE, { scale: .16, light: false }); f.position.set(x, y + .02, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); }
    const pl = new THREE.PointLight('#ff9a4a', 2, 4, 1.6); pl.position.set(x, y + .4, z); g.add(pl); return y + 1.4; },
  incense: (g, x, y, z) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, l = box(.035, .55, .035, bronze(), x + Math.cos(a) * .14, y, z + Math.sin(a) * .14, g); l.rotation.z = Math.cos(a) * .2; }
    add(new THREE.LatheGeometry([[0, 0], [.16, .02], [.22, .14], [.2, .22]].map(([a, b]) => new THREE.Vector2(a, b)), 10), bronze(), x, y + .5, z, g);
    const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector3(Math.sin(t * 7) * .08 * (1 + t), t * .9, Math.cos(t * 7) * .05)); }
    const sm = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .035, 5), new THREE.MeshStandardMaterial({ color: '#cfc8bc', transparent: true, opacity: .75, depthWrite: false }), x, y + .7, z, g); sm.castShadow = false; return y + 1.5; },
  wallShelf: (g, x, y, z) => { box(1.0, .06, .42, 'wood', x, y + 1.55, z, g); for (const sx of [-.4, .4]) { const b = box(.05, .3, .05, 'wood', x + sx, y + 1.3, z - .15, g); b.rotation.x = .6; }
    for (let i = 0; i < 6; i++) { const sc = add(new THREE.CylinderGeometry(.07, .07, .62, 8), mat('papyrus', '#e8d6a8'), x - .05 + (i % 2) * .08, y + 1.67 + (i > 2 ? .13 : 0), z - .12 + (i % 3) * .12, g); sc.rotation.z = Math.PI / 2; } box(.06, 1.55, .06, 'wood', x - .48, y, z - .15, g); box(.06, 1.55, .06, 'wood', x + .48, y, z - .15, g); return y + 1.95; },
  painted: (g, x, y, z) => { const t = P.bigJar(g, x, y, z, 'clay', 1.15); for (const sd of [-1, 1]) { const h = add(new THREE.TorusGeometry(.12, .03, 5, 8, Math.PI), 'clay', x + sd * .26, y + .95, z, g); h.rotation.z = sd * Math.PI / 2; } return t; },
  miniTemple: (g, x, y, z) => { box(1.2, .15, .9, 'marble', x, y, z, g); box(1.05, .15, .78, 'marble', x, y + .15, z, g); box(.9, 1.05, .1, 'marble', x, y + .3, z - .3, g);
    for (const sx of [-.33, .33]) { cyl(.06, .07, .95, 10, 'marble', x + sx, y + .3, z + .25, g); box(.15, .06, .15, 'marble', x + sx, y + 1.25, z + .25, g); }
    box(.95, .14, .7, 'marble', x, y + 1.3, z, g); const pd = gableRoof(.85, .62, .28, 'marble', x, y + 1.44, z, 0, g); pd.scale.set(.6, 1, .75); add(new THREE.SphereGeometry(.05, 6, 4), bronze(), x, y + 1.75, z + .3, g); return y + 1.8; },
});

// ---- objects that used to be written inline in a room call (Colossians 4 and 2:4 bread basket uses fruit-basket with arguments) ----
const COL_INLINE = {
  fishingBoat: (g, x, y, z) => ueFishingBoat(g, x, y, z),   // objects/up-e.js: afloat, moored, with oars and net
  fishDryingRack: (g, x, y, z) => (placePart(g, 'stall', ['Jemuran_low003', 'Fish_low002', 'Fish_low004', 'Fish_low014'], x, y, z, .6, Math.PI / 2), box(.5, .5, .5, mat('fishCrate', '#8a6040', { map: TEX.wood }), x, y, z, g), y + .55) ?? P.net(g, x, y, z),
  wickerBasket: (g, x, y, z) => placePart(g, 'stall', 'Cylinder114', x, y, z, .8) ?? P.bucket(g, x, y, z),
  woodenCrate: (g, x, y, z) => placePart(g, 'stall', 'Crate_low153', x, y, z, 1.1) ?? P.crates(g, x, y, z),
  donkeySideOn: (g, x, y, z) => { const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = Math.PI / 2; g.add(d); return P.donkey(d, 0, 0, 0); },
  travellersPack: (g, x, y, z) => { const b = box(.55, .5, .3, mat('leather', '#7a4a2a'), x, y, z, g); box(.57, .08, .32, mat('leatherDk', '#4a2a1a'), x, y + .3, z, g); const r = add(new THREE.CylinderGeometry(.13, .13, .6, 10), mat('blanketB', '#2f5f9a'), x, y + .63, z, g); r.rotation.z = Math.PI / 2; return y + .8; },
  letterOnTable: (g, x, y, z) => { cyl(.06, .1, .62, 6, 'wood', x, y, z, g); cyl(.5, .5, .06, 10, 'woodLt', x, y + .62, z, g); box(.42, .03, .3, mat('papyrus', '#e8d6a8'), x, y + .68, z, g); cyl(.05, .05, .015, 10, mat('seal', '#b8331f'), x, y + .71, z, g); return y + .75; },
  tallCandle: (g, x, y, z) => { cyl(.2, .24, .05, 12, bronze(), x, y, z, g); cyl(.04, .06, .25, 8, bronze(), x, y + .05, z, g); cyl(.12, .12, .05, 10, bronze(), x, y + .3, z, g); cyl(.07, .075, .45, 12, mat('beeswax', '#f0d080', { flatShading: false, roughness: .6 }), x, y + .35, z, g); flame(g, x, y + .82, z, 1.3); return y + 1.0; },
};

// ---- registry: [P key or builder, id, label, origin (room that first uses it; '' = kit only), tags, default extra arguments] ----
{ const T = (fn, id, label, origin, tags, args) => defObject(id, typeof fn === 'string' ? P[fn] : fn, { label, origin: origin ? 'colossae ' + origin : 'colossae kit', tags, args });
  // the market (chapter 1 stalls)
  T('basket', 'fruit-basket', 'Basket of fruit', '1.5', ['market', 'food', 'basket'], ['#c43a2e']);
  T('scale', 'hanging-scales', 'Hanging scales', '1.2', ['market', 'trade']);
  T('crates', 'stacked-crates', 'Stacked crates', '1.2', ['market', 'container']);
  T('sack', 'grain-sack', 'Sack of grain', '1.2', ['market', 'food', 'container']);
  T('bigJar', 'big-jar', 'Big storage jar', '', ['pottery', 'container']);
  T('honey', 'honey-jar', 'Jar of honey', '1.2', ['market', 'food', 'pottery']);
  T('vat', 'dye-vat', 'Dye vat', '', ['market', 'textile', 'container'], ['#9a2a2a']);
  T('rack', 'laundry-rack', 'Drying laundry rack', '4.2', ['river', 'textile']);
  T('bolts', 'cloth-bolts', 'Bolts of folded cloth', '2.5', ['textile', 'market']);
  T('wool', 'wool-bucket', 'Bucket of wool (older)', '', ['textile', 'legacy']);
  T('loom', 'loom-simple', 'Simple loom (older)', '', ['textile', 'furniture', 'legacy']);
  T('scrolls', 'scroll-shelf', 'Shelf of scrolls', '1.3', ['writing', 'market', 'furniture']);
  T('desk', 'writing-desk', 'Papyrus and quill', '1.3', ['writing', 'market']);
  T('tablets', 'wax-tablets', 'Stack of wax tablets', '1.3', ['writing', 'market']);
  T('lamps', 'hanging-oil-lamps', 'Hanging oil lamps', '1.3', ['light', 'market']);
  T('chest', 'coin-chest', 'Chest of coins', '1.3', ['market', 'trade', 'container']);
  T('wheel', 'potters-wheel', 'Potter’s wheel', '1.4', ['pottery', 'market']);
  T('bowl', 'clay-bowl', 'Clay bowl', '1.4', ['pottery']);
  T('kiln', 'pottery-kiln', 'Glowing kiln', '1.4', ['pottery', 'fire', 'market']);
  T('bowlStack', 'stack-of-bowls', 'Stack of bowls', '1.4', ['pottery', 'market']);
  T('jarPyramid', 'jar-pyramid', 'Pyramid of jars', '1.4', ['pottery', 'market']);
  T('clay', 'lump-of-clay', 'Lump of wet clay', '1.4', ['pottery', 'market']);
  T('press', 'olive-press', 'Olive press', '', ['market', 'food', 'legacy']);
  T('cage', 'songbird-cage', 'Songbird cage', '', ['birds', 'market', 'legacy']);
  T('herbs', 'hanging-herbs', 'Hanging herbs', '', ['food', 'market', 'legacy']);
  T('rackJars', 'jar-rack', 'Rack of jars', '', ['pottery', 'furniture', 'legacy']);
  T('cups', 'tray-of-cups', 'Tray of cups', '3.3', ['pottery', 'house']);
  T('skin', 'sheepskin', 'Sheepskin', '', ['textile', 'legacy']);
  T('figBowl', 'fig-bowl', 'Bowl of figs', '1.2', ['market', 'food', 'pottery']);
  T('barrel', 'barrel', 'Barrel', '1.2', ['market', 'container']);
  T('plank', 'plank', 'Plank', '', ['wood']);
  // the temple courtyard (chapter 2)
  T('scrollRack', 'scroll-rack', 'Rack of scrolls', '2.2', ['writing', 'temple', 'furniture']);
  T('stoolTablets', 'stool-with-tablets', 'Stool with wax tablets', '2.2', ['writing', 'temple', 'furniture']);
  T('dovesBig', 'dove-cages', 'Dove cages with doves on top', '2.1', ['birds', 'temple']);
  T('cageStack', 'stacked-dove-cages', 'Stacked dove cages', '2.1', ['birds', 'temple']);
  T('birdPerch', 'dove-perch', 'Doves on a perch', '2.1', ['birds', 'temple']);
  T('coinTable', 'coin-table', 'Money-changer’s table of coins', '2.1', ['trade', 'temple', 'furniture']);
  T('garland', 'laurel-garland', 'Garland of laurel', '2.3', ['temple', 'ritual']);
  T('wreath', 'laurel-wreath', 'Laurel wreath on a post', '2.4', ['temple', 'ritual']);
  T('wineJugs', 'wine-jugs', 'Wine jugs', '2.4', ['pottery', 'food', 'temple']);
  T('brazier', 'brazier', 'Burning brazier', '2.2', ['fire', 'temple', 'light', 'metal']);
  T('offerings', 'bowl-of-offerings', 'Bowl of offerings', '2.3', ['temple', 'ritual', 'food']);
  T('bigChest', 'big-chest', 'Big banded chest', '', ['container', 'metal']);
  T('padlockChest', 'padlocked-chest', 'Chest with a gold padlock', '2.5', ['temple', 'container', 'metal']);
  T('ropeBarrier', 'rope-barrier', 'Rope barrier', '2.5', ['temple', 'metal']);
  T('basin', 'water-basin', 'Water basin', '2.2', ['water', 'temple']);
  // the family house (chapter 3)
  T('loom2', 'loom', 'Loom', '3.1', ['house', 'textile', 'furniture']);
  T('boltPyr', 'cloth-bolt-pyramid', 'Pyramid of cloth bolts', '3.1', ['house', 'textile']);
  T('chestOpen', 'open-sewing-chest', 'Open sewing chest', '3.1', ['house', 'textile', 'container']);
  T('woolBasket', 'wool-basket', 'Basket of wool', '3.1', ['house', 'textile', 'basket']);
  T('stoolSpindle', 'stool-with-spindle', 'Stool with a spindle', '3.1', ['house', 'textile', 'furniture']);
  T('bed2', 'bed', 'Bed', '3.2', ['house', 'furniture']);
  T('cradle2', 'cradle', 'Baby’s cradle', '3.2', ['house', 'furniture']);
  T('candelabrum', 'candelabrum', 'Bronze lamp stand', '3.2', ['house', 'light', 'metal']);
  T('rack2', 'clothes-rack', 'Clothes rack', '3.2', ['house', 'textile', 'furniture']);
  T('couch', 'dining-couch', 'Dining couch', '3.3', ['house', 'furniture']);
  T('lyre', 'lyre', 'Lyre', '3.3', ['house', 'music']);
  T('table', 'fruit-table', 'Round table with fruit', '3.3', ['house', 'furniture', 'food'], ['#c43a2e']);
  T('oven2', 'bread-oven', 'Bread oven', '3.4', ['house', 'kitchen', 'fire']);
  T('herbRack', 'herb-rack', 'Rack of hanging herbs', '3.4', ['house', 'kitchen', 'food']);
  T('sackScoop', 'flour-sack', 'Sack of flour with a scoop', '3.4', ['house', 'kitchen', 'food']);
  T('bowlTall', 'tall-bowl-stack', 'Tall stack of bowls', '3.4', ['house', 'kitchen', 'pottery']);
  T('tripodPot', 'stew-pot-on-tripod', 'Stew pot over the fire', '3.4', ['house', 'kitchen', 'fire', 'metal']);
  T('incense', 'incense-burner', 'Incense burner', '3.5', ['house', 'shrine', 'metal']);
  T('wallShelf', 'wall-shelf-of-scrolls', 'Wall shelf of scrolls', '3.5', ['house', 'shrine', 'writing']);
  T('painted', 'painted-jar', 'Painted jar', '3.5', ['house', 'shrine', 'pottery']);
  T('miniTemple', 'mini-temple', 'Little household shrine', '3.5', ['house', 'shrine', 'temple']);
  T('bucket', 'wooden-bucket', 'Wooden bucket', '4.1', ['river', 'container']);
  T('pot', 'cooking-pot', 'Cooking pot on legs (older)', '', ['kitchen', 'fire', 'legacy']);
  T('spindle', 'spindle-block', 'Spindle on a block (older)', '', ['textile', 'legacy']);
  T('bed', 'bed-simple', 'Simple bed (older)', '', ['house', 'furniture', 'legacy']);
  T('cradle', 'cradle-simple', 'Simple cradle (older)', '', ['house', 'furniture', 'legacy']);
  T('shrine', 'wayside-shrine', 'Wayside shrine', '', ['shrine', 'temple']);
  T('tripod', 'bronze-tripod', 'Bronze tripod', '', ['metal', 'fire', 'temple']);
  // the bridge and the road (chapter 4)
  T('boat', 'small-boat', 'Small wooden boat', '4.1', ['river', 'travel']);
  T('net', 'fishing-net', 'Fishing net on poles', '4.1', ['river']);
  T('fish', 'basket-of-fish', 'Basket of fish', '4.1', ['river', 'food', 'basket']);
  T('washtub', 'washtub', 'Washtub', '4.2', ['river', 'textile', 'container']);
  T('washtubOld', 'washtub-wide', 'Wide washtub (older)', '', ['river', 'legacy']);
  T('saltJar', 'salt-jar', 'Jar of salt', '4.2', ['river', 'food', 'pottery']);
  T('donkey', 'donkey', 'Donkey', '4.2', ['animal', 'travel']);
  T('donkeyOld', 'donkey-simple', 'Simple donkey (older)', '', ['animal', 'legacy']);
  T('signpost', 'signpost', 'Signpost', '4.3', ['travel', 'wood']);
  T('trough', 'water-trough', 'Water trough', '4.3', ['travel', 'water']);
  T('wheelUp', 'cart-wheel', 'Cart wheel', '4.3', ['travel', 'wood']);
  T('milestone', 'milestone', 'Milestone', '4.3', ['travel', 'stone']);
  T('herbStand', 'herb-stand', 'Herb stand', '', ['food', 'legacy']);
  T(COL_INLINE.fishingBoat, 'fishing-boat', 'Fishing boat', '4.1', ['river', 'travel']);
  T(COL_INLINE.fishDryingRack, 'fish-drying-rack', 'Fish drying rack', '4.1', ['river', 'food']);
  T(COL_INLINE.wickerBasket, 'wicker-basket', 'Wicker basket', '4.1', ['river', 'basket']);
  T(COL_INLINE.woodenCrate, 'wooden-crate', 'Wooden crate', '4.1', ['river', 'container']);
  T(COL_INLINE.donkeySideOn, 'donkey-side-on', 'Donkey, seen side-on', '4.2', ['animal', 'travel']);
  T(COL_INLINE.travellersPack, 'travellers-pack', 'Traveller’s pack', '4.3', ['travel']);
  T(COL_INLINE.letterOnTable, 'letter-on-table', 'Sealed letter on a table', '4.4', ['writing', 'furniture']);
  T(COL_INLINE.tallCandle, 'tall-candle', 'Tall candle', '4.4', ['light', 'metal']);
}
// the library page filters by kind (default 'object'): the animals, boats and the burning brazier are listed under their own kinds
for (const [id, kind] of Object.entries({ donkey: 'animal', 'donkey-simple': 'animal', 'donkey-side-on': 'animal', 'small-boat': 'structure', 'fishing-boat': 'structure', brazier: 'effect' })) OBJECTS.get(id).kind = kind;
