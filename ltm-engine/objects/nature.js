// ---------- OBJECT LIBRARY: plants, animals and fire effects ----------
// kind "plant": tree(), shrub(), cypress() (engine/props.js), the planters and the garden plot of the Colossae town, the date palm of James.
// kind "animal": sheep(), doves (the bird model, or a simple dove when the model is missing), a pigeon, a dog.
// kind "effect": fire (fire.js) and torches. A fire animates in the towns; the library page shows one still frame.
import { townNE } from 'ltm-james/world/town-ne.js';
const LIB_NE = townNE({ THREE, scene, heightAt: (x, z) => heightAt(x, z), add, box, cyl, mat, R: (a, b) => R(a, b) });   // James's palms, houses, ship and lighthouse (also used by structures.js)
{
  const via = fn => (g, x, y, z) => viaScene(g, x, y, z, fn);
  const T = (fn, id, label, origin, kind, tags, args) => defObject(id, fn, { label, origin, tags, args, kind });

  // ---- plants ----
  T(via(() => tree(0, 0, 1)), 'olive-tree', 'Olive tree', 'colossae 1.6', 'plant', ['tree', 'garden']);
  T(via(() => tree(0, 0, .6)), 'young-olive-tree', 'Young olive tree', 'colossae kit', 'plant', ['tree', 'garden']);
  T(via(() => shrub(0, 0, 1.3)), 'shrub', 'Shrub', 'colossae kit', 'plant', ['bush', 'garden']);
  T(via(() => { shrub(-.6, 0, 1.2); shrub(.7, .3, 1.5); shrub(.1, -.6, 1); }), 'shrub-cluster', 'Cluster of shrubs', 'colossae kit', 'plant', ['bush', 'garden']);
  T(via(() => cypress(0, 0, 1)), 'cypress', 'Cypress', 'colossae 2.2', 'plant', ['tree', 'temple']);
  T(via(() => { for (const [x, z, s] of [[-1.6, 0, 1.1], [0, 1.2, .9], [1.7, .1, 1], [.2, -1.5, 1.2]]) cypress(x, z, s); }), 'cypress-grove', 'Grove of cypresses', 'colossae kit', 'plant', ['tree', 'grove']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => LIB_NE.palm(0, 0, 1)), 'date-palm', 'Date palm', 'james kit', 'plant', ['tree', 'harbour']);
  T((g, x, y, z) => viaScene(g, x, y, z, () => { for (const [dx, dz, s] of [[-2.5, 0, 1], [0, 1, .9], [2.6, -.2, 1.1]]) LIB_NE.palm(dx, dz, s); }), 'palm-grove', 'Palms along the shore', 'james kit', 'plant', ['tree', 'harbour', 'grove']);
  // the clay planters of the temple courtyard (colossae-ltm/world/temple.js) and the house front
  const planter = (g, x, y, z, c = 'leaf') => { for (let k = 0; k < 16; k++) R(0, 1);   // the old bush drew 16 numbers: keep the town's random stream where it was
    return UD.planter(g, x, y, z); };
  T(planter, 'potted-bush', 'Clay planter with a bush', 'colossae 2.2', 'plant', ['planter', 'temple', 'pottery']);
  const urnTree = (g, x, y, z) => { cyl(.5, .4, .6, 8, 'clay', x, y, z, g); add(new THREE.IcosahedronGeometry(.6, 0), 'leaf', x, y + 1, z, g); return y + 1.6; };
  T(urnTree, 'potted-laurel', 'Laurel in a clay pot', 'colossae 3.1', 'plant', ['planter', 'house', 'pottery']);
  const garden = (g, x, y, z) => { for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) add(new THREE.IcosahedronGeometry(R(.22, .32), 0), r % 2 ? 'green' : 'leaf', x - 3.2 + c * .9, y + .15, z - 2.2 + r * 1.1, g).scale.y = .7; return y + .45; };
  T(garden, 'garden-plot', 'Plot of garden vegetables', 'colossae kit', 'plant', ['garden', 'food']);

  // ---- animals ----
  T(via(() => sheep(0, 0)), 'sheep', 'Sheep', 'colossae kit', 'animal', ['farm', 'wool']);
  T(via(() => { sheep(-1.2, .3); sheep(.2, -.8); sheep(1.3, .5); }), 'flock-of-sheep', 'Three sheep', 'colossae kit', 'animal', ['farm', 'wool']);
  T(via(() => upSheep(0, 0, { ry: .5, lamb: true, graze: false, s: 1 })), 'lamb', 'Lamb', 'tabernacle camp', 'animal', ['farm', 'wool', 'sacrifice']);
  T(via(() => { upSheep(0, 0, { ry: .4, graze: true, s: 1 }); upSheep(.9, .55, { ry: 2.6, lamb: true, graze: false, s: 1 }); }), 'ewe-and-lamb', 'Ewe with her lamb', 'tabernacle camp', 'animal', ['farm', 'wool', 'shepherd']);
  // a dove: the bird model when it loaded, else the plain low-poly one of the dove cages
  const dove = (g, x, y, z, size = .42, ry = .6) => {
    if (realBird(g, x, y, z, size, ry)) return y + size * .8;
    const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = ry; g.add(d); add(new THREE.IcosahedronGeometry(.09, 1), mat('dove', '#f4f1ea'), 0, .1, 0, d).scale.set(1.5, 1, 1); add(new THREE.IcosahedronGeometry(.055, 1), mat('dove', '#f4f1ea'), .12, .2, 0, d); return y + .3; };
  T((g, x, y, z) => dove(g, x, y, z, .42, .6), 'dove', 'Dove', 'colossae 2.1', 'animal', ['bird', 'temple']);
  T((g, x, y, z) => { let t = y; for (const [dx, dz, ry] of [[-.4, .1, .4], [.05, -.25, 2.4], [.4, .2, -.7], [-.05, .45, 1.4]]) t = Math.max(t, dove(g, x + dx, y, z + dz, .4, ry)); return t; }, 'flock-of-doves', 'Doves on the ground', 'colossae 2.1', 'animal', ['bird', 'temple']);
  const pigeon = (g, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = .5; g.add(p); add(new THREE.IcosahedronGeometry(.13, 0), 'pigeon', 0, .14, 0, p).scale.set(1.5, 1, 1); add(new THREE.IcosahedronGeometry(.07, 0), 'pigeon', .17, .25, 0, p); return y + .35; };
  T(pigeon, 'pigeon', 'Grey pigeon', 'colossae 1.2', 'animal', ['bird', 'market']);
  // a dog asleep in the sun (the market street of Colossae; new)
  const dog = (g, x, y, z) => { const fur = mat('dogFur', '#b08a5a'), dk = mat('dogDk', '#6a4a2a');
    add(new THREE.IcosahedronGeometry(.3, 1), fur, x, y + .22, z, g).scale.set(1.5, .75, .9);
    add(new THREE.IcosahedronGeometry(.17, 1), fur, x + .42, y + .16, z + .08, g);
    box(.18, .1, .14, dk, x + .56, y + .1, z + .08, g);
    for (const s of [-1, 1]) { const e = box(.08, .16, .06, dk, x + .38, y + .2, z + .08 + s * .13, g); e.rotation.x = s * .5; }
    const tail = box(.4, .08, .08, fur, x - .5, y + .1, z - .12, g); tail.rotation.y = .6;
    for (const dz of [-.18, .18]) box(.3, .1, .1, fur, x + .22, y, z + dz + .05, g);
    return y + .5; };
  T(dog, 'sleeping-dog', 'Dog asleep in the sun', 'colossae 1.2', 'animal', ['dog', 'market']);

  // ---- effects ----
  const fire = (scale, light = false) => (g, x, y, z) => { const f = makeFire(THREE, { scale, light }); f.position.set(x, y, z); f.traverse(o => o.userData.dyn = 1); g.add(f); FIRES.push(f); return y + 1.8 * scale; };
  T(fire(1), 'campfire', 'Campfire', 'colossae kit', 'effect', ['fire', 'light']);
  T(fire(.5), 'altar-flame', 'Altar flame', 'colossae 2.3', 'effect', ['fire', 'temple']);
  T(fire(.2), 'small-flame', 'Small oil-lamp flame', 'colossae kit', 'effect', ['fire', 'light']);
  T(gateTorch, 'gate-torch', 'Burning torch on a post', 'colossae 1.1', 'effect', ['fire', 'light', 'gate']);
  T((g, x, y, z) => oilLampStand(g, x, y, z), 'street-lamp', 'Street lamp on a post', 'colossae 1.2', 'effect', ['light', 'market']);
  T((g, x, y, z) => { cyl(.05, .06, .3, 8, 'wool', x, y, z, g); flame(g, x, y + .3, z, 2); return y + .65; }, 'candle-flame', 'Candle flame', 'colossae kit', 'effect', ['fire', 'light']);
}
