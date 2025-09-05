const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // allow browser connections
});

// Track connected Unity clients and browsers
let unityClients = {}; // key: socket.id, value: { type: 'unity' }
let browsers = {};     // key: socket.id, value: { type: 'browser' }

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register', (data) => {
    if (data.type === 'unity') {
      unityClients[socket.id] = socket;
      console.log('Registered Unity client:', socket.id);
    } else if (data.type === 'browser') {
      browsers[socket.id] = socket;
      console.log('Registered Browser:', socket.id);

      // notify Unity of new browser
      const unityIds = Object.keys(unityClients);
      if (unityIds.length > 0) {
        // for simplicity, pick first Unity instance
        const unitySocket = unityClients[unityIds[0]];
        unitySocket.emit('new_browser', { browserId: socket.id });
      }
    }
  });

  // Relay SDP/ICE between Unity and browser
  socket.on('signal', (data) => {
    const { target, signal } = data;
    if (io.sockets.sockets.get(target)) {
      io.to(target).emit('signal', { from: socket.id, signal });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete unityClients[socket.id];
    delete browsers[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
