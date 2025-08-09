import { createStructureMesh } from './render.js';

export class Building {
  constructor(world, renderer){
    this.world = world; this.renderer = renderer;
    this.structures = [];
    this.buildMode = false;
  }
  toggleBuildMode(player){
    this.buildMode = !this.buildMode;
    alert(`Build mode ${this.buildMode ? 'enabled' : 'disabled'}. Press E to place a 2x2 base (needs 4 wall_piece).`);
  }
  tryPlaceAt(x, z, player){
    if(!this.buildMode){
      // try interact with nearby door/storage
      const s = this.structures.find(s=>Math.hypot(s.pos.x - x, s.pos.z - z) < 1 && s.type==='door');
      if(s){ s.locked = !s.locked; alert(`Door ${s.locked?'locked':'unlocked'}`); }
      return;
    }
    if(player.inventory.has('wall_piece',4)){
      // place 2x2 foundations and a door & storage
      const placed = [];
      for(let ox=0;ox<2;ox++){
        for(let oz=0; oz<2; oz++){
          const sObj = { id: genId(), owner: player.name || 'Player', type:'foundation', pos:{x: x+ox, z: z+oz}, health:100, maxHealth:100 };
          this.structures.push(sObj);
          const mesh = createStructureMesh(sObj); mesh.name = sObj.id;
          this.renderer.addStructureMesh(mesh);
          placed.push(sObj.id);
        }
      }
      // door
      const d = { id: genId(), owner:player.name||'Player', type:'door', pos:{x:x, z:z-1}, health:80, maxHealth:80, locked:false };
      this.structures.push(d); this.renderer.addStructureMesh(createStructureMesh(d));
      // storage
      const st = { id: genId(), owner:player.name||'Player', type:'storage', pos:{x:x, z:z}, health:60, maxHealth:60, inventory:{} };
      this.structures.push(st); this.renderer.addStructureMesh(createStructureMesh(st));
      player.inventory.remove('wall_piece',4);
      player.structuresOwned = player.structuresOwned || [];
      player.structuresOwned.push(...placed);
      alert('Placed 2x2 base.');
    } else {
      alert('Need 4 wall pieces to build a 2x2 base.');
    }
  }
  update(dt){
    // small decay
    for(const s of this.structures){
      s.health -= 0.002 * dt;
    }
    // remove destroyed
    const removed = this.structures.filter(s=>s.health<=0);
    for(const r of removed){ this.renderer.removeStructureMeshById(r.id); }
    this.structures = this.structures.filter(s=>s.health>0);
  }
  applyDamage(id, dmg){
    const s = this.structures.find(x=>x.id===id); if(!s) return false;
    s.health -= dmg; if(s.health<=0){ this.renderer.removeStructureMeshById(id); return true; } return false;
  }
  serialize(){ return this.structures; }
  deserialize(arr){
    this.structures = arr || [];
    for(const s of this.structures){
      const m = createStructureMesh(s); m.name = s.id; this.renderer.addStructureMesh(m);
    }
  }
}

function genId(){ return 's_'+Math.random().toString(36).slice(2,9); }
