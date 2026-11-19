// ---- tutorial: the road and the method, shown on the first rooms ----
const ESV = 'https://www.esv.org/';
const TUT = [
  { t: '100 Bible Verses', cam: 'fly', b: `<p>A memory palace for the passages on the <i>100 Bible Verses</i> sheet: one road from Genesis 1:1 to Revelation 22:20. The first five districts are built so far.</p>`, next: 'Show me' },
  { t: 'One district per topic', cam: 'fly', b: `<p>Each topic on the sheet is its own place on the road: <b>Beginnings</b> is a garden on the summit at dawn, then <b>the Roman Road</b>, <b>the Synagogue</b> for the Word, <b>the Tabernacle</b> for prayer, and <b>the Father’s House</b> for assurance.</p>` },
  { t: 'One room per passage', cam: 'fly', b: `<p>Every passage has its own room, and the room’s sign shows its reference, so the place reminds you of the reference too. Each verse sits on one spot, always in the same order as you face the room: <b>1</b> near-left, <b>2</b> far-left, <b>3</b> far-right, <b>4</b> near-right, <b>5</b> centre. A sixth verse sits on the doorway or stair you leave by.</p>` },
  { t: 'Ready?', choice: true, cam: 'fly', b: `<p>That’s the whole method. Start walking now, or take a few more tips first.</p>` },
  { t: 'First, the words', part: 2, b: `<p>Before you place a verse, read it aloud <b>10 to 20 times</b> until you can say it roughly from memory. Then tie it to its spot here.</p><p><a href="${ESV}" target="_blank" rel="noopener">Read the passages on esv.org</a></p>` },
  { t: 'Make your own pictures', part: 2, b: `<p>The place gives you the spot; you make the picture. Make it bigger than life, funny or moving.</p><p class="ex">For example, at the Lookout (Genesis 1:1) you could picture the whole sky being unrolled over the sea like a scroll, with the earth set down under it.</p>` },
  { t: 'Walk it back', part: 2, b: `<p>After each room, look away and walk it in your mind, saying each verse at its spot. Review the next day and again a week later.</p><p>Press <b>Next</b> to walk the road, or tap <b>Bird’s-eye</b> to see it all.</p>`, next: 'Start the walk' },
];
