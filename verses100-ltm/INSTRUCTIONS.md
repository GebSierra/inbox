# Owner instructions log (100 Bible Verses LTM)

Every instruction from the owner, quoted, in the order it arrived.

| # | Date | Owner's words | Status |
|---|---|---|---|
| 1 | 2026-11-19 | "Make a plan to create a memory Palace for these verses. It doesn't have to be a room with a square like our normal layout, although it can be that." "Try to utilize models we already have with the library as much as possible, and make the locations and rooms fit the verses" (with *100 Bible Verses Mind Palace Setup Sheet*) | Done: `PLAN.md` |
| 2 | 2026-11-19 | "Let build" | Phase 0 and phase 1 built (districts 1–5, rooms 1–19). The plan's open decisions were taken as recommended: one town, spot 6 on the way out, the Hill of Praise route climbs, the Holy Place before the court, folder `verses100-ltm` |
| 3 | 2026-11-19 | "For John 1:14, can you make kind of like glory beams shining from behind the Tabernacle. Also, the same for Genesis 1:1 kind of make beams of light shining behind that spot to indicate like New Creation and light?" "run it through a blind critic test and tell it what you're trying to do and make sure it passes out of at a 7 out of 10 before you publish it" | Done: new library effect `glory-beams` (`ltm-engine/objects/up-verses100.js`) behind the Lookout rock and the tent. Blind critic (Sonnet, 3 runs a round, told the intent, shown only renders): round 1 averaged 6.8, round 2 6.3, round 3 6.7 (Tent alone up to 7.6). The fourth version was not scored: the owner saw it and said "Those lights look great. Go ahead and publish." |
| 4 | 2026-11-19 | "make each label clickable so that people can read the BSB or the ESV text if they click on that label hovering above the area" | Done: tap a room's sign (or the reference at the top of the screen) for a card with the passage, BSB / ESV switch, remembered per device. BSB (public domain) ships in `verses.bsb.json`; the ESV is read from `verses.json` (keys like "John 3:16") once the owner adds it, and until then the card links to esv.org |
| 5 | 2026-11-19 | "the introductory exformation needs a little bit wording change. This isn't really based on the chart I showed you. It's based off of a book. And we should encourage people to buy the book if they want to learn more" | Done: loader, tutorial and "i" panel credit Robert J. Morgan's *100 Bible Verses Everyone Should Know by Heart* (B&H, 2010) and link to the publisher's page to get the book |
| 6 | 2026-11-19 | "Those lights look great. Go ahead and publish." | Published |
| 7 | 2026-11-19 | "the stairs in front of John 3:16 seem really random. If you're trying to build stairs up to the top of a house, I just did that in great quality in The Sermon on the Mount ... chapter 6:1 in the courtyard" | Done: the Lamp-lit Rooftop is now a flat-roofed house with ten dressed stone steps climbing its front to the roof, built the same way as som-ltm 6.1's stair. The spots follow it: 3:16 on the stone bench (near-left), 3:17 at the stair head (far-left) |
| 8 | 2026-11-19 | "You can replace the lambskin object with a rock or pot" | Done: the Pitched Tent's sheepskin is now a cooking pot on legs over embers (`cooking-pot`) |
| 9 | 2026-11-19 | "Put the stairways on the other side of the house. It's blocking the door. Or move the door to the other side of the house" | Done: the doorway moved to the far end of the house from the stair (`flatHouse` takes `{ door, win }`); the lamp post moved off it |
| 10 | 2026-11-19 | "For John 1:1 can you put a book floating in the water? Or maybe "logos" in Greek carved into the Rock?" | Done: a standing stone behind the spring with ΛΟΓΟΣ cut into its face |

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
