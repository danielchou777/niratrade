import {
  getBalance,
  getStock,
  getPosition,
  getExecution,
  getAllPositions,
  getPositionPage,
} from '../models/userdataModels.js';

import Error from '../errors/index.js';

import { StatusCodes } from 'http-status-codes';

export const wallet = async (req, res) => {
  const { userId } = req.payload;
  const { balance } = await getBalance(userId);
  const stock = await getStock(userId);

  res.status(StatusCodes.OK).json({ userId, balance, stock });
};

export const position = async (req, res) => {
  const { page } = req.query;
  const { userId } = req.payload;
  const result = await getPosition(userId, page);
  const totalPositions = await getPositionPage(userId);
  const totalPages = Math.ceil(totalPositions / 6);

  res.status(StatusCodes.OK).json({ result, totalPages });
};

export const execution = async (req, res) => {
  const { symbol } = req.query;
  const { userId } = req.payload;

  if (!userId) throw new Error.BadRequestError('userId is required');

  if (!symbol) throw new Error.BadRequestError('symbol is required');

  const result = await getExecution(userId, symbol);
  res.status(StatusCodes.OK).json({ result });
};

export const allPosition = async (req, res) => {
  const { userId } = req.payload;
  const { symbol, status, side, page } = req.query;

  if (!userId) throw new Error.BadRequestError('userId is required');

  const { rows, count } = await getAllPositions(
    userId,
    symbol,
    status,
    side,
    page
  );

  const totalPages = Math.ceil(count / 6);

  res.status(StatusCodes.OK).json({ result: rows, totalPages });
};
