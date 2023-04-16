import cache from '../utils/cache.js';
import {
  updateOrder,
  updateUserStock,
  updateUserBalance,
  insertExecution,
} from '../models/orderManagerModels.js';

const updateUserTables = async (
  buyUserId,
  sellUserId,
  symbol,
  buyOrderAmount,
  sellOrderPrice
) => {
  await Promise.all([
    updateUserBalance(sellUserId, sellOrderPrice * buyOrderAmount),
    updateUserStock(sellUserId, symbol, -buyOrderAmount),
    updateUserBalance(buyUserId, -sellOrderPrice * buyOrderAmount),
    updateUserStock(buyUserId, symbol, buyOrderAmount),
  ]);
};

const buyExecution = async (
  stockPrice,
  stockPriceOrder,
  stockAmount,
  pushExecutions
) => {
  let isExecuted = false;
  const broadcastUsers = [];

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
      await cache.zadd(`buyOrderBook`, [stockPriceOrder, stockAmount]);
      return broadcastUsers;
    }

    // if buy order price is lower than sell order price, add to sell order book and break
    if (sellOrderPrice > stockPrice) {
      await cache.zadd(`buyOrderBook`, [stockPriceOrder, stockAmount]);
      return broadcastUsers;
    }

    let sellOrderAmount = Number(sellOrder[0].split(':')[1]);
    let sellOrderId = sellOrder[0].split(':')[2];
    let sellUserId = sellOrder[0].split(':')[3];

    let buyOrderAmount = Number(stockAmount.split(':')[1]);
    let buyOrderId = stockAmount.split(':')[2];
    let buyUserId = stockAmount.split(':')[3];

    let symbol = stockAmount.split(':')[4];

    // if sell order amount is greater than buy order amount, update sell order book and break
    if (sellOrderAmount > buyOrderAmount) {
      // update sell order status to partially filled
      // update buy order status to filled

      await Promise.all([
        cache.zadd(`sellOrderBook`, [
          sellOrder[1],
          `s:${
            sellOrderAmount - buyOrderAmount
          }:${sellOrderId}:${sellUserId}:${symbol}`,
        ]),
        cache.zrem('sellOrderBook', sellOrder[0]),
        updateOrder(sellOrderId, '1', sellOrderAmount - buyOrderAmount),
        updateOrder(buyOrderId, '2', 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderAmount,
          sellOrderPrice
        ),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        buyOrderAmount,
        sellOrderPrice
      );

      pushExecutions('buy', sellOrderPrice, buyOrderAmount, Date.now());

      broadcastUsers.push(sellUserId);

      return broadcastUsers;
    }

    // if sell order amount is equal to buy order amount, remove from sell order book and break
    if (sellOrderAmount == buyOrderAmount) {
      // update sell order status to filled
      // update buy order status to filled

      await Promise.all([
        cache.zrem(`sellOrderBook`, sellOrder[0]),
        updateOrder(sellOrderId, '2', 0),
        updateOrder(buyOrderId, '2', 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderAmount,
          sellOrderPrice
        ),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        buyOrderAmount,
        sellOrderPrice
      );

      pushExecutions('buy', sellOrderPrice, buyOrderAmount, Date.now());

      broadcastUsers.push(sellUserId);

      return broadcastUsers;
    }

    // if sell order amount is less than buy order amount, remove from sell order book and continue
    if (sellOrderAmount < buyOrderAmount) {
      // update buy order amount
      buyOrderAmount -= sellOrderAmount;

      // update sell order status to filled

      // update buy order status to partially filled

      await Promise.all([
        cache.zrem(`sellOrderBook`, sellOrder[0]),
        updateOrder(sellOrderId, '2', 0),
        updateOrder(buyOrderId, '1', buyOrderAmount),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderAmount,
          sellOrderPrice
        ),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        sellOrderAmount,
        sellOrderPrice
      );

      pushExecutions('buy', sellOrderPrice, sellOrderAmount, Date.now());

      broadcastUsers.push(sellUserId);

      stockAmount = `b:${buyOrderAmount}:${buyOrderId}:${buyUserId}:${symbol}`;
    }
  }
};

export default buyExecution;
