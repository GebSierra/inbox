import { jamesProps } from 'ltm-town/world/props-james.js';
// ---------- ZONE 1: the agora (James 1, six rooms) ----------
// Enter through the gate (heading south, -z). Rooms run clockwise: up the left (west) side, then back down the right (east).
// 1 Gate Stoa is the court just inside the gate (seen through the arch). Then up the left: 2 Tower of the Winds, 3 Tholos; back down the right: 4 Lamp Stoa, 5 Mirror Court, 6 Almshouse Portico.
const AG = { x0: -19.5, x1: 19.5, z0: 33, z1: 75.5, rx: 11, z: [67, 55, 43] };
const JP = jamesProps({ THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES, flame: (...a) => flame(...a) });
{ // paving: one flagstone square, a little above the terrain everywhere
  drape(AG.x0, AG.z0, AG.x1, AG.z1, 'path', .06);
  // a kerb of darker stone round the square
  for (const [x0, z0, x1, z1] of [[AG.x0, AG.z0, AG.x1, AG.z0 + .3], [AG.x0, AG.z1 - .3, -3.2, AG.z1], [3.2, AG.z1 - .3, AG.x1, AG.z1]]) drape(x0, z0, x1, z1, 'stoneDk', .08);
}
// a colonnade (stoa): columns along one side, back wall, flat entablature and a tiled lean-to roof
function stoa(xa, za, xb, zb, { depth = 4, h = 4.6, cols = 6, face = 1, wall = 'wall', col = 'marble', gap = null } = {}) {
  const L = Math.hypot(xb - xa, zb - za), ang = Math.atan2(zb - za, xb - xa), g = new THREE.Group();
  const cx = (xa + xb) / 2, cz = (za + zb) / 2; g.position.set(cx, heightAt(cx, cz), cz); g.rotation.y = -ang; scene.add(g);
  // local x runs along the stoa, local z points out towards the square (face = side of the square)
  const out = face, y = .05;
  box(L, .35, depth, 'marble', 0, y, out * 0, g).position.z = 0;
  box(L, h + .6, .5, wall, 0, y, -out * depth / 2, g);
  for (let i = 0; i < cols; i++) { const lx = -L / 2 + .6 + i * (L - 1.2) / (cols - 1); if (gap && lx > gap[0] && lx < gap[1]) continue;
    cyl(.34, .34, .3, 10, col, lx, y + .35, out * (depth / 2 - .4), g); cyl(.26, .3, h - .6, 12, col, lx, y + .65, out * (depth / 2 - .4), g); box(.7, .25, .7, col, lx, y + h + .05, out * (depth / 2 - .4), g); }
  box(L, .55, .9, 'marble', 0, y + h + .3, out * (depth / 2 - .4), g);
  box(L + .4, .3, depth + .9, mat('neRoof', '#d2b48a'), 0, y + h + .85, 0, g); box(L + .4, .45, .25, mat('neRoof', '#d2b48a'), 0, y + h + 1.15, out * (depth / 2 + .3), g);
  box(L, .3, depth, 'wallTrim', 0, y + h + .55, 0, g);
  return g; }
{ // west stoa behind the Gate Stoa room
  stoa(-17, 61, -17, 75, { face: -1, cols: 6 });
  // east colonnade behind the Lamp Stoa room: long, white, many columns
  stoa(17, 34.5, 17, 47, { face: 1, cols: 6, wall: 'travertine' });
  // south stoa closing the square, with a passage in the middle to the temple road
  stoa(-19, 34.2, -3.4, 34.2, { face: 1, cols: 5 }); stoa(3.4, 34.2, 19, 34.2, { face: 1, cols: 5 });
}
{ // 2 · Tower of the Winds: an octagonal marble tower with a sundial face and wind reliefs
  const tx = -18.2, tz = 55, y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
  cyl(3.1, 3.2, .5, 8, 'marble', 0, 0, 0, g); const body = cyl(2.6, 2.6, 7.6, 8, mat('towerM', '#efe2c8'), 0, .5, 0, g); body.rotation.y = Math.PI / 8;
  const fr = cyl(2.72, 2.72, .9, 8, 'marble', 0, 7.1, 0, g); fr.rotation.y = Math.PI / 8;
  const rf = add(new THREE.ConeGeometry(2.9, 1.5, 8), 'stoneDk', 0, 8.75, 0, g); rf.rotation.y = Math.PI / 8; cyl(.12, .2, .5, 6, 'marble', 0, 9.4, 0, g);
  // sundial on the face towards the square
  { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#e8dcc4'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#6a5a48'; x.lineWidth = 3;
    for (let k = 0; k <= 8; k++) { const a = Math.PI * (k / 8); x.beginPath(); x.moveTo(64, 30); x.lineTo(64 - Math.cos(a) * 60, 30 + Math.sin(a) * 60); x.stroke(); } x.beginPath(); x.arc(64, 30, 58, 0, Math.PI); x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const d = add(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 2.45, 5.7, 0, g); d.rotation.y = Math.PI / 2; d.rotation.z = 0; }
  // wind gods in the frieze: little winged figures on every face
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, fx = Math.cos(a) * 2.75, fz = Math.sin(a) * 2.75; const w = box(.9, .5, .12, 'marble', fx, 7.3, fz, g); w.rotation.y = -a + Math.PI / 2; const bdy = box(.25, .55, .14, 'stoneDk', fx * 1.01, 7.2, fz * 1.01, g); bdy.rotation.y = -a + Math.PI / 2; }
  // doorway on the square side
  box(.12, 2.4, 1.3, 'dark', 2.42, .5, 1.1, g); }
{ // 3 · The Tholos: a round building with a ring of columns, a cone of tiles and a dark doorway
  const tx = -19.5, tz = 42, y = heightAt(tx, tz), g = new THREE.Group(); g.position.set(tx, y, tz); scene.add(g);
  cyl(5.3, 5.5, .6, 24, 'marble', 0, 0, 0, g); cyl(5.0, 5.0, .25, 24, 'marble', 0, .6, 0, g); cyl(3.4, 3.4, 4.2, 20, 'wall', 0, .85, 0, g);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; cyl(.24, .28, 4.1, 10, 'marble', Math.cos(a) * 4.5, .85, Math.sin(a) * 4.5, g); }
  cyl(4.85, 4.85, .55, 24, 'marble', 0, 4.95, 0, g); add(new THREE.SphereGeometry(4.7, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat('neDome', '#e2cba2'), 0, 5.5, 0, g); cyl(.35, .45, .8, 8, 'marble', 0, 10.1, 0, g);
  box(.15, 2.6, 1.5, 'dark', 3.38, .85, 0, g); }
{ // 5 · The Mirror Court: a half-round bench (exedra) with low walls
  const ex = 17.5, ez = 52, y = heightAt(ex, ez), g = new THREE.Group(); g.position.set(ex, y, ez); scene.add(g);
  for (let k = 0; k <= 12; k++) { const a = Math.PI / 2 + k / 12 * Math.PI; const bx = Math.cos(a) * -3.4, bz = Math.sin(a) * 3.4;
    const w = box(.95, 2.4, .5, 'wall', bx, 0, bz, g); w.rotation.y = -a; const s = box(.95, .5, .6, 'marble', bx * .85, 0, bz * .85, g); s.rotation.y = -a; }
  box(.4, 2.6, .4, 'marble', 0, 0, -3.6, g); box(.4, 2.6, .4, 'marble', 0, 0, 3.6, g); }
{ // 6 · The Almshouse Portico: four columns under a pediment, a door into the almshouse
  const px = 18, pz = 61.5, y = heightAt(px, pz), g = new THREE.Group(); g.position.set(px, y, pz); scene.add(g);
  box(6, 5.6, 9, 'wall', 1.6, 0, 0, g); box(6.4, .5, 9.4, mat('neRoof', '#d2b48a'), 1.6, 5.6, 0, g); box(2.6, .3, 9, 'marble', -2.6, 0, 0, g);
  for (const zz of [-3.6, -1.2, 1.2, 3.6]) { cyl(.24, .28, 3.6, 10, 'marble', -3.4, .3, zz, g); }
  box(1.6, .45, 9.4, 'marble', -3.1, 3.9, 0, g); box(3.4, .3, 9.8, mat('neRoof', '#d2b48a'), -2.4, 4.3, 0, g);
  box(.15, 2.4, 1.4, 'dark', -1.4, .3, 0, g); }
{ // 1 · The Gate Stoa: a columned porch across the court just inside the gate; you walk through it into the square
  const z = 64.5, y = heightAt(0, z);
  box(27, .25, 2.4, 'marble', 0, y, z);
  for (const x of [-12, -9, -6, -3, 3, 6, 9, 12]) { cyl(.32, .32, .3, 10, 'marble', x, y + .25, z); cyl(.24, .28, 4.2, 12, 'marble', x, y + .55, z); box(.6, .22, .6, 'marble', x, y + 4.75, z); }
  box(27, .5, .9, 'marble', 0, y + 4.95, z); box(27.4, .3, 2.6, mat('neRoof', '#d2b48a'), 0, y + 5.45, z);
}
{ // the sacred centre of the square: a small altar (clear of the walking lanes)
  const y = heightAt(0, 55); box(1.6, .5, 1.6, 'stone', 0, y, 55); box(1.2, .9, 1.2, 'marble', 0, y + .5, 55); box(1.4, .15, 1.4, 'marble', 0, y + 1.4, 55);
  for (const [x, z] of [[-1.6, 61], [1.6, 61], [-1.6, 49], [1.6, 49]]) { cyl(.2, .25, .5, 8, 'marble', x, heightAt(x, z), z); }
}
// the six rooms (each a square of five objects, viewed from the middle of the square)
const AGO = { dais: 'none', spread: [1.9, 1.45], big: 1.25 };
room(1, 1, 'The Gate Stoa', 0, 70, [0, 82], { ...AGO, props: [[JP.letter, 'sealed letter with a red wax seal'], [JP.mask, 'laughing bronze theatre mask on a post'], [JP.goldIngot, 'gold ingot on a black touchstone'], [JP.amphoraBlue, 'flawless blue amphora'], [JP.lionFountain, 'lion-head fountain']] });
room(1, 2, 'The Tower of the Winds', -AG.rx, AG.z[1], [-4, AG.z[1]], { ...AGO, props: [[JP.seaBarrel, 'barrel of churning seawater with a toy ship'], [JP.weathervane, 'bronze Triton weathervane'], [JP.herm, 'two-faced marble herm'], [JP.garlandStool, 'stool with a tiny gold garland'], [JP.poppyUrn, 'urn of wilting red poppies']] });
room(1, 3, 'The Tholos', -AG.rx, 41, [-4, 41], { ...AGO, props: [[JP.sundial, 'scorched sundial in dry grass'], [JP.crownCushion, 'victor’s crown on a red cushion'], [JP.shieldArrow, 'bronze shield and a snapped arrow'], [JP.fowlerTrap, 'fowler’s trap baited with figs'], [JP.snakePithos, 'pithos with a snake hatching']] });
room(1, 4, 'The Lamp Stoa', AG.rx, 41, [4, 41], { ...AGO, props: [[JP.conjurerTable, 'conjurer’s table with three cups'], [JP.lampstand, 'seven-flame lampstand'], [JP.barleyBasket, 'basket of first barley sheaves'], [JP.marbleEar, 'giant marble ear'], [JP.cauldron, 'boiling cauldron over coals']] });
room(1, 5, 'The Mirror Court', AG.rx, 51.5, [4, 51.5], { ...AGO, props: [[JP.washbasin, 'washbasin with a soiled tunic'], [JP.malletBlock, 'mallet and chisel on a stone block'], [JP.mirror, 'bronze hand mirror on a stand'], [JP.waxTablet, 'wax tablet wiped smooth'], [JP.shackleStele, 'stele with open shackles']] });
room(1, 6, 'The Almshouse Portico', AG.rx, 61.5, [4, 61.5], { ...AGO, props: [[JP.bridlePost, 'bridle and bit on a post'], [JP.breadBasket, 'basket of bread and a toy horse']] });

const TZ = 2, HX = 32, HZ = 2, BZ = 2, BX = RIVER_X(BZ);
