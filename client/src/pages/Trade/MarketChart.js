import React from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import darkUnica from 'highcharts/themes/dark-unica'; // Import the dark-unica theme
import { data } from './data.js';
import moment from 'moment';
import api from '../../utils/api';

const MarketChartWrapper = styled.div`
  width: 100%;
  padding: 1rem 1rem 1rem 2rem;
  background-color: #131010;
  color: white;
`;
let volumeColor = '';
let ohlc = [],
  volume = [],
  dataLength = data.length,
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
      ['minute', [15, 30]],
      ['hour', [12]],
      ['day', [1]],
      ['week', [1]],
      ['month', [6]],
      ['year', null],
    ],
  },
  i = 0;

for (i; i < dataLength; i += 1) {
  ohlc.push([
    data[i][0], // the date
    data[i][1], // open
    data[i][2], // high
    data[i][3], // low
    data[i][4], // close
  ]);

  if (i === 0) {
    volumeColor = '#CCCCCC';
  } else {
    if (data[i][1] < data[i][4]) {
      volumeColor = '#55e3b3';
    } else {
      volumeColor = '#fa6767';
    }
  }

  volume.push({
    x: data[i][0], // the date
    y: data[i][5],
    color: volumeColor,
  });
}

const options = () => ({
  rangeSelector: {
    enabled: true,
    selected: 10,
    buttons: [
      {
        type: 'month',
        count: 6,
        text: '1d',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['day', [1]]],
        },
      },
      {
        type: 'month',
        count: 'All',
        text: '1w',
        preserveDataGrouping: true,
        dataGrouping: {
          forced: true,
          units: [['week', [1]]],
        },
      },
    ],
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

function MarketChart(props) {
  darkUnica(Highcharts);

  return (
    <MarketChartWrapper>
      <HighchartsReact
        highcharts={Highcharts}
        options={options()}
        theme={darkUnica}
      />
    </MarketChartWrapper>
  );
}

export default MarketChart;
