import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';
import { toFormatedTime } from '../../utils/util';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  grid-column: 2 / 5;
  grid-row: 1 / 2;
  color: white;
  padding: 2rem 2rem 0rem 2rem;
  display: flex;
  flex-direction: column;
  background-color: #131010;
  margin-bottom: 1rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const PositionTitle = styled.div`
  color: #fbc200;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  margin-right: 1rem;
`;

const PositionHeaders = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

const HeaderDate = styled.div`
  width: 18%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Header = styled.div`
  width: 12%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const OpenOrderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 1.5rem;
`;

const OpenOrderDate = styled.div`
  font-size: 0.9rem;
  width: 18%;
  text-align: left;
  color: #bdbcb9;
`;

const OpenOrder = styled.div`
  font-size: 0.9rem;
  width: 12%;
  text-align: left;
  color: #bdbcb9;
  text-transform: capitalize;
`;

const OpenOrderSide = styled.div`
  font-size: 0.9rem;
  width: 12%;
  text-align: left;
  text-transform: capitalize;
  color: ${({ side }) => (side === 'b' ? '#55e3b3' : '#fa6767')};
`;

function UserPosition(props) {
  const [openOrders, setOpenOrders] = React.useState([]);
  const { user } = React.useContext(UserContext);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const { result } = await api.getPositions(user.userId);

      setOpenOrders(result);
    })();
  }, [props.refresh, user]);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <PositionTitle>
          Open Orders({openOrders && openOrders.length})
        </PositionTitle>
      </TitleWrapper>
      <PositionHeaders>
        <HeaderDate>Date</HeaderDate>
        <Header>Pair</Header>
        <Header>Type</Header>
        <Header>Side</Header>
        <Header>Price(NTD)</Header>
        <Header>Amount</Header>
        <Header>Filled</Header>
        <Header>Total(NTD)</Header>
      </PositionHeaders>
      {openOrders &&
        openOrders.map((order) => {
          const {
            symbol,
            side,
            type,
            price,
            unfilled_quantity,
            created_at,
            quantity,
          } = order;

          const time = toFormatedTime(created_at);

          return (
            <OpenOrderWrapper key={order.id}>
              <OpenOrderDate>{time}</OpenOrderDate>
              <OpenOrder>{symbol}/NTD</OpenOrder>
              <OpenOrder>{type === '2' ? 'limit' : 'NULL'}</OpenOrder>
              <OpenOrderSide side={side}>
                {side === 'b' ? 'buy' : 'sell'}
              </OpenOrderSide>
              <OpenOrder>{price}</OpenOrder>
              <OpenOrder>{`${
                quantity - unfilled_quantity
              }/${quantity}`}</OpenOrder>
              <OpenOrder>
                {Math.floor(((quantity - unfilled_quantity) * 100) / quantity)}%
              </OpenOrder>
              <OpenOrder>{thousandSeparator(price * quantity)}</OpenOrder>
            </OpenOrderWrapper>
          );
        })}
    </Wrapper>
  );
}

export default UserPosition;
