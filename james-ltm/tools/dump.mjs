// Dump the live room data (rooms, loci, objects, positions) to books/colossians.runtime.json
import { chromium } from '../node_modules/playwright-core/index.mjs';
import { serve } from './serve.mjs'; import fs from 'fs';
const { url, close } = await serve();
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.goto(url + '?notut&fast'); await p.waitForFunction(() => window.__ready, null, { timeout: 200000 });
fs.writeFileSync(new URL('../books/colossians.runtime.json', import.meta.url), JSON.stringify(await p.evaluate(() => window.__dump()), null, 1));
console.log('dumped'); await b.close(); close();
