const api = {
  //TODO change this to your own hostname
  hostname: 'http://localhost:3000/api/1.0',

  async sendOrder(order) {
    const response = await fetch(`${api.hostname}/match/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  async getWallet(userId) {
    const response = await fetch(`${api.hostname}/userdata/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  },

  async getPositions(userId) {
    const response = await fetch(`${api.hostname}/userdata/position`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  },

  async getStocks() {
    const response = await fetch(`${api.hostname}/marketdata/stocks`);
    return await response.json();
  },

  async getUserExecutions(userId, symbol) {
    const response = await fetch(`${api.hostname}/userdata/execution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, symbol }),
    });
    return await response.json();
  },

  async getMarketChartData(symbol) {
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
};

export default api;
