import {
  getBalance,
  getStock,
  getPosition,
  getExecution,
} from '../models/userdataModels.js';

import Error from '../errors/index.js';

import { StatusCodes } from 'http-status-codes';

export const wallet = async (req, res) => {
  const { userId } = req.body;
  const { balance } = await getBalance(userId);
  const stock = await getStock(userId);

  res.status(StatusCodes.OK).json({ userId, balance, stock });
};

export const position = async (req, res) => {
  const { userId } = req.body;
  const result = await getPosition(userId);
  res.status(StatusCodes.OK).json({ result });
};

export const execution = async (req, res) => {
  const { userId, symbol } = req.body;

  if (!userId) throw new Error.BadRequestError('userId is required');

  if (!symbol) throw new Error.BadRequestError('symbol is required');

  const result = await getExecution(userId, symbol);
  res.status(StatusCodes.OK).json({ result });
};
