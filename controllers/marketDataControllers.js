import {
  getBuyOrderBook,
  getSellOrderBook,
  getExecutions,
} from '../models/marketdataModels.js';

import { StatusCodes } from 'http-status-codes';

export const orderBook = async (req, res) => {
  const buyOrderBook = await getBuyOrderBook();
  const sellOrderBook = await getSellOrderBook();

  res.status(StatusCodes.OK).json({ buyOrderBook, sellOrderBook });
};

export const executions = async (req, res) => {
  let executions = await getExecutions();

  res.status(StatusCodes.OK).json({ executions });
};
