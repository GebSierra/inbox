# Performance log

Every speed item in `docs/PLAN_LIBRARY_AND_SPEED.md` adds a row here: the `tools/perf.mjs` numbers before and after, and the owner's phone frame rate after each wave.
Headless frame *rate* means nothing; compare draw calls, triangles, shader programs, megabytes. Real speed is the phone column.

## Phone frame rate (owner, `?fps&notut`)

Open each town on the phone, stand at the first stop, at the busiest stop and in bird's-eye, and write the three numbers.

| When | Phone | Colossae (first / busiest / bird's-eye) | James | Tabernacle | Sermon on the Mount |
|---|---|---|---|---|---|
| Baseline (before Wave 1) | | – / – / – | – / – / – | – / – / – | – / – / – |
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
