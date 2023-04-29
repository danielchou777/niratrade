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
  margin-top: 20px;
  display: grid;
  flex-direction: row;
  align-items: center;
  text-align: center;
  background-color: #131010;
`;

const InnerWrapper = styled.div`
  display: grid;
  flex-direction: column;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 70px repeat(1, 1fr);
`;

const LeftWrapper = styled.div`
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  margin-bottom: auto;
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
    if (!socket) return;

    function handleMarketTrade(data) {
      if (!data.executions) return;
      setExecutions(data.executions);
      setStockInfo(data.executions[0]);
    }

    function handleOrderBook(data) {
      if (!data.buyOrderBook || !data.sellOrderBook) return;
      setBuyOrderBook(data.buyOrderBook);
      setSellOrderBook(data.sellOrderBook);
    }

    function handleUserOrder(data) {
      if (!data) return;
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
  }, [refreshSocket, stock, user]);

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
      <InnerWrapper>
        <LeftWrapper>
          <OrderBooks
            buyOrderBook={buyOrderBook}
            sellOrderBook={sellOrderBook}
            stock={stock}
          />
          <UserWallet refresh={refresh} setRefresh={setRefresh} />
        </LeftWrapper>

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
        </OrderWrapper>
        <MarketTrades executions={executions} stock={stock} refresh={refresh} />
      </InnerWrapper>
      <UserPosition refresh={refresh} setRefresh={setRefresh} />
    </Wrapper>
  );
}

export default Trade;
