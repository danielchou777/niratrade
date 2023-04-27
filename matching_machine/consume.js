import cache from '../utils/cache.js';

// kafka
import { Kafka } from 'kafkajs';
const clientId = 'my-app';
const brokers = ['localhost:9092'];
// const topic = 'stock-DAN';
const stocks = ['DAN', 'APPL'];
const kafka = new Kafka({ clientId, brokers });

// socket.io
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://localhost:3000';
const socketio = socketIOClient(ENDPOINT);

import buyExecution from './execution_buy.js';
import sellExecution from './execution_sell.js';
import { getUnfilledQuantity } from '../models/marketdataModels.js';
import {
  updateCancelOrder,
  updateUserLockedBalance,
  updateUserLockedStock,
} from '../models/orderManagerModels.js';

// create a new consumer from the kafka client, and set its group ID

async function pushExecutions(
  orderType,
  stockPrice,
  amount,
  time,
  stockSymbol
) {
  await cache.lpush(
    `executions-${stockSymbol}`,
    JSON.stringify({
      orderType,
      stockPrice,
      amount,
      time,
    })
  );

  const executionsLenth = await cache.llen(`executions-${stockSymbol}`);
  if (executionsLenth > 30) {
    await cache.ltrim(`executions-${stockSymbol}`, 0, 29);
  }
}

const consumer = kafka.consumer({
  groupId: clientId,
  maxInFlightRequests: 1,
});

await consumer.connect();

await consumer.subscribe({ topics: ['stock-DAN', 'stock-APPL'] });

await consumer.run({
  eachMessage: async ({ message, topic, partition }) => {
    let { stockAmount, stockPriceOrder } = JSON.parse(message.value);
    let broadcastUsers = [];
    const stock = topic.split('-')[1];

    console.log('reads: ', stockAmount, stockPriceOrder);

    if (stockAmount.split(':')[0] === 'c') {
      const side = stockAmount.split(':')[1];
      const orderIdCancel = stockAmount.split(':')[3];
      const unfilledQauntity = await getUnfilledQuantity(orderIdCancel);
      const userId = stockAmount.split(':')[4];
      const symbol = stockAmount.split(':')[5];
      const price = stockAmount.split(':')[6];

      // if buy side, remove from buyOrders cache
      if (side === 'b') {
        const stockCacheInfo = `b:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;
        console.log(`buyOrderBook-${symbol}`);
        console.log(stockCacheInfo);
        await cache.zrem(`buyOrderBook-${symbol}`, stockCacheInfo);

        // update order status to 4
        await updateCancelOrder(orderIdCancel, '4');

        console.log(price, unfilledQauntity);

        // update user balance
        await updateUserLockedBalance(userId, price * unfilledQauntity);
      }

      // if sell side, remove from sellOrders cache
      if (side === 's') {
        const stockCacheInfo = `s:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;
        await cache.zrem(`sellOrderBook-${symbol}`, stockCacheInfo);

        // update order status to 4
        await updateCancelOrder(orderIdCancel, '4');

        // update user balance
        await updateUserLockedStock(userId, symbol, unfilledQauntity);
      }

      broadcastUsers.push(userId);
    }

    const stockPrice = Math.floor(stockPriceOrder / 1000000000000);

    if (stockAmount.split(':')[0] === 's') {
      broadcastUsers = await sellExecution(
        stockPrice,
        stockPriceOrder,
        stockAmount,
        pushExecutions,
        stock
      );
    }

    if (stockAmount.split(':')[0] === 'b') {
      broadcastUsers = await buyExecution(
        stockPrice,
        stockPriceOrder,
        stockAmount,
        pushExecutions,
        stock
      );
    }

    // Commit the offset for the processed message
    await consumer.commitOffsets([
      { topic: `stock-${stock}`, partition, offset: message.offset },
    ]);

    const userId = stockAmount.split(':')[3];

    broadcastUsers.push(userId);

    socketio.emit('execution', `${stock}`);
    socketio.emit('users', broadcastUsers);
  },
});
