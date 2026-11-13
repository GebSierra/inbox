// Validate a book file against the LTM method and against the object library.
// Usage: node ltm-engine/tools/validate-book.mjs james-ltm/books/james.json [--strict]
//   --strict  also fails on unfinished rooms (TODO), which are otherwise only warnings
// The library ids are read by static parsing (no browser needed): every  defObject('id', ...)  and registry line  T(<builder>, 'id', ...)
// in ltm-engine/objects/*.js and the town's world/*.js; custom room builders from  defBuilder('town.name', ...);  anchors from  defAnchor('name', ...).
// (The library preview page, ltm-engine/library/, lists the same registry live.)
import fs from 'fs'; import path from 'path';
const f = process.argv[2], STRICT = process.argv.includes('--strict');
if (!f) { console.error('usage: validate-book.mjs <book.json> [--strict]'); process.exit(2); }
const b = JSON.parse(fs.readFileSync(f, 'utf8')); const errs = [], warns = [];
const ENGINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TOWN = path.resolve(path.dirname(f), '..');            // <town>/books/<book>.json -> <town>

// ---- the registry, by static parsing ----
const sources = [];
for (const dir of [path.join(ENGINE, 'objects'), path.join(ENGINE, 'engine'), path.join(TOWN, 'world')]) { if (!fs.existsSync(dir)) continue; for (const n of fs.readdirSync(dir)) if (n.endsWith('.js')) sources.push(path.join(dir, n)); }
const OBJ = new Set(), BUILD = new Set(), ANCH = new Set();
for (const s of sources) { const t = fs.readFileSync(s, 'utf8');
  for (const m of t.matchAll(/\bdefObject\(\s*'([a-z0-9-]+)'/g)) OBJ.add(m[1]);
  for (const m of t.matchAll(/^\s*T\(\s*[^,]+,\s*'([a-z0-9-]+)'/gm)) OBJ.add(m[1]);
  for (const m of t.matchAll(/^[ \t]*T\([\s\S]*?,\s*'([a-z0-9-]+)',\s*'[^']*',\s*'(?:colossae|james|engine)[^']*',\s*'(?:object|person|plant|animal|structure|effect)'/gm)) OBJ.add(m[1]);   // library entries with a kind: T(builder, id, label, origin, kind, tags)
  for (const m of t.matchAll(/\bdefBuilder\(\s*'([\w.-]+)'/g)) BUILD.add(m[1]);
  for (const m of t.matchAll(/\bdefAnchor\(\s*'([\w-]+)'/g)) ANCH.add(m[1]); }

const DAIS = ['stone', 'low', 'planks', 'pier', 'stones', 'rug', 'none'];
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const posOk = p => (Array.isArray(p) && p.length === 2 && p.every(isNum)) || (p && typeof p === 'object' && typeof p.from === 'string' && (p.dx === undefined || isNum(p.dx)) && (p.dz === undefined || isNum(p.dz)));
const posAnchors = p => p && p.from ? [p.from] : [];
function checkPos(tag, name, p) { if (!posOk(p)) { errs.push(`${tag}: "${name}" must be [x, z] or { "from": anchor, "dx", "dz" }`); return; } for (const a of posAnchors(p)) if (!ANCH.has(a)) errs.push(`${tag}: "${name}" uses unknown anchor "${a}" (no defAnchor('${a}', ...) in ltm-engine or ${path.basename(TOWN)}/world)`); }
function checkNum(tag, name, v) { if (isNum(v)) return; if (v && typeof v === 'object' && v.ground !== undefined) { checkPos(tag, name + '.ground', v.ground); if (v.plus !== undefined && !isNum(v.plus)) errs.push(`${tag}: "${name}.plus" must be a number`); return; } errs.push(`${tag}: "${name}" must be a number or { "ground": position, "plus": number }`); }
function checkLayout(tag, lay) {
  if (lay === undefined) return; if (!lay || typeof lay !== 'object' || Array.isArray(lay)) { errs.push(`${tag}: layout must be an object`); return; }
  for (const [k, v] of Object.entries(lay)) {
    if (k === 'dais') { if (!DAIS.includes(v)) errs.push(`${tag}: layout.dais "${v}" is not one of ${DAIS.join(', ')}`); }
    else if (k === 'spread') { if (!(Array.isArray(v) && v.length === 2 && v.every(isNum))) errs.push(`${tag}: layout.spread must be [x, z]`); }
    else if (k === 'big') { if (!isNum(v)) errs.push(`${tag}: layout.big must be a number`); }
    else if (k === 'rug') { if (typeof v !== 'string') errs.push(`${tag}: layout.rug must be a colour string`); }
    else if (k === 'minY') checkNum(tag, 'layout.minY', v);
    else errs.push(`${tag}: unknown layout option "${k}"`); } }
// spots and objects of one room (or of its fallback). Returns the count of entries that carry a verse.
// Method rule 4 ("each verse on a spot", 2026-11-12): an entry is either an OBJECT (an "id" from the library, or a "centre" piece) or a
// PLACE spot ("place": true: a feature of the place itself, a doorway, a corner of a wall, a step; it has no id). Entries marked "extra"
// stand in the room without a verse (natural furnishings). Every room needs at least two objects, verse-carrying or extra.
function checkObjects(tag, list, { todoOk }) {
  if (!Array.isArray(list) || !list.length) { errs.push(`${tag}: no spots`); return 0; }
  const verse = list.filter(o => o && !o.extra);
  if (verse.length > 5) errs.push(`${tag}: ${verse.length} verse spots (a room has at most 5)`);
  let seenExtra = false;
  list.forEach((o, i) => { const t = `${tag} spot ${i + 1}`;
    if (!o || typeof o !== 'object' || typeof o.what !== 'string' || !o.what) { errs.push(`${t}: needs a "what" label`); return; }
    if (o.place !== undefined) { if (o.place !== true) errs.push(`${t}: place must be true`); if (o.id !== undefined) errs.push(`${t}: a place spot has no "id" (it is part of the place)`); if (o.extra) errs.push(`${t}: a place spot always carries a verse`); }
    if (o.id !== undefined) { if (typeof o.id !== 'string') errs.push(`${t}: id must be a string`); else if (o.id === 'TODO') { if (!todoOk) errs.push(`${t}: id "TODO"`); } else if (!OBJ.has(o.id)) errs.push(`${t}: unknown object id "${o.id}" (not registered in the object library)`); }
    if (o.centre !== undefined) { if (o.id !== undefined) errs.push(`${t}: a centrepiece has "centre", not an "id"`); checkNum(t, 'centre', o.centre); if (i !== 4) errs.push(`${t}: "centre" belongs on the 5th spot`); }
    if (o.args !== undefined && !Array.isArray(o.args)) errs.push(`${t}: args must be an array`);
    if (o.desc !== undefined && typeof o.desc !== 'string') errs.push(`${t}: desc must be a string`);
    if (o.extra !== undefined && o.extra !== true) errs.push(`${t}: extra must be true`);
    if (o.extra) seenExtra = true; else if (seenExtra) errs.push(`${t}: verse spots come first, "extra" objects after them`); });
  const nObj = list.filter(o => o && !o.place).length;
  if (nObj < 2 && !todoOk) errs.push(`${tag}: ${nObj} object(s); every room has at least two objects, natural to the place (method rule 4)`);
  const dup = list.map(o => o.desc ?? o.what).filter((o, k, a) => a.indexOf(o) !== k); if (dup.length) errs.push(`${tag}: duplicate spots ${dup}`);
  return verse.length; }

if (b.translation !== 'ESV') errs.push('translation must be ESV');
const seenDistricts = new Set(), todo = [];
let nCustom = 0, nVig = 0;
for (const c of b.chapters) {
  const want = Math.ceil(c.verses / 5);
  if (seenDistricts.has(c.district)) errs.push(`ch${c.chapter}: district "${c.district}" reused (one district per chapter)`); seenDistricts.add(c.district);
  if (c.rooms.length !== want) (c.partial && c.rooms.length < want ? warns : errs).push(`ch${c.chapter}: ${c.rooms.length} rooms, expected ceil(${c.verses}/5) = ${want}`);
  checkLayout(`ch${c.chapter} layout`, c.layout);
  c.rooms.forEach((r, i) => {
    const v0 = i * 5 + 1, v1 = Math.min(v0 + 4, c.verses), cn = c.chapter + (b.chOffset || 0), label = v0 === v1 ? `${cn}:${v0}` : `${cn}:${v0}–${v1}`, tag = `ch${c.chapter} room ${r.room}`;
    if (r.room !== i + 1) errs.push(`${tag}: rooms must be numbered 1..n in walking order`);
    if (r.verses !== label) errs.push(`${tag}: verses "${r.verses}", expected "${label}"`);
    const unfinished = /TODO/.test(r.name + JSON.stringify(r.objects)); if (unfinished) todo.push(`${c.chapter}.${r.room}`);
    const kind = r.kind ?? 'vignette';
    if (kind !== 'vignette' && kind !== 'custom') errs.push(`${tag}: kind "${r.kind}" must be "vignette" or "custom"`);
    for (const k of ['back', 'pitch', 'bannerLift']) if (r[k] !== undefined && !isNum(r[k])) errs.push(`${tag}: ${k} must be a number`);
    const n = checkObjects(tag, r.objects, { todoOk: unfinished });
    if (n !== v1 - v0 + 1) errs.push(`${tag}: ${n} verse spots for ${v1 - v0 + 1} verses`);
    if (kind === 'custom') { nCustom++;
      if (typeof r.builder !== 'string') errs.push(`${tag}: a custom room needs a "builder"`); else if (!BUILD.has(r.builder)) errs.push(`${tag}: unknown room builder "${r.builder}" (no defBuilder('${r.builder}', ...) in ltm-engine or ${path.basename(TOWN)}/world)`);
      if (r.args !== undefined && (typeof r.args !== 'object' || Array.isArray(r.args))) errs.push(`${tag}: args must be an object`);
      if (r.at !== undefined) checkPos(tag, 'at', r.at);
      if (r.layout !== undefined) errs.push(`${tag}: a custom room has no "layout" (its builder places it); use "fallback" for a plain-vignette fallback`);
      if (r.fallback) { const ft = tag + ' fallback'; checkPos(ft, 'viewer', r.fallback.viewer); checkLayout(ft, r.fallback.layout); checkObjects(ft, r.fallback.objects, { todoOk: false });
        if (r.fallback.at !== undefined) checkPos(ft, 'at', r.fallback.at); if (!r.at && r.fallback.at === undefined) errs.push(`${ft}: needs the room's "at" (or its own)`); } }
    else { nVig++;
      if (r.builder !== undefined || r.args !== undefined) errs.push(`${tag}: "builder"/"args" belong to custom rooms; a vignette is built by the engine`);
      if (r.fallback !== undefined) errs.push(`${tag}: "fallback" belongs to custom rooms`);
      if (!unfinished) { if (r.at === undefined) errs.push(`${tag}: a vignette needs "at": [x, z]`); else checkPos(tag, 'at', r.at); if (r.viewer === undefined) errs.push(`${tag}: a vignette needs "viewer": [x, z]`); else checkPos(tag, 'viewer', r.viewer); checkLayout(tag, r.layout);
        const cs = r.objects.filter(o => o.centre !== undefined); if (cs.length && (r.objects.length < 5 || r.objects[4].centre === undefined)) errs.push(`${tag}: a centrepiece must be the 5th object`); } }
  });
}
if (todo.length) (STRICT ? errs : warns).push(`unfinished rooms (TODO): ${todo.join(', ')}`);
const all = b.chapters.flatMap(c => c.rooms.flatMap(r => r.objects.filter(o => !o.extra && !o.place).map(o => o.desc ?? o.what))); const repeats = all.filter((o, k) => all.indexOf(o) !== k);
if (repeats.length) warns.push(`objects repeated across rooms (allowed, but less memorable): ${[...new Set(repeats)].join(', ')}`);
for (const w of warns) console.warn('warning: ' + w);
if (errs.length) { console.error(errs.map(e => '✗ ' + e).join('\n')); process.exit(1); }
console.log(`✓ ${b.book}: ${b.chapters.length} chapters, ${b.chapters.reduce((a, c) => a + c.rooms.length, 0)} rooms (${nVig} vignette, ${nCustom} custom), method rules satisfied; ${OBJ.size} library objects known`);
