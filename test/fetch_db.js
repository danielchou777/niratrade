import pool from '../utils/database.js';

const updateOrder = async () => {
  const [rows] = await pool.execute(
    'SELECT side, price, quantity FROM orders',
    []
  );

  for (let i = 0; i < rows.length; i++) {
    let side = rows[i].side;
    let price = rows[i].price;
    let quantity = rows[i].quantity;
    console.log(`${side},${price},${quantity}`);
  }
};

updateOrder();
