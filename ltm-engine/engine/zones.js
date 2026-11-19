// ---------- chapter zone labels, shown in bird's-eye view ----------
const ZONES = [];
function zoneLabel(ch, title, x, z) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160; const k = c.getContext('2d');
  k.fillStyle = 'rgba(59,42,28,.88)'; k.beginPath(); k.roundRect(8, 8, 496, 144, 24); k.fill();
  k.fillStyle = '#f0c46a'; const top = chTitle(ch).toUpperCase(); let zf = 34; k.font = `bold ${zf}px Georgia`; while (k.measureText(top).width > 470 && zf > 18) { zf -= 2; k.font = `bold ${zf}px Georgia`; } k.textAlign = 'center'; k.fillText(top, 256, 62);
  k.fillStyle = '#f4ead6'; let zb = 44; k.font = `${zb}px Georgia`; while (k.measureText(title).width > 470 && zb > 24) { zb -= 2; k.font = `${zb}px Georgia`; } k.fillText(title, 256, 118);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.position.set(x, heightAt(x, z) + 16, z); sp.visible = false; labelScene.add(sp); ZONES.push(sp);
}
