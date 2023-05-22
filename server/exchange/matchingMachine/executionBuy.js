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

const updateUserTables = async (userId, symbol, amount, price) => {
  await Promise.all([
    updateUserBalance(userId, price * amount),
    updateUserStock(userId, symbol, amount),
  ]);
};

const processBuyOrder = async (
  stockPrice,
  stockPriceOrder,
  orderDetails,
  stockSymbol
) => {
  const broadcastUsers = [];

  do {
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

    if (sellOrder.length === 0 || sellOrderPrice > stockPrice) {
      await cache.zadd(`buyOrderBook-${stockSymbol}`, [
        stockPriceOrder,
        orderDetails,
      ]);
      return broadcastUsers;
    }

    const sellOrderDetails = sellOrder[0].split(':');
    const sellOrderAmount = Number(sellOrderDetails[1]);
    const sellOrderId = sellOrderDetails[2];
    const sellUserId = sellOrderDetails[3];

    const orderDetailsParts = orderDetails.split(':');
    let buyOrderAmount = Number(orderDetailsParts[1]);
    const buyOrderId = orderDetailsParts[2];
    const buyUserId = orderDetailsParts[3];
    const symbol = orderDetailsParts[4];

    if (sellOrderAmount > buyOrderAmount) {
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
        updateUserTables(buyUserId, symbol, buyOrderAmount, sellOrderPrice),
        addExecutions(
          'buy',
          sellOrderPrice,
          buyOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(sellUserId);

      return broadcastUsers;
    }

    if (sellOrderAmount === buyOrderAmount) {
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
        updateUserTables(buyUserId, symbol, buyOrderAmount, sellOrderPrice),
        addExecutions(
          'buy',
          sellOrderPrice,
          buyOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(sellUserId);

      return broadcastUsers;
    }

    if (sellOrderAmount < buyOrderAmount) {
      buyOrderAmount -= sellOrderAmount;

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
        updateUserTables(buyUserId, symbol, sellOrderAmount, sellOrderPrice),
        addExecutions(
          'buy',
          sellOrderPrice,
          sellOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(sellUserId);

      orderDetails = `b:${buyOrderAmount}:${buyOrderId}:${buyUserId}:${symbol}`;
    }
  } while (true);
};

export default processBuyOrder;
