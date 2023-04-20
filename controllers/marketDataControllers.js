import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
  getStocks,
  getMarketDataHistory,
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
  const { symbol } = req.query;

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
