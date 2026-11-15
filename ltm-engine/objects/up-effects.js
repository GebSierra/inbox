// ---------- NEW (plan item N6): smoke, the pillar of cloud, and a soft glow as reusable pieces ----------
// Lifted from tabernacle-ltm/world/after.js so any palace can use them. Each effect is a set of soft sprites in its own group, moved every
// frame by an updater pushed onto the engine's FIRES list (the runtime already calls f.update(t, camera) on each), so no animation loop of
// its own is needed and the library's stage clears it with the fires. Sprites are kept out of the merge (dyn) and hidden for the
// desktop ambient-occlusion pass, which would otherwise draw them as dark squares.
//   upSmoke(g, x, y, z, o)       a rising plume, thinning and spreading as it climbs. o: { n, height, color, drift, opacity, thread }
//                               thread: true gives a thin thread of incense instead of a fire's plume
//   upCloudPillar(g, x, y, z, o) the pillar of cloud over the camp (Ex 13:21, 40:34–38). o: { n, height, r, size, color }
//   upGlow(g, x, y, z, o)        a soft additive glow (lamplight, the glory between the cherubim). o: { size, color, opacity }
// Private generator (no R()).
const UFX = { soft: new Set(), patched: false };
const ufxPuffs = () => UFX.puffs || (UFX.puffs = [0, 1, 2, 3].map(i => { const rr = upRng(11 + i * 7); return canvasTex(128, (x, w) => { x.clearRect(0, 0, w, w);
  for (let k = 0; k < 9; k++) { const a = rr() * 6.3, d = rr() * 26, cx = 64 + Math.cos(a) * d, cy = 64 + Math.sin(a) * d, r = 22 + rr() * 22;
    const gr = x.createRadialGradient(cx, cy, 1, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,.42)'); gr.addColorStop(.55, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); } }); }));
function ufxSoftAO() { if (UFX.patched || typeof ao === 'undefined' || !ao.overrideVisibility) return; UFX.patched = true;
  const ov = ao.overrideVisibility.bind(ao); ao.overrideVisibility = () => { ov(); for (const o of UFX.soft) if (o.parent) o.visible = false; else UFX.soft.delete(o); }; }
function ufxSprite(G, map, color, opacity, additive) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, opacity, fog: true, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  s.userData.dyn = 1; s.castShadow = false; G.add(s); UFX.soft.add(s); return s; }
const ufxGroup = (g, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); G.userData.dyn = 1; g.add(G); ufxSoftAO(); return G; };

function upSmoke(g, x, y, z, o = {}) { const G = ufxGroup(g, x, y, z), P = ufxPuffs(), r = upRng(Math.round(x * 97) ^ Math.round(z * 61) ^ 5),
    thin = !!o.thread, n = o.n || (thin ? 8 : 24), H = o.height || (thin ? 2.8 : 11), op = o.opacity || (thin ? .3 : .55), drift = o.drift ?? (thin ? 0 : 3), list = [];
  for (let i = 0; i < n; i++) { const s = ufxSprite(G, P[i % 4], o.color || (thin ? '#f1ece4' : i % 3 ? '#e6e1da' : '#cfc8be'), op); s.material.rotation = r() * 6.3; list.push({ s, ph: i / n, rs: (r() - .5) * (thin ? 1 : .8), w: (r() - .5) * .8 }); }
  FIRES.push({ update(t) { for (const u of list) { const ph = (t * (thin ? .08 : .09) + u.ph) % 1, d = ph * ph, s = u.s;
    if (thin) { s.position.set(Math.sin(ph * 7 + u.ph * 5) * (.06 + ph * .2), ph * H, 0); s.scale.setScalar(.15 + ph * 1.1); s.material.opacity = op * (1 - ph) * Math.min(1, ph * 6); }
    else { s.position.set(Math.sin(ph * 4 + u.ph * 9) * (.25 + ph * .6) + d * drift + u.w * ph, .3 + ph * H, -d * drift * .66); s.scale.setScalar(.7 + ph * H * .5); s.material.opacity = op * Math.pow(1 - ph, 1.4) * Math.min(1, ph * 7); }
    s.material.rotation += u.rs * .01; } } });
  G.userData.frameBox = [2 + H * .4, H]; return y + H; }

function upCloudPillar(g, x, y, z, o = {}) { const G = ufxGroup(g, x, y, z), P = ufxPuffs(), r = upRng(Math.round(x * 13) ^ Math.round(z * 7) ^ 9), n = o.n || 60, H = o.height || 46, R0 = o.r || 2.6, SZ = o.size || 7, list = [];
  for (let i = 0; i < n; i++) { const s = ufxSprite(G, P[i % 4], o.color || '#fdfbf6', .7); s.material.rotation = r() * 6.3; list.push({ s, h: r(), a: r() * 6.3, r: .4 + r() * (R0 - .4), sz: SZ * (.7 + r() * .6), sp: .08 + r() * .12, rs: (r() - .5) * .3 }); }
  FIRES.push({ update(t) { for (const u of list) { const h = (u.h + t * .01) % 1, a = u.a + t * u.sp, s = u.s;
    s.position.set(Math.cos(a) * u.r * (1 + h), h * H, Math.sin(a) * u.r * (1 + h) * .8); s.scale.setScalar(u.sz * (1 + h * .8)); s.material.rotation += u.rs * .01;
    s.material.opacity = .62 * Math.min(1, h * 8) * (h > .85 ? (1 - h) / .15 : 1); } } });
  G.userData.frameBox = [R0 * 4, H]; return y + H; }

function upGlow(g, x, y, z, o = {}) { const G = ufxGroup(g, x, y, z);
  const tex = UFX.glow || (UFX.glow = canvasTex(128, (c, w) => { const gr = c.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  const s = ufxSprite(G, tex, o.color || '#ffe6a8', o.opacity ?? .55, true); s.scale.setScalar(o.size || 1.3); G.userData.frameBox = [o.size || 1.3, o.size || 1.3]; G.position.y -= (o.size || 1.3) / 2; return y + (o.size || 1.3) / 2; }

{ const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'plan N6 (tabernacle)', tags, kind: 'effect' });
  T('altar-smoke', 'Smoke rising from a fire', ['smoke', 'fire', 'sacrifice', 'camp'], (g, x, y, z) => upSmoke(g, x, y, z, { height: 6 }));
  T('incense-smoke', 'Thread of incense smoke', ['smoke', 'incense', 'prayer', 'temple'], (g, x, y, z) => { cyl(.09, .06, .05, 10, mat('utbCoal', '#5a2a18', { emissive: '#ff5a1a', emissiveIntensity: .8 }), x, y, z, g); return upSmoke(g, x, y + .05, z, { thread: true }); });
  T('pillar-of-cloud', 'Pillar of cloud', ['cloud', 'glory', 'exodus', 'wilderness'], (g, x, y, z) => upCloudPillar(g, x, y, z, { height: 14, r: 1.2, size: 3, n: 40 }));
  T('soft-glow', 'Soft glow of light', ['light', 'glory', 'lamp'], (g, x, y, z) => upGlow(g, x, y + 1.4, z)); }
