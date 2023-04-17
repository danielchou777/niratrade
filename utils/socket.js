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
      const buyOrderBook = await getBuyOrderBook(data);
      const sellOrderBook = await getSellOrderBook(data);
      const executions = await getExecutions(data);

      io.emit(`orderBook-${data}`, { buyOrderBook, sellOrderBook });

      io.emit(`marketTrade-${data}`, { executions });
    });

    socket.on('users', async (data) => {
      for (let i = 0; i < data.length; i++) {
        io.emit(`user-${data[i]}`, { data: 'updated' });
      }
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
