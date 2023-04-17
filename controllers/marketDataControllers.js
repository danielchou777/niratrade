import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
  getStocks,
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
