// ---------- UP-A: next-level builders for the gate torch, the street lamp, the city gate and the altar of the temple courtyard ----------
// Loaded after obj:colossae-shared (and before obj:nature in the library). Only function declarations and caches here: they run when the towns / the library call them.
// Never calls R(): all variation comes from the private generator uaRng(seed), so the towns' layout stream does not move.
// Public builders: gateTorch(g,x,y,z)  oilLampStand(g,x,y,z,ry)  altarOfFire(g,x,y,z)  and the gate pieces used by cityGate() in colossae-shared.js.
const uaRng = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const UAC = {};

// ---- small helpers ----
// a tube-like limb between two points (g = parent group)
function uaLimb(a, b, r0, r1, m, g, seg = 6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const mesh = add(new THREE.CylinderGeometry(r1, r0, L, seg), m, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2, g);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return mesh; }
// a lathe from [radius, height] pairs
function uaLathe(pts, m, x, y, z, g, seg = 10) { return add(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), m, x, y, z, g); }
// a thin ring lying flat (rotate it yourself)
function uaRing(r, tube, m, x, y, z, g, seg = 12, rotX = Math.PI / 2) { const t = add(new THREE.TorusGeometry(r, tube, 5, seg), m, x, y, z, g); t.rotation.x = rotX; return t; }
function uaTube(pts, r, m, g, seg = 14, rad = 5) { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))); return add(new THREE.TubeGeometry(c, seg, r, rad, false), m, 0, 0, 0, g); }
const uaIron = () => mat('uaIron', '#3a3836', { metalness: .55, roughness: .55 });
const uaBronze = () => mat('uaBronze', '#a37233', { metalness: .6, roughness: .4 });
const uaBronzeDk = () => mat('uaBronzeDk', '#85592b', { metalness: .5, roughness: .5 });
const uaGold = () => mat('uaGold', '#d0a64a', { metalness: .6, roughness: .35 });
const uaClay = () => { if (!M.uaClay) { M.uaClay = M.clay.clone(); M.uaClay.side = THREE.DoubleSide; } return M.uaClay; };
const uaSoftTex = () => UAC.soft ||= (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
function uaGlow(g, x, y, z, size, color, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: uaSoftTex(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); s.userData.dyn = 1; g.add(s); return s; }
function uaFire(g, x, y, z, scale, light = false) { const f = makeFire(THREE, { scale, light }); f.position.set(x, y, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return f; }
function uaTex(w, h, draw, rep = 0) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.userData = { rep }; } return t; }

// ---- stone textures: coursed ashlar (walls) and dressed stone (single blocks) ----
function uaAshlarTex() {
  if (UAC.ash) return UAC.ash;
  const S = 512, rng = uaRng(4177), rows = []; let y = 0;
  while (y < S) { let h = 46 + (rng() * 30 | 0); if (S - y - h < 44) h = S - y; const ws = []; let sum = 0;
    while (sum < S) { let w = 84 + (rng() * 130 | 0); if (S - sum - w < 70) w = S - sum; ws.push(w); sum += w; }
    const off = rng() * S | 0; let x = off, bl = []; for (const w of ws) { bl.push({ x: x % S, w, v: 214 + rng() * 34, wash: rng() < .2, moss: rng() < .12 }); x += w; } rows.push({ y, h, bl }); y += h; }
  const drips = []; for (let i = 0; i < 16; i++) drips.push({ x: rng() * S, y: rng() * S, l: 50 + rng() * 120, w: 3 + rng() * 5 });
  const draw = (x, bump) => {
    x.fillStyle = bump ? '#202020' : '#8c8171'; x.fillRect(0, 0, S, S);
    const r2 = uaRng(991);
    for (const r of rows) for (const b of r.bl) for (const dx of [0, -S]) { const bx = b.x + dx, by = r.y, bw = b.w, bh = r.h; if (bx + bw < 0 || bx > S) continue;
      const v = b.v;
      if (bump) { const k = 150 + (v - 214) * 2.2; x.fillStyle = `rgb(${k | 0},${k | 0},${k | 0})`; x.fillRect(bx + 2, by + 2, bw - 4, bh - 4); }
      else { const gr = x.createLinearGradient(bx, by, bx + bw * .4, by + bh); gr.addColorStop(0, `rgb(${Math.min(255, v + 12) | 0},${Math.min(255, v * .97 + 11) | 0},${Math.min(255, v * .9 + 10) | 0})`); gr.addColorStop(1, `rgb(${v * .9 | 0},${v * .86 | 0},${v * .79 | 0})`);
        x.fillStyle = gr; x.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
        if (b.wash) { x.fillStyle = 'rgba(110,90,60,.13)'; x.fillRect(bx + 2, by + 2, bw - 4, bh - 4); }
        x.fillStyle = 'rgba(255,248,230,.35)'; x.fillRect(bx + 2, by + 2, bw - 4, 1.5); x.fillRect(bx + 2, by + 2, 1.5, bh - 4);
        x.fillStyle = 'rgba(60,45,30,.35)'; x.fillRect(bx + 2, by + bh - 3.5, bw - 4, 1.5); x.fillRect(bx + bw - 3.5, by + 2, 1.5, bh - 4);
        if (b.moss) { x.fillStyle = 'rgba(84,104,48,.16)'; x.beginPath(); x.ellipse(bx + bw * (.3 + r2() * .4), by + bh - 6, bw * .22, 7, 0, 0, 7); x.fill(); } }
      for (let i = 0; i < 6; i++) { const px = bx + 4 + r2() * (bw - 8), py = by + 4 + r2() * (bh - 8), pr = .8 + r2() * 2.2;
        x.fillStyle = bump ? 'rgba(0,0,0,.4)' : `rgba(70,56,40,${.12 + r2() * .22})`; x.beginPath(); x.ellipse(px, py, pr * 1.3, pr, 0, 0, 7); x.fill(); }
      if (r2() < .1) { x.strokeStyle = bump ? 'rgba(0,0,0,.6)' : 'rgba(70,56,40,.4)'; x.lineWidth = 1; x.beginPath(); const sx = bx + 8 + r2() * (bw - 16); x.moveTo(sx, by + 3); x.lineTo(sx + r2() * 14 - 7, by + bh * .5); x.lineTo(sx + r2() * 14 - 7, by + bh - 3); x.stroke(); } }
    if (!bump) { for (const d of drips) for (const oy of [0, -S]) { const gr = x.createLinearGradient(0, d.y + oy, 0, d.y + oy + d.l); gr.addColorStop(0, 'rgba(70,55,38,.17)'); gr.addColorStop(1, 'rgba(70,55,38,0)'); x.fillStyle = gr; x.fillRect(d.x, d.y + oy, d.w, d.l); }
      for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r2() < .5 ? '255,250,235' : '50,40,30'},${r2() * .16})`; x.fillRect(r2() * S, r2() * S, 1 + r2() * 2, 1 + r2() * 2); } }
  };
  const map = uaTex(S, S, (x) => draw(x, false), .18), bump = uaTex(S, S, (x) => draw(x, true), .18);
  bump.colorSpace = THREE.NoColorSpace; return UAC.ash = { map, bump };
}
function uaDressedTex() {
  return UAC.dressed ||= uaTex(256, 256, (x, w) => { const r = uaRng(311); x.fillStyle = '#e4ddcf'; x.fillRect(0, 0, w, w);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${r() < .5 ? '150,130,100' : '255,250,235'},${.05 + r() * .08})`; x.beginPath(); x.arc(r() * w, r() * w, 14 + r() * 40, 0, 7); x.fill(); }
    for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(${r() < .6 ? '70,58,44' : '255,252,240'},${r() * .3})`; x.fillRect(r() * w, r() * w, 1 + r() * 1.6, 1 + r() * 1.6); } }, .55);
}
// materials: the town's own stone colours (so each town keeps its light), with the new texture
function uaStoneMat(base, kind, tone) {
  if (typeof base !== 'string' || !M[base]) return base;
  const key = 'ua' + kind + '_' + base + (tone || ''); if (M[key]) return M[key];
  const src = M[base], m = new THREE.MeshStandardMaterial({ color: src.color.clone(), flatShading: true, roughness: .95 });
  if (kind === 'Ash') { const t = uaAshlarTex(); m.map = t.map; m.bumpMap = t.bump; m.bumpScale = 1.4; } else m.map = uaDressedTex();
  if (tone) m.color.multiply(new THREE.Color(tone)); return (M[key] = m);
}

// ---- gate pieces ----
// a flat wall slab (w x h) with holes cut through it, thickness d, from z0 towards z1; build holes with uaHole*
function uaSlab(w, h, holes, z0, z1, m, g, x0 = 0) {
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.lineTo(-w / 2, 0);
  for (const hp of holes) sh.holes.push(hp);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: Math.abs(z1 - z0), bevelEnabled: false, curveSegments: 8 }); geo.translate(0, 0, Math.min(z0, z1)); return add(geo, m, x0, 0, 0, g); }
function uaHoleArch(cx, y0, hw, hStraight) { const p = new THREE.Path(); p.moveTo(cx - hw, y0); p.lineTo(cx + hw, y0); p.lineTo(cx + hw, y0 + hStraight); p.absarc(cx, y0 + hStraight, hw, 0, Math.PI, false); p.lineTo(cx - hw, y0); return p; }
function uaHoleRect(cx, y0, hw, h) { const p = new THREE.Path(); p.moveTo(cx - hw, y0); p.lineTo(cx + hw, y0); p.lineTo(cx + hw, y0 + h); p.lineTo(cx - hw, y0 + h); p.lineTo(cx - hw, y0); return p; }
const uaInteriorMat = () => { if (!M.uaInterior) { const t = uaTex(64, 128, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a1c12'); gr.addColorStop(.6, '#4a3020'); gr.addColorStop(1, '#6a4a2a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const rg = x.createRadialGradient(w / 2, h * .75, 2, w / 2, h * .75, w); rg.addColorStop(0, 'rgba(255,170,80,.45)'); rg.addColorStop(1, 'rgba(255,170,80,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h); });
  M.uaInterior = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: .32, roughness: 1, flatShading: true }); } return M.uaInterior; };
// stone-ring of irregular voussoirs round an arch centred (cx,cy): inner radius r0, n stones (odd), keystone in the middle, from z0 to z1
function uaVoussoirs(g, cx, cy, r0, dMin, dMax, n, z0, z1, mats, seed, keyOver = .25) {
  const rng = uaRng(seed), ws = []; let tot = 0; for (let i = 0; i < n; i++) { let w = .72 + rng() * .62; if (i === (n - 1) >> 1) w *= 1.5; ws.push(w); tot += w; }
  let a = 0;
  for (let i = 0; i < n; i++) {
    const b = a + ws[i] / tot * Math.PI, key = i === (n - 1) >> 1, gap = .006 / r0 * 2, aa = a + gap, bb = b - gap;
    const d = key ? dMax + keyOver : (i % 2 ? dMin : dMax) + (rng() - .5) * .1, r1 = r0 + d, j = () => (rng() - .5) * .05;
    const P = (r, t) => [Math.cos(t) * r, Math.sin(t) * r];
    const pts = [P(r0, aa), P(r0, bb), P(r1 + j(), bb), P(r1 + j() + (key ? .08 : 0), (aa + bb) / 2 + (key ? 0 : (rng() - .5) * .01)), P(r1 + j(), aa)];
    if (key) pts.splice(3, 1, P(r1 + .02, bb - (bb - aa) * .12), P(r1 + .02, aa + (bb - aa) * .12));
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) sh.lineTo(pts[k][0], pts[k][1]); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false });
    const q = rng(), m = key ? mats[2] : q < .42 ? mats[1] : q > .86 ? mats[2] : mats[0];
    add(geo, m, cx, cy, z0, g); a = b; }
}
// an inscription plaque: framed, set into the wall, carved letters, laurel sprigs, weathered
function uaPlaqueMat(text) {
  const key = 'uaPlaque_' + text; if (M[key]) return M[key];
  const W = 512, H = 176, draw = (x, bump) => {
    const r = uaRng(77 + text.length * 13), sy = H / 256;
    x.fillStyle = bump ? '#909090' : '#ddd3bd'; x.fillRect(0, 0, W, H);
    if (!bump) { for (let i = 0; i < 34; i++) { x.fillStyle = `rgba(${r() < .5 ? '150,135,105' : '255,250,238'},${.05 + r() * .08})`; x.beginPath(); x.arc(r() * W, r() * H, 18 + r() * 60, 0, 7); x.fill(); }
      x.strokeStyle = 'rgba(160,148,124,.35)'; for (let i = 0; i < 6; i++) { x.lineWidth = .8 + r(); x.beginPath(); let px = r() * W, py = 0; x.moveTo(px, py); while (py < H) { px += r() * 40 - 20; py += 20 + r() * 30; x.lineTo(px, py); } x.stroke(); } }
    // incised border
    for (const [ins, w, col, bc] of [[10, 6, '#b5aa94', '#303030'], [24, 2.5, '#a39883', '#404040']]) { x.strokeStyle = bump ? bc : col; x.lineWidth = w; x.strokeRect(ins, ins, W - ins * 2, H - ins * 2); if (!bump) { x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.2; x.strokeRect(ins + w, ins + w, W - ins * 2 - w * 2, H - ins * 2 - w * 2); } }
    // laurel sprigs and rosettes
    const leaf = (px, py, ang, s) => { x.save(); x.translate(px, py); x.rotate(ang); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(s * .5, -s * .35, s, 0); x.quadraticCurveTo(s * .5, s * .35, 0, 0); x.fill(); x.restore(); };
    for (const sd of [-1, 1]) { const cx0 = W / 2 + sd * 205;
      for (let k = 0; k < 7; k++) { const t = k / 6, py = (190 - t * 120) * sy, px = cx0 + sd * (Math.sin(t * 3) * 8 - t * 6);
        for (const s2 of [-1, 1]) { x.fillStyle = bump ? '#3a3a3a' : (k % 2 ? '#a89c84' : '#9a8e76'); leaf(px, py, -Math.PI / 2 + s2 * .75 + sd * .1, 24 * sy); } }
      x.fillStyle = bump ? '#383838' : '#a29680'; x.beginPath(); x.arc(cx0, 205 * sy, 6, 0, 7); x.fill(); }
    // letters
    const chars = [...text], fs = Math.min(100, 390 / (chars.length * .8)); x.font = `bold ${fs}px "Times New Roman", Georgia, serif`; x.textBaseline = 'middle'; x.textAlign = 'left';
    const adv = chars.map(c => x.measureText(c).width + fs * .14), tw = adv.reduce((a, b) => a + b, 0); let px = W / 2 - tw / 2 + fs * .07;
    chars.forEach((c, i) => { if (!bump) { x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText(c, px + 1.8, H / 2 + 2.2); x.fillStyle = '#6a5c47'; x.fillText(c, px, H / 2); x.fillStyle = 'rgba(40,30,20,.5)'; x.fillText(c, px - .8, H / 2 - .8); }
      else { x.fillStyle = '#101010'; x.fillText(c, px, H / 2); } px += adv[i]; });
    if (!bump) { // weathering: drips from the top, damp stain below, lichen, chipped corners
      for (let i = 0; i < 12; i++) { const dx = r() * W, l = 40 + r() * 140, gr = x.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(90,72,50,.2)'); gr.addColorStop(1, 'rgba(90,72,50,0)'); x.save(); x.translate(dx, 0); x.fillStyle = gr; x.fillRect(0, 0, 3 + r() * 6, l); x.restore(); }
      const gr = x.createLinearGradient(0, H * .6, 0, H); gr.addColorStop(0, 'rgba(80,96,52,0)'); gr.addColorStop(1, 'rgba(80,96,52,.28)'); x.fillStyle = gr; x.fillRect(0, H * .6, W, H * .4);
      for (let i = 0; i < 26; i++) { x.fillStyle = r() < .5 ? 'rgba(190,150,60,.35)' : 'rgba(96,116,60,.3)'; x.beginPath(); x.arc(r() * W, r() < .5 ? r() * 40 : H - r() * 40, 1.5 + r() * 4, 0, 7); x.fill(); }
      for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r() < .6 ? '60,48,36' : '255,252,240'},${r() * .25})`; x.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6); } }
  };
  const map = uaTex(W, H, x => draw(x, false)), bump = uaTex(W, H, x => draw(x, true)); bump.colorSpace = THREE.NoColorSpace;
  return (M[key] = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 2.2, roughness: .95, flatShading: false }));
}
function uaPlaque(g, x, y, z, w, h, text, trim) {
  box(w + .3, h + .3, .1, trim, x, y - .15, z, g);                                  // set-in slab
  const f = add(new THREE.PlaneGeometry(w, h), uaPlaqueMat(text), x, y + h / 2, z + .105, g); f.castShadow = false;
  for (const sy of [-1, 1]) box(w + .24, .1, .1, trim, x, y + (sy > 0 ? h : -.05) - (sy > 0 ? .0 : 0), z + .02, g);
  for (const sx of [-1, 1]) box(.1, h, .1, trim, x + sx * (w / 2 + .05), y, z + .02, g);
  box(w + .6, .12, .3, trim, x, y + h + .1, z + .07, g); box(w + .42, .1, .22, trim, x, y + h + .2, z + .06, g);       // cornice
  box(w + .5, .1, .24, trim, x, y - .32, z + .06, g);                                                                  // sill
  for (const sx of [-1, 1]) { const ac = add(new THREE.ConeGeometry(.09, .2, 4), trim, x + sx * (w / 2 + .2), y + h + .3, z + .15, g); ac.rotation.y = Math.PI / 4; }
  const top = add(new THREE.ConeGeometry(.14, .24, 4), trim, x, y + h + .32, z + .15, g); top.rotation.y = Math.PI / 4;
}
// one face of a tower: a stone slab with a barred arched window, shutters and arrow slits cut through it (sgn +1 = front, -1 = back)
function uaTowerFace(g, H, sgn, withWindow, st, dr, o) {
  const z0 = 2.2 * sgn, z1 = 3 * sgn, wy = Math.min(5.0, H - 5), holes = [];
  if (withWindow) holes.push(uaHoleArch(0, wy, .6, 1.3)); else holes.push(uaHoleRect(0, wy + .3, .1, 1.9));
  if (withWindow) for (const sx of [-2.2, 2.2]) holes.push(uaHoleRect(sx, wy + .2, .09, 1.6));
  uaSlab(6, H, holes, z0, z1, st, g);
  const iron = uaIron(), face = z1, sc = (w, h, px, py, pz) => { const p = add(new THREE.PlaneGeometry(w, h), uaInteriorMat(), px, py, pz, g); if (sgn < 0) p.rotation.y = Math.PI; p.castShadow = false; return p; };
  const shut = mat('uaShutter', '#6a4c30', { map: M.wood && M.wood.map || null });
  if (withWindow) {
    sc(1.3, 2.0, 0, wy + 1.0, z0 + .02 * sgn);
    for (const bx of [-.36, -.18, 0, .18, .36]) box(.03, 1.95, .03, iron, bx, wy + .02, z1 - .35 * sgn, g);
    box(1.2, .035, .035, iron, 0, wy + .6, z1 - .35 * sgn, g); box(1.2, .035, .035, iron, 0, wy + 1.4, z1 - .35 * sgn, g);
    box(1.8, .16, .4, dr, 0, wy - .16, z1 + .12 * sgn, g);                                                // sill
    for (const sd of [-1, 1]) { box(.58, 1.9, .06, shut, sd * .96, wy, z1 + .03 * sgn, g); for (const hy of [.4, 1.4]) box(.58, .07, .03, iron, sd * .96, wy + hy, z1 + .07 * sgn, g); }   // open shutters laid flat on the wall
    uaVoussoirs(g, 0, wy + 1.3, .6, .18, .28, 9, face - .1, face + .1, [st, dr, dr], 515, .1);
    for (const sx of [-2.2, 2.2]) { sc(.2, 1.65, sx, wy + .2 + .825, z0 + .02 * sgn); box(.55, .13, .18, dr, sx, wy + 1.8, z1 + .03 * sgn, g); box(.5, .09, .2, dr, sx, wy + .1, z1 + .04 * sgn, g); }
  } else { sc(.24, 2.0, 0, wy + 1.25, z0 + .02 * sgn); box(.55, .13, .18, dr, 0, wy + 2.2, z1 + .03 * sgn, g); box(.5, .09, .2, dr, 0, wy + .22, z1 + .04 * sgn, g); }
}

// ================= the burning torch on a post =================
function uaWrapTex() {
  return UAC.wrap ||= uaTex(64, 64, (x, w) => { const r = uaRng(55); x.fillStyle = '#2e2018'; x.fillRect(0, 0, w, w);
    for (let i = 0; i < 90; i++) { x.strokeStyle = r() < .5 ? 'rgba(120,88,52,.55)' : 'rgba(10,6,4,.6)'; x.lineWidth = 1 + r() * 2; const y = r() * w; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y + (r() - .5) * 18); x.stroke(); }
    for (let i = 0; i < 24; i++) { x.fillStyle = 'rgba(190,150,90,.4)'; x.fillRect(r() * w, r() * w, 6 + r() * 8, 1.4); } });
}
function gateTorch(g, x, y, z) {
  const G = new THREE.Group(); G.position.set(x, y, z); g.add(G);
  const iron = uaIron(), wood = mat('uaTorchWood', '#7a5434', { map: M.wood && M.wood.map || null }), burnt = mat('uaBurnt', '#2c211a');
  const rope = mat('uaRope', '#a8885a'), pitch = new THREE.MeshStandardMaterial({ color: '#d2b896', map: uaWrapTex(), roughness: .75, flatShading: false });
  UAC.pitchMat ||= pitch;
  // footing: stone block, iron socket
  box(.46, .12, .46, 'stoneDk', 0, 0, 0, G); cyl(.1, .13, .14, 8, iron, 0, .12, 0, G); uaRing(.105, .016, iron, 0, .27, 0, G, 8);
  // post, scorched near the head, with iron straps
  cyl(.062, .085, 1.46, 8, wood, 0, .26, 0, G); cyl(.06, .062, .3, 8, burnt, 0, 1.46, 0, G);
  for (const hy of [.55, 1.05]) uaRing(.088 - hy * .013, .016, iron, 0, hy, 0, G, 8);
  box(.02, .3, .05, iron, .07, .62, 0, G);
  // bracket arm with a hook for a spare torch
  uaTube([[.05, .98, 0], [.2, 1.04, 0], [.3, .98, 0], [.31, .86, 0]], .011, iron, G, 10);
  uaLimb([.05, .72, 0], [.27, .95, 0], .012, .012, iron, G, 4);
  // cresset: flared iron cup with four straps up from the post (the whole head is built in its own group and scaled up so it reads from a distance)
  const cy0 = 1.74, HG = new THREE.Group(); HG.position.set(0, cy0, 0); HG.scale.set(1.45, 1.3, 1.45); G.add(HG);
  uaLathe([[0, 0], [.05, 0], [.1, .05], [.155, .14], [.175, .19], [.165, .19], [.145, .12], [.1, .075], [.04, .045], [0, .04]], iron, 0, 0, 0, HG, 9).material = (UAC.cupMat ||= (() => { const m = iron.clone(); m.side = THREE.DoubleSide; return m; })());
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4, c = Math.cos(a), s = Math.sin(a); uaLimb([c * .045, -.06, s * .045], [c * .165, .2, s * .165], .011, .009, iron, HG, 4); }
  uaRing(.167, .012, iron, 0, .19, 0, HG, 14);
  // the wrapped, pitch-soaked head
  uaLathe([[0, 0], [.07, .01], [.115, .07], [.145, .15], [.14, .24], [.1, .3], [.055, .335], [0, .35]], pitch, 0, .06, 0, HG, 10);
  for (const [hy, r] of [[.085, .122], [.17, .146], [.25, .136]]) uaRing(r + .004, .011, rope, 0, .06 + hy, 0, HG, 12);
  for (const [a, hy] of [[.4, .12], [2.2, .06], [4.1, .15]]) { const d = add(new THREE.IcosahedronGeometry(.02, 0), mat('uaDrip', '#15100c', { roughness: .3 }), Math.cos(a) * .14, .06 + hy - .03, Math.sin(a) * .14, HG); d.scale.set(.8, 2, .8); }
  // soot-black crown with glowing embers
  cyl(.085, .1, .03, 9, burnt, 0, .385, 0, HG);
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + .3; add(new THREE.IcosahedronGeometry(.017 + (i % 2) * .008, 0), mat('uaEmber', '#ff6a1a', { emissive: '#ff5a10', emissiveIntensity: 1.6 }), Math.cos(a) * .06, .425, Math.sin(a) * .06, HG).castShadow = false; }
  uaGlow(G, 0, cy0 + .75, 0, .7, '#ff9a40', .3);
  uaFire(G, 0, cy0 + .5, 0, .27, false);
  return y + 2.7;
}

// ================= the street lamp: a bronze lampstand with a hanging oil lamp =================
function oilLampStand(g, x, y, z, ry = 0) {
  const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; g.add(G);
  const br = uaBronzeDk(), brl = uaBronze(), iron = uaIron();
  box(.5, .08, .5, 'stoneDk', 0, 0, 0, G).rotation.y = Math.PI / 4;
  // turned post: flared foot, three feet, beaded shaft, capital
  uaLathe([[0, .08], [.17, .08], [.17, .11], [.12, .15], [.08, .22], [.055, .3], [.04, .42], [.04, .62], [.058, .66], [.058, .7], [.04, .74], [.036, 1.15], [.05, 1.19], [.05, 1.23], [.036, 1.27], [.034, 1.8],
    [.05, 1.84], [.05, 1.88], [.036, 1.92], [.04, 1.96], [.09, 2.02], [.125, 2.06], [.125, 2.1], [.07, 2.12], [0, 2.12]], br, 0, 0, 0, G, 9);
  for (const hy of [.5, 1.5]) uaRing(.052, .014, brl, 0, hy, 0, G, 8);
  // bracket arm that curls out over the street and ends in a hook, with a scroll brace
  uaTube([[.03, 1.96, 0], [.16, 2.17, 0], [.34, 2.24, 0], [.5, 2.2, 0], [.56, 2.1, 0]], .014, iron, G, 12);
  uaTube([[.04, 1.72, 0], [.12, 1.9, 0], [.26, 2.1, 0], [.33, 2.2, 0]], .01, iron, G, 10);
  uaRing(.04, .008, iron, .6, 2.09, 0, G, 8, 0);
  // chain
  for (let i = 0; i < 3; i++) { const l = uaRing(.022, .006, iron, .56, 1.98 - i * .06, 0, G, 6, i % 2 ? 0 : Math.PI / 2); if (i % 2) l.rotation.y = Math.PI / 2; }
  // lamp: round bronze body with filling disc, a spout towards the street and a ring handle behind
  const L = new THREE.Group(); L.position.set(.56, 1.6, 0); L.scale.setScalar(1.35); G.add(L);
  const bm = (UAC.lampBody ||= (() => { const m = brl.clone(); m.side = THREE.DoubleSide; return m; })());
  uaLathe([[0, 0], [.045, 0], [.09, .035], [.115, .08], [.095, .125], [.045, .145], [.0, .15]], bm, 0, 0, 0, L, 10);
  uaLathe([[.05, .145], [.065, .15], [.06, .165], [0, .165]], uaGold(), 0, 0, 0, L, 8);
  add(new THREE.CircleGeometry(.025, 6), mat('uaLampHole', '#1a120a'), 0, .167, 0, L).rotation.x = -Math.PI / 2;
  const sp = uaLimb([.09, .09, 0], [.22, .115, 0], .045, .02, bm, L, 7);
  add(new THREE.CircleGeometry(.018, 6), mat('uaWick', '#2a1a10'), .225, .117, 0, L).rotation.y = Math.PI / 2;
  const hd = add(new THREE.TorusGeometry(.05, .011, 4, 9, Math.PI * 1.2), brl, -.14, .1, 0, L); hd.rotation.z = Math.PI * .4;
  uaRing(.032, .006, iron, 0, .205, 0, L, 6, 0); uaLimb([0, .17, 0], [0, .2, 0], .006, .006, iron, L, 3);
  // flame, soft glow
  uaFire(L, .225, .12, 0, .075, false);
  uaGlow(L, .22, .2, 0, .6, '#ffb255', .3);
  return y + 2.75;
}

// ================= the altar of the courtyard =================
function uaRelief(key, W, H, drawFn) {
  if (UAC[key]) return UAC[key];
  const mk = bump => uaTex(W, H, (x) => { const pal = bump ? { bg: '#707070', face: '#dcdcdc', sh: '#121212', line: 'rgba(0,0,0,.5)' } : { bg: '#d3c6ac', face: '#e8ddc7', sh: 'rgba(70,52,34,.55)', line: 'rgba(70,52,34,.5)' };
    x.fillStyle = pal.bg; x.fillRect(0, 0, W, H); drawFn(x, pal, bump);
    if (!bump) { const r = uaRng(909); for (let i = 0; i < 10; i++) { const dx = r() * W, l = 20 + r() * 80, gr = x.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(80,62,40,.2)'); gr.addColorStop(1, 'rgba(80,62,40,0)'); x.save(); x.translate(dx, 0); x.fillStyle = gr; x.fillRect(0, 0, 3 + r() * 5, l); x.restore(); }
      const mg = x.createLinearGradient(0, H * .7, 0, H); mg.addColorStop(0, 'rgba(80,96,52,0)'); mg.addColorStop(1, 'rgba(80,96,52,.3)'); x.fillStyle = mg; x.fillRect(0, H * .7, W, H * .3);
      for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(${r() < .6 ? '60,48,36' : '255,252,240'},${r() * .25})`; x.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6); } } });
  const map = mk(false), bump = mk(true); bump.colorSpace = THREE.NoColorSpace;
  return UAC[key] = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 2.6, roughness: .95 });
}
// carve(path-fn): draws a raised shape: dark shadow offset, then the face, then a thin edge
function uaCarve(x, pal, fn, dx = 2.5, dy = 2.5) { x.save(); x.translate(dx, dy); x.fillStyle = pal.sh; fn(); x.fill(); x.restore(); x.fillStyle = pal.face; fn(); x.fill(); x.strokeStyle = pal.line; x.lineWidth = 1.2; fn(); x.stroke(); }
function uaAltarFront() {
  return uaRelief('altarFront', 512, 192, (x, pal, bump) => {
    x.strokeStyle = pal.line; x.lineWidth = 4; x.strokeRect(6, 6, 500, 180);
    // garlands (swags of leaves and fruit) from the bucranium to the rosettes at the ends
    const swag = (x0, y0, x1, y1, sag) => { const n = 17; for (let i = 0; i <= n; i++) { const t = i / n, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag, ang = Math.atan2((y1 - y0) + Math.cos(Math.PI * t) * Math.PI * sag, x1 - x0);
        const fat = 9 + Math.sin(Math.PI * t) * 6;
        uaCarve(x, pal, () => { x.beginPath(); x.save(); x.translate(px, py); x.rotate(ang + (i % 2 ? .5 : -.5)); x.ellipse(0, 0, 15, fat * .5, 0, 0, 7); x.restore(); }, 1.8, 1.8); }
      for (const t of [.25, .5, .75]) { const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag; uaCarve(x, pal, () => { x.beginPath(); x.arc(px, py + 1, 9, 0, 7); }, 1.8, 1.8); }
      for (const [bx, by] of [[x0, y0], [x1, y1]]) uaCarve(x, pal, () => { x.beginPath(); x.moveTo(bx - 7, by - 4); x.lineTo(bx + 7, by - 4); x.lineTo(bx + 4, by + 30); x.lineTo(bx - 4, by + 38); x.closePath(); }, 1.5, 1.5); };
    swag(250, 52, 52, 48, 66); swag(262, 52, 460, 48, 66);
    // rosettes in the corners
    for (const px of [38, 474]) { uaCarve(x, pal, () => { x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; x.moveTo(px, 34); x.ellipse(px + Math.cos(a) * 11, 34 + Math.sin(a) * 11, 10, 5, a, 0, 7); } }, 1.5, 1.5); uaCarve(x, pal, () => { x.beginPath(); x.arc(px, 34, 6, 0, 7); }, 1, 1); }
    // bucranium: ox skull between its horns, with ribbons
    uaCarve(x, pal, () => { x.beginPath(); x.moveTo(228, 34); x.bezierCurveTo(212, 12, 192, 22, 200, 48); x.bezierCurveTo(206, 56, 222, 50, 230, 44); x.moveTo(284, 34); x.bezierCurveTo(300, 12, 320, 22, 312, 48); x.bezierCurveTo(306, 56, 290, 50, 282, 44); }, 3, 3);
    uaCarve(x, pal, () => { x.beginPath(); x.moveTo(232, 26); x.quadraticCurveTo(256, 14, 280, 26); x.quadraticCurveTo(284, 70, 270, 110); x.quadraticCurveTo(268, 142, 256, 148); x.quadraticCurveTo(244, 142, 242, 110); x.quadraticCurveTo(228, 70, 232, 26); }, 3, 3);
    uaCarve(x, pal, () => { x.beginPath(); x.ellipse(244, 52, 7, 4, .3, 0, 7); x.ellipse(268, 52, 7, 4, -.3, 0, 7); }, 1, 1);
    x.fillStyle = pal.sh; for (const nx of [248, 264]) { x.beginPath(); x.ellipse(nx, 132, 3, 5, 0, 0, 7); x.fill(); } x.beginPath(); x.ellipse(256, 98, 10, 3, 0, 0, 7); x.fill();
    for (const sd of [-1, 1]) uaCarve(x, pal, () => { x.beginPath(); x.moveTo(256 + sd * 22, 70); x.bezierCurveTo(256 + sd * 60, 80, 256 + sd * 56, 130, 256 + sd * 48, 172); x.lineTo(256 + sd * 38, 168); x.bezierCurveTo(256 + sd * 44, 128, 256 + sd * 44, 92, 256 + sd * 20, 80); x.closePath(); }, 2, 2);
  });
}
function uaAltarSide() {
  return uaRelief('altarSide', 256, 192, (x, pal) => {
    x.strokeStyle = pal.line; x.lineWidth = 4; x.strokeRect(6, 6, 244, 180);
    for (const [r, ins] of [[44, 0], [30, 0], [14, 0]]) uaCarve(x, pal, () => { x.beginPath(); x.arc(86, 96, r, 0, 7); }, ins ? 1 : 2.5, 2.5);
    uaCarve(x, pal, () => { x.beginPath(); x.arc(86, 96, 9, 0, 7); }, 1.5, 1.5);                         // phiale with its boss
    uaCarve(x, pal, () => { x.beginPath(); x.moveTo(176, 42); x.quadraticCurveTo(196, 40, 192, 64); x.lineTo(194, 84); x.quadraticCurveTo(224, 100, 214, 140); x.quadraticCurveTo(204, 166, 186, 166); x.quadraticCurveTo(168, 166, 160, 140); x.quadraticCurveTo(154, 100, 180, 84); x.lineTo(180, 64); x.quadraticCurveTo(170, 56, 176, 42); }, 3, 3);   // oinochoe
    uaCarve(x, pal, () => { x.beginPath(); x.moveTo(214, 70); x.bezierCurveTo(240, 60, 244, 110, 218, 124); x.lineTo(214, 116); x.bezierCurveTo(232, 104, 230, 76, 212, 80); x.closePath(); }, 2, 2);
  });
}
function uaSootTop() {
  if (M.uaSoot) return M.uaSoot;
  const t = uaTex(256, 256, (x, w) => { const r = uaRng(123); x.clearRect(0, 0, w, w);
    const gr = x.createRadialGradient(w / 2, w / 2, 8, w / 2, w / 2, w * .5); gr.addColorStop(0, 'rgba(18,12,8,.92)'); gr.addColorStop(.45, 'rgba(26,18,12,.8)'); gr.addColorStop(.8, 'rgba(40,30,22,.28)'); gr.addColorStop(1, 'rgba(40,30,22,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w);
    for (let i = 0; i < 40; i++) { const a = r() * 6.28, rr = 20 + r() * 100; x.fillStyle = `rgba(20,14,10,${.1 + r() * .25})`; x.beginPath(); x.ellipse(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 3 + r() * 14, 2 + r() * 6, a, 0, 7); x.fill(); }
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(170,160,146,${.1 + r() * .25})`; x.fillRect(w / 2 + (r() - .5) * 120, w / 2 + (r() - .5) * 120, 1 + r() * 3, 1 + r() * 2); } });
  return M.uaSoot = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
}
// food and vessels for the offerings
function uaFig(g, x, y, z, col) { const f = uaLathe([[0, 0], [.028, .008], [.047, .04], [.04, .075], [.02, .105], [.008, .122], [0, .126]], mat('uaFig' + col, col, { flatShading: false, roughness: .6 }), x, y, z, g, 7); f.rotation.z = .25; return f; }
function uaPomegranate(g, x, y, z) { const m = mat('uaPom', '#b3261e', { flatShading: false, roughness: .45 }); uaLathe([[0, 0], [.045, .01], [.064, .05], [.056, .095], [.03, .12], [.034, .14], [.02, .134], [0, .125]], m, x, y, z, g, 8);
  uaRing(.024, .006, mat('uaPomCrown', '#8a1a14'), x, y + .14, z, g, 5); }
function uaLoaf(g, x, y, z) { cyl(.2, .2, .02, 10, 'woodLt', x, y, z, g); const bm = mat('uaBread', '#c98a42', { flatShading: false, roughness: .7 });
  uaLathe([[0, 0], [.15, 0], [.18, .03], [.16, .075], [.1, .105], [0, .115]], bm, x, y + .02, z, g, 12);
  for (let i = 0; i < 4; i++) { const sc = box(.3, .006, .012, mat('uaScore', '#7a4a1e'), x, y + .13, z, g); sc.rotation.y = i * Math.PI / 4; sc.position.y = y + .136; } }
function uaPhiale(g, x, y, z) { const gm = (UAC.phialeMat ||= (() => { const m = uaGold().clone(); m.side = THREE.DoubleSide; return m; })());
  uaLathe([[0, .012], [.06, 0], [.14, .02], [.175, .06], [.17, .066], [.135, .036], [.05, .026], [0, .05]], gm, x, y, z, g, 14);
  const w = add(new THREE.CircleGeometry(.13, 12), mat('uaWine', '#5a1424', { roughness: .15, metalness: .2 }), x, y + .034, z, g); w.rotation.x = -Math.PI / 2; w.castShadow = false; }
function uaOinochoe(g, x, y, z, ry = 0) { const J = new THREE.Group(); J.position.set(x, y, z); J.rotation.y = ry; g.add(J);
  uaLathe([[0, 0], [.045, 0], [.05, .018], [.075, .07], [.098, .14], [.085, .205], [.055, .25], [.036, .285], [.04, .325], [.065, .365], [.05, .37], [.03, .34], [.02, .3]], uaClay(), 0, 0, 0, J, 10);
  uaRing(.093, .008, mat('uaGlaze', '#2f1f18'), 0, .16, 0, J, 10); uaRing(.047, .007, mat('uaGlaze', '#2f1f18'), 0, .31, 0, J, 8);
  const hd = add(new THREE.TorusGeometry(.08, .012, 4, 9, Math.PI), uaClay(), .045, .26, 0, J); hd.rotation.z = -Math.PI / 2; hd.scale.set(1, .8, 1); }
function uaGrapes(g, x, y, z, ry) { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; g.add(G); const r = uaRng(21);
  const gm = [mat('uaGrapeA', '#4b2a5a', { flatShading: false, roughness: .35 }), mat('uaGrapeB', '#5a2f6a', { flatShading: false, roughness: .35 })], rows = [4, 4, 3, 2, 1];
  for (let row = 0; row < rows.length; row++) for (let k = 0; k < rows[row]; k++) add(new THREE.IcosahedronGeometry(.032, 0), gm[(k + row) % 2], -.02 - row * .052, .034 + (r() - .5) * .006, (k - (rows[row] - 1) / 2) * .058, G);
  cyl(.007, .01, .09, 5, mat('uaStem', '#5a4a2a'), .04, .03, 0, G).rotation.z = Math.PI / 2;
  const lf = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? .035 : .085; k ? lf.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : lf.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const l = add(new THREE.ShapeGeometry(lf), mat('uaVine', '#5f7a35', { side: THREE.DoubleSide }), .08, .012, .02, G); l.rotation.x = -Math.PI / 2; l.castShadow = false; }
function uaWreath(g, x, y, z) { const r = uaRng(5), W = new THREE.Group(); W.position.set(x, y, z); g.add(W);
  const lm = mat('uaLeafG', '#58783a', { flatShading: true }), ld = mat('uaLeafD', '#44602e');
  uaRing(.21, .028, ld, 0, .03, 0, W, 14);
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, c = add(new THREE.ConeGeometry(.022, .1, 3), i % 2 ? lm : ld, Math.cos(a) * .21, .05 + (i % 3) * .008, Math.sin(a) * .21, W);
    const d = new THREE.Vector3(-Math.sin(a) + Math.cos(a) * (i % 2 ? .5 : -.5), .3, Math.cos(a) + Math.sin(a) * (i % 2 ? .5 : -.5)).normalize(); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); }
  for (let i = 0; i < 5; i++) { const a = i * 1.4 + .5; add(new THREE.IcosahedronGeometry(.014, 0), mat('uaBerry', '#b83030'), Math.cos(a) * .21, .07, Math.sin(a) * .21, W); }
  const rb = mat('uaRibbon', '#c8a040'); for (const s of [-1, 1]) { const t = box(.035, .006, .15, rb, .05 * s, .0, .26, W); t.rotation.y = s * .35; } }
function uaIncense(g, x, y, z) { const D = new THREE.Group(); D.position.set(x, y, z); g.add(D); const bm = uaBronzeDk();
  for (let i = 0; i < 3; i++) { const a = i * 2.094; uaLimb([Math.cos(a) * .04, .08, Math.sin(a) * .04], [Math.cos(a) * .075, 0, Math.sin(a) * .075], .008, .01, bm, D, 4); }
  uaLathe([[0, .08], [.06, .075], [.11, .11], [.115, .14], [.105, .14], [.05, .105], [0, .1]], (UAC.incMat ||= (() => { const m = bm.clone(); m.side = THREE.DoubleSide; return m; })()), 0, 0, 0, D, 10);
  const co = add(new THREE.CircleGeometry(.09, 9), mat('uaCoal', '#1e1612'), 0, .13, 0, D); co.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 4; i++) { const a = i * 1.6; add(new THREE.IcosahedronGeometry(.016, 0), mat('uaEmber', '#ff6a1a', { emissive: '#ff5a10', emissiveIntensity: 1.6 }), Math.cos(a) * .05, .135, Math.sin(a) * .05, D); }
  // smoke wisp: soft puffs drifting up in an S
  for (let i = 0; i < 7; i++) { const t = i / 6; uaGlow(D, Math.sin(t * 5) * .05 * t + t * .03, .2 + t * .6, Math.cos(t * 4) * .03 * t, .07 + t * .2, '#bfc2c6', .4 * (1 - t * .75)).material.blending = THREE.NormalBlending; } }

function altarOfFire(g, x, y, z) {
  const st = uaStoneMat('stone', 'Ash'), dr = uaStoneMat('stone', 'Dr'), drl = uaStoneMat('marble', 'Dr'), drd = uaStoneMat('stoneDk', 'Dr');
  const A = new THREE.Group(); A.position.set(x, y, z); g.add(A);
  // stepped base, die with a carved panel, moulded cornice and top slab with bolsters
  box(2.9, .18, 2.1, drd, 0, 0, 0, A); box(2.65, .17, 1.88, dr, 0, .18, 0, A);
  box(2.25, .78, 1.5, st, 0, .35, 0, A);
  box(2.42, .08, 1.65, dr, 0, .35, 0, A); box(2.34, .06, 1.57, dr, 0, .43, 0, A);                  // base moulding
  box(2.42, .06, 1.65, dr, 0, 1.05, 0, A); box(2.5, .1, 1.72, drl, 0, 1.11, 0, A); box(2.62, .1, 1.84, drl, 0, 1.21, 0, A);    // cornice
  box(2.72, .14, 1.94, drl, 0, 1.31, 0, A);
  // carved panels: garland and bucranium on the front, patera and jug on the ends, in raised frames
  const fr = (w, h, px, pz, ry) => { const P = new THREE.Group(); P.position.set(px, .52, pz); P.rotation.y = ry; A.add(P);
    const pl = add(new THREE.PlaneGeometry(w, h), ry === 0 ? uaAltarFront() : uaAltarSide(), 0, h / 2, .005, P); pl.castShadow = false;
    box(w + .1, .05, .05, dr, 0, h, 0, P); box(w + .1, .05, .05, dr, 0, -.05, 0, P); for (const s of [-1, 1]) box(.05, h + .1, .05, dr, s * (w / 2 + .025), -.05, 0, P); };
  fr(1.9, .57, 0, .751, 0); fr(1.1, .56, 1.126, 0, Math.PI / 2); fr(1.1, .56, -1.126, 0, -Math.PI / 2);
  // bolsters (the scrolled ends of the top) with rosette ends, acroteria at the four corners
  for (const sd of [-1, 1]) { const b = add(new THREE.CylinderGeometry(.11, .11, 1.8, 8), drl, sd * 1.17, 1.56, 0, A); b.rotation.x = Math.PI / 2;
    for (const e of [-1, 1]) { const c = add(new THREE.CylinderGeometry(.115, .115, .03, 8), dr, sd * 1.17, 1.56, e * .9, A); c.rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(.04, .04, .04, 6), drd, sd * 1.17, 1.56, e * .915, A).rotation.x = Math.PI / 2; }
    box(.18, .24, 1.4, drl, sd * 1.17, 1.45, 0, A).scale.set(1, .5, 1);
    for (const e of [-1, 1]) { const ac = add(new THREE.ConeGeometry(.11, .26, 4), drl, sd * 1.17, 1.8, e * .92, A); ac.rotation.y = Math.PI / 4; } }
  // the hearth: soot-darkened top, a rim, charred logs, glowing embers
  const so = add(new THREE.PlaneGeometry(1.9, 1.7), uaSootTop(), 0, 1.456, 0, A); so.rotation.x = -Math.PI / 2; so.castShadow = false;
  uaRing(.46, .035, drd, 0, 1.47, 0, A, 14);
  const ch = mat('uaChar', '#241a14');
  for (let i = 0; i < 4; i++) { const a = i * 1.55 + .3, l = cyl(.04, .05, .6, 5, ch, Math.cos(a) * .12, 1.47, Math.sin(a) * .12, A); l.rotation.set(0, -a, Math.PI / 2 - .1); l.position.y = 1.5; }
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + .2; add(new THREE.IcosahedronGeometry(.03, 0), mat('uaEmber', '#ff6a1a', { emissive: '#ff5a10', emissiveIntensity: 1.6 }), Math.cos(a) * .3, 1.5, Math.sin(a) * .3, A).castShadow = false; }
  const f = makeFire(THREE, { scale: .5 }); f.position.set(0, 1.46, 0); f.traverse(o => o.userData.dyn = 1); A.add(f); FIRES.push(f);
  // offerings
  uaCarvePlate(A, -.76, 1.45, .36); uaWreath(A, .76, 1.45, .46); uaLoaf(A, .78, 1.45, -.38); uaGrapes(A, -.82, 1.45, -.4, .5); uaPhiale(A, .02, 1.45, .72);
  uaOinochoe(A, -.92, .35, .86, .5); uaIncense(A, .95, .35, .85);
  return y + 2.3;
}
function uaCarvePlate(A, x, y, z) { uaLathe([[0, .004], [.1, 0], [.21, .02], [.255, .06], [.245, .066], [.2, .04], [.1, .028], [0, .03]], uaClay(), x, y, z, A, 14);
  const P = new THREE.Group(); P.position.set(x, y + .03, z); A.add(P);
  [[-.1, -.02, 0], [.07, -.1, 1], [.13, .05, 0], [-.04, .1, 1]].forEach(([fx, fz, k], i) => { uaFig(P, fx, 0, fz, k ? '#5a2a4a' : '#8a9a4a').rotation.y = i * 1.3; });
  uaPomegranate(P, -.12, 0, .08); uaPomegranate(P, .0, 0, -.06); uaPomegranate(P, .02, .06, .02);
  for (const [lx, lz, a] of [[-.2, -.05, 2.5], [.2, .1, -.6], [.0, .2, 1.6]]) { const lf = add(new THREE.ConeGeometry(.03, .1, 3), mat('uaLeafG', '#58783a', { flatShading: true }), lx, .01, lz, P); lf.rotation.set(Math.PI / 2, 0, a); } }
