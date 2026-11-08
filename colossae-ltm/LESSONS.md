# Lessons for building 3D memory palaces (LTMs) with an AI

Notes from building the Colossae memory palace (Three.js, hosted as a GitHub Pages
subfolder). Hand this file to any AI before starting a new 3D world so the same
mistakes are not repeated.

## 1. Agree the memory method before building anything

- **Rooms hold verses on objects, not on spots on the floor.** Each room or stall has
  five interesting objects. Verses are tied to the objects, never to empty ground in
  front of the room.
- **The order is fixed and clockwise**, seen as you stand facing the room:
  1 near-left, 2 far-left, 3 far-right, 4 near-right, 5 centre.
- **The rooms in a zone also run clockwise.** Start at the bottom-left room nearest
  the entrance, go up the left side, then come back down the right side.
  (The first build went left-right-left-right across the street. That was wrong.)
- A room does not have to be a building. The city gate and the town well both work
  well as rooms. Not all five spots need a distinct object (a guard, a pot, a torch,
  a spear rack and a seal in the ground is plenty).
- Let the person place the rooms. A quick sketch over a bird's-eye screenshot
  ("1 here, 2 here…") settles the layout faster than any description.
- One zone per chapter, five verses per room. Work out the room counts from the verse
  counts first. Colossians: 29, 23, 25 and 18 verses give 6, 5, 5 and 4 rooms.
- Rote first, location second. The tutorial should say: read each verse aloud
  10–20 times, *then* tie it to its object.
- Images for the verses: suggest one or two as examples only. Let learners make their
  own pictures: bigger than life, funny, moving, emotional.
- Ask for the translation before you start. This project uses the ESV. Load verse
  text from a separate `verses.json` so it can be swapped.

## 2. Show less text

- The status box should say only "Chapter 1" and the verse range. No room names.
- Hide the controls hint once the person starts moving.
- Floating signs or panels above stalls only block the view. Leave them out.
- Give the hovering markers their own on/off toggle, as well as the verse numbers.
- Individual verse-number labels are clutter. Turn them **off by default** with a
  toggle. Keep a single banner per room ("1:1–5") and a small marker on each object.
- Keep the top status line to one short line. A big panel covers what you're looking
  at, and so does one moved to the bottom.
- A tutorial must have a Skip button on every step, and the Skip button must actually
  work (see §6, `hidden`).

## 3. Movement and navigation

- Walking speed: about 3.5 m/s. Faster feels frantic. Shift or a run toggle can double it.
- **Walls and objects must block walking.** Build a coarse 2D collision grid from the
  footprints of anything between 0.45 m and 1.8 m high, then keep doorways, gates and
  bridges explicitly clear.
- Fast travel (Next/Prev, double-tap) can glide quickly, but it must follow
  **waypoints through doorways and gates**. Never let it pass through walls.
- Run an automated "is the path clear?" check. Ray-cast every leg between stops and
  print any blocker. It caught benches, a water carrier and a door in the way.
- Every stop needs its own tuned camera distance. Market stalls looked right at
  about 6 m and house rooms at about 4.6 m. One distance never fits everything.
- Bird's-eye view: one finger drags to fly (pan), pinch changes height, twist turns,
  double-tap lands. A visible bird flying ahead of the camera makes it feel right.
  **Don't hide roofs** when zooming. Users found it confusing.
- Make the visible roads match the routes: if Next walks from the temple to the
  house, pave that road.

## 4. Mobile is the main target

- **Test on a real phone-sized viewport with touch** (412×839 with `isMobile` and
  `hasTouch`). The first phone test found the camera stuck under the ground.
- A portrait screen needs a wider vertical field of view, or everything looks zoomed in.
- Merge all static meshes by material at startup. Thousands of draw calls go down to
  about 100. Without this, phones stutter.
- Skip ambient occlusion on phones, use smaller shadow maps, and cap pixel ratio at 1.5.
- Respect safe-area insets, make buttons at least 44 px, and give the joystick
  `touch-action: none`.

## 5. Visual quality: what moved the blind-critic score

Ordered roughly by impact:

1. **Textures, not flat colour.** Wood grain, woven cloth, wicker, painted bands on
   pottery, plaster speckle, flagstones, ground texture. All can be generated on a
   canvas at runtime. Flat-coloured boxes read as a prototype.
2. **Real modelled assets for architecture.** The Quaternius Medieval Village MegaKit
   (CC0) instantly beat hand-built boxes for walls, windows, shutters and tile roofs.
   Shrink the textures (base colour 1024, normal 512, roughness 256, as JPG) to fit
   the kit into 3.3 MB.
3. **People.** Simple low-poly figures (a merchant per stall, a few walkers) made
   scenes feel alive more than any other single change.
4. **Density.** Stalls need 10–20 goods, not 3. Fill counters and shelves, and put
   trade-specific goods on the ground. Empty floors read as unfinished.
5. **Something moving.** Flickering fire with rising smoke, rippling water, a flapping bird.
6. **Variety.** Six stalls with one frame look copy-pasted. Use a tile roof, awning,
   tent and cart, and vary wall colours and building heights.
7. **Light.** Warm late-afternoon sun, soft shadows, ambient occlusion on desktop,
   distance haze matched to the sky colour.
8. **Interior rooms** need mosaic floors, painted walls, ceiling beams and side walls.
   Otherwise they read as furniture on a plaza.

Things that looked broken and were easy to fix:

- Floating geometry. Seat everything on the terrain with `heightAt(x, z)`, flatten
  the terrain under buildings and courtyards, and make floors and props agree on
  one height.
- Terrain poking through floors. Flatten it with a smooth blend around each building.
- Hidden helper meshes reappearing after merging. **Drop invisible meshes before
  merging** (`mergeGeometries` ignores `.visible`).
- Thin terrain grids hiding a river. The valley must be wider than a couple of grid cells.
- Labels drawn huge in front of everything. Draw them in their own pass, small, and
  fade them with distance.

### Making heavy downloaded models phone-friendly

- Don't reject a big model on file size alone. The 410 MB "game-ready" market stall
  became 4 MB and still looked great:
  1. Delete the parts that don't fit the setting (here, meat and sausages) by
     removing their meshes from the glTF.
  2. Run `gltf-transform prune`, `weld`, then `simplify --ratio 0.25` and again at 0.5.
  3. Run `gltf-transform resize --width 512 --height 512`, then `webp --quality 80`.
- Sketchfab downloads often use the old `KHR_materials_pbrSpecularGlossiness`
  material, which three.js no longer reads, so the model renders grey. Convert
  the diffuse texture to `pbrMetallicRoughness.baseColorTexture`.
- Mark big imported models as "don't merge". Merging copies their geometry for
  every instance. Unmerged clones share it.
- CC BY models need credit. Put credits behind a small "i" button, not on screen.

## 6. Engineering gotchas

- `[hidden]{display:none!important}` is needed when your own CSS sets `display`.
  Without it, `el.hidden = true` does nothing (this broke Skip tutorial).
- A `const` used before it's defined breaks the whole page (temporal dead zone).
  Watch ordering when helper code (`occupied()`, `BX`, `P`) is used by earlier sections.
- An `else` that ended up attached to the wrong `if` froze the walk camera. After
  editing the frame loop, always run a quick load test that checks for page errors.
- Headless test browsers are slow. Wait until the camera finishes gliding before
  screenshotting, or you'll judge a half-arrived frame. Don't run two test browsers
  at once, because it crashes.
- Add a `?fast` URL flag (no AO) and a `?notut` flag (skip tutorial) for testing.
- When editing with search-and-replace scripts, make each script fail loudly if its
  anchor text isn't found. Never let a half-applied patch slip through.
- Pull and rebase before pushing to a shared repo. Other projects commit to it too.

## 7. The blind critic loop

- The critic must be a separate agent that sees **only images**: the reference
  pictures plus fresh screenshots. It must not see code or intentions.
- Give it area views **and** a first-person walk-through of every stop. The
  walk-through finds framing and blocking problems the area views hide.
- Tell it to double-check that a feature is really missing before asking for it.
  Critics sometimes "find" problems that aren't there.
- Scores vary by about ±1 between runs. Look at the trend over several runs, not
  one number.
- Thumbnails hide texture detail. Send larger images when judging object detail.
- Reference images made by AI image generators are a very high bar for in-browser
  low-poly. Real modelled assets close the gap fastest.

## 8. Workflow with the person

- Publish after every meaningful change and give the clickable links each time:
  the GitHub Pages URL and the preview.
- Ask for their memorization method early. It changes the whole layout.
- Keep their repo tidy: one subfolder per project (`inbox/colossae-ltm/`).

## 9. Later lessons
- Put goods *inside* crates by measuring where the model's own goods sit (cluster their vertices into crates), not by guessing coordinates.
- Canvas wall/floor textures meant to span a wall once must not use world-space UV tiling, or panels repeat every metre.
- Camera moves in headless tests: drive them by wall-clock time, not by frame count (test browsers run at 1–2 fps).
- Statues: shape first (lathe robe + capsule limbs), carved folds, painted marble with veins/streaks, darkened creases, smooth shading, base joined to feet.
- Ask the person for AI-generated reference renders per room; they are the clearest brief.
- Use a cheaper sub-agent for self-contained modules (statue.js) so the main thread stays on integration.
