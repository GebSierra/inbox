# James: what's built, what's next (hand-off for a new chat)

Live: https://gebsierra.github.io/inbox/james-ltm/ · object library: https://gebsierra.github.io/inbox/ltm-engine/library/
Read first: `ltm-engine/HANDOFF.md`, `ltm-engine/docs/METHOD.md` (the owner's memorization method: fixed), `RULES.md`, `LESSONS.md`, `docs/UPGRADING_OBJECTS.md`, `james-ltm/INSTRUCTIONS.md` (the owner's instructions, quoted; append every new one).

## State
- One shared engine in `ltm-engine/`; James keeps `index.html`, `town.json` (settings, theme, parts list, `"built": 1`), `world/` (terrain, gate, agora, harbour, town, tutorial), `books/james.json`, `refs/`, `tests/baseline/`.
- Chapter 1 (the agora, 6 rooms: Gate Stoa, Tower of the Winds, Tholos, Lamp Stoa, Mirror Court, Almshouse Portico) is built from `books/james.json`. Chapters 2–5 are TODO placeholders in the same format: 2 The Synagogue Courtyard (6 rooms, 26 verses), 3 The Craftsmen's Street (4 rooms, 18), 4 The Harbour Warehouses (4 rooms, 17), 5 The Farm & Vineyard (4 rooms, 20). The owner approved these districts. `"built"` must be raised as chapters are added.
- Reference images exist for rooms 1.1–1.4 only (`refs/`). Missing: 1.5 Mirror Court, 1.6 Almshouse Portico, and all of chapters 2–5. Prompt template: `ltm-engine/docs/REFERENCE_PROMPTS.md`; the owner generates the images and sends them.
- Not done: `verses.json` (ESV text, the owner will supply it later), critic scores for chapter 1, learner test.
- Owner's step-4 trial (faster ways to build the Mirror Court: AI image-to-3D objects, painted sky panorama, paint-over of the stop view) is waiting on his images/models; prompts were already given to him.

## How to work (non-negotiable)
1. Follow the method exactly: rote first; one district per chapter; rooms of five verses, each on an object; order near-left, far-left, far-right, near-right, centre (centre = middle of the square); rooms run clockwise from the entrance, starting on the left; learners make their own images (at most one or two examples); ESV.
2. Plan each new district first: layout from real site plans (see `docs/LAYOUT_RESEARCH.md`; research synagogue, workshop street, harbour, farm and add a section), room list, five objects per room, reference prompts. STOP and wait for the owner's approval of the layout and room names before building; ask him for a layout sketch over a bird's-eye screenshot. He fixes the layout by sketch, not description.
3. Write the rooms into `books/james.json` (kind "vignette": `at`, `viewer`, five objects with library ids), then run `node ltm-engine/tools/validate-book.mjs james-ltm/books/james.json` (use `--strict` before building). Reuse library objects where they fit; build new objects as library entries in their own `ltm-engine/objects/up-<name>.js`; never copy town code.
4. Every change: `flock /tmp/ltm-browser.lock node ltm-engine/tests/fast.mjs all` (about 30 s) must pass. Look at real screenshots from each stop (`?notut`, `window.__snap(i)` is 0-based, wait about 20 s, software GL is slow) and fix what looks wrong. Phone first: keep triangles and draw calls low.
5. Layout fixes: change `at`/`viewer` in the book and the terrain/building code in `james-ltm/world/`; never edit shared engine files for one town's needs (add a town.json option instead, default = current behaviour, so Colossae doesn't change). Check Colossae still passes (`fast.mjs all` covers both).
6. Never call `R()` in new code (seeded layout). Never change how the town looks beyond what the owner asked; his taste beats the critic. Colossae must stay as is.
7. Use cheaper sub-agents for self-contained work (props, critic runs); wrap browser commands in `flock`; one AI per file at a time; `git pull --rebase` before pushing; push in batches (GitHub Pages feeds Cloudflare) and always give the links; spell "practice" with a c.
8. Critic: `docs/CRITIC_RUBRIC.md`, blind sub-agent, 3 runs averaged. Record real scores.
