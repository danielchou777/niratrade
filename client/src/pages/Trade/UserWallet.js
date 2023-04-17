import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  color: white;
  padding: 2rem 2rem 0rem 3rem;
  display: flex;
  flex-direction: column;
  background-color: #131010;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled.div`
  color: #fbc200;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
`;

const RefreshIcon = styled.div`
  width: 1rem;
  height: 1rem;
  color: #fbc200;
  cursor: pointer;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  &:hover {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const BalanceWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

const BalanceTitle = styled.div`
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Balance = styled.div`
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: right;
`;

const StockTitleWrapper = styled.div`
  color: #bdbcb9;
  display: flex;
  font-size: 0.9rem;
  justify-content: space-between;
  flex-direction: row;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const StockWrapper = styled.div`
  color: #bdbcb9;
  display: flex;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  justify-content: space-between;
  flex-direction: row;
`;

const StockSymbol = styled.div``;

const StockAmount = styled.div``;

function UserWallet(props) {
  const [balance, setBalance] = useState(0);
  const [userStock, setUserStock] = useState([]);
  const [userId, setUserId] = useState('');

  React.useEffect(() => {
    (async function fetchWallet() {
      const result = await api.getWallet(
        '44c10eb0-2943-4282-88fc-fa01d1cb6ac0'
      );

      const { balance, stock, userId } = result;
      setBalance(balance);
      setUserStock(stock);
      setUserId(userId.slice(0, 8));
    })();
  }, [props.refresh]);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Summary</Title>
        <RefreshIcon
          onClick={() => {
            props.setRefresh(props.refresh + 1);
            Swal.fire({
              icon: 'success',
              title: 'Refreshing...',
              showConfirmButton: false,
              timer: 700,
            });
          }}
        >
          <svg
            version='1.1'
            viewBox='0 0 129 129'
            enableBackground='new 0 0 129 129'
          >
            <g>
              <path
                d='M118.5,6.5c-2.3,0-4.1,1.8-4.1,4.1v24.3c-10.3-17.3-29-28.4-49.9-28.4c-32,0-58,26-58,58.1s26,58,58,58s58-26,58-58   c0-2.3-1.8-4.1-4.1-4.1s-4.1,1.8-4.1,4.1c0,27.5-22.4,49.9-49.9,49.9S14.6,92,14.6,64.5S37,14.6,64.5,14.6   c19.7,0,37.3,11.5,45.3,29.1H81.1c-2.3,0-4.1,1.8-4.1,4.1s1.8,4.1,4.1,4.1h37.3c2.3,0,4.1-1.8,4.1-4.1V10.5   C122.5,8.3,120.7,6.5,118.5,6.5z'
                id='id_101'
                style={{ fill: '#ffcacb' }}
                stroke='currentColor' // Use currentColor to inherit color from parent element
                strokeWidth='8'
              ></path>
            </g>
          </svg>
        </RefreshIcon>
      </TitleWrapper>
      <BalanceWrapper>
        <BalanceTitle>User ID</BalanceTitle>
        <Balance>{userId}</Balance>
      </BalanceWrapper>
      <BalanceWrapper>
        <BalanceTitle>Cash(NTD)</BalanceTitle>
        <Balance> ${thousandSeparator(balance)}</Balance>
      </BalanceWrapper>
      <br></br>
      <br></br>
      <Title>Wallet</Title>
      <StockTitleWrapper>
        <StockSymbol>Symbol</StockSymbol>
        <StockAmount> Amount</StockAmount>
      </StockTitleWrapper>
      {userStock.map((stock) => {
        return (
          <StockWrapper key={stock.symbol}>
            <StockSymbol>{stock.symbol}</StockSymbol>
            <StockAmount> {thousandSeparator(stock.quantity)}</StockAmount>
          </StockWrapper>
        );
      })}
    </Wrapper>
  );
}

export default UserWallet;
