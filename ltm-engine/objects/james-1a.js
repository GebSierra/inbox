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

  return {
    letter(g, x, y, z) {
      const t = plinth(g, x, y, z, .8, .8);
      const pap = M('pap', '#f4e2b0'), pap2 = M('pap2', '#d8bf84');
      const sc = cyl(.12, .12, .7, 8, pap, x, t + .12, z, g); sc.rotation.z = Math.PI / 2;
      for (const s of [-1, 1]) { const e = cyl(.09, .09, .04, 8, pap2, x + s * .35, t + .12, z, g); e.rotation.z = Math.PI / 2; }
      cyl(.135, .135, .05, 10, M('wax', '#c81818'), x, t + .12, z, g).rotation.z = Math.PI / 2;
      const rb = M('rib', '#a03030');
      for (const [dx, dz, r] of [[.04, .2, .3], [-.04, .22, -.3], [.0, .14, 0]]) { const b = box(.035, .015, .2, rb, x + dx, t + .02, z + dz, g); b.rotation.y = r; }
      return t + .26;
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
      const t = plinth(g, x, y, z, .9, .75);
      box(1.1, .08, .8, M('touch', '#141418'), x, t, z, g);
      const b = cyl(.2, .27, .3, 4, gold(), x, t + .08, z, g); b.rotation.y = Math.PI / 4; b.scale.set(2.4, 1, 1.35);
      return t + .38;
    },
    amphoraBlue(g, x, y, z) {
      const t = plinth(g, x, y, z, .6, .55);
      const bl = M('blue', '#3a72d0', { roughness: .3, metalness: .1 });
      lathe([[0, 0], [.1, 0], [.2, .08], [.3, .3], [.31, .5], [.24, .75], [.13, .98], [.12, 1.08], [.13, 1.14], [.19, 1.18], [.19, 1.22], [0, 1.22]], 14, bl, x, t, z, g);
      for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(.17, .035, 4, 8, Math.PI), bl, x + s * .15, t + .95, z, g); h.rotation.z = s * Math.PI / 2; }
      return t + 1.2;
    },
    lionFountain(g, x, y, z) {
      lathe([[0, 0], [.55, 0], [.58, .3], [.52, .42], [.45, .42], [.45, .1], [0, .1]], 12, sandA(), x, y, z, g);
      cyl(.46, .46, .02, 12, water(), x, y + .3, z, g).userData.dyn = 1;
      box(.4, 1.4, .36, sandA(), x, y, z, g);
      box(.48, .08, .44, sandB(), x, y + 1.4, z, g);
      const bz = bronzeM(), mane = M('mane', '#b8782e', { metalness: .2, roughness: .5 });
      const ly = y + 1.08, lz = z + .2;
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ico(.12, 0, mane, x + Math.cos(a) * .2, ly + Math.sin(a) * .2, lz - .02, g, 1, 1, .9); }
      ico(.2, 0, mane, x, ly, lz - .04, g);
      box(.3, .3, .2, bz, x, ly - .15, lz + .08, g);
      box(.2, .15, .18, bz, x, ly - .22, lz + .26, g);
      box(.14, .07, .06, dk(), x, ly - .07, lz + .36, g);
      box(.34, .06, .1, bz, x, ly + .02, lz + .22, g);
      for (const s of [-1, 1]) { ico(.04, 0, dk(), x + s * .08, ly - .02, lz + .3, g); ico(.06, 0, bz, x + s * .17, ly + .15, lz + .03, g); }
      box(.1, .07, .08, dk(), x, ly - .3, lz + .34, g);
      const st = box(.12, .62, .1, M('stream', '#9bd4f2', { roughness: .1, transparent: true, opacity: .85 }), x, y + .34, z + .5, g); st.userData.dyn = 1;
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
