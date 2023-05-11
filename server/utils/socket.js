import { Server } from 'socket.io';
import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
  getLastestChartData,
} from '../models/marketdataModels.js';

let io;

export const createSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('execution', async (data) => {
      const buyOrderBook = await getBuyOrderBook(data);
      const sellOrderBook = await getSellOrderBook(data);
      const executions = await getExecutions(data);
      const chartData = await getLastestChartData(data);

      io.emit(`orderBook-${data}`, { buyOrderBook, sellOrderBook });

      io.emit(`marketTrade-${data}`, { executions });

      io.emit(`marketChart-${data}`, { chartData });
    });

    socket.on('users', async (data) => {
      const users = [...new Set(data.map((item) => item))];

      for (let i = 0; i < users.length; i++) {
        io.emit(`user-${users[i]}`, { data: 'updated' });
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
