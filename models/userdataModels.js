import pool from '../utils/database.js';

export const getBalance = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT balance FROM user WHERE user_id = ?',
    [userId]
  );

  return rows[0];
};

export const getStock = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT symbol, quantity FROM user_stock WHERE user_id = ?',
    [userId]
  );
  return rows;
};

export const getPosition = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM orders WHERE user_id = ? AND (status = "open" OR status = "partially filled")',
    [userId]
  );
  return rows;
};
