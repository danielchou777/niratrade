const api = {
  //TODO change this to your own hostname
  // hostname: 'https://www.danielchou.online/api/1.0',
  hostname: 'http://localhost:3000/api/1.0',

  async sendOrder(order) {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const response = await fetch(`${api.hostname}/match/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(order),
    });
    return await response.json();
  },

  async getOrderBook(symbol) {
    const response = await fetch(
      `${api.hostname}/marketdata/orderBook?symbol=${symbol}`
    );
    return await response.json();
  },

  async getExecutions(symbol) {
    const response = await fetch(
      `${api.hostname}/marketdata/executions?symbol=${symbol}`
    );
    return await response.json();
  },

  async getWallet() {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const response = await fetch(`${api.hostname}/userdata/wallet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return await response.json();
  },

  async getPositions(page) {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const response = await fetch(
      `${api.hostname}/userdata/position?page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return await response.json();
  },

  async getStocks() {
    const response = await fetch(`${api.hostname}/marketdata/stocks`);
    return await response.json();
  },

  async getUserExecutions(userId, symbol) {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const response = await fetch(
      `${api.hostname}/userdata/execution?symbol=${symbol}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return await response.json();
  },

  async getMarketChartData(symbol, time) {
    if (time) {
      const response = await fetch(
        `${api.hostname}/marketdata/marketchart?symbol=${symbol}&time=${time}`
      );
      return await response.json();
    }

    const response = await fetch(
      `${api.hostname}/marketdata/marketchart?symbol=${symbol}`
    );
    return await response.json();
  },

  async signin(email, password) {
    const response = await fetch(`${api.hostname}/user/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  },

  async signup(name, email, password) {
    const response = await fetch(`${api.hostname}/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  },

  async getUserProfile(jwtToken) {
    const response = await fetch(`${api.hostname}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return await response.json();
  },

  async getStockPrices() {
    const response = await fetch(`${api.hostname}/marketdata/stockprices`);
    return await response.json();
  },

  async getAllPositions(symbol, status, side, page) {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const response = await fetch(
      `${api.hostname}/userdata/allPosition?symbol=${symbol}&status=${status}&side=${side}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return await response.json();
  },
};

export default api;
