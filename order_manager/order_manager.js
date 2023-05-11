import net from 'net';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

import {
  insertOrder,
  checkUserBalance,
  checkUserStock,
  setUserLockedBalance,
  setUserLockedStock,
  getCancelOrderInfo,
} from '../models/orderManagerModels.js';

const clientId = 'my-app';
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const time = 2208960000000; // 2040-01-01 00:00:00

await producer.connect();

const server = net.createServer(async (socket) => {
  socket.on('data', async (data) => {
    let { symbol, userId, price, quantity, type, side, status, orderIdCancel } =
      JSON.parse(data);

    price = Number(price);
    quantity = Number(quantity);

    if (orderIdCancel && status !== '4') {
      socket.write('Invalid cancel order');
      return;
    }

    // implement cancel order
    if (orderIdCancel && status === '4') {
      console.log('cancel order: ', orderIdCancel);

      const cancelOrderInfo = await getCancelOrderInfo(orderIdCancel);

      // check if cancel order matches the original order
      if (
        cancelOrderInfo.side !== side ||
        cancelOrderInfo.user_id !== userId ||
        cancelOrderInfo.price !== price ||
        cancelOrderInfo.quantity !== quantity ||
        cancelOrderInfo.type !== type
      ) {
        socket.write('Invalid cancel order');
        return;
      }

      console.log('success cancel order: ', orderIdCancel);
      socket.write(`receive cancel order: ${orderIdCancel}`);

      const data = {
        stockAmount: `c:${side}:${quantity}:${orderIdCancel}:${userId}:${symbol}:${price}`,
      };

      await producer.send({
        topic: `stock-${symbol}`,
        messages: [
          {
            key: 'CancelOrder',
            value: JSON.stringify(data),
          },
        ],
      });

      return;
    }

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

    socket.write('order received', () => {});
  });
});

server.listen(8124, () => {
  console.log('TCP Server start');
});
