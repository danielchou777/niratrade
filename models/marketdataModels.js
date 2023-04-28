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

// get the close price of the previous minute
export const getPreviousClosePrice = async (symbol, time) => {
  const [rows] = await pool.query(
    'SELECT close FROM market_data WHERE symbol = ? AND unix_timestamp = ?',
    [symbol, time]
  );

  if (!rows[0]) {
    return 0;
  }

  return rows[0].close;
};

// create a new row with the current timestamp, and update the OHLC values with the close price of the previous minute
export const createNewMarketDataRow = async (symbol, time) => {
  const [rows] = await pool.query(
    'INSERT INTO market_data (symbol, unix_timestamp, open, high, low, close, volume ) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [symbol, time, null, null, null, null]
  );
};

export const updateMarketDataEveryMinute = async (
  previousClosePrice,
  symbol,
  time
) => {
  // Get the close price of the current minute
  const [rows] = await pool.query(
    'SELECT close FROM market_data WHERE symbol = ? AND unix_timestamp = ?',
    [symbol, time]
  );

  //if the close price is null, then it means that the row has not been updated yet
  if (!rows[0]) {
    return;
  }

  if (rows[0].close === null) {
    await pool.query(
      'UPDATE market_data SET open = ?, close = ?, high = ?, low = ? WHERE symbol = ? AND unix_timestamp = ?',
      [
        previousClosePrice,
        previousClosePrice,
        previousClosePrice,
        previousClosePrice,
        symbol,
        time,
      ]
    );
  } else {
    // if the close price is not null, then it means that the row has been updated already
    // so only update the open price of the current minute
    await pool.query(
      'UPDATE market_data SET open = ? WHERE symbol = ? AND unix_timestamp = ?',
      [previousClosePrice, symbol, time]
    );
  }
};

export const updateMarketData = async (symbol, currentPrice, time, volume) => {
  // time: unix time to the milisecond

  const [rows] = await pool.query(
    'SELECT high, low, close FROM market_data WHERE symbol = ? AND unix_timestamp = ? ORDER BY unix_timestamp',
    [symbol, time]
  );

  if (!rows[0]) {
    await pool.query(
      'INSERT INTO market_data (symbol, unix_timestamp, open, high, low, close, volume ) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [symbol, time, 0, currentPrice, currentPrice, currentPrice, volume]
    );
    return;
  }

  // if the close price is null, then it means that the row has not been updated yet
  // so update the low, high, close price of the current minute
  if (rows[0].close === null) {
    await pool.query(
      'UPDATE market_data SET high = ?, low = ?, close = ?, volume = volume + ? WHERE symbol = ? AND unix_timestamp = ?',
      [currentPrice, currentPrice, currentPrice, volume, symbol, time]
    );
    return;
  }

  const highPrice = rows[0].high > currentPrice ? rows[0].high : currentPrice;

  const lowPrice = rows[0].low < currentPrice ? rows[0].low : currentPrice;

  await pool.query(
    'UPDATE market_data SET high = ?, low = ?, close = ?, volume = volume + ? WHERE symbol = ? AND unix_timestamp = ?',
    [highPrice, lowPrice, currentPrice, volume, symbol, time]
  );
};

export const moveRowToTodayHistory = async (symbol, time) => {
  const [rows] = await pool.query(
    'SELECT * FROM market_data WHERE symbol = ? AND unix_timestamp = ?',
    [symbol, time]
  );

  if (!rows[0]) {
    return;
  }

  await pool.query(
    'INSERT INTO market_data_today (symbol, unix_timestamp, open, high, low, close, volume ) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      rows[0].symbol,
      rows[0].unix_timestamp,
      rows[0].open,
      rows[0].high,
      rows[0].low,
      rows[0].close,
      rows[0].volume,
    ]
  );

  await pool.query(
    'DELETE FROM market_data WHERE symbol = ? AND unix_timestamp = ?',
    [symbol, time]
  );
};

export const getMarketDataHistory = async (symbol) => {
  let [rows] = await pool.query(
    'SELECT * FROM market_data_today WHERE symbol = ?',
    [symbol]
  );

  const latestMarketData = await getLastestChartData(symbol);
  rows.push(latestMarketData);

  return rows;
};

export const getStockPrices = async () => {
  const [stocks] = await pool.query('SELECT symbol, name  FROM stock');

  const stockPrices = {};

  for (let i = 0; i < stocks.length; i++) {
    const symbol = stocks[i].symbol;
    let execution = await cache.lrange(`executions-${symbol}`, 0, 0);
    execution = JSON.parse(execution[0]);
    const stockPrice = execution.stockPrice;
    stockPrices[symbol] = stockPrice;
  }

  return stockPrices;
};

export const getUnfilledQuantity = async (orderId) => {
  const [rows] = await pool.execute(
    'SELECT unfilled_quantity FROM orders WHERE order_id=?',
    [orderId]
  );

  return rows[0].unfilled_quantity;
};

export const getLastestChartData = async (symbol) => {
  const [rows] = await pool.query(
    'SELECT * FROM market_data WHERE symbol = ? ORDER BY unix_timestamp DESC LIMIT 1 OFFSET 1',
    [symbol]
  );
  return rows[0];
};
