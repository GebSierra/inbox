// ---------- OBJECT LIBRARY: James's objects (one builder per verse spot) ----------
// Every builder has the signature (g, x, y, z) => topY and works in g's local coordinates:
//   x, z = where the object stands on the floor of its spot, y = floor height (usually 0).
//   It must return the height of the object's top surface (where the verse marker rests).
// K holds the engine's helpers: THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES, flame.
//   box(w, h, d, m, x, y, z, parent)   y = bottom of the box
//   cyl(rTop, rBot, h, segs, m, x, y, z, parent)   y = bottom
//   add(geometry, m, x, y, z, parent)  y = centre of the geometry
//   mat(key, '#hex', {metalness, roughness, emissive, ...}) caches one material per key
//   Shared material keys: 'stone' 'stoneDk' 'marble' 'wood' 'woodLt' 'clay' 'basket' 'dark' 'wool' 'sack' 'straw' 'leaf'
// Objects are low-poly, flat-shaded, warm, readable from 6 m away. Each spot sits in roughly a 1 m footprint.
// Anything animated (flames, water) must set o.userData.dyn = 1 so it isn't merged into static scenery.
//
// The factories live in james-1a.js / james-1b.js (ES modules, imported through the page's import map); this part registers each
// object with a stable id. Add a new chapter's objects as james-2.js (a factory returning { name(g, x, y, z) {...} }) and register them below.
import { propsA } from 'ltm-engine/objects/james-1a.js';
import { propsB } from 'ltm-engine/objects/james-1b.js';
{
  const K = { THREE, add, box, cyl, mat, R, amph, iron, bronze, TEX, makeFire, FIRES, flame: (...a) => flame(...a) };
  const J = { ...propsA(K), ...propsB(K) };
  const T = (key, id, label, origin, tags) => defObject(id, J[key], { label, origin: 'james ' + origin, tags });
  // 1.1 The Gate Stoa
  T('letter', 'sealed-letter', 'Sealed letter on a courier’s shelf', '1.1', ['writing', 'trade']);
  T('mask', 'theatre-mask', 'Laughing bronze theatre mask on a post', '1.1', ['metal', 'theatre']);
  T('goldIngot', 'gold-ingot', 'Gold ingot on a touchstone', '1.1', ['metal', 'trade']);
  T('amphoraBlue', 'blue-amphora', 'Flawless blue amphora on a plinth', '1.1', ['pottery']);
  T('lionFountain', 'lion-head-fountain', 'Bronze lion-head fountain', '1.1', ['water', 'metal']);
  // 1.2 The Tower of the Winds
  T('seaBarrel', 'sea-barrel', 'Barrel of churning seawater', '1.2', ['water', 'container']);
  T('weathervane', 'triton-weathervane', 'Bronze Triton weathervane', '1.2', ['metal', 'wind']);
  T('herm', 'two-faced-herm', 'Two-faced marble herm', '1.2', ['stone', 'statue']);
  T('garlandStool', 'garland-stool', 'Stool with a tiny gold garland', '1.2', ['wood', 'furniture']);
  T('poppyUrn', 'poppy-urn', 'Urn of wilting poppies', '1.2', ['stone', 'plants']);
  // 1.3 The Tholos
  T('sundial', 'scorched-sundial', 'Scorched sundial in dry grass', '1.3', ['stone', 'plants']);
  T('crownCushion', 'victors-crown', 'Victor’s crown on a red cushion', '1.3', ['metal', 'textile']);
  T('shieldArrow', 'shield-and-arrow', 'Bronze shield and a snapped arrow', '1.3', ['metal', 'war']);
  T('fowlerTrap', 'fowlers-trap', 'Fowler’s trap baited with figs', '1.3', ['wicker', 'food']);
  T('snakePithos', 'snake-pithos', 'Pithos with a snake hatching', '1.3', ['pottery', 'animal']);
  // 1.4 The Lamp Stoa
  T('conjurerTable', 'conjurers-table', 'Conjurer’s table with three cups', '1.4', ['wood', 'furniture']);
  T('lampstand', 'seven-flame-lampstand', 'Seven-flame lampstand', '1.4', ['metal', 'fire', 'light']);
  T('barleyBasket', 'barley-basket', 'Basket of first barley sheaves', '1.4', ['wicker', 'food', 'plants']);
  T('marbleEar', 'marble-ear', 'Giant marble ear', '1.4', ['stone', 'statue']);
  T('cauldron', 'bronze-cauldron', 'Boiling cauldron over coals', '1.4', ['metal', 'fire']);
  // 1.5 The Mirror Court
  T('washbasin', 'soiled-washbasin', 'Washbasin with a soiled tunic', '1.5', ['water', 'textile']);
  T('malletBlock', 'mallet-and-chisel', 'Mallet and chisel on a stone block', '1.5', ['stone', 'tools']);
  T('mirror', 'bronze-hand-mirror', 'Bronze hand mirror on a stand', '1.5', ['metal']);
  T('waxTablet', 'wax-tablet', 'Wax tablet wiped smooth', '1.5', ['writing']);
  T('shackleStele', 'shackle-stele', 'Stele with open shackles', '1.5', ['stone', 'metal']);
  // 1.6 The Almshouse Portico
  T('bridlePost', 'bridle-post', 'Bridle and bit on a post', '1.6', ['wood', 'animal']);
  T('breadBasket', 'bread-basket', 'Basket of bread and a toy horse', '1.6', ['wicker', 'food']);
}
