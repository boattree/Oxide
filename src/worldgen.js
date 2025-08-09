import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { createNodeMesh } from './render.js';

// small perlin-like noise
function noise2(x,y){
  // value-noise fallback
  const s = Math.sin(x*12.9898 + y*78.233) * 43758.5453;
  return s - Math.floor(s);
}

export class World {
  constructor(renderer, size=64){
    this.renderer = renderer;
    this.size = size;
    this.terrainMesh = null;
    this.resourceNodes = []; // {id,type,pos:{x,y,z},remaining}
    this.monuments = [];
    this.generate();
  }

  generate(){
    // create heightmap in a grid
    const planeRes = this.size;
    const geom = new THREE.PlaneGeometry(this.size, this.size, planeRes, planeRes);
    geom.rotateX(-Math.PI/2);
    for(let i=0;i<geom.attributes.position.count;i++){
      const vx = geom.attributes.position.getX(i);
      const vz = geom.attributes.position.getZ(i);
      const h = this.sampleHeight(vx * 0.2, vz * 0.2);
      geom.attributes.position.setY(i, h);
    }
    geom.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color:0x2b8d3e, flatShading:false });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    this.terrainMesh = mesh;
    this.renderer.setTerrain(mesh);

    // spawn resources: scatter nodes where height > threshold
    this.resourceNodes = [];
    let idx = 0;
    for(let xi=-this.size/2; xi < this.size/2; xi+=2){
      for(let zi=-this.size/2; zi < this.size/2; zi+=2){
        const h = this.heightAt(xi, zi);
        if(h > 0.3 && Math.random() < 0.1){
          const type = Math.random() > 0.5 ? 'tree' : 'rock';
          const node = { id:`node_${idx++}`, type, pos:{ x: xi + (Math.random()-0.5), y: h, z: zi + (Math.random()-0.5) }, remaining: 4 };
          this.resourceNodes.push(node);
          const meshNode = createNodeMesh(node);
          meshNode.name = node.id;
          this.renderer.addNodeMesh(meshNode);
        }
      }
    }
    // monuments: small chest at corner
    this.monuments = [{ id:'mon_1', pos:{x: -this.size/2 + 3, z: -this.size/2 + 3, y:this.heightAt(-this.size/2+3, -this.size/2+3)}, chest: [
      {id:'wood', qty:30, weight:50},
      {id:'stone', qty:20, weight:35},
      {id:'blueprint_workbench', qty:1, weight:15}
    ]}];
  }

  sampleHeight(x, z){
    // combine octaves
    let h = 0;
    h += (noise2(x*1, z*1) - 0.5) * 1.0;
    h += (noise2(x*2, z*2) - 0.5) * 0.5;
    h += (noise2(x*4, z*4) - 0.5) * 0.25;
    return h * 1.5;
  }
  heightAt(x,z){
    // sample same as sampleHeight but deterministic
    return this.sampleHeight(x*0.2, z*0.2);
  }

  update(dt){
    // day cycle placeholder
  }

  // serialization
  serialize(){
    return {
      size:this.size,
      resourceNodes:this.resourceNodes,
      monuments:this.monuments
    };
  }
  deserialize(obj){
    if(!obj) return;
    this.size = obj.size;
    this.resourceNodes = obj.resourceNodes || [];
    this.monuments = obj.monuments || [];
    // rebuild node meshes
    for(const n of this.resourceNodes){
      const m = createNodeMesh(n);
      m.name = n.id;
      this.renderer.addNodeMesh(m);
    }
  }
}
