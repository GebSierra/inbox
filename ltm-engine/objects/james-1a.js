// See objects/james.js for the builder contract.
export function propsA(K) {
  const { THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES } = K;
  const M = (k, c, o) => mat('jA' + k, c, o);
  const lathe = (pts, seg, m, x, y, z, g) => add(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), m, x, y, z, g);
  const ico = (r, d, m, x, y, z, g, sx = 1, sy = 1, sz = 1) => { const o = add(new THREE.IcosahedronGeometry(r, d), m, x, y, z, g); o.scale.set(sx, sy, sz); return o; };
  const cone = (r, h, s, m, x, y, z, g) => add(new THREE.ConeGeometry(r, h, s), m, x, y, z, g);
  const torus = (r, t, m, x, y, z, g, rx = Math.PI / 2) => { const o = add(new THREE.TorusGeometry(r, t, 5, 14), m, x, y, z, g); o.rotation.x = rx; return o; };
  const sandA = () => M('sandA', '#e8d3a0', {}), sandB = () => M('sandB', '#d0b784', {});
  const plinth = (g, x, y, z, w, h) => { box(w + .16, .08, w + .16, sandB(), x, y, z, g); box(w, h - .16, w, sandA(), x, y + .08, z, g); box(w + .16, .08, w + .16, sandB(), x, y + h - .08, z, g); return y + h; };
  const gold = () => M('gold', '#f8cc4c', { metalness: .2, roughness: .45 });
  const bronzeM = () => M('bz', '#dba24a', { metalness: .2, roughness: .5 });
  const water = () => M('water', '#6cc0ee', { roughness: .15, metalness: .1 });
  const dk = () => M('mdark', '#1a0e08');
  const rotz = (o, r) => { o.rotation.z = r; return o; };
  // deterministic wobble for hand-made irregularity: never touches R(), so the town's random stream (and every later object) does not move
  const nz = i => { const q = Math.sin(i * 127.1 + 311.7) * 43758.5453; return q - Math.floor(q); };
  // a box whose top face is scaled to wT x dT: a trapezoid prism, a bevel, a chamfer (y = bottom)
  const tbox = (wB, dB, wT, dT, h, m, x, y, z, g) => { const geo = new THREE.BoxGeometry(wB, h, dB), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * wT / wB); p.setZ(i, p.getZ(i) * dT / dB); }
    geo.computeVertexNormals(); return add(geo, m, x, y + h / 2, z, g); };
  // a roll lying along x (r, length) with its centre at (x, yc, z)
  const rod = (r, len, seg, m, x, yc, z, g) => { const o = add(new THREE.CylinderGeometry(r, r, len, seg), m, x, yc, z, g); o.rotation.z = Math.PI / 2; return o; };

  return {
    letter(g, x, y, z) {
      // a courier's stone shelf with a wooden board; a sealed papyrus scroll (rolled layers at the ends, cord, red wax seal), a second scroll behind and a folded packet
      const t = plinth(g, x, y, z, .8, .8);
      const pap = M('pap', '#f8e8b8'), pap2 = M('pap2', '#b99a5c'), pap3 = M('pap3', '#ead29a'), wax = M('wax', '#c81818'), waxD = M('waxD', '#8e1010'), cord = M('rib', '#a03030'), wd = M('postB', '#a8743a');
      box(.72, .035, .6, M('trayW', '#b98a52'), x, t, z, g);
      const T = t + .035;
      // a papyrus roll along x: body, three rolled layers showing at each end, and the little wooden handle knobs of the rod
      const roll = (cx, cz, r, len, rot) => { const gr = new THREE.Group(); gr.position.set(cx, T + r, cz); gr.rotation.y = rot; g.add(gr);
        rod(r, len, 10, pap, 0, 0, 0, gr);
        for (const s of [-1, 1]) { rod(r * .9, .02, 10, pap2, s * (len / 2 + .008), 0, 0, gr); rod(r * .64, .028, 8, pap, s * (len / 2 + .012), 0, 0, gr); rod(r * .38, .036, 8, pap2, s * (len / 2 + .016), 0, 0, gr); rod(r * .2, .05 + r * .6, 6, wd, s * (len / 2 + .03), 0, 0, gr); }
        return gr; };
      // main scroll, tied with a cord and sealed
      const m1 = roll(x, z + .03, .125, .64, .04);
      for (const dx of [-.085, .085]) { const c = add(new THREE.TorusGeometry(.132, .014, 4, 10), cord, dx, 0, 0, m1); c.rotation.y = Math.PI / 2; }
      cyl(.072, .076, .035, 10, wax, 0, .115, 0, m1); cyl(.042, .042, .014, 8, waxD, 0, .15, 0, m1);
      ico(.03, 0, wax, .05, .09, .05, m1, 1, .5, 1);
      for (const [dx, r] of [[.02, .55], [-.015, .75]]) { const b = box(.02, .012, .17, cord, dx, .06, .11, m1); b.rotation.x = r; }
      // the unrolled edge of the sheet flat on the board
      box(.5, .01, .15, pap3, x - .02, T, z + .2, g).rotation.y = .05;
      // second scroll, behind and askew, with a small seal
      const m2 = roll(x - .1, z - .21, .062, .46, -.35); const c2 = add(new THREE.TorusGeometry(.068, .009, 4, 8), cord, .02, 0, 0, m2); c2.rotation.y = Math.PI / 2; cyl(.034, .036, .02, 8, wax, .02, .058, 0, m2);
      // a folded packet, cross-tied
      const pk = new THREE.Group(); pk.position.set(x + .22, T, z - .2); pk.rotation.y = -.4; g.add(pk);
      box(.24, .02, .17, pap3, 0, 0, 0, pk); box(.24, .005, .035, cord, 0, .02, 0, pk); box(.03, .005, .17, cord, 0, .02, 0, pk); cyl(.03, .032, .012, 8, wax, 0, .02, 0, pk);
      return t + .3;
    },
    mask(g, x, y, z) {
      const bz = bronzeM(), d = dk(), wood = M('post', '#c98f50');
      box(.34, .1, .34, M('postB', '#a8743a'), x, y, z, g);
      box(.26, 1.7, .26, wood, x, y + .1, z, g);
      box(.36, .1, .36, M('postB', '#a8743a'), x, y + 1.7, z, g);
      const grp = new THREE.Group(); grp.position.set(x, y + 1.42, z + .15); grp.rotation.z = .08; grp.rotation.x = -.08; g.add(grp);
      ico(.34, 1, bz, 0, 0, 0, grp, .85, 1.15, .5);
      box(.5, .7, .1, bz, 0, 0, -.12, grp);
      for (const s of [-1, 1]) {
        ico(.14, 1, bz, s * .2, -.08, .13, grp, 1, .9, .8);
        box(.14, .07, .12, d, s * .14, .14, .2, grp).rotation.z = -s * .3;
        box(.18, .05, .08, bz, s * .15, .21, .2, grp).rotation.z = s * .35;
      }
      box(.08, .26, .12, bz, 0, .0, .26, grp);
      ico(.07, 0, bz, 0, -.1, .27, grp, 1.2, .7, 1);
      box(.3, .14, .1, d, 0, -.22, .22, grp);
      for (const s of [-1, 1]) box(.14, .1, .1, d, s * .2, -.16, .2, grp).rotation.z = s * .6;
      box(.22, .03, .05, M('teeth', '#f4ecd4'), 0, -.17, .27, grp);
      return y + 1.8;
    },
    goldIngot(g, x, y, z) {
      // a cast gold ingot (trapezoid body, chamfered top, stamped mark) and a spare bar, on a polished black touchstone with gold assay streaks
      const t = plinth(g, x, y, z, .9, .75);
      const stone = M('touchP', '#1d1e26', { roughness: .2, metalness: .3 }), goldM = M('goldM', '#ffd23c', { metalness: .35, roughness: .3, emissive: '#8a6412', emissiveIntensity: .9 });
      const goldD = M('goldD', '#b98a14', { metalness: .4, roughness: .45, emissive: '#2a1c00', emissiveIntensity: .4 }), streak = M('streak', '#e0b030', { metalness: .3, roughness: .4, emissive: '#3a2800', emissiveIntensity: .6 });
      tbox(1.1, .8, 1.02, .72, .08, stone, x, t, z, g);
      const T = t + .08;
      for (const [dx, dz, len, r] of [[-.42, .27, .26, .12], [-.38, .32, .2, .1], [-.3, .35, .12, .08], [.0, .3, .22, -.06], [.06, .35, .15, -.05], [.3, .32, .14, .1]]) { const sk = box(len, .005, .018, streak, x + dx, T, z + dz, g); sk.rotation.y = r; }
      const ig = new THREE.Group(); ig.position.set(x - .14, T, z - .03); ig.rotation.y = .08; g.add(ig);
      tbox(.74, .36, .62, .27, .17, goldM, 0, 0, 0, ig); tbox(.62, .27, .54, .2, .05, goldM, 0, .17, 0, ig);
      box(.22, .01, .11, goldD, -.08, .22, 0, ig); box(.15, .016, .05, goldM, -.08, .22, 0, ig);
      const sp = new THREE.Group(); sp.position.set(x + .38, T, z + .07); sp.rotation.y = -.25; g.add(sp);
      tbox(.28, .17, .23, .12, .1, goldM, 0, 0, 0, sp); tbox(.23, .12, .19, .08, .03, goldM, 0, .1, 0, sp);
      return T + .237;
    },
    amphoraBlue(g, x, y, z) {
      // a hand-thrown amphora: a lathe profile with a toe, belly, neck and flared lip, warped ring by ring (wobble, lean, a slightly oval section), glaze that pools and streaks
      // (vertex colours, a bare clay foot), painted bands, and two uneven handles
      const t = plinth(g, x, y, z, .6, .55);
      const pts = [[0, 0], [.1, 0], [.115, .02], [.112, .05], [.125, .085], [.17, .14], [.215, .22], [.275, .36], [.31, .51], [.3, .64], [.25, .78], [.165, .9], [.108, .98], [.092, 1.03], [.1, 1.08], [.125, 1.125], [.152, 1.16], [.155, 1.19], [.14, 1.2], [.112, 1.185], [0, 1.17]];
      const crv = new THREE.SplineCurve(pts.map(([a, b]) => new THREE.Vector2(a, b))); let prof = crv.getPoints(30).map(v => [Math.max(0, v.x), v.y]); prof[0][0] = 0; prof[prof.length - 1][0] = 0;
      const wob = (a, yy) => 1 + .014 * Math.sin(yy * 9 + 1.3) + .009 * Math.sin(yy * 23 + 4) + .016 * Math.sin(2 * a + yy * 3 + .7) + .008 * Math.sin(3 * a - yy * 5);
      const warp = geo => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), a = Math.atan2(pz, px), r = Math.hypot(px, pz) * wob(a, py);
        p.setXYZ(i, Math.cos(a) * r + .014 * Math.sin(py * 4.2) + py * .018, py, Math.sin(a) * r * 1.03 + .008 * Math.sin(py * 5.1 + 2)); } };
      const body = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 18); warp(body);
      const col = new Float32Array(body.attributes.position.count * 3), c = new THREE.Color(), np = prof.length;
      for (let i = 0; i < body.attributes.position.count; i++) { const col_i = Math.floor(i / np), j = i % np, yy = body.attributes.position.getY(i);
        const bare = yy < .06 ? 1 : 0, glaze = .5 + .5 * Math.sin(yy * 6 + 1) , streak = nz(col_i % 18 * 3.7 + 1) * Math.max(0, .75 - yy) * .5;
        c.set('#4279d9').lerp(new THREE.Color('#2a4fa8'), .22 * (1 - yy / 1.2) + streak * .6).lerp(new THREE.Color('#4f84d6'), .35 * Math.max(0, yy - .85) + .12 * glaze * (yy > .5 ? 1 : 0));
        if (yy < .16 && !bare) c.lerp(new THREE.Color('#2a4f9a'), .0).lerp(new THREE.Color('#8a6a48'), Math.max(0, (.16 - yy) / .09) * .5);
        if (bare) c.set('#b98a5a'); col.set([c.r, c.g, c.b], i * 3); }
      body.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const glz = M('amphV', '#ffffff', { vertexColors: true, flatShading: false, roughness: .3, metalness: .06 });
      const am = new THREE.Group(); am.position.set(x, t, z); am.rotation.z = .012; am.rotation.x = -.008; g.add(am);
      add(body, glz, 0, 0, 0, am);
      // painted bands (thin shells over the body, warped the same way)
      const rAt = yy => { let lo = prof[0]; for (const q of prof) { if (q[1] >= yy) { const f = (yy - lo[1]) / Math.max(1e-4, q[1] - lo[1]); return lo[0] + (q[0] - lo[0]) * f; } lo = q; } return lo[0]; };
      const band = (y0, y1, hex, out = .006) => { const bp = []; for (let k = 0; k <= 2; k++) { const yy = y0 + (y1 - y0) * k / 2; bp.push(new THREE.Vector2(rAt(yy) + out, yy)); } const bg = new THREE.LatheGeometry(bp, 18); warp(bg); return add(bg, M('band' + hex, hex, { roughness: .4, flatShading: false }), 0, 0, 0, am); };
      const cream = '#ead9a8', navy = '#17306c', rust = '#a4502c';
      band(1.0, 1.03, cream); band(.745, .78, cream); band(.715, .735, navy); band(.49, .53, cream, .007); band(.47, .485, rust, .007); band(.3, .325, navy); band(.15, .165, cream);
      band(1.15, 1.17, cream, .004);
      // two handles, a little different from each other (neck to shoulder)
      for (const s of [-1, 1]) { const k = s > 0 ? 1 : 0, w = (a, b) => a + (nz(k * 7 + b) - .5) * .02;
        const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(s * .094, w(1.0, 1), 0), new THREE.Vector3(s * w(.17, 2), w(1.04, 3), 0), new THREE.Vector3(s * w(.225, 4), w(.94, 5), 0), new THREE.Vector3(s * w(.235, 6), w(.84, 7), 0), new THREE.Vector3(s * .2, w(.76, 8), 0)]);
        add(new THREE.TubeGeometry(cv, 10, .029, 6), M('amphH', '#2f63c0', { roughness: .3, metalness: .06 }), 0, 0, 0, am); }
      return t + 1.2;
    },
    lionFountain(g, x, y, z) {
      // a lion-head wall fountain: a stone stele with a round plaque, a bronze lion's face (spiked mane rays in two rings, domed head, heavy brows, eyes, bridge, muzzle, nose, open mouth
      // with fangs and a tongue) whose mouth pours a stream into the round basin in front
      const sA = sandA(), sB = sandB();
      lathe([[0, 0], [.55, 0], [.58, .3], [.52, .42], [.45, .42], [.45, .1], [0, .1]], 14, sA, x, y, z, g);
      torus(.52, .05, sB, x, y + .42, z, g);
      cyl(.46, .46, .02, 14, water(), x, y + .3, z, g).userData.dyn = 1;
      const pz = z - .3;
      box(.7, .1, .46, sB, x, y, pz, g); box(.56, 1.32, .36, sA, x, y + .1, pz, g); box(.7, .08, .46, sB, x, y + 1.42, pz, g);
      const faceZ = pz + .18, cy = y + 1.0;
      const plaq = cyl(.3, .3, .05, 16, M('plaq', '#a98a5c'), 0, 0, 0, g); plaq.rotation.x = Math.PI / 2; plaq.position.set(x, cy, faceZ + .02);
      const L = new THREE.Group(); L.position.set(x, cy, faceZ + .05); L.scale.setScalar(1.15); g.add(L);
      const mane = M('mane', '#a9692a', { metalness: .2, roughness: .5 }), maneL = M('maneL', '#d99a42', { metalness: .2, roughness: .5 }), face = M('lface', '#eeb95c', { metalness: .2, roughness: .5 }), faceD = M('lfaceD', '#b8792c', { metalness: .2, roughness: .5 }), muz = M('lmuz', '#f0c77a', { metalness: .1, roughness: .55 });
      const tooth = M('teeth', '#f4ecd4'), nose = M('lnose', '#3e2412');
      const ray = (rad, len, wd, a, m, zz) => { const o = add(new THREE.ConeGeometry(wd, len, 4), m, Math.cos(a) * (rad + len / 2), Math.sin(a) * (rad + len / 2), zz, L); o.rotation.z = a - Math.PI / 2; o.scale.z = .6; };
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + .1, bot = Math.max(0, -Math.sin(a)); ray(.19, .1 + .06 * bot + .02 * nz(i), .06, a, mane, 0); }
      for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * Math.PI * 2 + .1, bot = Math.max(0, -Math.sin(a)); ray(.14, .08 + .04 * bot, .05, a, maneL, .03); }
      ico(.17, 1, face, 0, .01, .05, L, 1, 1.05, .62);
      for (const s of [-1, 1]) { ico(.05, 0, faceD, s * .15, .19, .02, L); ico(.085, 0, face, s * .105, -.07, .1, L, 1, .9, .75);
        const br = box(.15, .05, .09, faceD, s * .08, .06, .14, L); br.rotation.z = s * .3;
        box(.065, .035, .05, dk(), s * .075, .03, .17, L); ico(.022, 0, M('eyeG', '#ffd45a', { emissive: '#8a5a10', emissiveIntensity: .8 }), s * .075, .028, .2, L);
        ico(.06, 0, muz, s * .06, -.12, .185, L, 1, .8, .9);
      }
      box(.06, .15, .08, face, 0, .0, .15, L);
      box(.2, .1, .13, muz, 0, -.1, .17, L);
      tbox(.1, .06, .08, .045, .05, nose, 0, -.075, .225, L);
      box(.15, .085, .09, dk(), 0, -.215, .19, L);
      box(.12, .035, .1, faceD, 0, -.283, .2, L).rotation.x = .2;
      box(.07, .015, .07, M('tongue', '#b04838'), 0, -.255, .22, L);
      for (const s of [-1, 1]) { cone(.017, .055, 4, tooth, s * .05, -.185, .245, L).rotation.z = Math.PI; cone(.015, .045, 4, tooth, s * .045, -.255, .245, L); }
      // the stream: out of the mouth, arcing down into the basin, with a foam ring where it lands
      const mz = faceZ + .05 + .24, my = cy - .235 + 0;
      const sm = M('stream', '#9bd4f2', { roughness: .1, transparent: true, opacity: .85 });
      const arc = new THREE.CatmullRomCurve3([new THREE.Vector3(x, my, mz), new THREE.Vector3(x, my - .03, mz + .1), new THREE.Vector3(x, my - .15, mz + .16), new THREE.Vector3(x, y + .5, mz + .19), new THREE.Vector3(x, y + .31, mz + .2)]);
      add(new THREE.TubeGeometry(arc, 10, .028, 5), sm, 0, 0, 0, g).userData.dyn = 1;
      const foam = torus(.1, .025, M('foam', '#e8f6fb', { transparent: true, opacity: .85 }), x, y + .315, mz + .2, g); foam.userData.dyn = 1;
      return y + 1.5;
    },
    seaBarrel(g, x, y, z) {
      const wd = M('barW', '#c98a4a');
      lathe([[0, 0], [.4, 0], [.46, .25], [.48, .45], [.46, .65], [.42, .8], [.38, .8], [.38, .74], [0, .74]], 12, wd, x, y, z, g);
      for (const h of [.14, .62]) torus(.44, .025, iron(), x, y + h, z, g);
      cyl(.4, .4, .02, 12, water(), x, y + .77, z, g);
      const w2 = M('wave2', '#a8dcf4', { roughness: .15 });
      for (let i = 0; i < 5; i++) { const a = i * 1.3; ico(.08, 0, w2, x + Math.cos(a) * (.18 + (i % 2) * .12), y + .79, z + Math.sin(a) * (.18 + (i % 2) * .12), g, 1.3, .35, 1.3).userData.dyn = 1; }
      const sh = new THREE.Group(); sh.position.set(x, y + .82, z); sh.rotation.z = .1; g.add(sh); sh.userData.dyn = 1;
      const hl = M('hull', '#8a5428');
      box(.6, .1, .2, hl, 0, 0, 0, sh); box(.2, .14, .18, hl, .36, .05, 0, sh).rotation.z = .4; box(.18, .14, .18, hl, -.32, .05, 0, sh);
      cyl(.02, .02, .66, 4, M('mast', '#5a3a1a'), 0, .08, 0, sh);
      box(.4, .5, .02, M('sail', '#ffffff'), .02, .24, 0, sh);
      box(.05, .12, .02, M('flag', '#d02828'), 0, .72, 0, sh);
      return y + 1.55;
    },
    weathervane(g, x, y, z) {
      const ir = M('ironB', '#2a2a2e', { metalness: .2, roughness: .5 }), bz = bronzeM();
      cyl(.26, .32, .07, 8, ir, x, y, z, g);
      cyl(.045, .055, 1.5, 6, ir, x, y + .07, z, g);
      cyl(.09, .09, .12, 6, ir, x, y + 1.1, z, g);
      box(1.3, .05, .05, ir, x, y + 1.28, z, g);
      for (const s of [-1, 1]) { cone(.1, .26, 4, ir, x + s * .72, y + 1.305, z, g).rotation.z = -s * Math.PI / 2; box(.14, .2, .03, ir, x - s * .62, y + 1.305, z, g); }
      ico(.17, 1, bz, x, y + 1.85, z, g, .8, 1.6, .5);                      // torso
      ico(.12, 1, bz, x + .02, y + 2.17, z, g, 1, 1, .6);                  // head
      box(.07, .12, .06, bz, x + .02, y + 2.31, z, g);                      // crown/spike
      rotz(box(.34, .08, .06, bz, x + .26, y + 2.05, z, g), .7);            // raised arm
      rotz(box(.28, .08, .06, bz, x - .22, y + 1.9, z, g), -.5);
      const tl = add(new THREE.TorusGeometry(.2, .06, 5, 8, Math.PI * 1.5), bz, x - .12, y + 1.52, z, g); tl.rotation.z = Math.PI * .6;
      rotz(cone(.15, .26, 3, bz, x - .36, y + 1.6, z, g), .9);
      rotz(cone(.1, .24, 4, bz, x + .04, y + 1.5, z, g), Math.PI);
      return y + 2.35;
    },
    herm(g, x, y, z) {
      const mb = M('marbleB', '#f6f1e6');
      box(.8, .18, .7, mb, x, y, z, g);
      box(.56, 1.4, .5, mb, x, y + .18, z, g);
      box(.64, .08, .58, mb, x, y + 1.58, z, g);
      for (const s of [-1, 1]) {
        ico(.25, 1, mb, x, y + 1.9, z + s * .06, g, .95, 1.2, .8);
        box(.09, .2, .12, mb, x, y + 1.88, z + s * .27, g);
        box(.34, .05, .1, M('browM', '#9a9282'), x, y + 1.99, z + s * .24, g);
        for (const e of [-1, 1]) ico(.03, 0, dk(), x + e * .09, y + 1.95, z + s * .25, g);
        box(.3, .3, .14, M('beardM', '#d8d0bc'), x, y + 1.6, z + s * .22, g);
        box(.22, .05, .1, M('beardM', '#d8d0bc'), x, y + 1.78, z + s * .27, g);
      }
      return y + 2.2;
    },
    garlandStool(g, x, y, z) {
      const lw = M('stoolW', '#dfaa6a');
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .5; const l = box(.07, .5, .07, lw, x + Math.cos(a) * .22, y, z + Math.sin(a) * .22, g); l.rotation.set(Math.sin(a) * .18, 0, -Math.cos(a) * .18); }
      cyl(.34, .34, .08, 10, M('stoolT', '#eebd7c'), x, y + .48, z, g);
      const gl = gold();
      torus(.22, .045, gl, x, y + .6, z, g);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const c = cone(.055, .17, 4, gl, x + Math.cos(a) * .24, y + .63, z + Math.sin(a) * .24, g); c.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); }
      return y + .7;
    },
    poppyUrn(g, x, y, z) {
      const st = M('urnS', '#e0d6bc');
      lathe([[0, 0], [.14, 0], [.16, .08], [.12, .14], [.22, .3], [.28, .45], [.24, .55], [.21, .52], [0, .52]], 10, st, x, y, z, g);
      box(.36, .05, .36, sandB(), x, y, z, g);
      const gr = M('stem', '#3f8a2c'), rd = M('poppy', '#e01c18'), d = M('pcore', '#201814');
      const heads = [[0, 1.25, 0], [.2, 1.1, .05], [-.22, 1.05, -.05], [.05, 1.0, .25], [-.08, .95, -.26], [.32, .85, -.1], [-.34, .82, .1], [.12, 1.15, -.2], [-.15, 1.12, .18], [.28, .98, .2], [-.28, .96, -.2], [.0, .8, .32]];
      for (const [dx, h, dz] of heads) {
        const len = Math.hypot(dx, h - .5, dz);
        const s = cyl(.016, .016, len, 4, gr, x + dx / 2, y + .5 + (h - .5) / 2, z + dz / 2, g);
        s.rotation.set(dz / len * 1.2, 0, -dx / len * 1.2);
        cyl(.1, .04, .1, 6, rd, x + dx, y + h, z + dz, g);
        ico(.04, 0, d, x + dx, y + h + .04, z + dz, g);
      }
      return y + 1.35;
    },
    sundial(g, x, y, z) {
      const pl = M('sunP', '#e8dabb', {}), pd = M('sunPd', '#cdbb94');
      cyl(.32, .36, .12, 8, pd, x, y, z, g);
      cyl(.15, .22, .65, 8, pl, x, y + .12, z, g);
      cyl(.3, .2, .1, 8, pl, x, y + .77, z, g);
      cyl(.32, .32, .05, 8, pd, x, y + .87, z, g);
      const gn = cone(.11, .38, 3, M('gnom', '#b8a47c'), x, y + 1.13, z, g); gn.scale.set(.4, 1, 1.2);
      const gs = M('grass', '#f2cc3c'), gs2 = M('grass2', '#e0aa28');
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2 + R(-.1, .1), r = .36 + R(0, .2), h = R(.4, .7);
        const c = cone(.045, h, 3, i % 2 ? gs : gs2, x + Math.cos(a) * r, y + h / 2, z + Math.sin(a) * r, g);
        c.rotation.set(Math.sin(a) * .25, 0, -Math.cos(a) * .25);
      }
      return y + 1.32;
    },
    crownCushion(g, x, y, z) {
      const lw = M('standW', '#c98f50');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(.07, .55, .07, lw, x + sx * .36, y, z + sz * .24, g);
      box(.86, .06, .6, lw, x, y + .5, z, g);
      box(.74, .04, .05, lw, x, y + .2, z + .24, g); box(.74, .04, .05, lw, x, y + .2, z - .24, g);
      const red = M('cush', '#e02a2a', {}), gd = gold();
      box(.8, .26, .56, red, x, y + .56, z, g);
      box(.82, .035, .58, gd, x, y + .56, z, g); box(.82, .035, .58, gd, x, y + .79, z, g);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ico(.045, 0, gd, x + sx * .4, y + .65, z + sz * .28, g);
      torus(.24, .04, gd, x, y + .87, z, g);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const c = cone(.055, .2, 4, gd, x + Math.cos(a) * .24, y + .93, z + Math.sin(a) * .24, g); c.rotation.set(Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0); }
      return y + 1.05;
    },
    shieldArrow(g, x, y, z) {
      const w = M('easelW', '#b8803f');
      for (const s of [-1, 1]) { const l = box(.07, 1.3, .07, w, x + s * .32, y, z + .2, g); l.rotation.set(-.12, 0, -s * .12); l.position.y = y + .65; }
      const bk = box(.07, 1.2, .07, w, x, y, z - .35, g); bk.rotation.x = .3; bk.position.y = y + .6;
      box(.8, .06, .06, w, x, y + .5, z + .12, g);
      const bz = bronzeM();
      const sh = new THREE.Group(); sh.position.set(x, y + 1.15, z + .04); sh.rotation.x = Math.PI / 2 - .2; g.add(sh);
      cyl(.5, .5, .07, 14, bz, 0, 0, 0, sh);
      const rim = M('rim', '#e0a850', { metalness: .2, roughness: .5 });
      torus(.5, .035, rim, 0, .035, 0, sh).rotation.x = Math.PI / 2;
      cyl(.3, .3, .03, 10, M('shieldIn', '#f0c060', { metalness: .2, roughness: .5 }), 0, .07, 0, sh);
      const ln = M('lion', '#fff0b0', { metalness: .2, roughness: .5 });
      box(.3, .06, .12, ln, 0, .1, 0, sh); box(.07, .06, .2, ln, .1, .1, .05, sh); box(.07, .06, .2, ln, -.1, .1, .05, sh);
      ico(.07, 0, ln, .17, .12, -.04, sh); box(.2, .05, .04, ln, -.2, .1, .03, sh).rotation.y = .6;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ico(.025, 0, ln, Math.cos(a) * .43, .07, Math.sin(a) * .43, sh); }
      const aw = M('arrowW', '#f0d49a'), wf = M('fletch', '#ffffff');
      const a1 = box(.6, .05, .05, aw, x - .2, y, z + .64, g); a1.position.y = y + .03; a1.rotation.y = .08;
      box(.16, .015, .14, wf, x - .46, y + .05, z + .66, g); box(.16, .015, .14, wf, x - .36, y + .05, z + .66, g);
      const a2 = box(.36, .05, .05, aw, x + .32, y, z + .72, g); a2.position.y = y + .03; a2.rotation.y = -.25;
      cone(.06, .14, 3, iron(), x + .56, y + .03, z + .69, g).rotation.z = -Math.PI / 2;
      return y + 1.15 + .5;
    },
    fowlerTrap(g, x, y, z) {
      const wk = M('wick', '#e6c27a', {}), wk2 = M('wick2', '#c9a050');
      const N = 12, H = 1.0, rb = .52, rt = .05;
      const ang = Math.atan((rb - rt) / H), len = Math.hypot(H, rb - rt), rm = (rb + rt) / 2;
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2;
        const r = box(.04, len, .04, wk, x + Math.cos(a) * rm, y, z + Math.sin(a) * rm, g);
        r.position.y = y + H / 2; r.rotation.set(-Math.sin(a) * ang, 0, Math.cos(a) * ang);
      }
      for (const [h, rr] of [[.06, .52], [.3, .42], [.52, .32], [.72, .22], [.88, .13]]) torus(rr, .022, wk2, x, y + h, z, g);
      cyl(.07, .09, .12, 6, wk2, x, y + H - .04, z, g);
      cyl(.52, .52, .03, 10, wk2, x, y, z, g);
      const figs = ['#7a3a9a', '#8ab838', '#8a3e84', '#9ac040', '#6a3a8a'];
      figs.forEach((c, i) => { const a = i / 5 * Math.PI * 2 + .4; ico(.13, 0, M('fig' + i, c), x + Math.cos(a) * .24, y + .15, z + Math.sin(a) * .24, g, 1, 1.1, 1); });
      ico(.13, 0, M('fig9', '#7a3a9a'), x, y + .16, z, g, 1, 1.1, 1);
      return y + H + .06;
    },
    snakePithos(g, x, y, z) {
      const cl = M('pith', '#d2692e', {});
      lathe([[0, 0], [.2, 0], [.36, .15], [.46, .45], [.44, .72], [.32, .92], [.25, 1.0], [.34, 1.06], [.3, 1.1], [.22, 1.04], [.2, .98], [0, .98]], 10, cl, x, y, z, g);
      const cr = M('crack', '#2a1008');
      rotz(box(.04, .45, .03, cr, x + .3, y + .5, z + .34, g), .35).rotation.y = -.8;
      rotz(box(.04, .26, .03, cr, x + .38, y + .3, z + .26, g), -.4).rotation.y = -1.0;
      rotz(box(.04, .22, .03, cr, x + .22, y + .78, z + .36, g), .6).rotation.y = -.6;
      const sn = M('snake', '#2a2a30', { roughness: .4 });
      cyl(.06, .07, .32, 6, sn, x, y + .9, z, g);
      cyl(.055, .06, .3, 6, sn, x, y + 1.2, z, g);
      rotz(cyl(.05, .055, .22, 6, sn, x + .07, y + 1.5, z, g), -.8);
      ico(.09, 0, sn, x + .2, y + 1.6, z, g, 1.5, .8, 1);
      box(.12, .02, .02, M('tongue', '#e02020'), x + .35, y + 1.58, z, g);
      ico(.015, 0, M('seye', '#f0e040'), x + .2, y + 1.65, z + .06, g);
      return y + 1.7;
    },
  };
}
