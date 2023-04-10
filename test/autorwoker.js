import axios from 'axios';

setInterval(async () => {
  const price = 90 + Math.floor(Math.random() * 20);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post('http://localhost:3000/api/1.0/match/order', {
    symbol: 'DAN',
    userId: '728bd78e-8833-44bb-8488-917b70af4773',
    price,
    quantity,
    type: 'limit',
    side: 'sell',
    status: 'open',
    partiallyFilled: quantity,
  });
}, 500 + Math.floor(Math.random() * 500));

setInterval(async () => {
  const price = 90 + Math.floor(Math.random() * 20);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post('http://localhost:3000/api/1.0/match/order', {
    symbol: 'DAN',
    userId: '728bd78e-8833-44bb-8488-917b70af4773',
    price,
    quantity,
    type: 'limit',
    side: 'buy',
    status: 'open',
    partiallyFilled: quantity,
  });
}, 500 + Math.floor(Math.random() * 500));
