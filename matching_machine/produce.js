import fs from 'fs';
import { Kafka } from 'kafkajs';
import { promisify } from 'util';
import { v1 as uuidv1 } from 'uuid';
import { insertOrder } from '../models/orderManagerModels.js';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const topic = 'message-log';
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

let orders;

await promisify(fs.readFile)('matching_machine/testcase2.txt', 'utf8').then(
  (data) => {
    orders = data.split('\n');
  }
);

const produce = async () => {
  await producer.connect();

  for (let i = 0; i < orders.length; i++) {
    try {
      const quantity = orders[i].split(',')[2];
      const price = orders[i].split(',')[1];
      const symbol = 'DAN';
      const userId = '728bd78e-8833-44bb-8488-917b70af4773';
      const status = 'open';
      const type = 'limit';
      const side = orders[i].split(',')[0];
      const partiallyFilled = quantity;

      const orderId = uuidv1();

      if (side === 'buy') {
        const data = {
          stockAmount: `buy:${quantity}:${orderId}:${userId}:${symbol}`,
          stockPriceOrder: `${price}${time - Date.now()}`,
        };

        await producer.send({
          topic,
          messages: [
            {
              key: 'buyOrder',
              value: JSON.stringify(data),
            },
          ],
        });

        console.log(
          'writes: ',
          `buy:${quantity}:${orderId}:${userId}:${symbol}`,
          price
        );
      }

      if (side === 'sell') {
        const data = {
          stockAmount: `sell:${quantity}:${orderId}:${userId}:${symbol}`,
          stockPriceOrder: `${price}${Date.now() - 1000000000000}`,
        };

        await producer.send({
          topic,
          messages: [
            {
              key: 'sellOrder',
              value: JSON.stringify(data),
            },
          ],
        });

        // if the message is written successfully, log it and increment `i`
        console.log(
          'writes: ',
          `sell:${quantity}:${orderId}:${userId}:${symbol}`,
          price
        );
      }

      await insertOrder(
        orderId,
        symbol,
        userId,
        price,
        quantity,
        type,
        side,
        status,
        partiallyFilled
      );
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }
  await producer.disconnect();
};

produce();
