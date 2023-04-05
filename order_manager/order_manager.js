import net from 'net';
import { Kafka } from 'kafkajs';
import { v1 as uuidv1 } from 'uuid';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const topic = 'message-log';
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

const server = net.createServer(async function (socket) {
  socket.on('data', async function (data) {
    let { orderType, price, quantity } = JSON.parse(data);
    price = Number(price);
    quantity = Number(quantity);

    const orderId = uuidv1();

    await producer.connect();

    if (orderType === 'buy') {
      const data = {
        stockAmount: `buy:${quantity}:${orderId}`,
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

      console.log('writes: ', `buy:${quantity}:${orderId}`, price);
    }

    if (orderType === 'sell') {
      const data = {
        stockAmount: `sell:${quantity}:${orderId}`,
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
      console.log('writes: ', `sell:${quantity}:${orderId}`, price);
    }

    socket.write('order received', function () {
      console.log('server:收到 client端 傳輸資料為' + data);
    });
  });
});

server.listen(8124, function () {
  console.log('TCP Server start');
});
