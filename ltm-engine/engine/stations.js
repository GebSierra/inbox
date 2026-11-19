// ---------- STATIONS (memory loci) ----------
const STATIONS = []; const labelScene = new THREE.Scene();
const stationMat = new THREE.MeshStandardMaterial({ color: '#f0c46a', emissive: '#b8802a', emissiveIntensity: .6, flatShading: true });
function label2(name, ref) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 176; const x = c.getContext('2d');
  x.fillStyle = 'rgba(244,234,214,.96)'; x.strokeStyle = '#b8583a'; x.lineWidth = 6; x.beginPath(); x.roundRect(6, 6, 500, 164, 22); x.fill(); x.stroke();
  x.fillStyle = '#3b2a1c'; x.textAlign = 'center'; let fs = 58; x.font = `bold ${fs}px Georgia`; while (x.measureText(name).width > 470 && fs > 30) { fs -= 2; x.font = `bold ${fs}px Georgia`; }
  x.fillText(name, 256, 82); x.fillStyle = '#b8583a'; let fr = 44; x.font = `${fr}px Georgia`; while (x.measureText(ref).width > 470 && fr > 24) { fr -= 2; x.font = `${fr}px Georgia`; } x.fillText(ref, 256, 144);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(2.2, .76, 1); s.userData.wide = 1; return s; }
function label(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(244,234,214,.95)'; x.strokeStyle = '#b8583a'; x.lineWidth = 6;
  x.beginPath(); x.roundRect(6, 6, 244, 116, 18); x.fill(); x.stroke();
  x.fillStyle = '#3b2a1c'; let fs1 = 52; x.font = `bold ${fs1}px Georgia`; while (x.measureText(text).width > 228 && fs1 > 28) { fs1 -= 2; x.font = `bold ${fs1}px Georgia`; } x.textAlign = 'center'; x.fillText(text, 128, 82);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(1.5, .75, 1); return s;
}
function station(ch, room, name, x, z, look, custom) {
  if (ch > BUILT) return; const cn = ch + (CFG.chOffset || 0);   // the chapter number shown (chOffset: a town that starts mid-book)
  // passage mode (town.json "passages": true, e.g. verses100-ltm): one room per passage; the book room gives the reference ("John 3:16-17")
  // and the verse labels, one per spot (up to 6: the sixth sits on the doorway you leave by)
  const PR = CFG.passages && typeof bookRoom === 'function' ? bookRoom(ch, room) : null;
  const v0 = PR ? 1 : (room - 1) * 5 + 1, v1 = PR ? PR.verses.length : Math.min(room * 5, VERSES[ch - 1]);
  const vLabel = (i, v) => PR ? PR.verses[i] : `${cn}:${v}`, rangeLabel = PR ? PR.ref : `${cn}:${v0}${v1 > v0 ? '–' + v1 : ''}`;
  // five loci on a square, as seen standing in front facing the scene:
  // 1 near-left, 2 far-left, 3 far-right, 4 near-right (clockwise), 5 centre
  let fx = look[0] - x, fz = look[2] - z; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
  const rx = -fz, rz = fx, h = 1.5;
  const spots = [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]];   // [forward, right]
  const CORNER = ['near-left corner', 'far-left corner', 'far-right corner', 'near-right corner', 'centre', 'exit'];
  const loci = [];
  if (THEME.avgCentre && custom && ch === 1 && room >= 2 && room <= 5 && custom.length === 5) { const q = custom.slice(0, 4); custom[4] = { ...custom[4], x: q.reduce((a, c) => a + c.x, 0) / 4, y: q.reduce((a, c) => a + c.y, 0) / 4, z: q.reduce((a, c) => a + c.z, 0) / 4 }; }
  if (custom) { custom.forEach((c, i) => { const v = v0 + i; if (v > v1) return;
      const gem = add(new THREE.OctahedronGeometry(.13, 0), stationMat, c.x, c.y + .35, c.z); gem.castShadow = false; gem.userData.dyn = 1; gem.userData.isGem = 1;
      const l = label(vLabel(i, v)); l.position.set(c.x, c.y + .7, c.z); l.scale.set(.7, .35, 1); labelScene.add(l);
      loci.push({ v, x: c.x, z: c.z, fy: c.y, base: null, gem, label: l, where: `${CORNER[i]} · ${c.what}` }); });
    const ban = PR ? label2(PR.ref, name) : label2(name, rangeLabel); ban.position.set(x, THEME.bannerClear ? Math.max(heightAt(x, z) + 3.3, ...loci.map(l => l.fy + 1.05)) : heightAt(x, z) + 4.4, z); ban.scale.set(2.2, .76, 1); labelScene.add(ban);
    STATIONS.push({ ch, room, name, x, z, look, loci, banner: ban, text: PR ? PR.ref : `${BOOK} ${rangeLabel}` }); return; }
  spots.forEach(([f, r], i) => { const v = v0 + i; if (v > v1) return;
    const lx = x + fx * f * h + rx * r * h, lz = z + fz * f * h + rz * r * h, y = heightAt(lx, lz);
    const base = add(new THREE.CylinderGeometry(.3, .36, .16, 8), 'marble', lx, y + .08, lz); base.userData.dyn = 1;
    const gem = add(new THREE.OctahedronGeometry(.17, 0), stationMat, lx, y + .65, lz); gem.castShadow = false; gem.userData.dyn = 1;
    const l = label(vLabel(i, v)); l.position.set(lx, y + 1.15, lz); l.scale.set(.9, .45, 1); labelScene.add(l);
    loci.push({ v, x: lx, z: lz, base, gem, label: l, where: CORNER[i] }); });
  STATIONS.push({ ch, room, name, x, z, look, loci, text: PR ? PR.ref : `${BOOK} ${rangeLabel}` });
}
// what a district is called on the HUD and the bird's-eye labels: "Chapter 3", or in passage mode the sheet's section ("Listening, part 1: the Word")
function chTitle(ch) { return CFG.passages ? ((CFG.sections && CFG.sections[ch - 1]) || ZONE[ch - 1]) : `Chapter ${ch + (CFG.chOffset || 0)}`;
}

