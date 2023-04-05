import {
  getBuyOrderBook,
  getSellOrderBook,
} from '../models/marketdataModels.js';

import { StatusCodes } from 'http-status-codes';

export const orderBook = async (req, res) => {
  const buyOrderBook = await getBuyOrderBook();
  const sellOrderBook = await getSellOrderBook();

  res.status(StatusCodes.OK).json({ buyOrderBook, sellOrderBook });
};
