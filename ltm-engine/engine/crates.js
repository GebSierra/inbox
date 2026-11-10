// height of the stall's own surface (crate, counter) under a local x,z
function surfaceY(g, x, z, fallback) { const rc = new THREE.Raycaster(), from = g.localToWorld(new THREE.Vector3(x, 1.9, z));
  rc.set(from, new THREE.Vector3(0, -1, 0)); rc.far = 1.9; const meshes = []; g.children[0].traverse(o => { if (o.isMesh && o.visible && !(o.material.name || '').includes('Cloth')) meshes.push(o); });
  const h = rc.intersectObjects(meshes, false)[0]; return h ? g.worldToLocal(h.point.clone()).y + .02 : fallback; }
// find the stall's crates from where its own fruit sits: 3 on the ground row, 4 on the counter
const CRATES = (() => { if (!MODELS.gstall) return null; let fm; MODELS.gstall.updateMatrixWorld(true); MODELS.gstall.traverse(o => { if (o.isMesh && (o.material.name || '').includes('FruitVeg')) fm = o; }); if (!fm) return null;
  const p = fm.geometry.attributes.position, v = new THREE.Vector3(), pts = []; for (let i = 0; i < p.count; i += 3) { v.fromBufferAttribute(p, i).applyMatrix4(fm.matrixWorld); pts.push(v.clone()); }
  const ys = pts.map(q => q.y).sort((a, b) => a - b), mid = (ys[0] + ys[ys.length - 1]) / 2;
  const rows = [[pts.filter(q => q.y < mid), 3], [pts.filter(q => q.y >= mid), 4]].map(([row, k]) => { row.sort((a, b) => a.x - b.x);
    const gaps = []; for (let i = 1; i < row.length; i++) gaps.push([row[i].x - row[i - 1].x, i]); const cuts = gaps.sort((a, b) => b[0] - a[0]).slice(0, k - 1).map(g => g[1]).sort((a, b) => a - b);
    const groups = []; let st = 0; for (const c of [...cuts, row.length]) { groups.push(row.slice(st, c)); st = c; }
    return groups.map(gp => { const c = new THREE.Vector3(); gp.forEach(q => c.add(q)); c.divideScalar(gp.length); let minY = 1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; gp.forEach(q => { minY = Math.min(minY, q.y); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); });
      return { x: c.x, y: minY, z: c.z, w: x1 - x0, d: z1 - z0 }; }); });
  return { low: rows[0], high: rows[1] }; })();
window.__crates = CRATES;
// fill one crate with goods, inside its walls; k = model scale
function fillCrate(g, c, kind, k = 1.35) { const x = c.x * k, y = c.y * k + (c.y > .5 ? .08 : 0), z = c.z * k, w = Math.min(.55, c.w * k) * .8, d = Math.min(.45, c.d * k) * .8; let top = y;
  const fruit = (col, r, n) => { for (let i = 0; i < n; i++) { const yy = y + r + (i % 3) * r * .9; add(new THREE.IcosahedronGeometry(r * R(.85, 1.1), 1), mat('fr' + col, col, { flatShading: false, roughness: .5 }), x + R(-w, w) / 2, yy, z + R(-d, d) / 2, g); top = Math.max(top, yy + r); } };
  if (kind.fruit) fruit(kind.fruit, kind.r || .07, kind.n || 22);
  else if (kind === 'scrolls') for (let i = 0; i < 7; i++) { const sc = add(new THREE.CylinderGeometry(.045, .045, w * .95, 8), mat('papyrus', '#e8d6a8'), x, y + .05 + (i % 3) * .07, z - d / 2 + (i % 4) * d / 3, g); sc.rotation.z = Math.PI / 2; sc.rotation.y = R(-.15, .15); top = y + .25; }
  else if (kind === 'tablets') { for (let i = 0; i < 5; i++) { box(w * .8, .035, d * .7, i % 2 ? 'woodLt' : 'wood', x + R(-.02, .02), y + i * .04, z, g).rotation.y = R(-.2, .2); } box(w * .7, .01, d * .55, mat('wax', '#3a2c22'), x, y + .2, z, g); top = y + .22; }
  else if (kind === 'ink') { for (let i = 0; i < 4; i++) { const ix = x + (i % 2 - .5) * w * .5, iz = z + ((i >> 1) - .5) * d * .5; cyl(.05, .06, .1, 8, mat('inkJar', '#2a2a3a', { roughness: .35 }), ix, y, iz, g); const q = box(.012, .25, .012, 'wool', ix, y + .08, iz, g); q.rotation.z = .35; } top = y + .3; }
  else if (kind === 'letters') { for (let i = 0; i < 6; i++) { const l = box(w * .55, .02, d * .45, mat('papyrus', '#e8d6a8'), x + R(-.04, .04), y + .02 + i * .025, z + R(-.04, .04), g); l.rotation.y = R(-.4, .4); } cyl(.03, .03, .012, 8, mat('seal', '#b8331f'), x, y + .18, z, g); top = y + .2; }
  else if (kind === 'jugs') { for (let i = 0; i < 4; i++) { const jg = new THREE.Group(); jg.position.set(x + (i % 2 - .5) * w * .55, y, z + ((i >> 1) - .5) * d * .55); g.add(jg); amph(jg, 0, 0, .2); } top = y + .3; }
  else if (kind === 'bowls') { for (let s2 = 0; s2 < 2; s2++) for (let i = 0; i < 4; i++) add(new THREE.LatheGeometry([[0, 0], [.07, 0], [.11, .04], [.12, .055]].map(([a, b]) => new THREE.Vector2(a, b)), 12), mat('bowlC', '#a8623a', { side: THREE.DoubleSide, flatShading: false, roughness: .6 }), x + (s2 - .5) * w * .5, y + i * .035, z, g); top = y + .18; }
  else if (kind === 'lamps') { for (let i = 0; i < 4; i++) { const lx = x + (i % 2 - .5) * w * .5, lz = z + ((i >> 1) - .5) * d * .5; const l = add(new THREE.SphereGeometry(.06, 8, 5), 'clay', lx, y + .03, lz, g); l.scale.set(1.5, .5, 1); box(.05, .025, .04, 'clay', lx + .09, y + .03, lz, g); } top = y + .1; }
  else if (kind === 'cups') { for (let i = 0; i < 6; i++) cyl(.045, .035, .09, 9, 'clay', x + ((i % 3) - 1) * w * .32, y, z + ((i / 3 | 0) - .5) * d * .45, g); top = y + .12; }
  else if (kind === 'honey') { for (let i = 0; i < 3; i++) { const jg = new THREE.Group(); jg.position.set(x + (i - 1) * w * .35, y, z); g.add(jg); P.honey(jg, 0, 0, 0); jg.scale.setScalar(.5); } top = y + .35; }
  return top; }
function gstallFrame(sx, sz, face, tint) {
  const g = new THREE.Group(); g.position.set(sx, heightAt(sx, sz), sz); g.rotation.y = face; scene.add(g);
  const c = MODELS.gstall.clone(true); c.scale.setScalar(1.35);
  c.traverse(o => { if (!o.isMesh) return; o.userData.dyn = 1; const n = o.material.name || '';
    if (n.includes('FruitVeg')) o.visible = false;
    else if (n.includes('Wood')) { const k = 'gw' + n; if (!KMAT[k]) { KMAT[k] = o.material.clone(); const t = TEX.wood.clone(); t.repeat.set(3, 3); t.needsUpdate = true; KMAT[k].map = t; KMAT[k].aoMap = null; KMAT[k].color = new THREE.Color(n.includes('Dark') ? '#8a5c3a' : '#b88a5c'); KMAT[k].needsUpdate = true; } o.material = KMAT[k]; }
    else if (n.includes('Cloth') && tint !== '#ffffff') { o.material = o.material.clone(); o.material.map = null; o.material.color = new THREE.Color(tint); o.material.roughness = .95; o.material.needsUpdate = true; } });
  g.add(c); const pl = new THREE.PointLight('#ffd9a8', 3, 5, 1.6); pl.position.set(0, 1.6, 2.2); g.add(pl); box(3.4, 1.2, 2.9, 'dark', 0, 0, -.1, g).visible = false; return g; }
