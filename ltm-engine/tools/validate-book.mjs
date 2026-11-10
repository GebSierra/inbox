// Validate a book file against the LTM method. Usage: node ltm-engine/tools/validate-book.mjs james-ltm/books/james.json
import fs from 'fs';
const f = process.argv[2], STRICT = process.argv.includes('--strict'); const b = JSON.parse(fs.readFileSync(f, 'utf8')); const errs = [];
if (b.translation !== 'ESV') errs.push('translation must be ESV');
const seenDistricts = new Set();
for (const c of b.chapters) {
  const want = Math.ceil(c.verses / 5);
  if (seenDistricts.has(c.district)) errs.push(`ch${c.chapter}: district "${c.district}" reused (one district per chapter)`); seenDistricts.add(c.district);
  if (c.rooms.length !== want) errs.push(`ch${c.chapter}: ${c.rooms.length} rooms, expected ceil(${c.verses}/5) = ${want}`);
  c.rooms.forEach((r, i) => {
    const v0 = i * 5 + 1, v1 = Math.min(v0 + 4, c.verses), label = v0 === v1 ? `${c.chapter}:${v0}` : `${c.chapter}:${v0}–${v1}`;
    if (r.room !== i + 1) errs.push(`ch${c.chapter} room ${r.room}: rooms must be numbered 1..n in walking order`);
    if (r.verses !== label) errs.push(`ch${c.chapter} room ${r.room}: verses "${r.verses}", expected "${label}"`);
    if (r.objects.length !== v1 - v0 + 1) errs.push(`ch${c.chapter} room ${r.room}: ${r.objects.length} objects for ${v1 - v0 + 1} verses`);
    const dup = r.objects.filter((o, k) => r.objects.indexOf(o) !== k); if (dup.length) errs.push(`ch${c.chapter} room ${r.room}: duplicate objects ${dup}`);
  });
}
const todo = b.chapters.flatMap(c => c.rooms.filter(r => /TODO/.test(r.name + r.objects.join(' '))).map(r => `${c.chapter}.${r.room}`));
if (todo.length) (STRICT ? errs : { push: m => console.warn('warning: ' + m) }).push(`unfinished rooms (TODO): ${todo.join(', ')}`);
const all = b.chapters.flatMap(c => c.rooms.flatMap(r => r.objects)); const repeats = all.filter((o, k) => all.indexOf(o) !== k);
if (repeats.length) console.warn(`warning: objects repeated across rooms (allowed, but less memorable): ${[...new Set(repeats)].join(', ')}`);
if (errs.length) { console.error(errs.map(e => '✗ ' + e).join('\n')); process.exit(1); }
console.log(`✓ ${b.book}: ${b.chapters.length} chapters, ${b.chapters.reduce((a, c) => a + c.rooms.length, 0)} rooms, method rules satisfied`);
