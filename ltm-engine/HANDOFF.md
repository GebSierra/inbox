# Build an LTM for another book (start here)

You're building a **location-triggered memory palace (LTM)** for a book of the Bible (next up: **James**), in the style of `colossae-ltm/`. Copy this folder and work through these steps in order.

## 1. Read (15 min)
1. `docs/METHOD.md`: the owner's memorization method. **Non-negotiable**; confirm it with the owner first.
2. `docs/RULES.md`: every correction the owner made on Colossae, as rules. Don't repeat them.
3. `docs/POSTMORTEM.md`: what got reworked most and the preventive rules (M0, V1–V3, U1, N1, P1, W1).
4. `docs/LAYOUT_RESEARCH.md`: Greek house (oikos) and agora plans to base districts on. For other districts (synagogue, harbour, farm), research and add a section before you plan them.
5. `docs/CRITIC_RUBRIC.md` and `docs/LEARNER_PROTOCOL.md`: how the work is judged.

## 2. Plan the book (before any 3D)
1. Copy `books/james.json` (already split into rooms: 27, 26, 18, 17 and 20 verses give 6, 6, 4, 4 and 4 rooms) and replace the `TODO` names and objects.
2. **Stop and wait** for the owner's approval of the districts before naming rooms and objects. Ask for a **layout sketch** over a bird's-eye screenshot, and confirm the district per chapter and the clockwise room order.
3. Run `node tools/validate-book.mjs books/james.json` until it passes (it warns when objects repeat across rooms). Use `--strict` before building, so that any `TODO` left in the file fails. Verse text comes from `verses.json` (ESV), which the owner supplies.
4. For every room, fill in `docs/REFERENCE_PROMPTS.md`. The owner generates the images; save them as `refs/<ch>-<room>.png`.

## 3. Build (reuse; don't rebuild)
- **App:** `index.html` (markup and import map), `engine/app.css` and `engine/app.js` (three.js r170 ES module, no build step). `engine/app.js` is organised in this order: terrain → town → props `P.*` → rooms → navigation → tutorial → test hooks. At load it checks `books/colossians.json` against the rooms it built (`window.__bookCheck` lists any mismatches). **For James:** copy the folder, write `books/james.json`, then replace the room-building section (`room(...)` / `station(...)` calls) to match it. The props, interiors, stalls, navigation, tutorial and tests are reused unchanged.
- **Rooms:** `room(ch, n, name, x, z, viewerXZ, {props:[[P.fn,'object']×5], spread, big, centre})` places five objects in the clockwise square. `station()` registers the gems, banner and framing (`.back`, `.pitch`).
- **Stalls:** `gstallFrame()` plus `CRATES` / `fillCrate()` put goods inside the game-ready stall's real crates.
- **Interiors:** `houseRoom()` builds a doorway, panelled painted walls, a mosaic floor, beams and lights.
- **Modules:** `fire.js` (`makeFire`), `statue.js` (`makeStatue`).
- **Assets:** `kit/` (CC0 house kit), `models/gstall` (game-ready stall), `models/stall` (baskets, crates, fish), `models/table` (table set), `models/bird` (animated bird, also used for caged doves). CC BY credits live in the "i" panel.
- **Features already done; keep them all:** loading screen; two-stage tutorial (flyover → gate square → stall square → choice → optional tips); chapter and room cards; room-name banners; the "i" panel with Markers and Verse-number toggles and credits; full screen; joystick and WASD with collision; Prev/Next along doorway routes (`VIA`); double-tap travel; bird's-eye flight; mobile tuning.

**Slimming down a heavy model** (410 MB became 4 MB):
1. Delete the meshes you don't want from the glTF.
2. `npx @gltf-transform/cli prune in.gltf a.glb`
3. `weld a.glb b.glb`
4. `simplify b.glb c.glb --ratio 0.25 --error 0.002`, then again at `--ratio 0.5`
5. `resize c.glb d.glb --width 512 --height 512`
6. `webp d.glb scene.glb --quality 80`

Sketchfab models that use the old spec-gloss materials need converting to `pbrMetallicRoughness`, or they render grey.

## 4. Verify (every batch)
- **Every change: `node ltm-engine/tests/fast.mjs <town>` (or `all`).** It runs the same per-room geometry checks as `acceptance.mjs --rooms` (clockwise order, centre inside the square, markers on objects, spots in frame, clear routes) by calculation, with no frame drawn: a few seconds for James, about a minute for Colossae. Same pass/fail as the slow test. Run `acceptance.mjs` only occasionally (screenshots, phone load time, frame rate, before a push). Both share their thresholds in `tests/geom.mjs`.
- `node tests/acceptance.mjs`: for every room it checks the clockwise screen order, the centre inside the square, markers resting on objects, all spots in frame and clear walking routes. It also checks phone load time and frame rate and compares screenshots against `tests/baseline/`. Re-baseline with `--update-baseline` after approved visual changes. For a quick loop, use `--rooms --no-shots`.
- **Critic:** `docs/CRITIC_RUBRIC.md`, a cheaper sub-agent, 3 runs averaged. Pass at 8 or more.
- **Learners:** `docs/LEARNER_PROTOCOL.md`, recall of James 1:1–10 on day 1 and day 8.

## 5. Working with the owner
Log every instruction the moment it arrives, quoting the owner's words. Push once per round of work (GitHub Pages feeds Cloudflare) and always give the link `https://gebsierra.github.io/inbox/<folder>/`. Show; don't just tell. The owner's taste beats the critic.

## 6. Status of this kit (honest)
- **Done:** method spec, rules, post-mortem, layout research, book schema and validator (`--strict`), `colossians.json` (matched to the live town), `james.json` starter, acceptance suite (99/99 on Colossians), critic rubric, learner protocol.
- **Partly done:** the engine is separated from the page and checked against the book data, but the *rooms* are still placed in code, not generated from `book.json`. Generating rooms from data is the next refactor (map each object name to a `P.*` prop builder).
- **Cold-start trial so far:** a fresh session given only this kit planned James chapter 1 (6 rooms, 30 objects, 6 reference prompts). It passed the validator on its first run, in 5 tool calls, and raised 3 real gaps, which have since been fixed in these docs. The 3D build of James chapter 1 to a critic score of 8 has **not** been run yet.

- Upgrading objects: see docs/UPGRADING_OBJECTS.md
- Learning modes (opt-in, Colossae only so far): `engine/modes.js`, enabled by a `modes` block in town.json (translations list, enabled modes) and listed last in `parts`. Modes: verse by verse (the default, unchanged), big ideas (per-chapter `ideas` + `ideasOverview` in the book file, schema in books/book.schema.json, checked by tools/validate-book.mjs), test yourself (flashcards), free roam. A town with no `modes` block loads none of it. Tests: `?mode=verse|ideas|test|free`; `window.__mdJump(ch, k)` / `__mdOverview(ch)` jump to a big-ideas stop, `window.__mdBlockers()` ray-casts the tour routes.
