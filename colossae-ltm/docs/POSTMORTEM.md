# Colossae LTM: blameless post-mortem

Sources: the full git history of `colossae-ltm/` (34 commits, 7–9 Nov 2026), the owner's messages and annotated screenshots, every blind-critic report, and the first run of the acceptance suite. The aim is to stop the next build repeating the rework. Fixes are written as rules, not blame.

## 1. What was reworked most (from git history)

Commit subjects were matched to feature areas. Line churn comes from `git log --shortstat` on `index.html`.

| Rank | Feature area | Commits touching it | Notes |
|---|---|---|---|
| 1 | House interiors (chapter 3) | 12 | Rebuilt four times: open rooms → frescoes → mosaics → reference-matched rooms → brightened |
| 2 | Markers, labels, HUD | 11 | Status box → removed → chapter card → room card; banners resized, raised and renamed three times; toggles moved into the "i" panel |
| 3 | Market stalls / goods | 11 | Hand-built → varied frames → game-ready model → goods in crates → markers on crates → centre marker moved |
| 4 | Temple groupings | 9 | Statues rebuilt; booths added; groupings rebuilt twice |
| 5 | Navigation / camera | 8 | Mobile camera bug; route order; collision; tutorial camera reset (twice) |
| 5 | Buildings / town look | 8 | Boxes → kit houses → "too Northern European" → stucco/low roofs |
| 7 | Gate / well | 7 | Gate became a room; arch rebuilt; well lid → open shaft |
| 8 | River / chapter 4 | 6 | Slab banks → rocks; docks moved onto the water twice |
| 9 | Tutorial | 5 | Linear → top-down square → two-stage tour |
| 10 | Loading / mobile / performance | 3 | Mobile black-screen bug; merging; loading screen |

The biggest single diffs were the phase 1 build (487 lines), the move of verses onto objects (219), and the interiors, statues and fire pass (170).

The acceptance suite's **first run passed 43 of 79 checks**. After fixing the test's own flaws and the real defects it found, it passed **77 of 77**. Real defects it caught that no one had spotted:
- the Dining Room verse order was wrong
- both statue markers floated 1.7 m above the statues
- the fish-rack spot had nothing under it
- the walking route from the landing to the washing place went through the bridge parapet and a townsperson

## 2. Five-whys on each major rework loop

### A. Verses were placed in front of rooms, in a zig-zag route (major rebuild, 1d6c5b8)
1. Why rebuild? Loci were spots on the floor in front of each stall, and the route alternated sides of the street.
2. Why? The method was inferred from "each sub-zone holds five verses".
3. Why inferred? The owner's exact method (objects *inside* the room, clockwise rooms) was never asked for.
4. Why not asked? Visuals were prioritised before the memory method.
5. Why? There was no "method spec" step before building.

**Rule M0:** before any 3D work, write the method spec (`docs/METHOD.md`) and get the owner to confirm it, together with a layout sketch.

### B. House rooms didn't read as rooms (12 commits)
1. Why so many passes? Each critic round found a new deficiency.
2. Why? Rooms were built from imagination, with no target image.
3. Why no target? Reference images were only requested at the end.
4. Why late? The plan assumed the critic's general references (`ref_a`–`ref_d`) were enough.
5. Why insufficient? General references don't say what a *specific* room contains or how it's framed.

**Rule V1:** get a per-room reference image (from `docs/REFERENCE_PROMPTS.md`) **before** building each room.

### C. Markers and labels churned (11 commits)
1. Why? Each owner review found clutter or mis-placement: labels too big, a status box, signs, markers on crates instead of the square centre, markers above the statues' faces.
2. Why discovered late? UI was judged in the owner's phone screenshots, not in tests.
3. Why no test? There was no definition of "correct marker placement".
4. Why? "On the object" and "centre of the square" were never written as checks.
5. Why? The rules lived only in conversation.

**Rule U1:** UI rules live in `docs/RULES.md` and the geometry is enforced by `tests/acceptance.mjs`: markers rest on objects, the centre sits inside the square, and banners sit above the tallest object.

### D. Stalls reworked (11 commits)
1. Why? Hand-built stalls plateaued at about 4/10, then goods floated outside the crates of the downloaded stall.
2. Why floated? Goods were placed by guessed coordinates.
3. Why guessed? The model's crate positions weren't measured.
4. Why? There was no habit of measuring imported models.
5. Why? Imported models were treated like hand-built ones.

**Rule V2:** derive placement from the model's own geometry (as `CRATES` does with the fruit vertices) and check it with the "markers rest on objects" test.

### E. Tutorial camera reset between steps (fixed twice)
1. Why? Each frame the walk camera overwrote the position, and a stale `else` reset the timer.
2. Why unnoticed? Tests jumped straight to steps and screenshotted after long waits.
3. Why? No test watched the camera *between* steps.
4. Why? Camera continuity wasn't treated as a requirement.
5. Why? The owner's expectation ("one smooth tour") wasn't written down.

**Rule N1:** the tutorial camera keeps its own state and is never derived from the player camera. Any dead code path that touches shared timers is removed.

### F. Mobile showed a black screen (391a1be)
1. Why? A misplaced `else` stopped the walk camera from ever updating.
2. Why shipped? Tests used fixed camera hooks (`__cam`) that bypassed the real camera path.
3. Why? Screenshot hooks were built for the critic, not for behaviour.
4. Why no phone test? There was no phone viewport in the test plan.
5. Why? Desktop was assumed first.

**Rule P1:** every push runs the phone-viewport load test with the real camera path (no `__cam`).

### G. The critic score plateaued at about 5–6
1. Why? Hand-built primitives can't match AI-rendered reference images.
2. Why did that cost rounds? Each round added detail of the same kind.
3. Why? Scores were treated as precise, and their ±1 drift chased.
4. Why? There was no rubric and no averaging.
5. Why? The critic prompt was ad hoc.

**Rule V3:** use the fixed rubric in `docs/CRITIC_RUBRIC.md`, averaged over three runs, plus real models wherever they exist. Escalate to the owner when the critic and the owner's taste disagree. The owner's taste wins.

### H. Lost or misread instructions (stall question asked twice; "labels" read as "statues")
1. Why? Many quick mid-task messages.
2. Why lost? No running list.
3. **Rule W1:** log every owner instruction in the task list the moment it arrives, quoting the owner's words. Re-read the list before replying.
