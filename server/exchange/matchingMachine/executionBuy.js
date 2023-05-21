import cache from '../../utils/cache.js';
import {
  updateOrder,
  updateUserStock,
  updateUserBalance,
  insertExecution,
} from '../../models/orderManagerModels.js';

import {
  updateMarketData,
  addExecutions,
} from '../../models/marketdataModels.js';

import orderStatus from '../../constants/orderStatus.js';

import { roundToMinute } from '../../utils/util.js';

const updateUserTables = async (
  buyUserId,
  sellUserId,
  symbol,
  buyOrderAmount,
  sellOrderPrice,
  buyOrderPrice
) => {
  await Promise.all([
    updateUserBalance(sellUserId, sellOrderPrice * buyOrderAmount),
    updateUserStock(sellUserId, symbol, -buyOrderAmount),
    updateUserBalance(
      buyUserId,
      -sellOrderPrice * buyOrderAmount,
      -buyOrderPrice * buyOrderAmount
    ),
    updateUserStock(buyUserId, symbol, buyOrderAmount),
  ]);
};

const buyExecution = async (
  stockPrice,
  stockPriceOrder,
  orderDetails,
  stockSymbol
  // eslint-disable-next-line consistent-return
) => {
  const isExecuted = false;
  const broadcastUsers = [];

  while (!isExecuted) {
    const date = roundToMinute(new Date());

    const sellOrder = await cache.zrangebyscore(
      `sellOrderBook-${stockSymbol}`,
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
      await cache.zadd(`buyOrderBook-${stockSymbol}`, [
        stockPriceOrder,
        orderDetails,
      ]);
      return broadcastUsers;
    }

    // if buy order price is lower than sell order price, add to sell order book and break
    if (sellOrderPrice > stockPrice) {
      await cache.zadd(`buyOrderBook-${stockSymbol}`, [
        stockPriceOrder,
        orderDetails,
      ]);
      return broadcastUsers;
    }

    const sellOrderAmount = Number(sellOrder[0].split(':')[1]);
    const sellOrderId = sellOrder[0].split(':')[2];
    const sellUserId = sellOrder[0].split(':')[3];

    let buyOrderAmount = Number(orderDetails.split(':')[1]);
    const buyOrderId = orderDetails.split(':')[2];
    const buyUserId = orderDetails.split(':')[3];

    const symbol = orderDetails.split(':')[4];

    // if sell order amount is greater than buy order amount, update sell order book and break
    if (sellOrderAmount > buyOrderAmount) {
      // update sell order status to partially filled
      // update buy order status to filled

      await Promise.all([
        cache.zadd(`sellOrderBook-${stockSymbol}`, [
          sellOrder[1],
          `s:${
            sellOrderAmount - buyOrderAmount
          }:${sellOrderId}:${sellUserId}:${symbol}`,
        ]),
        cache.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
        updateOrder(
          sellOrderId,
          orderStatus.partiallyFilled,
          sellOrderAmount - buyOrderAmount
        ),
        updateOrder(buyOrderId, orderStatus.filled, 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderPrice,
          buyOrderAmount
        ),
        updateMarketData(symbol, sellOrderPrice, date, buyOrderAmount),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        buyOrderAmount,
        sellOrderPrice,
        stockPrice
      );

      addExecutions(
        'buy',
        sellOrderPrice,
        buyOrderAmount,
        Date.now(),
        stockSymbol
      );

      broadcastUsers.push(sellUserId);

      return broadcastUsers;
    }

    // if sell order amount is equal to buy order amount, remove from sell order book and break
    if (sellOrderAmount === buyOrderAmount) {
      // update sell order status to filled
      // update buy order status to filled

      await Promise.all([
        cache.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
        updateOrder(sellOrderId, orderStatus.filled, 0),
        updateOrder(buyOrderId, orderStatus.filled, 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderPrice,
          buyOrderAmount
        ),
        updateMarketData(symbol, sellOrderPrice, date, buyOrderAmount),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        buyOrderAmount,
        sellOrderPrice,
        stockPrice
      );

      addExecutions(
        'buy',
        sellOrderPrice,
        buyOrderAmount,
        Date.now(),
        stockSymbol
      );

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
        cache.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
        updateOrder(sellOrderId, orderStatus.filled, 0),
        updateOrder(buyOrderId, orderStatus.partiallyFilled, buyOrderAmount),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          sellOrderPrice,
          sellOrderAmount
        ),
        updateMarketData(symbol, sellOrderPrice, date, sellOrderAmount),
      ]);

      await updateUserTables(
        buyUserId,
        sellUserId,
        symbol,
        sellOrderAmount,
        sellOrderPrice,
        stockPrice
      );

      addExecutions(
        'buy',
        sellOrderPrice,
        sellOrderAmount,
        Date.now(),
        stockSymbol
      );

      broadcastUsers.push(sellUserId);

      orderDetails = `b:${buyOrderAmount}:${buyOrderId}:${buyUserId}:${symbol}`;
    }
  }
};

export default buyExecution;
