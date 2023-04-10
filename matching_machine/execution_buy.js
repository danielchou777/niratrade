import cache from '../utils/cache.js';
import { updateOrder } from '../models/orderManagerModels.js';

const buyExecution = async (
  stockPrice,
  stockPriceOrder,
  stockAmount,
  pushExecutions
) => {
  let isExecuted = false;

  while (!isExecuted) {
    let sellOrder = await cache.zrangebyscore(
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
      cache.zadd(`buyOrderBook`, [stockPriceOrder, stockAmount]);
      isExecuted = true;
      break;
    }

    let sellOrderAmount = Number(sellOrder[0].split(':')[1]);
    let buyOrderAmount = Number(stockAmount.split(':')[1]);

    let sellOrderId = sellOrder[0].split(':')[2];

    // if sell order amount is greater than buy order amount, update sell order book and break
    if (sellOrderAmount > buyOrderAmount) {
      cache.zadd(`sellOrderBook`, [
        sellOrder[1],
        `sell:${sellOrderAmount - buyOrderAmount}:${sellOrderId}`,
      ]);

      cache.zrem('sellOrderBook', sellOrder[0]);

      // update sell order status to partially filled
      updateOrder(
        sellOrderId,
        'partially filled',
        sellOrderAmount - buyOrderAmount
      );

      // update buy order status to filled
      updateOrder(stockAmount.split(':')[2], 'filled', 0);

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

    // if sell order amount is equal to buy order amount, remove from sell order book and break
    if (sellOrderAmount == buyOrderAmount) {
      cache.zrem(`sellOrderBook`, sellOrder[0]);

      // update sell order status to filled
      updateOrder(sellOrderId, 'filled', 0);

      // update buy order status to filled
      updateOrder(stockAmount.split(':')[2], 'filled', 0);

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

    // if sell order amount is less than buy order amount, remove from sell order book and continue
    if (sellOrderAmount < buyOrderAmount) {
      cache.zrem(`sellOrderBook`, sellOrder[0]);

      // update sell order status to filled
      updateOrder(sellOrderId, 'filled', 0);

      // update buy order status to partially filled
      updateOrder(
        stockAmount.split(':')[2],
        'partially filled',
        buyOrderAmount - sellOrderAmount
      );

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
};

export default buyExecution;
