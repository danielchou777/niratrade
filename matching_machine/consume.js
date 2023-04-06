import { Kafka } from 'kafkajs';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const topic = 'message-log';
const kafka = new Kafka({ clientId, brokers });

import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://localhost:3000';
const socketio = socketIOClient(ENDPOINT);

import buyExecution from './execution_buy.js';
import sellExecution from './execution_sell.js';

// create a new consumer from the kafka client, and set its group ID
const consumer = kafka.consumer({ groupId: clientId, maxInFlightRequests: 1 });
const executions = [];

function pushExecutions(
  orderType,
  executedBuyOrderId,
  executedSellOrderId,
  stockPrice,
  amount,
  time
) {
  executions.push({
    orderType,
    executedBuyOrderId,
    executedSellOrderId,
    stockPrice,
    amount,
    time,
  });
}

const consume = async () => {
  await consumer.connect();

  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ message, topic, partition }) => {
      let { stockAmount, stockPriceOrder } = JSON.parse(message.value);

      const stockPrice = Math.floor(stockPriceOrder / 1000000000000);

      if (stockAmount.split(':')[0] === 'sell') {
        await sellExecution(
          stockPrice,
          stockPriceOrder,
          stockAmount,
          pushExecutions
        );
      }

      if (stockAmount.split(':')[0] === 'buy') {
        await buyExecution(
          stockPrice,
          stockPriceOrder,
          stockAmount,
          pushExecutions
        );
      }

      console.log(executions);

      // Commit the offset for the processed message
      await consumer.commitOffsets([
        { topic, partition, offset: message.offset },
      ]);

      socketio.emit('execution', 'success');
    },
  });
};

consume();
