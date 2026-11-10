import { chromium } from '/home/claude/colossae/node_modules/playwright-core/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = '/home/claude/colossae';
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.png': 'image/png' };
const srv = http.createServer((q, s) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); s.end(d); } });
}).listen(0);
const port = srv.address().port;
const qs = process.argv[2] || ''; const out = process.argv[3] || 'statue_test.png';
const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await br.newPage({ viewport: { width: 1200, height: 800 } });
pg.on('console', m => console.log('console:', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${port}/tools/statue_view.html?${qs}`);
await pg.waitForFunction('window.__ok===1', null, { timeout: 60000 });
await pg.screenshot({ path: `${root}/shots/${out}` });
await br.close(); srv.close();
