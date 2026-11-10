// ---------- family-house interiors, built to match the reference renders ----------
const ROOM_LIGHTS = [];

function flame(g, x, y, z, s = 1) { const f = add(new THREE.ConeGeometry(.05 * s, .16 * s, 6), new THREE.MeshStandardMaterial({ color: '#ffd25a', emissive: '#ff9a2a', emissiveIntensity: 1.2 }), x, y + .08 * s, z, g); f.castShadow = false; f.userData.dyn = 1; (window.__fire ||= []).push(f); return f; }
function panelTex(base, frame, dadoCol, panels = 3) { return noRep(canvasTex(512, (x, w) => { x.fillStyle = base; x.fillRect(0, 0, w, w);
  const dz = w * .7; x.fillStyle = dadoCol; x.fillRect(0, dz, w, w - dz); x.fillStyle = frame; x.fillRect(0, dz - 6, w, 8);
  x.strokeStyle = frame; x.lineWidth = 9; const pw = (w - 40) / panels; for (let i = 0; i < panels; i++) x.strokeRect(20 + i * pw + 14, 40, pw - 28, dz - 90);
  x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 3; for (let i = 0; i < 3; i++) x.strokeRect(14 + i * (w - 28) / 3 + 10, dz + 22, (w - 28) / 3 - 20, w - dz - 44);
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(0,0,0,${R(0, .05)})`; x.fillRect(R(0, w), R(0, w), 2, 2); } })); }
function noRep(t) { t.userData = {}; return t; }
function floorTex(kind) { return noRep(canvasTex(512, (x, w) => {
  if (kind === 'earth') { x.fillStyle = '#9a7a56'; x.fillRect(0, 0, w, w); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(60,40,20,${R(0, .12)})`; x.fillRect(R(0, w), R(0, w), 3, 3); }
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgb(${R(200, 225) | 0},${R(195, 215) | 0},${R(185, 200) | 0})`; x.beginPath(); const cx = R(0, w), cy = R(0, w), r = R(14, 34); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; x.lineTo(cx + Math.cos(a) * r * R(.7, 1.1), cy + Math.sin(a) * r * R(.6, 1)); } x.fill(); } return; }
  const t = kind === 'multi' ? 12 : 22, n = Math.floor(w / t); const pal = kind === 'bw' ? ['#f2eee6', '#1e1c1a'] : kind === 'meander' ? ['#e6d4b0', '#5a3a26', '#3f5a8a'] : ['#d8c8a8', '#d0bc98', '#e2d4b8', '#3a3a3a', '#8a4a32', '#c8b48e'];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let c;
    const ring = Math.min(i, j, n - 1 - i, n - 1 - j);
    if (kind === 'bw') c = (ring === 1 || ring === 3 || ((i + j) % 6 === 0 && ring > 5) || (Math.abs(i - n / 2) + Math.abs(j - n / 2) | 0) % 5 === 0 && ring > 5) ? pal[1] : pal[0];
    else if (kind === 'meander') c = ring === 1 || ring === 4 ? pal[1] : ring === 2 ? pal[2] : (ring > 5 && ((i % 6 === 0) || (j % 6 === 0)) && ((i + j) % 12 < 6)) ? pal[1] : pal[0];
    else c = ring === 1 || ring === 4 ? pal[3] : ring === 2 || ring === 5 ? pal[4] : ((Math.abs(i - n / 2) + Math.abs(j - n / 2)) | 0) % 6 === 0 && ring > 6 ? pal[4] : pal[[0, 1, 2, 5][(rnd() * 4) | 0]];
    x.fillStyle = c; x.fillRect(i * t, j * t, t - 2, t - 2); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i * t + t - 2, j * t, 2, t); x.fillRect(i * t, j * t + t - 2, t, 2); } })); }
function houseRoom(cx, cz, hw, wallTex, floorKind, lightCol = '#ffcf8a') {
  const y0 = heightAt(HX, HZ) + .22, out = Math.sign(cz - HZ), fz = HZ + out * 4.05, bz = HZ + out * 9.74, depth = Math.abs(bz - fz), mz = (fz + bz) / 2, H = 3.4;
  const wm = new THREE.MeshStandardMaterial({ map: wallTex, roughness: .95 });
  const back = add(new THREE.PlaneGeometry(hw * 2, H), wm, cx, y0 + H / 2, bz - out * .03); back.rotation.y = out > 0 ? Math.PI : 0; back.castShadow = false;
  for (const sd of [-1, 1]) { const side = add(new THREE.PlaneGeometry(depth, H), wm, cx + sd * (hw - .03), y0 + H / 2, mz); side.rotation.y = -sd * Math.PI / 2; side.castShadow = false; }
  const fl = add(new THREE.PlaneGeometry(hw * 2, depth), new THREE.MeshStandardMaterial({ map: floorTex(floorKind), roughness: .7 }), cx, y0 + .1, mz); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
  const ceil = add(new THREE.PlaneGeometry(hw * 2, depth), mat('ceil', '#efe2c8'), cx, y0 + H, mz); ceil.rotation.x = Math.PI / 2;
  for (let k = -2; k <= 2; k++) box(.24, .26, depth, 'wood', cx + k * hw * .42, y0 + H - .26, mz);
  box(hw * 2, .3, .3, 'wood', cx, y0 + H - .3, fz + out * .1); box(hw * 2, .3, .3, 'wood', cx, y0 + H - .3, bz - out * .2);
  // front wall with a wide doorway and a dark wooden frame
  const dw = 2.3; for (const sd of [-1, 1]) { const segW = hw - dw; box(segW, H, .3, 'wall', cx + sd * (dw + segW / 2), y0, fz); box(.35, H - .35, .42, 'wood', cx + sd * dw, y0, fz); }
  box(dw * 2 + .7, .4, .42, 'wood', cx, y0 + H - .55, fz); box(dw * 2, .3, .32, 'wall', cx, y0 + H - .15, fz);
  const pl = new THREE.PointLight(lightCol, 9, 10, 1.3); pl.position.set(cx, y0 + 2.8, mz + out * .6); scene.add(pl); ROOM_LIGHTS.push(pl); pl.userData.base = 9;
  const pl2 = new THREE.PointLight('#fff0d8', 4, 8, 1.4); pl2.position.set(cx, y0 + 2.2, fz + out * .8); scene.add(pl2); ROOM_LIGHTS.push(pl2); pl2.userData.base = 4;
}
Object.assign(P, {
  loom2: (g, x, y, z) => { const fr = new THREE.Group(); fr.position.set(x, y, z); fr.rotation.x = -.22; g.add(fr);
    for (const sx of [-.55, .55]) box(.09, 2.3, .09, 'woodLt', sx, 0, 0, fr); for (const yy of [.25, 1.25, 2.2]) box(1.25, .08, .1, 'woodLt', 0, yy, 0, fr);
    for (let i = -10; i <= 10; i++) box(.008, 1.0, .008, 'wool', i * .045, 1.2, .02, fr);
    box(.95, .55, .02, mat('loomBlue', '#3f6f9a', { map: TEX.cloth }), 0, .65, .03, fr); box(.95, .04, .03, mat('loomStripe', '#efe6d4'), 0, .9, .04, fr);
    for (let i = -2; i <= 2; i++) { box(.008, .35, .008, 'straw', i * .2, .95, -.08, fr); add(new THREE.ConeGeometry(.06, .14, 6), 'clay', i * .2, .9, -.08, fr).rotation.x = Math.PI; }
    box(.12, .5, .4, 'woodLt', -.55, 0, -.25, g === fr ? g : fr); return y + 2.2; },
  boltPyr: (g, x, y, z) => { const cs = ['#7a3b6a', '#3f6f9a', '#d9a640', '#7a3b6a', '#3f6f9a', '#d9a640']; let n = 0;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) { const c = cs[n++], b = add(new THREE.CylinderGeometry(.17, .17, .9, 12), mat('w' + c, c, { map: TEX.cloth }), x, y + .17 + r * .3, z + (i - (2 - r) / 2) * .35, g); b.rotation.z = Math.PI / 2;
      for (const e of [-1, 1]) { const cap = add(new THREE.CircleGeometry(.17, 12), mat('wE' + c, new THREE.Color(c).multiplyScalar(.75).getStyle()), x + e * .452, y + .17 + r * .3, b.position.z, g); cap.rotation.y = e * Math.PI / 2; } } return y + 1.0; },
  chestOpen: (g, x, y, z) => { box(.8, .45, .5, 'wood', x, y, z, g); for (const k of [-.3, .3]) box(.05, .47, .52, iron(), x + k, y - .01, z, g); box(.7, .02, .4, mat('chestIn', '#5a3a26'), x, y + .3, z, g);
    const lid = new THREE.Group(); lid.position.set(x, y + .45, z - .25); lid.rotation.x = -1.85; g.add(lid); box(.8, .08, .5, 'wood', 0, 0, .25, lid); box(.82, .1, .05, iron(), 0, 0, .48, lid); return y + .95; },
  woolBasket: (g, x, y, z) => { const top = (MODELS.stall ? placePart(g, 'stall', 'Cylinder133', x, y, z, .75) : (cyl(.38, .3, .45, 10, 'basket', x, y, z, g), y + .45));
    for (let i = 0; i < 7; i++) add(new THREE.IcosahedronGeometry(R(.12, .18), 1), 'wool', x + R(-.22, .22), top - .05 + R(0, .1), z + R(-.22, .22), g);
    const h = add(new THREE.TorusGeometry(.3, .025, 5, 12, Math.PI), 'basket', x, top, z, g); return top + .3; },
  stoolSpindle: (g, x, y, z) => { box(.55, .07, .42, 'woodLt', x, y + .55, z, g); for (const [a, b] of [[-.22, -.16], [.22, -.16], [-.22, .16], [.22, .16]]) box(.06, .55, .06, 'wood', x + a, y, z + b, g); box(.44, .04, .04, 'wood', x, y + .2, z - .16, g); box(.44, .04, .04, 'wood', x, y + .2, z + .16, g);
    const sp = add(new THREE.CylinderGeometry(.02, .02, .45, 6), 'woodLt', x - .1, y + .66, z, g); sp.rotation.z = Math.PI / 2; add(new THREE.IcosahedronGeometry(.15, 1), 'wool', x + .1, y + .74, z, g); return y + .9; },
  bed2: (g, x, y, z) => { box(1.1, .35, 2.1, 'woodLt', x, y + .2, z, g); for (const [a, b, h] of [[-.55, -1.05, 1.05], [.55, -1.05, 1.05], [-.55, 1.05, .8], [.55, 1.05, .8]]) box(.1, h, .1, 'wood', x + a, y, z + b, g);
    box(1.1, .4, .06, 'wood', x, y + .55, z - 1.05, g); box(1.1, .25, .06, 'wood', x, y + .5, z + 1.05, g); box(1.02, .16, 2, mat('mattress', '#efe2c4', { map: TEX.cloth }), x, y + .55, z, g);
    for (const a of [-.25, .25]) { const pw = add(new THREE.IcosahedronGeometry(.2, 1), mat('pillow', '#f0e4c8', { map: TEX.cloth }), x + a, y + .78, z - .8, g); pw.scale.set(1.1, .45, .7); }
    box(1.12, .1, 1.35, mat('blanketB', '#2f5f9a', { map: TEX.cloth }), x, y + .7, z + .3, g); box(.05, .45, 1.35, mat('blanketB', '#2f5f9a'), x + .58, y + .3, z + .3, g); return y + 1.05; },
  cradle2: (g, x, y, z) => { box(.8, .08, .5, 'woodLt', x, y + .25, z, g); for (const sx of [-.4, .4]) box(.06, .6, .5, 'wood', x + sx, y, z, g);
    for (let i = -3; i <= 3; i++) for (const sz of [-.25, .25]) box(.025, .3, .025, 'woodLt', x + i * .11, y + .33, z + sz, g); box(.8, .04, .04, 'wood', x, y + .62, z - .25, g); box(.8, .04, .04, 'wood', x, y + .62, z + .25, g);
    const bl = box(.55, .1, .4, mat('babyblanket', '#d9a640', { map: TEX.cloth }), x + .05, y + .34, z, g); bl.rotation.z = .15; return y + .7; },
  candelabrum: (g, x, y, z) => { cyl(.22, .26, .06, 10, bronze(), x, y, z, g); cyl(.025, .03, 1.6, 8, bronze(), x, y + .05, z, g);
    for (const [a, h] of [[-.28, 1.45], [0, 1.68], [.28, 1.45]]) { if (a) { const arm = box(.3, .025, .025, bronze(), x + a / 2, y + h - .02, z, g); } cyl(.08, .04, .06, 9, bronze(), x + a, y + h, z, g); flame(g, x + a, y + h + .05, z); } return y + 1.85; },
  rack2: (g, x, y, z) => { for (const sx of [-.7, .7]) { box(.07, 1.75, .07, 'woodLt', x + sx, y, z, g); box(.07, .07, .5, 'wood', x + sx, y, z, g); } box(1.5, .06, .06, 'woodLt', x, y + 1.72, z, g);
    ['#b8331f', '#d9a640', '#2f5f9a'].forEach((c, i) => { const tx = x - .42 + i * .42, m = mat('tunic' + c, c, { map: TEX.cloth }); const hg = add(new THREE.TorusGeometry(.13, .012, 4, 8, Math.PI), 'wood', tx, y + 1.53, z, g);
      box(.03, .1, .03, 'wood', tx, y + 1.62, z, g); const t = add(new THREE.CylinderGeometry(.13, .19, .8, 8), m, tx, y + 1.1, z, g); t.scale.z = .45; for (const sd of [-1, 1]) { const sl = box(.12, .26, .1, m, tx + sd * .18, y + 1.25, z, g); sl.rotation.z = sd * .5; } }); return y + 1.8; },
  oven2: (g, x, y, z) => { box(1.3, .45, 1.2, mat('ovenBase', '#d8c7a6'), x, y, z, g); const d = add(new THREE.SphereGeometry(.62, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('ovenDome', '#d9c2a0'), x, y + .45, z - .05, g);
    const mouth = add(new THREE.CircleGeometry(.26, 10, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#ff9a3a', emissive: '#e8681a', emissiveIntensity: 1.1 }), x, y + .47, z + .56, g); mouth.userData.dyn = 1;
    const lf = add(new THREE.IcosahedronGeometry(.13, 1), mat('loaf', '#c88a4a'), x, y + .55, z + .5, g); lf.scale.set(1.5, .7, 1); box(.6, .05, .25, 'wood', x, y + .43, z + .62, g); return y + 1.1; },
  herbRack: (g, x, y, z) => { for (const sx of [-.65, .65]) { box(.07, 1.6, .07, 'wood', x + sx, y, z, g); const ft = box(.07, .07, .55, 'wood', x + sx, y, z, g); } box(1.45, .06, .06, 'wood', x, y + 1.55, z, g);
    for (let i = 0; i < 6; i++) { const hx = x - .55 + i * .22; box(.01, .15, .01, 'straw', hx, y + 1.4, z, g); const c = i === 3 ? '#9a6a3a' : ['#5f7a3e', '#7c9450', '#6f8a46'][i % 3];
      for (let k = 0; k < 4; k++) { const lf = add(new THREE.ConeGeometry(.04, .32, 4), mat('herb' + c, c), hx + R(-.04, .04), y + 1.22, z + R(-.04, .04), g); lf.rotation.x = Math.PI + R(-.2, .2); } } return y + 1.6; },
  sackScoop: (g, x, y, z) => { add(new THREE.LatheGeometry([[0, 0], [.26, .02], [.32, .25], [.3, .5], [.2, .6], [.24, .66]].map(([a, b]) => new THREE.Vector2(a, b)), 12), mat('sack', '#cdb48a', { map: TEX.cloth }), x, y, z, g);
    cyl(.2, .2, .02, 10, mat('flour', '#f2ece0'), x, y + .62, z, g); const sc = box(.12, .06, .3, 'woodLt', x + .08, y + .7, z, g); sc.rotation.x = -.8; return y + .8; },
  bowlTall: (g, x, y, z) => { for (let i = 0; i < 9; i++) add(new THREE.LatheGeometry([[0, 0], [.2, 0], [.3, .1], [.33, .14]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat('bowlC', '#a8623a', { side: THREE.DoubleSide, flatShading: false, roughness: .6 }), x, y + i * .085, z, g); return y + .9; },
  tripodPot: (g, x, y, z) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .3, l = box(.04, 1.5, .04, iron(), x + Math.cos(a) * .32, y, z + Math.sin(a) * .32, g); l.rotation.z = Math.cos(a) * .22; l.rotation.x = -Math.sin(a) * .22; }
    box(.015, .4, .015, iron(), x, y + 1.05, z, g); add(new THREE.SphereGeometry(.24, 12, 8, 0, Math.PI * 2, Math.PI * .35, Math.PI * .65), iron(), x, y + .75, z, g); cyl(.2, .2, .02, 10, mat('stew', '#7a4a22'), x, y + .82, z, g);
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
