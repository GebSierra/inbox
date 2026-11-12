# How to upgrade objects in the library (for any AI working on a town)

Read first: `ltm-engine/HANDOFF.md`, `docs/METHOD.md`, `docs/RULES.md`, `LESSONS.md` (section 10). Never change how a town looks without the owner's approval; his taste beats the critic.

## Where things are
- Object library: `ltm-engine/objects/*.js` (registry entries: id, label, origin, kind, tags, builder `(g,x,y,z)=>topY`). Browse it at https://gebsierra.github.io/inbox/ltm-engine/library/.
- Towns build rooms from `<town>/books/<book>.json` and call the library builders, so improving a builder improves every place it is used (both towns).
- Upgrades so far live in `objects/up-a.js` (gate, torch, lamp, altar), `up-b.js` (stalls, cloth, scales, honey), `up-c.js` (people, desk, tablets), `up-d.js` (plants, wreath, bolts, bed), `up-e.js` (seal, well bucket, boat), `up-f.js` (city wall). Put a new batch in its own `up-<name>.js`, prefix every identifier, and add `obj:up-<name>` to the parts list in `colossae-ltm/town.json`, `james-ltm/town.json` and `ltm-engine/library/town.json`.

## The steps
1. Search the whole repo for the object's words. If it is written inline in a town file, move it into the library first (same look) and take the "before" pictures from that.
2. Render before: `flock /tmp/ltm-browser.lock node ltm-engine/tools/angles.mjs <id>[,<id>] --out <dir> --tag before`, then look at the picture (front, right, back, left, top).
3. Diagnose the structural fault before adding detail (parts drifting apart, solid where it should be hollow, flat with no depth, unrecognizable silhouette, a texture that clashes with its neighbours).
4. Rebuild. Rules: never call `R()` in new code (use a private LCG; if you replace code that used `R()`, draw and discard the same number); keep the id, signature, footprint and top height unless the complaint is about them; keep each object under about 4k triangles and share materials; textures small.
5. Render after, and also look at the real in-town stop camera (`?notut`, `window.__snap(i)`, 0-based, wait about 20 s per shot, software GL is slow).
6. Run `flock /tmp/ltm-browser.lock node ltm-engine/tests/fast.mjs all` (about 30 s) and `node ltm-engine/tools/validate-book.mjs <book>`. Both must pass. Fingerprints (`tools/fingerprint.mjs`) will change where you improved something; that is expected.
7. Neighbours: when one piece gets much better, check what surrounds it (a new gate made the old wall look wrong).
8. `git pull --rebase` before pushing; if another AI changed the same file, compare both versions in town and keep the better one. Push in batches and give the owner the links.

## Parallel work
Use cheaper sub-agents per batch of objects. Wrap every browser command in `flock /tmp/ltm-browser.lock` (parallel browsers crash the machine). One AI at a time per file.

## Per-object options instead of copies
To reuse a library piece in another town with small differences, give the builder optional settings with the old behaviour as the default (example: `cityGate(GZ, {style:'james', inscription, torches, banners...})`), not a copied builder.
