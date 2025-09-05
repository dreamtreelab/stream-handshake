const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // allow browser connections
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Forward signaling messages
  socket.on('signal', (data) => {
    const { target, signal } = data;
    if (io.sockets.sockets.get(target)) {
      io.to(target).emit('signal', { from: socket.id, signal });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
