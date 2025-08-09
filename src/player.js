import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { clamp } from './utils.js';

export class Player {
  constructor(camera, world, inventory, building, renderer){
    this.camera = camera; this.world = world; this.inventory = inventory; this.building = building; this.renderer = renderer;
    this.x = 0; this.z = 0; this.y = 2;
    this.health = 100; this.hunger = 100; this.stamina = 100;
    this.speed = 4;
    this.controls = renderer.controls;
    this.velocity = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.buildMode = false;
    this.initControls();
  }
  initControls(){
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
    // mouse click to interact (or E)
    window.addEventListener('keypress', e=>{
      if(e.key === 'e' || e.key === 'E') this.interact();
    });
  }

  update(dt){
    // movement relative to camera direction (first-person)
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

    if(this.keys['w']) dir.add(forward);
    if(this.keys['s']) dir.sub(forward);
    if(this.keys['a']) dir.sub(right);
    if(this.keys['d']) dir.add(right);

    if(dir.lengthSq() > 0){
      dir.normalize();
      this.velocity.x = dir.x * this.speed;
      this.velocity.z = dir.z * this.speed;
      this.stamina = clamp(this.stamina - 10*dt, 0, 100);
    } else {
      this.velocity.multiplyScalar(0.8);
      this.stamina = clamp(this.stamina + 20*dt, 0, 100);
    }
    this.x += this.velocity.x * dt;
    this.z += this.velocity.z * dt;
    // set y to terrain height + eye height
    const h = this.world.heightAt(this.x, this.z);
    this.y = h + 1.6;
    this.controls.getObject().position.set(this.x, this.y, this.z);
    // hunger drains
    this.hunger = clamp(this.hunger - 0.5*dt, 0, 100);
    // update HUD
    document.getElementById('health').textContent = Math.round(this.health);
    document.getElementById('hunger').textContent = Math.round(this.hunger);
    document.getElementById('stamina').textContent = Math.round(this.stamina);
  }

  interact(){
    // raycast from camera forward
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.raycaster.set(origin, dir);
    const nodes = Array.from(this.renderer.nodesGroup.children);
    const intersects = this.raycaster.intersectObjects(nodes, false);
    if(intersects.length){
      const hit = intersects[0].object;
      // find resource node in world by name
      const node = this.world.resourceNodes.find(n=>n.id === hit.name);
      if(node){
        // harvest
        const tool = this.inventory.findToolFor(node.type);
        const yieldCount = tool ? 2 + Math.floor(Math.random()*2) : 1;
        if(node.type==='tree') this.inventory.add('wood', yieldCount);
        else this.inventory.add('stone', yieldCount);
        node.remaining--;
        // remove mesh if depleted
        if(node.remaining <= 0){
          this.world.resourceNodes = this.world.resourceNodes.filter(n=>n.id !== node.id);
          this.renderer.removeNodeMeshByName(node.id);
        }
        return;
      }
    }

    // check monuments (chest)
    for(const m of this.world.monuments){
      const d = Math.hypot(m.pos.x - this.x, m.pos.z - this.z);
      if(d < 3){
        // pick weighted loot
        const pool = m.chest;
        const total = pool.reduce((s,p)=>s+p.weight,0);
        let pick = Math.random()*total;
        for(const p of pool){
          pick -= p.weight;
          if(p<=0){
            this.inventory.add(p.id, p.qty);
            if(p.id.startsWith('blueprint')) this.addBlueprint(p.id);
            window.dispatchEvent(new Event('inventoryChanged'));
            alert(`Looted ${p.id}`);
            return;
          }
        }
      }
    }

    // building placement
    this.building.tryPlaceAt(Math.round(this.x), Math.round(this.z), this);
  }

  addBlueprint(id){ this.blueprints = this.blueprints || new Set(); this.blueprints.add(id); }

  takeDamage(n){
    this.health -= n;
    if(this.health <= 0) this.die();
  }
  die(){
    alert('You died. Respawning...');
    this.health = 100; this.hunger = 100; this.x = 0; this.z = 0; this.controls.getObject().position.set(0,2,0);
  }

  serialize(){
    return { x:this.x, z:this.z, health:this.health, hunger:this.hunger, blueprints: Array.from(this.blueprints || []) };
  }
  deserialize(obj){
    if(!obj) return;
    this.x = obj.x; this.z = obj.z; this.health = obj.health; this.hunger = obj.hunger;
    this.controls.getObject().position.set(this.x, this.world.heightAt(this.x,this.z)+1.6, this.z);
    this.blueprints = new Set(obj.blueprints || []);
  }
}
