// ---------- after the town is built: things that move, and the bird's-eye cutaway ----------
// Runs after engine/finish.js, in the same shared scope (reads overview, camera, scene from the engine).
// a billowy puff: several soft blobs, so a sprite reads as a curl of smoke, not a disc
function puffTex(seed) { const rr = upRng(seed); return canvasTex(128, (x, w) => { x.clearRect(0, 0, w, w);
  for (let i = 0; i < 9; i++) { const a = rr() * 6.3, d = rr() * 26, cx = 64 + Math.cos(a) * d, cy = 64 + Math.sin(a) * d, r = 22 + rr() * 22;
    const g = x.createRadialGradient(cx, cy, 1, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.42)'); g.addColorStop(.55, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); } }); }
const PUFFS = [0, 1, 2, 3].map(i => puffTex(11 + i * 7));
const SPRITES = [];
function puff(color, opacity) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFFS[SPRITES.length % 4], color, transparent: true, depthWrite: false, opacity, fog: true }));
  s.material.rotation = R(0, 6.3); s.userData.dyn = 1; scene.add(s); SPRITES.push(s); return s; }
// the pillar of cloud over the tent (Ex 40:34–38; Num 9:15–16)
const CLOUD = []; for (let i = 0; i < 60; i++) { const s = puff('#fdfbf6', .7); s.userData = { dyn: 1, h: R(0, 1), a: R(0, 6.3), r: R(.4, 2.6), sz: R(5, 9), sp: R(.08, .2), rs: R(-.15, .15) }; CLOUD.push(s); }
// smoke from the altar fire (pale grey, thinning and spreading as it rises) and a thread of incense
const SMOKE = []; for (let i = 0; i < 24; i++) { const s = puff(i % 3 ? '#e6e1da' : '#cfc8be', .5); s.userData = { dyn: 1, ph: i / 24, rs: R(-.4, .4), w: R(-.4, .4) }; SMOKE.push(s); }
const INC = []; for (let i = 0; i < 8; i++) { const s = puff('#f1ece4', .3); s.userData = { dyn: 1, ph: i / 8, rs: R(-.5, .5) }; INC.push(s); }
// The engine's ambient-occlusion pass (desktop only) draws every mesh and sprite as a solid shape to find corners to shade.
// Smoke sprites and the fire's flame cards would come out as dark squares, so they are hidden for that pass in this town.
// (GTAOPass restores every object's visibility from its own cache straight after, so nothing else changes.)
{ const SOFT = []; scene.traverse(o => { if (o.isSprite || (o.material && (o.material.transparent || o.material.isShaderMaterial) && o.userData.dyn)) SOFT.push(o); });
  const ov = ao.overrideVisibility.bind(ao); ao.overrideVisibility = () => { ov(); for (const o of SOFT) o.visible = false; }; }
// the hud says "Chapter n" for the engine's book towns; here the areas are named on their own
{ const hz = document.querySelector('#hud .z'); new MutationObserver(() => { const t = hz.textContent, m = t.match(/^Chapter \d+(?: · )?(.*)$/); if (m) hz.textContent = m[1] || CFG.name; }).observe(hz, { childList: true, characterData: true, subtree: true }); }
const tclock = new THREE.Clock();
(function anim() {
  const t = tclock.getElapsedTime();
  for (const p of ROOF) p.visible = !overview;                                   // the cutaway
  for (const s of CLOUD) { const u = s.userData, h = (u.h + t * .01) % 1, a = u.a + t * u.sp;
    s.position.set(Math.cos(a) * u.r * (1 + h), TENT.H + 3 + h * 46, ARK_Z + Math.sin(a) * u.r * (1 + h) * .8); s.scale.setScalar(u.sz * (1 + h * .8)); s.material.rotation += u.rs * .01; s.material.opacity = .62 * Math.min(1, h * 8) * (h > .85 ? (1 - h) / .15 : 1); }
  for (const s of SMOKE) { const u = s.userData, ph = (t * .09 + u.ph) % 1, drift = ph * ph;
    s.position.set(Math.sin(ph * 4 + u.ph * 9) * (.25 + ph * .6) + drift * 3 + u.w * ph, ALTAR.h + .9 + ph * 11, ALTAR.z - drift * 2);
    s.scale.setScalar(.7 + ph * 5.5); s.material.rotation += u.rs * .01; s.material.opacity = .55 * Math.pow(1 - ph, 1.4) * Math.min(1, ph * 7); }
  for (const s of INC) { const u = s.userData, ph = (t * .08 + u.ph) % 1; s.position.set(Math.sin(ph * 7 + u.ph * 5) * (.06 + ph * .2), 1.0 + ph * 2.8, INCENSE_Z); s.scale.setScalar(.15 + ph * 1.1); s.material.rotation += u.rs * .01; s.material.opacity = .3 * (1 - ph) * Math.min(1, ph * 5); }
  requestAnimationFrame(anim);
})();
