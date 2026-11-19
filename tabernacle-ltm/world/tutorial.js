// ---- intro: a short flyover, then the walk through Hebrews (a companion to the book The Chapter Code) ----
const ESV = 'https://www.esv.org/Hebrews+1/';
const ORDER_SVG = '';
const BOOK_LINK = `<a href="https://a.co/d/04W9GCw3" target="_blank" rel="noopener"><i>The Chapter Code</i></a>`;
const TUT = [
  { t: 'Hebrews in the Tabernacle', cam: 'fly', b: `<p>A memory palace for the outline of Hebrews: thirteen chapters, thirteen places in the tabernacle of Exodus, each with one picture to remember.</p><p>It is a companion to the book ${BOOK_LINK}, which teaches this method. To understand the full outline of Hebrews, get the book.</p>`, next: 'Show me' },
  { t: 'The path', cam: 'fly', b: `<p>In through the <b>gate</b> (1), the <b>altar</b> (2), past Moses (3) to the <b>laver</b> (4); the <b>five pillars</b> of the door (5); inside, the <b>lampstand</b> (6), the <b>table</b> (7), the <b>altar of incense</b> (8) and the <b>veil</b> (9).</p><p>Behind the veil, the <b>ark</b> (10–12): picture those three yourself. Then out beside the tent (13).</p>` },
  { t: 'Ready?', choice: true, b: `<p>Tap <b>Start exploring</b> to stand at Hebrews 1. Then press <b>Next ▶</b> (bottom right) to walk on, chapter by chapter, to Hebrews 13.</p><p>At each stop a card shows the chapter’s place, picture and theme.</p>` },
  { t: 'Getting around', part: 2, b: `<p><b>WASD</b> or the arrow keys to walk (the joystick on a phone), drag to look, double-tap anywhere to go there.</p><p><b>Prev / Next</b> (or <b>P / N</b>) walk you chapter by chapter.</p>` },
  { t: 'See inside from above', part: 2, b: `<p>Tap <b>Bird’s-eye</b>. The tent’s coverings lift off, like a cutaway, so you can see the whole path from above.</p><p>For the full outline and the reasons behind each picture, see ${BOOK_LINK}. <a href="${ESV}" target="_blank" rel="noopener">Read Hebrews (ESV)</a>.</p>`, next: 'Start exploring' },
];
