// Contact sheets of the whole object library, for judging looks side by side, plus a table of every object's weight.
//   node ltm-engine/tools/library-sheets.mjs <out-dir>
// Opens ltm-engine/library/, waits for every thumbnail, and writes into <out-dir>:
//   <id>.jpg      the library's own thumbnail of each object (320×240)
//   cards.json    [{ id, label, kind, town, origin, size, uses, stats: { tris, meshes, mats } }]   (uses = rooms in the books that place it)
//   sheet.html    one page of all thumbnails with id, triangles and uses under each: open it, or screenshot it in pieces
// Nothing in the repository is changed (the triangle counter is patched into the served copy of library.js only).
import { chromium, launchOpts } from './pw.mjs'; import { serve } from './serve.mjs'; import fs from 'fs'; import path from 'path';
const out = process.argv[2]; if (!out) { console.error('usage: node ltm-engine/tools/library-sheets.mjs <out-dir>'); process.exit(2); } fs.mkdirSync(out, { recursive: true });
const extra = `
;window.__objStats = () => { const res = {}; for (const e of OBJECTS.values()) { const g = new THREE.Group(), s0 = scene.children.length; let tris = 0, meshes = 0; const mats = new Set();
  try { e.fn(g, 0, 0, 0, ...e.args); } catch (err) { res[e.id] = { err: err.message }; continue; }
  for (const k of scene.children.slice(s0)) g.add(k);
  g.traverse(o => { if (o.isMesh && o.geometry) { meshes++; const ge = o.geometry; tris += (ge.index ? ge.index.count : ge.attributes.position.count) / 3; mats.add(o.material.uuid); } });
  res[e.id] = { tris: Math.round(tris), meshes, mats: mats.size }; } return res; };`;
const { url, close } = serve(8980 + Math.floor(Math.random() * 15), { patch: (u, d) => u.endsWith('/library/library.js') ? Buffer.concat([d, Buffer.from(extra)]) : undefined });
const b = await chromium.launch(launchOpts()), p = await b.newPage({ viewport: { width: 1200, height: 800 } });
await p.goto(url + 'ltm-engine/library/index.html'); await p.waitForFunction(() => window.__library && window.__library.done, null, { timeout: 580000, polling: 500 });
const cards = await p.evaluate(() => [...document.querySelectorAll('#grid .card')].map(el => ({ id: el.dataset.id, kind: el.dataset.kind, town: el.dataset.town, size: el.dataset.size, label: el.querySelector('.lb').textContent, origin: el.querySelector('.or').textContent, us: el.querySelector('.us').textContent, img: el.querySelector('img').src })));
const stats = await p.evaluate(() => window.__objStats());
for (const c of cards) { fs.writeFileSync(path.join(out, c.id + '.jpg'), Buffer.from(c.img.split(',')[1], 'base64')); delete c.img; c.stats = stats[c.id];
  const m = /\+(\d+) more/.exec(c.us); c.uses = /not used/.test(c.us) ? 0 : 1 + (m ? +m[1] : 0); delete c.us; }
fs.writeFileSync(path.join(out, 'cards.json'), JSON.stringify(cards, null, 1));
fs.writeFileSync(path.join(out, 'sheet.html'), `<!doctype html><meta charset="utf-8"><title>Object library sheet</title><style>body{font:11px sans-serif;margin:8px;display:grid;grid-template-columns:repeat(auto-fill,170px);gap:6px}figure{margin:0}img{width:170px;height:128px;display:block}b{color:#900;font-weight:normal}</style>` +
  cards.map(c => `<figure><img src="${c.id}.jpg"><figcaption>${c.id}<br><b>${c.stats.tris ?? '?'} tris · used ${c.uses} · ${c.kind}</b></figcaption></figure>`).join(''));
console.log(`${cards.length} objects -> ${out} (cards.json, sheet.html)`);
console.log('heaviest: ' + cards.slice().sort((a, b) => (b.stats.tris || 0) - (a.stats.tris || 0)).slice(0, 12).map(c => `${c.id} ${c.stats.tris}`).join(', '));
await b.close(); close();
