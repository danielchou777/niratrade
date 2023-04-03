import fs from 'fs';
import { Kafka } from 'kafkajs';
import { promisify } from 'util';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const topic = 'message-log';
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

let orders;

await promisify(fs.readFile)('testcase.txt', 'utf8').then((data) => {
  orders = data.split('\n');
});

const produce = async () => {
  await producer.connect();

  for (let i = 0; i < orders.length; i++) {
    try {
      const randomStockAmount = orders[i].split(',')[2];
      const randomStockPrice = orders[i].split(',')[1];

      if (orders[i].split(',')[0] === 'buy') {
        const data = {
          stockAmount: `buy:${randomStockAmount}:orderId-${i}`,
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
          `buy:${randomStockAmount}:orderId-${i}`,
          randomStockPrice
        );
      }

      if (orders[i].split(',')[0] === 'sell') {
        const data = {
          stockAmount: `sell:${randomStockAmount}:orderId-${i}`,
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
          `sell:${randomStockAmount}:orderId-${i}`,
          randomStockPrice
        );
      }
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }
};

produce();
