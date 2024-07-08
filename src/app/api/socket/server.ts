import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const rooms: Record<string, number> = {}; 

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    path: '/api/socket',
  });

  // Function to update and broadcast room list
  const updateRoomList = () => {
    io.emit('updateRooms', Object.keys(rooms));
  };

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('joinRoom', ({ room, name }) => {
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
    });

    socket.on('message', (msg) => {
      io.to(msg.room).emit('message', msg);
    });

    socket.on('leaveRoom', ({ room, name }) => {
      socket.leave(room);
      if (rooms[room]) {
        rooms[room]--;
        if (rooms[room] === 0) {
          delete rooms[room];
        }
        updateRoomList();
      }
      socket.to(room).emit('message', { name: 'SystemLeft', message: `${name.toUpperCase()} left`, room });
      console.log(`${name.toUpperCase()} has left room ${room}`);
    });

    socket.on('disconnect', () => {
      const room = socket.data.room;
      const name = socket.data.name;

      if (room && name) {
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

      console.log('Client disconnected', socket.id);
    });
  });

  server.get('/api/rooms', (req: Request, res: Response) => {
    res.json(Object.keys(rooms));
  });

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  const DOMAIN=process.env.DOMAIN || "http://localhost:3000"
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on ${DOMAIN}`);
  });
});
