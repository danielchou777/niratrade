import axios from 'axios';
let x = 0;
let x_quantity = 0;
let y = 0;
let y_quantity = 0;

// setInterval(async () => {
//   const price = 90 + Math.floor(Math.random() * 20);
//   const quantity = 5 + Math.floor(Math.random() * 10);

//   if (x + y === 500) {
//     process.exit(0);
//   }

//   await axios.post('http://localhost:3000/api/1.0/match/order', {
//     symbol: 'DAN',
//     userId: '728bd78e-8833-44bb-8488-917b70af4773',
//     price,
//     quantity,
//     type: 'limit',
//     side: 'sell',
//     status: 'open',
//     partiallyFilled: quantity,
//   });

//   x++;
//   x_quantity += quantity;
//   console.log('sell', x, x_quantity);
// }, Math.floor(Math.random() * 50));

// setInterval(async () => {
//   const price = 90 + Math.floor(Math.random() * 20);
//   const quantity = 5 + Math.floor(Math.random() * 10);

//   if (x + y === 500) {
//     process.exit(0);
//   }

//   await axios.post('http://localhost:3000/api/1.0/match/order', {
//     symbol: 'DAN',
//     userId: '728bd78e-8833-44bb-8488-917b70af4773',
//     price,
//     quantity,
//     type: 'limit',
//     side: 'buy',
//     status: 'open',
//     partiallyFilled: quantity,
//   });

//   y++;
//   y_quantity += quantity;
//   console.log('buy', y, y_quantity);
// }, Math.floor(Math.random() * 50));

for (let i = 0; i < 50; i++) {
  const sellprice = 90 + Math.floor(Math.random() * 20);
  const sellquantity = 5 + Math.floor(Math.random() * 10);

  const buyprice = 90 + Math.floor(Math.random() * 20);
  const buyquantity = 5 + Math.floor(Math.random() * 10);

  x++;
  x_quantity += sellquantity;
  console.log('sell', x, x_quantity);

  y++;
  y_quantity += buyquantity;
  console.log('buy', y, y_quantity);

  axios.post('http://localhost:3000/api/1.0/match/order', {
    symbol: 'DAN',
    userId: '728bd78e-8833-44bb-8488-917b70af4773',
    price: sellprice,
    quantity: sellquantity,
    type: 'limit',
    side: 'sell',
    status: 'open',
    partiallyFilled: sellquantity,
  });

  axios.post('http://localhost:3000/api/1.0/match/order', {
    symbol: 'DAN',
    userId: '728bd78e-8833-44bb-8488-917b70af4773',
    price: buyprice,
    quantity: buyquantity,
    type: 'limit',
    side: 'buy',
    status: 'open',
    partiallyFilled: buyquantity,
  });
}
