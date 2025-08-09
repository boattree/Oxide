export class Persistence {
  constructor(){ this.key = 'rust3d_save_v1'; }
  save(obj){
    try{ localStorage.setItem(this.key, JSON.stringify(obj)); } catch(e){ console.warn('Save failed', e); }
  }
  load(){ try{ const s = localStorage.getItem(this.key); return s ? JSON.parse(s) : null; } catch(e){ return null; } }
  clear(){ localStorage.removeItem(this.key); }
}
