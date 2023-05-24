import cache from '../../utils/cache.js';
import orderStatus from '../../constants/orderStatus.js';
import { getUnfilledQuantity } from '../../models/marketdataModels.js';
import pool from '../../utils/database.js';
import {
  updateCancelOrder,
  updateUserLockedBalance,
  updateUserLockedStock,
  beginMySQLTransaction,
  commitMySQLTransaction,
  rollbackMySQLTransaction,
} from '../../models/orderManagerModels.js';

export default async function cancelExecution(orderDetails) {
  const side = orderDetails.split(':')[1];
  const orderIdCancel = orderDetails.split(':')[3];
  const unfilledQauntity = await getUnfilledQuantity(orderIdCancel);
  const userId = orderDetails.split(':')[4];
  const symbol = orderDetails.split(':')[5];
  const price = orderDetails.split(':')[6];

  const connection = await pool.getConnection();

  try {
    await beginMySQLTransaction(connection);

    // if buy side, remove from buyOrders cache
    if (side === 'b') {
      const stockCacheInfo = `b:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;

      // update order status to canceled, user balance
      await Promise.all([
        cache.zrem(`buyOrderBook-${symbol}`, stockCacheInfo),
        updateCancelOrder(orderIdCancel, orderStatus.canceled, connection),
        updateUserLockedBalance(userId, -price * unfilledQauntity, connection),
      ]);
    }

    // if sell side, remove from sellOrders cache
    if (side === 's') {
      const stockCacheInfo = `s:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;

      // update order status to canceled, user balance
      await Promise.all([
        cache.zrem(`sellOrderBook-${symbol}`, stockCacheInfo),
        updateCancelOrder(orderIdCancel, orderStatus.canceled, connection),
        updateUserLockedStock(userId, symbol, -unfilledQauntity, connection),
      ]);
    }

    await commitMySQLTransaction(connection);
  } catch (err) {
    await rollbackMySQLTransaction(connection);
    console.log(err);
  } finally {
    connection.release();
  }

  // broadcastUsers.push(userId);
  return [userId];
}
