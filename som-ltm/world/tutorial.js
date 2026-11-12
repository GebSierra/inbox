// ---- tutorial: the LTM method, on the first room (Matthew 5:1–5) ----
const ESV = 'https://www.esv.org/Matthew+5/';
const ORDER_SVG = '';
const TUT = [
  { t: 'The Sermon on the Mount', cam: 'fly', b: `<p>A memory palace for Matthew 5–7, on a hillside above the Sea of Galilee. This prototype holds <b>Matthew 5:1–20</b>.</p>`, next: 'Show me' },
  { t: 'One district per chapter', cam: 'fly', b: `<p><b>Chapter 5</b> is the hilltop, where he sat down to teach. The walk climbs from the lake, up the left side of the meadow, and back down the right.</p>` },
  { t: 'Every room holds five verses', cam: 'gate', b: `<p>Each room holds five verses on five objects, always in the same order as you face it: <b>1</b> near-left, <b>2</b> far-left, <b>3</b> far-right, <b>4</b> near-right, <b>5</b> centre.</p><p>Prefer the outline’s own sections? Open <b>i</b> and switch <b>Layout</b> to <b>Outline</b>.</p>` },
  { t: 'Ready?', choice: true, cam: 'gate', b: `<p>That’s the whole method. Start exploring now, or take a few more tips and practice the first five verses together.</p>` },
  { t: 'First, the foundation', part: 2, b: `<p>Before you place a verse, read it aloud <b>10 to 20 times</b> until you can say it roughly from memory. Then tie it to a spot here.</p><p><a href="${ESV}" target="_blank" rel="noopener">Open Matthew 5 (ESV) on esv.org</a></p>` },
  { t: 'Verse 5:1 · near-left corner', part: 2, b: `<p>Tie Matthew 5:1 to the signpost. Make it bigger than life.</p><p class="ex">For example, you could picture a crowd so huge it tilts the hill, and Jesus calmly sitting down beside the signpost while everyone scrambles up after him.</p>`, locus: 0 },
  { t: 'Verse 5:2 · far-left corner', part: 2, b: `<p>Now 5:2 on your own: make a picture on the giant marble ear. The stranger and more vivid, the better.</p>`, locus: 1 },
  { t: 'Verses 5:3–5', part: 2, b: `<p>Same again: 5:3 on the empty beggar’s bowl, 5:4 on the urn of wilting poppies, 5:5 on the lump of earth in the centre.</p>`, locus: 'all' },
  { t: 'Walk it back', part: 2, b: `<p>Look away. Walk the room in your mind: signpost, ear, bowl, poppies, earth. Say each verse at its object.</p><p>Press <b>Next</b> to walk on, or tap <b>Bird’s-eye</b> to see the whole hill.</p>`, next: 'Start the tour' },
];
