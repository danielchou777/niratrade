import axios from 'axios';

const jwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJ1c2VySWQiOiI3MjhiZDc4ZS04ODMzLTQ0YmItODQ4OC05MTdiNzBhZjQ3NzMiLCJpYXQiOjE2ODI5Mjg4OTgsImV4cCI6MTY4MzI4ODg5OH0.WIrnjELrvCOMGUSJLXlKF1xZiRkZNE7C1Rpqgc9v-GI';

setInterval(async () => {
  const price = 70 + Math.floor(Math.random() * 80);
  const quantity = 1 + Math.floor(Math.random() * 14);

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
}, 5000);

setInterval(async () => {
  const price = 70 + Math.floor(Math.random() * 80);
  const quantity = 1 + Math.floor(Math.random() * 14);

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
}, Math.floor(1000));

setInterval(async () => {
  const price = 250 + Math.floor(Math.random() * 100);
  const quantity = 1 + Math.floor(Math.random() * 4);

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
}, Math.floor(1000));

setInterval(async () => {
  const price = 250 + Math.floor(Math.random() * 100);
  const quantity = 1 + Math.floor(Math.random() * 4);

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
}, Math.floor(1000));
