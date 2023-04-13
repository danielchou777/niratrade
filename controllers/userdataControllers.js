import { getBalance, getStock, getPosition } from '../models/userdataModels.js';

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
