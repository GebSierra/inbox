// ---- intro: a short flyover, then free roam (no five-verse rooms here, so no verse-by-verse practice) ----
const ESV = 'https://www.esv.org/Exodus+25/';
const ORDER_SVG = '';
const TUT = [
  { t: 'The Tabernacle', cam: 'fly', b: `<p>The tent of meeting in the wilderness, built to the measurements in Exodus 25–27, with the camp of Israel round it.</p><p>This place is open to roam: walk anywhere, go inside, look around.</p>`, next: 'Show me' },
  { t: 'Three spaces', cam: 'fly', b: `<p>Enter by the <b>gate</b> on the east. In the <b>courtyard</b>: the bronze altar, then the laver.</p><p>Inside the tent, the <b>holy place</b>: the table of showbread on the right, the lampstand on the left, the altar of incense before the veil. Behind the veil, the <b>most holy place</b> and the ark.</p>` },
  { t: 'Ready?', choice: true, b: `<p>Start at the gate and press <b>Next</b> to walk from one furnishing to the next, or just wander.</p>` },
  { t: 'Getting around', part: 2, b: `<p><b>WASD</b> or the arrow keys to walk (the joystick on a phone), drag to look, double-tap anywhere to go there.</p><p><b>Prev / Next</b> (or <b>P / N</b>) walk you along the stops: gate, altar, laver, door, table, lampstand, incense altar, ark.</p>` },
  { t: 'See inside from above', part: 2, b: `<p>Tap <b>Bird’s-eye</b>. The tent’s coverings lift off, like a cutaway, so you can see the rooms from above.</p><p><a href="${ESV}" target="_blank" rel="noopener">Read Exodus 25 (ESV) on esv.org</a></p>`, next: 'Start exploring' },
];
