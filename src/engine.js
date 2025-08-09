import { Renderer } from './render.js';
import { World } from './worldgen.js';
import { Player } from './player.js';
import { Inventory } from './inventory.js';
import { Crafting } from './crafting.js';
import { Building } from './building.js';
import { AIManager } from './ai.js';
import { Persistence } from './persistence.js';
import { Network } from './network.js';
import { runTests } from './tests.js';

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas); // sets up Three.js scene
const world = new World(renderer);     // generates terrain & nodes and adds to scene
const persistence = new Persistence();
const inventory = new Inventory();
inventory.setWorld(world);
const crafting = new Crafting(inventory);
const building = new Building(world, renderer);
const ai = new AIManager(world, renderer);
const network = new Network();
const player = new Player(renderer.camera, world, inventory, building, renderer);

// load save if present
const save = persistence.load();
if (save) {
  world.deserialize(save.world);
  player.deserialize(save.player);
  inventory.deserialize(save.inventory);
  building.deserialize(save.structures);
  ai.deserialize(save.animals || []);
  renderer.rebuildSceneFromWorld(world, building, ai);
  showMessage('Loaded saved game');
}

// wire UI
document.addEventListener('keydown', evt=>{
  if (evt.key === 'i' || evt.key === 'I') toggleInventory();
  if (evt.key === 'c' || evt.key === 'C') toggleCrafting();
  if (evt.key === 'b' || evt.key === 'B') building.toggleBuildMode(player);
});
document.getElementById('closeInventory').onclick = ()=> document.getElementById('inventoryModal').classList.add('hidden');
document.getElementById('closeCrafting').onclick = ()=> document.getElementById('craftingModal').classList.add('hidden');

function toggleInventory(){
  const modal = document.getElementById('inventoryModal');
  modal.classList.toggle('hidden');
  renderInventory();
}
function toggleCrafting(){
  const modal = document.getElementById('craftingModal');
  modal.classList.toggle('hidden');
  renderCrafting();
}
function renderInventory(){
  const list = document.getElementById('inventoryList');
  list.innerHTML = '';
  for(const slot of inventory.getItems()){
    const d = document.createElement('div'); d.className='itemCard';
    d.innerHTML = `<div>${slot.name}</div><div>x${slot.qty}</div>`;
    list.appendChild(d);
  }
}
function renderCrafting(){
  const recipes = document.getElementById('recipes');
  recipes.innerHTML = '';
  for(const r of crafting.getRecipes()){
    const el = document.createElement('div'); el.className='itemCard';
    el.innerHTML = `<div>${r.name}</div><div><button data-id="${r.id}">Craft</button></div>`;
    recipes.appendChild(el);
    el.querySelector('button').onclick = ()=>{
      const ok = crafting.craft(r.id, player);
      if(!ok) showMessage('Missing materials or blueprint');
      else { renderInventory(); showMessage(`${r.name} crafted.`); renderer.flashGreen(); }
    };
  }
}
function showMessage(text, ms=2500){
  const el = document.getElementById('message'); el.textContent = text; el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'), ms);
}

// main loop
let last = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - last)/1000); last = now;
  player.update(dt);
  world.update(dt);
  ai.update(dt);
  building.update(dt);
  renderer.update(dt, player);
  // starvation
  if (player.hunger <= 0) player.takeDamage(8 * dt);
  // persist periodically
  persistence.save({
    world: world.serialize(),
    player: player.serialize(),
    inventory: inventory.serialize(),
    structures: building.serialize(),
    animals: ai.serialize()
  });
  requestAnimationFrame(loop);
}

runTests();
requestAnimationFrame(loop);
