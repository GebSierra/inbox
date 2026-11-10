// props-james.js: the objects for James chapter 1 (one builder per verse spot).
// Every builder has the signature (g, x, y, z) => topY and works in g's local coordinates:
//   x, z = where the object stands on the floor of its spot, y = floor height (usually 0).
//   It must return the height of the object's top surface (where the verse marker rests).
// K holds the engine's helpers: THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES.
//   box(w, h, d, m, x, y, z, parent)   y = bottom of the box
//   cyl(rTop, rBot, h, segs, m, x, y, z, parent)   y = bottom
//   add(geometry, m, x, y, z, parent)  y = centre of the geometry
//   mat(key, '#hex', {metalness, roughness, emissive, ...}) caches one material per key
//   Shared material keys: 'stone' 'stoneDk' 'marble' 'wood' 'woodLt' 'clay' 'basket' 'dark' 'wool' 'sack' 'straw' 'leaf'
// Objects are low-poly, flat-shaded, warm, readable from 6 m away. Each spot sits in roughly a 1 m footprint.
// Anything animated (flames, water) must set o.userData.dyn = 1 so it isn't merged into static scenery.

import { propsA } from './props-j1a.js';
import { propsB } from './props-j1b.js';

export function jamesProps(K) {
  return { ...placeholders(K), ...propsA(K), ...propsB(K) };
}

function placeholders(K) {
  const { THREE, add, box, cyl, mat } = K;
  // placeholder used until a real builder is written: a coloured block with a label colour
  const ph = (c, h = .9) => (g, x, y, z) => { box(.5, h, .5, mat('ph' + c, c), x, y, z, g); return y + h; };
  return {
    // 1.1 The Gate Stoa
    letter: ph('#e8d6a8'), mask: ph('#b87a3a', 1.6), goldIngot: ph('#e0b84a', .8), amphoraBlue: ph('#3a5ab0', 1.3), lionFountain: ph('#9a8a70', 1.2),
    // 1.2 The Tower of the Winds
    seaBarrel: ph('#3a6a9a', .8), weathervane: ph('#5a4a3a', 2.2), herm: ph('#f2ede2', 1.8), garlandStool: ph('#c49464', .6), poppyUrn: ph('#c43a2e', .9),
    // 1.3 The Tholos
    sundial: ph('#d8c7a6', 1), crownCushion: ph('#9a2a2a', .8), shieldArrow: ph('#b8893a', 1.4), fowlerTrap: ph('#c9a564', .9), snakePithos: ph('#c47a4a', 1),
    // 1.4 The Lamp Stoa
    conjurerTable: ph('#7a5434', .8), lampstand: ph('#b8893a', 1.8), barleyBasket: ph('#e2c46a', .9), marbleEar: ph('#f4f1ea', 1.4), cauldron: ph('#3c3a38', .9),
    // 1.5 The Mirror Court
    washbasin: ph('#8a8a8a', .8), malletBlock: ph('#e0d6c0', .9), mirror: ph('#c9a24a', 1.4), waxTablet: ph('#3a2c22', 1), shackleStele: ph('#bfb2a0', 1.7),
    // 1.6 The Almshouse Portico
    bridlePost: ph('#6a4a2a', 1.5), breadBasket: ph('#d8a060', .7),
  };
}
