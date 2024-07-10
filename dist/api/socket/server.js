"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const rooms = {};
app.prepare().then(() => {
    const server = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(server);
    const io = new socket_io_1.Server(httpServer, {
        path: '/api/socket',
    });
    // Error handling
    io.on('error', (err) => {
        console.error('Socket.IO error:', err);
        // Handle error as needed
    });
    // Function to update and broadcast room list
    const updateRoomList = () => {
        io.emit('updateRooms', Object.keys(rooms));
    };
    const participantsCount = () => {
        io.emit('participants', Object.keys(rooms).map(room => ({ room, participants: rooms[room] })));
    };
    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);
        socket.on('joinRoom', ({ room, name }) => {
            try {
                // Initialize the room if it doesn't exist
                if (!rooms[room]) {
                    rooms[room] = 0;
                }
                rooms[room]++;
                socket.join(room);
                socket.data.room = room;
                socket.data.name = name;
                // Emit system message and update room list
                socket.to(room).emit('message', { name: 'SystemJoin', message: `${name.toUpperCase()} joined`, room });
                console.log(`${name.toUpperCase()} has joined room ${room}`);
                updateRoomList();
                participantsCount();
            }
            catch (error) {
                console.error('Error joining room:', error);
                // Handle error as needed
            }
        });
        socket.on('message', (msg) => {
            try {
                io.to(msg.room).emit('message', msg);
            }
            catch (error) {
                console.error('Error sending message:', error);
                // Handle error as needed
            }
        });
        socket.on('leaveRoom', ({ room, name }) => {
            try {
                socket.leave(room);
                if (rooms[room]) {
                    rooms[room]--;
                    if (rooms[room] === 0) {
                        delete rooms[room];
                    }
                    updateRoomList();
                    participantsCount();
                }
                socket.to(room).emit('message', { name: 'SystemLeft', message: `${name.toUpperCase()} left`, room });
                console.log(`${name.toUpperCase()} has left room ${room}`);
            }
            catch (error) {
                console.error('Error leaving room:', error);
                // Handle error as needed
            }
        });
        socket.on('disconnect', () => {
            const room = socket.data.room;
            const name = socket.data.name;
            if (room && name) {
                try {
                    if (rooms[room]) {
                        rooms[room]--;
                        if (rooms[room] === 0) {
                            delete rooms[room];
                        }
                        updateRoomList();
                    }
                    // socket.to(room).emit('message', { name: 'SystemLeft', message: `${name.toUpperCase()} left`, room });
                    // console.log(`${name.toUpperCase()} has left room ${room}`);
                }
                catch (error) {
                    console.error('Error disconnecting client:', error);
                    // Handle error as needed
                }
            }
            console.log('Client disconnected', socket.id);
        });
    });
    server.get('/api/rooms', (req, res) => {
        try {
            res.json(Object.keys(rooms));
        }
        catch (error) {
            console.error('Error fetching rooms:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    server.all('*', (req, res) => {
        try {
            return handle(req, res);
        }
        catch (error) {
            console.error('Error handling request:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
