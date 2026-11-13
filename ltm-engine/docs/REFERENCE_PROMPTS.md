# Reference-image prompt template (one per room)

Fill in one prompt per room from `books/<book>.json`. The owner pastes each one into an image generator. The result becomes that room's build target and the critic's reference. Save it as `refs/<chapter>-<room>.png` and set `referenceImage` in the book file.

```
[ROOM NAME] in a first-century Greco-Roman [DISTRICT, e.g. agora / courtyard house / harbour], realistic low-poly 3D style, clean flat-shaded polygons, warm late-afternoon light, soft shadows. Viewed straight on from about 5 metres away, standing [WHERE: on the paving / in the doorway / on the shore]. [SETTING DETAILS: walls, floor, canopy, background.]
Five clearly separated objects arranged like the corners and centre of a square:
near-left, [OBJECT 1 with colour, material and size];
far-left, [OBJECT 2];
far-right, [OBJECT 3];
near-right, [OBJECT 4];
centre, [OBJECT 5].
No people. Game-environment concept art, 16:9.
```

**Tips**
- Name the material and colour of every object ("iron-banded wooden chest", "white marble basin on a slender pedestal"). The builder copies these directly.
- Keep the five spots clearly different from one another. They are the verse addresses. A spot can be a feature of the place (a corner, a doorway, a rock) or an object; every room has at least two objects natural to the place (method rule 4).
- Interiors: say "viewed from the doorway" and give the wall colour, floor pattern and ceiling beams.
- Statues: put any inscription text in the prompt. The builder reproduces it on the pedestal.

## Filled examples from Colossae
The owner's chat contains the full set for the family house (loom room, bedroom, dining room, kitchen, shrine), chapter 4 (fishermen's landing, washing place, milestone, waystation) and the temple (dove sellers, philosopher, altar, festival statue, locked chest). Use them as models for tone and detail.
