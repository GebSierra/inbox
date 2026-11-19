// ---------- THE TOUR: Hebrews 1–13, one stop per chapter, in the order of "The Chapter Code" ----------
// This LTM is not built like the book towns (no five-verse rooms, no verse markers, no book file: town.json has "built": 0).
// It follows The Chapter Code (https://a.co/d/04W9GCw3): one place in the tabernacle per chapter of Hebrews, one picture at each.
// The pictures are built in world/hebrews.js; Hebrews 10–12 (the most holy place) are left for you to imagine.
// A stop is an engine station with no loci (ch = area: 1 courtyard, 2 holy place, 3 most holy place, 4 beside the tent).
//   cam: where you stand; obj: what the banner hangs over and what you face (west, -z, unless face is given); by: banner height.
// The engine puts the camera BACK metres behind the station point, and tests/fast.mjs checks the walk between stops from
// 5.6 m behind it, so the station point is set 5.6 m ahead of where you stand: the test then walks exactly your route.
const BACK = 5.6;
const BOOK_URL = 'https://a.co/d/04W9GCw3';
const STOPS = [
  { n: 1, ch: 1, place: 'The Entrance', pic: 'An angel carrying a $ flies in at the gate', theme: 'Jesus is greater than the prophets and the angels', cam: [.2, 6.4], obj: [.2, 1.7], face: 1, pitch: .1, by: 4.6 },
  { n: 2, ch: 1, place: 'The Altar of Burnt Offering', pic: 'Two books burning on the altar', theme: 'Jesus, the author of our salvation', cam: [0, -5.6], obj: [0, ALTAR.z], pitch: -.14, by: 3.7 },
  { n: 3, ch: 1, place: 'Between the Altar and the Laver', pic: 'Moses on a three-legged stool, holding his staff', theme: 'Jesus is greater than Moses', cam: [1.15, -13.35], obj: HB[3], face: 1, pitch: -.2, by: 2.5 },
  { n: 4, ch: 1, place: 'The Bronze Laver', pic: 'Joshua lounging on an inflatable in the laver', theme: 'Jesus gives a better rest than Joshua', cam: [1.05, -15.5], obj: [0, LAVER_Z], face: 1, pitch: -.2, by: 3.1 },
  { n: 5, ch: 2, place: 'The Five Pillars', pic: 'The high priest standing among the five pillars of the door', theme: 'Jesus, the perfect high priest', cam: [.05, -19.45], obj: [.05, TENT.zF], face: 1, pitch: -.07, by: 5.3 },
  { n: 6, ch: 2, place: 'The Lampstand', pic: 'The lampstand’s six branches fall away', theme: 'A warning about falling away', cam: [.6, -26.0], obj: HB[6], face: 1, pitch: -.2, by: 2.55, inside: 1 },
  { n: 7, ch: 2, place: 'The Table of Showbread', pic: 'Melchizedek eats from seven loaves and gives five to Abraham', theme: 'Jesus, a priest like Melchizedek, greater than Abraham', cam: [-1.3, -26.3], obj: HB[7], face: 1, pitch: -.1, by: 2.55, inside: 1 },
  { n: 8, ch: 2, place: 'The Altar of Incense', pic: 'The old tablets burn and open to show NEW', theme: 'Jesus brings a better covenant', cam: [.4, -28.65], obj: [0, INCENSE_Z], face: 1, pitch: -.2, by: 2.3, inside: 1 },
  { n: 9, ch: 2, place: 'The Veil', pic: 'A cat slides down the veil and tears it in two', theme: 'Jesus is greater than the tabernacle', cam: [-1.55, -29.9], obj: [-.2, TENT.zV], face: 1, pitch: .02, by: 3.6, inside: 1 },
  { n: 10, ch: 3, place: 'The Ark of the Covenant', pic: 'Picture Jesus’ blood poured over the ark', theme: 'Jesus, the better sacrifice', cam: [0, -32.45], obj: [0, ARK_Z], pitch: -.3, by: 2.35, inside: 1 },
  { n: 11, ch: 3, place: 'The Cherubim on the Ark', pic: 'Picture the cherubim’s faces as Abraham and Jacob', theme: 'The hall of faith', cam: [.75, -32.6], obj: [-.25, ARK_Z], face: 1, pitch: -.2, by: 1.85, inside: 1 },
  { n: 12, ch: 3, place: 'Above the Ark', pic: 'Picture a cloud over the ark, hiding a fire', theme: 'A cloud of witnesses; our God is a consuming fire', cam: [-.75, -32.6], obj: [.1, ARK_Z - 1.2], face: 1, pitch: .16, by: 3.3, inside: 1 },
  { n: 13, ch: 4, place: 'Outside the Tent', pic: 'A marriage bed made up for a guest', theme: 'Honour marriage; show hospitality', cam: [6.5, -23.9], obj: HB[13], face: 1, pitch: -.2, by: 2.2 },
];
const insideTent = p => Math.abs(p.x) < TENT.w + .3 && p.z < TENT.zF + .2 && p.z > TENT.zB - .3;
STOPS.forEach(s => {
  const [ox, oz] = s.obj, ban = label2(`Hebrews ${s.n}`, s.place); ban.position.set(ox, heightAt(ox, oz) + s.by, oz); labelScene.add(ban);
  let dx = 0, dz = -1; if (s.face) { dx = ox - s.cam[0]; dz = oz - s.cam[1]; const l = Math.hypot(dx, dz); dx /= l; dz /= l; }
  const x = s.cam[0] + dx * BACK, z = s.cam[1] + dz * BACK, st = { ch: s.ch, room: STATIONS.filter(t => t.ch === s.ch).length + 1, name: `Hebrews ${s.n} · ${s.place}`, x, z, look: [x + dx, 0, z + dz], loci: [], banner: ban, text: s.place, back: BACK, pitch: s.pitch, hb: s };
  STATIONS.push(st);
  // banners are drawn smaller than in the book towns (the engine sets 2.2 m wide each frame; this runs just before the draw).
  // Inside the tent only the banner of the stop you are at shows, and never through the tent's walls.
  ban.onBeforeRender = (r, sc, cam) => { if (overview) { ban.material.opacity = 1; return; }
    if (s.inside) ban.material.opacity = insideTent(cam.position) && STATIONS[idx] === st ? 1 : 0;
    const k = s.inside ? .62 : 1.0; ban.scale.set(k, k * .345, 1); ban.updateMatrixWorld(); };
});
// The engine makes the current stop the one whose point is nearest the spot 5.5 m ahead of you, so no two stops may share a
// standing place and facing: Hebrews 10, 11 and 12 look at the ark from three different places.
// routes between stops (key = the stop you walk to: area.room): round the altar, past Moses, round the laver, through the open
// bays of the door, round the incense altar and through the torn veil, and back out of the tent to the bed on its north side
VIA['1.2'] = [[-1.15, 3.4], [-1.15, .4], [-.5, -1.8]];   // round the angel, through the left of the gate opening
VIA['1.3'] = [[2.7, ALTAR.z + 2.2], [2.7, ALTAR.z - 1.9]];
VIA['2.1'] = [[1.6, LAVER_Z + 1.6], [1.5, LAVER_Z - 1.3]];
VIA['2.2'] = [[-.55, TENT.zF + 1.1], [-.55, TENT.zF - 1.0]];   // the left open bay: the high priest stands in the right one
VIA['3.1'] = [[-.8, INCENSE_Z + .7], [-.72, INCENSE_Z - .45], [-.1, TENT.zV - .05]];
VIA['3.2'] = []; VIA['3.3'] = [];
VIA['4.1'] = [[0, -32.45], [-.1, TENT.zV - .05], [-.72, INCENSE_Z - .45], [-.8, INCENSE_Z + .7], [-.55, TENT.zF - 1.0], [-.55, TENT.zF + 1.1], [3.6, TENT.zF + 1.9]];
