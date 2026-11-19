# Owner instructions log (100 Bible Verses LTM)

Every instruction from the owner, quoted, in the order it arrived.

| # | Date | Owner's words | Status |
|---|---|---|---|
| 1 | 2026-11-19 | "Make a plan to create a memory Palace for these verses. It doesn't have to be a room with a square like our normal layout, although it can be that." "Try to utilize models we already have with the library as much as possible, and make the locations and rooms fit the verses" (with *100 Bible Verses Mind Palace Setup Sheet*) | Done: `PLAN.md` |
| 2 | 2026-11-19 | "Let build" | Phase 0 and phase 1 built (districts 1–5, rooms 1–19). The plan's open decisions were taken as recommended: one town, spot 6 on the way out, the Hill of Praise route climbs, the Holy Place before the court, folder `verses100-ltm` |

## How this town differs from the book palaces
- **Passage mode** (`town.json` `"passages": true`, book `"mode": "passages"`): a chapter of the book file is a *section* of the verse sheet, and a room is one *passage*, with its own `ref` ("John 3:16-17") and `verses` list (["3:16", "3:17"]). The engine shows the reference as the room banner's main line, labels each spot with its verse, and shows the section name ("Listening, part 1: the Word") where other towns show "Chapter n". Up to six spots: the sixth on the doorway or stair you leave by.
- **One room builder for every room**: `v100.room` in `world/places.js`. Spots and objects are described entirely in `books/verses100.json` (positions in metres forward/right of the room centre, lifts, scales, a raised floor), so changing a room is a data edit.
- `books/verses100.json` holds all 59 rooms. Rooms in chapters above `"built"` in `town.json` (now 5) are not built yet and have no positions.
- `verses.json` (ESV) is not in the folder yet; the owner supplies it as for the other towns.

## Files
- `world/terrain.js`: the ground's shape, the road, level pads.
- `world/places.js`: the room builder, the ground mesh, distant hills, small builders (walls, houses, rocks, scatter).
- `world/districts.js`: districts 1–5 (the Dawn Garden, the Roman Road, the town and James's synagogue, the tabernacle court, the Father's House), the walking routes (`VIA`), then every room built from the book.
- `world/tutorial.js`, `world/after.js`: tutorial text; the start at room 1.

## Checks
`node ltm-engine/tests/fast.mjs verses100-ltm`: 45/45 (clockwise order, centre inside the square, markers on something, spots in frame, routes clear). `node ltm-engine/tools/validate-book.mjs verses100-ltm/books/verses100.json` passes (two TODOs left for phases 2–3: the new garden tomb and the city gate).
