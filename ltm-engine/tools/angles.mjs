// Usage: node ltm-engine/tools/angles.mjs <id>[,<id>...] [--out dir] [--tag before|after] [--pitch 0.35]
// Renders each library object from four angles (front, right, back, left) plus a top-down view and tiles them into one PNG per object:
//   <out>/<id>-<tag>.png   (default out: the scratchpad "angles" folder given by --out, or ./angles-out)
// Look at the result before and after every change; one angle hides faults the others show.
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { serve } from './serve.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const a = process.argv.slice(2), ids = (a.find(x => !x.startsWith('--')) || '').split(',').filter(Boolean);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const out = opt('out', 'angles-out'), tag = opt('tag', 'after'), pitch = +opt('pitch', .35), port = +opt('port', 8800 + Math.floor(Math.random() * 90));
if (!ids.length) { console.error('give one or more object ids'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const srv = serve(port); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 700 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
await p.goto(`http://localhost:${port}/ltm-engine/library/?angles`); await p.waitForFunction('window.__library && window.__library.done && window.__libraryAngle', null, { timeout: 150000 });
const views = [['front', 0, pitch], ['right', Math.PI / 2, pitch], ['back', Math.PI, pitch], ['left', -Math.PI / 2, pitch], ['top', 0.6, 1.35]];
for (const id of ids) {
  const imgs = []; for (const [n, s, pi] of views) imgs.push(await p.evaluate(([id, s, pi]) => window.__libraryAngle(id, s, pi, 640, 480), [id, s, pi]));
  const html = `<body style="margin:0;background:#efe6d6"><canvas id=c width=1920 height=960></canvas></body>`; const q = await b.newPage(); await q.setContent(html);
  const png = await q.evaluate(async imgs => { const c = document.getElementById('c'), x = c.getContext('2d'); x.fillStyle = '#efe6d6'; x.fillRect(0, 0, 1920, 960);
    for (let i = 0; i < imgs.length; i++) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = imgs[i]; }); x.drawImage(im, (i % 3) * 640, Math.floor(i / 3) * 480); }
    x.fillStyle = '#5a4630'; x.font = '20px sans-serif'; ['front', 'right', 'back', 'left', 'top'].forEach((t, i) => x.fillText(t, (i % 3) * 640 + 10, Math.floor(i / 3) * 480 + 24)); return c.toDataURL('image/png'); }, imgs);
  await q.close(); const f = path.join(out, `${id}-${tag}.png`); fs.writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('wrote', f);
}
if (errs.length) console.log('page errors:', errs.slice(0, 5)); await b.close(); process.exit(0);
