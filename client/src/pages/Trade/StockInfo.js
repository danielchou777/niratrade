import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';

const Wrapper = styled.div`
  height: 100%;
  grid-column: 2 / 5;
  grid-row: 1 / 2;
  color: white;
  padding: 2rem 2rem 0rem 2rem;
  display: flex;
  background-color: #131010;
  justify-content: space-between;
`;

const InfoWrapper = styled.div`
  display: flex;
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

const StockSearhBarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 2px solid #313131;
  border-radius: 4px;
  background-color: #313131;
  &:focus-within {
    border: 2px solid #fbc200;
  }
`;

const SearchBar = styled.select`
  background-color: #313131;
  color: #fff;
  border: none;
  font-size: 16px;
  padding: 8px 16px;
  width: 300px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const SearchBarOption = styled.option`
  background-color: #222;
  color: #fff;
  border: none;
  font-size: 16px;
  padding: 8px 16px;
  width: 300px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
`;

const SearchBarIcon = styled.div``;

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
      <InfoWrapper>
        <StockName>
          {props.stocks.length > 0
            ? props.stocks.find((stock) => stock.symbol === props.stock).name +
              ` (${props.stock})`
            : ''}
        </StockName>
        <StockPrice type={orderType}>
          {thousandSeparator(stockPrice)}
        </StockPrice>
      </InfoWrapper>
      <StockSearhBarWrapper>
        <SearchBar
          value={props.stock}
          onChange={(e) => {
            props.setStock(e.target.value);
          }}
        >
          <SearchBarOption value='' disabled>
            -- SELECT A STOCK --
          </SearchBarOption>
          {props.stocks.map((stock) => (
            <SearchBarOption key={stock.symbol} value={stock.symbol}>
              {stock.symbol}
            </SearchBarOption>
          ))}
        </SearchBar>
        <div className='select-icon'>
          <IoMdArrowDropdown />
        </div>
      </StockSearhBarWrapper>
    </Wrapper>
  );
}

export default StockInfo;
