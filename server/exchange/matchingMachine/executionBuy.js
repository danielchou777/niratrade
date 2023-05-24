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
    updateUserStock(userId, symbol, amount, connection),
  ]);
};

const updateBuyUserTables = async (
  userId,
  symbol,
  amount,
  sellPrice,
  buyPrice,
  connection
) => {
  await Promise.all([
    updateUserBalance(
      userId,
      -sellPrice * amount,
      -buyPrice * amount,
      connection
    ),
    updateUserStock(userId, symbol, -amount, connection),
  ]);
};

const processBuyOrder = async (
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
        redisTransaction.zadd(`buyOrderBook-${stockSymbol}`, [
          stockPriceOrder,
          orderDetails,
        ]);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
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
          redisTransaction.zadd(`sellOrderBook-${stockSymbol}`, [
            sellOrder[1],
            `s:${
              sellOrderAmount - buyOrderAmount
            }:${sellOrderId}:${sellUserId}:${symbol}`,
          ]),
          redisTransaction.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
          updateOrder(
            sellOrderId,
            orderStatus.partiallyFilled,
            sellOrderAmount - buyOrderAmount,
            connection
          ),
          updateOrder(buyOrderId, orderStatus.filled, 0, connection),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            sellOrderPrice,
            buyOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            sellOrderPrice,
            date,
            buyOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            buyOrderAmount,
            sellOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            buyOrderAmount,
            sellOrderPrice,
            stockPrice,
            connection
          ),
          addExecutions(
            'buy',
            sellOrderPrice,
            buyOrderAmount,
            Date.now(),
            stockSymbol,
            connection
          ),
        ]);

        broadcastUsers.push(sellUserId);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
        return broadcastUsers;
      }

      if (sellOrderAmount === buyOrderAmount) {
        await Promise.all([
          redisTransaction.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
          updateOrder(sellOrderId, orderStatus.filled, 0, connection),
          updateOrder(buyOrderId, orderStatus.filled, 0, connection),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            sellOrderPrice,
            buyOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            sellOrderPrice,
            date,
            buyOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            buyOrderAmount,
            sellOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            buyOrderAmount,
            sellOrderPrice,
            stockPrice,
            connection
          ),
          addExecutions(
            'buy',
            sellOrderPrice,
            buyOrderAmount,
            Date.now(),
            stockSymbol,
            redisTransaction
          ),
        ]);

        broadcastUsers.push(sellUserId);
        await redisTransaction.exec();
        await commitMySQLTransaction(connection);
        return broadcastUsers;
      }

      if (sellOrderAmount < buyOrderAmount) {
        buyOrderAmount -= sellOrderAmount;

        await Promise.all([
          redisTransaction.zrem(`sellOrderBook-${stockSymbol}`, sellOrder[0]),
          updateOrder(sellOrderId, orderStatus.filled, 0, connection),
          updateOrder(
            buyOrderId,
            orderStatus.partiallyFilled,
            buyOrderAmount,
            connection
          ),
          insertExecution(
            buyOrderId,
            sellOrderId,
            buyUserId,
            sellUserId,
            symbol,
            sellOrderPrice,
            sellOrderAmount,
            connection
          ),
          updateMarketData(
            symbol,
            sellOrderPrice,
            date,
            sellOrderAmount,
            connection
          ),
          updateSellUserTables(
            sellUserId,
            symbol,
            sellOrderAmount,
            sellOrderPrice,
            connection
          ),
          updateBuyUserTables(
            buyUserId,
            symbol,
            sellOrderAmount,
            sellOrderPrice,
            stockPrice,
            connection
          ),
          addExecutions(
            'buy',
            sellOrderPrice,
            sellOrderAmount,
            Date.now(),
            stockSymbol,
            redisTransaction
          ),
        ]);

        broadcastUsers.push(sellUserId);

        // eslint-disable-next-line no-param-reassign
        orderDetails = `b:${buyOrderAmount}:${buyOrderId}:${buyUserId}:${symbol}`;
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

export default processBuyOrder;
