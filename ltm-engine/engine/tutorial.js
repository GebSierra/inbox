let tutI = -1, tutLocus = null, VTEXT = {};
fetch('./verses.json').then(r => r.ok ? r.json() : {}).then(j => { VTEXT = j || {}; if (tutI >= 0) tutShow(tutI); }).catch(() => {});
const vq = ref => VTEXT[ref] ? `<p class="vt">“${VTEXT[ref]}” <small>(${BOOK} ${ref}, ESV)</small></p>` : '';
const tutEl = document.getElementById('tut');
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const tutSquare = new THREE.Group(); tutSquare.visible = false; labelScene.add(tutSquare);
const stallSquare = new THREE.Group(); stallSquare.visible = false; labelScene.add(stallSquare);
let tutCam = null, tutStation = 0, tutCycle = false;
function squareFor(grp, st, lift) { if (grp.children.length) return; const L = st.loci; grp.userData.discs = [];
  const lm = new THREE.LineDashedMaterial({ color: '#b8583a', dashSize: .3, gapSize: .2, depthTest: false }); const Y = i => (L[i].fy ?? L[i].gy ?? groundY(L[i].x, L[i].z)) + lift;
  const sq = new THREE.Line(new THREE.BufferGeometry().setFromPoints([0, 1, 2, 3, 0].map(i => new THREE.Vector3(L[i].x, Y(i), L[i].z))), lm); sq.computeLineDistances(); grp.add(sq);
  L.forEach((l, i) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#f0c46a'; x.strokeStyle = '#3b2a1c'; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#3b2a1c'; x.font = 'bold 70px Georgia'; x.textAlign = 'center'; x.fillText(i + 1, 64, 88); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); d.position.set(l.x, Y(i) + .3, l.z); d.scale.setScalar(.55); grp.add(d); grp.userData.discs.push(d); }); }
// which way a room's viewer stands from its centre (unit vector)
function viewDir(st) { const dx = st.x - st.look[0], dz = st.z - st.look[2], l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; }
// THEME.tutRoomRelative: the square, its label and the camera are placed relative to room 1 and its viewing direction (James);
// otherwise they are placed relative to the city gate at GZ (Colossae).
function buildTutSquare() { if (tutSquare.children.length || !STATIONS[0]) return; const RR = THEME.tutRoomRelative, st = STATIONS[0], L = st.loci, y = (RR ? groundY(st.x, st.z) : groundY(0, GZ)) + .12, [vx, vz] = RR ? viewDir(st) : [0, 0];
  const lm = new THREE.LineDashedMaterial({ color: '#b8583a', dashSize: .4, gapSize: .25, depthTest: false }), am = new THREE.LineBasicMaterial({ color: '#3b2a1c', depthTest: false });
  const sq = new THREE.Line(new THREE.BufferGeometry().setFromPoints([0, 1, 2, 3, 0].map(i => new THREE.Vector3(L[i].x, y, L[i].z))), lm); sq.computeLineDistances(); tutSquare.add(sq);
  tutSquare.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([0, 1, 2, 3, 4].map(i => RR ? new THREE.Vector3(st.x + (L[i].x - st.x) * .9, y + .02, st.z + (L[i].z - st.z) * .9) : new THREE.Vector3(L[i].x * .9, y + .02, L[i].z + (L[i].z - GZ) * -.1))), am));
  L.forEach((l, i) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#f0c46a'; x.strokeStyle = '#3b2a1c'; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#3b2a1c'; x.font = 'bold 70px Georgia'; x.textAlign = 'center'; x.fillText(i + 1, 64, 88); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    tutSquare.userData.discs ??= []; const d = new THREE.Mesh(new THREE.CircleGeometry(THEME.tutDisc, 24), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false })); d.rotation.x = -Math.PI / 2; d.position.set(l.x, y + .05, l.z); tutSquare.add(d); tutSquare.userData.discs.push(d); });
  const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = 'rgba(244,234,214,.92)'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#3b2a1c'; x.font = '44px Georgia'; x.textAlign = 'center'; x.fillText('you stand here', 256, 62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const lab = new THREE.Mesh(RR ? new THREE.PlaneGeometry(3.2, .6) : new THREE.PlaneGeometry(4, .75), new THREE.MeshBasicMaterial({ map: t, depthTest: false }));
  if (RR) { lab.rotation.order = 'YXZ'; lab.rotation.y = Math.atan2(vx, vz); lab.rotation.x = -Math.PI / 2; lab.position.set(st.x + vx * 4.2, y + .05, st.z + vz * 4.2); }
  else { lab.rotation.x = -Math.PI / 2; lab.position.set(0, y + .05, GZ + 5); }
  tutSquare.add(lab); }
function tutCamTarget(kind) {
  if (THEME.tutRoomRelative) { const st = STATIONS[kind === 'gate' ? 0 : 1], gy = groundY(st.x, st.z), [vx, vz] = viewDir(st);
    if (kind === 'gate') return { p: new THREE.Vector3(st.x + vx * 9, gy + 14, st.z + vz * 9), l: new THREE.Vector3(st.x + vx * 1.5, gy, st.z + vz * 1.5) };
    return { p: new THREE.Vector3(st.x + vx * 7, gy + 6.5, st.z + vz * 7 + 2), l: new THREE.Vector3(st.x, gy + 1, st.z) }; }
  const gy = groundY(0, GZ);
  if (kind === 'gate') return { p: new THREE.Vector3(0, gy + 17, GZ + 13), l: new THREE.Vector3(0, gy, GZ + 4.5) };
  const st = STATIONS[1], gy2 = groundY(st.x, st.z), dx = Math.sign(-st.x || 1); return { p: new THREE.Vector3(st.x + dx * 6.5, gy2 + 6.5, st.z + 3), l: new THREE.Vector3(st.x, gy2 + 1, st.z) }; }
function tutShow(i) {
  tutI = i; const st = TUT[i]; tutEl.hidden = false; document.body.classList.add('tutorial');
  const p2 = TUT.findIndex(x => x.part === 2); document.getElementById('tutStep').textContent = st.part === 2 ? `More tips · ${i - p2 + 1} of ${TUT.length - p2}` : `Quick tour · ${i + 1} of ${p2}`;
  document.getElementById('tutTitle').textContent = st.t; document.getElementById('tutBody').innerHTML = (typeof st.locus === 'number' ? vq(`1:${st.locus + 1}`) : '') + st.b;
  document.getElementById('tutNext').textContent = st.next || 'Next';
  document.getElementById('tutBack').hidden = i === 0;
  if (st.go !== undefined || st.locus !== undefined) { if (idx !== 0) { idx = -1; go(1); } }
  tutLocus = st.locus ?? null; tutCam = st.cam || (st.locus !== undefined ? 'gate' : null); window.__tutT0 = undefined; tutCycle = st.cam === 'gate' || st.cam === 'stall'; tutStation = st.cam === 'stall' ? 1 : 0;
  const top = tutCam === 'gate'; window.__tutTop = false; if (top) buildTutSquare(); tutSquare.visible = top; if (tutCam === 'stall') squareFor(stallSquare, STATIONS[1], .15); stallSquare.visible = tutCam === 'stall';
  tutSquare.children.forEach(c => { if (c.isMesh && c.geometry.type === 'CircleGeometry') { const li = tutSquare.userData.discs.indexOf(c); c.scale.setScalar(typeof st.locus === 'number' && li === st.locus ? 1.5 : 1); } });
  document.getElementById('tutChoice').hidden = !st.choice; document.getElementById('tutNext').hidden = !!st.choice;
}
window.__tutGo = n => tutShow(n); window.__tc = () => [window.__fc, tutCam, camera.position.toArray().map(v => +v.toFixed(1)), window.__tutT0];
function tutEnd() { window.__tutTop = false; tutCam = null; window.__tcp = undefined; window.__tutLook = undefined; tutCycle = false; tutSquare.visible = false; stallSquare.visible = false; tutEl.hidden = true; document.body.classList.remove('tutorial'); tutLocus = null; tutI = -1; store.set(STORE + '-tut-done', '1'); }
document.getElementById('tutNext').onclick = () => tutI < TUT.length - 1 ? tutShow(tutI + 1) : tutEnd();
document.getElementById('tutBack').onclick = () => tutShow(Math.max(0, tutI - 1));
document.getElementById('tutSkip').onclick = tutEnd;
document.getElementById('tutGo').onclick = () => { tutEnd(); idx = -1; go(1); };
document.getElementById('tutMore').onclick = () => tutShow(tutI + 1);
document.getElementById('howbtn').onclick = () => tutShow(0);
if (!store.get(STORE + '-tut-done') && !new URLSearchParams(location.search).has('notut')) tutShow(0);

