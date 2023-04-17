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

import cache from '../utils/cache.js';

// create a new consumer from the kafka client, and set its group ID
const consumer = kafka.consumer({ groupId: clientId, maxInFlightRequests: 1 });

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

for (let stock of stocks) {
  const consume = async () => {
    await consumer.connect();

    await consumer.subscribe({ topic: `stock-${stock}` });

    await consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        let { stockAmount, stockPriceOrder } = JSON.parse(message.value);
        let broadcastUsers = [];

        console.log('reads: ', stockAmount, stockPriceOrder);

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

        socketio.emit('execution', 'success');
        socketio.emit('users', broadcastUsers);
      },
    });
  };
  consume();
}
