import { v4 as uuidv4 } from 'uuid';
import pool from '../utils/database.js';

export function beginMySQLTransaction(connection) {
  return new Promise((resolve, reject) => {
    try {
      connection.query('start transaction');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function commitMySQLTransaction(connection) {
  return new Promise((resolve, reject) => {
    try {
      connection.query('commit');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function rollbackMySQLTransaction(connection) {
  return new Promise((resolve, reject) => {
    try {
      connection.query('rollback');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export const insertOrder = async (
  orderId,
  symbol,
  userId,
  price,
  quantity,
  type,
  side,
  status,
  unfilledQauntity
) => {
  const [rows] = await pool.query(
    'INSERT INTO orders (order_id, symbol, user_id, price, quantity, type, side, status, unfilled_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      orderId,
      symbol,
      userId,
      price,
      quantity,
      type,
      side,
      status,
      unfilledQauntity,
    ]
  );

  return rows;
};

export const updateOrder = async (
  orderId,
  status,
  unfilledQauntity,
  connection
) => {
  const conn = connection || pool;
  const [rows] = await conn.query(
    'UPDATE orders SET status=?, unfilled_quantity=? WHERE order_id=?',
    [status, unfilledQauntity, orderId]
  );

  return rows;
};

export const updateCancelOrder = async (orderId, status, connection) => {
  const conn = connection || pool;

  const [rows] = await conn.query(
    'UPDATE orders SET status=? WHERE order_id=?',
    [status, orderId]
  );

  return rows;
};

export const updateUserStock = async (userId, symbol, quantity) => {
  if (quantity < 0) {
    await pool.query(
      'UPDATE user_stock SET quantity = quantity + ?, locked_quantity = locked_quantity + ? WHERE user_id=? AND symbol=?',
      [quantity, quantity, userId, symbol]
    );
  } else {
    await pool.query(
      'UPDATE user_stock SET quantity = quantity + ? WHERE user_id=? AND symbol=?',
      [quantity, userId, symbol]
    );
  }
};

export const updateUserBalance = async (
  userId,
  balance,
  locked_balance,
  connection
) => {
  const conn = connection || pool;
  if (balance < 0) {
    await conn.query(
      'UPDATE user SET balance = balance + ?, locked_balance = locked_balance + ? WHERE user_id=?',
      [balance, locked_balance, userId]
    );
  } else {
    await conn.query('UPDATE user SET balance = balance + ? WHERE user_id=?', [
      balance,
      userId,
    ]);
  }
};

export const insertExecution = async (
  buyOrderId,
  sellOrderId,
  buyUserId,
  sellUserId,
  symbol,
  price,
  quantity,
  connection
) => {
  const execNum = uuidv4();

  const conn = connection || pool;

  const [rows] = await conn.query(
    'INSERT INTO execution (exec_num, buy_order_id, sell_order_id, buy_user_id, sell_user_id, symbol, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      execNum,
      buyOrderId,
      sellOrderId,
      buyUserId,
      sellUserId,
      symbol,
      price,
      quantity,
    ]
  );

  return rows;
};

export const checkUserStock = async (userId, symbol) => {
  const [rows] = await pool.query(
    'SELECT quantity, locked_quantity FROM user_stock WHERE user_id=? AND symbol=?',
    [userId, symbol]
  );

  return rows[0];
};

export const checkUserBalance = async (userId) => {
  const [rows] = await pool.query(
    'SELECT balance, locked_balance FROM user WHERE user_id=?',
    [userId]
  );

  return rows[0];
};

export const setUserLockedBalance = async (userId, balance, connection) => {
  const conn = connection || pool;
  const [rows] = await conn.query(
    'UPDATE user SET locked_balance = locked_balance + ? WHERE user_id=?',
    [balance, userId]
  );

  return rows;
};

export const setUserLockedStock = async (userId, symbol, quantity) => {
  const [rows] = await pool.query(
    'UPDATE user_stock SET locked_quantity = locked_quantity + ? WHERE user_id=? AND symbol=?',
    [quantity, userId, symbol]
  );

  return rows;
};

export const getCancelOrderInfo = async (orderId) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_id=?', [
    orderId,
  ]);

  return rows[0];
};

export const updateUserLockedBalance = async (userId, balance) => {
  const [rows] = await pool.query(
    'UPDATE user SET locked_balance = locked_balance + ? WHERE user_id=?',
    [balance, userId]
  );

  return rows;
};

export const updateUserLockedStock = async (userId, symbol, quantity) => {
  const [rows] = await pool.query(
    'UPDATE user_stock SET locked_quantity = locked_quantity + ? WHERE user_id=? AND symbol=?',
    [quantity, userId, symbol]
  );

  return rows;
};
