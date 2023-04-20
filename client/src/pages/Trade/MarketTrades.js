import React from 'react';
import styled from 'styled-components';
import api from '../../utils/api';

const MarketTradesWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem 1rem 1rem 2rem;
  background-color: #131010;
  grid-column: 5 / 6;
  grid-row: 1 / 3;
`;

const MarketTradesTitleWrapper = styled.div`
  display: flex;
`;

const MarketTradesTitle = styled.div`
  color: ${({ isClick }) => (isClick ? '#fbc200' : '#bdbcb9')};
  font-size: 0.9rem;
  text-align: left;
  margin: 0.5rem 1rem 1rem 0rem;
  cursor: pointer;
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
  const [isMarketTrade, setIsMarketTrade] = React.useState(true);
  const [isMyTrade, setIsMyTrade] = React.useState(false);

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
    if (!isMarketTrade) return;
    setExecutions(props.executions);
  }, [props.executions]);

  React.useEffect(() => {
    if (!isMyTrade) return;
    (async () => {
      const result = await api.getUserExecutions(
        '44c10eb0-2943-4282-88fc-fa01d1cb6ac0',
        props.stock
      );
      setExecutions(result.result);
    })();
  }, [isMyTrade, props.stock, props.refresh]);

  return (
    <MarketTradesWrapper>
      <MarketTradesTitleWrapper>
        <MarketTradesTitle
          isClick={isMarketTrade}
          onClick={() => {
            setIsMarketTrade(true);
            setIsMyTrade(false);
            setExecutions(props.executions);
          }}
        >
          Market Trades
        </MarketTradesTitle>
        <MarketTradesTitle
          isClick={isMyTrade}
          onClick={async () => {
            setIsMarketTrade(false);
            setIsMyTrade(true);
          }}
        >
          My Trades
        </MarketTradesTitle>
      </MarketTradesTitleWrapper>
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
