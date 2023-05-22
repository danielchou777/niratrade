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

const updateSellUserTables = async (userId, symbol, amount, price) => {
  await Promise.all([
    updateUserBalance(userId, price * amount),
    updateUserStock(userId, symbol, -amount),
  ]);
};

const updateBuyUserTables = async (userId, symbol, amount, price) => {
  await Promise.all([
    updateUserBalance(userId, -price * amount, -price * amount),
    updateUserStock(userId, symbol, amount),
  ]);
};

const processSellOrder = async (
  stockPrice,
  stockPriceOrder,
  orderDetails,
  stockSymbol
) => {
  const broadcastUsers = [];

  do {
    const date = roundToMinute(new Date());

    const buyOrder = await cache.zrevrangebyscore(
      `buyOrderBook-${stockSymbol}`,
      'inf',
      0,
      'WITHSCORES',
      'LIMIT',
      0,
      1
    );

    const buyOrderPrice = Math.floor(buyOrder[1] / 1000000000000);

    if (buyOrder.length === 0 || buyOrderPrice < stockPrice) {
      await cache.zadd(`sellOrderBook-${stockSymbol}`, [
        stockPriceOrder,
        orderDetails,
      ]);
      return broadcastUsers;
    }

    const buyOrderDetails = buyOrder[0].split(':');
    const buyOrderAmount = Number(buyOrderDetails[1]);
    const buyOrderId = buyOrderDetails[2];
    const buyUserId = buyOrderDetails[3];

    const orderDetailsParts = orderDetails.split(':');
    let sellOrderAmount = Number(orderDetailsParts[1]);
    const sellOrderId = orderDetailsParts[2];
    const sellUserId = orderDetailsParts[3];
    const symbol = orderDetailsParts[4];

    if (buyOrderAmount > sellOrderAmount) {
      await Promise.all([
        cache.zadd(`buyOrderBook-${stockSymbol}`, [
          buyOrder[1],
          `b:${
            buyOrderAmount - sellOrderAmount
          }:${buyOrderId}:${buyUserId}:${symbol}`,
        ]),
        cache.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
        updateOrder(
          buyOrderId,
          orderStatus.partiallyFilled,
          buyOrderAmount - sellOrderAmount
        ),
        updateOrder(sellOrderId, orderStatus.filled, 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          buyOrderPrice,
          sellOrderAmount
        ),
        updateMarketData(symbol, buyOrderPrice, date, sellOrderAmount),
        updateSellUserTables(
          sellUserId,
          symbol,
          sellOrderAmount,
          buyOrderPrice
        ),
        updateBuyUserTables(
          buyUserId,
          symbol,
          sellOrderAmount,
          buyOrderPrice,
          buyOrderPrice
        ),
        addExecutions(
          'sell',
          buyOrderPrice,
          sellOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(buyUserId);

      return broadcastUsers;
    }

    if (buyOrderAmount === sellOrderAmount) {
      await Promise.all([
        cache.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
        updateOrder(buyOrderId, orderStatus.filled, 0),
        updateOrder(sellOrderId, orderStatus.filled, 0),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          buyOrderPrice,
          sellOrderAmount
        ),
        updateMarketData(symbol, buyOrderPrice, date, sellOrderAmount),
        updateSellUserTables(
          sellUserId,
          symbol,
          sellOrderAmount,
          buyOrderPrice
        ),
        updateBuyUserTables(
          buyUserId,
          symbol,
          sellOrderAmount,
          buyOrderPrice,
          buyOrderPrice
        ),
        addExecutions(
          'sell',
          buyOrderPrice,
          sellOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(buyUserId);

      return broadcastUsers;
    }

    if (buyOrderAmount < sellOrderAmount) {
      sellOrderAmount -= buyOrderAmount;

      await Promise.all([
        cache.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
        updateOrder(buyOrderId, orderStatus.filled, 0),
        updateOrder(sellOrderId, orderStatus.partiallyFilled, sellOrderAmount),
        insertExecution(
          buyOrderId,
          sellOrderId,
          buyUserId,
          sellUserId,
          symbol,
          buyOrderPrice,
          buyOrderAmount
        ),
        updateMarketData(symbol, buyOrderPrice, date, buyOrderAmount),
        updateSellUserTables(sellUserId, symbol, buyOrderAmount, buyOrderPrice),
        updateBuyUserTables(
          buyUserId,
          symbol,
          buyOrderAmount,
          buyOrderPrice,
          buyOrderPrice
        ),
        addExecutions(
          'sell',
          buyOrderPrice,
          buyOrderAmount,
          Date.now(),
          stockSymbol
        ),
      ]);

      broadcastUsers.push(buyUserId);

      // eslint-disable-next-line no-param-reassign
      orderDetails = `s:${sellOrderAmount}:${sellOrderId}:${sellUserId}:${symbol}`;
    }
  } while (true);
};

export default processSellOrder;
