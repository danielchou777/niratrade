import fs from 'fs';
import axios from 'axios';
import { promisify } from 'util';

let orders;

await promisify(fs.readFile)('matching_machine/testcase2.txt', 'utf8').then(
  (data) => {
    orders = data.split('\n');
  }
);

for (let i = 0; i < orders.length; i++) {
  const quantity = orders[i].split(',')[2];
  const price = orders[i].split(',')[1];
  const side = orders[i].split(',')[0];

  await axios.post('http://localhost:3000/api/1.0/match/order', {
    symbol: 'DAN',
    userId: '728bd78e-8833-44bb-8488-917b70af4773',
    price,
    quantity,
    type: 'limit',
    side,
    status: 'open',
    partiallyFilled: quantity,
  });
}
