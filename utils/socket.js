import { Server } from 'socket.io';

let io;

export const createSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
