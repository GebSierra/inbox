// ---------- NEW (verses100-ltm): glory beams, light shining out from behind a place ----------
// upGlory(g, x, y, z, o): a fan of soft shafts of light radiating from one point (the source sits behind a tent, a rock, a doorway), with a
// glow at the source. Each shaft is a sprite anchored at the source (sprite.center at its foot), so it always faces the viewer and rotates
// about the source; the fan breathes and sways slowly through the engine's FIRES updaters. Additive, never written to depth, kept out of
// the merge and the ambient-occlusion pass (objects/up-effects.js helpers). Private generator (no R()).
//   Additive warm-gold shafts (over dark trees they glow instead of greying like smoke); set the source low behind the object so it hides the hub.
//   Defaults: eleven even shafts with gaps between them, bright along their length (no bright base or blob at the hub), rising mostly upwards;
//   formerly: nine broad, tall shafts (god-rays) rising mostly upwards; the hub is dim, meant to sit hidden behind the object.
//   o: { n: shafts, len: [min, max] metres, width: [min, max], spread: radians either side of straight up, color, opacity, glow: size of the source glow }
function upGlory(g, x, y, z, o = {}) {
  const G = ufxGroup(g, x, y, z), r = upRng(Math.round(x * 31) ^ Math.round(z * 17) ^ 23);
  const n = o.n || 11, [l0, l1] = o.len || [10, 17], [w0, w1] = o.width || [.35, 1.15], spread = o.spread ?? .8, op = o.opacity ?? .55, col = o.color || '#ffb840';
  // one shaft: bright at its foot, fading to nothing at its tip, soft at both edges
  const tex = UFX.shaft || (UFX.shaft = canvasTex(128, (c, w) => { c.clearRect(0, 0, w, w); const img = c.createImageData(w, w);
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) { const u = (i + .5) / w, v = 1 - (j + .5) / w, edge = Math.pow(Math.sin(Math.PI * u), 2.0), fall = Math.pow(1 - v, .55) * Math.min(1, v * 10 + .1);
      const k = (j * w + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * edge * fall); }
    c.putImageData(img, 0, 0); }));
  const shafts = [];
  for (let i = 0; i < n; i++) { const t = n === 1 ? .5 : i / (n - 1), a = -spread + 2 * spread * t + (r() - .5) * .14;
    // a few broad, tall, soft shafts rising mostly upwards (god-rays), varied in width, length and strength: light, not a drawn sunburst
    const s = ufxSprite(G, tex, col, op, o.additive ?? true); s.center.set(.5, 0);
    const len = (l0 + (l1 - l0) * r()) * (1 - .25 * Math.abs(a) / Math.max(spread, .01)) * (i % 2 ? .78 : 1), wd = w0 + (w1 - w0) * r();
    s.scale.set(wd, len, 1); s.material.rotation = a; shafts.push({ s, a, ph: r() * 6.3, sp: .25 + r() * .35, op: op * (.6 + .4 * r()) }); }
  const glowTex = UFX.glow || (UFX.glow = canvasTex(128, (c, w) => { const gr = c.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  const core = ufxSprite(G, glowTex, '#ffd27a', .18, true); core.scale.setScalar(o.glow || 1.2);
  const halo = ufxSprite(G, glowTex, col, .0, true); halo.visible = false;
  FIRES.push({ update(t) { const sway = Math.sin(t * .11) * .03;
    for (const u of shafts) { u.s.material.rotation = u.a + sway; u.s.material.opacity = u.op * (.75 + .25 * Math.sin(t * u.sp + u.ph)); }
    core.material.opacity = .16 + .04 * Math.sin(t * .9); } });
  G.userData.frameBox = [l1 * 1.6, l1]; return y + 1; }

{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'verses100 1.1, 1.3', tags, kind: 'effect' });
  T('glory-beams', 'Glory: shafts of light shining out from behind', ['light', 'glory', 'creation', 'radiance'], (g, x, y, z, o) => upGlory(g, x, y, z, o || {})); }
