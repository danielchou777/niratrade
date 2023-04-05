import cache from '../utils/cache.js';

export const getBuyOrderBook = async (req, res) => {
  let buyOrder = await cache.zrevrangebyscore(
    'buyOrderBook',
    'inf',
    0,
    'WITHSCORES',
    'LIMIT',
    0,
    -1
  );

  const buyOrderBook = {};

  for (let i = 0; i < buyOrder.length; i = i + 2) {
    const quantity = buyOrder[i].split(':')[1];
    const price = Number(buyOrder[i + 1].slice(0, -12));

    if (buyOrderBook[price]) {
      buyOrderBook[price] += Number(quantity);
    } else {
      buyOrderBook[price] = Number(quantity);
    }
  }

  const result = Object.keys(buyOrderBook).map((key) => [
    Number(key),
    buyOrderBook[key],
  ]);

  result.reverse();

  return result;
};

export const getSellOrderBook = async (req, res) => {
  let sellOrder = await cache.zrangebyscore(
    'sellOrderBook',
    0,
    'inf',
    'WITHSCORES',
    'LIMIT',
    0,
    -1
  );

  const sellOrderBook = {};

  for (let i = 0; i < sellOrder.length; i = i + 2) {
    const quantity = sellOrder[i].split(':')[1];
    const price = Number(sellOrder[i + 1].slice(0, -12));

    if (sellOrderBook[price]) {
      sellOrderBook[price] += Number(quantity);
    } else {
      sellOrderBook[price] = Number(quantity);
    }
  }

  const result = Object.keys(sellOrderBook).map((key) => [
    Number(key),
    sellOrderBook[key],
  ]);

  return result;
};
