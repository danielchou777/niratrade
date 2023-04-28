import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
  getStocks,
  getMarketDataHistory,
  getMarketDataDynamicHistory,
  getStockPrices,
} from '../models/marketdataModels.js';

import { StatusCodes } from 'http-status-codes';

export const orderBook = async (req, res) => {
  const { symbol } = req.query;

  const buyOrderBook = await getBuyOrderBook(symbol);
  const sellOrderBook = await getSellOrderBook(symbol);

  res.status(StatusCodes.OK).json({ buyOrderBook, sellOrderBook });
};

export const executions = async (req, res) => {
  const { symbol } = req.query;
  let executions = await getExecutions(symbol);

  res.status(StatusCodes.OK).json({ executions });
};

export const stocks = async (req, res) => {
  let stocks = await getStocks();

  res.status(StatusCodes.OK).json({ stocks });
};

export const marketChart = async (req, res) => {
  const { symbol, time } = req.query;

  if (time) {
    let result = await getMarketDataDynamicHistory(symbol, time);

    const marketdata = result.map((data) => {
      return [
        data.unix_timestamp,
        data.open,
        data.high,
        data.low,
        data.close,
        data.volume,
      ];
    });
    res.status(StatusCodes.OK).json({ marketdata });
    return;
  }

  let result = await getMarketDataHistory(symbol);

  const marketdata = result.map((data) => {
    return [
      data.unix_timestamp,
      data.open,
      data.high,
      data.low,
      data.close,
      data.volume,
    ];
  });

  res.status(StatusCodes.OK).json({ marketdata });
};

export const getAllStockPrices = async (req, res) => {
  let result = await getStockPrices();

  res.status(StatusCodes.OK).json({ data: result });
};
