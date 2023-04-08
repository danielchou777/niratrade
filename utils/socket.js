import { Server } from 'socket.io';
import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
} from '../models/marketdataModels.js';

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

    socket.on('execution', async (data) => {
      const buyOrderBook = await getBuyOrderBook();
      const sellOrderBook = await getSellOrderBook();
      const executions = await getExecutions();
      io.emit('orderBook', { buyOrderBook, sellOrderBook });

      io.emit('marketTrade', { executions });
    });

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
