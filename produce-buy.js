const { Kafka } = require('kafkajs');

const clientId = 'my-app';

const brokers = ['localhost:9092'];

const topic = 'message-log';

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

const buyOrders = [
  [99, 10],
  [98, 7],
  [97, 10],
];

const produce = async () => {
  await producer.connect();
  let i = 0;

  for (let i = 0; i < buyOrders.length; i++) {
    try {
      const randomStockAmount = buyOrders[i][1];
      const randomStockPrice = buyOrders[i][0];
      // send a message to the configured topic with
      // the key and value formed from the current value of `i`
      const data = {
        stockAmount: `buy:${randomStockAmount}:orderId-${i}`,
        stockPriceOrder: `${randomStockPrice}${time - Date.now()}`,
      };

      console.log(time - Date.now());

      await producer.send({
        topic,
        messages: [
          {
            key: 'buyOrder',
            value: JSON.stringify(data),
          },
        ],
      });

      // if the message is written successfully, log it and increment `i`
      console.log(
        'writes: ',
        `buy:${randomStockAmount}:orderId-${i}`,
        randomStockPrice
      );
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }
};

produce();
