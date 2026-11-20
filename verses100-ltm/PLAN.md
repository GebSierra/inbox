# Plan: the 100 Bible Verses LTM (draft for the owner's approval)

A memory palace for the passages on the *100 Bible Verses Mind Palace Setup Sheet* (based on Robert J. Morgan's *100 Bible Verses Everyone Should Know by Heart*). It uses the shared `ltm-engine` and the object library, like `james-ltm/` and `som-ltm/`. Proposed folder: `inbox/verses100-ltm/`.

**Status (2026-11-19):** phases 0, 1 and 2 are built (districts 1–10, rooms 1–41, 90 of 135 verses); see `INSTRUCTIONS.md`. Phase 3 (districts 11–15) is next. The open decisions (§7) were taken as recommended when the owner said "Let build".

**Changes made while fitting phase 1 to the real buildings** (the book file is the source of truth): in the synagogue the rooms use James's tested places, so the Portico became **the Hall** (Joshua 1:8 on the left lectern, 1:9 on the seated teacher), the Treasure Niche became **the Porch** (the padlocked chest), and the Main Door became **the Front Steps** (6:4 bottom step, 6:5 top of the steps). In the tabernacle court the spots follow the furnishings as they stand: 5:11 laver, 5:12 priest, 5:13 bronze tripod, 5:14 stack of logs for the altar, 5:15 the bronze altar. In the Father's House: 14:3 is the kitchen doorway and 14:6 the foot of the stair you climb to the upper floor. The Lamp-lit Rooftop uses a built house instead of `mud-brick-house-dressed`.

## 1. The idea in one paragraph

**One long road through Bible lands.** You start on a summit at dawn (Genesis 1:1) and finish at the gate of the new Jerusalem (Revelation 22:20). Each of the sheet's 15 sections is its own district along the road, and each district is a place the passages belong to: the Roman Road is a real Roman road, Prayer is the tabernacle, Assurance is "my Father's house" with its many rooms, Psalm 23 is a shepherd's valley, Alpha and Omega is Bethlehem and the new city. The layout is not one square town: it is a road with districts strung along it, each district using the plan that fits its ground (a hillside switchback, a courtyard house, a clockwise court, a street).

## 2. Size

| | This palace | For comparison |
|---|---|---|
| Districts | 15 (13 sections; Listening and Promises split in two) | James 5, Sermon on the Mount 3 |
| Rooms | 59 (one per passage) + 6 reserved for the owner's own verses | James 24 |
| Verses | 135 | James 108, Colossians 95 |
| Library objects reused | 148 different ids, none used twice | |
| New objects | 1 (a garden tomb), plus 1 builder reused from Colossae (`cityGate`) | |

## 3. How this palace applies the method (changes to agree)

The sheet is a list of passages, not a book with chapters, so three method rules need a small adaptation. Everything else in `docs/METHOD.md` stays as is (rote first, fixed spot order, learners make their own images, ESV, walk it back).

| Rule | Book palaces | This palace |
|---|---|---|
| 2: one district per chapter | chapter → district | **section → district** (15) |
| 3: rooms of five verses | ceil(n/5) rooms per chapter | **one room per passage.** The room's name is the cue for the reference ("the Milestone" = Romans 3:23). A one-verse passage is a small room (a well, a gate, a milestone, a couch), which rule 3 already allows. |
| 5: spots 1–5 | near-left, far-left, far-right, near-right, centre | the same. **Three passages have six verses** (John 14:1-6, Philippians 4:4-9, Psalm 23:1-6). Proposal: the sixth verse sits on the **doorway or gate you leave the room by** (spot 6, "exit"). It fits all three: "I am the way", "the God of peace will be with you", "I shall dwell in the house of the LORD". See decision D2 for the alternative. |
| 4: objects unique, natural to the place | | Kept: every room has at least two library objects that belong to its place, and no object repeats. Places suit the passage as a whole; objects are not picked to illustrate single verses. Three exceptions are marked in the tables: the garden tomb (1 Peter 1:3), the cloud on the hill (Acts 1:9) and the manger (Luke 2:12), each natural to its place. |

**Engine work this needs** (Opus, before any rooms):
1. A **passage mode** for book files: `"mode": "passages"`, each room carrying its own `ref` (e.g. `"John 3:16-17"`) and verse list instead of being numbered from the chapter. `tools/validate-book.mjs` checks one room per passage and spots = verses (up to 6) in this mode instead of ceil(n/5).
2. **Spot 6 (exit)** in `engine/rooms.js` and the geometry tests (`tests/geom.mjs`): the marker stands on the room's leaving doorway, after the centre.
3. Room banners and room cards show the **reference** as the main line ("Romans 3:23 · The Milestone"), since the reference is part of what is memorised.
4. `verses.json` (ESV) for the 135 verses; the owner supplies it as before.

## 4. The road (route and districts)

The road runs one way, start to end, and every district sits on it in sheet order. Between districts the road changes ground, so each district looks and feels different (rule 2: distinct contexts).

| # | District | Section | Rooms | Verses | Ground and route | Reused world or set |
|---|---|---|---|---|---|---|
| 1 | The Dawn Garden | Beginnings | 4 | 5 | summit, switchback down | som-ltm terrain and wildflowers; new garden dressing |
| 2 | The Roman Road | The Roman Road | 4 | 5 | paved road down to the town gate | Colossae road pieces; Roman objects already in the library |
| 3 | The Synagogue | Listening, part 1: the Word | 5 | 11 | clockwise round the portico | synagogue-galilean (James), scroll and teaching objects |
| 4 | The Tabernacle | Listening, part 2: Prayer | 2 | 8 | in at the court gate, into the Holy Place, back out to the court | tabernacle-ltm world (built to the cubit), all its furnishings |
| 5 | The Father's House | Assurance | 4 | 11 | courtyard house, clockwise, stair to the upper room | Colossae family house, houseRoom(), the kit |
| 6 | The Hill of Praise | Praise | 3 | 7 | climbs the hill (garden → gate → shrine) | round-shrine, Colossae temple court pieces; one new garden tomb |
| 7 | The Hillside Village | Promises, part 1: God's plans | 5 | 11 | switchback down a hillside | som-ltm hillside, farm and village objects |
| 8 | The Wilderness Pass | Promises, part 2: hard times | 4 | 9 | through a gorge to a camp | my-place rocks and firs, som-ltm fold pieces, field-watchtower |
| 9 | The Temple Courts | Holiness | 8 | 11 | clockwise round the courts | marble-stoa, altar-with-fire, Colossae temple courtyard |
| 10 | The Vineyard | Fullness | 2 | 6 | in at the vineyard gate | rock-cut-winepress, vineyard and fruit objects (James chapter 5) |
| 11 | The Colony Square | Joy | 4 | 14 | clockwise round the square | James civic pieces, the James smithy set |
| 12 | The Caravan Inn | Faith | 7 | 12 | down the craft street to the inn court | Sardis open shops, the James potter set, inn furniture |
| 13 | The Harbour and the Hill | Sent | 2 | 7 | along the quay, up the hill | James harbour, Galilee boats, pillar-of-cloud (tabernacle) |
| 14 | The Shepherd's Valley | Psalm 23 | 1 | 6 | one valley room | shepherd, water, som-crook, sheep (upSheep) |
| 15 | Bethlehem and the New City | Alpha and Omega | 4 | 12 | Bethlehem, then the road climbs to the gate | cradle, som feeding niche (a manger), Colossae cityGate() |
| — | The Open Garden | Your own verses | 6 | — | beyond the new city's gate | built empty: plots with markers, objects chosen with the verses |

**Where the road could be bent to keep it compact:** districts 1–5 form the first part (summit, road, town with synagogue, tabernacle court below the wall, the house); 6–8 the countryside (hill, village, pass); 9–12 the city (temple, vineyard outside the wall, square, inn); 13–15 the coast and the last climb. A bird's-eye layout sketch from the owner fixes the real shape (decision D1).

## 5. Rooms, district by district

Spots follow rule 5: **1 near-left → 2 far-left → 3 far-right → 4 near-right → 5 centre → 6 exit**, seen standing in front of the room. "(place)" means a feature of the place itself (a step, a doorway, a column). Ids in `code` are existing library objects.

### District 1: The Dawn Garden (Beginnings)
4 rooms, 5 verses. A garden on the summit where the road starts, facing sunrise. Short switchback down.  
**Reuses:** som-ltm terrain and wildflowers; new garden dressing.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 1 | Genesis 1:1 | The Lookout | Summit rock over sea and sky: "the heavens and the earth" | 1 near-left: **1:1** the lookout rock at the edge (place) | `terebinth`, `wildflowers` |
| 2 | John 1:1 | The Spring | Where the water begins: "In the beginning" | 1 near-left: **1:1** the spring pool under the rocks (place) | `almond-in-blossom`, `rocks-scatter` |
| 3 | John 1:14 | The Pitched Tent | "Dwelt among us" is literally "pitched his tent" | 1 near-left: **1:14** the tent doorway (place) | `goat-hair-tent`, `travellers-pack`, `sheepskin` |
| 4 | John 3:16-17 | The Lamp-lit Rooftop | Nicodemus came to Jesus by night | 1 near-left: **3:16** the stair head (place)<br>2 far-left: **3:17** stone bench (`stone-bench`) | `mud-brick-house-dressed`, `hanging-oil-lamps` |

### District 2: The Roman Road (The Roman Road)
4 rooms, 5 verses. A paved Roman road with milestones, running down to the town gate.  
**Reuses:** Colossae road pieces; Roman objects already in the library.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 5 | Romans 3:23 | The Milestone | The road that measures how far short we fall | 1 near-left: **3:23** milestone (`milestone`) | `roman-seal` |
| 6 | Romans 6:23 | The Paymaster's Table | A road station where soldiers draw their wages | 1 near-left: **6:23** money-changer's table (`coin-table`) | `hanging-scales`, `spear-rack` |
| 7 | Romans 5:8 | The Knoll Outside the Wall | The bare hill outside the city wall | 1 near-left: **5:8** the top of the knoll (place) | `thistles`, `poppy-urn` |
| 8 | Romans 10:9-10 | The Speaker's Steps | A public platform at the gate where people speak out | 1 near-left: **10:9** the bottom step (place)<br>2 far-left: **10:10** marble column (`marble-column`) | `laurel-wreath` |

### District 3: The Synagogue (Listening, part 1: the Word)
5 rooms, 11 verses. A Galilean synagogue: portico, benches, scroll room, washing pool. Clockwise from the entrance.  
**Reuses:** synagogue-galilean (James), scroll and teaching objects.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 9 | 2 Timothy 3:16-17 | The Scroll Room | Where Scripture is kept | 1 near-left: **3:16** shelf of scrolls (`scroll-shelf`)<br>2 far-left: **3:17** rack of scrolls (`scroll-rack`) | — |
| 10 | Joshua 1:8-9 | The Portico | Where teachers recite day and night | 1 near-left: **1:8** teacher with a scroll (`seated-teacher`)<br>2 far-left: **1:9** the first portico column (place) | `wax-tablets` |
| 11 | Psalm 119:11 | The Treasure Niche | Where precious things are stored up | 1 near-left: **119:11** chest with a gold padlock (`padlocked-chest`) | `wall-shelf-of-scrolls` |
| 12 | Deuteronomy 6:4-7 | The Main Door | The Shema at the doorposts, taught to children | 1 near-left: **6:4** the left doorpost (place)<br>2 far-left: **6:5** the reading lectern (place)<br>3 far-right: **6:6** writing table (`writing-desk`)<br>4 near-right: **6:7** a child (`child`) | — |
| 13 | Hebrews 4:12-13 | The Washing Pool | Steps down into the water, laid bare | 1 near-left: **4:12** the top step (place)<br>2 far-left: **4:13** the pool (place) | `water-pail`, `clothes-rack` |

### District 4: The Tabernacle (Listening, part 2: Prayer)
2 rooms, 8 verses. The tabernacle court and Holy Place, where the priest draws near to God.  
**Reuses:** tabernacle-ltm world (built to the cubit), all its furnishings.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 14 | Hebrews 4:14-16 | The Holy Place | "Our great high priest... draw near to the throne of grace" | 1 near-left: **4:14** golden lampstand (`golden-lampstand`)<br>2 far-left: **4:15** the veil (the ark beyond it) (place)<br>3 far-right: **4:16** table of showbread (`table-of-showbread`) | `altar-of-incense` |
| 15 | 1 John 5:11-15 | The Court | Confidence in asking, in the court of prayer | 1 near-left: **5:11** the gate hangings (`court-post-hanging`)<br>2 far-left: **5:12** bronze altar (`bronze-altar`)<br>3 far-right: **5:13** bronze laver (`bronze-laver`)<br>4 near-right: **5:14** priest (`priest`)<br>5 centre: **5:15** the open ground in the middle (place) | — |

### District 5: The Father's House (Assurance)
4 rooms, 11 verses. A Greek courtyard house with many rooms, the Upper Room on its first floor.  
**Reuses:** Colossae family house, houseRoom(), the kit.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 16 | John 14:1-6 | The Courtyard | "In my Father's house are many rooms" | 1 near-left: **14:1** clay planter (`potted-bush`)<br>2 far-left: **14:2** the row of room doorways (place)<br>3 far-right: **14:3** the stair to the upper floor (place)<br>4 near-right: **14:4** wooden bucket (`wooden-bucket`)<br>5 centre: **14:5** herb stand in the middle of the court (`herb-stand`)<br>6 exit: **14:6** the inner doorway you leave by (place) | — |
| 17 | John 14:27 | The Upper Room | Where Jesus spoke these words | 1 near-left: **14:27** dining couch (`dining-couch`) | `tray-of-cups`, `candelabrum` |
| 18 | Isaiah 26:3 | The Roof Terrace | Looking over the walls of "a strong city" (26:1) | 1 near-left: **26:3** the parapet (place) | `songbird-cage`, `garland-stool` |
| 19 | Isaiah 53:4-6 | The Olive-Press Yard | Olives crushed in the press | 1 near-left: **53:4** big storage jar (`big-jar`)<br>2 far-left: **53:5** olive press (`olive-press`)<br>3 far-right: **53:6** the yard gate left open (place) | `goat` |

### District 6: The Hill of Praise (Praise)
3 rooms, 7 verses. A garden at the foot of a hill, a gated court partway up, a round shrine on top. The route climbs.  
**Reuses:** round-shrine, Colossae temple court pieces; one new garden tomb.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 20 | 1 Peter 1:3 | The Garden Tomb | "Living hope through the resurrection" | 1 near-left: **1:3** the open tomb doorway (*NEW garden-tomb*) | `garden-plot`, `grass-tufts` |
| 21 | Psalm 100:1-5 | The Gate of the Courts | "Enter his gates with thanksgiving" | 1 near-left: **100:1** the left gate tower (place)<br>2 far-left: **100:2** lyre (`lyre`)<br>3 far-right: **100:3** the pasture beyond the wall (place)<br>4 near-right: **100:4** the inner arch (place)<br>5 centre: **100:5** incense burner (`incense-burner`) | `goats-grazing` |
| 22 | Revelation 4:11 | The Round Shrine | The throne room of Revelation 4: seven lamps, crowns cast down | 1 near-left: **4:11** the seat inside the shrine (place) | `round-shrine`, `seven-flame-lampstand`, `victors-crown` |

### District 7: The Hillside Village (Promises, part 1: God's plans)
5 rooms, 11 verses. Sermon on the Mount country: a lily field, then a village on a switchback lane.  
**Reuses:** som-ltm hillside, farm and village objects.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 23 | Matthew 6:33-34 | The Lily Field | "Consider the lilies" | 1 near-left: **6:33** the lily field (`lilies-of-the-field`)<br>2 far-left: **6:34** doves on a perch (`dove-perch`) | — |
| 24 | Romans 8:28 | The Weaver's Yard | Many threads worked together | 1 near-left: **8:28** loom (`loom`) | `wool-basket` |
| 25 | Jeremiah 29:11-13 | The Courier's Post | Jeremiah 29 is a letter sent to the exiles | 1 near-left: **29:11** sealed letter (`sealed-letter`)<br>2 far-left: **29:12** writing table with a ledger (`ledger-desk`)<br>3 far-right: **29:13** donkey (`donkey`) | — |
| 26 | 1 John 1:7-9 | The Fuller's Yard | Where clothes are washed clean | 1 near-left: **1:7** white cloth (`white-cloth-bolts`)<br>2 far-left: **1:8** soiled tunic in a basin (`soiled-washbasin`)<br>3 far-right: **1:9** big washtub (`big-washtub`) | — |
| 27 | Proverbs 3:5-6 | The Crossroads | "He will make straight your paths" | 1 near-left: **3:5** resting stone (`som-resting-stone`)<br>2 far-left: **3:6** signpost (`signpost`) | — |

### District 8: The Wilderness Pass (Promises, part 2: hard times)
4 rooms, 9 verses. A rocky gorge, then a shepherds' camp and a watchtower over a fold.  
**Reuses:** my-place rocks and firs, som-ltm fold pieces, field-watchtower.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 28 | 1 Corinthians 10:13 | The Narrow Gorge | "The way of escape" | 1 near-left: **10:13** the gap in the rocks (place) | `som-split-boulder`, `acacia-tree` |
| 29 | Psalm 55:22 | The Porters' Rest | Where loads are set down | 1 near-left: **55:22** the flat ledge for loads (place) | `hand-cart`, `grain-sack` |
| 30 | 1 Peter 5:5b-7 | The Shepherds' Camp | Night camp under the cliff | 1 near-left: **5:5b** brown tent (`goat-hair-tent-brown`)<br>2 far-left: **5:6** goatskin water bag (`som-goatskin-bag`)<br>3 far-right: **5:7** brazier (`brazier`) | — |
| 31 | 1 Peter 5:8-11 | The Watchtower and Fold | "Be watchful": a lion prowls | 1 near-left: **5:8** watchtower (`field-watchtower`)<br>2 far-left: **5:9** the fold wall (place)<br>3 far-right: **5:10** roofed corner of the fold (`som-slab-corner`)<br>4 near-right: **5:11** gateway of the fold (`som-fold-gateway`) | — |

### District 9: The Temple Courts (Holiness)
8 rooms, 11 verses. Temple courts with an altar, a treasury and Solomon's Porch. Clockwise from the entrance.  
**Reuses:** marble-stoa, altar-with-fire, Colossae temple courtyard.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 32 | 2 Chronicles 7:14 | The Prayer Platform | Solomon knelt here to dedicate the temple | 1 near-left: **7:14** the bronze platform (place) | `woman-praying`, `incense-stand` |
| 33 | Romans 12:1-2 | The Great Altar | "A living sacrifice" | 1 near-left: **12:1** altar with fire (`altar-with-fire`)<br>2 far-left: **12:2** bowl of offerings (`bowl-of-offerings`) | — |
| 34 | Romans 12:11-12 | The Oil Store | Oil for the lamps, kept burning | 1 near-left: **12:11** cauldron over coals (`bronze-cauldron`)<br>2 far-left: **12:12** rack of jars (`jar-rack`) | — |
| 35 | Romans 12:18 | Solomon's Porch | The colonnade where people of every nation meet | 1 near-left: **12:18** the first column of the stoa (`marble-stoa`) | `rope-barrier` |
| 36 | 2 Corinthians 9:7 | The Treasury | The offering chests | 1 near-left: **9:7** chest of coins (`coin-chest`) | `open-coin-chest` |
| 37 | Hebrews 10:24-25 | The Gathering Steps | Where crowds meet | 1 near-left: **10:24** the lowest step (place)<br>2 far-left: **10:25** water basin (`water-basin`) | `stack-of-bowls` |
| 38 | Proverbs 1:7 | The Teachers' Corner | Where the young are taught | 1 near-left: **1:7** elder with a staff (`elder`) | `stool-with-tablets` |
| 39 | Proverbs 15:1 | The Fountain | Cool water by the exit | 1 near-left: **15:1** lion-head fountain (`lion-head-fountain`) | `water-trough` |

### District 10: The Vineyard (Fullness)
2 rooms, 6 verses. A walled vineyard and orchard outside the city.  
**Reuses:** rock-cut-winepress, vineyard and fruit objects (James chapter 5).

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 40 | Ephesians 5:18-21 | The Winepress | "Do not get drunk with wine, but be filled with the Spirit" | 1 near-left: **5:18** wine jugs (`wine-jugs`)<br>2 far-left: **5:19** vine on a trellis (`grapevine-trellis`)<br>3 far-right: **5:20** vineyard rows (`vineyard-rows`)<br>4 near-right: **5:21** winepress (`rock-cut-winepress`) | — |
| 41 | Galatians 5:22-23 | The Orchard | The fruit of the Spirit | 1 near-left: **5:22** fig tree (`fig-tree`)<br>2 far-left: **5:23** basket of fruit (`fruit-basket`) | — |

### District 11: The Colony Square (Joy)
4 rooms, 14 verses. A Roman colony town like Philippi: festival gate, prison yard, smithy, bakehouse.  
**Reuses:** James civic pieces, the James smithy set.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 42 | Psalm 118:24 | The Festival Gate | "This is the gate of the LORD" (118:20) | 1 near-left: **118:24** the gate arch (`wall-gate-small`) | `laurel-garland` |
| 43 | Philippians 4:4-9 | The Prison Yard | Paul wrote "rejoice" from prison | 1 near-left: **4:4** stele with open shackles (`shackle-stele`)<br>2 far-left: **4:5** the cell door (place)<br>3 far-right: **4:6** sealed letter on a table (`letter-on-table`)<br>4 near-right: **4:7** gate guard (`gate-guard`)<br>5 centre: **4:8** lamp stand (`tall-candle`)<br>6 exit: **4:9** the yard gate you leave by (place) | — |
| 44 | James 1:2-5 | The Smithy | Metal tested in the fire | 1 near-left: **1:2** forge (`smith-forge`)<br>2 far-left: **1:3** anvil (`anvil`)<br>3 far-right: **1:4** quenching trough (`quench-trough`)<br>4 near-right: **1:5** rack of blades (`blade-rack`) | — |
| 45 | 1 Thessalonians 5:16-18 | The Bakehouse | Daily bread | 1 near-left: **5:16** bread oven (`bread-oven`)<br>2 far-left: **5:17** sack of flour (`flour-sack`)<br>3 far-right: **5:18** basket of bread (`bread-basket`) | — |

### District 12: The Caravan Inn (Faith)
7 rooms, 12 verses. A craft street that ends at a caravan inn round a courtyard.  
**Reuses:** Sardis open shops, the James potter set, inn furniture.

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 46 | Ephesians 2:8-10 | The Potter's Shop | "We are his workmanship" | 1 near-left: **2:8** lump of wet clay (`lump-of-clay`)<br>2 far-left: **2:9** potter's kick wheel (`kick-wheel`)<br>3 far-right: **2:10** domed kiln (`domed-kiln`) | — |
| 47 | Galatians 2:20 | The Carpenter's Bench | Beams and timber | 1 near-left: **2:20** the beam on the bench (`plank`) | `mallet-and-chisel` |
| 48 | Colossians 3:15-17 | The Common Room | Travellers eat, sing and give thanks | 1 near-left: **3:15** stew pot (`stew-pot-on-tripod`)<br>2 far-left: **3:16** dining table (`dining-table-with-chairs`)<br>3 far-right: **3:17** the hearth (place) | — |
| 49 | Romans 1:16-17 | The Street Corner | A pagan street, where the gospel is said aloud | 1 near-left: **1:16** two-faced herm (`two-faced-herm`)<br>2 far-left: **1:17** theatre mask on a post (`theatre-mask`) | — |
| 50 | Psalm 56:3 | The Inn Gate at Night | The torch by the gate | 1 near-left: **56:3** torch on a post (`gate-torch`) | `bridle-post` |
| 51 | Psalm 4:8 | The Guest Room | "In peace I will both lie down and sleep" | 1 near-left: **4:8** bed (`bed`) | `sleeping-dog` |
| 52 | Hebrews 11:6 | The Caravan Well | Where travellers seek water | 1 near-left: **11:6** stone well with a windlass (`village-well`) | `camel`, `big-bucket` |

### District 13: The Harbour and the Hill (Sent)
2 rooms, 7 verses. A quay with boats, and a hill above it.  
**Reuses:** James harbour, Galilee boats, pillar-of-cloud (tabernacle).

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 53 | Matthew 28:18-20 | The Quay | Boats ready to go out | 1 near-left: **28:18** rack of amphorae (`amphora-rack`)<br>2 far-left: **28:19** fishing boat (`galilee-fishing-boat`)<br>3 far-right: **28:20** net on poles (`fishing-net`) | — |
| 54 | Acts 1:8-11 | The Hill Above the Harbour | "A cloud took him out of their sight" | 1 near-left: **1:8** seat rock (`som-seat-rock`)<br>2 far-left: **1:9** cloud on the hilltop (`pillar-of-cloud`)<br>3 far-right: **1:10** the hilltop edge (place)<br>4 near-right: **1:11** the path down to the city (place) | — |

### District 14: The Shepherd's Valley (Psalm 23)
1 rooms, 6 verses. A green valley with a still pool, a dark gully and a table spread. One room.  
**Reuses:** shepherd, water, som-crook, sheep (upSheep).

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 55 | Psalm 23:1-6 | The Valley | The psalm itself | 1 near-left: **23:1** shepherd (`shepherd`)<br>2 far-left: **23:2** the still pool (`water-surface`)<br>3 far-right: **23:3** the path up the ridge (place)<br>4 near-right: **23:4** the dark gully (place)<br>5 centre: **23:5** table with fruit (`fruit-table`)<br>6 exit: **23:6** the gate to the house beyond (place) | `som-crook` |

### District 15: Bethlehem and the New City (Alpha and Omega)
4 rooms, 12 verses. A Bethlehem house and the shepherds' field, then the road climbs to the gate of the new city. The end of the road.  
**Reuses:** cradle, som feeding niche (a manger), Colossae cityGate().

| Room | Passage | Room name | Why it fits | Verse spots | Other objects |
|---|---|---|---|---|---|
| 56 | Isaiah 9:6-7 | The House in Bethlehem | "To us a child is born" | 1 near-left: **9:6** cradle (`cradle`)<br>2 far-left: **9:7** the doorway (place) | `honey-jar` |
| 57 | Luke 2:10-14 | The Shepherds' Field | The angels' announcement | 1 near-left: **2:10** shepherd boy (`shepherd-boy`)<br>2 far-left: **2:11** the field wall (place)<br>3 far-right: **2:12** manger of hay (`som-feeding-niche`)<br>4 near-right: **2:13** the hill crest (place)<br>5 centre: **2:14** tripod brazier (`tripod-brazier`) | — |
| 58 | Revelation 21:1-4 | The Gate of the New City | "The holy city, new Jerusalem, coming down" | 1 near-left: **21:1** the shore where the sea ends (place)<br>2 far-left: **21:2** the great city gate (*cityGate (Colossae)*)<br>3 far-right: **21:3** flawless blue amphora (`blue-amphora`)<br>4 near-right: **21:4** gold ingot (`gold-ingot`) | — |
| 59 | Revelation 22:20 | The River and the Tree | The river of life, just inside the gate | 1 near-left: **22:20** the riverbank (place) | `som-date-palm`, `barley-basket` |

## 6. Build in three phases

Each phase ends with `node ltm-engine/tests/fast.mjs verses100`, a critic run, a push and the link `https://gebsierra.github.io/inbox/verses100-ltm/`.

| Phase | Work | Who |
|---|---|---|
| 0 | Engine: passage mode, spot 6, reference banners, validator (§3). Book file `books/verses100.json` from §5; `validate-book.mjs --strict` passes. Reference prompts (`docs/REFERENCE_PROMPTS.md`) for each district. | Opus |
| 1 | Districts 1–5 (rooms 1–19, 40 verses): summit, Roman road, synagogue, tabernacle court, the Father's house. Most of the reuse is here (tabernacle world, synagogue, Colossae house). | Sonnet builds, Opus reviews |
| 2 | Districts 6–10 (rooms 20–41, 50 verses): hill of praise (new garden tomb goes into the library), hillside village, wilderness pass, temple courts, vineyard. | Sonnet |
| 3 | Districts 11–15 and the Open Garden (rooms 42–65, 45 verses): square, inn, harbour, Psalm 23 valley, Bethlehem and the new city. Tutorial, loading screen, bird's-eye labels for the 15 districts. Phone load and frame-rate check. | Sonnet, Haiku for tests and critic |

Library rules apply throughout: check the library before making anything, and anything new worth reusing goes into `ltm-engine/objects/` (the garden tomb as `up-verses100.js`), not into the town.

**Phone speed.** 59 rooms is more than twice James. Keep the shadow pass frozen (plan item S2), merge static scenery per district, and if the frame rate drops on the owner's phone, fall back to decision D3 (split into three linked towns).

## 7. Decisions for the owner

| # | Decision | Options (recommended first) |
|---|---|---|
| D1 | Layout of the road | Owner sketches over a bird's-eye shot once phase 0 has a blank terrain; until then the order above is fixed and the shape is free. |
| D2 | Six-verse passages | **Spot 6 on the exit doorway** (recommended), or split the passage into two rooms (5 + 1), or allow a sixth spot elsewhere in the room. |
| D3 | One town or three | **One town on one road** (recommended: one walk from Genesis to Revelation), or three linked towns (districts 1–5, 6–10, 11–15) if the phone struggles. |
| D4 | Route on the Hill of Praise | **Climbing** (recommended: tomb → gate → throne reads as an ascent), or rule 6's downhill switchback, which would put Revelation 4:11 first. |
| D5 | Tabernacle order | **Court gate → Holy Place (Hebrews 4) → back out to the court (1 John 5)**, as the sheet's order needs; or swap so the court comes first, which changes the sheet's order. |
| D6 | Room names and objects | Approve, or mark any room to change. Every room can swap its objects for any other unused library object. |
| D7 | Folder name | `verses100-ltm` (recommended) or another. |
