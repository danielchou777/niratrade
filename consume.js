// the kafka instance and configuration variables are the same as before
const { Kafka } = require('kafkajs');

const clientId = 'my-app';

const brokers = ['localhost:9092'];

const topic = 'message-log';

const kafka = new Kafka({ clientId, brokers });

const cache = require('./cache');

// create a new consumer from the kafka client, and set its group ID
// the group ID helps Kafka keep track of the messages that this client
// is yet to receive
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
  // first, we wait for the client to connect and subscribe to the given topic
  await consumer.connect();

  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ message, topic, partition }) => {
      let { stockAmount, stockPriceOrder } = JSON.parse(message.value);

      const stockPrice = Math.floor(stockPriceOrder / 1000000000000);
      if (stockAmount.split(':')[0] === 'sell') {
        let isExecuted = false;

        while (!isExecuted) {
          let buyOrder = await cache.zrevrangebyscore(
            'buyOrderBook',
            'inf',
            0,
            'WITHSCORES',
            'LIMIT',
            0,
            1
          );

          const buyOrderPrice = Math.floor(buyOrder[1] / 1000000000000);

          // if no buy order, add to sell order book and break
          if (buyOrder.length === 0) {
            cache.zadd(`sellOrderBook`, [stockPriceOrder, stockAmount]);
            isExecuted = true;
            break;
          }

          // if buy order price is lower than sell order price, add to sell order book and break
          if (buyOrderPrice < stockPrice) {
            cache.zadd(`sellOrderBook`, [stockPriceOrder, stockAmount]);
            isExecuted = true;
            break;
          }

          let buyOrderAmount = Number(buyOrder[0].split(':')[1]);
          let sellOrderAmount = Number(stockAmount.split(':')[1]);

          let buyOrderId = buyOrder[0].split(':')[2];

          // if buy order amount is greater than sell order amount, update buy order book and break
          if (buyOrderAmount > sellOrderAmount) {
            cache.zadd(`buyOrderBook`, [
              buyOrder[1],
              `buy:${buyOrderAmount - sellOrderAmount}:${buyOrderId}`,
            ]);

            cache.zrem('buyOrderBook', buyOrder[0]);

            pushExecutions(
              'sell',
              buyOrderId,
              stockAmount.split(':')[2],
              buyOrderPrice,
              sellOrderAmount,
              Date.now()
            );

            isExecuted = true;
            break;
          }

          // if buy order amount is equal to sell order amount, remove from buy order book and break
          if (buyOrderAmount == sellOrderAmount) {
            cache.zrem(`buyOrderBook`, buyOrder[0]);

            pushExecutions(
              'sell',
              buyOrderId,
              stockAmount.split(':')[2],
              buyOrderPrice,
              sellOrderAmount,
              Date.now()
            );

            isExecuted = true;
            break;
          }

          // if buy order amount is less than sell order amount, remove from buy order book and continue
          if (buyOrderAmount < sellOrderAmount) {
            cache.zrem(`buyOrderBook`, buyOrder[0]);

            pushExecutions(
              'sell',
              buyOrderId,
              stockAmount.split(':')[2],
              buyOrderPrice,
              buyOrderAmount,
              Date.now()
            );

            // update sell order amount
            sellOrderAmount -= buyOrderAmount;
            stockAmount = `sell:${sellOrderAmount}:${
              stockAmount.split(':')[2]
            }`;
          }
        }
      }

      if (stockAmount.split(':')[0] === 'buy') {
        cache.zadd(`buyOrderBook`, [stockPriceOrder, stockAmount]);

        let isExecuted = false;

        while (!isExecuted) {
          let sellOrder = await cache.zrevrangebyscore(
            'sellOrderBook',
            0,
            'inf',
            'WITHSCORES',
            'LIMIT',
            0,
            1
          );

          const sellOrderPrice = Math.floor(sellOrder[1] / 1000000000000);

          // if no buy order, add to sell order book and break
          if (sellOrder.length === 0) {
            cache.zadd(`buyOrderBook`, [stockPriceOrder, stockAmount]);
            isExecuted = true;
            break;
          }

          // if buy order price is lower than sell order price, add to sell order book and break
          if (sellOrderPrice > stockPrice) {
            cache.zadd(`sellOrderBook`, [stockPriceOrder, stockAmount]);
            isExecuted = true;
            break;
          }

          let sellOrderAmount = Number(sellOrder[0].split(':')[1]);
          let buyOrderAmount = Number(stockAmount.split(':')[1]);

          let sellOrderId = sellOrder[0].split(':')[2];

          // if buy order amount is greater than sell order amount, update buy order book and break
          if (sellOrderAmount > buyOrderAmount) {
            cache.zadd(`sellOrderBook`, [
              sellOrder[1],
              `sell:${sellOrderAmount - buyOrderAmount}:${sellOrderId}`,
            ]);

            cache.zrem('sellOrderBook', sellOrder[0]);

            pushExecutions(
              'buy',
              stockAmount.split(':')[2],
              sellOrderId,
              sellOrderPrice,
              buyOrderAmount,
              Date.now()
            );

            isExecuted = true;
            break;
          }

          // if buy order amount is equal to sell order amount, remove from buy order book and break
          if (sellOrderAmount == buyOrderAmount) {
            cache.zrem(`sellOrderBook`, sellOrder[0]);

            pushExecutions(
              'buy',
              stockAmount.split(':')[2],
              sellOrderId,
              sellOrderPrice,
              buyOrderAmount,
              Date.now()
            );

            isExecuted = true;
            break;
          }

          // if buy order amount is less than sell order amount, remove from buy order book and continue
          if (sellOrderAmount < buyOrderAmount) {
            cache.zrem(`sellOrderBook`, sellOrder[0]);

            pushExecutions(
              'buy',
              stockAmount.split(':')[2],
              sellOrderId,
              sellOrderPrice,
              sellOrderAmount,
              Date.now()
            );

            // update sell order amount
            buyOrderAmount -= sellOrderAmount;
            stockAmount = `buy:${buyOrderAmount}:${stockAmount.split(':')[2]}`;
          }
        }
      }

      console.log(executions);

      // Commit the offset for the processed message
      await consumer.commitOffsets([
        { topic, partition, offset: message.offset },
      ]);
    },
  });
};

consume();
