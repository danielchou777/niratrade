import fs from 'fs';
import { Kafka } from 'kafkajs';
import { promisify } from 'util';
import { v1 as uuidv1 } from 'uuid';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const topic = 'message-log';
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

let orders;

await promisify(fs.readFile)('matching_machine/testcase.txt', 'utf8').then(
  (data) => {
    orders = data.split('\n');
  }
);

const produce = async () => {
  await producer.connect();

  for (let i = 0; i < orders.length; i++) {
    try {
      const randomStockAmount = orders[i].split(',')[2];
      const randomStockPrice = orders[i].split(',')[1];

      const orderId = uuidv1();

      if (orders[i].split(',')[0] === 'buy') {
        const data = {
          stockAmount: `buy:${randomStockAmount}:${orderId}`,
          stockPriceOrder: `${randomStockPrice}${time - Date.now()}`,
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
          `buy:${randomStockAmount}:${orderId}`,
          randomStockPrice
        );
      }

      if (orders[i].split(',')[0] === 'sell') {
        const data = {
          stockAmount: `sell:${randomStockAmount}:${orderId}`,
          stockPriceOrder: `${randomStockPrice}${Date.now() - 1000000000000}`,
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
          `sell:${randomStockAmount}:${orderId}`,
          randomStockPrice
        );
      }
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }
};

produce();
