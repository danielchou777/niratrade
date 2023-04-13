import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import Swal from 'sweetalert2';

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
  color: ${({ side }) => (side === 'buy' ? '#55e3b3' : '#fa6767')};
`;

function UserPosition(props) {
  const [openOrders, setOpenOrders] = React.useState(null);
  // const [refresh, setRefresh] = React.useState(0);

  React.useEffect(() => {
    (async function fetchWallet() {
      const { result } = await api.getPositions(
        '44c10eb0-2943-4282-88fc-fa01d1cb6ac0'
      );

      setOpenOrders(result);
    })();
  }, [props.refresh]);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <PositionTitle>
          Open Orders({openOrders && openOrders.length})
        </PositionTitle>
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
            partially_filled,
            created_at,
            quantity,
          } = order;

          const date = new Date(created_at);
          let month = date.getMonth() + 1;
          month = month < 10 ? '0' + month : month;
          let day = date.getDate();
          day = day < 10 ? '0' + day : day;
          let hour = date.getHours();
          hour = hour < 10 ? '0' + hour : hour;
          let minute = date.getMinutes();
          minute = minute < 10 ? '0' + minute : minute;
          let second = date.getSeconds();
          second = second < 10 ? '0' + second : second;

          const time =
            month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

          return (
            <OpenOrderWrapper key={order.id}>
              <OpenOrderDate>{time}</OpenOrderDate>
              <OpenOrder>{symbol}/NTD</OpenOrder>
              <OpenOrder>{type}</OpenOrder>
              <OpenOrderSide side={side}>{side}</OpenOrderSide>
              <OpenOrder>{price}</OpenOrder>
              <OpenOrder>{`${
                quantity - partially_filled
              }/${quantity}`}</OpenOrder>
              <OpenOrder>
                {Math.floor(((quantity - partially_filled) * 100) / quantity)}%
              </OpenOrder>
              <OpenOrder>{thousandSeparator(price * quantity)}</OpenOrder>
            </OpenOrderWrapper>
          );
        })}
    </Wrapper>
  );
}

export default UserPosition;
