// ---------- a Galilean hillside above the lake ----------
// The crown of the Mount is at (0, 0). The walk starts there, where he sat down (Matthew 5:1), and comes down the mountain
// (Matthew 8:1): chapter 5 on the summit, chapter 6 on the farmed slopes, chapter 7 at the foot of the hill and the shore.
// The lake lies south (z < SHORE). A town stands on a hill on the shore to the south-east: "a city set on a hill" (5:14).
const SHORE = -95;
const HILL = 24;                                                     // height of the crown above the shore
const CITY = [118, -112];                                            // the town on its hill
function hRaw(x, z) {
  let h = Math.sin(x * 0.03) * 1.0 + Math.cos(z * 0.025) * .8 + Math.sin((x + z) * 0.05) * 0.4;
  const d = Math.hypot(x * .85, z);
  h += HILL * Math.exp(-(d * d) / (2 * 48 * 48));                     // the mount: a rounded crest, falling away on every side
  h += Math.max(0, z - 60) * 0.1;                                     // the hills of Galilee inland, to the north
  const dc = Math.hypot(x - CITY[0], z - CITY[1]); h += 14 * Math.exp(-(dc * dc) / (2 * 30 * 30));   // the city's hill
  const cut = SHORE + 20 + Math.max(0, 14 - dc * .25);
  if (z < cut) h = Math.min(h, h - (cut - z) * 0.1);
  if (z < SHORE && dc > 46) h = Math.min(h, (z - SHORE) * 0.2 - .3);  // the beach falls into the lake
  return h;
}
// small level pads under each room (the rest of the summit keeps its natural roll). Kept in step with books/matthew.json.
const FLAT = [[0, 9, 6, 6], [16, -2, 6, 6], [8, -17, 6, 6], [-15, -8, 6, 6]];   // [cx, cz, halfW, halfD]
const heightAt0 = (x, z) => hRaw(x, z);
const heightAt = (x, z) => { let h = heightAt0(x, z);
  for (const [cx, cz, hw, hd] of FLAT) { const dx = Math.max(0, Math.abs(x - cx) - hw), dz = Math.max(0, Math.abs(z - cz) - hd), d = Math.hypot(dx, dz);
    const fl = heightAt0(cx, cz); if (d === 0) { h = fl; continue; }
    if (d < 5) { const w = 1 - d / 5, s = w * w * (3 - 2 * w); h = h * (1 - s) + fl * s; } }
  return h; };
{
  const S = 520, N = 260;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [];
  const cGrass = new THREE.Color('#9fae5e'), cGrass2 = new THREE.Color('#8a9c50'), cPath = new THREE.Color('#d8bb88'), cBank = new THREE.Color('#ead7a8'), cFlower = new THREE.Color('#c9b04e');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 40; p.setZ(i, z);
    p.setY(i, heightAt(x, z));
    const c = cGrass.clone().lerp(cGrass2, (Math.sin(x * .13) * Math.cos(z * .11) + 1) / 2);
    const n2 = Math.sin(x * .041 + 2) * Math.sin(z * .047) + Math.sin(x * .09 - z * .07) * .5; if (n2 > .7) c.lerp(cFlower, .35); else if (n2 < -.6) c.lerp(new THREE.Color('#6f8c45'), .4);
    if (Math.abs(x + 18 - Math.sin(z * .05) * 4) < 2 && z < -14 && z > SHORE) c.lerp(cPath, .7);   // the path down towards the lake
    if (Math.abs(Math.hypot(x, z) - 10) < 1.6 && z < 4) c.lerp(cPath, .4);                                                               // the trodden way round the crown
    if (z < SHORE + 8) c.lerp(cBank, Math.min(1, (SHORE + 8 - z) / 6));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = R(150, 255) | 0; x.fillStyle = `rgba(${v},${v * .96 | 0},${v * .88 | 0},${R(.15, .5)})`; x.fillRect(R(0, 256), R(0, 256), R(1, 4), R(1, 3)); }
    for (let i = 0; i < 200; i++) { x.strokeStyle = `rgba(90,110,50,${R(.2, .5)})`; x.lineWidth = 1; const a = R(0, 256), b = R(0, 256); x.beginPath(); x.moveTo(a, b); x.lineTo(a + R(-3, 3), b - R(3, 8)); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(140, 140); t.anisotropy = 8; return t; })();
  const t = add(g.toNonIndexed(), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, map: gtex }));
  t.castShadow = false; t.geometry.computeVertexNormals();
}
// the Sea of Galilee, south of the hill
{
  const g = new THREE.PlaneGeometry(900, 520, 1, 1); g.rotateX(-Math.PI / 2);
  const wm = new THREE.MeshStandardMaterial({ color: '#4a86a0', roughness: .2, metalness: .1, transparent: true, opacity: .94 });
  wm.onBeforeCompile = sh => { sh.uniforms.uT = WATER_T; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vW;').replace('#include <dithering_fragment>',
    `#include <dithering_fragment>
     float r = sin(vW.z*.7 + uT*1.3 + sin(vW.x*.9)) * sin(vW.x*1.1 - uT*.9 + vW.z*.25);
     float shore = smoothstep(${(SHORE - 9).toFixed(1)}, ${(SHORE - 1).toFixed(1)}, vW.z);
     gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.55,.82,.8), shore * .55);
     gl_FragColor.rgb += vec3(.35,.22,.1) * smoothstep(.65, 1., r) * .35;`); };
  const w = new THREE.Mesh(g, wm); w.position.set(0, -.35, SHORE - 258); w.userData.dyn = 1; w.receiveShadow = true; scene.add(w);
}
// the far shore and the hills of Galilee: low, rounded and green, not sharp peaks
function hillDome(x, z, r, h, c) {
  c = new THREE.Color(c).lerp(SKY, Math.min(.45, Math.max(0, (Math.hypot(x, z) - 180) / 420)));
  const g = new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = R(.92, 1.08); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  const m = add(g, new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1 }), x, -4, z); m.scale.set(r, h, r * R(.7, 1)); m.castShadow = false;
}
for (let i = 0; i < 12; i++) hillDome(-330 + i * 60, -400 + R(-30, 30), R(70, 110), R(30, 55), i % 2 ? '#7d8f55' : '#8b8a5a');   // across the lake
for (let i = 0; i < 9; i++) hillDome(-260 + i * 65, 260 + R(-40, 40), R(80, 120), R(40, 70), i % 3 ? '#7f9452' : '#8f8d5c');      // inland Galilee
hillDome(-300, 40, 110, 50, '#869a58'); hillDome(310, 20, 110, 55, '#869a58');
