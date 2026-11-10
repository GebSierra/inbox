// ---------- chapter zone labels, shown in bird's-eye view ----------
const ZONES = [];
function zoneLabel(ch, title, x, z) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160; const k = c.getContext('2d');
  k.fillStyle = 'rgba(59,42,28,.88)'; k.beginPath(); k.roundRect(8, 8, 496, 144, 24); k.fill();
  k.fillStyle = '#f0c46a'; k.font = 'bold 34px Georgia'; k.textAlign = 'center'; k.fillText(`CHAPTER ${ch}`, 256, 62);
  k.fillStyle = '#f4ead6'; k.font = '44px Georgia'; k.fillText(title, 256, 118);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.position.set(x, heightAt(x, z) + 16, z); sp.visible = false; labelScene.add(sp); ZONES.push(sp);
}
