import cache from '../utils/cache.js';
import {
  updateOrder,
  updateUserStock,
  updateUserBalance,
} from '../models/orderManagerModels.js';

const updateUserTables = async (
  buyUserId,
  sellUserId,
  symbol,
  sellOrderAmount,
  buyOrderPrice
) => {
  await Promise.all([
    updateUserBalance(sellUserId, buyOrderPrice * sellOrderAmount),
    updateUserStock(sellUserId, symbol, -sellOrderAmount),
    updateUserBalance(buyUserId, -buyOrderPrice * sellOrderAmount),
    updateUserStock(buyUserId, symbol, sellOrderAmount),
  ]);
};

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
      await cache.zadd(`sellOrderBook`, [stockPriceOrder, stockAmount]);
      isExecuted = true;
      break;
    }

    // if buy order price is lower than sell order price, add to sell order book and break
    if (buyOrderPrice < stockPrice) {
      await cache.zadd(`sellOrderBook`, [stockPriceOrder, stockAmount]);
      isExecuted = true;
      break;
    }

    let buyOrderAmount = Number(buyOrder[0].split(':')[1]);
    let buyOrderId = buyOrder[0].split(':')[2];
    let buyUserId = buyOrder[0].split(':')[3];

    let sellOrderAmount = Number(stockAmount.split(':')[1]);
    let sellOrderId = stockAmount.split(':')[2];
    let sellUserId = stockAmount.split(':')[3];

    let symbol = stockAmount.split(':')[4];

    // if buy order amount is greater than sell order amount, update buy order book and break
    if (buyOrderAmount > sellOrderAmount) {
      // update buy order status to partially filled
      // update sell order status to filled

      await Promise.all([
        cache.zadd(`buyOrderBook`, [
          buyOrder[1],
          `buy:${
            buyOrderAmount - sellOrderAmount
          }:${buyOrderId}:${buyUserId}:${symbol}`,
        ]),
        cache.zrem('buyOrderBook', buyOrder[0]),
        updateOrder(
          buyOrderId,
          'partially filled',
          buyOrderAmount - sellOrderAmount
        ),
        updateOrder(sellOrderId, 'filled', 0),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        sellOrderAmount,
        buyOrderPrice
      );

      pushExecutions(
        'sell',
        buyOrderId,
        sellOrderId,
        buyOrderPrice,
        sellOrderAmount,
        Date.now()
      );

      isExecuted = true;
      break;
    }

    // if buy order amount is equal to sell order amount, remove from buy order book and break
    if (buyOrderAmount == sellOrderAmount) {
      // update buy order status to filled
      // update sell order status to filledupdateOrder(sellOrderId, 'filled', 0);
      await Promise.all([
        cache.zrem(`buyOrderBook`, buyOrder[0]),
        updateOrder(buyOrderId, 'filled', 0),
        updateOrder(sellOrderId, 'filled', 0),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        sellOrderAmount,
        buyOrderPrice
      );

      pushExecutions(
        'sell',
        buyOrderId,
        sellOrderId,
        buyOrderPrice,
        sellOrderAmount,
        Date.now()
      );

      isExecuted = true;
      break;
    }

    // if buy order amount is less than sell order amount, remove from buy order book and continue
    if (buyOrderAmount < sellOrderAmount) {
      // update sell order amount
      sellOrderAmount -= buyOrderAmount;

      // update buy order status to filled
      // update sell order status to partially filled
      await Promise.all([
        cache.zrem(`buyOrderBook`, buyOrder[0]),
        updateOrder(buyOrderId, 'filled', 0),
        updateOrder(sellOrderId, 'partially filled', sellOrderAmount),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        buyOrderAmount,
        buyOrderPrice
      );

      pushExecutions(
        'sell',
        buyOrderId,
        sellOrderId,
        buyOrderPrice,
        buyOrderAmount,
        Date.now()
      );

      stockAmount = `sell:${sellOrderAmount}:${sellOrderId}:${sellUserId}:${symbol}`;
    }
  }
};

export default sellExecution;
