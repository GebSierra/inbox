// LTM acceptance suite. Usage (from the repository root, next to ltm-engine/ and the town folders):
//   node ltm-engine/tests/acceptance.mjs <town-folder> [--update-baseline] [--rooms] [--no-shots]
//   e.g.  node ltm-engine/tests/acceptance.mjs colossae-ltm --rooms --no-shots
// The repository root is served so the town's ../ltm-engine/ paths resolve; baselines live in <town>/tests/baseline, output in <town>/tests/out.
// Checks every room: clockwise screen order, centre inside the square, markers resting on objects,
// all five spots in frame, clear walking routes; plus phone load time, frame rate and screenshot regression.
import { chromium, launchOpts } from '../tools/pw.mjs';
import { serve, REPO } from '../tools/serve.mjs'; import { roomChecks } from './geom.mjs'; import fs from 'fs'; import path from 'path';
const TOWN = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!TOWN || !fs.existsSync(path.join(REPO, TOWN, 'index.html'))) { console.error('usage: node ltm-engine/tests/acceptance.mjs <town-folder> [--update-baseline] [--rooms] [--no-shots]'); process.exit(2); }
const TD = path.join(REPO, TOWN, 'tests'); fs.mkdirSync(path.join(TD, 'out'), { recursive: true });
const UPDATE = process.argv.includes('--update-baseline');
const ROOMS_ONLY = process.argv.includes('--rooms'), NO_SHOTS = process.argv.includes('--no-shots');
const T = { loadMs: 30000, minFps: 0.2, pixelDiff: .12 };  // fps floor is for headless software GL; real phones should exceed 25
const { url: root, close } = await serve(8791); const url = root + TOWN + '/index.html';
const b = await chromium.launch(launchOpts());
const results = []; const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); };

// --- phone: load time + frame rate ---
if (!ROOMS_ONLY) { const ctx = await b.newContext({ viewport: { width: 412, height: 839 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
  const t0 = Date.now(); await p.goto(url + '?notut'); await p.waitForFunction(() => window.__ready, null, { timeout: 200000 }); const ms = Date.now() - t0;
  ok('phone: page ready', ms < T.loadMs, `${(ms / 1000).toFixed(1)} s (limit ${T.loadMs / 1000} s, headless software GL)`);
  const f0 = await p.evaluate(() => window.__fc); await p.waitForTimeout(10000); const fps = (await p.evaluate(() => window.__fc) - f0) / 10;
  ok('phone: frame rate', fps >= T.minFps, `${fps.toFixed(2)} fps in headless software GL; measure on a real phone with ?fps`); await ctx.close(); }

// --- per-room checks ---
const p = await b.newPage({ viewport: { width: 900, height: 600 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
await p.goto(url + '?notut&fast'); await p.waitForFunction(() => window.__ready, null, { timeout: 200000 });
const blockers = await p.evaluate(() => window.__blockers()); ok('walking routes clear', blockers.length === 0, blockers.join('; '));
const n = await p.evaluate(() => window.__state().n);
for (let i = 0; i < n; i++) {
  await p.evaluate(i => window.__snap(i), i); const fc = await p.evaluate(() => window.__fc); await p.waitForFunction(fc => window.__fc > fc + 1, fc, { timeout: 60000 });
  const m = await p.evaluate(i => window.__measure(i), i), tag = `${m.ch}.${m.room} ${m.name}`;
  for (const c of roomChecks(m)) ok(c.name, c.pass, c.detail);   // thresholds and maths shared with fast.mjs (geom.mjs)
  if (NO_SHOTS) continue;
  const shot = path.join(TD, 'out', `${String(i).padStart(2, '0')}.png`); await p.screenshot({ path: shot, timeout: 150000 });
  const base = path.join(TD, 'baseline', `${String(i).padStart(2, '0')}.png`);
  if (UPDATE || !fs.existsSync(base)) fs.copyFileSync(shot, base);
  else { const diff = await p.evaluate(async ([A, B]) => { const ld = s => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = s; }); const [x, y] = await Promise.all([ld(A), ld(B)]);
      const c = document.createElement('canvas'); c.width = 225; c.height = 150; const g = c.getContext('2d'); g.drawImage(x, 0, 0, 225, 150); const da = g.getImageData(0, 0, 225, 150).data; g.drawImage(y, 0, 0, 225, 150); const db = g.getImageData(0, 0, 225, 150).data;
      let s = 0; for (let k = 0; k < da.length; k += 4) s += Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]); return s / (da.length / 4) / 765; },
      ['data:image/png;base64,' + fs.readFileSync(shot).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(base).toString('base64')]);
    ok(`${tag}: matches approved screenshot`, diff < T.pixelDiff, `${(diff * 100).toFixed(1)}% mean pixel difference`); }
}
ok('no page errors', errors.length === 0, errors.slice(0, 3).join('; '));
const fails = results.filter(r => !r.pass); fs.writeFileSync(path.join(TD, 'out', 'report.json'), JSON.stringify({ when: new Date().toISOString(), passed: results.length - fails.length, failed: fails.length, results }, null, 1));
console.log(`\n${results.length - fails.length}/${results.length} checks passed`); await b.close(); close(); process.exit(fails.length ? 1 : 0);
