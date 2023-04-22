import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import OrderForm from './OrderForm';
import OrderBooks from './OrderBook';
import MarketTrades from './MarketTrades';
import StockInfo from './StockInfo';
import UserWallet from './UserWallet';
import UserPosition from './UserPosition';
import MarketChart from './MarketChart';
import Swal from 'sweetalert2';
import { UserContext } from '../../store/UserContext';

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
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
`;

function Trade() {
  const [executions, setExecutions] = React.useState(null);
  const [stockInfo, setStockInfo] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [stock, setStock] = React.useState('DAN');
  const [stocks, setStocks] = React.useState([]);
  const { user, refreshSocket, socket } = React.useContext(UserContext);
  const [buyOrderBook, setBuyOrderBook] = React.useState(null);
  const [sellOrderBook, setSellOrderBook] = React.useState(null);

  React.useEffect(() => {
    const jwtToken = window.localStorage.getItem('jwtToken');
    if (!jwtToken) {
      Swal.fire({
        title: 'Please Sign In To Unlock',
        icon: 'warning',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.href = './signin';
      });
      return;
    }
  }, []);

  React.useEffect(() => {
    console.log(socket);
    if (!socket) return;

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

    if (user) {
      socket.on(`user-${user.userId}`, handleUserOrder);
    }

    return () => {
      socket.off(`marketTrade-${stock}`);
      socket.off(`orderBook-${stock}`);

      if (user) {
        socket.off(`user-${user.userId}`);
      }
    };
  }, [refreshSocket]);

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

      <OrderWrapper>
        <StockInfo
          stockInfo={stockInfo}
          setStock={setStock}
          stock={stock}
          stocks={stocks}
        />

        <OrderForm
          onSubmit={api.sendOrder}
          refresh={refresh}
          setRefresh={setRefresh}
          stock={stock}
        />
        <MarketChart stock={stock}></MarketChart>
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
