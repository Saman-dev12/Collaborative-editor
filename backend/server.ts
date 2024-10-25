import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

interface Room {
  code: string;
  users: Set<string>;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);

  socket.on('createRoom', () => {
    const roomId = uuidv4();
    rooms.set(roomId, { code: "", users: new Set([socket.id]) });
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    console.log(`Room created: ${roomId} by user ${socket.id}`);
  });

  socket.on('joinRoom', (roomId: string) => {
    console.log(`User ${socket.id} attempting to join room ${roomId}`);
    if (rooms.has(roomId)) {
      socket.join(roomId);
      const room = rooms.get(roomId)!;
      room.users.add(socket.id);
      socket.emit('roomJoined', roomId);
      socket.emit('codeUpdate', room.code);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });

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

  socket.on('disconnecting', () => {
    console.log(`User ${socket.id} disconnecting`);
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          socket.to(roomId).emit('userDisconnected', socket.id);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));