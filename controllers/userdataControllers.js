import { getBalance, getStock } from '../models/userdataModels.js';

import { StatusCodes } from 'http-status-codes';

export const wallet = async (req, res) => {
  const { userId } = req.body;
  const { balance } = await getBalance(userId);
  const stock = await getStock(userId);

  console.log(balance, stock);

  res.status(StatusCodes.OK).json({ userId, balance, stock });
};
