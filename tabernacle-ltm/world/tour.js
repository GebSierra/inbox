// ---------- FREE ROAM: the stops Prev / Next walk you through ----------
// This LTM is free-roam: no five-verse rooms, no verse markers, no book file (town.json has "built": 0, so the engine's
// room() and station() build nothing). These stops only give Prev / Next / N / P somewhere to go: the furnishings in the
// order a priest would meet them, east to west. Each has a name banner with the Exodus passage that describes it.
// A stop is an engine station with no loci (ch = area: 1 courtyard, 2 holy place, 3 most holy place).
//   cam: where you stand; obj: what the banner hangs over and what you face (west, -z, unless face is given); by: banner height.
// The engine puts the camera BACK metres behind the station point, and tests/fast.mjs checks the walk between stops from
// 5.6 m behind it, so the station point is set 5.6 m ahead of where you stand: the test then walks exactly your route.
const BACK = 5.6;
const STOPS = [
  { ch: 1, name: 'The Gate', ref: 'Exodus 27:16', cam: [0, 9], obj: [0, 0], pitch: -.04, by: 3.4 },
  { ch: 1, name: 'The Bronze Altar', ref: 'Exodus 27:1–8', cam: [0, -5.4], obj: [0, ALTAR.z], pitch: -.12, by: 3.6 },
  { ch: 1, name: 'The Bronze Laver', ref: 'Exodus 30:17–21', cam: [0, -14.5], obj: [0, LAVER_Z], pitch: -.18, by: 2.9 },
  { ch: 2, name: 'The Door of the Tent', ref: 'Exodus 26:36–37', cam: [0, -19.7], obj: [0, TENT.zF], pitch: -.02, by: 5.4 },
  { ch: 2, name: 'The Table of Showbread', ref: 'Exodus 25:23–30', cam: [TENT.w - .95, -24.6], obj: [TENT.w - .95, HP_Z], pitch: -.24, by: 2.5, inside: 1 },
  { ch: 2, name: 'The Golden Lampstand', ref: 'Exodus 25:31–40', cam: [.6, -26.7], obj: [-TENT.w + .95, HP_Z], face: 1, pitch: -.1, by: 2.55, inside: 1 },
  { ch: 2, name: 'The Altar of Incense', ref: 'Exodus 30:1–10', cam: [0, -27.6], obj: [0, INCENSE_Z], pitch: -.2, by: 2.5, inside: 1 },
  { ch: 3, name: 'The Ark of the Covenant', ref: 'Exodus 25:10–22', cam: [0, -32.45], obj: [0, ARK_Z], pitch: -.3, by: 2.35, inside: 1 },
];
const insideTent = p => Math.abs(p.x) < TENT.w + .3 && p.z < TENT.zF + .2 && p.z > TENT.zB - .3;
STOPS.forEach(s => {
  const [ox, oz] = s.obj, ban = label2(s.name, s.ref); ban.position.set(ox, heightAt(ox, oz) + s.by, oz); labelScene.add(ban);
  let dx = 0, dz = -1; if (s.face) { dx = ox - s.cam[0]; dz = oz - s.cam[1]; const l = Math.hypot(dx, dz); dx /= l; dz /= l; }
  const x = s.cam[0] + dx * BACK, z = s.cam[1] + dz * BACK, st = { ch: s.ch, room: STATIONS.filter(t => t.ch === s.ch).length + 1, name: s.name, x, z, look: [x + dx, 0, z + dz], loci: [], banner: ban, text: s.ref, back: BACK, pitch: s.pitch };
  STATIONS.push(st);
  // banners are drawn smaller than in the book towns (the engine sets 2.2 m wide each frame; this runs just before the draw).
  // Inside the tent only the banner of the stop you are at shows, and never through the tent's walls.
  ban.onBeforeRender = (r, sc, cam) => { if (overview) { ban.material.opacity = 1; return; }
    if (s.inside) ban.material.opacity = insideTent(cam.position) && STATIONS[idx] === st ? 1 : 0;
    const k = s.inside ? .62 : 1.15; ban.scale.set(k, k * .345, 1); ban.updateMatrixWorld(); };
});
// routes between stops: round the altar, round the laver, through the open bays of the door, round the incense altar and through the parted veil
VIA['1.3'] = [[2.6, ALTAR.z + 2.2], [2.6, ALTAR.z - 2.4]];
VIA['2.1'] = [[1.4, LAVER_Z + 1.8], [1.1, LAVER_Z - 1.3]];
VIA['2.2'] = [[.55, TENT.zF + 1.1], [.55, TENT.zF - 1.0]];
VIA['3.1'] = [[.6, INCENSE_Z + 1.0], [.15, INCENSE_Z - .5]];
