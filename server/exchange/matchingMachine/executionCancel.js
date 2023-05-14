import cache from '../../utils/cache.js';
import orderStatus from '../../constants/orderStatus.js';
import { getUnfilledQuantity } from '../../models/marketdataModels.js';
import {
  updateCancelOrder,
  updateUserLockedBalance,
  updateUserLockedStock,
} from '../../models/orderManagerModels.js';

export default async function cancelExecution(orderDetails) {
  const side = orderDetails.split(':')[1];
  const orderIdCancel = orderDetails.split(':')[3];
  const unfilledQauntity = await getUnfilledQuantity(orderIdCancel);
  const userId = orderDetails.split(':')[4];
  const symbol = orderDetails.split(':')[5];
  const price = orderDetails.split(':')[6];

  // if buy side, remove from buyOrders cache
  if (side === 'b') {
    const stockCacheInfo = `b:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;

    // update order status to canceled, user balance
    await Promise.all([
      cache.zrem(`buyOrderBook-${symbol}`, stockCacheInfo),
      updateCancelOrder(orderIdCancel, orderStatus.canceled),
      updateUserLockedBalance(userId, -price * unfilledQauntity),
    ]);
  }

  // if sell side, remove from sellOrders cache
  if (side === 's') {
    const stockCacheInfo = `s:${unfilledQauntity}:${orderIdCancel}:${userId}:${symbol}`;

    // update order status to canceled, user balance
    await Promise.all([
      cache.zrem(`sellOrderBook-${symbol}`, stockCacheInfo),
      updateCancelOrder(orderIdCancel, orderStatus.canceled),
      updateUserLockedStock(userId, symbol, -unfilledQauntity),
    ]);
  }

  // broadcastUsers.push(userId);
  return [userId];
}
