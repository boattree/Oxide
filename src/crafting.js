export class Crafting {
  constructor(inventory){
    this.inventory = inventory;
    this.recipes = [
      {id:'campfire', name:'Campfire', cost:{wood:10}},
      {id:'wall_piece', name:'Wall Piece', cost:{wood:15}},
      {id:'workbench', name:'Workbench', cost:{wood:50, stone:20}, blueprint:'blueprint_workbench'},
      {id:'hatchet', name:'Hatchet', cost:{wood:5, stone:5}},
      {id:'pickaxe', name:'Pickaxe', cost:{wood:5, stone:10}}
    ];
  }
  getRecipes(){ return this.recipes.map(r=>({id:r.id, name:r.name})); }
  craft(id, player){
    const r = this.recipes.find(x=>x.id===id); if(!r) return false;
    if(r.blueprint && !(player.blueprints && player.blueprints.has(r.blueprint))) return false;
    for(const [it,qty] of Object.entries(r.cost)) if(!this.inventory.has(it,qty)) return false;
    for(const [it,qty] of Object.entries(r.cost)) this.inventory.remove(it,qty);
    this.inventory.add(id,1);
    return true;
  }
}
