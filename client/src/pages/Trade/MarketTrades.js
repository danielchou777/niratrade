import React from 'react';
import styled from 'styled-components';

const MarketTradesWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem 1rem 1rem 2rem;
  background-color: #131010;
  grid-column: 5 / 6;
  grid-row: 1 / 3;
`;

const MarketTradesTitle = styled.div`
  color: #fbc200;
  font-size: 0.9rem;
  text-align: left;
  margin: 0.5rem 1rem 1rem 0rem;
`;

const MarketTradesHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  color: #bdbcb9;
  justify-content: space-between;
  font-weight: bold;
  padding: 4px 0;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const MarketTradeWrapper = styled.div`
  color: white;
  font-size: 0.8rem;
`;

const Price = styled.div`
  text-align: left;
  width: 30%;
`;

const Amount = styled.div`
  width: 30%;
`;

const Time = styled.div`
  width: 30%;
`;

const ExecutionWrapper = styled.div`
  color: #bdbcb9;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 0;
`;

const ExecutionPrice = styled.div`
  text-align: left;
  color: ${({ type }) => (type === 'buy' ? '#55e3b3' : '#fa6767')};
  width: 30%;
`;

const ExecutionAmount = styled.div`
  width: 30%;
`;

const ExecutionTime = styled.div`
  width: 30%;
`;

function MarketTrades(props) {
  const [executions, setExecutions] = React.useState(props.executions);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const timestampToDate = (timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
    let minute = date.getMinutes();
    if (minute < 10) minute = '0' + minute;
    let second = date.getSeconds();
    if (second < 10) second = '0' + second;
    return `${hour}:${minute}:${second}`;
  };

  React.useEffect(() => {
    setExecutions(props.executions);
  }, [props.executions]);

  return (
    <MarketTradesWrapper>
      <MarketTradesTitle>Market Trades</MarketTradesTitle>
      <MarketTradesHeader>
        <Price>Price(NTD)</Price>
        <Amount>Amount</Amount>
        <Time>Time</Time>
      </MarketTradesHeader>
      <MarketTradeWrapper>
        {executions &&
          executions.map((execution, index) => {
            return (
              <ExecutionWrapper key={index}>
                <ExecutionPrice type={execution.orderType}>
                  {thousandSeparator(execution.stockPrice)}
                </ExecutionPrice>
                <ExecutionAmount>
                  {thousandSeparator(execution.amount)}
                </ExecutionAmount>
                <ExecutionTime>{timestampToDate(execution.time)}</ExecutionTime>
              </ExecutionWrapper>
            );
          })}
      </MarketTradeWrapper>
    </MarketTradesWrapper>
  );
}

export default MarketTrades;
