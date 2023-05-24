import cache from '../../utils/cache.js';
import pool from '../../utils/database.js';
import {
  updateOrder,
  updateUserStock,
  updateUserBalance,
  insertExecution,
  beginMySQLTransaction,
  commitMySQLTransaction,
  rollbackMySQLTransaction,
} from '../../models/orderManagerModels.js';
import {
  updateMarketData,
  addExecutions,
} from '../../models/marketdataModels.js';
import orderStatus from '../../constants/orderStatus.js';
import { roundToMinute } from '../../utils/util.js';

const updateSellUserTables = async (
  userId,
  symbol,
  amount,
  price,
  connection
) => {
  await Promise.all([
    updateUserBalance(userId, price * amount, price * amount, connection),
    updateUserStock(userId, symbol, -amount, connection),
  ]);
};

const updateBuyUserTables = async (
  userId,
  symbol,
  amount,
  price,
  connection
) => {
  await Promise.all([
    updateUserBalance(userId, -price * amount, -price * amount, connection),
    updateUserStock(userId, symbol, amount, connection),
  ]);
};

const processSellOrder = async (
  stockPrice,
  stockPriceOrder,
  orderDetails,
  stockSymbol
) => {
  const broadcastUsers = [];

  const connection = await pool.getConnection();

  try {
    do {
      await beginMySQLTransaction(connection);
      const redisTransaction = cache.multi();
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
        redisTransaction.zadd(`sellOrderBook-${stockSymbol}`, [
          stockPriceOrder,
          orderDetails,
        ]);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
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
          redisTransaction.zadd(`buyOrderBook-${stockSymbol}`, [
            buyOrder[1],
            `b:${
              buyOrderAmount - sellOrderAmount
            }:${buyOrderId}:${buyUserId}:${symbol}`,
          ]),
          redisTransaction.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
          updateOrder(
            buyOrderId,
            orderStatus.partiallyFilled,
            buyOrderAmount - sellOrderAmount,
            connection
          ),
          updateOrder(sellOrderId, orderStatus.filled, 0, connection),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            buyOrderPrice,
            sellOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            buyOrderPrice,
            date,
            sellOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            sellOrderAmount,
            buyOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            sellOrderAmount,
            buyOrderPrice,
            buyOrderPrice,
            connection
          ),
          addExecutions(
            'sell',
            buyOrderPrice,
            sellOrderAmount,
            Date.now(),
            stockSymbol,
            redisTransaction
          ),
        ]);

        broadcastUsers.push(buyUserId);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
        return broadcastUsers;
      }

      if (buyOrderAmount === sellOrderAmount) {
        await Promise.all([
          redisTransaction.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
          updateOrder(buyOrderId, orderStatus.filled, 0, connection),
          updateOrder(sellOrderId, orderStatus.filled, 0, connection),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            buyOrderPrice,
            sellOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            buyOrderPrice,
            date,
            sellOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            sellOrderAmount,
            buyOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            sellOrderAmount,
            buyOrderPrice,
            buyOrderPrice,
            connection
          ),
          addExecutions(
            'sell',
            buyOrderPrice,
            sellOrderAmount,
            Date.now(),
            stockSymbol,
            redisTransaction
          ),
        ]);

        broadcastUsers.push(buyUserId);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
        return broadcastUsers;
      }

      if (buyOrderAmount < sellOrderAmount) {
        sellOrderAmount -= buyOrderAmount;

        await Promise.all([
          redisTransaction.zrem(`buyOrderBook-${stockSymbol}`, buyOrder[0]),
          updateOrder(buyOrderId, orderStatus.filled, 0),
          updateOrder(
            sellOrderId,
            orderStatus.partiallyFilled,
            sellOrderAmount,
            connection
          ),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            buyOrderPrice,
            buyOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            buyOrderPrice,
            date,
            buyOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            buyOrderAmount,
            buyOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            buyOrderAmount,
            buyOrderPrice,
            buyOrderPrice,
            connection
          ),
          addExecutions(
            'sell',
            buyOrderPrice,
            buyOrderAmount,
            Date.now(),
            stockSymbol,
            redisTransaction
          ),
        ]);

        broadcastUsers.push(buyUserId);

        // eslint-disable-next-line no-param-reassign
        orderDetails = `s:${sellOrderAmount}:${sellOrderId}:${sellUserId}:${symbol}`;
      }
      await redisTransaction.exec();
      await commitMySQLTransaction(connection);
    } while (true);
  } catch (err) {
    await rollbackMySQLTransaction(connection);
    console.error(err);
  } finally {
    connection.release();
  }
};

export default processSellOrder;
