// ---------- UPGRADE: shared drawn textures with large-scale variation (plan item L4, look change waiting for the owner) ----------
// The engine's plaster, stone, flagstone and cloth textures are small tiles that visibly repeat. With the theme "textures": "varied"
// (or ?tex=varied) each becomes a canvas four times the size: the original tile in each quarter, mirrored differently, with broad soft blotches across the whole sheet; texture.repeat is halved, so the fine grain stays the same size
// and the pattern repeats every two tiles instead of one, with no two neighbours alike. The originals are drawn first exactly as before,
// so the random-number stream is unchanged; this part draws with its own generator. Wood is left alone (crates clone it with their own repeat).
{ const q = new URLSearchParams(location.search);
  if ((THEME.textures || q.get('tex')) === 'varied') for (const [k, strength] of [['plaster', .09], ['stone', .12], ['flag', .1], ['cloth', .06]]) {
    const t = TEX[k]; if (!t || !t.image) continue; const src = t.image, w = src.width, c = document.createElement('canvas'); c.width = c.height = w * 2; const x = c.getContext('2d'), r = upRng(k.length * 131 + w);
    [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].forEach(([qx, qy, fx, fy], i) => { x.save(); x.translate(qx * w + (fx < 0 ? w : 0), qy * w + (fy < 0 ? w : 0)); x.scale(fx, fy); x.drawImage(src, 0, 0); x.restore(); });
    for (let i = 0; i < 18; i++) { const a = strength * (.4 + r() * .6); x.fillStyle = r() < .5 ? `rgba(70,52,34,${a})` : `rgba(255,246,228,${a})`;
      const ex = r() * w * 2, ey = r() * w * 2, rx = w * (.15 + r() * .35), ry = w * (.1 + r() * .3), rot = r() * 3;
      for (const [ox, oy] of [[0, 0], [w * 2, 0], [-w * 2, 0], [0, w * 2], [0, -w * 2]]) { x.beginPath(); x.ellipse(ex + ox, ey + oy, rx, ry, rot, 0, 7); x.fill(); } }   // wrapped, so the sheet still tiles seamlessly
    t.image = c; t.repeat.set(t.repeat.x * .5, t.repeat.y * .5); t.needsUpdate = true; } }
