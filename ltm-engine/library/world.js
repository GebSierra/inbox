// The library has no terrain: a flat stage. (The shared parts expect these two from a town's world part; see ltm-engine/boot.js.)
const heightAt = () => 0, groundY = () => 0;
// the family house of Colossae (objects/colossae-places.js) is built around (HX, HZ); the library puts it at the origin
const HX = 0, HZ = 0;
