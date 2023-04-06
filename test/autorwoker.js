import axios from 'axios';

setInterval(async () => {
  const price = 90 + Math.floor(Math.random() * 20);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post('http://localhost:3000/api/1.0/match/order', {
    orderType: 'sell',
    price,
    quantity,
  });
}, 500 + Math.floor(Math.random() * 500));

setInterval(async () => {
  const price = 90 + Math.floor(Math.random() * 20);
  const quantity = 5 + Math.floor(Math.random() * 10);

  await axios.post('http://localhost:3000/api/1.0/match/order', {
    orderType: 'buy',
    price,
    quantity,
  });
}, 500 + Math.floor(Math.random() * 500));
