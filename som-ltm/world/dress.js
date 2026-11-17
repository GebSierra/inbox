// ---------- dressing: supporting props that make each room feel lived-in (room critic, phase 4, 2026-11-17) ----------
// Every prop stands outside the room's square of spots (|f| or |s| beyond about 3.4 m) and never between the viewer and the spots
// (nothing nearer than f = -2.6), so the five spots stay clear. Positions are in the room's frame: f metres forward, s metres right.
// Runs after the rooms are built (world/mount.js, farm.js, village.js); uses their helpers.
{
  const D = {
    '1.1': [['rocks-scatter', 4.2, -4.4], ['rocks-scatter', 4.6, 4.2], ['grass-tufts', 1, -4.6], ['grass-tufts', -1.5, 4.6]],
    '1.2': [['sheepskin', 4.2, 1.4], ['wooden-bucket', 3.9, -1], ['shrub-cluster', 1.5, -5.2]],
    '1.3': [['fruit-basket', 3.6, 3.6], ['rocks-scatter', 4.5, -1.5], ['grass-tufts', -1.2, 4.4]],
    '1.4': [['grain-sack', 4.2, -1.2], ['grain-sack', 4.4, -.4], ['flour-sack', 4.1, .6], ['wooden-bucket', 2.5, 4.2]],
    '1.5': [['mallet-and-chisel', 3.6, -3.2], ['wooden-crate', 4, 1.6], ['rocks-scatter', 1.2, 4.6]],
    '1.6': [['rocks-scatter', 4.2, 3.8], ['shrub-cluster', 4.6, -4], ['wooden-bucket', 3.8, .4]],
    '1.7': [['lilies-of-the-field', 3.8, 3.2], ['lilies-of-the-field', -.5, 4.4], ['honey-jar', 1.2, 3.8], ['shrub-cluster', 4.6, .5]],
    '1.8': [['stew-pot-on-tripod', 1.2, 3.8], ['sheepskin', 3.6, 3.6], ['goats-grazing', 7, 5]],
    '1.9': [['road-traveller-with-basket', 5.5, 2.2], ['rocks-scatter', 4.2, -3.8]],
    '1.10': [['wine-jugs', 3.8, 1.2], ['shrub-cluster', 1.4, 4.8], ['wooden-bucket', -1, -4.2]],
    '2.1': [['big-jar', 3.8, 3.6], ['big-jar', 3.9, 2.9], ['grain-sack', 1.8, 4.2], ['bread-basket', 4, -1.6]],
    '2.2': [['flour-sack', 3.5, 1.6], ['grain-sack', 3.5, -1.4], ['hanging-oil-lamps', 1, 0]],
    '2.3': [['flour-sack', 3.8, 1.8], ['water-pail', 3.6, -.8], ['bread-basket', 1.5, 3.9]],
    '2.4': [['water-pail', -1.2, 3.8], ['wooden-bucket', 1, 4], ['woman-with-water-jar', 5, 4], ['grass-tufts', 3.6, -3.6]],
    '2.5': [['wooden-bucket', 3.6, 1.6], ['grain-sack', 3.4, -.4]],
    '2.6': [['grain-sack', 1.6, 4.2], ['grain-sack', 2.3, 4.5], ['wheat-field', 9, -2]],
    '2.7': [['big-jar', 3.6, 2.6], ['big-jar', 3.7, 3.4], ['big-jar', 2.8, 4], ['grain-sack', 1, 4.2]],
    '3.1': [['barrel', 4, 3.6], ['wooden-crate', 3.6, -3.8], ['plank', 1.4, 4.2], ['galilee-fishing-boat-beached', 7, 6]],
    '3.2': [['water-pail', 3.6, 1.4], ['basket-of-fish', 3.5, -1.2], ['woman-with-basket', 2.5, 4.4]],
    '3.3': [['stacked-crates', 3.6, -3.8], ['merchant-red-tunic', 2.2, -4.4], ['coin-chest', -1.4, -3.6]],
    '3.4': [['fruit-basket', 3.4, -1.6], ['grass-tufts', 1, 4.2], ['grass-tufts', -1.6, -4.2]],
    '3.5': [['big-jar', 3.9, 1.6], ['big-jar', 3.9, 2.3], ['woman-with-basket', 4.4, -3]],
    '3.6': [['big-jar', 3.4, 3.4], ['water-pail', 1.2, -4], ['villager-olive-tunic', 6, 1]],
  };
  const bk = BOOKDATA && BOOKDATA.chapters; if (bk) for (const c of bk) for (const r of c.rooms) {
    const list = D[`${c.chapter}.${r.room}`]; if (!list) continue; const F = roomFrame(r);
    for (const [id, f, s] of list) { const [x, z] = F.at(f, s); libAt(id, x, z, F.yaw + R(-.4, .4), 1); } }
}
