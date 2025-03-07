import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Update the CORS configuration in `io` and `express`
const corsOptions = {
  origin: process.env.CORS_URL,
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

interface Room {
  code: string;
  language: string;
  users: Set<string>;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket: Socket) => {
  console.log('New client connected', socket.id);


  socket.on('createRoom', () => {
    const roomId = uuidv4();
    rooms.set(roomId, { code: '', language: 'javascript', users: new Set([socket.id]) });
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    console.log(`Room created: ${roomId} by user ${socket.id}`);
  });


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

  socket.on('languageChange', ({ roomId, newLanguage }: { roomId: string; newLanguage: string }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.language = newLanguage;
      socket.to(roomId).emit('languageUpdate', newLanguage);
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });

  socket.on('getRooms', () => {
    const roomList = Array.from(rooms.keys());
    socket.emit('roomList', roomList);
  });

  socket.on('getRoomUsers', (roomId: string) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      const usersInRoom = Array.from(room.users);
      socket.emit('roomUsers', usersInRoom);
    } else {
      socket.emit('roomError', 'Room does not exist');
    }
  });


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

  socket.on('disconnecting', () => {
    console.log(`User ${socket.id} disconnecting`);
    for (const roomId of socket.rooms) {
      cleanupRoom(roomId, socket.id);
    }
  });

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

app.post('/execute',async(req,res)=>{
  const {language, code,ext} = req.body;
  console.log(language,code);
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language,
        version: "*",
        files: [
          {
            content: code
          }
        ]
      })
    })
    if(response.ok){
      const data = await response.json();
      console.log(data);
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Internal Server Error"});
  }
  
})

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
