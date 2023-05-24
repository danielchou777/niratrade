import pool from '../utils/database.js';

export const getBalance = async (userId) => {
  const [rows] = await pool.query(
    'SELECT balance FROM user WHERE user_id = ?',
    [userId]
  );

  return rows[0];
};

export const getStock = async (userId) => {
  const [rows] = await pool.query(
    'SELECT symbol, quantity FROM user_stock WHERE user_id = ?',
    [userId]
  );
  return rows;
};

export const getPosition = async (userId, page) => {
  const offset = (page - 1) * 6;

  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? AND (status = "0" OR status = "1") ORDER BY id LIMIT 6 OFFSET ?',
    [userId, offset]
  );

  return rows;
};

export const getPositionPage = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS page FROM orders WHERE user_id = ? AND (status = "0" OR status = "1")',
    [userId]
  );

  return rows[0].page;
};

export const getExecution = async (userId, symbol) => {
  const [rows] = await pool.query(
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

export const getAllPositions = async (userId, symbol, status, side, page) => {
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

  const offset = (page - 1) * 6;

  if (status === 'Open') {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? AND symbol LIKE ? AND (status = "0" OR status = "1") AND side LIKE ? ORDER BY created_at DESC LIMIT 6 OFFSET ?',
      [userId, symbol, side, offset]
    );

    const [result] = await pool.query(
      'SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND symbol LIKE ? AND (status = "0" OR status = "1") AND side LIKE ? ORDER BY created_at DESC',
      [userId, symbol, side]
    );

    return { rows, count: result[0].count };
  }
  // Update status
  if (status === 'All') {
    status = '%';
  } else if (status === 'Closed') {
    status = '2';
  } else if (status === 'Canceled') {
    status = '4';
  }

  if (status === 'Cancel') {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? AND symbol LIKE ? AND status = "4" AND side LIKE ? ORDER BY created_at DESC LIMIT 6 OFFSET ?',
      [userId, symbol, side, offset]
    );

    const [result] = await pool.query(
      'SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND symbol LIKE ? AND status = "4" AND side LIKE ? ORDER BY created_at DESC',
      [userId, symbol, side]
    );

    return { rows, count: result[0].count };
  }

  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? AND symbol LIKE ? AND status LIKE ? AND side LIKE ? ORDER BY created_at DESC LIMIT 6 OFFSET ?',
    [userId, symbol, status, side, offset]
  );

  const [result] = await pool.query(
    'SELECT COUNT(*) AS count FROM orders WHERE user_id = ? AND symbol LIKE ? AND status LIKE ? AND side LIKE ? ORDER BY created_at DESC',
    [userId, symbol, status, side]
  );

  return { rows, count: result[0].count };
};
