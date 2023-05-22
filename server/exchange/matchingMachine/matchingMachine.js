import { Kafka } from 'kafkajs';

import socketIOClient from 'socket.io-client';
import processBuyOrder from './executionBuy.js';
import sellExecution from './executionSell.js';
import cancelExecution from './executionCancel.js';

async function setupKafka(symbol) {
  const clientId = symbol;
  const brokers = ['localhost:9092'];
  const kafka = new Kafka({ clientId, brokers });
  const consumer = kafka.consumer({
    groupId: clientId,
    maxInFlightRequests: 1,
  });

  await consumer.connect();

  await consumer.subscribe({ topics: [`stock-${symbol}`] });
  return { consumer };
}

async function setupSocketIO() {
  const ENDPOINT =
    process.env.CACHE_ENV === 'production'
      ? 'http://172.31.14.46:3000'
      : 'http://localhost:3000';

  const socketio = socketIOClient(ENDPOINT);

  return { socketio };
}

async function processOrder(
  { message, topic, partition },
  { socketio },
  consumer
) {
  // order details Info [side]:[amount]:[orderId]:[userId]:[symbol]
  const { orderDetails, stockPriceOrder } = JSON.parse(message.value);
  const stockPrice = Math.floor(stockPriceOrder / 1000000000000);
  const stock = topic.split('-')[1];
  const side = orderDetails.split(':')[0];
  let broadcastUsers = [];

  if (side === 'c') {
    broadcastUsers = await cancelExecution(orderDetails);
  }

  if (side === 's') {
    broadcastUsers = await sellExecution(
      stockPrice,
      stockPriceOrder,
      orderDetails,
      stock
    );
  }

  if (side === 'b') {
    broadcastUsers = await processBuyOrder(
      stockPrice,
      stockPriceOrder,
      orderDetails,
      stock
    );
  }

  console.debug(new Date(), 'executed:', orderDetails, stockPriceOrder);

  // Commit the offset for the processed message
  await consumer.commitOffsets([
    { topic: `stock-${stock}`, partition, offset: message.offset },
  ]);

  const userId = orderDetails.split(':')[3];
  broadcastUsers.push(userId);

  socketio.emit('execution', `${stock}`);
  socketio.emit('users', broadcastUsers);
}

async function main(symbol) {
  try {
    const { consumer } = await setupKafka(symbol);
    const { socketio } = await setupSocketIO();

    await consumer.run({
      eachMessage: async (message) => {
        try {
          await processOrder(message, { socketio }, consumer);
        } catch (error) {
          console.error(error);
        }
      },
    });
  } catch (error) {
    console.error(error);
  }
}

const stocks = ['DAN', 'APPL'];

stocks.forEach((stock) => {
  main(stock);
});
