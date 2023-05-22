import axios from 'axios';
import https from 'https';

// const ip = 'http://localhost:3000/api/1.0/match/order';
const ip = 'https://www.danielchou.online/api/1.0/match/order';

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJ1c2VySWQiOiI3MjhiZDc4ZS04ODMzLTQ0YmItODQ4OC05MTdiNzBhZjQ3NzMiLCJpYXQiOjE2ODM1MDM4ODgsImV4cCI6MTY4Mzg2Mzg4OH0.o1seWSGm1e3gKOF92va0gX5NoKFf25G8fK7xCxAEuWk';

const randomOrder1 = async () => {
  const price = 70 + Math.floor(Math.random() * 120);
  const quantity = 1 + Math.floor(Math.random() * 14);
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
  const rand = Math.floor(Math.random() * 5 + 15);

  setTimeout(randomOrder1, rand * 100);
};

const randomOrder2 = async () => {
  const price = 70 + Math.floor(Math.random() * 120);
  const quantity = 1 + Math.floor(Math.random() * 14);

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

  const rand = Math.floor(Math.random() * 5 + 15);

  setTimeout(randomOrder2, rand * 100);
};

const randomOrder3 = async () => {
  const price = 250 + Math.floor(Math.random() * 100);
  const quantity = 1 + Math.floor(Math.random() * 4);

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

  const rand = Math.floor(Math.random() * 5 + 15);

  setTimeout(randomOrder3, rand * 100);
};

const randomOrder4 = async () => {
  const price = 250 + Math.floor(Math.random() * 100);
  const quantity = 1 + Math.floor(Math.random() * 4);

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

  const rand = Math.floor(Math.random() * 5 + 15);

  setTimeout(randomOrder4, rand * 100);
};

randomOrder1();
randomOrder2();
randomOrder3();
randomOrder4();
