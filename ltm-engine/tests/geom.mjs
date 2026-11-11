// Geometry checks shared by acceptance.mjs (measured on a rendered page) and fast.mjs (measured with no frame drawn).
// The input is what window.__measure(i) returns for a stop: { name, ch, room, pts: [{ sx, sy, z, mx, my, mz, support }] },
// the five spots projected through the stop camera (sx/sy at the marker's base, mx/my at its middle, mz depth) and the
// distance from each spot down to the first thing beneath it. Spots: 1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre.
export const T = { maxSupport: 1.6, frameX: .97, frameYTop: -.85, frameYBot: .97 };
const cross = (o, a, b) => (a.sx - o.sx) * (b.sy - o.sy) - (a.sy - o.sy) * (b.sx - o.sx);
const inside = (pt, q) => { const s = q.map((a, i) => Math.sign(cross(a, q[(i + 1) % 4], pt))); return s.every(x => x === s[0]) && s[0] !== 0; };
// -> [{ name, pass, detail }] in the order acceptance.mjs reports them
export function roomChecks(m) {
  const P = m.pts, tag = `${m.ch}.${m.room} ${m.name}`, out = [], add = (what, pass, detail = '') => out.push({ name: `${tag}: ${what}`, pass, detail });
  if (P.length >= 4) {
    const [a, c, d, e] = P;
    const cw = a.sx < e.sx && c.sx < d.sx && a.sx < d.sx && c.sx < e.sx && a.sy > c.sy && e.sy > d.sy;
    add('clockwise order on screen', cw, cw ? '' : P.slice(0, 4).map((q, k) => `${k + 1}(${q.sx.toFixed(2)},${q.sy.toFixed(2)})`).join(' '));
    if (P.length === 5) add('centre inside the square', inside(P[4], [a, c, d, e]));
  }
  const floating = P.map((q, k) => q.support === null || q.support > T.maxSupport ? k + 1 : 0).filter(Boolean);
  add('markers rest on objects', floating.length === 0, floating.length ? `spot(s) ${floating} have nothing beneath within ${T.maxSupport} m` : '');
  const off = P.map((q, k) => (Math.abs(q.mx) > T.frameX || q.my < T.frameYTop || q.my > T.frameYBot || q.mz > 1) ? k + 1 : 0).filter(Boolean);
  add('all spots in frame', off.length === 0, off.length ? `spot(s) ${off} off screen` : '');
  return out;
}
