import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { UserContext } from '../../store/UserContext';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #131010;
`;

const OrderBookTitle = styled.div`
  color: #fff;
  font-size: 30px;
  text-align: left;
  margin-top: 60px;
  margin-left: 11.8%;
  margin-bottom: 10px;
`;

const OrderBookWrapper = styled.div`
  width: 100%;
  margin-top: 20px;
  padding: 1rem 2rem 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
`;

const OrderBook = styled.div`
  // margin-left: 20px;
  width: 37vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const OrderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
  background: ${({ type, quantity }) => {
    const stopPosition = `${quantity / 20}%`;
    return type === 'buy'
      ? `linear-gradient(to left, rgb(85, 227, 179, 0.3) ${stopPosition}, #131010 ${stopPosition})`
      : `linear-gradient(to left, rgb(250, 103, 103, 0.3) ${stopPosition}, #131010 ${stopPosition})`;
  }};
`;

const OrderSide = styled.div`
  color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
  width: 20%;
`;

const OrderPrice = styled.div`
  // color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
  color: #bdbcb9;
  padding-right: 2rem;
  text-align: left;
  width: 20%;
`;

const OrderQty = styled.div`
  text-align: right;
  color: #bdbcb9;
  text-align: left;
  width: 15%;
`;

const OrderBookHeader = styled.div`
  width: 100%;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #bdbcb9;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
`;

const Side = styled.div`
  text-align: left;
  color: #bdbcb9;
  width: 20%;
`;

const SubTotal = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 15%;
`;

const Price = styled.div`
  text-align: left;
  color: #bdbcb9;
  width: 20%;
`;

const Amount = styled.div`
  text-align: left;
  color: #bdbcb9;
  width: 15%;
`;

function OrderBooks(props) {
  console.log('OrderBooks');
  // const stock = 'DAN';
  const [buyOrderBook, setBuyOrderBook] = React.useState(null);
  const [sellOrderBook, setSellOrderBook] = React.useState(null);
  const { socket, stock } = React.useContext(UserContext);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  React.useEffect(() => {
    (async function fetchOrderBook() {
      const { buyOrderBook, sellOrderBook } = await api.getOrderBook(
        `${stock}`
      );

      // const reverseSellOrderBook = sellOrderBook.reverse();
      setBuyOrderBook(buyOrderBook);
      setSellOrderBook(sellOrderBook);
    })();
  }, [stock]);

  React.useEffect(() => {
    if (!socket) return;

    function handleOrderBook(data) {
      if (!data.buyOrderBook || !data.sellOrderBook) return;
      setBuyOrderBook(data.buyOrderBook);
      setSellOrderBook(data.sellOrderBook);
    }

    socket.on(`orderBook-${stock}`, handleOrderBook);

    return () => {
      socket.off(`orderBook-${stock}`);
    };
  }, [stock]);

  return (
    <Wrapper>
      <OrderBookTitle>Order Book - {stock} </OrderBookTitle>
      <OrderBookWrapper>
        <OrderBook>
          <OrderBookHeader>
            <Side>Side</Side>
            <Price>Price (NTD)</Price>
            <Amount>Amount</Amount>
            <SubTotal>Total</SubTotal>
          </OrderBookHeader>
          {buyOrderBook && (
            <>
              {buyOrderBook.map((order, index) => {
                return (
                  <OrderWrapper key={order[0]} type='buy' quantity={order[1]}>
                    <OrderSide type='buy'> buy {index + 1}</OrderSide>
                    <OrderPrice type='buy'>
                      {thousandSeparator(order[0])}
                    </OrderPrice>
                    <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                    <SubTotal>
                      {thousandSeparator(Number(order[0]) * Number(order[1]))}
                    </SubTotal>
                  </OrderWrapper>
                );
              })}
              {/* <Total>Buy: {getTotal(buyOrderBook)}</Total> */}
            </>
          )}
        </OrderBook>
        <OrderBook>
          <OrderBookHeader>
            <Side>Side</Side>
            <Price>Price (NTD)</Price>
            <Amount>Amount</Amount>
            <SubTotal>Total</SubTotal>
          </OrderBookHeader>
          {sellOrderBook && (
            <>
              {sellOrderBook.map((order, index) => {
                return (
                  <OrderWrapper key={order[0]} type='sell' quantity={order[1]}>
                    <OrderSide type='sell'> sell {index + 1}</OrderSide>
                    <OrderPrice type='sell'>
                      {thousandSeparator(order[0])}
                    </OrderPrice>
                    <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                    <SubTotal>
                      {thousandSeparator(Number(order[0]) * Number(order[1]))}
                    </SubTotal>
                  </OrderWrapper>
                );
              })}
            </>
          )}
        </OrderBook>
      </OrderBookWrapper>
    </Wrapper>
  );
}

export default OrderBooks;
