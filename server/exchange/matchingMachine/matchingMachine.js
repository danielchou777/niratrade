import { Kafka } from 'kafkajs';

import socketIOClient from 'socket.io-client';
import cache from '../../utils/cache.js';

import buyExecution from './executionBuy.js';
import sellExecution from './executionSell.js';
import cancelExecution from './executionCancel.js';

// kafka setup
const clientId = 'my-app';
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId, brokers });

// socket io setup
const ENDPOINT =
  process.env.CACHE_ENV === 'production'
    ? 'http://172.31.14.46:3000'
    : 'http://localhost:3000';

const socketio = socketIOClient(ENDPOINT);

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

// create a new consumer from the kafka client, and set its group ID
const consumer = kafka.consumer({
  groupId: clientId,
  maxInFlightRequests: 1,
});

await consumer.connect();

await consumer.subscribe({ topics: ['stock-DAN', 'stock-APPL'] });

await consumer.run({
  eachMessage: async ({ message, topic, partition }) => {
    const { stockAmount, stockPriceOrder } = JSON.parse(message.value);
    let broadcastUsers = [];
    const stock = topic.split('-')[1];

    if (stockAmount.split(':')[0] === 'c') {
      broadcastUsers = await cancelExecution(stockAmount);
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

    // eslint-disable-next-line no-console
    console.debug(new Date(), 'executed: ', stockAmount, stockPriceOrder);

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
