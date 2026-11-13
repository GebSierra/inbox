// ---------- NEW (plan item N2): people who do things ----------
// Library entries for townspeople in poses and roles, all built by upPerson (objects/up-c.js) with its pose, arms and prop options:
//   pose: 'stand' | 'sit' | 'kneel' | 'walk';  arms: 'reach' | 'pray';  prop: 'staff' | 'crook' | 'sickle' | 'scroll' | 'net' | 'bowl';  ring: true
// A town places one with person(x, z, rot, tunic, { pose, prop, ... }) exactly as before. No random numbers.
{ const via = (opts, tunic, sc = 1, extra) => (g, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); p.scale.setScalar(sc); g.add(p);
    upPerson(p, tunic, opts); if (extra) extra(p); return y + (opts.pose === 'sit' ? 1.35 : opts.pose === 'kneel' ? 1.4 : 1.75) * sc; };
  // a low stool for the seated figures (seat at 0.46)
  const stool = p => { const wd = mat('upStoolW', '#8a5c36', { roughness: .9 }); add(new THREE.BoxGeometry(.5, .05, .4), wd, 0, .44, -.05, p);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = add(new THREE.CylinderGeometry(.025, .03, .44, 6), wd, a * .2, 0, -.05 + b * .15, p); l.position.y = .22; } };
  const T = (id, label, tags, fn) => defObject(id, fn, { label, origin: 'plan N2', tags, kind: 'person' });
  T('shepherd', 'Shepherd with a crook', ['shepherd', 'field', 'flock'], via({ pose: 'walk', prop: 'crook', cloak: '#6a5238', hair: 2 }, '#a89070'));
  T('shepherd-boy', 'Shepherd boy with a staff', ['shepherd', 'child', 'field'], via({ pose: 'stand', prop: 'staff', hair: 0 }, '#c9a46a', .7));
  T('fisherman', 'Fisherman with a net over his shoulder', ['fisherman', 'sea', 'river'], via({ pose: 'stand', prop: 'net', hair: 1 }, '#7a8a96'));
  T('reaper', 'Farmer kneeling with a sickle', ['farmer', 'field', 'harvest'], via({ pose: 'kneel', prop: 'sickle', hair: 2 }, '#b8a070'));
  T('priest', 'Priest in white with a scroll', ['priest', 'temple', 'writing'], via({ pose: 'stand', prop: 'scroll', cloak: '#e8e0cc', hair: 3 }, '#f0ebe0'));
  T('rich-man', 'Rich man with a gold ring', ['rich', 'james', 'market'], via({ pose: 'stand', arms: 'reach', ring: true, cloak: '#c9a24a', hair: 1 }, '#5a2a6a'));
  T('poor-man', 'Poor man sitting with a bowl', ['poor', 'james', 'beggar'], via({ pose: 'sit', prop: 'bowl', hair: 2, skin: 1 }, '#8a7a62', 1, stool));
  T('elder', 'Elder with a staff', ['elder', 'gate', 'old'], via({ pose: 'stand', prop: 'staff', cloak: '#5a5048', hair: 3 }, '#8a8070'));
  T('seated-teacher', 'Teacher seated with a scroll', ['teacher', 'writing', 'school'], via({ pose: 'sit', prop: 'scroll', cloak: '#6a4a3a', hair: 3 }, '#d8ccb0', 1, stool));
  T('woman-praying', 'Woman kneeling in prayer', ['woman', 'prayer', 'temple'], via({ pose: 'kneel', arms: 'pray', veil: '#e8dcc4', fem: true }, '#8a5a4a'));
  T('walking-woman', 'Woman walking', ['woman', 'street'], via({ pose: 'walk', veil: '#d8c8a8', fem: true, skin: 2 }, '#4a6a8a'));
  T('child', 'Child', ['child', 'street', 'house'], via({ pose: 'walk', hair: 0, skin: 2 }, '#c8603a', .66)); }
