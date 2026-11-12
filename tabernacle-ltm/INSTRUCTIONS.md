# Owner instructions log (Tabernacle LTM)

Every instruction from the owner, quoted, in the order it arrived.

| # | Date | Owner's words | Status |
|---|---|---|---|
| 1 | 2026-11-12 | "create a new subfolder that uses the same engine for my other LTMS and doesn't mess up james or collosae. but create a new 3d structure which is the tabernacle." (with a cutaway reference picture of the tabernacle) | Done: `tabernacle-ltm/`, own world files only; `ltm-engine/`, `james-ltm/`, `colossae-ltm/` untouched; `fast.mjs all` passes for all three |
| 2 | 2026-11-12 | "this tabernacle will not be built like my other ones in the sense that it will have 5 verses per sublocation. This will be more free-roam and open right now." | Done: no book file, no verse rooms or markers (`"built": 0`). Prev/Next walk eight named stops (gate → altar → laver → door → table → lampstand → incense altar → ark) with Exodus references |

## How this town differs from James and Colossae
- `town.json` has no `bookFile` and `"built": 0`, so the engine builds no rooms. `world/tour.js` pushes eight plain stops (no loci) into `STATIONS` for Prev/Next and the HUD.
- `world/after.js` runs after `engine/finish.js`: the pillar of cloud, altar smoke, incense, the bird's-eye cutaway (the coverings in `ROOF` hide), and the HUD shows area names instead of "Chapter n".
- Measurements: `world/tabernacle.js`, in cubits of 18 in (Exodus 25–27, 30, 36–38). Camp: `world/camp.js` (Numbers 2–3).
- The middle bays of the gate and the door, and the middle of the veil, are drawn back so you can walk through. Easy to close if wanted.
