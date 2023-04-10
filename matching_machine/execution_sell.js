import cache from '../utils/cache.js';
import { updateOrder } from '../models/orderManagerModels.js';

const sellExecution = async (
  stockPrice,
  stockPriceOrder,
  stockAmount,
  pushExecutions
) => {
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

      // update buy order status to partially filled
      updateOrder(
        buyOrderId,
        'partially filled',
        buyOrderAmount - sellOrderAmount
      );

      // update sell order status to filled
      updateOrder(stockAmount.split(':')[2], 'filled', 0);

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

      // update buy order status to filled
      updateOrder(buyOrderId, 'filled', 0);

      // update sell order status to filled
      updateOrder(stockAmount.split(':')[2], 'filled', 0);

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

      // update buy order status to filled
      updateOrder(buyOrderId, 'filled', 0);

      // update sell order status to partially filled
      updateOrder(
        stockAmount.split(':')[2],
        'partially filled',
        sellOrderAmount - buyOrderAmount
      );

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
      stockAmount = `sell:${sellOrderAmount}:${stockAmount.split(':')[2]}`;
    }
  }
};

export default sellExecution;
