// See props-james.js for the builder contract.
export function propsA(K) {
  const { THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES } = K;
  const M = (k, c, o) => mat('jA' + k, c, o);
  const lathe = (pts, seg, m, x, y, z, g) => add(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), m, x, y, z, g);
  const ico = (r, d, m, x, y, z, g, sx = 1, sy = 1, sz = 1) => { const o = add(new THREE.IcosahedronGeometry(r, d), m, x, y, z, g); o.scale.set(sx, sy, sz); return o; };
  const cone = (r, h, s, m, x, y, z, g) => add(new THREE.ConeGeometry(r, h, s), m, x, y, z, g);
  const torus = (r, t, m, x, y, z, g, rx = Math.PI / 2) => { const o = add(new THREE.TorusGeometry(r, t, 5, 14), m, x, y, z, g); o.rotation.x = rx; return o; };
  const plinth = (g, x, y, z, w, h) => { box(w + .16, .08, w + .16, 'stoneDk', x, y, z, g); box(w, h - .16, w, 'stone', x, y + .08, z, g); box(w + .16, .08, w + .16, 'stoneDk', x, y + h - .08, z, g); return y + h; };
  const gold = () => M('gold', '#f2c230', { metalness: .3, roughness: .35, emissive: '#7a5a10', emissiveIntensity: .6 });
  const bronzeM = () => M('bz', '#c88a48', { metalness: .3, roughness: .45, emissive: '#4a2a10', emissiveIntensity: .4 });
  const water = () => M('water', '#3f8fc8', { roughness: .15, metalness: .1 });

  return {
    letter(g, x, y, z) {
      const t = plinth(g, x, y, z, .8, .8);
      const sc = cyl(.075, .075, .5, 8, M('pap', '#e8d6a8'), x, t + .075, z, g); sc.rotation.z = Math.PI / 2; sc.position.y = t + .08;
      for (const s of [-1, 1]) { const e = cyl(.06, .06, .03, 8, M('pap2', '#c9b27c'), x + s * .26, t + .08, z, g); e.rotation.z = Math.PI / 2; }
      box(.06, .165, .17, M('band', '#a56a3a'), x - .08, t, z, g).position.y = t + .08;
      const seal = cyl(.06, .06, .03, 8, M('wax', '#b01e1e'), x, t + .16, z, g);
      return t + .2;
    },
    mask(g, x, y, z) {
      box(.14, .08, .16, 'dark', x, y, z, g);
      box(.16, 1.8, .16, 'woodLt', x, y, z, g);
      const bz = bronzeM(), dk = M('mdark', '#1a0e08');
      const my = y + 1.5, fz = z + .1;
      // face plate
      ico(.3, 1, bz, x, my, fz, g, .9, 1.2, .4);
      // raised cheeks
      for (const s of [-1, 1]) ico(.11, 0, bz, x + s * .17, my - .1, fz + .1, g, 1, .9, .6);
      // brows (arched, angled up outward)
      for (const s of [-1, 1]) { box(.17, .045, .05, M('mbrow', '#7a4a1e'), x + s * .12, my + .21, fz + .15, g).rotation.z = s * .4; }
      // eye holes
      for (const s of [-1, 1]) box(.1, .06, .04, dk, x + s * .12, my + .12, fz + .17, g).rotation.z = -s * .25;
      // nose
      box(.07, .16, .08, bz, x, my + .0, fz + .2, g);
      // wide grinning mouth: dark crescent of boxes curving up at the ends
      box(.26, .08, .04, dk, x, my - .2, fz + .17, g);
      for (const s of [-1, 1]) box(.14, .06, .04, dk, x + s * .2, my - .14, fz + .15, g).rotation.z = s * .7;
      box(.2, .03, .04, M('mteeth', '#ece2c8'), x, my - .165, fz + .185, g);
      return y + 1.9;
    },
    goldIngot(g, x, y, z) {
      const t = plinth(g, x, y, z, .85, .75);
      box(.95, .08, .65, M('touch', '#16161a'), x, t, z, g);
      box(.62, .12, .32, gold(), x, t + .08, z, g); box(.46, .1, .24, gold(), x, t + .2, z, g);
      return t + .3;
    },
    amphoraBlue(g, x, y, z) {
      const t = plinth(g, x, y, z, .6, .55);
      const bl = M('blue', '#4f7ae0', { roughness: .3, metalness: .1, emissive: '#1a2a60', emissiveIntensity: .5 });
      lathe([[0, 0], [.1, 0], [.2, .08], [.3, .3], [.31, .5], [.24, .75], [.13, .98], [.12, 1.08], [.17, 1.16], [.15, 1.2], [0, 1.2]], 10, bl, x, t, z, g);
      for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(.17, .03, 4, 8, Math.PI), bl, x + s * .15, t + .95, z, g); h.rotation.z = s * Math.PI / 2 + (s > 0 ? 0 : 0); h.scale.set(1, 1, 1); }
      return t + 1.2;
    },
    lionFountain(g, x, y, z) {
      lathe([[0, 0], [.55, 0], [.58, .3], [.52, .42], [.45, .42], [.45, .1], [0, .1]], 12, 'stone', x, y, z, g);
      cyl(.45, .45, .02, 12, water(), x, y + .3, z, g).userData.dyn = 1;
      box(.34, 1.45, .3, 'stone', x, y, z, g);
      box(.42, .08, .38, 'stoneDk', x, y + 1.45, z, g);
      const bz = bronzeM();
      ico(.2, 0, M('mane', '#8a5a2a', { metalness: .4, roughness: .5 }), x, y + 1.1, z + .2, g, 1.1, 1.1, .6);
      ico(.13, 0, bz, x, y + 1.08, z + .3, g, 1, 1, .8);
      box(.1, .08, .12, bz, x, y + .98, z + .38, g);
      const st = box(.07, .6, .07, M('stream', '#6fb4de', { roughness: .1, transparent: true, opacity: .85 }), x, y + .35, z + .4, g); st.userData.dyn = 1;
      return y + 1.53;
    },
    seaBarrel(g, x, y, z) {
      lathe([[0, 0], [.4, 0], [.46, .25], [.48, .45], [.46, .65], [.4, .8], [.36, .8], [.36, .74], [0, .74]], 12, 'wood', x, y, z, g);
      for (const h of [.14, .62]) torus(h < .3 ? .43 : .43, .02, iron(), x, y + h, z, g);
      cyl(.38, .38, .02, 12, water(), x, y + .72, z, g);
      const w = M('wave', '#4a9ad0', { roughness: .15 }), w2 = M('wave2', '#86c4ea', { roughness: .15 });
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .06 + (i % 4) * .08; ico(.11, 0, i % 2 ? w : w2, x + Math.cos(a) * r * 1.4, y + .76, z + Math.sin(a) * r * 1.4, g, 1, .7, 1).userData.dyn = 1; }
      const sh = new THREE.Group(); sh.position.set(x, y + .8, z); sh.rotation.z = .12; g.add(sh); sh.userData.dyn = 1;
      box(.4, .08, .14, 'wood', 0, 0, 0, sh); box(.14, .1, .12, 'wood', .24, .04, 0, sh).rotation.z = .4;
      cyl(.012, .012, .45, 4, 'woodLt', 0, .05, 0, sh);
      box(.22, .26, .015, M('sail', '#f0e6cc'), .04, .2, 0, sh);
      return y + 1.3;
    },
    weathervane(g, x, y, z) {
      const ir = iron(), bz = bronzeM();
      cyl(.24, .3, .06, 8, ir, x, y, z, g);
      cyl(.04, .05, 1.65, 6, ir, x, y + .06, z, g);
      cyl(.08, .08, .1, 6, ir, x, y + 1.15, z, g);
      box(1.2, .045, .045, ir, x, y + 1.3, z, g);
      for (const s of [-1, 1]) { cone(.09, .22, 4, ir, x + s * .68, y + 1.3225, z, g).rotation.z = -s * Math.PI / 2; box(.12, .18, .03, ir, x - s * .6, y + 1.3225, z, g); }
      // triton: torso, head, raised arm, curled tail
      ico(.15, 1, bz, x, y + 1.82, z, g, .8, 1.5, .5);
      ico(.1, 1, bz, x + .02, y + 2.08, z, g, 1, 1, .6);
      box(.06, .1, .05, bz, x + .02, y + 2.2, z, g);
      const arm = box(.28, .06, .05, bz, x + .22, y + 2.0, z, g); arm.rotation.z = .6;
      const arm2 = box(.24, .06, .05, bz, x - .2, y + 1.88, z, g); arm2.rotation.z = -.5;
      const tl = add(new THREE.TorusGeometry(.17, .05, 5, 8, Math.PI * 1.5), bz, x - .12, y + 1.55, z, g); tl.rotation.z = Math.PI * .6;
      cone(.12, .22, 3, bz, x - .32, y + 1.62, z, g).rotation.z = .9;
      cone(.09, .2, 4, bz, x + .02, y + 1.58, z, g).rotation.z = Math.PI;
      return y + 2.3;
    },
    herm(g, x, y, z) {
      box(.62, .14, .5, 'marble', x, y, z, g);
      const p = cyl(.22, .27, 1.35, 4, 'marble', x, y + .14, z, g); p.rotation.y = Math.PI / 4; p.scale.set(1, 1, .85);
      box(.3, .06, .3, 'marble', x, y + 1.49, z, g);
      for (const s of [-1, 1]) {
        const hz = s * .09;
        ico(.2, 1, 'marble', x, y + 1.72, z + hz, g, .85, 1.1, .8);
        box(.04, .09, .05, 'marble', x, y + 1.68, z + s * .2, g);
        cone(.12, .26, 5, M('beard', '#d6cfc0'), x, y + 1.52, z + s * .17, g).rotation.x = s * .2 + Math.PI;
        box(.14, .03, .03, M('brow', '#b5ad9c'), x, y + 1.74, z + s * .2, g);
      }
      return y + 1.95;
    },
    garlandStool(g, x, y, z) {
      const w = 'wood';
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .5; const l = box(.06, .5, .06, w, x + Math.cos(a) * .2, y, z + Math.sin(a) * .2, g); l.rotation.set(Math.sin(a) * .18, 0, -Math.cos(a) * .18); }
      cyl(.3, .3, .07, 10, 'woodLt', x, y + .48, z, g);
      const gl = M('garl', '#e2b52a', { metalness: .5, roughness: .4 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const c = cone(.04, .14, 4, gl, x + Math.cos(a) * .17, y + .59, z + Math.sin(a) * .17, g); c.rotation.set(Math.PI / 2 * Math.sin(a) * .0, 0, 0); c.rotation.z = Math.PI / 2 - a * 0; c.rotation.y = -a; c.rotation.z = Math.PI / 2; }
      torus(.17, .025, gl, x, y + .56, z, g);
      return y + .6;
    },
    poppyUrn(g, x, y, z) {
      lathe([[0, 0], [.12, 0], [.14, .08], [.1, .14], [.2, .3], [.26, .45], [.22, .55], [.2, .52], [0, .52]], 10, 'stone', x, y, z, g);
      box(.34, .05, .34, 'stoneDk', x, y, z, g);
      const gr = M('stem', '#4a7a30'), rd = M('poppy', '#d02a24'), dk = M('pcore', '#201814');
      const heads = [[0, 1.2, 0, 0], [.2, 1.05, .05, .3], [-.22, 1.0, -.05, -.35], [.05, .95, .24, .0], [-.05, .9, -.25, 0], [.3, .78, -.1, .7], [-.32, .75, .1, -.7]];
      for (const [dx, h, dz, tilt] of heads) {
        const len = Math.hypot(dx, h - .5, dz);
        const st = cyl(.012, .012, len, 4, gr, x + dx / 2, y + .5 + (h - .5) / 2, z + dz / 2, g);
        st.rotation.set(dz / len * 1.2, 0, -dx / len * 1.2);
        ico(.07, 0, rd, x + dx, y + h, z + dz, g, 1.2, .6, 1.2);
        ico(.025, 0, dk, x + dx, y + h + .02, z + dz, g);
      }
      return y + 1.28;
    },
    sundial(g, x, y, z) {
      const st = 'stone';
      cyl(.3, .34, .12, 8, 'stoneDk', x, y, z, g);
      cyl(.14, .2, .65, 8, st, x, y + .12, z, g);
      cyl(.28, .18, .1, 8, st, x, y + .77, z, g);
      cyl(.3, .3, .05, 8, 'stoneDk', x, y + .87, z, g);
      const gn = cone(.1, .34, 3, M('gnom', '#8a7a62'), x, y + 1.1, z, g); gn.scale.set(.4, 1, 1.2);
      const gs = M('grass', '#d8b438');
      for (let i = 0; i < 20; i++) {
        const a = i / 20 * Math.PI * 2 + R(-.1, .1), r = .38 + R(0, .18), h = R(.35, .6);
        const c = cone(.035, h, 3, gs, x + Math.cos(a) * r, y + h / 2, z + Math.sin(a) * r, g);
        c.rotation.set(Math.sin(a) * .25, 0, -Math.cos(a) * .25);
      }
      return y + 1.27;
    },
    crownCushion(g, x, y, z) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(.06, .55, .06, 'wood', x + sx * .3, y, z + sz * .2, g);
      box(.7, .05, .5, 'wood', x, y + .5, z, g);
      box(.62, .03, .04, 'wood', x, y + .2, z + .2, g); box(.62, .03, .04, 'wood', x, y + .2, z - .2, g);
      const red = M('cush', '#a02024'), gd = gold();
      box(.62, .14, .44, red, x, y + .55, z, g);
      box(.64, .03, .46, gd, x, y + .55, z, g); box(.64, .03, .46, gd, x, y + .66, z, g);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ico(.03, 0, gd, x + sx * .32, y + .6, z + sz * .22, g);
      torus(.2, .02, gd, x, y + .73, z, g);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const c = cone(.04, .14, 4, gd, x + Math.cos(a) * .2, y + .77, z + Math.sin(a) * .2, g); c.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); }
      return y + .71;
    },
    shieldArrow(g, x, y, z) {
      const w = 'wood';
      for (const s of [-1, 1]) { const l = box(.06, 1.3, .06, w, x + s * .3, y, z + .2, g); l.rotation.set(-.12, 0, -s * .12); l.position.y = y + .65; }
      const bk = box(.06, 1.2, .06, w, x, y, z - .35, g); bk.rotation.x = .3; bk.position.y = y + .6;
      box(.7, .05, .05, w, x, y + .55, z + .12, g);
      const bz = M('shield', '#e8b862', { metalness: .3, roughness: .4, emissive: '#6a4a18', emissiveIntensity: .5 });
      const sh = new THREE.Group(); sh.position.set(x, y + 1.15, z + .04); sh.rotation.x = Math.PI / 2 - .2; g.add(sh);
      cyl(.46, .46, .06, 14, bz, 0, 0, 0, sh).position.y = 0;
      const rim = torus(.46, .03, M('rim', '#a8702a', { metalness: .5 }), 0, .03, 0, sh, Math.PI / 2);
      rim.rotation.x = Math.PI / 2;
      cyl(.2, .2, .03, 10, M('shieldIn', '#e0b058', { metalness: .6, roughness: .3 }), 0, .03, 0, sh);
      const dk = M('lion', '#8a5a1e', { metalness: .5 });
      box(.2, .03, .1, dk, 0, .06, 0, sh); box(.06, .03, .14, dk, .08, .06, .04, sh); ico(.04, 0, dk, -.1, .06, .03, sh);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ico(.017, 0, dk, Math.cos(a) * .4, .05, Math.sin(a) * .4, sh); }
      // snapped arrow
      const a1 = box(.36, .02, .02, 'woodLt', x - .1, y, z + .62, g); a1.position.y = y + .02; a1.rotation.y = .08;
      const a2 = box(.2, .02, .02, 'woodLt', x + .3, y, z + .66, g); a2.position.y = y + .02; a2.rotation.y = -.2;
      cone(.03, .07, 3, iron(), x + .42, y + .02, z + .63, g).rotation.z = -Math.PI / 2;
      box(.05, .01, .05, M('fletch', '#e8e0d0'), x - .3, y + .02, z + .62, g);
      return y + 1.15 + .46;
    },
    fowlerTrap(g, x, y, z) {
      const wk = M('wick', '#b88a48');
      const N = 10, H = 1.0, rb = .5, rt = .05;
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2, rm = (rb + rt) / 2;
        const len = Math.hypot(H, rb - rt);
        const r = box(.03, len, .03, wk, x + Math.cos(a) * rm, y, z + Math.sin(a) * rm, g);
        r.position.y = y + H / 2; r.rotation.set(-Math.sin(a) * Math.atan((rb - rt) / H), 0, Math.cos(a) * Math.atan((rb - rt) / H));
      }
      for (const [h, rr] of [[.06, .5], [.3, .41], [.52, .32], [.72, .22], [.88, .13]]) torus(rr, .018, wk, x, y + h, z, g);
      cyl(.06, .08, .1, 6, wk, x, y + H - .04, z, g);
      cyl(.5, .5, .03, 10, M('wickb', '#9a7438'), x, y, z, g);
      const figs = ['#6a3a6a', '#587a38', '#7a3e64', '#6a8a3e'];
      figs.forEach((c, i) => { const a = i / 4 * Math.PI * 2 + .4; ico(.09, 0, M('fig' + i, c), x + Math.cos(a) * .2, y + .12, z + Math.sin(a) * .2, g, 1, 1.1, 1); });
      ico(.09, 0, M('fig5', '#6a3a6a'), x, y + .12, z, g);
      return y + H + .06;
    },
    snakePithos(g, x, y, z) {
      const cl = M('pith', '#c8743e');
      lathe([[0, 0], [.2, 0], [.36, .15], [.46, .45], [.44, .72], [.32, .92], [.25, 1.0], [.27, 1.04], [.22, 1.04], [.2, .98], [0, .98]], 10, cl, x, y, z, g);
      const dk = M('crack', '#3a1c10');
      const c1 = box(.025, .35, .02, dk, x + .3, y + .55, z + .34, g); c1.rotation.set(0, -.8, .35);
      const c2 = box(.025, .2, .02, dk, x + .36, y + .38, z + .28, g); c2.rotation.set(0, -1.0, -.4);
      const sn = M('snake', '#1a1a1c');
      cyl(.04, .05, .3, 6, sn, x, y + .95, z, g);
      cyl(.04, .04, .25, 6, sn, x, y + 1.2, z, g);
      const bend = cyl(.035, .04, .18, 6, sn, x + .06, y + 1.4, z, g); bend.rotation.z = -.9;
      const hd = box(.14, .05, .07, sn, x + .17, y + 1.46, z, g); hd.rotation.z = -.2;
      box(.01, .01, .04, M('tongue', '#c02020'), x + .25, y + 1.45, z, g);
      return y + 1.5;
    },
  };
}
