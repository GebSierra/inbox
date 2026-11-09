import { chromium } from '../node_modules/playwright-core/index.mjs';
import { serve } from './serve.mjs';
const out = '/tmp/claude-0/-home-claude/ad14b8a4-6c0d-5703-a9a4-4089bb0ebabc/scratchpad/town/';
import fs from 'fs'; fs.mkdirSync(out, { recursive: true });
const { url, close } = await serve(8937);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(url + 'tools/town-preview.html'); await p.waitForFunction('window.__ready', null, { timeout: 120000 });
console.log(JSON.stringify(await p.evaluate('window.__stats')));
for (const v of ['wide', 'street', 'harbour']) { await p.evaluate(`window.__view('${v}')`); await p.screenshot({ path: out + v + '.png', timeout: 240000 }); }
await b.close(); close();
