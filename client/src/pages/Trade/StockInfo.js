import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100%;
  grid-column: 2 / 5;
  grid-row: 1 / 2;
  color: white;
  padding: 2rem 2rem 0rem 2rem;
  display: flex;
  background-color: #131010;
`;

const StockName = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600&display=swap');
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  color: #d5d4cf;
  font-size: 1.5rem;
  text-align: left;
  display: flex;
  margin-right: 1.5rem;
`;

const StockPrice = styled.div`
  font-size: 1.8rem;
  display: flex;
  font-weight: bold;
  text-align: left;
  color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
`;

function StockInfo(props) {
  // const [stockInfo, setStockInfo] = useState('');
  const [stockPrice, setStockPrice] = useState('');
  const [orderType, setOrderType] = useState('');

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  React.useEffect(() => {
    if (props.stockInfo) {
      setOrderType(props.stockInfo.orderType);
      setStockPrice(props.stockInfo.stockPrice);
    }
  }, [props.stockInfo]);

  return (
    <Wrapper>
      <StockName>Daniel Inc. (DAN)</StockName>
      <StockPrice type={orderType}>{thousandSeparator(stockPrice)}</StockPrice>
    </Wrapper>
  );
}

export default StockInfo;
