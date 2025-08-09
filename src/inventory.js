export class Inventory {
  constructor(){
    this.items = {};
    this.world = null;
  }
  setWorld(world){ this.world = world; }
  add(id, qty=1){ this.items[id] = (this.items[id]||0) + qty; window.dispatchEvent(new Event('inventoryChanged')); }
  remove(id, qty=1){ if(!this.items[id]) return false; this.items[id] -= qty; if(this.items[id]<=0) delete this.items[id]; window.dispatchEvent(new Event('inventoryChanged')); return true; }
  has(id, qty=1){ return (this.items[id]||0) >= qty; }
  getItems(){ return Object.entries(this.items).map(([id,qty])=>({name:id, qty})); }
  findToolFor(type){
    if(type==='tree'){ if(this.has('hatchet')) return 'hatchet'; if(this.has('rock')) return 'rock'; }
    else { if(this.has('pickaxe')) return 'pickaxe'; if(this.has('rock')) return 'rock'; }
    return null;
  }
  serialize(){ return this.items; }
  deserialize(obj){ this.items = obj || {}; }
}
