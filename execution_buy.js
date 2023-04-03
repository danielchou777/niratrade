const cache = require('./cache');

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

    // if buy order amount is greater than sell order amount, update buy order book and break
    if (sellOrderAmount > buyOrderAmount) {
      cache.zadd(`sellOrderBook`, [
        sellOrder[1],
        `sell:${sellOrderAmount - buyOrderAmount}:${sellOrderId}`,
      ]);

      cache.zrem('sellOrderBook', sellOrder[0]);

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

    // if buy order amount is equal to sell order amount, remove from buy order book and break
    if (sellOrderAmount == buyOrderAmount) {
      cache.zrem(`sellOrderBook`, sellOrder[0]);

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

    // if buy order amount is less than sell order amount, remove from buy order book and continue
    if (sellOrderAmount < buyOrderAmount) {
      cache.zrem(`sellOrderBook`, sellOrder[0]);

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

module.exports = buyExecution;
