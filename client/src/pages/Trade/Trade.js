import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import OrderForm from './OrderForm';
import OrderBooks from './OrderBook';
import MarketTrades from './MarketTrades';
import StockInfo from './StockInfo';

import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:3000';

const Wrapper = styled.div`
  padding: 60px 20px;
  display: grid;
  flex-direction: column;
  align-items: center;
  text-align: center;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 70px repeat(5, 1fr); ;
`;

const OrderWrapper = styled.div`
  height: 100%;
  grid-column: 2 / 5;
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
`;

function Trade() {
  const socket = socketIOClient(ENDPOINT);
  const [executions, setExecutions] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  React.useEffect(() => {
    socket.on('marketTrade', (data) => {
      setExecutions(data.executions);
      setStockInfo(data.executions[0]);
    });
  }, [socket]);

  React.useEffect(() => {
    (async function fetchExecutions() {
      const result = await api.getExecutions();
      setExecutions(result.executions);
      setStockInfo(result.executions[0]);
    })();
  }, []);

  return (
    <Wrapper>
      <StockInfo stockInfo={stockInfo} />
      <OrderWrapper>
        <OrderForm onSubmit={api.sendOrder} socket={socket} />
        <OrderBooks socket={socket} />
      </OrderWrapper>
      <MarketTrades socket={socket} executions={executions} />
    </Wrapper>
  );
}

export default Trade;
