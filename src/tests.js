export function runTests(){
  console.log('Running small 3D prototype tests...');
  // inventory test
  const inv = { items:{}, add(id,qty){ this.items[id]=(this.items[id]||0)+qty; } };
  inv.add('wood',3);
  console.assert(inv.items['wood']===3, 'Inventory add OK');
  // building damage test
  let s = {health:50};
  const dmg=(d)=>{ s.health -= d; return s.health<=0; };
  console.assert(!dmg(20), 'structure not destroyed');
  console.assert(dmg(40) === true, 'structure destroyed after cumulative dmg');
  console.log('Tests done.');
}
