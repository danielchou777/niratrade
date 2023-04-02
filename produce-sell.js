const { Kafka } = require('kafkajs');

const clientId = 'my-app';

const brokers = ['localhost:9092'];

const topic = 'message-log';

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();

const sellOrders = [
  // [102, 10],
  // [101, 7],
  // [100, 10],
  [98, 15],
];

const produce = async () => {
  await producer.connect();

  for (let i = 0; i < sellOrders.length; i++) {
    try {
      const randomStockAmount = sellOrders[i][1];
      const randomStockPrice = sellOrders[i][0];
      // send a message to the configured topic with
      // the key and value formed from the current value of `i`
      const data = {
        stockAmount: `sell:${randomStockAmount}:orderId-${i}`,
        stockPriceOrder: `${randomStockPrice}${Date.now() - 1000000000000}`,
      };

      console.log(Date.now() - 1000000000000);

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
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }
};

produce();
