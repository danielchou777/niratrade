import net from 'net';
import { StatusCodes } from 'http-status-codes';

export const order = (req, res) => {
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

    //結束 client 端 連線
    client.end();

    res.status(StatusCodes.OK).json({ msg: `${data.toString()}` });
  });
};
