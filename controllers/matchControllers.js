import net from 'net';
import { StatusCodes } from 'http-status-codes';
import Error from '../errors/index.js';

export const order = (req, res, next) => {
  const { symbol, userId, price, quantity, type, side, status } = req.body;
  if (!symbol || !userId || !price || !quantity || !type || !side || !status) {
    throw new Error.BadRequestError('data is not complete');
  }

  if (!Number.isInteger(Number(price)) || !Number.isInteger(Number(quantity))) {
    throw new Error.BadRequestError('price or quantity is not integer');
  }

  if (price < 0 || quantity < 0) {
    throw new Error.BadRequestError('price or quantity is not positive');
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

  const client = net.connect({ port: 8124 }, function () {
    console.log('client端: 向 server端 請求連線');
  });

  client.on('connect', function (data) {
    console.log('client端: 與 server端 連線成功，可以開始傳輸資料');
  });

  client.write(JSON.stringify(req.body), function () {
    console.log(
      'client端：開始傳輸資料，傳輸的資料為' + JSON.stringify(req.body)
    );
  });

  // data event： 到收到資料傳輸時觸發事件 ， argument 為對象傳輸的物件
  client.on('data', async function (data) {
    console.log('client端：收到 server端 傳輸資料為' + data);

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

    //結束 client 端 連線
    client.end();

    res.status(StatusCodes.OK).json({ msg: `${data.toString()}` });
  });
};
