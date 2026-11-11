// ---------- OBJECT LIBRARY: people (kind "person") ----------
// Wrappers around person() (engine/people.js): a low-poly townsperson with a tunic colour and options
//   { skin: 0-2, hair: 0-3, cloak: '#hex', veil: '#hex', armsUp: true, carry: 'jar' | 'basket' }.
// Every builder is (g, x, y, z) => topY and stands on the floor at (x, y, z), facing +z.
{
  const folk = (tunic, opts = {}, rot = 0) => (g, x, y, z) => viaScene(g, x, y, z, () => { person(0, 0, rot, tunic, { ...opts, y: 0 }); });
  const T = (fn, id, label, origin, kind, tags, args) => defObject(id, fn, { label, origin, tags, args, kind });

  // Colossae 1.1: the guard at the city gate (the spear and the shield are his, as in the gate room)
  const gateGuard = (g, x, y, z) => viaScene(g, x, y, z, sub => {
    person(0, 0, Math.PI * .15, '#9a2a2a', { cloak: '#6a1a1a', hair: 1, y: 0 });
    box(.05, 2.4, .05, 'wood', .3, 0, .2, sub); add(new THREE.ConeGeometry(.07, .3, 4), mat('iron', '#3c3a38', { metalness: .4, roughness: .6 }), .3, 2.55, .2, sub);
    const sh = add(new THREE.CylinderGeometry(.42, .42, .08, 14), mat('shield', '#9a2a2a'), -.35, .75, .05, sub); sh.rotation.z = Math.PI / 2; sh.rotation.y = .3;
    add(new THREE.SphereGeometry(.1, 8, 5), mat('brass', '#b8893a', { metalness: .5, roughness: .4 }), -.4, .75, .05, sub); });
  T(gateGuard, 'gate-guard', 'Gate guard with spear and shield', 'colossae 1.1', 'person', ['guard', 'gate', 'war']);

  // Colossae 1.6: the woman at the well
  T(folk('#d9c39a', { carry: 'jar', veil: '#e8dcc4', skin: 1 }, .5), 'woman-with-water-jar', 'Woman carrying a water jar on her head', 'colossae 1.6', 'person', ['well', 'water', 'woman']);

  // the merchants who stand behind the market stalls (Colossae 1.2 to 1.5)
  T(folk('#7a3b6a', { skin: 0, hair: 1, armsUp: true }, -.5), 'merchant-purple-tunic', 'Merchant in a purple tunic, arms raised to call his wares', 'colossae 1.2', 'person', ['market', 'merchant', 'man']);
  T(folk('#3f6f9a', { skin: 1, hair: 2 }, -.5), 'merchant-blue-tunic', 'Merchant in a blue tunic', 'colossae 1.3', 'person', ['market', 'merchant', 'man']);
  T(folk('#c43a2e', { skin: 1, hair: 1 }, -.5), 'merchant-red-tunic', 'Merchant in a red tunic', 'colossae 1.4', 'person', ['market', 'merchant', 'man']);
  T(folk('#5a4a6a', { skin: 2, hair: 2 }, -.5), 'merchant-plum-tunic', 'Merchant in a plum tunic', 'colossae 1.5', 'person', ['market', 'merchant', 'man']);

  // people in the street and around the town (colossae-ltm/world/town.js)
  T(folk('#8a5a3a', { cloak: '#5a3a2a', hair: 3 }, .3), 'man-in-brown-cloak', 'Man in a brown cloak', 'colossae kit', 'person', ['walker', 'man']);
  T(folk('#3f6f9a', { carry: 'basket', skin: 2 }, -2.4), 'woman-with-basket', 'Woman carrying a basket on her head', 'colossae kit', 'person', ['walker', 'woman', 'basket']);
  T(folk('#efe6d4', { cloak: '#9a2a2a', hair: 3 }, 1), 'man-in-red-cloak', 'Man in a red cloak', 'colossae kit', 'person', ['walker', 'man']);
  T(folk('#e8dcc4', { armsUp: true }, -2), 'man-arms-raised', 'Man with raised arms', 'colossae kit', 'person', ['walker', 'man', 'gesture']);
  T(folk('#c79a3a', { veil: '#3f6f9a', skin: 2 }, .4), 'woman-in-blue-veil', 'Woman in a blue veil', 'colossae kit', 'person', ['walker', 'woman']);
  T(folk('#9a4a3a', { veil: '#e0b44a', skin: 2 }, 2.2), 'woman-in-gold-veil', 'Woman in a gold veil', 'colossae 3.1', 'person', ['house', 'woman']);
  T(folk('#5a6a3a', {}, 0), 'villager-green-tunic', 'Villager in a green tunic', 'colossae kit', 'person', ['walker', 'man']);
  T(folk('#8a6a4a', { cloak: '#6a4a2a', carry: 'basket' }, 1.57), 'road-traveller-with-basket', 'Traveller on the road with a basket', 'colossae 4.3', 'person', ['walker', 'travel', 'basket']);
  T(folk('#5a4a3a', { hair: 1 }, 3.4), 'traveller-dark-hair', 'Traveller in a dark tunic', 'colossae 4.3', 'person', ['walker', 'travel', 'man']);
  T(folk('#c9a46a', { carry: 'jar', veil: '#c43a2e' }, 1.2), 'woman-with-jar-red-veil', 'Woman with a jar and a red veil', 'colossae kit', 'person', ['walker', 'woman', 'water']);
  T(folk('#7a8a5a', {}, 2), 'villager-olive-tunic', 'Villager in an olive tunic', 'colossae kit', 'person', ['walker', 'woman']);
  T(folk('#a8714c', { cloak: '#3a4a6a' }, -1), 'man-in-blue-cloak', 'Man in a blue cloak', 'colossae kit', 'person', ['walker', 'man']);
}
