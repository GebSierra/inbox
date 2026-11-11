// FAST LTM geometry test: the same per-room checks as `acceptance.mjs --rooms`, by calculation, with no frame drawn.
//   node ltm-engine/tests/fast.mjs <town-folder | all> [--book path/to/book.json]
// How: opens <town>/index.html?notut&fast in headless Chromium with requestAnimationFrame stubbed (the scene is built, the loop never runs),
// then for each stop calls window.__stopMeasure(i), which puts the camera where the stop would leave it and projects the five spots with
// camera maths (no GPU draw), CPU-raycasts for support, and checks them with geom.mjs. Walking routes: window.__blockers() (segment raycasts
// along the VIA routes). Run it on every change; acceptance.mjs (screenshots, phone load, fps) only occasionally.
// --book swaps in another book file for the town (used to prove the test catches a mistake without touching the real book).
import { chromium, launchOpts } from '../tools/pw.mjs';
import { serve, REPO } from '../tools/serve.mjs'; import { roomChecks } from './geom.mjs'; import fs from 'fs'; import path from 'path';
const args = process.argv.slice(2), arg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--book');
const bookOverride = args.includes('--book') ? fs.readFileSync(path.resolve(args[args.indexOf('--book') + 1])) : null;
const towns = arg === 'all' ? fs.readdirSync(REPO).filter(d => /-ltm$/.test(d) && fs.existsSync(path.join(REPO, d, 'index.html'))) : [arg];
if (!arg || towns.some(t => !fs.existsSync(path.join(REPO, t, 'index.html')))) { console.error('usage: node ltm-engine/tests/fast.mjs <town-folder | all> [--book book.json]'); process.exit(2); }
const t00 = Date.now(), bookFiles = Object.fromEntries(towns.map(t => [`/${t}/books/${JSON.parse(fs.readFileSync(path.join(REPO, t, 'town.json'), 'utf8')).bookFile}.json`, t]));
const { url: root, close } = serve(8900 + Math.floor(Math.random() * 90), { patch: (u) => bookOverride && bookFiles[u] ? bookOverride : undefined });
const b = await chromium.launch(launchOpts()); let bad = 0;
for (const town of towns) {
  const t0 = Date.now(), results = [], ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };
  const p = await b.newPage({ viewport: { width: 900, height: 600 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  console.log(`\n== ${town} ==`);
  await p.goto(root + town + '/index.html?notut&fast', { timeout: 150000 }); await p.waitForFunction(() => window.__ready, null, { timeout: 280000, polling: 100 }).catch(e => errors.push('never ready: ' + e.message));
  const tReady = Date.now();
  if (await p.evaluate(() => !!window.__ready)) {
    const blockers = await p.evaluate(() => window.__blockers()); ok('walking routes clear', blockers.length === 0, blockers.join('; '));
    const rooms = await p.evaluate(() => { const n = window.__state().n, r = []; for (let i = 0; i < n; i++) r.push(window.__stopMeasure(i)); return r; });
    for (const m of rooms) for (const c of roomChecks(m)) ok(c.name, c.pass, c.detail);
  }
  ok('no page errors', errors.length === 0, errors.slice(0, 3).join('; '));
  const f = results.filter(r => !r.pass).length; bad += f; console.log(`${town}: ${results.length - f}/${results.length} checks passed  (ready ${((tReady - t0) / 1000).toFixed(1)} s, checks ${((Date.now() - tReady) / 1000).toFixed(1)} s, total ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  await p.close();
}
console.log(`\n${bad ? bad + ' FAILED' : 'all passed'} in ${((Date.now() - t00) / 1000).toFixed(1)} s`); await b.close(); close(); process.exit(bad ? 1 : 0);
