import net from 'net';
import { StatusCodes } from 'http-status-codes';
import Error from '../errors/index.js';

export const order = (req, res) => {
  const userIdPayload = req.payload.userId;
  const { symbol, userId, price, quantity, type, side, status } = req.body;

  if (!symbol || !userId || !price || !quantity || !type || !side || !status) {
    throw new Error.BadRequestError('data is not complete');
  }

  if (userId !== userIdPayload) {
    throw new Error.BadRequestError('userId is not match');
  }

  if (!Number.isInteger(Number(price)) || !Number.isInteger(Number(quantity))) {
    throw new Error.BadRequestError('price or quantity must be integer');
  }

  if (price <= 0 || quantity <= 0) {
    throw new Error.BadRequestError('price or quantity must be positive');
  }

  if (price > 10000000 || quantity > 10000000) {
    throw new Error.BadRequestError(
      'price or quantity must be less than 10000000'
    );
  }

  if (side !== 'b' && side !== 's') {
    throw new Error.BadRequestError('invalid side');
  }

  if (type.length !== 1) {
    throw new Error.BadRequestError('invalid type');
  }

  if (status.length !== 1) {
    throw new Error.BadRequestError('invalid status');
  }

  const client = net.connect({ port: 8124 }, () => {});

  client.on('connect', () => {});

  client.write(JSON.stringify(req.body), () => {});

  client.on('data', async (data) => {
    if (data.toString() === 'order failed') {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: `${data.toString()}` });
      return;
    }

    if (data.toString() === 'balance not enough') {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: `${data.toString()}` });
      return;
    }

    if (data.toString() === 'stock not enough') {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: `${data.toString()}` });
      return;
    }

    if (data.toString() === 'Invalid cancel order') {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: `${data.toString()}` });
      return;
    }

    client.end();

    res.status(StatusCodes.OK).json({ msg: `${data.toString()}` });
  });
};
