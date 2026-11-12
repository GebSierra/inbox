// ---------- after the town is built: things that move, and the bird's-eye cutaway ----------
// Runs after engine/finish.js, in the same shared scope (reads overview, camera, scene from the engine).
const puffT = canvasTex(128, (x, w) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.5, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
function puff(color, opacity) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, color, transparent: true, depthWrite: false, opacity, fog: true })); s.userData.dyn = 1; scene.add(s); return s; }
// the pillar of cloud over the tent (Ex 40:34–38; Num 9:15–16)
const CLOUD = []; for (let i = 0; i < 46; i++) { const s = puff('#fbf8f2', .55); s.userData = { dyn: 1, h: R(0, 1), a: R(0, 6.3), r: R(.4, 2.6), sz: R(5, 9), sp: R(.08, .2) }; CLOUD.push(s); }
// smoke from the altar fire and a thread of incense
const SMOKE = []; for (let i = 0; i < 14; i++) { const s = puff('#b8b0a6', .3); s.userData = { dyn: 1, ph: i / 14 }; SMOKE.push(s); }
const INC = []; for (let i = 0; i < 6; i++) { const s = puff('#e8e2d8', .22); s.userData = { dyn: 1, ph: i / 6 }; INC.push(s); }
// the hud says "Chapter n" for the engine's book towns; here the areas are named on their own
{ const hz = document.querySelector('#hud .z'); new MutationObserver(() => { const t = hz.textContent, m = t.match(/^Chapter \d+(?: · )?(.*)$/); if (m) hz.textContent = m[1] || CFG.name; }).observe(hz, { childList: true, characterData: true, subtree: true }); }
const tclock = new THREE.Clock();
(function anim() {
  const t = tclock.getElapsedTime();
  for (const p of ROOF) p.visible = !overview;                                   // the cutaway
  for (const s of CLOUD) { const u = s.userData, h = (u.h + t * .01) % 1, a = u.a + t * u.sp;
    s.position.set(Math.cos(a) * u.r * (1 + h), TENT.H + 3 + h * 46, ARK_Z + Math.sin(a) * u.r * (1 + h) * .8); s.scale.setScalar(u.sz * (1 + h * .8)); s.material.opacity = .62 * Math.min(1, h * 8) * (h > .85 ? (1 - h) / .15 : 1); }
  for (const s of SMOKE) { const ph = (t * .12 + s.userData.ph) % 1; s.position.set(Math.sin(ph * 5 + s.userData.ph * 9) * .5 + ph * 1.5, ALTAR.h + 1.6 + ph * 9, ALTAR.z - ph * 1.2); s.scale.setScalar(.8 + ph * 4); s.material.opacity = .32 * (1 - ph) * Math.min(1, ph * 6); }
  for (const s of INC) { const ph = (t * .1 + s.userData.ph) % 1; s.position.set(Math.sin(ph * 7 + s.userData.ph * 5) * .12, 1.0 + ph * 2.6, INCENSE_Z); s.scale.setScalar(.15 + ph * .9); s.material.opacity = .25 * (1 - ph) * Math.min(1, ph * 5); }
  requestAnimationFrame(anim);
})();
