import cache from '../utils/cache.js';
import pool from '../utils/database.js';

export const getBuyOrderBook = async (symbol) => {
  let buyOrder = await cache.zrevrangebyscore(
    `buyOrderBook-${symbol}`,
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

export const getSellOrderBook = async (symbol) => {
  let sellOrder = await cache.zrangebyscore(
    `sellOrderBook-${symbol}`,
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

export const getExecutions = async (symbol) => {
  let executions = await cache.lrange(`executions-${symbol}`, 0, -1);

  executions = executions.map((execution) => {
    return JSON.parse(execution);
  });

  return executions;
};

export const getStocks = async () => {
  const [rows] = await pool.query('SELECT symbol, name  FROM stock');

  return rows;
};
