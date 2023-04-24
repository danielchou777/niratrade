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
    'SELECT * FROM orders WHERE user_id = ? AND (status = "0" OR status = "1")',
    [userId]
  );
  return rows;
};

export const getExecution = async (userId, symbol) => {
  const [rows] = await pool.execute(
    'SELECT buy_user_id, sell_user_id, symbol, price, quantity, created_at FROM execution WHERE (buy_user_id = ? OR sell_user_id = ?) AND symbol = ? ORDER BY created_at DESC LIMIT 30',
    [userId, userId, symbol]
  );

  rows.map((row) => {
    if (row.buy_user_id === userId) {
      row.orderType = 'buy';
    } else {
      row.orderType = 'sell';
    }
    row.stockPrice = row.price;
    row.amount = row.quantity;
    row.time = new Date(row.created_at).getTime();
    delete row.buy_user_id;
    delete row.sell_user_id;
    delete row.price;
    delete row.quantity;
    delete row.created_at;
    return row;
  });

  return rows;
};

export const getAllPositions = async (userId, symbol, status, side) => {
  if (symbol === 'All') {
    symbol = '%';
  }

  // Update side
  if (side === 'All') {
    side = '%';
  } else if (side === 'Buy') {
    side = 'b';
  } else if (side === 'Sell') {
    side = 's';
  }

  if (status === 'Open') {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? AND symbol LIKE ? AND (status = "0" OR status = "1") AND side LIKE ? ORDER BY created_at DESC',
      [userId, symbol, side]
    );

    return rows;
  }
  // Update status
  if (status === 'All') {
    status = '%';
  } else if (status === 'Closed') {
    status = '2';
  }

  const [rows] = await pool.execute(
    'SELECT * FROM orders WHERE user_id = ? AND symbol LIKE ? AND status LIKE ? AND side LIKE ? ORDER BY created_at DESC',
    [userId, symbol, status, side]
  );

  return rows;
};
