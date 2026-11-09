// town-ne.js: Near-Eastern town pieces for James (flat-roofed houses, palms, harbour ships).
// townNE(K) -> { neHouse(x,z,w,d,floors=1,rot=0), palm(x,z,s=1), ship(x,y,z,rot=0), lighthouse(x,z) }
// K = engine helpers (THREE, scene, heightAt, add, box, cyl, mat, R). Materials are shared by key so the
// engine can merge draw calls. Warm limestone / mud-brick palette, flat roofs, no red tiles.
export function townNE(K) {
  const THREE = K.THREE;
  const rr = (a, b) => K.R(a, b);
  const pick = (n) => Math.min(n - 1, Math.floor(rr(0, n)));

  // ---- shared materials (cached by key) ----
  const WALLS = ['#eadbb8', '#dfb878', '#d2b48a', '#c98f52', '#c9977f'];
  const wallM = WALLS.map((c, i) => K.mat('neWall' + i, c));
  const mBase = K.mat('neBase', '#a8936f');
  const mBeam = K.mat('neBeam', '#6e4a2a');
  const mDoor = K.mat('neDoor', '#4e3420');
  const mWin = K.mat('neWin', '#2a2018');
  const mCloth = K.mat('neCloth', '#efe2c4', { side: THREE.DoubleSide });
  const mCloth2 = K.mat('neCloth2', '#b4533a', { side: THREE.DoubleSide });
  const mJar = K.mat('neJar', '#b9743f');
  const mMat = K.mat('neMat', '#a98f4e');
  const mLeafA = K.mat('nePalmA', '#5f8a3a', { side: THREE.DoubleSide });
  const mLeafB = K.mat('nePalmB', '#7da043', { side: THREE.DoubleSide });
  const mTrunk = K.mat('nePalmTrunk', '#8a6a46');
  const mDate = K.mat('neDate', '#a5521f');
  const mHull = K.mat('neHull', '#7a512c', { side: THREE.DoubleSide });
  const mDeck = K.mat('neDeck', '#b08a55', { side: THREE.DoubleSide });
  const mSail = K.mat('neSail', '#f0e4c6', { side: THREE.DoubleSide });
  const mStripe = K.mat('neStripe', '#c9a26a', { side: THREE.DoubleSide });
  const mRope = K.mat('neRope', '#4a3320');
  const mTower = K.mat('neTower', '#d9c7a0');
  const mFire = K.mat('neFire', '#ff8a1e', { emissive: '#ff6a10', emissiveIntensity: 1.6 });

  // ---- geometries built once ----
  let frondGeo = null;
  function getFrond() {
    if (frondGeo) return frondGeo;
    // drooping frond along +x: 4 segments, V-folded (3 verts across)
    const N = 4, L = 3.2, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, x = t * L, y = Math.sin(t * 1.9) * 0.9 - t * t * 1.5;
      const hw = 0.55 * Math.sin(Math.PI * (0.12 + 0.88 * t)) + 0.03;
      pos.push(x, y, -hw, x, y + 0.14, 0, x, y, hw);
    }
    for (let i = 0; i < N; i++) {
      const a = i * 3, b = a + 3;
      idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, b + 2, a + 1, b + 2, a + 2);
    }
    frondGeo = new THREE.BufferGeometry();
    frondGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    frondGeo.setIndex(idx); frondGeo.computeVertexNormals();
    return frondGeo;
  }

  // segment cylinder between two points (open ended, low poly)
  const _up = new THREE.Vector3(0, 1, 0);
  function seg(p, q, r0, r1, m, parent, sides = 5) {
    const d = new THREE.Vector3().subVectors(q, p), len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides, 1, true);
    const mesh = K.add(g, m, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, parent);
    mesh.quaternion.setFromUnitVectors(_up, d.normalize());
    return mesh;
  }

  // ================= neHouse =================
  function neHouse(x, z, w, d, floors = 1, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, K.heightAt(x, z), z); g.rotation.y = rot; K.scene.add(g);
    const H = 3.2 * floors, mW = wallM[pick(5)];
    K.box(w + 0.3, 3, d + 0.3, mBase, 0, -3, 0, g);          // plinth into the slope
    K.box(w, H, d, mW, 0, 0, 0, g);                          // body
    // parapet
    K.box(w + 0.1, 0.45, 0.22, mW, 0, H, d / 2 - 0.11, g);
    K.box(w + 0.1, 0.45, 0.22, mW, 0, H, -d / 2 + 0.11, g);
    K.box(0.22, 0.45, d - 0.4, mW, w / 2 - 0.11, H, 0, g);
    K.box(0.22, 0.45, d - 0.4, mW, -w / 2 + 0.11, H, 0, g);
    // protruding roof beam ends on the front
    const nb = Math.max(2, Math.floor(w / 1.4));
    for (let i = 0; i < nb; i++) K.box(0.2, 0.2, 0.55, mBeam, -w / 2 + (i + 0.5) * w / nb, H - 0.55, d / 2 + 0.15, g);
    // door + lintel
    const dx = w > 5 ? rr(-1, 1) * w * 0.22 : 0;
    K.box(1.1, 2.1, 0.14, mDoor, dx, 0, d / 2 + 0.04, g);
    K.box(1.6, 0.22, 0.34, mBeam, dx, 2.1, d / 2 + 0.1, g);
    // windows
    const win = (wx, wy, side) => {
      if (side === 0) K.box(0.7, 0.9, 0.12, mWin, wx, wy, d / 2 + 0.02, g);
      else if (side === 1) K.box(0.12, 0.9, 0.7, mWin, -w / 2 - 0.02, wy, wx, g);
      else K.box(0.7, 0.9, 0.12, mWin, wx, wy, -d / 2 - 0.02, g);
    };
    for (let f = 0; f < floors; f++) {
      const wy = f * 3.2 + 1.2;
      if (f === 0) {
        if (Math.abs(dx) < 0.3 && w > 4.5) { win(-w * 0.3, wy, 0); win(w * 0.3, wy, 0); }
        else win(dx > 0 ? -w * 0.28 : w * 0.28, wy, 0);
      } else {
        win(-w * 0.25, wy, 0); win(w * 0.25, wy, 0);
        if (w >= 7) win(0, wy, 0);
      }
      win(rr(-0.2, 0.2) * d, wy, 1); win(rr(-0.2, 0.2) * w, wy, 2);
    }
    // outside stair up the +x side wall
    if (rr(0, 1) < 0.4 && d > 4.5) {
      const L = d - 1, sh = new THREE.Shape();
      sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, 0);
      const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: false });
      sg.rotateY(-Math.PI / 2); sg.computeBoundingBox();
      const bb = sg.boundingBox; sg.translate(w / 2 - bb.min.x, 0, -d / 2 + 0.3 - bb.min.z);
      // place geometry by its own offset: use add with centre at origin of group
      K.add(sg, mBase, 0, 0, 0, g); g.userData.stair = 1;
    }
    // roof extras
    let top = H;
    const roofW = w - 0.8, roofD = d - 0.8;
    if (floors <= 2 && rr(0, 1) < 0.35 && w > 5 && d > 5) {   // set-back upper block at the rear
      const bw = roofW * 0.55, bd = roofD * 0.5;
      K.box(bw, 2.6, bd, mW, rr(-1, 1) * (roofW - bw) / 2, H, -d / 2 + 0.4 + bd / 2, g);
      K.box(0.7, 1.7, 0.14, mDoor, 0, H, -d / 2 + 0.4 + bd + 0.04 - 0.0, g);
      top = H + 2.6;
    }
    const r = rr(0, 1);
    const fz = d / 2 - 0.4 - 1.1;
    if (r < 0.3 && roofD > 3.4) {                           // pergola with cloth
      const pw = Math.min(roofW, 3.4), pd = Math.min(roofD * 0.4, 2.4), px = rr(-1, 1) * (roofW - pw) / 2;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(0.14, 2.2, 0.14, mBeam, px + sx * pw / 2, H, fz + sz * pd / 2, g);
      K.box(pw + 0.3, 0.06, pd + 0.3, rr(0, 1) < 0.5 ? mCloth : mCloth2, px, H + 2.2, fz, g);
      if (rr(0, 1) < 0.5) K.box(pw + 0.32, 0.07, 0.35, mStripe, px, H + 2.21, fz, g);
    } else if (r < 0.6) {                                   // roof jars
      const n = 2 + pick(2);
      for (let i = 0; i < n; i++) K.cyl(0.22, 0.4, 0.8, 5, mJar, rr(-1, 1) * roofW * 0.4, H, fz + rr(-0.6, 0.6), g);
    } else if (r < 0.8) {                                   // palm-frond mat
      K.box(roofW * 0.5, 0.12, 2, mMat, rr(-1, 1) * roofW * 0.2, H, fz, g);
    }
    g.userData.top = top;
    return g;
  }

  // ================= palm =================
  function palm(x, z, s = 1) {
    const g = new THREE.Group();
    g.position.set(x, K.heightAt(x, z), z); g.rotation.y = rr(0, Math.PI * 2); K.scene.add(g);
    const hgt = rr(5, 7) * s, lean = rr(0.4, 1.2) * s, N = 5;
    let prev = new THREE.Vector3(0, -0.4, 0), top = prev;
    for (let i = 1; i <= N; i++) {
      const t = i / N, p = new THREE.Vector3(lean * t * t, -0.4 + (hgt + 0.4) * t, 0);
      seg(prev, p, 0.34 * s * (1 - (i - 1) / N * 0.5), 0.34 * s * (1 - i / N * 0.5), mTrunk, g);
      prev = p; top = p;
    }
    const nf = 8 + pick(3), fg = getFrond();
    for (let i = 0; i < nf; i++) {
      const m = K.add(fg, i % 2 ? mLeafA : mLeafB, top.x, top.y, top.z, g);
      m.rotation.y = i / nf * Math.PI * 2 + rr(-0.2, 0.2);
      m.rotation.z = rr(0.05, 0.3);
      m.scale.setScalar(s * rr(0.9, 1.15));
    }
    if (rr(0, 1) < 0.6) {                                    // date clusters
      for (let i = 0; i < 2; i++) K.box(0.3 * s, 0.5 * s, 0.3 * s, mDate, top.x + (i ? 0.35 : -0.35) * s, top.y - 0.7 * s, 0.1 * s, g);
    }
    return g;
  }

  // ================= ship =================
  function ship(x, y, z, rot = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.y = rot; K.scene.add(g);
    // hull lofted from stations along z (stern -6 .. bow +6)
    const pos = [], idx = [];
    // each station: [z, halfDeckWidth, deckY, bottomY]
    const S = [[-6, 0.8, 1.9, 0.7], [-4, 1.7, 1.2, 0], [-1.5, 2.1, 0.9, -0.5], [1.5, 2.1, 0.9, -0.5], [4, 1.6, 1.2, -0.1], [6, 0.6, 2.2, 0.9]];
    for (const [zz, hw, dy, by] of S) pos.push(-hw, dy, zz, -hw * 0.45, by, zz, hw * 0.45, by, zz, hw, dy, zz);
    for (let i = 0; i < S.length - 1; i++) {
      const a = i * 4, b = a + 4;
      for (let k = 0; k < 3; k++) idx.push(a + k, b + k, a + k + 1, a + k + 1, b + k, b + k + 1);
    }
    idx.push(0, 1, 2, 0, 2, 3); const e = (S.length - 1) * 4; idx.push(e, e + 2, e + 1, e, e + 3, e + 2);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
    K.add(hg, mHull, 0, 0, 0, g);
    // deck: planks surface slightly under rail line
    for (let i = 0; i < S.length - 1; i++) {
      const [z0, h0, d0] = S[i], [z1, h1, d1] = S[i + 1];
      const q = new THREE.BufferGeometry();
      q.setAttribute('position', new THREE.Float32BufferAttribute([-h0 + 0.1, d0 - 0.05, z0, h0 - 0.1, d0 - 0.05, z0, h1 - 0.1, d1 - 0.05, z1, -h1 + 0.1, d1 - 0.05, z1], 3));
      q.setIndex([0, 2, 1, 0, 3, 2]); q.computeVertexNormals(); K.add(q, mDeck, 0, 0, 0, g);
    }
    // curved stern post (rising, curling inboard) and bow stem
    K.add(new THREE.BoxGeometry(0.22, 0.22, 1.2), mHull, 0, 2.15, -6.25, g).rotation.x = 0.55;
    K.add(new THREE.BoxGeometry(0.22, 0.22, 1.1), mHull, 0, 2.95, -6.0, g).rotation.x = -0.35;
    K.add(new THREE.BoxGeometry(0.22, 0.22, 0.9), mHull, 0, 3.4, -5.55, g).rotation.x = -1.0;
    K.add(new THREE.BoxGeometry(0.22, 0.22, 1.5), mHull, 0, 2.2, 6.3, g).rotation.x = -0.75;
    // mast + yard + sail + stripe
    K.cyl(0.14, 0.2, 8, 5, mHull, 0, 0.8, 0.8, g);
    K.add(new THREE.CylinderGeometry(0.08, 0.08, 6.4, 4), mHull, 0, 7.4, 0.8, g).rotation.z = Math.PI / 2;
    K.box(6, 4.6, 0.06, mSail, 0, 2.75, 0.85, g);
    K.box(6.02, 0.8, 0.09, mStripe, 0, 4.4, 0.85, g);
    // small deckhouse aft + steering oars
    K.box(1.6, 1.0, 1.7, mDeck, 0, 1.2, -3.6, g);
    for (const sx of [-1, 1]) {
      const o = K.add(new THREE.BoxGeometry(0.12, 0.12, 4.2), mHull, sx * 1.6, 1.3, -6.9, g);
      o.rotation.set(-0.4, sx * 0.12, 0);
      K.add(new THREE.BoxGeometry(0.1, 0.25, 1.0), mHull, sx * 1.6 + sx * 0.25, 0.5, -8.85, g).rotation.x = -0.4;
    }
    K.box(0.5, 0.5, 0.5, mRope, 1.0, 1.1, 2.4, g); K.box(0.6, 0.4, 0.6, mJar, -1.0, 1.1, 3.0, g);
    g.traverse(o => { if (o.isMesh) o.userData.dyn = 1; });
    return g;
  }

  // ================= lighthouse =================
  function lighthouse(x, z) {
    const g = new THREE.Group();
    g.position.set(x, K.heightAt(x, z), z); K.scene.add(g);
    K.box(6.4, 3, 6.4, mBase, 0, -3, 0, g);
    K.box(5.6, 2.2, 5.6, mTower, 0, 0, 0, g);
    const shaft = K.cyl(1.9, 2.5, 7, 4, mTower, 0, 2.2, 0, g); shaft.rotation.y = Math.PI / 4;
    K.box(1.0, 0.8, 0.14, mWin, 0, 4, 1.9, g);                          // slit window
    K.box(4.2, 0.4, 4.2, mBase, 0, 9.2, 0, g);                          // gallery
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(0.25, 1.5, 0.25, mBeam, sx * 1.7, 9.6, sz * 1.7, g);
    K.box(4.4, 0.3, 4.4, mBase, 0, 11.1, 0, g);                          // lantern roof slab
    K.box(1.1, 0.5, 1.1, mBeam, 0, 11.4, 0, g);                          // fire bowl
    const fire = K.cyl(0, 0.7, 1.4, 6, mFire, 0, 11.9, 0, g);
    fire.userData.dyn = 1;
    return g;
  }

  return { neHouse, palm, ship, lighthouse };
}
