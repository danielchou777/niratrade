import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';

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
  const { user } = React.useContext(UserContext);

  React.useEffect(() => {
    (async function fetchWallet() {
      if (!user) return;

      const result = await api.getWallet(user.userId);

      const { balance, stock, userId } = result;
      setBalance(balance);
      setUserStock(stock);
      setUserId(userId.slice(0, 8));
    })();
  }, [props.refresh, user]);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Summary</Title>
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
