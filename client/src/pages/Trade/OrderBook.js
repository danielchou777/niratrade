import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';

const OrderBookWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: row;
  gap: 20px;
  background-color: #131010;
`;

const OrderBook = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const OrderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
`;

const OrderPrice = styled.div`
  color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
  padding-right: 2rem;
  text-align: right;
  width: 100px;
`;

const OrderQty = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 100px;
`;

const OrderBookHeader = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  color: #bdbcb9;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
`;

const Total = styled.div`
  font-weight: bold;
  color: white;
`;

const SubTotal = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 100px;
`;

const Price = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 100px;
`;

const Amount = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 100px;
`;
const Subtotal = styled.div`
  color: white;
  width: 100px;
`;

function OrderBooks(props) {
  const [buyOrderBook, setBuyOrderBook] = React.useState(null);
  const [sellOrderBook, setSellOrderBook] = React.useState(null);

  const { socket } = props;

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  React.useEffect(() => {
    socket.on('orderBook', (data) => {
      setBuyOrderBook(data.buyOrderBook);
      setSellOrderBook(data.sellOrderBook);
    });
  }, [socket]);

  React.useEffect(() => {
    (async function fetchOrderBook() {
      const { buyOrderBook, sellOrderBook } = await api.getOrderBook();
      setBuyOrderBook(buyOrderBook);
      setSellOrderBook(sellOrderBook);
    })();
  }, []);

  const getTotal = (orders) =>
    orders.reduce((total, order) => total + parseFloat(order[1]), 0);

  return (
    <OrderBookWrapper>
      <OrderBook>
        <OrderBookHeader>
          <Price>Price(NTD)</Price>
          <Amount>Amount</Amount>
          <SubTotal>Total</SubTotal>
        </OrderBookHeader>
        {buyOrderBook && (
          <>
            {buyOrderBook.map((order) => (
              <OrderWrapper key={order[0]}>
                <OrderPrice type='buy'>
                  {thousandSeparator(order[0])}
                </OrderPrice>
                <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                <SubTotal>
                  {thousandSeparator(Number(order[0]) * Number(order[1]))}
                </SubTotal>
              </OrderWrapper>
            ))}
            {/* <Total>Buy: {getTotal(buyOrderBook)}</Total> */}
          </>
        )}
      </OrderBook>
      <OrderBook>
        <OrderBookHeader>
          <Price>Price(NTD)</Price>
          <Amount>Amount</Amount>
          <SubTotal>Total</SubTotal>
        </OrderBookHeader>
        {sellOrderBook && (
          <>
            {sellOrderBook.map((order) => (
              <OrderWrapper key={order[0]}>
                <OrderPrice type='sell'>
                  {thousandSeparator(order[0])}
                </OrderPrice>
                <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                <SubTotal>
                  {thousandSeparator(Number(order[0]) * Number(order[1]))}
                </SubTotal>
              </OrderWrapper>
            ))}
            {/* <Total>Sell: {getTotal(sellOrderBook)}</Total> */}
          </>
        )}
      </OrderBook>
    </OrderBookWrapper>
  );
}

export default OrderBooks;
