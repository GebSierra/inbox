// Phone performance report for a town: what it downloads, how long it takes to build, and what it draws every frame.
//   node ltm-engine/tools/perf.mjs <town-folder> [<town-folder> ...]
// Opens <town>/index.html?notut in headless Chromium with a phone viewport (412×839, touch) and prints:
//   download   requests and bytes (raw and gzipped, as GitHub Pages would send them), grouped by kit / models / code
//   build      time to window.__ready and the slowest parts (each part is time-stamped as it starts)
//   per frame  draw calls and triangles at the first stop, with the shadow pass and without it
//   scene      meshes by kind (merged / dyn / transparent / vertexColor / skinned), point lights, shader programs, texture memory
// Nothing in the repository is changed: the time stamps and the renderer hook are patched into the served copies only.
// Headless software GL is slow, so the frame RATE here means nothing: compare draw calls, triangles, megabytes and programs
// before and after a change, and measure the frame rate on a real phone with ?fps.
import { chromium, launchOpts } from './pw.mjs'; import { serve } from './serve.mjs'; import zlib from 'zlib';
const towns = process.argv.slice(2); if (!towns.length) { console.error('usage: node ltm-engine/tools/perf.mjs <town-folder> [...]'); process.exit(2); }
const { url, close } = serve(8940 + Math.floor(Math.random() * 40), { patch: (u, d) => {
  if (!/\/(engine|objects|world)\/[\w-]+\.js$/.test(u) || /town-ne|james-1[ab]/.test(u)) return;   // (those two are real ES modules, not parts)
  return Buffer.concat([Buffer.from(`(globalThis.__pt ??= []).push(['${u.split('/').slice(-2).join('/')}', performance.now()]);`), d,
    Buffer.from(/finish\.js$/.test(u) ? '\nwindow.__renderer = renderer; window.__sun = sun; globalThis.__pt.push(["END", performance.now()]);' : '')]); } });
const b = await chromium.launch(launchOpts());
for (const town of towns) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 839 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage(), reqs = [], pending = [];
  p.on('requestfinished', q => pending.push((async () => { try { const r = await q.response(), ct = r.headers()['content-type'] || '', n = (await q.sizes()).responseBodySize; let gz = n;
    if (/javascript|json|html|css|gltf\+json/.test(ct)) { try { gz = zlib.gzipSync(await r.body()).length; } catch (e) {} } reqs.push({ u: q.url().replace(url, ''), n, gz }); } catch (e) {} })()));
  const t0 = Date.now(); await p.goto(url + town + '/index.html?notut'); await p.waitForFunction(() => window.__ready, null, { timeout: 280000 }); const ready = Date.now() - t0;
  await p.waitForTimeout(2500);
  const info = await p.evaluate(async () => { const R = window.__renderer, sc = window.__scene, sun = window.__sun;
    // draw calls and triangles of ONE frame: accumulate over a few frames and divide by the frames the loop really drew (window.__fc)
    const grab = async () => { R.info.autoReset = false; R.info.reset(); const f0 = window.__fc; await new Promise(r => setTimeout(r, 1500)); const n = Math.max(1, window.__fc - f0), o = { calls: Math.round(R.info.render.calls / n), tris: Math.round(R.info.render.triangles / n) }; R.info.autoReset = true; return o; };
    window.__snap(0); await new Promise(r => setTimeout(r, 1500)); const withShadow = await grab();
    sun.shadow.autoUpdate = false; await new Promise(r => setTimeout(r, 400)); const noShadow = await grab(); sun.shadow.autoUpdate = true;
    const kinds = {}, mats = new Set(), texs = new Set(); let plights = 0, casters = 0;
    sc.traverse(o => { if (o.isPointLight) plights++; if (!o.isMesh) return; const g = o.geometry, t = (g.index ? g.index.count : g.attributes.position.count) / 3, m = o.material; mats.add(m); if (o.castShadow) casters++;
      const k = o.matrixAutoUpdate === false && !o.userData.dyn ? 'merged' : o.isSkinnedMesh ? 'skinned' : o.userData.dyn ? 'dyn' : m.transparent ? 'transparent' : g.attributes.color ? 'vertexColor' : 'other';
      (kinds[k] ??= { meshes: 0, tris: 0 }).meshes++; kinds[k].tris += Math.round(t); });
    const all = [sc, window.__labelScene]; for (const s of all) s.traverse(o => { if (o.material) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) if (o.material[k] && o.material[k].image) texs.add(o.material[k]); });
    let px = 0; for (const t of texs) px += (t.image.width || 0) * (t.image.height || 0);
    return { withShadow, noShadow, kinds, materials: mats.size, shadowCasters: casters, pointLights: plights, programs: R.info.programs.length, textures: texs.size, textureMB: Math.round(px * 4 * 1.33 / 1e6), pixelRatio: R.getPixelRatio(), shadowMap: sun.shadow.mapSize.x, pt: globalThis.__pt }; });
  await Promise.all(pending);
  const tot = reqs.reduce((a, r) => a + r.n, 0), gz = reqs.reduce((a, r) => a + r.gz, 0), grp = {};
  for (const q of reqs) { const k = q.u.includes('/kit/') ? 'kit' : q.u.includes('/models/') ? 'models/' + q.u.split('/models/')[1].split('/')[0] : q.u.includes('three.module') ? 'three.js' : q.u.includes('/addons/') ? 'addons' : /\.js$/.test(q.u) ? 'parts' : 'other'; (grp[k] ??= { n: 0, gz: 0 }).n++; grp[k].gz += q.gz / 1024; }
  const pt = info.pt, steps = []; for (let i = 0; i < pt.length - 1; i++) steps.push([pt[i][0], Math.round(pt[i + 1][1] - pt[i][1])]);
  console.log(`\n== ${town} ==`);
  console.log(`download   ${reqs.length} requests, ${(tot / 1048576).toFixed(1)} MB raw, ${(gz / 1048576).toFixed(1)} MB gzipped  |  ` + Object.entries(grp).sort((a, b) => b[1].gz - a[1].gz).map(([k, v]) => `${k} ${Math.round(v.gz)} KB in ${v.n}`).join(', '));
  console.log(`build      ready in ${(ready / 1000).toFixed(1)} s (finish.js includes the merge and the first frame, which compiles the shaders and uploads the textures)  |  slowest: ` + steps.sort((a, b) => b[1] - a[1]).slice(0, 5).map(s => `${s[0]} ${s[1]} ms`).join(', '));
  console.log(`per frame  ${info.withShadow.calls} draw calls, ${(info.withShadow.tris / 1e6).toFixed(2)} M triangles  |  without the shadow pass: ${info.noShadow.calls} calls, ${(info.noShadow.tris / 1e6).toFixed(2)} M triangles`);
  console.log(`scene      ` + Object.entries(info.kinds).map(([k, v]) => `${k} ${v.meshes} meshes / ${Math.round(v.tris / 1000)}k tris`).join(', ') + `  |  ${info.materials} materials, ${info.shadowCasters} shadow casters, ${info.pointLights} point lights, ${info.programs} shader programs, ${info.textures} textures ≈ ${info.textureMB} MB on the GPU, pixel ratio ${info.pixelRatio}, shadow map ${info.shadowMap}`);
  await ctx.close();
}
await b.close(); close();
