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
