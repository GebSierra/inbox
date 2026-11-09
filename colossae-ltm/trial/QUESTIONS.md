# Questions for the owner (before any 3D work) and handoff gaps

## Questions the handoff requires
1. Confirm docs/METHOD.md as written (the 9 rules, incl. rote-first 10-20 readings). Any change for James?
2. Layout sketch: please draw the chapter-1 agora over a bird's-eye screenshot. I proposed the room order Gate Stoa, Tower of the Winds, Tholos, Lamp Stoa, Mirror Court, Almshouse Portico (clockwise, entrance-left first). OK?
3. Confirm one district per chapter. books/james.json suggested: Ch1 City Gate & Market (I used an agora), Ch2 Synagogue Courtyard, Ch3 Craftsmen's Street, Ch4 Harbour Warehouses, Ch5 Farm & Vineyard. Keep?
4. Reference images: please generate the 6 prompts in REFS_CH1.md and save as refs/1-<room>.png.

## Unclear or contradictory in the docs
- Spot 5 is "centre object" in the book JSON and the template, but RULES says the 5th marker sits in the centre of the square, "not on an object". I treated it as a distinct fixture standing at the centre. Which is right?
- The last room of a chapter has 1-2 verses: which spots are used (I assumed 1 near-left, 2 far-left) and is the rest of the room left empty?
- "Objects unique across the book where possible": do reused types (lamp, basket, brazier) across chapters count? Is a 1-line overlap check wanted?
- Layout research is Colossae-oriented (oikos/agora). James's audience is the Dispersion; is a Greek agora fine for ch1, and do chapters 2-5 (synagogue, harbour, farm) have any layout research? None exists.
- The validator accepted the file on the first run and does not appear to flag TODO text, so it cannot confirm completeness; chapters 2-5 still pass as TODO.
- HANDOFF says "ask for a layout sketch" but does not say whether to wait for it before writing names/objects (I did not wait).
- HANDOFF cites docs/CRITIC_RUBRIC.md and docs/LEARNER_PROTOCOL.md, not in the list I was told to read; "referenceImage" in the book file is mentioned in REFERENCE_PROMPTS but not in the JSON schema.
- Handoff step 3 refers to index.html and a verses.json source (ESV) that the planning stage never uses; ESV text availability for James is unconfirmed.
- Hand-off says ch1 rooms are "6, 6, 4, 4, 4" but gives wording "27,26,18,17,20" order mismatching 6,6,4,4,4 (ch3 18 verses is 4 rooms, ok); fine, but the sentence is easy to misread.
- Verses are not recorded in the JSON, so object choices were made from my own reading of the ESV; please confirm.
