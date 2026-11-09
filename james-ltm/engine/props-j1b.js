// See props-james.js for the builder contract.
export function propsB(K) {
  const { THREE, add, cyl, mat, amph, makeFire, FIRES } = K;
  const box = (w, h, d, m, x, y, z, p) => K.box(w, h, d, m, x + w / 2, y, z + d / 2, p); // corner-based
  const M = (k, c, o) => mat('j1b' + k, c, o);
  const flameMat = () => M('flame', '#ff9a2a', { emissive: '#ff6a10', emissiveIntensity: 1.2, roughness: 1 });
  const rotAdd = (geo, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => {
    const o = add(geo, m, x, y, z, parent); o.rotation.set(rx, ry, rz); return o;
  };
  const sheaf = (g, x, y, z, tx, tz, h) => {
    const gr = new THREE.Group(); gr.position.set(x, y, z); gr.rotation.set(tx, 0, tz); g.add(gr);
    const gold = M('gold', '#e2b53e', { roughness: .9 }), gold2 = M('gold2', '#c99a2c', { roughness: .9 });
    const red = M('red', '#c4302b', { roughness: .8 });
    [[0, 0], [.05, 0], [-.05, 0], [0, .05], [0, -.05]].forEach(([a, b], i) => {
      const sx = a * 1.6, sz = b * 1.6;
      add(new THREE.CylinderGeometry(.016, .02, h, 4), gold2, a, h / 2, b, gr);
      rotAdd(new THREE.ConeGeometry(.045, .26, 5), i % 2 ? gold : gold2, sx * 1.2 + a * .3, h + .1, sz * 1.2 + b * .3, gr, b * 1.4, 0, -a * 1.4);
    });
    box(.15, .07, .15, red, -.075, h * .45, -.075, gr);
    return gr;
  };
  const steamMat = () => M('steam', '#f6f6f2', { roughness: 1 });

  return {
    conjurerTable(g, x, y, z) {
      const wood = M('tbl', '#8a5a36'), woodDk = M('tbldk', '#6a4226');
      const h = .55;
      box(.95, .06, .6, wood, x - .475, y + h, z - .3, g);
      [[-.4, -.24], [.4, -.24], [-.4, .24], [.4, .24]].forEach(([a, b]) => box(.07, h, .07, woodDk, x + a - .035, y, z + b - .035, g));
      box(.8, .04, .04, woodDk, x - .4, y + .15, z - .26, g); box(.8, .04, .04, woodDk, x - .4, y + .15, z + .22, g);
      const top = y + h + .06;
      const clay = M('cup', '#b8895a');
      [[0, 0], [-.2, .04], [.2, -.04]].forEach(([a, b]) => cyl(.035, .06, .1, 6, clay, x + a, top, z + b, g));
      add(new THREE.IcosahedronGeometry(.04, 0), M('ball', '#e8e4da'), x + .1, top + .04, z + .12, g);
      const red = M('goblet', '#c4302b', { roughness: .5 });
      [-.36, .36].forEach(a => { cyl(.015, .02, .07, 5, red, x + a, top, z + .1, g); cyl(.045, .02, .08, 6, red, x + a, top + .07, z + .1, g); });
      return top + .1;
    },

    lampstand(g, x, y, z) {
      const br = M('bronzeL', '#9a7030', { metalness: .5, roughness: .5 });
      box(.5, .08, .5, br, x - .25, y, z - .25, g); box(.34, .08, .34, br, x - .17, y + .08, z - .17, g);
      box(.14, .2, .14, br, x - .07, y + .16, z - .07, g);
      box(.06, 1.35, .06, br, x - .03, y + .36, z - .03, g);
      const top = y + 1.62;
      [[.45, 1.2], [.3, 1.32], [.15, 1.44]].forEach(([a, by]) => {
        box(a * 2 + .05, .04, .04, br, x - a - .025, y + by, z - .02, g);
      });
      const fl = flameMat();
      [-.45, -.3, -.15, 0, .15, .3, .45].forEach(a => {
        const aa = Math.abs(a);
        if (aa > 0) box(.035, top - (y + (aa > .4 ? 1.2 : aa > .25 ? 1.32 : 1.44)), .035, br, x + a - .0175, y + (aa > .4 ? 1.2 : aa > .25 ? 1.32 : 1.44), z - .0175, g);
        cyl(.055, .03, .06, 6, br, x + a, top, z, g);
        const f = add(new THREE.ConeGeometry(.035, .13, 5), fl, x + a, top + .12, z, g); f.userData.dyn = 1;
      });
      return top + .18;
    },

    barleyBasket(g, x, y, z) {
      const bk = M('wick', '#b8864a', { roughness: 1 }), bk2 = M('wick2', '#9c6c36', { roughness: 1 });
      cyl(.4, .3, .42, 8, bk, x, y, z, g);
      for (let i = 0; i < 3; i++) cyl(.4 - i * .025 + .01, .4 - i * .025 + .01, .03, 8, bk2, x, y + .08 + i * .12, z, g);
      cyl(.42, .42, .04, 8, bk2, x, y + .4, z, g);
      sheaf(g, x, y + .3, z, 0, 0, .55);
      sheaf(g, x - .15, y + .3, z + .05, .15, .35, .5);
      sheaf(g, x + .15, y + .3, z - .02, -.1, -.35, .5);
      return y + 1.08;
    },

    marbleEar(g, x, y, z) {
      const mb = mat('marble', '#f4f1ea'), st = mat('stone', '#d8d2c4');
      box(1, .3, .7, st, x - .5, y, z - .35, g);
      const bh = 1.2;
      box(.7, bh, .2, mb, x - .35, y + .3, z - .1, g);
      const cy = y + .3 + bh / 2 + .02;
      const sh = M('earsh', '#d8d2c6');
      const h = add(new THREE.TorusGeometry(.24, .07, 4, 8), mb, x, cy, z + .12, g); h.scale.set(.85, 1.3, .6);
      const inner = add(new THREE.IcosahedronGeometry(.13, 0), sh, x - .01, cy - .02, z + .12, g); inner.scale.set(.9, 1.3, .4);
      add(new THREE.IcosahedronGeometry(.07, 0), mb, x + .04, cy - .16, z + .15, g);
      add(new THREE.IcosahedronGeometry(.07, 0), mb, x - .02, cy - .38, z + .13, g).scale.set(1, 1.3, .5);
      return y + .3 + bh;
    },

    cauldron(g, x, y, z) {
      const dk = M('cauldB', '#4a3f2a', { metalness: .4, roughness: .6 });
      const stone = mat('stoneDk', '#8a8274'), ember = M('ember', '#ff5a14', { emissive: '#ff4a10', emissiveIntensity: 1.3, roughness: 1 });
      cyl(.38, .42, .06, 8, ember, x, y, z, g);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const b = box(.18, .13, .14, stone, 0, 0, 0, g); b.position.set(x + Math.cos(a) * .5, y + .065, z + Math.sin(a) * .5); b.rotation.y = -a;
      }
      const fire = makeFire(THREE, { scale: .2, light: false });
      fire.traverse(o => { o.userData.dyn = 1; }); fire.position.set(x, y + .05, z); g.add(fire); FIRES.push(fire);
      const wood = mat('wood', '#8a5a36');
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2 + .5;
        const l = rotAdd(new THREE.CylinderGeometry(.03, .03, .6, 4), wood, x + Math.cos(a) * .26, y + .28, z + Math.sin(a) * .26, g);
        l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5);
      }
      const cy0 = y + .68;
      add(new THREE.SphereGeometry(.42, 8, 6), dk, x, cy0, z, g).scale.set(1, .85, 1);
      cyl(.4, .4, .05, 8, dk, x, cy0 + .33, z, g);
      cyl(.34, .34, .03, 8, M('brew', '#6a5a30'), x, cy0 + .35, z, g);
      const hd = add(new THREE.TorusGeometry(.09, .02, 4, 8), dk, x + .42, cy0 + .12, z, g); hd.rotation.y = Math.PI / 2;
      const st = steamMat();
      add(new THREE.IcosahedronGeometry(.12, 0), st, x + .04, cy0 + .5, z, g).userData.dyn = 1;
      add(new THREE.IcosahedronGeometry(.11, 0), st, x - .05, cy0 + .72, z + .04, g).userData.dyn = 1;
      add(new THREE.IcosahedronGeometry(.09, 0), st, x + .07, cy0 + .9, z - .03, g).userData.dyn = 1;
      add(new THREE.IcosahedronGeometry(.07, 0), st, x, cy0 + 1.06, z, g).userData.dyn = 1;
      return cy0 + 1.13;
    },

    washbasin(g, x, y, z) {
      const st = mat('stone', '#d8d2c4'), stD = mat('stoneDk', '#8a8274');
      cyl(.3, .3, .06, 8, stD, x, y, z, g);
      cyl(.17, .22, .66, 8, st, x, y + .06, z, g);
      cyl(.5, .26, .28, 8, st, x, y + .66, z, g);
      cyl(.5, .5, .05, 8, stD, x, y + .92, z, g);
      cyl(.42, .42, .02, 8, M('water', '#8a9096', { roughness: .3, metalness: .2 }), x, y + .93, z, g);
      const tn = M('tunic', '#6a4a2c', { roughness: 1 });
      box(.5, .05, .22, tn, x - .25, y + .97, z + .3, g).rotation.x = .1;
      box(.46, .38, .04, tn, x - .23, y + .6, z + .5, g);
      box(.24, .04, .3, tn, x + .12, y + .96, z + .34, g);
      return y + .97;
    },

    malletBlock(g, x, y, z) {
      const lm = M('lime', '#e0d6c0', { roughness: 1 }), lm2 = M('lime2', '#cfc4aa', { roughness: 1 });
      box(.9, .6, .6, lm, x - .45, y, z - .3, g);
      box(.4, .22, .4, lm2, x - .2, y + .6, z - .2, g).rotation.y = .3;
      const wood = M('mwood', '#7a5030'), iron = M('iron', '#5a5e62', { metalness: .6, roughness: .5 });
      const top = y + .6;
      cyl(.025, .025, .38, 5, wood, 0, 0, 0, g).position.set(x - .3, top + .03, z + .18);
      const hnd = g.children[g.children.length - 1]; hnd.rotation.z = Math.PI / 2; hnd.rotation.y = .3;
      add(new THREE.BoxGeometry(.12, .1, .1), wood, x - .15, top + .08, z + .12, g).rotation.y = .3;
      box(.22, .025, .04, iron, x + .12, top, z + .18, g).rotation.y = -.5;
      return top + .22;
    },

    mirror(g, x, y, z) {
      const wood = M('mirwood', '#7a5030'), bz = M('mirbz', '#e0b04a', { metalness: .9, roughness: .15 });
      const bzd = M('mirbzd', '#a67a2a', { metalness: .6, roughness: .4 });
      box(.55, .08, .35, wood, x - .275, y, z - .175, g);
      cyl(.04, .05, .62, 6, wood, x, y + .08, z, g);
      const hnd = cyl(.03, .035, .32, 6, bzd, x, y + .5, z, g);
      const cy0 = y + 1.05;
      rotAdd(new THREE.CylinderGeometry(.32, .32, .035, 10), bz, x, cy0, z, g, Math.PI / 2);
      rotAdd(new THREE.TorusGeometry(.32, .03, 4, 10), bzd, x, cy0, z, g);
      add(new THREE.IcosahedronGeometry(.05, 0), bzd, x, cy0 + .36, z, g);
      return cy0 + .41;
    },

    waxTablet(g, x, y, z) {
      const wood = M('wtwood', '#8a5a36'), woodDk = M('wtdk', '#6a4226'), wax = M('wax', '#3a2c22', { roughness: .6 });
      box(.5, .06, .4, woodDk, x - .25, y, z - .2, g);
      cyl(.09, .13, .6, 6, wood, x, y + .06, z, g);
      const gr = new THREE.Group(); gr.position.set(x, y + .7, z); gr.rotation.x = -.45; g.add(gr);
      box(.7, .04, .5, wood, -.35, -.02, -.25, gr);
      box(.55, .03, .4, woodDk, -.275, .02, -.2, gr);
      box(.46, .02, .31, wax, -.23, .05, -.155, gr);
      box(.04, .02, .5, woodDk, -.02, .02, -.25, gr);
      const sty = add(new THREE.CylinderGeometry(.008, .014, .26, 4), M('stylus', '#c9c4b8', { metalness: .5 }), .3, .07, .05, gr);
      sty.rotation.set(Math.PI / 2, 0, .4);
      return y + .78;
    },

    shackleStele(g, x, y, z) {
      const st = mat('stone', '#bfb2a0'), stD = mat('stoneDk', '#8a8274');
      const iron = M('shk', '#4a4e52', { metalness: .6, roughness: .5 });
      box(.85, .14, .5, stD, x - .425, y, z - .25, g);
      box(.66, 1.55, .2, st, x - .33, y + .14, z - .1, g);
      box(.74, .1, .26, st, x - .37, y + 1.69, z - .13, g);
      for (let i = 0; i < 4; i++) box(.4 - (i % 2) * .08, .03, .02, stD, x - .2, y + 1.42 - i * .1, z + .1, g);
      for (let i = 0; i < 3; i++) box(.4, .03, .02, stD, x - .2, y + .45 - i * .1, z + .1, g);
      const pegY = y + 1.0;
      rotAdd(new THREE.CylinderGeometry(.025, .03, .2, 5), iron, x, pegY, z + .2, g, Math.PI / 2);
      [-.09, .09].forEach(a => {
        box(.025, .22, .025, iron, x + a * .5 - .0125, pegY - .22, z + .22, g);
        const r = add(new THREE.TorusGeometry(.075, .022, 4, 7, 5), iron, x + a, pegY - .32, z + .22, g);
        r.rotation.z = Math.PI / 2 + 1.2 * (a > 0 ? 1 : -1) + Math.PI / 2 * 0;
      });
      return y + 1.79;
    },

    bridlePost(g, x, y, z) {
      const wood = M('bpw', '#7a5030'), woodDk = M('bpwd', '#5a3820');
      const lth = M('leather', '#6a3a1c', { roughness: .8 }), mt = M('bit', '#a8acb0', { metalness: .7, roughness: .3 });
      box(.5, .1, .5, woodDk, x - .25, y, z - .25, g);
      cyl(.07, .09, 1.4, 6, wood, x, y + .1, z, g);
      cyl(.1, .07, .05, 6, woodDk, x, y + 1.5, z, g);
      rotAdd(new THREE.CylinderGeometry(.025, .03, .3, 5), wood, x, y + 1.3, z + .15, g, Math.PI / 2);
      const hy = y + 1.0;
      add(new THREE.TorusGeometry(.17, .018, 4, 10), lth, x, hy, z + .26, g).scale.set(.8, 1.2, 1);
      box(.04, .35, .02, lth, x - .15, hy + .22, z + .26, g);
      box(.04, .35, .02, lth, x + .15, hy + .22, z + .26, g);
      add(new THREE.TorusGeometry(.14, .015, 4, 8), lth, x, hy - .1, z + .26, g);
      rotAdd(new THREE.CylinderGeometry(.015, .015, .34, 5), mt, x, hy - .27, z + .26, g, 0, 0, Math.PI / 2);
      [-.18, .18].forEach(a => {
        add(new THREE.TorusGeometry(.045, .012, 4, 8), mt, x + a, hy - .27, z + .26, g);
        box(.02, .5, .012, lth, x + a * 1.1 - .01, hy - .8, z + .28, g);
      });
      return y + 1.55;
    },

    breadBasket(g, x, y, z) {
      const bk = M('wick', '#b8864a', { roughness: 1 }), bk2 = M('wick2', '#9c6c36', { roughness: 1 });
      const bx = x - .15;
      cyl(.36, .27, .3, 8, bk, bx, y, z, g);
      cyl(.38, .38, .04, 8, bk2, bx, y + .3, z, g);
      cyl(.37, .37, .03, 8, bk2, bx, y + .12, z, g);
      const b1 = M('bread', '#c98a4a', { roughness: 1 }), b2 = M('bread2', '#b8743a', { roughness: 1 });
      const lf = (a, b, c, k) => { add(new THREE.IcosahedronGeometry(.17, 0), k ? b1 : b2, a, y + .3, b, g).scale.set(1, .75, 1); };
      lf(x, z, 0, 1);
      lf(bx - .15, z, 0, 0); lf(bx, z - .17, 0, 1); lf(bx, z + .17, 0, 0); lf(bx - .12, z + .15, 0, 1);
      add(new THREE.IcosahedronGeometry(.15, 0), b2, bx - .05, y + .42, z, g).scale.set(1, .75, 1);
      // toy horse on wheels
      const hx = x + .42, hz = z + .05;
      const wood = M('toyw', '#c49464'), woodDk = M('toywd', '#7a5030');
      box(.3, .025, .1, woodDk, hx - .15, y + .07, hz - .05, g);
      [[-.1, -.06], [.1, -.06], [-.1, .06], [.1, .06]].forEach(([a, b]) => {
        const w = add(new THREE.CylinderGeometry(.04, .04, .02, 6), woodDk, hx + a, y + .04, hz + b * 1.05, g); w.rotation.x = Math.PI / 2;
      });
      box(.18, .1, .07, wood, hx - .09, y + .1, hz - .035, g);
      box(.04, .12, .05, wood, hx + .05, y + .2, hz - .025, g).rotation.z = -.3;
      box(.09, .05, .045, wood, hx + .09, y + .28, hz - .0225, g);
      box(.03, .06, .04, wood, hx - .08, y + .2, hz - .02, g);
      return y + .42;
    },
  };
}
