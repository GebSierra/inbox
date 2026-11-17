# Blind model critic

You see one hand-built 3D model at a time: a PNG of two views (left and right), standing alone on a plain sandy floor with a hillside behind. Each image is named after the model, and its description is in the list below.

Judge the model itself, not the background. The style is low-poly, so do not ask for photorealism. Ask whether a person would recognise it at once, and whether it is well made in this style.

## Criteria (0–10 each)
| Criterion | Weight | 10 looks like |
| --- | --- | --- |
| **Reads at a glance** | 35% | Someone who sees it for two seconds names it correctly, from its silhouette and parts |
| **Right for first-century Galilee** | 15% | Shape, material and scale suit the time and place |
| **Detail and parts** | 20% | The parts that define it are there (for example the legs and neck of a waterskin) and in proportion |
| **Materials and colour** | 15% | Reads as stone, wood, clay, leather, cloth or plant; colour is believable; nothing muddy or black |
| **Craft** | 15% | Nothing floating, gaping, clipping, torn or stretched; solid and well put together |

Weighted total out of 10. Be strict, but do not invent problems.

## Reply
One JSON line per model: `{"model": "id", "total": x.x, "reads_as": "what you would call it at a glance", "fixes": ["the most important fix", "the second"]}`

## Models
- som-goatskin-bag: a goatskin water bag, the whole skin with tied legs and a neck spout, hung by cords on a forked wooden stake
- som-limestone-pavement: a patch of bare limestone pavement, cracked pale slabs with grass in the cracks
- som-seat-rock: a low flat-topped rock a person could sit on, with small stones round it
- som-split-boulder: a boulder split in two, with a thornbush growing in the crack
- som-slab-corner: the corner of a dry-stone sheepfold, roofed over with flat stone slabs for shade
- som-crook: a shepherd's crook hung on a peg on a dry-stone wall
- som-fold-gateway: the gateway of a dry-stone sheepfold: two upright stones and a lintel slab, wall either side
- som-date-palm: a date palm leaning over, with its crown of fronds and dates
- som-mudbrick-wall: a low mud-brick yard wall
- som-yoke-on-peg: a wooden yoke for two oxen hung on a peg on a stone wall
- som-plough: a first-century wooden plough (ard) with an iron share, a beam and a handle
- som-feeding-niche: a stone roof pillar with a feeding niche of hay cut in it
- som-hive-pipes: a stack of horizontal clay hive pipes with sealed ends and bees
- som-smoker-pot: a beekeeper's clay smoker pot on a stone, smoking
- som-comb-tray: a tray of golden honeycomb on a stone
- som-salting-vat: a round plastered vat of brine with fish and salt, its wooden lid leaning on it
- som-mending-stone: a stone used for mending nets, with a coil of rope and a net needle on it
- som-court-entrance: the entrance of a basalt courtyard house: two built posts and a lintel, walls either side
- som-culvert: stones bridging a small dry gully where a road crosses it
- som-amphora-buried: an old amphora, half-buried in the earth by a road
- som-broken-cart: a wooden cart with one wheel off, propped on stones, the broken wheel lying beside it
- som-resting-stone: a flat stone at a fork in a dirt road where travellers rest
