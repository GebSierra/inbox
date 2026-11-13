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

### S9: colour-bake merge (2026-11-12)

Untextured standard materials that differ only in colour now merge into one mesh per (roughness, metalness, shading, side, shadow) with the colour written into each vertex; untextured vertex-coloured meshes (the mountains) join them. Emissive, transparent and textured materials stay separate.

| Town | Draw calls before → after | Merged meshes | Separate vertex-coloured meshes |
|---|---|---|---|
| Colossae | 670 → 442 | 358 → 222 | 147 → 10 |
| James | ≈350 → 206 | 216 → 59 | 108 → 1 |
| Tabernacle | 194 → 157 | 63 → 34 | 69 → 1 |
| Sermon on the Mount | 74 → 35 | 115 → 52 | 87 → 3 |

Screenshots match in all four towns (Colossae 99/99, largest mean difference 0.5%). Colossae merges less than the plan guessed (≈40) because most of its looks are textured.

### S10: light pool (2026-11-12)

Towns with more point lights than the pool (3 on phones, 4 on desktop) take their lights out of the scene and keep them as sources, still driven as before (room lights switch with distance, fires flicker). Each frame the pool's real lights copy the sources that look brightest from the camera (intensity ÷ distance²), fading over a quarter second when they change. `?alllights` turns the pool off for comparison. Ranking by brightness at the camera (not by the lamp's size) keeps the small glow of an oven or brazier next to you over a big lamp in the next room.

| Town | Point lights computed per pixel | Ready (headless) |
|---|---|---|
| Colossae | 20 → 3 (phone) | 7.4 s → 4.8 s |
| Tabernacle | 5 → 3 (phone) | unchanged |

Pool against all lights, Colossae's busiest lit rooms (kitchen 3.16–20, altar square): mean difference 0.5–0.6% on phone and desktop, the oven glow kept. Colossae screenshots re-baselined together with the tree mix; the Tabernacle matches its baseline (largest mean difference 0.5%). James has no point lights, the Mount one.

### S11: merge moving and kept-apart groups inside themselves (2026-11-12)

Every boat in `SHIPS` and every group marked `userData.mergeInside` (the game-ready stall model in `crates.js`, Colossae's two temple statues) is merged into one mesh per material in its own frame, so boats still bob as one and each stall stays its own object. Steady-state draw calls (the shadow map at rest):

| Town | Before → after |
|---|---|
| Colossae | 443 → 386 |
| James | 206 → 106 |
| Sermon on the Mount | 35 → 32 |

Screenshots match (Colossae 99/99, largest mean difference 0.6%, the bobbing boat; the Mount and James 0.0–0.1%). The plan's "279 stall clones" in Colossae turned out to be several imported models (statues, the table set, the stall frames); the statues and stall frames are now merged, the rest is small.
A slip on the way: a trailing `//` comment swallowed the stall's `scale.setScalar(1.35)` and shrank every stall; the screenshot comparison caught it (LESSONS §10 already warns about this).

### S12: repack the models (2026-11-12)

gltf-transform with meshopt compression (the engine now loads `MeshoptDecoder`, and widens the compressed attributes to floats before merging):

| File | Before | After |
|---|---|---|
| `models/gstall/scene.glb` | 4.05 MB | 1.92 MB (geometry compressed; textures already 512 px WebP) |
| `models/bird` | 0.95 MB in 4 files | 71 KB, one `scene.glb` (textures 512 px WebP) |
| `models/table` | 3.8 MB in 60 files | 0.99 MB, one `scene.glb` |
| `kit/` | 3.3 MB in 101 files | 0.83 MB, one `kit.glb` with a scene per piece (textures 512 px WebP) |

First-visit download (gzipped): Colossae ≈9.8–11.8 → ≈4.4 MB (185 requests from 241), James and the Mount ≈5.2 → ≈2.4 MB, Tabernacle 1.2 → 0.4 MB. Colossae still loads `models/stall` (0.5 MB in 20 files, old spec-gloss materials), left for later.
Node and material names survive (the kit's two identical trim materials became one, `MI_WoodTrim`; code only looks for the `MI_WoodTrim` prefix). The kit's missing vine-leaf texture (a 404 on every visit) is gone. Screenshots match in all four towns (Colossae largest mean difference 0.9%: the stall cloths are a shade smoother).
On the way the static merge failed silently on the compressed attributes and dropped the dining table; the screenshot check caught it.

### L3, L4, L5 approved (2026-11-12)

Owner: "That all looks great." Turned on in the town themes: James `"houses": "dressed"` (the only town with the flat-roofed houses); all four towns `"clouds": 0.6, "sunGlow": 0.7, "textures": "varied"`. Screenshot baselines re-taken in every town.
Also fixed: the rebuilt signpost (batch 1) pointed to Laodicea and Hierapolis in every town. It now reads the theme's `"signs"`; the Mount points to Capernaum and Bethsaida, and long names shrink to fit the board.

### S13: slim the heaviest objects (2026-11-13)

Mesh simplification (meshoptimizer through gltf-transform) on the model meshes that carried most of the weight, and fewer segments on the statues' robes:

| What | Triangles before → after |
|---|---|
| Stall awning cloth (`models/gstall`, every stall) | 24.4k → 7.4k |
| Stall's own fruit (`models/gstall`, the fruit stall) | 25.0k → 8.6k |
| Table set (`models/table`: mugs, apples, pears, jug, candle, bowl, bread, dish) | 58k → 28k |
| Bird (`models/bird`, dove cages and the bird's-eye bird) | 2.3k → 1.1k each |
| Statue robe (`statue.js`, 150 points × 96 segments → 100 × 64) | 29.5k → 13.5k |

Library objects: fruit-stall frame 61k → 28k, festival statue 46k → 30k, dining table with chairs 32k → 18k. Colossae per frame 1.60 M → 1.48 M triangles (less than the plan's −35%: most of the town's triangles are spread over many objects, not these few). Download a little smaller again (Colossae ≈4.0 MB). The stall crates' goods moved by at most 3.5 cm (they are placed from the fruit mesh); all marker checks pass and screenshots match (Colossae 99/99; the largest difference is where the drifting clouds happened to be).
