import pool from '../utils/database.js';

export const getUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [
    email,
  ]);
  return rows;
};

export const createUser = async (userId, name, email, password) => {
  // insert user
  await pool.query(
    'INSERT INTO user (user_id, name, email, password, balance, locked_balance) VALUES (?, ?, ?, ?, 10000, 0)',
    [userId, name, email, password]
  );

  // select all stocks
  const [stocks] = await pool.query(`
    SELECT symbol FROM stock
  `);

  const userStocks = stocks.map((stock) => [userId, stock.symbol, 0, 0]);

  // insert user_stock, set default quantity = 0
  await pool.query(
    'INSERT INTO user_stock (user_id, symbol, quantity, locked_quantity) VALUES ?',
    [userStocks]
  );
};
