const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config()

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  
  socket.on('createRoom', () => {
    const roomId = uuidv4();
    rooms.set(roomId, { code: "", users: new Set() });
    socket.join(roomId);
    rooms.get(roomId).users.add(socket.id);
    socket.emit('roomCreated', roomId); // Notify the client that the room is created
    console.log(`Room created: ${roomId}`);
  });


  socket.on('joinRoom', (roomId) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      rooms.get(roomId).users.add(socket.id);
      socket.emit('roomJoined', roomId);
      const code = rooms.get(roomId).code; // Send current code to the new user
      socket.emit('codeUpdate', code);
      console.log(`User joined room: ${roomId}`);
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });


  socket.on('codeChange', ({ room, newValue }) => {
    console.log(`Code change in room: ${room}, New value: ${newValue}`);
    if (rooms.has(room)) {
      rooms.get(room).code = newValue; 
      socket.to(room).emit('codeUpdate', newValue);
    }
  });


  socket.on('cursorUpdate', ({ roomId, cursor }) => {
    socket.to(roomId).emit('cursorUpdate', { userId: socket.id, cursor });
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (rooms.has(room)) {
        rooms.get(room).users.delete(socket.id);
        if (rooms.get(room).users.size === 0) {
          rooms.delete(room); // Remove the room if no users are left
          console.log(`Room deleted: ${room}`);
        } else {
          io.to(room).emit('userDisconnected', socket.id); // Notify others in the room about the disconnection
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
