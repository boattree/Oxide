import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/PointerLockControls.js';

export class Renderer {
  constructor(canvas){
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({canvas, antialias:true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0025);
    // camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    // lighting
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5,10,7); this.scene.add(sun);

    // controls (pointer lock)
    this.controls = new PointerLockControls(this.camera, this.canvas);
    // click to lock
    this.canvas.addEventListener('click', ()=>{ this.controls.lock(); });
    this.scene.add(this.controls.getObject());

    // object groups
    this.terrain = null;
    this.nodesGroup = new THREE.Group(); this.scene.add(this.nodesGroup);
    this.structuresGroup = new THREE.Group(); this.scene.add(this.structuresGroup);
    this.animalsGroup = new THREE.Group(); this.scene.add(this.animalsGroup);

    // post-init
    window.addEventListener('resize', ()=> this.onResize());
    this.flashTimer = 0;
  }

  onResize(){
    this.camera.aspect = window.innerWidth/window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setTerrain(mesh){
    if(this.terrain) this.scene.remove(this.terrain);
    this.terrain = mesh; this.scene.add(mesh);
  }
  addNodeMesh(m){
    this.nodesGroup.add(m);
  }
  removeNodeMeshByName(name){
    const m = this.nodesGroup.getObjectByName(name);
    if(m) this.nodesGroup.remove(m);
  }
  addStructureMesh(m){ this.structuresGroup.add(m); }
  removeStructureMeshById(id){ const o = this.structuresGroup.getObjectByName(id); if(o) this.structuresGroup.remove(o); }
  addAnimalMesh(m){ this.animalsGroup.add(m); }

  update(dt, player){
    // simple day-night: rotate ambient light color (not physically accurate)
    const t = (performance.now()/10000)%1;
    const dl = this.scene.children.find(c => c.type === 'DirectionalLight');
    if(dl) dl.intensity = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);

    // flash visual on craft
    if(this.flashTimer > 0){
      this.flashTimer -= dt;
      this.renderer.setClearColor(0x88ffcc);
    } else {
      this.renderer.setClearColor(0x74b9ff);
    }

    this.renderer.render(this.scene, this.camera);
  }

  flashGreen(){ this.flashTimer = 0.2; }

  // rebuild scene after load
  rebuildSceneFromWorld(world, building, ai){
    // clear groups
    this.nodesGroup.clear(); this.structuresGroup.clear(); this.animalsGroup.clear();
    // terrain
    if(world.terrainMesh) this.setTerrain(world.terrainMesh);
    // nodes
    for(const n of world.resourceNodes){
      const mesh = createNodeMesh(n);
      mesh.name = n.id;
      this.addNodeMesh(mesh);
    }
    // structures
    for(const s of building.structures){
      const m = createStructureMesh(s);
      m.name = s.id;
      this.addStructureMesh(m);
    }
    // animals
    for(const a of ai.animals){
      const m = createAnimalMesh(a);
      m.name = a.id;
      this.addAnimalMesh(m);
    }
  }
}

// helper mesh factories (keep replicated functions consistent with worldgen/ai/building)
export function createNodeMesh(node){
  if(node.type==='tree'){
    const g = new THREE.CylinderGeometry(0.2,0.5,2,8);
    const trunk = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x6b3}));
    trunk.position.set(node.pos.x, node.pos.y + 1, node.pos.z);
    return trunk;
  } else {
    const g = new THREE.DodecahedronGeometry(0.6,0);
    const rock = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x777}));
    rock.position.set(node.pos.x, node.pos.y + 0.5, node.pos.z);
    return rock;
  }
}
export function createStructureMesh(s){
  if(s.type==='foundation'){
    const g = new THREE.BoxGeometry(1,0.25,1);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x8b5a2b}));
    m.position.set(s.pos.x+0.5, s.pos.y + 0.125, s.pos.z+0.5);
    return m;
  } else if(s.type==='wall'){
    const g = new THREE.BoxGeometry(1,1,0.2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x996}));
    m.position.set(s.pos.x+0.5, s.pos.y+0.5, s.pos.z+0.1);
    return m;
  } else if(s.type==='door'){
    const g = new THREE.BoxGeometry(0.8,1.2,0.1);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x444}));
    m.position.set(s.pos.x+0.5, s.pos.y+0.6, s.pos.z+0.5);
    return m;
  } else if(s.type==='storage'){
    const g = new THREE.BoxGeometry(0.8,0.6,0.6);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0x333}));
    m.position.set(s.pos.x+0.5, s.pos.y+0.3, s.pos.z+0.5);
    return m;
  }
  // fallback
  const g = new THREE.BoxGeometry(0.5,0.5,0.5);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0xff0}));
  m.position.set(s.pos.x, s.pos.y, s.pos.z);
  return m;
}
export function createAnimalMesh(a){
  const g = new THREE.SphereGeometry(0.4, 8, 8);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:0xffffff}));
  m.position.set(a.x, a.y, a.z);
  return m;
}
