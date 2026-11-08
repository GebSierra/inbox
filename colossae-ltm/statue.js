// Procedural Greek marble statue (robed standing figure on a carved base).
// Standalone ES module: pass THREE in. three.js r170 API. No external files.

const BASE_H = 0.35;
const DESIGN_H = 2.3; // figure is modelled at this height, then scaled

export function statueTop(height = 2.3) {
  return BASE_H + height;
}

/* ---------- small helpers ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w
  ) * 2 - 1;
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------- marble textures ---------- */
const texCache = new WeakMap();
function makeTextures(THREE) {
  if (texCache.has(THREE)) return texCache.get(THREE);
  const S = 512;
  const R = rng(1234);
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    return c;
  };
  const col = mk(), bump = mk();
  const g = col.getContext('2d'), b = bump.getContext('2d');

  // draw something three times so it tiles horizontally and vertically
  const tiled = (fn) => {
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      g.save(); g.translate(ox, oy); fn(g); g.restore();
    }
  };
  const tiledB = (fn) => {
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      b.save(); b.translate(ox, oy); fn(b); b.restore();
    }
  };

  g.fillStyle = '#e8e2d6'; g.fillRect(0, 0, S, S);
  b.fillStyle = '#808080'; b.fillRect(0, 0, S, S);

  // soft cloudy grey + warm patches
  for (let i = 0; i < 26; i++) {
    const x = R() * S, y = R() * S, r = 40 + R() * 110;
    const warm = i % 3 !== 0;
    const colr = warm ? `rgba(214,186,146,${0.10 + R() * 0.12})` : `rgba(150,152,158,${0.06 + R() * 0.07})`;
    tiled((c) => {
      const gr = c.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, colr); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2);
    });
  }

  // fine grain
  const img = g.getImageData(0, 0, S, S);
  const bimg = b.getImageData(0, 0, S, S);
  for (let i = 0; i < S * S; i++) {
    const n = (R() - 0.5) * 14;
    img.data[i * 4] += n; img.data[i * 4 + 1] += n; img.data[i * 4 + 2] += n;
    const m = (R() - 0.5) * 16;
    bimg.data[i * 4] += m; bimg.data[i * 4 + 1] += m; bimg.data[i * 4 + 2] += m;
  }
  g.putImageData(img, 0, 0);
  b.putImageData(bimg, 0, 0);

  // wandering grey veins
  const vein = (x, y, ang, len, w, depth) => {
    const pts = [[x, y]];
    let a = ang;
    for (let i = 0; i < len; i++) {
      a += (R() - 0.5) * 0.55;
      x += Math.cos(a) * 6; y += Math.sin(a) * 6;
      pts.push([x, y]);
      if (depth < 2 && R() < 0.035) vein(x, y, a + (R() - 0.5) * 1.6, len * 0.4, w * 0.6, depth + 1);
    }
    tiled((c) => {
      c.strokeStyle = `rgba(112,114,122,${0.30 + R() * 0.25})`;
      c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    });
    tiledB((c) => {
      c.strokeStyle = 'rgba(60,60,60,0.5)'; c.lineWidth = w * 0.8; c.lineCap = 'round';
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    });
  };
  for (let i = 0; i < 5; i++) vein(R() * S, R() * S, R() * 6.28, 50 + R() * 50, 0.8 + R() * 1.2, 0);

  // dark rain streaks from top
  for (let i = 0; i < 70; i++) {
    const x = R() * S, len = 60 + R() * 380, w = 1 + R() * 4.5, al = 0.07 + R() * 0.16;
    tiled((c) => {
      const gr = c.createLinearGradient(0, 0, 0, len);
      gr.addColorStop(0, `rgba(70,64,52,${al})`);
      gr.addColorStop(0.7, `rgba(80,74,60,${al * 0.5})`);
      gr.addColorStop(1, 'rgba(80,74,60,0)');
      c.fillStyle = gr; c.fillRect(x, 0, w, len);
    });
  }
  // a faint dirty top band
  tiled((c) => {
    const gr = c.createLinearGradient(0, 0, 0, 90);
    gr.addColorStop(0, 'rgba(95,88,70,0.22)'); gr.addColorStop(1, 'rgba(95,88,70,0)');
    c.fillStyle = gr; c.fillRect(0, 0, S, 90);
  });

  const map = new THREE.CanvasTexture(col);
  const bmap = new THREE.CanvasTexture(bump);
  for (const t of [map, bmap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
  }
  map.colorSpace = THREE.SRGBColorSpace;
  const out = { map, bmap };
  texCache.set(THREE, out);
  return out;
}

/* ---------- robe profile ---------- */
// [y, r] key points at design height 2.3 (hem at y=-0.02 sunk into base)
const PROFILE = [
  [-0.03, 0.40], [0.0, 0.395], [0.06, 0.36], [0.25, 0.305], [0.55, 0.26], [0.9, 0.225],
  [1.15, 0.205], [1.32, 0.19], [1.5, 0.215], [1.68, 0.235], [1.80, 0.25], [1.88, 0.22],
  [1.94, 0.12], [1.985, 0.06], [2.03, 0.052], [2.06, 0.0],
];
const SX = 1.22, SZ = 0.82; // elliptical body cross-section

export function makeStatue(THREE, { pose = 'philosopher', height = 2.3 } = {}) {
  const { map, bmap } = makeTextures(THREE);
  const group = new THREE.Group();
  group.name = 'statue_' + pose;
  const fig = new THREE.Group();
  const s = height / DESIGN_H;
  fig.scale.setScalar(s);
  fig.position.y = BASE_H;

  const robeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, map, bumpMap: bmap, bumpScale: 0.7, roughness: 0.6, metalness: 0,
    flatShading: false, vertexColors: true,
  });
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, map, bumpMap: bmap, bumpScale: 0.6, roughness: 0.58, metalness: 0,
    flatShading: false,
  });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x4b4a30, roughness: 1, metalness: 0 });

  const addMesh = (geo, mat, parent = fig, shade = 1) => {
    if (mat.vertexColors && !geo.attributes.color) {
      const n = geo.attributes.position.count;
      const a = new Float32Array(n * 3).fill(shade);
      geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
    }
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  /* ---- robe body (lathe + folds) ---- */
  const curve = new THREE.CatmullRomCurve3(PROFILE.map(([y, r]) => new THREE.Vector3(r, y, 0)), false, 'centripetal');
  const pts = curve.getPoints(150).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
  const SEG = 96;
  const robeGeo = new THREE.LatheGeometry(pts, SEG);
  {
    const pos = robeGeo.attributes.position;
    const P = pts.length;
    const colors = new Float32Array(pos.count * 3);
    const phase = R0();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const th = Math.atan2(x, z);
      const h = clamp(1 - y / 1.35, 0, 1); // hemness
      const A = 0.014 + 0.115 * h * h + 0.004 * clamp((y - 1.4) / 0.4, 0, 1);
      const cx = Math.cos(th), sx = Math.sin(th);
      let f =
        0.62 * Math.sin(11 * th + 0.9 * y + 0.55 * Math.sin(2 * th + y) + phase) +
        0.32 * Math.sin(9 * th - 1.4 * y + 1.7) +
        0.22 * Math.sin(5 * th + 2.1 * y * 0.5);
      f += 0.55 * vnoise(cx * 3.2 + 7, sx * 3.2, y * 2.6) + 0.25 * vnoise(cx * 7, sx * 7, y * 6);
      f = f * 0.9; f = f + 0.35 * Math.sign(f) * Math.pow(Math.abs(f), 2.2) * 0.5;
      // ease out of the neck/top
      const fade = 1 - clamp((y - 1.9) / 0.1, 0, 1);
      const d = A * f * fade;
      // irregular flaring hem
      const hemFlare = 1 + 0.05 * h * h * h * Math.sin(5 * th + 1) + 0.03 * h * h * vnoise(cx * 2, sx * 2, 3);
      const nr = r > 1e-5 ? (r * hemFlare + d) : 0;
      pos.setXYZ(i, Math.sin(th) * nr * SX, y, Math.cos(th) * nr * SZ);

      const fn = clamp(f / 1.4, -1, 1);
      const inward = clamp(-fn, 0, 1);
      const bottom = clamp(1 - y / 1.4, 0, 1);
      const sh = 1 - 0.17 * inward * (0.55 + 0.45 * h + 0.2) - 0.10 * bottom - 0.04 * (fn > 0 ? 0 : 1) * h;
      const c = clamp(sh, 0.75, 1);
      colors[i * 3] = c; colors[i * 3 + 1] = c * 0.99; colors[i * 3 + 2] = c * 0.97;
    }
    robeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    robeGeo.computeVertexNormals();
    // weld the lathe seam normals
    const nrm = robeGeo.attributes.normal;
    for (let j = 0; j < P; j++) {
      const a = j, b = SEG * P + j;
      const nx = nrm.getX(a) + nrm.getX(b), ny = nrm.getY(a) + nrm.getY(b), nz = nrm.getZ(a) + nrm.getZ(b);
      const l = Math.hypot(nx, ny, nz) || 1;
      nrm.setXYZ(a, nx / l, ny / l, nz / l); nrm.setXYZ(b, nx / l, ny / l, nz / l);
    }
  }
  function R0() { return 0.6; }
  addMesh(robeGeo, robeMat);

  /* ---- profile radius lookup for the sash ---- */
  const robeR = (y) => {
    if (y <= pts[0].y) return pts[0].x;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].y >= y) {
        const t = (y - pts[i - 1].y) / (pts[i].y - pts[i - 1].y || 1);
        return pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t;
      }
    }
    return pts[pts.length - 1].x;
  };
  const surf = (ph, y, off) => {
    const r = robeR(y);
    const sx = Math.sin(ph), cz = Math.cos(ph);
    const nx = sx / SX, nz = cz / SZ, nl = Math.hypot(nx, nz);
    return [r * sx * SX + (nx / nl) * off, y, r * cz * SZ + (nz / nl) * off];
  };

  /* ---- himation sash: diagonal band over one shoulder, looping round the body ---- */
  {
    const N = 120, M = 9;
    const mid = 1.47, amp = 0.43, w = 0.2;
    const ph0 = -1.5;
    const C = (t) => [ph0 + t * Math.PI * 2, mid + amp * Math.cos(t * Math.PI * 2)];
    const positions = [], uvs = [], cols = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const [ph, y] = C(t);
      const [phn, yn] = C(t + 1e-3);
      const r = robeR(y);
      let tx = (phn - ph) * r, ty = yn - y;
      const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
      const px = -ty, py = tx; // perpendicular in surface metric
      for (let j = 0; j <= M; j++) {
        const v = j / M - 0.5;
        const sw = v * w;
        const ph2 = ph + (px * sw) / r, y2 = y + py * sw;
        const prof = Math.pow(Math.sin((j / M) * Math.PI), 0.55);
        const ripple = 0.35 * Math.sin(t * Math.PI * 2 * 9 + v * 6) + 0.25 * vnoise(t * 14, v * 4, 9);
        const off = 0.012 + 0.036 * prof + 0.012 * ripple * prof;
        const p = surf(ph2, y2, off);
        positions.push(p[0], p[1], p[2]);
        uvs.push(t * 4, j / M);
        const edge = 0.8 + 0.2 * prof - 0.05 * (ripple < 0 ? 1 : 0);
        const hem = 1 - 0.08 * clamp(1 - y2 / 1.4, 0, 1);
        const cc = clamp(edge * hem * (1 + 0.04 * ripple), 0.75, 1.0);
        cols.push(cc, cc * 0.99, cc * 0.96);
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + 1, c = a + (M + 1), d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    // make sure faces point outward (flip if the first quad faces inward)
    const n0 = new THREE.Vector3(g.attributes.normal.getX(5 * (M + 1) + 4), 0, g.attributes.normal.getZ(5 * (M + 1) + 4));
    const p0 = new THREE.Vector3(positions[(5 * (M + 1) + 4) * 3], 0, positions[(5 * (M + 1) + 4) * 3 + 2]);
    if (n0.dot(p0) < 0) {
      for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
      g.setIndex(idx); g.computeVertexNormals();
    }
    addMesh(g, robeMat);
  }

  /* ---- feet ---- */
  for (const sx of [-1, 1]) {
    const f = new THREE.SphereGeometry(0.07, 16, 12);
    f.scale(1, 0.55, 2.0);
    const m = addMesh(f, marbleMat);
    m.position.set(sx * 0.11, 0.035, 0.33);
    m.rotation.y = sx * 0.12;
  }

  /* ---- limbs ---- */
  const limb = (a, b, r0, r = r0, mat = robeMat) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const geo = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 8, 20);
    if (r0 !== r) { /* simple taper */ }
    const m = addMesh(geo, mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  };
  const sphere = (p, r, sc, mat = robeMat) => {
    const m = addMesh(new THREE.SphereGeometry(r, 20, 14), mat);
    m.position.set(...p); m.scale.set(...sc);
    return m;
  };

  const SH = 1.80;
  // shoulder caps
  sphere([0.31, SH, 0.0], 0.082, [1, 1, 1]);
  sphere([-0.31, SH, 0.0], 0.082, [1, 1, 1]);

  // hanging arm (-x side)
  limb([-0.32, SH, 0.0], [-0.34, 1.46, 0.03], 0.068, 0.068);
  sphere([-0.34, 1.46, 0.03], 0.067, [1, 1, 1]);
  limb([-0.34, 1.46, 0.03], [-0.335, 1.15, 0.09], 0.064, 0.064);
  sphere([-0.335, 1.10, 0.10], 0.052, [0.9, 1.35, 0.8], marbleMat);

  if (pose === 'festival') {
    // raised arm (+x side) holding a cup
    limb([0.32, SH, 0.0], [0.5, 1.64, 0.1], 0.068, 0.068);
    sphere([0.5, 1.64, 0.1], 0.067, [1, 1, 1]);
    limb([0.5, 1.64, 0.1], [0.56, 1.99, 0.27], 0.064, 0.064);
    sphere([0.56, 2.0, 0.28], 0.05, [1, 1, 1], marbleMat);
    // cup
    const prof = [[0, 0], [0.03, 0], [0.032, 0.012], [0.014, 0.03], [0.012, 0.06], [0.04, 0.075],
      [0.075, 0.12], [0.082, 0.17], [0.078, 0.172], [0.07, 0.125], [0.03, 0.09], [0, 0.085]]
      .map(([r, y]) => new THREE.Vector2(r, y));
    const cup = addMesh(new THREE.LatheGeometry(prof, 32), marbleMat);
    cup.position.set(0.56, 2.04, 0.28);
    cup.scale.setScalar(1.15);
    cup.material = marbleMat;
  } else {
    // bent arm (+x side) holding a scroll at the chest
    limb([0.32, SH, 0.0], [0.4, 1.52, 0.1], 0.068, 0.068);
    sphere([0.4, 1.52, 0.1], 0.067, [1, 1, 1]);
    limb([0.4, 1.52, 0.1], [0.14, 1.66, 0.3], 0.064, 0.064);
    sphere([0.12, 1.665, 0.31], 0.05, [1, 1, 1], marbleMat);
    // scroll
    const sg = new THREE.CylinderGeometry(0.036, 0.036, 0.36, 20);
    const scroll = addMesh(sg, marbleMat);
    scroll.position.set(0.10, 1.69, 0.325);
    scroll.rotation.set(0, 0, Math.PI / 2 - 0.35);
    for (const e of [-1, 1]) {
      const end = addMesh(new THREE.CylinderGeometry(0.046, 0.046, 0.022, 20), marbleMat);
      end.position.set(0.10 + Math.cos(0.35 - Math.PI / 2 * 0) * 0, 0, 0);
      end.position.copy(scroll.position).add(new THREE.Vector3(Math.sin(Math.PI / 2 - 0.35 + Math.PI / 2) * 0.18 * e * -1, Math.cos(Math.PI / 2 - 0.35 + Math.PI / 2) * 0.18 * e * -1, 0));
      end.rotation.copy(scroll.rotation);
    }
  }

  /* ---- neck & head ---- */
  const neck = addMesh(new THREE.CylinderGeometry(0.052, 0.062, 0.14, 24), marbleMat);
  neck.position.set(0, 2.0, 0.005);
  const headC = new THREE.Vector3(0, 2.3 - 0.138, 0.012);
  const head = new THREE.Group();
  head.position.copy(headC);
  head.rotation.set(pose === 'festival' ? -0.08 : 0.06, pose === 'festival' ? 0.18 : -0.12, 0);
  fig.add(head);
  {
    const skull = new THREE.SphereGeometry(0.108, 32, 24);
    skull.scale(1, 1.22, 1.08);
    addMesh(skull, marbleMat, head);
    // jaw / chin
    const jaw = new THREE.SphereGeometry(0.07, 20, 14); jaw.scale(1, 0.9, 0.95);
    const jm = addMesh(jaw, marbleMat, head); jm.position.set(0, -0.07, 0.035);
    // nose
    const nose = new THREE.SphereGeometry(0.02, 12, 10); nose.scale(0.8, 2.0, 1.4);
    const nm = addMesh(nose, marbleMat, head); nm.position.set(0, -0.012, 0.118);
    // brow ridge
    const brow = new THREE.SphereGeometry(0.1, 20, 8); brow.scale(1, 0.12, 0.6);
    const bm = addMesh(brow, marbleMat, head); bm.position.set(0, 0.03, 0.06);
    // lips
    const lip = new THREE.SphereGeometry(0.03, 12, 8); lip.scale(1.3, 0.4, 0.7);
    const lm = addMesh(lip, marbleMat, head); lm.position.set(0, -0.06, 0.105);
    // hair cap with noisy displacement
    const hair = new THREE.SphereGeometry(0.118, 32, 20, 0, Math.PI * 2, 0, 2.05);
    hair.scale(1, 1.2, 1.1);
    const hp = hair.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
      const n = 1 + 0.07 * vnoise(x * 40, y * 40, z * 40) + 0.04 * Math.sin(Math.atan2(x, z) * 14 + y * 30);
      hp.setXYZ(i, x * n, y * n, z * n);
    }
    hair.computeVertexNormals();
    const hm = addMesh(hair, marbleMat, head); hm.position.set(0, 0.012, -0.012);
    if (pose === 'festival') {
      const bun = new THREE.SphereGeometry(0.05, 16, 12);
      const bnm = addMesh(bun, marbleMat, head); bnm.position.set(0, -0.01, -0.12);
      // laurel-like fillet
      const fil = new THREE.TorusGeometry(0.113, 0.01, 8, 40);
      const fm = addMesh(fil, marbleMat, head); fm.rotation.x = Math.PI / 2 - 0.1; fm.position.set(0, 0.055, -0.008);
      fm.scale.set(1, 1.1, 1);
    } else {
      const beard = new THREE.SphereGeometry(0.085, 24, 16); beard.scale(1, 1.2, 0.75);
      const bp = beard.attributes.position;
      for (let i = 0; i < bp.count; i++) {
        const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
        const n = 1 + 0.06 * Math.sin(x * 90) * 0.5 + 0.05 * vnoise(x * 30, y * 30, z * 30);
        bp.setXYZ(i, x * n, y * n, z * n);
      }
      beard.computeVertexNormals();
      const bd = addMesh(beard, marbleMat, head); bd.position.set(0, -0.105, 0.045);
    }
  }

  group.add(fig);

  /* ---- base block ---- */
  {
    const W = 1.25 * s, D = 1.0 * s;
    const addBox = (w, h, d, y, mat = marbleMat) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = addMesh(g, mat, group);
      m.position.set(0, y + h / 2, 0);
      return m;
    };
    addBox(W, 0.12, D, 0);                       // plinth
    addBox(W * 0.9, 0.17, D * 0.88, 0.12);        // die
    addBox(W * 0.96, 0.06, D * 0.95, 0.29);       // cap slab (total 0.35)
    // moss / dirt band at the bottom edge
    const moss = addBox(W + 0.008, 0.045, D + 0.008, 0, mossMat);
    moss.castShadow = false;
    const moss2 = addBox(W + 0.012, 0.015, D + 0.012, 0.045, mossMat);
    moss2.material = mossMat; moss2.castShadow = false;
  }

  return group;
}
