# Performance log

Every speed item in `docs/PLAN_LIBRARY_AND_SPEED.md` adds a row here: the `tools/perf.mjs` numbers before and after, and the owner's phone frame rate after each wave.
Headless frame *rate* means nothing; compare draw calls, triangles, shader programs, megabytes. Real speed is the phone column.

## Phone frame rate (owner, `?fps&notut`)

Open each town on the phone, stand at the first stop, at the busiest stop and in bird's-eye, and write the three numbers.

| When | Phone | Colossae (first / busiest / bird's-eye) | James | Tabernacle | Sermon on the Mount |
|---|---|---|---|---|---|
| Baseline (before Wave 1) | | – / – / – | – / – / – | – / – / – | – / – / – |
| 2026-11-12, Wave 1 + review flags | owner's phone | ≈60 fps capped, with `?solidglass` and with `?halftex` (a full three-stop reading of every town still to come) | | | |
| After Wave 1 | | | | | |
| After Wave 2 | | | | | |

Links: [Colossae](https://gebsierra.github.io/inbox/colossae-ltm/?fps&notut) · [James](https://gebsierra.github.io/inbox/james-ltm/?fps&notut) · [Tabernacle](https://gebsierra.github.io/inbox/tabernacle-ltm/?fps&notut) · [Sermon on the Mount](https://gebsierra.github.io/inbox/som-ltm/?fps&notut)

## perf.mjs, phone profile 412×839

### S0 baseline (2026-11-12, commit d7d9cfa)

| Town | Download (gzipped) | Requests | Draw calls | Triangles | Without shadow pass | Point lights | Shader programs | Textures on GPU | Ready (headless) |
|---|---|---|---|---|---|---|---|---|---|
| Colossae | 9.8 MB | 241 | 2476 | 2.76 M | 1413 / 1.49 M | 20 | 54 | ≈168 MB | 9.1 s |
| James | 12.1 MB | 237 | 670 | 0.78 M | 303 / 0.48 M | 0 | 21 | ≈24 MB | 3.2 s |
| Tabernacle | 11.8 MB | 224 | 273 | 0.31 M | 194 / 0.22 M | 5 | 16 | ≈19 MB | 2.1 s |
| Sermon on the Mount | 11.9 MB | 224 | 228 | 0.45 M | 69 / 0.28 M | 1 | 18 | ≈22 MB | 2.8 s |

(The download counter can miss a file or two; Colossae's 9.8 MB here against ≈12 MB in the plan is one of those runs.)

## Items

### S2: draw the shadow map once (2026-11-12)

| Town | Draw calls before → after | Triangles before → after |
|---|---|---|
| Colossae | 2476 → 1413 | 2.76 M → 1.49 M |
| James | 670 → ≈350 at rest (400 in the perf run, which caught the first few redraws as the ships were switched off) | 0.78 M → 0.48–0.58 M |
| Tabernacle | 273 → 194 | 0.31 M → 0.22 M |
| Sermon on the Mount | 228 → 74 | 0.45 M → 0.28 M |

Screenshots: Tabernacle, Mount and James match their S0 baselines (largest mean difference 0.5%, which is the room-name card's timing, not the shading). `fast.mjs all` passes. Colossae screenshots are checked at the end of Wave 1 against a fresh baseline taken from the S0 commit.

### S5: stop keeping the drawing buffer (2026-11-12)

`preserveDrawingBuffer` is now on only for the library page and `?shots`. No change `perf.mjs` can see (draw calls and triangles are the same); the saving is a full-screen copy per frame on phone GPUs, to be confirmed with the phone frame rate after Wave 1. Library thumbnails: all 230 render (none blank). Playwright screenshots work (Tabernacle 28/28). `fast.mjs all` passes.

### S8: minified three.js (2026-11-12)

The four towns and the library page load `ltm-engine/three.module.min.js` (r170, the same release as the full file, taken from the npm package). 260 KB → 171 KB gzipped: about 90 KB less per first visit, and less to parse. The full file stays for the tools pages. `fast.mjs all` passes; the Mount's screenshots match.

### S6: compile shaders without freezing (2026-11-12)

`renderer.compileAsync(scene, camera)` runs before the first frame while the loading bar creeps from 95% to 99%. Headless: Colossae ready 9.3 s → 7.4 s (finish.js 6.6 s → 4.7 s), Tabernacle 2.1 s → 1.9 s. Phones with parallel shader compile should gain more. `fast.mjs all` passes; Tabernacle screenshots match.

### S3: load only the models a town uses (2026-11-12)

What each town reads after loading (recorded by wrapping `KIT`, `KMAT` and `MODELS` in a counting proxy): Tabernacle only the bird; James and the Mount the bird and the game-ready stall (`gstall`); Colossae everything. So `town.json` now says `"assets": { "kit": false, "models": [...] }` for the first three; Colossae and the library page are unchanged (no `assets` = load everything).

| Town | Download (gzipped) before → after | Requests | Ready (headless) |
|---|---|---|---|
| Tabernacle | 11.8 MB → 1.2 MB | 224 → 45 | 1.9 s → 1.3 s |
| James | 12.1 MB → 5.3 MB | 237 → 84 | 3.2 s → 2.6 s |
| Sermon on the Mount | 11.9 MB → 5.1 MB | 224 → 79 | 2.7 s → 2.1 s |

`fingerprint.mjs` before and after: IDENTICAL for all three (every mesh, position, material and the random-number state). `fast.mjs all` passes. James and the Mount now spend 3.9 MB of their 5 MB on `models/gstall`; S12 shrinks it.

### S4: adaptive resolution (2026-11-12)

Every 90 frames (after the first 60), if the average frame is slower than 1/28 s the town drops ambient occlusion (desktop), then steps the pixel ratio 1.5 → 1.2 → 1.0 (2 → 1.5 first on desktop), and remembers the step per town in `localStorage` (`<store>-pixelRatio`). Switched off under automation (`navigator.webdriver`) so test screenshots stay sharp. Tested by pretending not to be automated in a slow headless phone: the Tabernacle stepped 1.5 → 1.2 → 1.0 and started at 1.0 on reload. To undo on a phone: clear the site's data. The owner's phone numbers after Wave 1 will show whether it kicks in on his phone.

### S1 and S7: ready, waiting for the owner (2026-11-12)

Both are look changes, so they are in the code but **off** until the owner approves. Try them on the phone with page flags:

| Item | Flag | Colossae on `perf.mjs` | Pictures |
|---|---|---|---|
| S1 solid dark window glass | `?solidglass` | 1413 → **670** draw calls (the 573 panes merge) | `docs/review/S1-solid-glass.jpg`: today's panes already read as dark openings; solid ones are a little darker and glossier |
| S7 half-size textures on phones | `?halftex` (phones only) | ≈168 → **≈64 MB** of texture memory | `docs/review/S7-half-textures.jpg`: hard to tell apart at phone size, even close up |

Note for the plan: Colossae's texture memory is mostly the models' own images (≈110 MB, 48 of them 512 px and 6 of 1024 px), not the drawn canvas textures (≈30 MB). So S7 now halves every texture of 256 px or more on phones, not only `canvasTex()`; sprites (labels, banners) keep full size.

To approve: set `"solidGlass": true` and/or `"halfTex": true` in the town's `theme` in `town.json` (or make it the engine default), then re-baseline that town's screenshots.

`perf.mjs` accepts page flags for comparisons: `node ltm-engine/tools/perf.mjs 'colossae-ltm?solidglass'`.

### S1 and S7 approved (2026-11-12)

Owner, on his phone: both links ran at about 60 fps (the phone's cap); half-size textures "look just fine"; he wants the glass black, not the brown of today's see-through panes. So Colossae's theme now has `"solidGlass": true, "halfTex": true`, and James, the Tabernacle and the Mount have `"halfTex": true` (phones only; desktop screenshots unchanged).

| Town | Draw calls | Texture memory (phone) |
|---|---|---|
| Colossae | 1413 → 670 | ≈168 → ≈64 MB |
| James | ≈350–400 | ≈24 → ≈12 MB |
| Tabernacle | 194 | ≈19 → ≈8 MB |
| Sermon on the Mount | 74 | ≈22 → ≈12 MB |

After Wave 1 overall: Colossae 2476 → 670 draw calls, as the plan predicted.
