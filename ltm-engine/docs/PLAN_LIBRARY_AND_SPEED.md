# Plan: a better-looking library and a faster phone experience

Written 2026-11-12 from a review of all 230 library objects and measurements of the four towns on a phone profile.
For the AIs that will carry it out (Opus, Sonnet, Haiku) and for the owner, who approves anything that changes how a town looks.

## 0. Rules for everyone working from this plan

1. Read `HANDOFF.md`, `docs/RULES.md`, `docs/UPGRADING_OBJECTS.md` and `LESSONS.md` first. They still apply.
2. **Other AIs are building James and the Sermon on the Mount in this repo right now.** `git pull --rebase` before every push. One AI per file at a time. New object code goes in a new `objects/up-<name>.js` with prefixed names.
3. **One item = one commit**, named with its number here (`S2: freeze the shadow map`). That makes any item easy to undo.
4. After every item, all three must pass before pushing:
   - `flock /tmp/ltm-browser.lock node ltm-engine/tests/fast.mjs all`
   - `flock /tmp/ltm-browser.lock node ltm-engine/tools/perf.mjs <towns>`: paste before and after into `docs/PERF_LOG.md`
   - look at the town: `acceptance.mjs` screenshots against `tests/baseline/` for speed items (they must look the same unless the item says otherwise)
5. **Random numbers.** Town layouts depend on the order `R()` / `rnd()` are drawn. Code that replaces an old builder must draw and discard exactly as many as the old one did; new code uses a private generator (`upRng`). `tools/fingerprint.mjs` proves nothing moved.
6. **Owner approval** is needed before shipping anything marked **(look change)**. Show a before/after picture. His taste beats the critic.
7. Tools added for this plan: `tools/perf.mjs` (downloads, build time, draw calls, texture memory) and `tools/library-sheets.mjs` (thumbnails and triangle counts of every object). Headless frame *rate* means nothing; the owner checks real speed on his phone with `?fps` (see S0).

**Who does what.** Opus: changes inside the engine that every town runs, and the parametric builders. Sonnet: object rebuilds and new objects from a clear brief, asset repacking, the service worker. Haiku: measuring, logging, tagging, mechanical edits, critic runs (`docs/CRITIC_RUBRIC.md`).

## 1. What was measured (baseline, phone profile 412×839)

| Town | Download (gzipped) | Requests | Draw calls per frame | Triangles per frame | Point lights | Shader programs | Textures on GPU |
|---|---|---|---|---|---|---|---|
| Colossae | ≈12 MB | 235 | **2476** | 2.76 M | **20** | 54 | **≈168 MB** |
| James | ≈12 MB | 243 | 669 | 0.78 M | 0 | 21 | ≈24 MB |
| Tabernacle | ≈12 MB | 223 | 273 | 0.31 M | 5 | 16 | ≈19 MB |
| Sermon on the Mount | ≈12 MB | 238 | 228 | 0.45 M | 1 | 18 | ≈22 MB |

What the numbers say:
- **About half of every frame is the shadow pass**, redrawing a town that never moves (Colossae 2476 calls → 1413 without it; James 669 → 302; Sermon 228 → 69).
- **Colossae draws 573 window panes one at a time, twice** (once for shadows). The kit's glass is transparent, and transparent meshes are skipped by the merge. Tested: making it solid takes Colossae from 2476 to 1161 calls with nothing else changed.
- The merge is by material, and almost every merged mesh has its own material: 318 different looks among Colossae's 358 merged meshes, 209 of 216 in James. Most differ only in colour.
- The ground and every mountain cone are vertex-coloured, which the merge also skips: 147 separate meshes in Colossae, 108 in James, 87 on the Mount, 69 at the Tabernacle.
- Colossae's 20 point lights are computed for every pixel of every surface, even when a light is switched to zero.
- Colossae's first frame takes about 5.6 s of its 7.5 s load here: compiling 54 shader programs and uploading 168 MB of textures. A phone is slower again.
- Every town downloads every model whether it uses it or not, so all four cost about 12 MB on a first visit: `models/gstall/scene.glb` 3.96 MB, `models/table` 3.6 MB in 60 files, `kit` about 2.4 MB in about 70 files, `models/stall` 1.0 MB, `models/bird` 0.9 MB, three.js and the town's own code about 0.7 MB. The Tabernacle uses only the bird. (The download counter in `perf.mjs` can miss a file or two on a run; take the larger of two runs.)
- GitHub Pages caches for only 10 minutes, so a returning visitor re-checks all ~240 files.

## 2. Speed plan

### S0. Baseline on the real phone (owner, 3 minutes; Haiku logs it)
Open each town with `?fps&notut` on the phone, stand at the first stop, the busiest stop and in bird's-eye, and note the three numbers. Haiku creates `docs/PERF_LOG.md` with those and the table above. Repeat after each wave. Without this we are guessing which wins the phone feels.

**Before any Wave 1 commit, save fresh screenshot baselines** for every town (`acceptance.mjs <town> --update-baseline`) and commit them as one `S0: baselines` commit. Rule 4 compares speed items against these pictures, so they must show the town as it is today, before S1 or S7 change anything.

### Wave 1: low-hanging fruit (Opus, about a day; each is a few lines)

| # | Change | Where | Expected | Notes |
|---|---|---|---|---|
| S1 | **Make the kit's window glass solid** so it merges | `engine/core.js`, after the kit loads: `KMAT.MI_WindowGlass.transparent = false` | Colossae 2476 → 1161 calls (measured) | **(look change)**: panes become dark and opaque. Colossae only; the other towns don't use those houses. Re-baseline Colossae screenshots after approval. |
| S2 | **Draw the shadow map once**, not every frame | `engine/finish.js`: after the first frame `sun.shadow.autoUpdate = false`; add `refreshShadows()` (sets `sun.shadow.needsUpdate = true`) for the rare change | Calls and triangles roughly halve in every town (measured: Colossae → 1413, James → 302, Mount → 69) | Things that move would leave a frozen shadow behind. `userData.dyn` only means "don't merge" (crate models and marker bases carry it too), so it can't pick them out. Instead a watcher in `finish.js` checks the unmerged shadow casters twice a second: anything that moves stops casting while it moves and casts again after 2 s at rest; anything shown, hidden, added or removed (the Tabernacle roof in bird's-eye) redraws the map once. No per-town lists. The sun and the shadow box are fixed (`core.js` 77–81), so the frozen map stays correct for everything else. |
| S3 | **Load only the models a town uses** | `town.json`: optional `"assets": { "kit": false, "models": ["bird"] }`; `engine/core.js` reads it. Missing = load everything, as now | Tabernacle about 12 → about 1.6 MB (about 1 MB after S12 shrinks the bird). Check what James and the Mount really use (the table and stall models are only referenced from `objects/colossae*.js` and `engine/crates.js`) | No look change. Old towns unchanged until they opt in. |
| S4 | **Adaptive resolution** | `engine/runtime.js`: the 90-frame probe today only switches off ambient occlusion, which phones never had. If the average frame is slower than 1/28 s, step the pixel ratio 1.5 → 1.2 → 1.0 and remember it in `localStorage` | Slow phones get a smooth town instead of a sharp slideshow | Re-probe after each step. |
| S5 | **Stop keeping the drawing buffer** | `engine/core.js`: `preserveDrawingBuffer` only with `?shots` (and on the library page) | Saves a full-screen copy every frame on phone GPUs (estimate 5–15%; confirm with S0) | Playwright screenshots don't need it. Check `acceptance.mjs` and the library thumbnails still work. |
| S6 | **Compile shaders without freezing** | `engine/finish.js`: `await renderer.compileAsync(scene, camera)` before `frame()`, moving the loading bar meanwhile | The long freeze at "Lighting the lamps…" becomes a moving bar; phones that support parallel compile finish sooner | three r170 has `compileAsync`. |
| S7 | **Half-size drawn textures on phones** | `engine/core.js` `canvasTex()`: draw at full size, then copy to a half-size canvas when `MOBILE` (not for text labels) | Colossae ≈168 MB → roughly 50 MB of texture memory (estimate); fewer phone tab reloads, faster first frame | Compare a phone screenshot before/after; if a texture looks soft, exempt it. |
| S8 | Use the minified three.js | swap in `three.module.min.js` r170 (Haiku) | about 90 KB less to download, less to parse | Tiny. |

After Wave 1, expected draw calls: Colossae about 670, James about 300, Mount about 70 (S1 + S2 measured together on Colossae: 670).

### Wave 2: structural wins (Opus unless noted, about a week)

| # | Change | Expected | Notes |
|---|---|---|---|
| S9 | **Colour-bake merge.** In `finish.js`, for materials with no texture and the same roughness / metalness / shading / side, write the material's colour into a vertex-colour attribute and merge them all into one mesh. Also merge the existing vertex-coloured meshes (ground, mountains) into one | Merged meshes: Colossae 358 → about 40, James 216 → about 25; plus about 100 fewer from the mountains in each town. Fewer shader programs too | Biggest remaining draw-call win and no look change. Emissive and transparent materials stay separate. Fingerprints will change; screenshots must not. |
| S10 | **Light pool.** Keep three real point lights and move them each frame to the three nearest room-light / fire positions; delete the rest | Colossae 20 → 3 lights computed per pixel; Tabernacle 5 → 3. Likely the biggest pixel-cost win in Colossae (estimate; confirm with S0) | `ROOM_LIGHTS` becomes a list of positions and colours. Fade in over a few frames so lights don't pop. |
| S11 | **Merge moving groups.** James's four ships are 84 draw calls for 2,000 triangles: merge each ship to one mesh per material when it is built. Colossae's stall-model clones (279 meshes, 328k triangles): one merged mesh per stall per material | James −70 calls, Colossae −200 | Ships must still bob (one group each). |
| S12 | **Repack the models** (Sonnet) with gltf-transform (recipe in `HANDOFF.md`): kit → one `kit.glb` with 512 px WebP textures; `models/table` → one `.glb`; `gstall` textures to 512 px WebP and simplify by half; bird textures 1024 → 512 | Download per town about 12 MB → about 3 MB, requests 240 → about 90 | Mesh and material names must survive: `core.js`, `crates.js` and `part()` look pieces up by name. Check the stalls and houses by eye. |
| S13 | **Slim the heaviest objects** (Sonnet): the four `stall-frame-*` (61–76k triangles each: 277k of Colossae's 1.49 M), the two statues (45k each, `statue.js` segment counts), `dining-table-with-chairs` 32k, `dove-cages` 16k, `candle-model` 5.5k, `bowl-of-apples-and-pears` 4.9k, `clay-mug-model` 4.4k, `wine-jug-model` 3.5k | Colossae triangles about −35% | The rule in `UPGRADING_OBJECTS.md` is 4k per object. Same silhouette, same top height. |
| S14 | **Service worker** (Sonnet): cache-first for `kit/`, `models/`, three.js and addons (versioned cache name); stale-while-revalidate for parts and town files | Second visit loads from the phone's disk; works offline | Do it after the move to graceandgladness.com is decided: the worker's scope depends on the final path. |
| S15 | **Performance budgets** (Haiku): `tests/fast.mjs` fails if a town exceeds its own `"budget"` in `town.json` (draw calls, shader programs, texture MB, download MB), set from the post-Wave-2 numbers plus 15% | The wins stay won | |

Not worth doing now: compressed GPU textures (KTX2), level-of-detail models, WebGPU, occlusion culling. Each costs more than everything above and gives less at this scene size.

## 3. The library today: what looks worst

230 objects, 98 of them placed in a book room. The upgraded ones (`up-*.js`: gate, stalls, people, desk, statues, lion fountain, kit houses) look good. Three groups drag the look down.

### A. Things the towns place by the hundred (highest impact: fix these first)
These are engine props, not memory objects, so no room lists them, but they fill every view.

| # | What | Problem | Fix | Who |
|---|---|---|---|---|
| L1 | `sheep()` in `engine/props.js` (`sheep`, `flock-of-sheep`: 80 triangles) | A box head on a blob. The owner already rejected it at the Tabernacle | Promote `woolSheep` from `tabernacle-ltm/world/tabernacle.js` into the library and make `sheep()` call it (draw and discard the one `R()` the old one used). Add a lamb size | Sonnet |
| L2 | `tree()` and `shrub()` (`olive-tree`, `young-olive-tree`, `shrub`, `shrub-cluster`) | Faceted green lumps on a stick; James scatters hundreds | Three shared olive shapes with a gnarled forked trunk and a canopy of small leaf clusters in two greens, built once and reused (the `UD.cypress` pattern), under 400 triangles each. Shrubs the same way | Sonnet **(look change)** |
| L3 | `neHouse` in `james-ltm/world/town-ne.js` (`mud-brick-house`, 204 triangles) | Bare boxes with dots for windows. It is the whole townscape of James and the Mount | Recessed door and windows, a parapet, beam ends, an outside stair on some, a roof awning or jars on some, a darker base course, the plaster texture from L4. Under 600 triangles | Sonnet **(look change)** |
| L4 | The shared drawn textures in `core.js` (`TEX.plaster`, `stone`, `flag`, `wood`, `cloth`, and each town's ground) | Small tiles that visibly repeat; everything in the library wears them | Redraw with large-scale variation over the fine grain; add `TEX.sand`, `mudbrick`, `thatch`, `linenStripe`. No downloads | Opus **(look change)** |
| L5 | The sky | A plain gradient in every town: no clouds, no sun | Soft noise clouds and a sun glow in the sky-dome shader; `theme.clouds` (0–1) in `town.json`, default 0 so nothing changes until the owner turns it on per town | Opus |

### B. Memory objects that learners stare at but are still crude (27)
Used in a room, 260 triangles or fewer. Rebuild in batches of about seven following `UPGRADING_OBJECTS.md` (Sonnet), most-used first:
`brazier` (in 3 rooms), `water-basin` (2), `candelabrum` (2), then `water-trough`, `signpost`, `milestone`, `travellers-pack`, `laundry-rack`, `wooden-crate`, `letter-on-table`, `wax-tablet`, `lyre`, `tray-of-cups`, `mallet-and-chisel`, `stool-with-tablets`, `open-sewing-chest`, `dining-couch`, `basket-of-fish`, `cart-wheel`, `flour-sack`, `tall-candle`, `stool-with-spindle`, `gold-ingot`, `mini-temple`, `bronze-hand-mirror`, `cradle`, `wall-shelf-of-scrolls`.
Also weak though heavier: `woman-with-water-jar` (a pillar, not a person: rebuild on `upPerson`), `exedra`, `two-faced-herm`, `fishing-net`, `small-boat`, `trading-ship`, `lighthouse`, `agora-altar`.
Haiku runs the critic rubric on each batch (3 runs, pass at 8).

### C. Old leftovers nobody uses (about 30)
`plank`, `stacked-crates`, `marble-bench`, `pigeon`, `candle-flame`, `lump-of-clay`, `bed-simple`, `cradle-simple`, `potted-laurel`, `spindle-block`, `clay-bowl`, `pottery-kiln`, `bronze-tripod`, `sheepskin`, `hand-cart`, `dye-vat`, `washtub-wide`, `olive-press`, `hanging-herbs`, `wayside-shrine`, `herb-stand`, `potters-wheel`, `cooking-pot`, `wool-bucket`, `wooden-bucket`, `songbird-cage`, `hanging-oil-lamps`, `loom-simple`, `donkey-simple`, `sleeping-dog`.
Don't spend effort improving them. Haiku: confirm no town code calls each one, tag it `legacy`, and hide `legacy` by default on the library page so nobody picks a crude object for a new room. Upgrade one only when a book asks for it.

### The single highest-impact improvement
**L2, the trees.** They are in every outdoor view of every town, hundreds at a time, and they are the least convincing thing on screen. L1 (sheep) is the quickest, since the better model already exists.

## 4. New things to add, by how much they will be reused

| # | Addition | Why it will be used | Who |
|---|---|---|---|
| N1 | **Livestock from one parametric four-legged builder** (`quadruped({ body, neck, head, legs, tail, ears, horns, coat })`): ox / bull, goat, lamb, camel, horse, and a better donkey | Sacrifices at the Tabernacle (the reference picture shows cattle), James 3:3 and 5:4, flocks and fields in the Gospels. Today the library has only sheep, donkey, dog and doves | Opus builds the builder and the ox; Sonnet tunes the other five from photos |
| N2 | **People who do things**: `upPerson` options for pose (sit, kneel, walk, reach, carry) and props (staff, crook, sickle, net, scroll), then roles: shepherd, fisherman, farmer, priest, rich man with a gold ring and poor man (James 2:2), child, elder, seated teacher | A person in action is the strongest memory peg, and every book needs them. All 18 people today stand still | Opus adds poses; Sonnet makes the roles |
| N3 | **Ground cover as instances** (one draw call each): grass tufts, wildflowers and lilies (Matthew 6:28, James 1:10–11), rocks, thistles; and field patches: standing wheat, ploughed rows, vineyard rows | Bare ground is what makes hillsides look empty; the Mount is a hillside and James 5 is farmland | Sonnet |
| N4 | **Trees of the land**: fig (James 3:12, Matthew 7:16), grapevine on a trellis, acacia (move it from `tabernacle-ltm/world/camp.js`), terebinth, almond in blossom | Named in the texts; today there is only olive, cypress and palm | Sonnet |
| N5 | **Tabernacle furnishings as library objects**: ark, lampstand, table of showbread, incense altar, bronze altar, laver, a court post with hanging, the camp tent | They exist inline in `tabernacle-ltm/world/tabernacle.js`; Exodus, Leviticus, Hebrews and Revelation will want them | Sonnet (same look, then `defObject`) |
| N6 | **Smoke, cloud and glow in the engine**: the soft puff sprites and the pillar of cloud from `tabernacle-ltm/world/after.js`, with the fix that hides them from the ambient-occlusion pass | Any altar, hearth or chimney; the fix is needed wherever sprites meet the desktop shading pass | Opus (small) |
| N7 | **Water and boats**: James's sea shader as a reusable `waterSurface()`; a proper fishing boat with oars and nets | Galilee, the harbour, any river or well scene | Sonnet |

Everyday objects for one verse (a millstone, an anchor, a yoke) should not be built ahead: each book's plan asks for them, as now.

## 5. Order of work

1. **S0** baseline on the phone, then **Wave 1** (S1–S8). Owner looks at S1 and S7 on his phone.
2. In parallel once Wave 1 is in: **Opus** S9, S10, S11 · **Sonnet A** S12, S13 · **Sonnet B** L1, then the B batches · **Haiku** the legacy tagging (C), logging, critic runs.
3. Owner picks from pictures: L2 trees, L3 houses, L4 textures, L5 sky. Build the ones he approves.
4. **N1 and N2** (Opus builders first, Sonnet variants after), then N3–N7 as the James and Mount plans call for them.
5. **S14** service worker after the domain move; **S15** budgets last, from the final numbers.

Targets after Waves 1 and 2: Colossae under 300 draw calls a frame (from 2476), James under 100 (from 669), first-visit download about 3 MB (from about 12), texture memory under 60 MB in Colossae (from about 168). The draw-call figures for S1 and S2 are measured; the rest are estimates to be confirmed in `docs/PERF_LOG.md`.
