import net from 'net';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

import {
  insertOrder,
  checkUserBalance,
  checkUserStock,
  setUserLockedBalance,
  setUserLockedStock,
} from '../models/orderManagerModels.js';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

await producer.connect();

const server = net.createServer(async function (socket) {
  socket.on('data', async function (data) {
    let { symbol, userId, price, quantity, type, side, status } =
      JSON.parse(data);

    price = Number(price);
    quantity = Number(quantity);

    const orderId = uuidv4();

    const { balance: userBalance, locked_balance: userLockedBalance } =
      await checkUserBalance(userId);
    const { quantity: userStock, locked_quantity: userLockedQuantity } =
      await checkUserStock(userId, symbol);

    if (side === 'b' && userBalance - userLockedBalance < price * quantity) {
      socket.write('balance not enough');
      return;
    }

    if (side === 's' && userStock - userLockedQuantity < quantity) {
      socket.write('stock not enough');
      return;
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
      quantity
    );

    if (side === 'b') {
      await setUserLockedBalance(userId, price * quantity);

      const data = {
        stockAmount: `b:${quantity}:${orderId}:${userId}:${symbol}`,
        stockPriceOrder: `${price}${time - Date.now()}`,
      };

      await producer.send({
        topic: `stock-${symbol}`,
        messages: [
          {
            key: 'buyOrder',
            value: JSON.stringify(data),
          },
        ],
      });

      console.log(
        'writes: ',
        `b:${quantity}:${orderId}:${userId}:${symbol}`,
        price
      );
    }

    if (side === 's') {
      await setUserLockedStock(userId, symbol, quantity);

      const data = {
        stockAmount: `s:${quantity}:${orderId}:${userId}:${symbol}`,
        stockPriceOrder: `${price}${Date.now() - 1000000000000}`,
      };

      await producer.send({
        topic: `stock-${symbol}`,
        messages: [
          {
            key: 'sellOrder',
            value: JSON.stringify(data),
          },
        ],
      });

      console.log(
        'writes: ',
        `s:${quantity}:${orderId}:${userId}:${symbol}`,
        price
      );
    }

    socket.write('order received', function () {
      console.log('server:收到 client端 傳輸資料為' + data);
    });
  });
});

server.listen(8124, function () {
  console.log('TCP Server start');
});
