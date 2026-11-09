// See props-james.js for the builder contract. K.box/K.cyl take x,z as the centre.
export function propsB(K) {
  const { THREE, add, box, cyl, mat, makeFire, FIRES } = K;
  const M = (k, c, o) => mat('j1b' + k, c, o);
  const rot = (o, rx = 0, ry = 0, rz = 0) => { o.rotation.set(rx, ry, rz); return o; };
  const bronze = () => M('bronze', '#c8913c', { metalness: .6, roughness: .35 });
  const woodLt = () => M('woodlt', '#c49464', { roughness: .9 });
  const woodMd = () => M('woodmd', '#a87846', { roughness: .9 });
  const woodDk = () => M('wooddk', '#7a5434', { roughness: .9 });
  const wick = () => M('wick', '#e0b068', { roughness: 1 });
  const wickDk = () => M('wickdk', '#bd8744', { roughness: 1 });
  const red = () => M('red', '#d23a2c', { roughness: .5 });
  const gold = () => M('gold', '#eec24a', { roughness: .85 });
  const gold2 = () => M('gold2', '#d9a735', { roughness: .85 });
  const white = () => M('white', '#f4f4f0', { roughness: .8 });
  const cream = () => M('cream', '#f2e6c8', { roughness: 1 });
  const stoneLt = () => M('stonelt', '#e6dcc4', { roughness: 1 });
  const iron = () => M('iron', '#5e656c', { metalness: .5, roughness: .45 });
  const flame = () => M('flame', '#ff8a1a', { emissive: '#ff6a10', emissiveIntensity: 1.8, roughness: 1 });

  const sheaf = (g, x, y, z, tx, tz, h) => {
    const gr = new THREE.Group(); gr.position.set(x, y, z); gr.rotation.set(tx, 0, tz); g.add(gr);
    cyl(.13, .08, h, 7, gold2(), 0, 0, 0, gr);
    cyl(.14, .14, .08, 6, red(), 0, h * .45, 0, gr);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2, r = i ? .1 : 0;
      rot(add(new THREE.ConeGeometry(.07, .4, 5), i % 2 ? gold() : gold2(), Math.cos(a) * r, h + .12, Math.sin(a) * r, gr), Math.sin(a) * .4 * (i ? 1 : 0), 0, -Math.cos(a) * .4 * (i ? 1 : 0));
    }
  };

  return {
    conjurerTable(g, x, y, z) {
      const w = woodLt(), wd = woodMd();
      const h = .72, top = y + h + .07;
      box(1.15, .07, .7, w, x, y + h, z, g);
      [[-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28]].forEach(([a, b]) => box(.09, h, .09, wd, x + a, y, z + b, g));
      box(1, .05, .05, wd, x, y + .2, z - .28, g); box(1, .05, .05, wd, x, y + .2, z + .28, g);
      const brass = bronze();
      [[-.22, brass], [0, red()], [.22, brass]].forEach(([a, m]) => cyl(.09, .13, .22, 7, m, x + a, top, z - .02, g));
      add(new THREE.IcosahedronGeometry(.1, 0), white(), x + .08, top + .09, z + .22, g);
      [-.47, .47].forEach(a => { cyl(.02, .035, .1, 5, red(), x + a, top, z + .1, g); cyl(.08, .03, .13, 7, red(), x + a, top + .1, z + .1, g); });
      return top + .22;
    },

    lampstand(g, x, y, z) {
      const br = bronze();
      box(.7, .1, .7, br, x, y, z, g); box(.5, .1, .5, br, x, y + .1, z, g);
      box(.24, .3, .24, br, x, y + .2, z, g);
      box(.14, 1.4, .14, br, x, y + .5, z, g);
      const top = y + 1.7, lv = [1.3, 1.45, 1.6];
      [.15, .3, .45].forEach((a, i) => box(a * 2 + .07, .07, .07, br, x, y + lv[2 - i] - .035, z, g));
      const fl = flame();
      [-.45, -.3, -.15, 0, .15, .3, .45].forEach(a => {
        const aa = Math.abs(a), ly = aa > .4 ? lv[0] : aa > .25 ? lv[1] : lv[2];
        if (aa > 0) box(.06, top - (y + ly), .06, br, x + a, y + ly, z, g);
        cyl(.09, .05, .1, 6, br, x + a, top - .02, z, g);
        const f = add(new THREE.ConeGeometry(.095, .38, 6), fl, x + a, top + .27, z, g); f.userData.dyn = 1;
      });
      return top + .46;
    },

    barleyBasket(g, x, y, z) {
      const bk = wick(), bk2 = wickDk();
      cyl(.52, .38, .5, 10, bk, x, y, z, g);
      for (let i = 0; i < 3; i++) cyl(.5 - i * .045, .5 - i * .045, .04, 10, bk2, x, y + .1 + i * .14, z, g);
      cyl(.54, .54, .06, 10, bk2, x, y + .48, z, g);
      const b = y + .45;
      sheaf(g, x - .26, b, z + .08, .2, .35, .65);
      sheaf(g, x + .26, b, z + .04, .15, -.35, .65);
      sheaf(g, x, b, z - .2, -.3, 0, .7);
      sheaf(g, x, b, z + .02, 0, 0, .8);
      return b + .98;
    },

    marbleEar(g, x, y, z) {
      const mb = white(), st = M('plinth', '#cdbf9e', { roughness: 1 }), sh = M('earsh', '#b9b8b0', { roughness: 1 });
      box(1.05, .3, .7, st, x, y, z, g);
      const bh = 1.2;
      box(.8, bh, .3, mb, x, y + .3, z, g);
      const cy0 = y + .3 + bh / 2 + .02, fz = z + .17;
      // dished interior (darker), then bold helix C-curve, ridge and lobe in front
      const bowl = add(new THREE.CylinderGeometry(.24, .24, .04, 8), sh, x, cy0 + .02, fz - .02, g); bowl.rotation.x = Math.PI / 2; bowl.scale.set(.8, 1, 1.4);
      rot(add(new THREE.TorusGeometry(.28, .1, 5, 12, 4.9), mb, x, cy0 + .04, fz + .02, g), 0, 0, -1.65).scale.set(.85, 1.4, 1);
      rot(add(new THREE.TorusGeometry(.14, .05, 4, 8, 4), mb, x + .02, cy0 + .1, fz + .04, g), 0, 0, 2.3).scale.set(.8, 1.3, 1);
      add(new THREE.IcosahedronGeometry(.08, 0), mb, x - .03, cy0 - .06, fz + .05, g);
      add(new THREE.IcosahedronGeometry(.14, 0), mb, x - .04, cy0 - .44, fz + .04, g).scale.set(1, 1.3, .8);
      return y + .3 + bh;
    },

    cauldron(g, x, y, z) {
      const dk = bronze();
      const stone = M('stgrey', '#a89f90', { roughness: 1 });
      const ember = M('ember', '#ff6a1a', { emissive: '#ff5a10', emissiveIntensity: 3, roughness: 1 });
      cyl(.42, .46, .1, 8, ember, x, y, z, g);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2;
        rot(box(.22, .16, .16, stone, x + Math.cos(a) * .52, y, z + Math.sin(a) * .52, g), 0, -a, 0);
      }
      const fire = makeFire(THREE, { scale: .26, light: false });
      fire.traverse(o => { o.userData.dyn = 1; }); fire.position.set(x, y + .08, z); g.add(fire); FIRES.push(fire);
      const wood = woodMd();
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2 + .5;
        const l = add(new THREE.CylinderGeometry(.035, .04, .7, 4), wood, x + Math.cos(a) * .3, y + .33, z + Math.sin(a) * .3, g);
        l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5);
      }
      const cy0 = y + .78;
      add(new THREE.SphereGeometry(.5, 9, 7), dk, x, cy0, z, g).scale.set(1, .85, 1);
      cyl(.46, .46, .06, 9, dk, x, cy0 + .36, z, g);
      cyl(.38, .38, .03, 9, M('brew', '#6a5a28'), x, cy0 + .4, z, g);
      rot(add(new THREE.TorusGeometry(.13, .035, 5, 9), M('ring', '#f0d070', { metalness: .6, roughness: .3 }), x + .52, cy0 + .12, z, g), 0, Math.PI / 2, 0);
      const st = M('steam', '#ffffff', { roughness: 1 });
      [[0, .52, 0, .2], [.05, .68, .02, .19], [-.04, .84, -.02, .17], [.04, 1.0, .02, .15], [0, 1.14, 0, .12]].forEach(([a, b, c, r]) => {
        add(new THREE.IcosahedronGeometry(r, 1), st, x + a, cy0 + b, z + c, g).userData.dyn = 1;
      });
      return cy0 + 1.26;
    },

    washbasin(g, x, y, z) {
      const st = stoneLt(), stD = M('stonedk2', '#bfb39a', { roughness: 1 });
      cyl(.3, .34, .08, 10, stD, x, y, z, g);
      cyl(.18, .24, .72, 8, st, x, y + .08, z, g);
      cyl(.5, .26, .2, 10, st, x, y + .8, z, g);          // shallow bowl
      cyl(.5, .5, .05, 10, stD, x, y + .98, z, g);          // rim
      cyl(.4, .4, .02, 10, M('water', '#8d959c', { roughness: .3, metalness: .2 }), x, y + 1.0, z, g);
      const cl = cream(), stain = M('stain', '#8a6038', { roughness: 1 });
      const dr = (w, h, px, py, pz, rx, rz) => rot(box(w, h, .03, cl, x + px, y + py, z + pz, g), rx, 0, rz);
      // cloth over the front-left rim: flat part on the rim, then folded hanging planes
      rot(box(.42, .03, .22, cl, x - .12, y + 1.03, z + .38, g), .25, .15, .05);
      dr(.24, .5, -.3, .53, .54, -.08, .05); dr(.2, .42, -.1, .6, .56, -.15, -.07); dr(.18, .34, .06, .68, .55, -.05, .1);
      add(new THREE.IcosahedronGeometry(.1, 0), cl, x - .02, y + 1.08, z + .34, g).scale.set(1.3, .5, 1);
      add(new THREE.IcosahedronGeometry(.09, 0), cl, x - .24, y + .2 + .45, z + .56, g).scale.set(1, .6, .5);
      box(.14, .12, .035, stain, x - .28, y + .62, z + .57, g); box(.1, .1, .035, stain, x - .1, y + .66, z + .59, g);
      box(.12, .03, .08, stain, x - .12, y + 1.05, z + .4, g);
      return y + 1.03;
    },

    malletBlock(g, x, y, z) {
      const lm = stoneLt(), lm2 = M('lime2', '#f4ecdc', { roughness: 1 });
      box(.9, .6, .76, lm, x, y, z, g);
      // rough-hewn top: uneven chunks at the back
      rot(box(.3, .12, .26, lm2, x + .22, y + .6, z - .22, g), 0, .4, .1);
      rot(box(.26, .08, .3, lm2, x - .22, y + .6, z - .24, g), 0, -.3, -.08);
      rot(box(.2, .06, .2, lm2, x + .3, y + .6, z + .1, g), 0, .5, 0);
      const wood = M('mwood', '#b07a3e', { roughness: .9 });
      const top = y + .6;
      // mallet
      rot(add(new THREE.CylinderGeometry(.04, .045, .6, 6), wood, x - .08, top + .045, z + .16, g), 0, .1, Math.PI / 2);
      rot(add(new THREE.CylinderGeometry(.1, .1, .32, 8), wood, x - .36, top + .12, z + .16, g), Math.PI / 2, 0, 0);
      // chisel
      rot(add(new THREE.BoxGeometry(.5, .05, .05), iron(), x + .02, top + .03, z - .02, g), 0, -.25, 0);
      rot(add(new THREE.BoxGeometry(.14, .08, .08), wood, x - .24, top + .04, z + .03, g), 0, -.25, 0);
      return top + .06;
    },

    mirror(g, x, y, z) {
      const wood = M('wooddk2', '#5a3820', { roughness: .9 }), bz = M('mirbz', '#d9a24a', { metalness: .8, roughness: .2 });
      const bzd = bronze();
      box(.8, .1, .5, wood, x, y, z, g);
      cyl(.07, .09, .6, 6, wood, x, y + .1, z, g);
      cyl(.05, .055, .35, 6, bzd, x, y + .6, z, g);
      const cy0 = y + 1.2;
      rot(add(new THREE.CylinderGeometry(.46, .46, .05, 12), bz, x, cy0, z, g), Math.PI / 2);
      rot(add(new THREE.TorusGeometry(.46, .05, 4, 12), bzd, x, cy0, z, g));
      add(new THREE.IcosahedronGeometry(.07, 0), bzd, x, cy0 + .5, z, g);
      return cy0 + .56;
    },

    waxTablet(g, x, y, z) {
      const wd = woodDk(), wax = M('wax2', '#e8d48a', { roughness: .5 });
      box(.7, .07, .5, wd, x, y, z, g);
      cyl(.05, .07, .6, 6, wd, x, y + .07, z, g);
      const gr = new THREE.Group(); gr.position.set(x, y + .8, z); gr.rotation.x = .5; g.add(gr);
      [-.2, .2].forEach(a => {
        box(.4, .05, .56, wd, a, -.03, 0, gr);
        box(.32, .03, .46, wax, a, .0, 0, gr);
      });
      box(.05, .07, .56, M('hinge', '#3a2414', { roughness: .9 }), 0, -.02, 0, gr);
      // stylus lying on the stand's base in front
      rot(add(new THREE.CylinderGeometry(.015, .025, .4, 5), M('stylus', '#d8d8d0', { metalness: .4, roughness: .4 }), x + .1, y + .1, z + .18, g), 0, .3, Math.PI / 2);
      return y + .85;
    },

    shackleStele(g, x, y, z) {
      const st = M('stelegrey', '#a5a49c', { roughness: 1 }), stD = M('stelegd', '#827f78', { roughness: 1 });
      const ir = iron();
      box(1.0, .16, .6, stD, x, y, z, g);
      box(.8, 1.55, .26, st, x, y + .16, z, g);
      box(.9, .12, .34, st, x, y + 1.71, z, g);
      for (let i = 0; i < 4; i++) box(.5 - (i % 2) * .1, .035, .02, stD, x, y + 1.55 - i * .1, z + .14, g);
      for (let i = 0; i < 3; i++) box(.5, .035, .02, stD, x, y + .3 + i * .1, z + .14, g);
      const pegY = y + 1.2;
      rot(add(new THREE.CylinderGeometry(.045, .055, .36, 6), ir, x, pegY, z + .28, g), Math.PI / 2);
      add(new THREE.CylinderGeometry(.09, .09, .04, 6), ir, x, pegY, z + .47, g).rotation.x = Math.PI / 2;
      [-1, 1].forEach(s => {
        const cx = x + s * .2;
        // short chain of links
        for (let i = 0; i < 3; i++) rot(add(new THREE.TorusGeometry(.04, .014, 4, 6), ir, x + s * (.04 + i * .05), pegY - .06 - i * .09, z + .42, g), 0, i % 2 ? Math.PI / 2 : 0, 0);
        // open cuff: C-shaped band with a hinge block
        rot(add(new THREE.TorusGeometry(.17, .05, 5, 10, 4.6), ir, cx, pegY - .5, z + .42, g), 0, 0, s < 0 ? -.85 : 2.0);
        box(.1, .08, .08, ir, cx, pegY - .36, z + .42, g);
      });
      return y + 1.83;
    },

    bridlePost(g, x, y, z) {
      const wood = woodLt(), wdd = woodMd();
      const lth = M('leather', '#7a4620', { roughness: .8 }), mt = M('bit', '#c8ced4', { metalness: .6, roughness: .3 });
      cyl(.38, .42, .1, 10, wdd, x, y, z, g);
      cyl(.1, .13, 1.5, 8, wood, x, y + .1, z, g);
      cyl(.14, .1, .08, 8, wdd, x, y + 1.6, z, g);
      rot(add(new THREE.CylinderGeometry(.045, .05, .45, 6), wood, x, y + 1.35, z + .2, g), Math.PI / 2);
      const fz = z + .34, top = y + 1.36, hy = y + .98;
      // headstall: tall loop hanging from the peg, browband, cheek straps, noseband
      add(new THREE.TorusGeometry(.2, .03, 4, 10), lth, x, hy + .05, fz, g).scale.set(1, 1.6, 1);
      box(.44, .05, .03, lth, x, hy + .02, fz + .04, g);       // browband
      box(.05, .45, .03, lth, x - .2, hy - .38, fz, g); box(.05, .45, .03, lth, x + .2, hy - .38, fz, g); // cheeks
      box(.44, .05, .03, lth, x, hy - .3, fz + .04, g);        // noseband
      rot(add(new THREE.CylinderGeometry(.025, .025, .5, 6), mt, x, hy - .64, fz + .02, g), 0, 0, Math.PI / 2);
      [-1, 1].forEach(s => {
        add(new THREE.TorusGeometry(.075, .02, 4, 8), mt, x + s * .27, hy - .64, fz + .02, g);
        box(.04, .65, .02, lth, x + s * .29, hy - 1.0, fz + .05, g);   // reins
      });
      return y + 1.68;
    },

    breadBasket(g0, x0, y0, z0) {
      const S = 1.15, g = new THREE.Group(); g.scale.setScalar(S); g0.add(g);
      const x = x0 / S, y = y0 / S, z = z0 / S;
      const bk = wick(), bk2 = wickDk();
      const bx = x - .08, bz = z - .12;
      cyl(.5, .38, .4, 10, bk, bx, y, bz, g);
      cyl(.52, .52, .05, 10, bk2, bx, y + .38, bz, g);
      cyl(.48, .48, .04, 10, bk2, bx, y + .14, bz, g);
      const b1 = M('bread', '#e6b25e', { roughness: 1 }), b2 = M('bread2', '#d89a46', { roughness: 1 });
      const lf = (a, b, hh, r, k) => add(new THREE.IcosahedronGeometry(r, 1), k ? b1 : b2, a, y + hh, b, g).scale.set(1, .75, 1);
      lf(bx, bz, .6, .24, 1);
      [0, 1, 2, 3, 4].forEach(i => { const a = i / 5 * Math.PI * 2; lf(bx + Math.cos(a) * .29, bz + Math.sin(a) * .29, .46, .2, i % 2); });
      // toy horse on wheels, in front of the basket (+z), ~0.6 tall, built unscaled in g0
      const hx = x0 + .12, hz = z0 + .5, g1 = g0, yy = y0;
      const paint = M('toyp', '#f0e6cc', { roughness: .7 }), blue = M('toyb', '#3a6aa8', { roughness: .7 });
      const rd = red(), br = M('toymane', '#5a3418', { roughness: 1 });
      box(.56, .05, .22, blue, hx, yy + .1, hz, g1);
      [[-.2, -.13], [.2, -.13], [-.2, .13], [.2, .13]].forEach(([a, b]) => rot(add(new THREE.CylinderGeometry(.08, .08, .04, 8), rd, hx + a, yy + .08, hz + b, g1), Math.PI / 2));
      [[-.2, -.07], [.2, -.07], [-.2, .07], [.2, .07]].forEach(([a, b]) => box(.07, .2, .07, paint, hx + a, yy + .15, hz + b, g1));
      box(.52, .2, .22, paint, hx, yy + .33, hz, g1);                                   // body
      rot(box(.14, .34, .14, paint, hx + .22, yy + .46, hz, g1), 0, 0, -.3);            // neck
      box(.26, .13, .13, paint, hx + .38, yy + .72, hz, g1);                            // head
      box(.05, .09, .04, paint, hx + .3, yy + .85, hz - .04, g1); box(.05, .09, .04, paint, hx + .3, yy + .85, hz + .04, g1); // ears
      rot(box(.05, .32, .05, br, hx + .14, yy + .5, hz, g1), 0, 0, -.3);                // mane
      box(.04, .2, .04, br, hx - .28, yy + .26, hz, g1);                                // tail
      return y0 + .74 * S;
    },
  };
}
