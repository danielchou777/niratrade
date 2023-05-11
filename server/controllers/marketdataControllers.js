import { StatusCodes } from 'http-status-codes';
import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
  getStocks,
  getMarketDataHistory,
  getMarketDataDynamicHistory,
  getStockPrices,
} from '../models/marketdataModels.js';

export const orderBook = async (req, res) => {
  const { symbol } = req.query;

  const buyOrderBook = await getBuyOrderBook(symbol);
  const sellOrderBook = await getSellOrderBook(symbol);

  res.status(StatusCodes.OK).json({ buyOrderBook, sellOrderBook });
};

export const executions = async (req, res) => {
  const { symbol } = req.query;
  const marketExecutions = await getExecutions(symbol);

  res.status(StatusCodes.OK).json({ executions: marketExecutions });
};

export const stocks = async (req, res) => {
  const marketStocks = await getStocks();

  res.status(StatusCodes.OK).json({ stocks: marketStocks });
};

export const marketChart = async (req, res) => {
  const { symbol, time } = req.query;

  if (time) {
    const result = await getMarketDataDynamicHistory(symbol, time);

    const marketdata = result.map((data) => [
      data.unix_timestamp,
      data.open,
      data.high,
      data.low,
      data.close,
      data.volume,
    ]);
    res.status(StatusCodes.OK).json({ marketdata });
    return;
  }

  const result = await getMarketDataHistory(symbol);

  const marketdata = result.map((data) => [
    data.unix_timestamp,
    data.open,
    data.high,
    data.low,
    data.close,
    data.volume,
  ]);

  res.status(StatusCodes.OK).json({ marketdata });
};

export const getAllStockPrices = async (req, res) => {
  const result = await getStockPrices();

  res.status(StatusCodes.OK).json({ data: result });
};
