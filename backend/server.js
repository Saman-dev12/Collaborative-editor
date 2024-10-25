"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_URL,
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)({
    origin: process.env.CORS_URL
}));
const rooms = new Map();
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('createRoom', () => {
        const roomId = (0, uuid_1.v4)();
        rooms.set(roomId, { code: "", language: '', users: new Set([socket.id]) });
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Room created: ${roomId} by user ${socket.id}`);
    });
    socket.on('joinRoom', (roomId) => {
        console.log(`User ${socket.id} attempting to join room ${roomId}`);
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            if (!room.users.has(socket.id)) {
                room.users.add(socket.id);
                socket.join(roomId);
                socket.emit('roomJoined', roomId);
                socket.emit('codeUpdate', room.code);
                socket.emit('languageUpdate', room.language);
                console.log(`User ${socket.id} joined room: ${roomId}`);
            }
            else {
                console.log(`User ${socket.id} is already in room ${roomId}`);
            }
        }
        else {
            socket.emit('roomError', 'Room does not exist');
        }
    });
    socket.on('codeChange', ({ roomId, newCode }) => {
        console.log(`Code change in room: ${roomId} by user ${socket.id}`);
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.code = newCode;
            socket.to(roomId).emit('codeUpdate', newCode);
            console.log(`Broadcasting new code to room: ${roomId}`);
        }
        else {
            console.log(`Room ${roomId} does not exist.`);
            socket.emit('roomError', 'Room does not exist');
        }
    });
    socket.on('languageChange', ({ roomId, newLanguage }) => {
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.language = newLanguage; // Update the room's language state
            socket.to(roomId).emit('languageUpdate', newLanguage);
        }
        else {
            socket.emit('roomError', 'Room does not exist');
        }
    });
    socket.on('leaveRoom', ({ roomId }) => {
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.users.delete(socket.id);
            socket.leave(roomId);
            if (room.users.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} has been deleted.`);
            }
        }
    });
    const cleanupRoom = (roomId, userId) => {
        const room = rooms.get(roomId);
        if (!room)
            return;
        room.users.delete(userId);
        if (room.users.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted as last user disconnected.`);
        }
        else {
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
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/health', (req, res) => {
    res.json({ ok: 'OK' });
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
