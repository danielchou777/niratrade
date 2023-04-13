const api = {
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

  async getOrderBook() {
    const response = await fetch(`${api.hostname}/marketdata/orderBook`);
    return await response.json();
  },

  async getExecutions() {
    const response = await fetch(`${api.hostname}/marketdata/executions`);
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
};

export default api;
