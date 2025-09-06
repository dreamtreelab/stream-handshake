const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });
console.log(`Signaling server running on ws://0.0.0.0:${port}`);

let connections = [];

wss.on('connection', ws => {
  connections.push(ws);

  ws.on('message', message => {
    // Broadcast to all other clients
    connections.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    connections = connections.filter(c => c !== ws);
  });
});

console.log("Signaling server running on ws://0.0.0.0:8080");
