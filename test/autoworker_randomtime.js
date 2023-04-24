import axios from 'axios';

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJ1c2VySWQiOiI3MjhiZDc4ZS04ODMzLTQ0YmItODQ4OC05MTdiNzBhZjQ3NzMiLCJpYXQiOjE2ODIzMTQ1NDgsImV4cCI6MTY4MjM1MDU0OH0.KKhd3pMm_ZfeFnYpEf2L4u4c_a7nFgp670swX07aZ1g';

const randomOrder1 = async () => {
  const price = 80 + Math.floor(Math.random() * 40);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    'http://localhost:3000/api/1.0/match/order',
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
    }
  );
  const rand = Math.floor(Math.random() * 2 + 5);

  setTimeout(randomOrder1, rand * 1000);
};

const randomOrder2 = async () => {
  const price = 80 + Math.floor(Math.random() * 40);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    'http://localhost:3000/api/1.0/match/order',
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
    }
  );

  const rand = Math.floor(Math.random() * 2 + 5);

  setTimeout(randomOrder2, rand * 1000);
};

const randomOrder3 = async () => {
  const price = 270 + Math.floor(Math.random() * 60);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    'http://localhost:3000/api/1.0/match/order',
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
    }
  );

  const rand = Math.floor(Math.random() * 2 + 5);

  setTimeout(randomOrder3, rand * 1000);
};

const randomOrder4 = async () => {
  const price = 270 + Math.floor(Math.random() * 60);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post(
    'http://localhost:3000/api/1.0/match/order',
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
    }
  );

  const rand = Math.floor(Math.random() * 2 + 5);

  setTimeout(randomOrder4, rand * 1000);
};

randomOrder1();
randomOrder2();
randomOrder3();
randomOrder4();
