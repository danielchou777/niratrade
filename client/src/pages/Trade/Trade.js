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
//TODO change to your own endpoint
const ENDPOINT = 'http://localhost:3000';

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
  const [stock, setStock] = React.useState('DAN');
  const [stocks, setStocks] = React.useState([]);

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

    function handleUserOrder() {
      setRefresh((prevRefresh) => prevRefresh + 1);
    }

    socket.on(`marketTrade-${stock}`, handleMarketTrade);
    socket.on(`orderBook-${stock}`, handleOrderBook);
    socket.on('user-44c10eb0-2943-4282-88fc-fa01d1cb6ac0', handleUserOrder);

    return () => {
      socket.off(`marketTrade-${stock}`, handleMarketTrade);
      socket.off(`orderBook-${stock}`, handleOrderBook);
      socket.off('user-44c10eb0-2943-4282-88fc-fa01d1cb6ac0', handleUserOrder);
    };
  }, [stock]);

  React.useEffect(() => {
    (async function fetchExecutions() {
      const result = await api.getExecutions(stock);
      setExecutions(result.executions);
      setStockInfo(result.executions[0]);
    })();
  }, [stock]);

  React.useEffect(() => {
    (async function fetchStocks() {
      const result = await api.getStocks();
      setStocks(result.stocks);
    })();
  }, []);

  return (
    <Wrapper>
      <UserWallet refresh={refresh} setRefresh={setRefresh} />
      <StockInfo
        stockInfo={stockInfo}
        setStock={setStock}
        stock={stock}
        stocks={stocks}
      />
      <OrderWrapper>
        <OrderForm
          onSubmit={api.sendOrder}
          refresh={refresh}
          setRefresh={setRefresh}
          stock={stock}
        />
        <OrderBooks
          buyOrderBook={buyOrderBook}
          sellOrderBook={sellOrderBook}
          stock={stock}
        />
        <UserPosition refresh={refresh} setRefresh={setRefresh} />
      </OrderWrapper>
      <MarketTrades executions={executions} stock={stock} refresh={refresh} />
    </Wrapper>
  );
}

export default Trade;
