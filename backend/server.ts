import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);

// Update the CORS configuration in `io` and `express`
const corsOptions = {
  origin: process.env.CORS_URL,
  methods: ['GET', 'POST'],
  credentials: true
};

// Apply CORS to Express and Socket.io
app.use(cors(corsOptions));

const io = new Server(server);

// Define the Room interface
interface Room {
  code: string;
  language: string;
  users: Set<string>;
}

const rooms = new Map<string, Room>();

// Handle socket connections
io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);

  // Event to create a new room
  socket.on('createRoom', () => {
    const roomId = uuidv4();
    rooms.set(roomId, { code: '', language: '', users: new Set([socket.id]) });
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    console.log(`Room created: ${roomId} by user ${socket.id}`);
  });

  // Event to join an existing room
  socket.on('joinRoom', (roomId: string) => {
    console.log(`User ${socket.id} attempting to join room ${roomId}`);
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      if (!room.users.has(socket.id)) {
        room.users.add(socket.id);
        socket.join(roomId);
        socket.emit('roomJoined', roomId);
        socket.emit('codeUpdate', room.code);
        socket.emit('languageUpdate', room.language);
        console.log(`User ${socket.id} joined room: ${roomId}`);
      } else {
        console.log(`User ${socket.id} is already in room ${roomId}`);
      }
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });

  // Event to handle code changes
  socket.on('codeChange', ({ roomId, newCode }: { roomId: string; newCode: string }) => {
    console.log(`Code change in room: ${roomId} by user ${socket.id}`);
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.code = newCode;
      socket.to(roomId).emit('codeUpdate', newCode);
      console.log(`Broadcasting new code to room: ${roomId}`);
    } else {
      console.log(`Room ${roomId} does not exist.`);
      socket.emit('roomError', 'Room does not exist');
    }
  });

  // Event to handle language changes
  socket.on('languageChange', ({ roomId, newLanguage }: { roomId: string; newLanguage: string }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.language = newLanguage;
      socket.to(roomId).emit('languageUpdate', newLanguage);
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });

  // Event to leave a room
  socket.on('leaveRoom', ({ roomId }: { roomId: string }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.users.delete(socket.id);
      socket.leave(roomId);
      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} has been deleted.`);
      }
    }
  });

  // Function to clean up a room when a user disconnects
  const cleanupRoom = (roomId: string, userId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.users.delete(userId);
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted as last user disconnected.`);
    } else {
      io.to(roomId).emit('userDisconnected', userId);
    }
  };

  // Event for when a user is disconnecting
  socket.on('disconnecting', () => {
    console.log(`User ${socket.id} disconnecting`);
    for (const roomId of socket.rooms) {
      cleanupRoom(roomId, socket.id);
    }
  });

  // Event for when a user disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Basic routes for health check and home
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.json({ ok: 'OK' });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
