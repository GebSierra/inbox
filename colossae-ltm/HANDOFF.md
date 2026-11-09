# Handoff: building the next LTM (e.g. the book of James)

This is for an AI starting a new **location-triggered memory palace (LTM)** for another book of the Bible, in the same style as `inbox/colossae-ltm/`. Read this file, then `LESSONS.md`, then skim `index.html`. Copy this folder as your starting point. Don't start from scratch.

---

## 1. The owner's memorization method (non-negotiable)

1. **Rote first.** The learner reads each verse aloud 10–20 times until they can roughly say it. The palace locks in what's already started; it doesn't replace it.
2. **One district (zone) per chapter.** A district can be a market, a temple courtyard, a house, a riverside, a gate…
3. **Rooms (sub-zones) of exactly 5 verses.** Rooms = ceil(verses ÷ 5). The last room may hold fewer.
4. **Each verse sits on one interesting object inside the room**, not on empty floor in front of it.
5. **Fixed clockwise order, as seen standing in front of the room:** 1 near-left → 2 far-left → 3 far-right → 4 near-right → 5 centre. The centre spot sits in the middle of the square formed by spots 1–4.
6. **Rooms in a district also run clockwise.** Start at the room nearest the entrance on the left, go up the left side, then come back down the right. A room can be a gateway or a well. Not every spot needs a distinct object.
7. **Learners make their own images:** bigger than life, funny, moving, emotional. Only show example images for the first one or two verses, phrased as "for example, you could picture…".
8. **ESV** is the translation, and the owner has permission to show its text. Verse text loads from `verses.json` (`{"1:1": "…"}`) if present.

**James:** 5 chapters with 27, 26, 18, 17 and 20 verses, so 6, 6, 4, 4 and 4 rooms (24 in total). **Ask the owner to sketch the layout** on a bird's-eye screenshot ("room 1 here, 2 here…") before building rooms. It's the fastest way to agree a layout.

---

## 2. What to reuse (all in `colossae-ltm/`)

| File | What it is |
|---|---|
| `index.html` | The whole app in one page. Three.js r170 ES modules via an import map, no build step |
| `three.module.js`, `addons/` | three.js plus the post-processing, GLTFLoader, BufferGeometryUtils and SkeletonUtils add-ons |
| `fire.js` | Drop-in realistic fire. Usage: `makeFire(THREE,{scale}); fire.update(t,camera)` |
| `statue.js` | Marble robed statue. Usage: `makeStatue(THREE,{pose:'philosopher'|'festival',height})` |
| `kit/` | Quaternius Medieval Village MegaKit (CC0), trimmed to 3 MB: plaster walls, windows, shutters, doors, balconies, round-tile roofs, vines, crate, wagon |
| `models/gstall/scene.glb` | Game-ready market stall (BlackMike, CC BY 4.0), cut from 410 MB to 4 MB. The owner's favourite stall |
| `models/stall/` | Traditional market stall parts (Nisa Nurul Azizah, CC BY 4.0): wicker baskets, crates, fish rack, fish |
| `models/table/` | Modular medieval table set (GameWorldStudio, CC BY 4.0): table, chairs, fruit bowl, jugs, candle, tablet |
| `models/bird/` | Animated low-poly bird (Charlie Tinley, CC BY 4.0). The bird's-eye flyer, and the doves in cages (cloned with SkeletonUtils) |
| `tools/*.mjs` | Headless Playwright test scripts (see §5) |
| `LESSONS.md` | Detailed lessons, gotchas and visual-quality findings |

**Credits** for the CC BY models live behind the small "i" button. Keep them.

### Key functions in `index.html`, in rough order

- **Terrain and town:**
  - `heightAt(x,z)` gives terrain height (river valley, flattened town). `FLAT` lists the areas to flatten under buildings.
  - `drape()` lays paving that follows the ground.
  - `tree()` (olive style), `shrub()`, `cypress()`, `stoneWall()`, `mountain()` and `sheep()` build scenery.
- **Buildings:**
  - `kitHouse()` and `house()` build a Roman stucco house from kit pieces, with low roofs.
  - `gableRoof()`, `booth()` (posts, tasselled canopy) and `houseRoom()` (an interior with a doorway, painted panel walls via `panelTex()`, a mosaic floor via `floorTex()`, beams and lights).
- **Props:** the library is `P.*`, with around 80 prop builders such as `P.figBowl`, `P.bed2`, `P.oven2`, `P.donkey`, `P.cageStack` and `P.padlockChest`. Each one draws at `(g,x,y,z)` and **returns its top Y**, which is where the verse marker goes.
- **Rooms:**
  - `room(ch, n, name, x, z, viewerXZ, {props:[[fn,'what']×5], spread, big, dais, centre})` lays five props in the clockwise square, facing the viewer.
  - `station()` registers the room. It creates the gems (verse markers), the number labels and the room banner (name plus verse range), and stores the camera framing (`.back`, `.pitch`).
- **Market stalls:**
  - `gstallFrame()` places the game-ready stall frame with a tinted canopy.
  - `CRATES` finds the stall's real crate positions from its fruit mesh.
  - `fillCrate()` puts goods *inside* those crates.
- **People and labels:** `person()` builds townsfolk. `zoneLabel()` makes the big chapter labels for bird's-eye view.
- **Navigation:**
  - `go()` handles Next/Prev and follows `VIA` waypoints through doorways.
  - `walkTo()` handles double-tap travel.
  - `blocked()` is the collision grid, built from object footprints.
  - The bird's-eye view is controlled by the `doll` object, with `birdFrame()`.
- **Tutorial:**
  - `TUT[]` holds the steps. Steps with `cam:'fly'|'gate'|'stall'` and `choice` make up the quick tour; steps with `part:2` are the optional tips.
  - `tutShow()` shows a step. `squareFor()` draws the numbered square on the ground.

---

## 3. Feature checklist the owner expects (all exist; port them)

- **Loading screen** with a progress bar.
- **Tutorial in two stages:**
  - Quick tour: a flyover with chapter labels, then the gate square lighting up 1–5, then a stall square, then "Start exploring / More tips".
  - Optional tips: rote first, a 5-verse practice round, walk it back.
  - The camera glides between steps and never snaps.
  - There's a Skip button on every step, and the tutorial can be replayed.
- **On entering a chapter**, a card names it for 5 seconds. **On first entering a room**, the card names the room for 5 seconds and the markers show for 5 seconds.
- **Room banners** show the room name plus the verse range. Raise them above tall objects such as statues.
- **Hidden behind the "i" panel:** the "Verse numbers" toggle (off by default), the "Markers" toggle and the credits. There's also a full-screen button.
- **Navigation:** joystick or WASD walking (slow, with collision), Prev/Next (fast glide along doorway waypoints), double-tap to travel, and bird's-eye flight (drag to fly, pinch for height, twist to turn, double-tap to land).
- **Mobile first.** Static meshes are merged, ambient occlusion is off on phones, pixel ratio is capped at 1.5, and safe areas are respected.

---

## 4. Fastest path to "phase 4" (critic ≥ 8)

1. **Agree the layout first.** Get the owner's sketch, then block out every district and room at prototype quality. Hit 4/10 everywhere before polishing anything.
2. **Get a reference image for every room.** Write one image-generation prompt per room that lists the five objects in clockwise order, viewed straight on from about 5 m away. The owner generates the images, and those images become both the brief and the critic's yardstick. Nothing moved quality faster than this.
3. **Use real models wherever they exist.** Slim them down with gltf-transform: prune, weld, simplify (0.25, then 0.5), resize to 512, convert to WebP. Hand-built primitives plateau at about 5/10.
4. **Detail order that moved scores most:**
   1. textures (wood grain, cloth, painted pottery, mosaic)
   2. warm interior lights
   3. dense, trade-specific props
   4. people
   5. motion (fire, water, birds)
   6. variety between rooms
5. **Make every object unique and readable** from its outline, so each verse spot is unmistakable.
6. **Check framing per stop.** Every stop needs its own `.back` and `.pitch` tuning, and none of the 5 objects should be cut off.

---

## 5. Testing workflow (saves hours)

- Serve the folder with a tiny Node HTTP server that sends the right content types (`.gltf`, `.glb`, `.bin`, `.jpg`, `.png`, `.webp`, `.js`). Load the page with `?notut&fast`.
- Drive it with Playwright using the pre-installed Chromium and the swiftshader flags.
- The page exposes test hooks:
  - `window.__ready` (set when the town is built)
  - `__go(i)` to teleport to stop i
  - `__blockers()` to ray-cast every walking route for obstructions
  - `__cam(x,y,z,lx,ly,lz)` to fix the camera
  - `__tutGo(n)` to jump to a tutorial step
  - `__crates` (the detected stall crate positions)
- Headless rendering runs at about 0.3 fps. Wait 10–20 s before a screenshot and give `screenshot` a 150 s timeout. **Run only one browser at a time.**
- Combine screenshots into contact sheets with PIL, and read those rather than dozens of single images.

### Blind critic

Run the critic as a cheaper sub-agent (Sonnet) that sees **only images**: the reference images plus fresh renders. Prompt it to:
- score each area out of 10 against the reference
- give the two most important concrete fixes for each area
- confirm a feature is really missing before asking for it
- ignore markers, banners and UI

Scores drift by about ±1 between runs, so judge the trend over several runs.

---

## 6. Process lessons with this owner

- **Keep a running checklist of every instruction** (use the task list). The owner sends many quick follow-ups mid-task; don't drop any.
- **Publish in batches.** GitHub Pages feeds Cloudflare, so one push per round of work keeps builds down. Always give the clickable link: `https://gebsierra.github.io/inbox/<folder>/`.
- **Show; don't just tell.** For example, the tutorial flies over the town instead of only saying "each district is a chapter".
- **Ask when the owner's taste and the critic disagree.** The owner's taste wins (for example, the game-ready stalls were kept).
- **Use cheaper sub-agents** for self-contained modules (statue, critic) and keep the main thread on integration.
- **Keep `LESSONS.md` updated** as you go.
