// boot.js: starts a memory-palace town.
//
// A town is a folder with index.html + town.json (+ world/*.js, books/<book>.json). index.html loads this file.
// town.json lists, in order, the PARTS of the program: "ltm:<name>" is a shared part (ltm-engine/engine/<name>.js),
// any other entry is a path relative to the town's page (e.g. "world/terrain.js").
//
// The parts are plain-text JavaScript that share ONE module scope, exactly like the old single app.js. boot.js fetches
// them, joins them in order, and runs the result as one ES module through a blob: URL. So:
//   - bare imports ('three', 'three/addons/...', 'ltm-engine/...', 'ltm-town/...') resolve through the page's import map;
//   - relative imports do NOT work inside parts (a blob has no folder): use 'ltm-engine/' or 'ltm-town/' (the town folder);
//   - asset URLs inside parts must be absolute: engine assets (kit/, models/) via the ENGINE constant;
//     town files (books/..., verses.json) are fetched relative to the page, which is what fetch() does anyway.
// What the shared parts expect a town's own parts to define (top-level const/function in the shared scope):
//   heightAt(x, z)          ground height (world/terrain.js)
//   GZ, TZ                   z of the first room's gate (player start, tutorial) and of the temple (smoke/birds); HX, HZ for house.js's houseRoom
//   RAISED, WALKWAYS         [[cz, halfD, cx, halfW, deckY]...] ground lifts; [[x0, z0, x1, z1]...] boxes kept clear of collision
//   TUT, ESV                 tutorial text (world/tutorial.js)
// and it may set HOOKS.house, push boats to SHIPS, and tune the look with the "theme" block of town.json.
// Errors are mapped back to part + line (the browser only knows the blob), see mapStack() below.
const ENGINE = new URL('./', import.meta.url).href;            // absolute URL of ltm-engine/
const status = msg => { const el = document.getElementById('lpct'); if (el) el.textContent = msg; };
const table = [];                                               // [{ part, start, lines }]: where each part sits in the bundle (1-based lines)

// "bundle line 1234" -> "engine/runtime.js:37"
export function locate(line) { for (const t of table) if (line >= t.start && line < t.start + t.lines) return `${t.part}:${line - t.start + 1}`; return null; }
// rewrite every blob:/sourceURL position in a stack trace
export function mapStack(stack) { return String(stack || '').replace(/(?:blob:[^\s)]*|ltm-bundle\.js):(\d+):(\d+)/g, (m, l, c) => { const w = locate(+l); return w ? `${w}:${c} (bundle ${l})` : m; }); }
globalThis.__ltm = { ENGINE, table, locate, mapStack };

const report = (what, e) => { const m = mapStack(e && e.stack ? e.stack : e), msg = (e && e.message) || String(e);
  console.error(`[ltm] ${what}: ${msg}\n${m}`); };
addEventListener('error', ev => { if (/^blob:|ltm-bundle/.test(ev.filename || '') && ev.lineno) console.error(`[ltm] ${ev.message}  at ${locate(ev.lineno) || 'bundle line ' + ev.lineno}:${ev.colno}`); });
addEventListener('unhandledrejection', ev => { if (/blob:|ltm-bundle/.test(String(ev.reason && ev.reason.stack))) report('unhandled rejection', ev.reason); });

try {
  const cfg = await (await fetch('./town.json')).json();         // relative to the page: the town's own config
  const urlOf = p => p.startsWith('ltm:') ? `${ENGINE}engine/${p.slice(4)}.js` : new URL(p, location.href).href;
  const texts = await Promise.all(cfg.parts.map(async p => { const r = await fetch(urlOf(p)); if (!r.ok) throw new Error(`part ${p}: HTTP ${r.status}`); return r.text(); }));
  let src = '', line = 1;
  texts.forEach((t, i) => { if (!t.endsWith('\n')) t += '\n'; const lines = t.split('\n').length - 1; table.push({ part: cfg.parts[i].replace(/^ltm:(.*)$/, 'engine/$1.js'), start: line, lines }); src += t; line += lines; });
  src += '//# sourceURL=ltm-bundle.js\n';
  globalThis.__LTM = { engine: ENGINE, cfg };                    // read by engine/core.js
  const blob = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  try { await import(blob); } catch (e) { report('startup error', e); status('Something went wrong while building the town (see the console).'); throw e; }
} catch (e) { if (!globalThis.__ltm.failed) { globalThis.__ltm.failed = e; status('Could not load the town: ' + (e.message || e)); } console.error(e); }
