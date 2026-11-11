// ---------- OBJECT LIBRARY + BOOK-DRIVEN ROOMS ----------
// A town's rooms are not placed in code: they are BUILT FROM books/<book>.json (the "book"). This part holds
//   1. the object library registry  (defObject: id -> builder function + label + origin + tags),
//   2. the registry of custom room builders (defBuilder) for rooms that are not a plain five-object vignette,
//   3. anchors (defAnchor): named town positions that a book entry can be placed relative to, e.g. { "from": "house", "dx": -8, "dz": 7 },
//   4. buildRoom(ch, n) / buildRooms(ch): build the book's rooms through the existing room() / station() machinery.
// The world parts of a town still decide WHEN a chapter's rooms are built (buildRooms(2) at the point of the world code where chapter 2's
// scenery has been laid out): the build order is part of the town's look, because every random number is drawn in order.
//
// Room entry in books/<book>.json (see ltm-engine/books/book.schema.json):
//   { "room": 3, "name": "The Tholos", "verses": "1:11–15", "kind": "vignette",          // "vignette" is the default
//     "at": [-11, 41], "viewer": [-4, 41],                                                // x,z of the room and of the viewer; or { "from": anchor, "dx", "dz" }
//     "layout": { "dais": "none", "spread": [1.9, 1.45], "big": 1.25, "minY": 0.3, "rug": "#9a4a3a" },   // optional; chapter.layout gives defaults
//     "back": 5.8, "pitch": -0.2, "bannerLift": 3.4,                                      // optional camera / banner tweaks, applied after the room is built
//     "objects": [ { "id": "scorched-sundial", "what": "scorched sundial in dry grass", "desc": "…", "args": [...] }, ... ] }   // 5 = near-left, far-left, far-right, near-right, centre
//   "what" is the label the learner sees at the spot, "desc" the fuller description the owner approved (optional), "args" extra arguments for the builder.
//   An object marked "extra": true stands in the room but carries no verse (the last room of a chapter can have fewer than five verses).
//   An object with "centre": { "ground": [x, z], "plus": dy } (instead of an id) is the room's centrepiece, placed by the town (statue, altar fire): its marker rests at heightAt(x, z) + dy.
//   { "kind": "custom", "builder": "colossae.marketStall", "args": {...}, "objects": [ { "what": ... } ] }   // the builder (registered by the town part with defBuilder) places the room itself
//   A custom room may carry "fallback": { "viewer", "layout", "objects" }: a plain vignette the builder can ask for (ctx.fallback()) when its special assets are missing.

const OBJECTS = new Map();           // id -> { id, fn, label, origin, tags, args, kind }
const BUILDERS = new Map();          // 'town.name' -> (room, ctx) => void
const ANCHORS = {};                  // name -> [x, z]
const BUILT_ROOMS = new Set();       // 'ch.room' keys built through buildRoom
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KINDS = ['object', 'person', 'plant', 'animal', 'structure', 'effect'];   // what an object library entry is (the library page filters by it)

// A book problem is shown to the learner as well as logged: the loader text keeps the message (boot.js leaves it alone).
function bookError(msg) {
  const m = '[ltm book] ' + msg; console.error(m);
  const el = document.getElementById('lpct'); if (el) el.textContent = m;
  const e = new Error(m); e.ltmMessage = m; throw e;
}
// defObject('bronze-hand-mirror', (g, x, y, z) => topY, { label, origin: 'james 1.5', tags: [...], args: [...default extra arguments], kind: 'object' | 'person' | 'plant' | 'animal' | 'structure' | 'effect' })
function defObject(id, fn, meta = {}) {
  if (!ID_RE.test(id)) throw new Error(`object id "${id}" must be kebab-case`);
  if (OBJECTS.has(id)) throw new Error(`object id "${id}" is registered twice`);
  if (typeof fn !== 'function') throw new Error(`object "${id}": builder is not a function`);
  if (meta.kind !== undefined && !KINDS.includes(meta.kind)) throw new Error(`object "${id}": kind "${meta.kind}" is not one of ${KINDS.join(', ')}`);
  OBJECTS.set(id, { id, fn, label: meta.label || id, origin: meta.origin || '', tags: meta.tags || [], args: meta.args || [], kind: meta.kind || 'object' });
}
function defBuilder(name, fn) { if (BUILDERS.has(name)) throw new Error(`room builder "${name}" is registered twice`); BUILDERS.set(name, fn); }
function defAnchor(name, p) { ANCHORS[name] = p; }

// ---- the book ----
const BOOKDATA = CFG.bookFile ? await (async () => {
  const r = await fetch('./books/' + CFG.bookFile + '.json'); if (!r.ok) bookError(`books/${CFG.bookFile}.json: HTTP ${r.status}`);
  try { return await r.json(); } catch (e) { return bookError(`books/${CFG.bookFile}.json is not valid JSON (${e.message})`); } })() : null;
const bookChapter = ch => BOOKDATA && BOOKDATA.chapters.find(c => c.chapter === ch);
const bookRoom = (ch, n) => { const c = bookChapter(ch); return c && c.rooms.find(r => r.room === n); };
let bookChecked = false;
// every object id named by the book must be in the library: reported all at once, before anything is built
function checkBookObjects() {
  if (bookChecked || !BOOKDATA) return; bookChecked = true; const bad = [];
  for (const c of BOOKDATA.chapters) { if (c.chapter > BUILT) continue;
    for (const r of c.rooms) for (const [where, list] of [['', r.objects], [' (fallback)', r.fallback && r.fallback.objects]])
      (list || []).forEach((o, i) => { if (o.id && !OBJECTS.has(o.id)) bad.push(`${c.chapter}.${r.room} ${r.name}${where}, object ${i + 1}: unknown object id "${o.id}"`); }); }
  if (bad.length) bookError(`${bad.length} unknown object id(s) in books/${CFG.bookFile}.json: ${bad.join('; ')}`);
}

// ---- positions ----
const pos = (s, what) => { if (Array.isArray(s) && s.length === 2) return s;
  if (s && s.from) { const a = ANCHORS[s.from]; if (!a) bookError(`${what}: unknown anchor "${s.from}"`); return [a[0] + (s.dx || 0), a[1] + (s.dz || 0)]; }
  return bookError(`${what}: expected [x, z] or { "from": anchor, "dx", "dz" }`); };
const num = (v, what) => typeof v === 'number' ? v : (v && v.ground ? (([x, z]) => heightAt(x, z) + (v.plus || 0))(pos(v.ground, what)) : bookError(`${what}: expected a number or { "ground": [x, z], "plus": dy }`));

// ---- vignette rooms ----
function objectFn(o, what) {
  const e = OBJECTS.get(o.id); if (!e) bookError(`${what}: unknown object id "${o.id}"`);
  const args = o.args || e.args; return (g, x, y, z) => e.fn(g, x, y, z, ...args);
}
function placeVignette(ch, r, spec = r) {
  const tag = `${ch}.${r.room} ${r.name}`, lay = { ...(bookChapter(ch).layout || {}), ...(spec.layout || {}) };
  if (!spec.objects || !spec.objects.length) bookError(`${tag}: no objects`);
  const at = pos(spec.at || r.at, `${tag} at`), viewer = pos(spec.viewer, `${tag} viewer`);
  const opts = { props: spec.objects.map((o, i) => o.centre ? [null, o.what] : [objectFn(o, `${tag} object ${i + 1}`), o.what]) };
  for (const k of ['dais', 'spread', 'big', 'rug']) if (lay[k] !== undefined) opts[k] = lay[k];
  if (lay.minY !== undefined) opts.minY = num(lay.minY, `${tag} minY`);
  const c = spec.objects.find(o => o.centre); if (c) opts.centre = { top: num(c.centre, `${tag} centre`), what: c.what };
  room(ch, r.room, r.name, at[0], at[1], viewer, opts);
}
const stationOf = (ch, n) => STATIONS.find(s => s.ch === ch && s.room === n);
function buildRoom(ch, n) {
  if (ch > BUILT) return;
  const r = bookRoom(ch, n); if (!r) bookError(`chapter ${ch} room ${n} is not in books/${CFG.bookFile}.json`);
  checkBookObjects();
  const key = `${ch}.${n}`; if (BUILT_ROOMS.has(key)) bookError(`room ${key} ${r.name} is built twice`); BUILT_ROOMS.add(key);
  if (r.kind === 'custom') { const b = BUILDERS.get(r.builder); if (!b) bookError(`${key} ${r.name}: unknown room builder "${r.builder}"`); b(r, { ch, fallback: () => { if (!r.fallback) bookError(`${key} ${r.name}: this custom room has no "fallback"`); placeVignette(ch, r, r.fallback); } }); }
  else if (!r.kind || r.kind === 'vignette') placeVignette(ch, r);
  else bookError(`${key} ${r.name}: unknown room kind "${r.kind}"`);
  const st = stationOf(ch, n); if (!st) bookError(`${key} ${r.name}: nothing was built`);
  if (st.name !== r.name) bookError(`${key}: built as "${st.name}", the book says "${r.name}"`);
  if (r.back !== undefined) st.back = r.back; if (r.pitch !== undefined) st.pitch = r.pitch;
  if (r.bannerLift && st.banner) st.banner.position.y += r.bannerLift;
}
// buildRooms(ch) builds every room of the chapter in the book's order; buildRooms(ch, from, to) only rooms from..to (when a bit of the town's
// own scenery has to be laid out between two rooms, in the same order as it always was).
function buildRooms(ch, from = 1, to = Infinity) { const c = bookChapter(ch); if (!c) { if (ch > BUILT) return; bookError(`chapter ${ch} is not in books/${CFG.bookFile}.json`); } for (const r of c.rooms) if (r.room >= from && r.room <= to) buildRoom(ch, r.room); }
