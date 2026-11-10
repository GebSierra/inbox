// Dump the live room data (rooms, loci, objects, positions) to <town>/books/<book>.runtime.json
// Usage: node ltm-engine/tools/dump.mjs <town-folder>      e.g. colossae-ltm -> colossae-ltm/books/colossians.runtime.json
import { chromium, launchOpts } from './pw.mjs';
import { serve, REPO } from './serve.mjs'; import fs from 'fs'; import path from 'path';
const town = process.argv[2]; if (!town) { console.error('usage: dump.mjs <town-folder>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(path.join(REPO, town, 'town.json'), 'utf8'));
const { url, close } = await serve();
const b = await chromium.launch(launchOpts());
const p = await b.newPage(); await p.goto(url + town + '/index.html?notut&fast'); await p.waitForFunction(() => window.__ready, null, { timeout: 200000 });
fs.writeFileSync(path.join(REPO, town, 'books', cfg.bookFile + '.runtime.json'), JSON.stringify(await p.evaluate(() => window.__dump()), null, 1));
console.log('dumped'); await b.close(); close();
