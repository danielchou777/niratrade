import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';
import { toFormatedTime } from '../../utils/util';
import { BsTrash } from 'react-icons/bs';
import { index } from 'd3';
import Swal from 'sweetalert2';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  color: white;
  padding: 2rem 2rem 0rem 3rem;
  display: flex;
  flex-direction: column;
  background-color: #131010;
  margin-bottom: 2rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const BlockWrapper = styled.div`
  margin: 1rem 4rem 0 4rem;
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
  border-bottom: 1px solid #2c2c2c;
`;

const HeaderDate = styled.div`
  width: 14%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  margin-left: 1rem;
  font-weight: bold;
`;

const Header = styled.div`
  width: 10%;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const CancelHeader = styled.div`
  width: 6%;
  color: #bdbcb9;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: 1rem;
  margin-right: 1rem;
  font-weight: bold;
`;

const OpenOrderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 0.8rem 0rem 0.8rem 0rem;
  border-bottom: 1px solid #2c2c2c;
  align-items: center;
`;

const OpenOrderDate = styled.div`
  font-size: 0.9rem;
  width: 14%;
  margin-left: 1rem;
  text-align: left;
  color: #bdbcb9;
`;

const OpenOrder = styled.div`
  font-size: 0.9rem;
  width: 10%;
  text-align: left;
  color: #bdbcb9;
  text-transform: capitalize;
`;

const OpenOrderSide = styled.div`
  font-size: 0.9rem;
  width: 10%;
  text-align: left;
  text-transform: capitalize;
  color: ${({ side }) => (side === 'b' ? '#55e3b3' : '#fa6767')};
`;

const CancelOrder = styled.div`
  width: 6%;
  display: flex;
  justify-content: center;
  margin-right: 1rem;
  align-items: center;
`;

const CancelOrderBtn = styled.div`
  // background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 20px;
  width: 20px;

  &:hover {
    color: #fbc200;
  }
`;

const NoOpenWrapper = styled.div`
  color: #bdbcb9;
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
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

  const handleCancelOrder = async (index) => {
    const order = openOrders[index];
    const cancelOrder = {
      symbol: order.symbol,
      userId: order.user_id,
      price: order.price,
      quantity: order.quantity,
      type: order.type,
      side: order.side,
      status: '4',
      orderIdCancel: order.order_id,
    };
    const { msg } = await api.sendOrder(cancelOrder);
    if (msg === 'Invalid cancel order') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid cancel order',
      });
    } else {
      Swal.fire(
        'Order submitted',
        'Your order has been canceled successfully',
        'success'
      );
    }
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <PositionTitle>
          Open Orders({openOrders && openOrders.length})
        </PositionTitle>
      </TitleWrapper>
      <BlockWrapper>
        <PositionHeaders>
          <HeaderDate>Date</HeaderDate>
          <Header>Pair</Header>
          <Header>Type</Header>
          <Header>Side</Header>
          <Header>Price(NTD)</Header>
          <Header>Amount</Header>
          <Header>Filled</Header>
          <Header>Total(NTD)</Header>
          <CancelHeader>Cancel</CancelHeader>
        </PositionHeaders>
        {openOrders &&
          openOrders.map((order, index) => {
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
                  {Math.floor(
                    ((quantity - unfilled_quantity) * 100) / quantity
                  )}
                  %
                </OpenOrder>
                <OpenOrder>{thousandSeparator(price * quantity)}</OpenOrder>
                <CancelOrder>
                  <CancelOrderBtn onClick={() => handleCancelOrder(index)}>
                    <BsTrash />
                  </CancelOrderBtn>
                </CancelOrder>
              </OpenOrderWrapper>
            );
          })}

        <NoOpenWrapper>
          {openOrders.length === 0 && <div>No open orders</div>}
        </NoOpenWrapper>
      </BlockWrapper>
    </Wrapper>
  );
}

export default UserPosition;
