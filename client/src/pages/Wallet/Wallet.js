import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { UserContext } from '../../store/UserContext';

import Highcharts from 'highcharts/highstock';
import PieChart from 'highcharts-react-official';
import UserPosition from './UserPosition';

const Wrapper = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@300&display=swap');
  padding: 1rem 10rem;
  align-items: center;
  justify-content: center;
  min-height: 92vh;
  width: 100%;
  background-color: #131010;
  color: white;
`;

const NetWorthWrapper = styled.div`
  display: flex;
  margin-right: auto;
  flex-direction: column;
`;

const NeWorthTitle = styled.div`
  // font-family: 'Chivo Mono', monospace;
  margin-top: 2rem;
  letter-spacing: 0.3rem;
  font-size: 20px;
  font-weight: bold;
`;

const NetWorth = styled.div`
  font-family: 'Chivo Mono', monospace;
  font-size: 48px;
`;

const PortfolioWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 300px;
  margin-top: 1rem;
`;

const Portfolio = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-right: 8rem;
`;

const PortfolioTitle = styled.div`
  color: #fbc200;
  font-size: 1.1rem;
  text-align: left;
  margin: 1rem 1rem 1rem 0;
`;

const CashWrapper = styled.div`
  color: #bdbcb9;
  margin: 0.5rem 0;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  flex direction: row;
  justify-content: space-between;
`;

const StocksTitle = styled.div`
  color: #fbc200;
  font-size: 1.1rem;
  text-align: left;
  margin: 2rem 0 1rem 0;
`;

const StocksHeader = styled.div`
  display: flex;
  font-weight: bold;
  font-size: 1rem;
  color: #bdbcb9;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StockWrapper = styled.div`
  display: flex;
  font-size: 1rem;
  color: #bdbcb9;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const colors = ['#4E5CFD', '#4CCABE', '#8799C7', '#F2B115', '#894AB5'];

// Create the chart
const options = (data) => {
  return {
    chart: {
      type: 'pie',
      backgroundColor: '#131010',
    },
    title: {
      text: null,
    },
    subtitle: {
      text: '',
    },
    plotOptions: {
      pie: {
        shadow: false,
        borderWidth: 0,
      },
    },
    tooltip: {
      valueSuffix: '%',
      percentageDecimals: 4,
      valueDecimals: 2,
    },
    series: [
      {
        showInLegend: false,
        name: null,
        data: data,
        size: '100%',
        innerSize: '70%',
        dataLabels: {
          distance: -30,
        },
      },
    ],
  };
};

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [userStock, setUserStock] = useState([]);
  const [userId, setUserId] = useState('');
  const [stockPrices, setStockPrices] = useState({});
  const [sortedMarketData, setSortedMarketData] = useState([]);
  const { user } = React.useContext(UserContext);

  const thousandSeparator = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const calTotalAsset = (userStock, balance, stockPrices) => {
    const totalAsset = userStock.reduce((acc, stock) => {
      const { symbol, quantity } = stock;
      const price = stockPrices[symbol];
      return acc + price * quantity;
    }, 0);

    return totalAsset + balance;
  };

  const calEachStockAsset = (userStock, stockPrices) => {
    const stockAssets = userStock.map((stock) => {
      const { symbol, quantity } = stock;
      const price = stockPrices[symbol];
      return {
        symbol,
        quantity: quantity,
        asset: price * quantity,
      };
    });

    return stockAssets;
  };

  const sortMarketData = (userStock, balance, stockPrices) => {
    if (userStock.length === 0 || !stockPrices) return;
    const totalAsset = calTotalAsset(userStock, balance, stockPrices);
    const stockAssets = calEachStockAsset(userStock, stockPrices);
    let data = [];
    data.push({
      name: 'Cash',
      y: (balance / totalAsset) * 100,
      color: colors[0],
    });
    stockAssets.map((stock, index) => {
      data.push({
        name: stock.symbol,
        y: (stock.asset / totalAsset) * 100,
        color: colors[index + 1],
      });
    });
    return data;
  };

  React.useEffect(() => {
    (async () => {
      if (!user) return;

      const result = await api.getWallet(user.userId);

      if (!result) return;

      const { balance, stock, userId } = result;
      setBalance(balance);
      setUserStock(stock);
      setUserId(userId.slice(0, 8));
    })();
  }, [user]);

  React.useEffect(() => {
    (async () => {
      const result = await api.getStockPrices();

      if (!result) return;

      const { data } = result;
      setStockPrices(data);
    })();
  }, [user]);

  React.useEffect(() => {
    const data = sortMarketData(userStock, balance, stockPrices);
    setSortedMarketData(data);
  }, [userStock, balance, stockPrices]);

  return (
    <Wrapper>
      {/* <div>Wallet ID: {userId}</div> */}
      <NetWorthWrapper>
        <NeWorthTitle>Total Asset:</NeWorthTitle>
        <NetWorth>
          {`$${thousandSeparator(
            calTotalAsset(userStock, balance, stockPrices)
          )}`}
        </NetWorth>
      </NetWorthWrapper>

      <PortfolioWrapper>
        <PieChart
          containerProps={{ style: { height: '100%' } }}
          highcharts={Highcharts}
          options={options(sortedMarketData)}
        />
        <Portfolio>
          <PortfolioTitle>Summary</PortfolioTitle>
          <CashWrapper>
            <div>User ID </div>
            <div>{userId}</div>
          </CashWrapper>
          <CashWrapper>
            <div>Cash(NTD) </div>
            <div>{thousandSeparator(balance)}</div>
          </CashWrapper>
          <StocksTitle>Stocks</StocksTitle>

          <StocksHeader>
            <div>Symbol</div>
            <div>Amount</div>
            <div>Value(NTD)</div>
          </StocksHeader>

          {calEachStockAsset(userStock, stockPrices).map((stock) => {
            return (
              <StockWrapper key={stock.symbol}>
                <div>{stock.symbol}</div>
                <div>{thousandSeparator(stock.quantity)}</div>
                <div>{thousandSeparator(stock.asset)}</div>
              </StockWrapper>
            );
          })}
        </Portfolio>
      </PortfolioWrapper>
      <UserPosition></UserPosition>
    </Wrapper>
  );
}

export default Wallet;
