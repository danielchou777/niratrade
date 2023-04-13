import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import OrderForm from './OrderForm';
import OrderBooks from './OrderBook';
import MarketTrades from './MarketTrades';
import StockInfo from './StockInfo';
import UserWallet from './UserWallet';
import UserPosition from './UserPosition';

import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:3000';

const Wrapper = styled.div`
  padding: 60px 20px;
  display: grid;
  flex-direction: column;
  align-items: center;
  text-align: center;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 70px repeat(1, 1fr); ;
`;

const OrderWrapper = styled.div`
  height: 100%;
  grid-column: 2 / 5;
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
`;

function Trade() {
  const socketRef = React.useRef(null);
  const [executions, setExecutions] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);

  const [buyOrderBook, setBuyOrderBook] = React.useState(null);
  const [sellOrderBook, setSellOrderBook] = React.useState(null);

  React.useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient(ENDPOINT);
    }
    const socket = socketRef.current;

    function handleMarketTrade(data) {
      setExecutions(data.executions);
      setStockInfo(data.executions[0]);
    }

    function handleOrderBook(data) {
      setBuyOrderBook(data.buyOrderBook);
      setSellOrderBook(data.sellOrderBook);
    }

    socket.on('marketTrade', handleMarketTrade);
    socket.on('orderBook', handleOrderBook);

    return () => {
      socket.off('marketTrade', handleMarketTrade);
      socket.off('orderBook', handleOrderBook);
    };
  }, []);

  React.useEffect(() => {
    (async function fetchExecutions() {
      const result = await api.getExecutions();
      setExecutions(result.executions);
      setStockInfo(result.executions[0]);
    })();
  }, []);

  return (
    <Wrapper>
      <UserWallet refresh={refresh} setRefresh={setRefresh} />
      <StockInfo stockInfo={stockInfo} />
      <OrderWrapper>
        <OrderForm
          onSubmit={api.sendOrder}
          refresh={refresh}
          setRefresh={setRefresh}
        />
        <OrderBooks buyOrderBook={buyOrderBook} sellOrderBook={sellOrderBook} />
        <UserPosition refresh={refresh} setRefresh={setRefresh} />
      </OrderWrapper>
      <MarketTrades executions={executions} />
    </Wrapper>
  );
}

export default Trade;
