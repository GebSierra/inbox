// Screenshot rooms from the learner's standing spot.
// Usage: node tools/room-shots.mjs <outdir> [roomIndex ...] [--aerial] [--markers]
//   roomIndex is 0-based in walking order (0 = 1.1 Gate Stoa). With no indexes, shoots every room.
// Prints page errors and window.__bookCheck so a broken build is obvious.
import { chromium } from '../node_modules/playwright-core/index.mjs';
import { serve } from './serve.mjs'; import fs from 'fs';
const args = process.argv.slice(2), out = args[0] || 'shots'; fs.mkdirSync(out, { recursive: true });
const idx = args.slice(1).filter(a => /^\d+$/.test(a)).map(Number), AERIAL = args.includes('--aerial'), MARK = args.includes('--markers');
const { url, close } = await serve(8792 + Math.floor(Math.random() * 100));
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url + '?notut'); await p.waitForFunction(() => window.__ready, null, { timeout: 240000 });
if (MARK) await p.evaluate(() => document.getElementById('gembtn')?.click());
const n = await p.evaluate(() => window.__state().n), list = idx.length ? idx : [...Array(n).keys()];
for (const i of list) { await p.evaluate(i => window.__snap(i), i); await p.waitForTimeout(2500);
  const name = await p.evaluate(i => window.__dump().rooms[i].name, i);
  await p.screenshot({ path: `${out}/room-${i}.png` }); console.log(`room-${i}.png  ${name}`); }
if (AERIAL) { await p.evaluate(() => window.__cam(0, 55, 100, 0, 0, 52)); await p.waitForTimeout(3000); await p.screenshot({ path: `${out}/aerial.png` }); console.log('aerial.png'); }
console.log('bookCheck:', JSON.stringify(await p.evaluate(() => window.__bookCheck)));
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await b.close(); close();
