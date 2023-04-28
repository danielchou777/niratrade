import axios from 'axios';
import https from 'https';

const ip = 'http://localhost:3000/api/1.0/match/order';
//ip

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJ1c2VySWQiOiI3MjhiZDc4ZS04ODMzLTQ0YmItODQ4OC05MTdiNzBhZjQ3NzMiLCJpYXQiOjE2ODIzNDEwNTIsImV4cCI6MTY4MjcwMTA1Mn0.XgOU4AMejSPKcF0ZqJjjDcGSPs0tQHUHoJQjlNgucRc';

const randomOrder1 = async () => {
  const price = 80 + Math.floor(Math.random() * 40);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    ip,
    {
      symbol: 'DAN',
      userId: '728bd78e-8833-44bb-8488-917b70af4773',
      price,
      quantity,
      type: '2',
      side: 's',
      status: '0',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );
  const rand = Math.floor(Math.random() * 5 + 10);

  setTimeout(randomOrder1, rand * 100);
};

const randomOrder2 = async () => {
  const price = 80 + Math.floor(Math.random() * 40);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    ip,
    {
      header: {
        Authorization: `Bearer ${jwtToken}`,
      },
      symbol: 'DAN',
      userId: '728bd78e-8833-44bb-8488-917b70af4773',
      price,
      quantity,
      type: '2',
      side: 'b',
      status: '0',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );

  const rand = Math.floor(Math.random() * 5 + 10);

  setTimeout(randomOrder2, rand * 100);
};

const randomOrder3 = async () => {
  const price = 270 + Math.floor(Math.random() * 60);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    ip,
    {
      header: {
        Authorization: `Bearer ${jwtToken}`,
      },
      symbol: 'APPL',
      userId: '728bd78e-8833-44bb-8488-917b70af4773',
      price,
      quantity,
      type: '2',
      side: 's',
      status: '0',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );

  const rand = Math.floor(Math.random() * 5 + 10);

  setTimeout(randomOrder3, rand * 100);
};

const randomOrder4 = async () => {
  const price = 270 + Math.floor(Math.random() * 60);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    ip,
    {
      header: {
        Authorization: `Bearer ${jwtToken}`,
      },
      symbol: 'APPL',
      userId: '728bd78e-8833-44bb-8488-917b70af4773',
      price,
      quantity,
      type: '2',
      side: 'b',
      status: '0',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
  );

  const rand = Math.floor(Math.random() * 5 + 10);

  setTimeout(randomOrder4, rand * 100);
};

randomOrder1();
randomOrder2();
randomOrder3();
randomOrder4();
