import { createAnimalMesh } from './render.js';

export class AIManager {
  constructor(world, renderer){
    this.world = world; this.renderer = renderer;
    this.animals = [];
    this.spawnInitial();
  }
  spawnInitial(){
    for(let i=0;i<8;i++){
      const x = (Math.random()-0.5) * this.world.size;
      const z = (Math.random()-0.5) * this.world.size;
      const y = this.world.heightAt(x,z) + 0.4;
      const a = { id: 'a_'+i, x, y, z, hp:8 };
      this.animals.push(a);
      const m = createAnimalMesh(a); m.name = a.id; this.renderer.addAnimalMesh(m);
    }
  }
  update(dt){
    for(const a of this.animals){
      a.x += (Math.random()-0.5) * dt * 2;
      a.z += (Math.random()-0.5) * dt * 2;
      a.y = this.world.heightAt(a.x, a.z) + 0.4;
      const mesh = this.renderer.animalsGroup.getObjectByName(a.id);
      if(mesh) mesh.position.set(a.x, a.y, a.z);
    }
  }
  killAnimal(id, inventory){
    const idx = this.animals.findIndex(a=>a.id===id);
    if(idx>=0){
      inventory.add('meat',2); inventory.add('hide',1);
      const a = this.animals[idx];
      const m = this.renderer.animalsGroup.getObjectByName(a.id); if(m) this.renderer.animalsGroup.remove(m);
      this.animals.splice(idx,1);
    }
  }
  serialize(){ return this.animals; }
  deserialize(arr){
    this.animals = arr || [];
    for(const a of this.animals){
      const m = createAnimalMesh(a); m.name = a.id; this.renderer.addAnimalMesh(m);
    }
  }
}
