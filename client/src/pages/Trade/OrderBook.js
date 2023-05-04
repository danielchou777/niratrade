import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Wrapper = styled.div``;

const OrderBookWrapper = styled.div`
  width: 100%;
  // height: 200px;
  padding: 1rem 2rem 0rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #131010;
`;

const OrderBookTitle = styled.div`
  color: #fbc200;
  font-size: 0.9rem;
  text-align: left;
  margin: 0.5rem 0rem 0rem 0.2rem;
  cursor: pointer;
`;

const OrderBook = styled.div`
  width: 100%;
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
    const stopPosition = `${quantity / 10}%`;
    return type === 'buy'
      ? `linear-gradient(to left, rgb(85, 227, 179, 0.3) ${stopPosition}, #131010 ${stopPosition})`
      : `linear-gradient(to left, rgb(250, 103, 103, 0.3) ${stopPosition}, #131010 ${stopPosition})`;
  }};
`;

const OrderPrice = styled.div`
  color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
  padding-right: 2rem;
  text-align: right;
  width: 80px;
`;

const OrderQty = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 80px;
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

const SubTotal = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 100px;
`;

const Price = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 80px;
`;

const Amount = styled.div`
  text-align: right;
  color: #bdbcb9;
  width: 80px;
`;

const MoreBtn = styled.div`
  padding-right: 2rem;
  padding-top: 0.5rem;
  padding: 0.8rem 2rem 0;
  color: #bdbcb9;
  font-size: 0.9rem;
  text-align: right;
  cursor: pointer;

  &:hover {
    color: #fbc200;
  }
`;

function OrderBooks(props) {
  const [buyOrderBook, setBuyOrderBook] = React.useState(null);
  const [sellOrderBook, setSellOrderBook] = React.useState(null);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const navigate = useNavigate();

  const handleMoreBtnClick = () => {
    navigate(`/orderbook`);
  };

  React.useEffect(() => {
    setBuyOrderBook(props.buyOrderBook);

    if (!props.sellOrderBook) return;

    const sellOrderBook = props.sellOrderBook.reverse();
    setSellOrderBook(sellOrderBook);
  }, [props.buyOrderBook, props.sellOrderBook]);

  React.useEffect(() => {
    (async function fetchOrderBook() {
      const { buyOrderBook, sellOrderBook } = await api.getOrderBook(
        `${props.stock}`
      );

      const reverseSellOrderBook = sellOrderBook.reverse();
      setBuyOrderBook(buyOrderBook);
      setSellOrderBook(reverseSellOrderBook);
    })();
  }, [props.stock]);

  return (
    <Wrapper>
      <OrderBookWrapper>
        <OrderBookTitle>Order Books</OrderBookTitle>
        <OrderBook>
          <OrderBookHeader>
            <Price>Price (NTD)</Price>
            <Amount>Amount</Amount>
            <SubTotal>Total</SubTotal>
          </OrderBookHeader>
          {sellOrderBook && (
            <>
              {sellOrderBook.map((order, index) => {
                if (sellOrderBook.length - index <= 5) {
                  return (
                    <OrderWrapper
                      key={order[0]}
                      type='sell'
                      quantity={order[1]}
                    >
                      <OrderPrice type='sell'>
                        {thousandSeparator(order[0])}
                      </OrderPrice>
                      <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                      <SubTotal>
                        {thousandSeparator(Number(order[0]) * Number(order[1]))}
                      </SubTotal>
                    </OrderWrapper>
                  );
                }
              })}
            </>
          )}
        </OrderBook>
        <OrderBook>
          <OrderBookHeader>
            <Price>Price (NTD)</Price>
            <Amount>Amount</Amount>
            <SubTotal>Total</SubTotal>
          </OrderBookHeader>
          {buyOrderBook && (
            <>
              {buyOrderBook.map((order, index) => {
                if (index < 5) {
                  return (
                    <OrderWrapper key={order[0]} type='buy' quantity={order[1]}>
                      <OrderPrice type='buy'>
                        {thousandSeparator(order[0])}
                      </OrderPrice>
                      <OrderQty>{thousandSeparator(order[1])}</OrderQty>
                      <SubTotal>
                        {thousandSeparator(Number(order[0]) * Number(order[1]))}
                      </SubTotal>
                    </OrderWrapper>
                  );
                }
              })}
              {/* <Total>Buy: {getTotal(buyOrderBook)}</Total> */}
            </>
          )}
        </OrderBook>
      </OrderBookWrapper>
      <MoreBtn onClick={handleMoreBtnClick}>More</MoreBtn>
    </Wrapper>
  );
}

export default OrderBooks;
