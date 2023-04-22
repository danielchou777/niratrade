import React from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import darkUnica from 'highcharts/themes/dark-unica'; // Import the dark-unica theme
// import { data } from './data.js';
import api from '../../utils/api';

const MarketChartWrapper = styled.div`
  width: 100%;
  padding: 1rem 1rem 1rem 2rem;
  background-color: #131010;
  color: white;
`;

darkUnica(Highcharts);

let volumeColor = '';

let ohlc = [],
  volume = [],
  // set the allowed units for data grouping
  groupingUnits = {
    forced: true,
    enabled: true,
    units: [
      [
        'millisecond', // unit name
        [1, 2, 5, 10, 20, 25, 50, 100, 200, 500], // allowed multiples
      ],
      ['second', [1, 2, 5, 10, 15, 30]],
      ['minute', [1, 5, 10, 15, 30]],
      ['hour', [1, 3, 6, 12]],
      ['day', [1]],
      ['week', [1]],
      ['month', [6]],
      ['year', null],
    ],
  };

const sortMarketData = (data) => {
  ohlc = [];
  for (let i = 0; i < data.length; i++) {
    ohlc.push([
      data[i][0] * 1000, // the date
      data[i][1], // open
      data[i][2], // high
      data[i][3], // low
      data[i][4], // close
    ]);

    if (data[i][1] < data[i][4]) {
      volumeColor = '#55e3b3';
    } else {
      volumeColor = '#fa6767';
    }

    volume.push({
      x: data[i][0] * 1000, // the date
      y: data[i][5],
      color: volumeColor,
    });
  }
  return ohlc;
};

const options = (ohlc) => ({
  rangeSelector: {
    animation: false,
    enabled: true,
    selected: 6,
    buttons: [
      {
        type: 'hour',
        count: 1,
        text: '1m',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['minute', [1]]],
        },
      },
      {
        type: 'hour',
        count: 3,
        text: '5m',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['minute', [5]]],
        },
      },
      {
        type: 'hour',
        count: 'All',
        text: '10m',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['minute', [10]]],
        },
      },
      {
        type: 'hour',
        count: 'All',
        text: '30m',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['minute', [30]]],
        },
      },
      {
        type: 'day',
        count: 'All',
        text: '1hr',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['hour', [1]]],
        },
      },
      {
        type: 'week',
        count: 'All',
        text: 'all',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['day', [1]]],
        },
      },
    ],
  },

  time: {
    timezoneOffset: -8 * 60,
  },

  yAxis: [
    {
      labels: {
        align: 'right',
        x: -3,
      },
      title: {
        text: null,
      },
      height: '60%',
      lineWidth: 2,
      resize: {
        enabled: true,
      },
    },
    {
      labels: {
        align: 'right',
        x: -3,
      },
      title: {
        text: null,
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2,
    },
  ],

  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      day: '%e %b %Y', // example: 1 Jan 2022
      week: '%e %b %Y', // example: 1 Jan 2022
      month: '%b %Y', // example: Jan 2022
      year: '%Y', // example: 2022
    },
  },

  scrollbar: {
    enabled: true,
  },

  tooltip: {
    split: true,
  },

  title: {
    text: null, // Set to null to remove the chart title
  },

  legend: {
    enabled: false, // Set to false to remove the legend items
  },

  chart: {
    backgroundColor: '#131010', // Set the desired background color here
  },

  plotOptions: {
    series: {
      enableMouseTracking: true,
      animation: false,
    },
  },

  series: [
    {
      type: 'candlestick',
      name: 'AAPL',
      data: ohlc,
      color: '#fa6767', // Set the color for negative candles (default)
      upColor: '#55e3b3', // Set the color for positive candles
      lineColor: '#fa6767', // Set the color for the candlestick line
      upLineColor: '#55e3b3', // Set the color for the candlestick line
      dataGrouping: groupingUnits,
    },
    {
      type: 'column',
      name: 'Volume',
      data: volume,
      yAxis: 1,
      borderWidth: 0,
      dataGrouping: groupingUnits,
    },
  ],
});

const MarketChart = React.memo((props) => {
  const [chartData, setChartData] = React.useState([]);

  React.useEffect(() => {
    api.getMarketChartData(props.stock).then((res) => {
      const sortedMarketData = sortMarketData(res.marketdata);
      setChartData(sortedMarketData);
    });
  }, [props.stock]);

  return (
    <MarketChartWrapper>
      <HighchartsReact
        isPureConfig={false}
        highcharts={Highcharts}
        options={options(chartData)}
        theme={darkUnica}
      />
    </MarketChartWrapper>
  );
});

export default MarketChart;
