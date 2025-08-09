export class Network {
  constructor(){ this.socket = null; }
  connect(url){
    this.socket = new WebSocket(url);
    this.socket.onopen = ()=> console.log('WS connected');
    this.socket.onmessage = ev => console.log('WS ->', ev.data);
    this.socket.onclose = ()=> console.log('WS closed');
  }
  sendAction(action){
    if(!this.socket || this.socket.readyState !== 1) return;
    this.socket.send(JSON.stringify({type:'player_action', payload:action}));
  }
}
/* Example server notes (Node.js + socket.io):
const io = require('socket.io')(3000);
io.on('connection', socket=>{
  socket.on('player_action', msg => {
    // server authoritative validation
    socket.broadcast.emit('server_update', { ... });
  });
});
*/
