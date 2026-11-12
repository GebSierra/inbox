// ---------- STATIONS (memory loci) ----------
const STATIONS = []; const labelScene = new THREE.Scene();
const stationMat = new THREE.MeshStandardMaterial({ color: '#f0c46a', emissive: '#b8802a', emissiveIntensity: .6, flatShading: true });
function label2(name, ref) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 176; const x = c.getContext('2d');
  x.fillStyle = 'rgba(244,234,214,.96)'; x.strokeStyle = '#b8583a'; x.lineWidth = 6; x.beginPath(); x.roundRect(6, 6, 500, 164, 22); x.fill(); x.stroke();
  x.fillStyle = '#3b2a1c'; x.textAlign = 'center'; let fs = 58; x.font = `bold ${fs}px Georgia`; while (x.measureText(name).width > 470 && fs > 30) { fs -= 2; x.font = `bold ${fs}px Georgia`; }
  x.fillText(name, 256, 82); x.fillStyle = '#b8583a'; x.font = '44px Georgia'; x.fillText(ref, 256, 144);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(2.2, .76, 1); s.userData.wide = 1; return s; }
function label(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(244,234,214,.95)'; x.strokeStyle = '#b8583a'; x.lineWidth = 6;
  x.beginPath(); x.roundRect(6, 6, 244, 116, 18); x.fill(); x.stroke();
  x.fillStyle = '#3b2a1c'; x.font = 'bold 52px Georgia'; x.textAlign = 'center'; x.fillText(text, 128, 82);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(1.5, .75, 1); return s;
}
function station(ch, room, name, x, z, look, custom) {
  if (ch > BUILT) return; const cn = ch + (CFG.chOffset || 0);   // the chapter number shown (chOffset: a town that starts mid-book)
  const v0 = (room - 1) * 5 + 1, v1 = Math.min(room * 5, VERSES[ch - 1]);
  // five loci on a square, as seen standing in front facing the scene:
  // 1 near-left, 2 far-left, 3 far-right, 4 near-right (clockwise), 5 centre
  let fx = look[0] - x, fz = look[2] - z; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
  const rx = -fz, rz = fx, h = 1.5;
  const spots = [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]];   // [forward, right]
  const CORNER = ['near-left corner', 'far-left corner', 'far-right corner', 'near-right corner', 'centre'];
  const loci = [];
  if (THEME.avgCentre && custom && ch === 1 && room >= 2 && room <= 5 && custom.length === 5) { const q = custom.slice(0, 4); custom[4] = { ...custom[4], x: q.reduce((a, c) => a + c.x, 0) / 4, y: q.reduce((a, c) => a + c.y, 0) / 4, z: q.reduce((a, c) => a + c.z, 0) / 4 }; }
  if (custom) { custom.forEach((c, i) => { const v = v0 + i; if (v > v1) return;
      const gem = add(new THREE.OctahedronGeometry(.13, 0), stationMat, c.x, c.y + .35, c.z); gem.castShadow = false; gem.userData.dyn = 1; gem.userData.isGem = 1;
      const l = label(`${cn}:${v}`); l.position.set(c.x, c.y + .7, c.z); l.scale.set(.7, .35, 1); labelScene.add(l);
      loci.push({ v, x: c.x, z: c.z, fy: c.y, base: null, gem, label: l, where: `${CORNER[i]} · ${c.what}` }); });
    const ban = label2(name, `${cn}:${v0}–${v1}`); ban.position.set(x, THEME.bannerClear ? Math.max(heightAt(x, z) + 3.3, ...loci.map(l => l.fy + 1.05)) : heightAt(x, z) + 4.4, z); ban.scale.set(2.2, .76, 1); labelScene.add(ban);
    STATIONS.push({ ch, room, name, x, z, look, loci, banner: ban, text: `${BOOK} ${cn}:${v0}–${v1}` }); return; }
  spots.forEach(([f, r], i) => { const v = v0 + i; if (v > v1) return;
    const lx = x + fx * f * h + rx * r * h, lz = z + fz * f * h + rz * r * h, y = heightAt(lx, lz);
    const base = add(new THREE.CylinderGeometry(.3, .36, .16, 8), 'marble', lx, y + .08, lz); base.userData.dyn = 1;
    const gem = add(new THREE.OctahedronGeometry(.17, 0), stationMat, lx, y + .65, lz); gem.castShadow = false; gem.userData.dyn = 1;
    const l = label(`${cn}:${v}`); l.position.set(lx, y + 1.15, lz); l.scale.set(.9, .45, 1); labelScene.add(l);
    loci.push({ v, x: lx, z: lz, base, gem, label: l, where: CORNER[i] }); });
  STATIONS.push({ ch, room, name, x, z, look, loci, text: `${BOOK} ${cn}:${v0}–${v1}` });
}

