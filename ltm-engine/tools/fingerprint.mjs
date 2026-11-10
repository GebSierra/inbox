// Scene fingerprint: proves a refactor changed nothing the learner can see.
// Usage:  node ltm-engine/tools/fingerprint.mjs <town-folder> [--out file.json] [--raf] [--root dir]
//         node ltm-engine/tools/fingerprint.mjs --diff a.json b.json
// Serves the repository root, opens <town>/index.html?notut&fast, waits for window.__ready, then (with the
// animation loop frozen, so ships/water/fire cannot move between runs) fingerprints in the page:
//   every Mesh / Points / Line / Sprite in `scene` and `labelScene`: material (type, name, colour hex, emissive,
//   opacity, ...), texture checksum, geometry vertex/index count, world bounding box (rounded 0.01), a checksum
//   of the world-space vertex positions and vertex colours; all lights, fog, tone mapping; JSON of window.__dump()
//   and window.__bookCheck; the collision grid; __blockers(); __crates.
// The rows are sorted, so insertion order does not matter. Prints sha256 of everything plus one hash per section.
// If the page has no `window.__scene` hook (old monolith), the server appends the 1-line hook to engine/app.js.
import fs from 'fs'; import crypto from 'crypto'; import path from 'path';
import { serve, REPO } from './serve.mjs'; import { chromium } from './pw.mjs';

const args = process.argv.slice(2);
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
if (args[0] === '--diff') {
  const [A, B] = args.slice(1).map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  for (const k of Object.keys(A.sections)) { const same = A.sections[k].hash === B.sections[k]?.hash; console.log(`${same ? 'same ' : 'DIFF '} ${k}  ${A.sections[k].hash.slice(0, 12)}  ${B.sections[k]?.hash.slice(0, 12)}`);
    if (!same && Array.isArray(A.sections[k].data)) { const a = new Set(A.sections[k].data.map(x => JSON.stringify(x))), b = new Set((B.sections[k]?.data || []).map(x => JSON.stringify(x)));
      const onlyA = [...a].filter(x => !b.has(x)), onlyB = [...b].filter(x => !a.has(x)); console.log(`   only in A: ${onlyA.length}, only in B: ${onlyB.length}`); onlyA.slice(0, 6).forEach(x => console.log('   A ' + x.slice(0, 300))); onlyB.slice(0, 6).forEach(x => console.log('   B ' + x.slice(0, 300))); } }
  console.log(A.sha256 === B.sha256 ? 'IDENTICAL' : 'DIFFERENT'); process.exit(A.sha256 === B.sha256 ? 0 : 1);
}
const opt = k => args.includes(k) ? args[args.indexOf(k) + 1] : null;
const town = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--out', '--root'].includes(args[i - 1])));
const outFile = opt('--out'), root = opt('--root') ? path.resolve(opt('--root')) : REPO;
const RAF = args.includes('--raf');
if (!town) { console.error('usage: fingerprint.mjs <town-folder> [--out f.json]'); process.exit(2); }

const HOOK = '\nwindow.__scene = scene; window.__labelScene = labelScene; window.__CG = CG;\n';
const patch = (u, d) => (u === `/${town}/engine/app.js` && !d.includes('window.__scene')) ? Buffer.concat([d, Buffer.from(HOOK)]) : undefined;
const port = 8800 + Math.floor(Math.random() * 150);
const { url, close } = serve(port, { root, patch });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const pageErrors = [], consoleErrors = [], failed = [], bad = [];
page.on('pageerror', e => pageErrors.push(e.message + (e.stack ? '\n' + e.stack.split('\n').slice(0, 4).join('\n') : '')));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
const okUrls = new Set(), abortedUrls = new Set();
page.on('requestfailed', r => abortedUrls.add(r.url() + ' ' + (r.failure()?.errorText || '')));
page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); else okUrls.add(r.url()); });
if (!RAF) await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
const t0 = Date.now();
await page.goto(`${url}${town}/index.html?notut&fast`, { timeout: 150000 });
await page.waitForFunction(() => window.__ready, null, { timeout: 280000, polling: 250 }).catch(e => { console.error('never became ready:', e.message); });
// the book check is a fetch that settles after __ready
await page.waitForFunction(() => window.__bookCheck !== undefined, null, { timeout: 30000, polling: 250 }).catch(() => {});
console.log(`ready in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

const sections = await page.evaluate(() => {
  const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
  const hex = c => c && c.getHexString ? c.getHexString() : null;
  const texSum = t => { if (!t) return null; const im = t.image; if (!im) return 'noimage'; try { if (im instanceof HTMLCanvasElement) { const d = im.getContext('2d').getImageData(0, 0, im.width, im.height).data; let s = 0, w = 0; for (let i = 0; i < d.length; i += 4) { s += d[i] + d[i + 1] * 3 + d[i + 2] * 5 + d[i + 3] * 7; w = (w * 31 + d[i] + d[i + 2]) % 1000003; } return `canvas${im.width}x${im.height}:${s}:${w}`; } return `img${im.width || im.videoWidth || 0}x${im.height || 0}:${t.name || ''}`; } catch (e) { return 'err'; } };
  const matDesc = m => { if (!m) return 'none'; if (Array.isArray(m)) return m.map(matDesc).join('|');
    const u = m.uniforms ? Object.keys(m.uniforms).sort().map(k => { const v = m.uniforms[k].value; return k + '=' + (v && v.getHexString ? v.getHexString() : (typeof v === 'number' ? r3(v) : '')); }).join(',') : '';
    return [m.type, m.name || '', hex(m.color), hex(m.emissive), m.emissiveIntensity, m.opacity, m.transparent, m.side, m.roughness, m.metalness, m.flatShading, m.vertexColors, m.depthTest, m.depthWrite, m.visible, texSum(m.map), u].join('~'); };
  const rowsFor = (root, tag) => { root.updateMatrixWorld(true); const rows = [];
    root.traverse(o => {
      if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return;
      let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) vis = false;
      const e = o.matrixWorld.elements; let n = 0, idx = 0, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], sx = 0, sy = 0, sz = 0, sc = 0;
      const g = o.geometry; const p = g && g.attributes && g.attributes.position;
      if (p) { n = p.count; idx = g.index ? g.index.count : 0; const a = p.array, st = p.itemSize || 3;
        for (let i = 0; i < n; i++) { const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
          const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
          if (wx < mn[0]) mn[0] = wx; if (wy < mn[1]) mn[1] = wy; if (wz < mn[2]) mn[2] = wz; if (wx > mx[0]) mx[0] = wx; if (wy > mx[1]) mx[1] = wy; if (wz > mx[2]) mx[2] = wz; sx += wx; sy += wy; sz += wz; }
        const c = g.attributes.color; if (c) for (let i = 0; i < c.array.length; i++) sc += c.array[i] * ((i % 7) + 1); }
      else { mn = [e[12], e[13], e[14]]; mx = mn; sx = e[12]; sy = e[13]; sz = e[14]; }
      rows.push([tag, o.type, g ? g.type : '', matDesc(o.material), n, idx, mn.map(r2).join(','), mx.map(r2).join(','), r2(sx) + ',' + r2(sy) + ',' + r2(sz), r2(sc), vis ? 1 : 0, o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0, o.userData && o.userData.dyn ? 1 : 0, o.renderOrder, o.isSprite ? [r3(e[0]), r3(e[5])].join(',') : ''].join(' | ')); });
    return rows.sort(); };
  const lights = []; for (const [tag, root] of [['scene', window.__scene], ['labels', window.__labelScene]]) root.traverse(o => { if (o.isLight) { const e = o.matrixWorld.elements; lights.push([tag, o.type, hex(o.color), hex(o.groundColor), r3(o.intensity), r3(o.distance || 0), r3(o.decay || 0), o.castShadow ? 1 : 0, r2(e[12]) + ',' + r2(e[13]) + ',' + r2(e[14])].join(' | ')); } }); lights.sort();
  const sc = window.__scene, fog = sc.fog ? [sc.fog.type, hex(sc.fog.color), sc.fog.near, sc.fog.far].join(',') : 'none';
  const cells = window.__CG ? window.__CG.cells : null; let cg = null; if (cells) { let h = 0, c = 0; for (let i = 0; i < cells.length; i++) if (cells[i]) { c++; h = (h * 31 + i) % 2147483629; } cg = { n: cells.length, filled: c, h }; }
  // collision also through the public hook, on a 2-unit lattice
  let bl = 0, bh = 0; if (window.__blockedAt) for (let z = -120; z <= 120; z += 2) for (let x = -120; x <= 120; x += 2) if (window.__blockedAt(x, z)) { bl++; bh = (bh * 31 + (x + 200) * 1000 + z + 200) % 2147483629; }
  const out = {
    scene: rowsFor(sc, 'S'), labels: window.__labelScene ? rowsFor(window.__labelScene, 'L') : [],
    lights, env: [fog, JSON.stringify(sc.background && sc.background.getHexString ? sc.background.getHexString() : null), window.__renderInfo || ''].join(' ; '),
    dump: window.__dump ? JSON.parse(JSON.stringify(window.__dump())) : null, bookCheck: window.__bookCheck === undefined ? 'unset' : window.__bookCheck,
    collision: [cg, { lattice: bl, bh }], blockers: window.__blockers ? window.__blockers() : null, crates: window.__crates ? JSON.stringify(window.__crates) : null,
    state: window.__state ? window.__state() : null };
  return out; });

for (const f of abortedUrls) if (!okUrls.has(f.split(' ')[0])) failed.push(f);   // an aborted duplicate of a URL that did load is not a failure
const sec = {}; for (const [k, v] of Object.entries(sections)) sec[k] = { hash: sha(JSON.stringify(v)), data: v };
const sha256 = sha(Object.keys(sec).sort().map(k => k + ':' + sec[k].hash).join('\n'));
const result = { town, sha256, counts: { scene: sections.scene.length, labels: sections.labels.length, lights: sections.lights.length }, pageErrors, consoleErrors, failedRequests: failed, httpErrors: bad, sections: sec };
if (outFile) fs.writeFileSync(outFile, JSON.stringify(result));
console.log(`${town}: sha256 ${sha256}`); for (const k of Object.keys(sec)) console.log(`  ${k.padEnd(10)} ${sec[k].hash.slice(0, 16)}${Array.isArray(sec[k].data) ? '  (' + sec[k].data.length + ' rows)' : ''}`);
console.log(`  page errors: ${pageErrors.length}  console errors: ${consoleErrors.length}  failed requests: ${failed.length}  http >= 400: ${bad.length}`);
pageErrors.slice(0, 5).forEach(e => console.log('  pageerror: ' + e)); consoleErrors.slice(0, 8).forEach(e => console.log('  console.error: ' + e)); failed.slice(0, 8).forEach(e => console.log('  failed: ' + e)); bad.slice(0, 8).forEach(e => console.log('  http: ' + e));
await browser.close(); close();
