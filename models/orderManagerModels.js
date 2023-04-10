import pool from '../utils/database.js';

export const insertOrder = async (
  orderId,
  symbol,
  userId,
  price,
  quantity,
  type,
  side,
  status,
  partiallyFilled
) => {
  const [rows] = await pool.execute(
    'INSERT INTO orders (order_id, symbol, user_id, price, quantity, type, side, status, partially_filled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      orderId,
      symbol,
      userId,
      price,
      quantity,
      type,
      side,
      status,
      partiallyFilled,
    ]
  );

  return rows;
};

export const updateOrder = async (orderId, status, partiallyFilled) => {
  const [rows] = await pool.execute(
    'UPDATE orders SET status=?, partially_filled=? WHERE order_id=?',
    [status, partiallyFilled, orderId]
  );

  return rows;
};

export const updateUserStock = async (userId, symbol, quantity) => {
  const [rows] = await pool.execute(
    'UPDATE user_stock SET quantity = quantity + ? WHERE user_id=? AND symbol=?',
    [quantity, userId, symbol]
  );

  return rows;
};

export const updateUserBalance = async (userId, balance) => {
  const [rows] = await pool.execute(
    'UPDATE user SET balance = balance + ? WHERE user_id=?',
    [balance, userId]
  );

  return rows;
};
