import React from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more'; //module
import darkUnica from 'highcharts/themes/dark-unica'; // Import the dark-unica theme
import { UserContext } from '../../store/UserContext';

// import { data } from './data.js';
import api from '../../utils/api';

const MarketChartWrapper = styled.div`
  width: 100%;
  padding: 0rem 1rem 1rem 2rem;
  background-color: #131010;
  color: white;
`;

let volumeColor = '';

let ohlc = [],
  volume = [],
  // set the allowed units for data grouping
  groupingUnits = {
    forced: true,
    enabled: true,
    units: [
      // [
      //   'millisecond', // unit name
      //   [1, 2, 5, 10, 20, 25, 50, 100, 200, 500], // allowed multiples
      // ],
      // ['second', [1, 2, 5, 10, 15, 30]],
      ['minute', [1]],
      ['hour', [1, 3, 6, 12]],
      ['day', [1]],
      ['week', [1]],
      ['month', [6]],
      ['year', null],
    ],
  };

const sortMarketData = (data) => {
  ohlc = [];
  volume = [];
  if (!data) return;
  for (let i = 0; i < data.length; i++) {
    volumeColor = data[i][1] < data[i][4] ? '#55e3b3' : '#fa6767';

    ohlc.push([
      data[i][0] * 1000, // the date
      data[i][1], // open
      data[i][2], // high
      data[i][3], // low
      data[i][4], // close
    ]);

    volume.push({
      x: data[i][0] * 1000, // the date
      y: data[i][5],
      color: volumeColor,
    });
  }
  return [ohlc, volume];
};

const scrolledList = {};

const options = ([ohlc, volume], stock, socket) => {
  darkUnica(Highcharts);
  HC_more(Highcharts);
  if (!ohlc || !volume) return;
  return {
    rangeSelector: {
      animation: false,
      enabled: true,
      dropdown: 'responsive',
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
          count: 6,
          text: '10m',
          preserveDataGrouping: true,
          dataGrouping: {
            forced: true,
            units: [['minute', [10]]],
          },
        },
        {
          type: 'hour',
          count: 12,
          text: '30m',
          preserveDataGrouping: true,
          dataGrouping: {
            forced: true,
            units: [['minute', [30]]],
          },
        },
        {
          type: 'day',
          count: 2,
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
      selected: 0,
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
      minRange: 1,
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%e %b %Y', // example: 1 Jan 2022
        week: '%e %b %Y', // example: 1 Jan 2022
        month: '%b %Y', // example: Jan 2022
        year: '%Y', // example: 2022
      },
      // dynamic loading of data based on the scrollbar position
      events: {
        setExtremes: async function (e) {
          // Check if the scrollbar has reached the end
          if (e.min === this.dataMin && !this.isDirty) {
            // Load new data

            // Check if the data has already been loaded
            if (scrolledList[e.min]) return;
            scrolledList[e.min] = true;

            const result = await api.getMarketChartData(stock, e.min);

            if (result.marketdata.length === 0) return;
            const sortedData = sortMarketData(result.marketdata);

            const newOhlc = sortedData[0];
            const newVolume = sortedData[1];

            // Add the new data to the existing chart
            ohlc.unshift(...newOhlc);
            volume.unshift(...newVolume);

            const candlestickSeries = this.series[0];
            const volumeSeries = this.series[1];
            this.setExtremes(e.min, e.max, true, true);
            candlestickSeries.update({
              data: ohlc,
            });
            volumeSeries.update({
              data: volume,
            });

            return;
          }
        },
      },
    },

    scrollbar: {
      enabled: true,
    },

    tooltip: {
      split: true,
      followTouchMove: true,
    },

    title: {
      text: null, // Set to null to remove the chart title
    },

    legend: {
      enabled: false, // Set to false to remove the legend items
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
        minRange: 1,
        name: stock,
        data: ohlc || [],
        color: '#fa6767', // Set the color for negative candles (default)
        upColor: '#55e3b3', // Set the color for positive candles
        lineColor: '#fa6767', // Set the color for the candlestick line
        upLineColor: '#55e3b3', // Set the color for the candlestick line
        dataGrouping: groupingUnits,
      },
      {
        type: 'column',
        name: 'Volume',
        data: volume || [],
        yAxis: 1,
        borderWidth: 0,
        dataGrouping: groupingUnits,
      },
    ],

    chart: {
      backgroundColor: '#131010', // Set the desired background color here
      animation: false,
      panning: true,
      events: {
        load: function (e) {
          const candlestickSeries = this.series[0];
          const volumeSeries = this.series[1];
          if (!socket) return;

          // setInterval(() => {
          //   let date = new Date();
          //   date.setSeconds(0);
          //   date.setMilliseconds(0);
          //   date = date.getTime();

          //   if (date > ohlc[ohlc.length - 1][0]) {
          //     const data = [
          //       date,
          //       ohlc[ohlc.length - 1][4],
          //       ohlc[ohlc.length - 1][4],
          //       ohlc[ohlc.length - 1][4],
          //       ohlc[ohlc.length - 1][4],
          //     ];

          //     const volumeData = {
          //       x: date,
          //       y: 0,
          //       color: '#fa6767',
          //     };

          //     try {
          //       candlestickSeries.addPoint(data);
          //       volumeSeries.addPoint(volumeData);
          //     } catch (err) {
          //       // console.log(err);
          //     }
          //   }
          // }, 1000 * 10);
        },
      },
    },
  };
};

const MarketChart = React.memo((props) => {
  const { socket } = React.useContext(UserContext);
  const [chartData, setChartData] = React.useState([]);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    api.getMarketChartData(props.stock).then((res) => {
      const sortedMarketData = sortMarketData(res.marketdata);
      setChartData(sortedMarketData);
    });

    if (!socket) return;

    socket.on(`marketChart-${props.stock}`, (d) => {
      const date = d.chartData.unix_timestamp * 1000;
      const data = [
        date,
        d.chartData.open,
        d.chartData.high,
        d.chartData.low,
        d.chartData.close,
      ];
      const updatedVolume = d.chartData.volume;

      const volumeColor =
        d.chartData.close > d.chartData.open ? '#55e3b3' : '#fa6767';

      const volumeData = {
        x: date,
        y: updatedVolume,
        color: volumeColor,
      };

      if (ohlc[ohlc.length - 1][0] === date) {
        ohlc[ohlc.length - 1] = data;
        volume[volume.length - 1] = volumeData;

        chartRef.current.chart.series[0].update({
          data: ohlc,
        });
        chartRef.current.chart.series[1].update({
          data: volume,
        });
      } else {
        chartRef.current.chart.series[0].addPoint(data);
        chartRef.current.chart.series[1].addPoint(volumeData);
      }
    });

    return () => {
      if (socket) {
        socket.off(`marketChart-${props.stock}`);
      }
    };
  }, [props.stock, socket]);

  return (
    <MarketChartWrapper>
      <HighchartsReact
        constructorType={'stockChart'}
        ref={chartRef}
        isPureConfig={false}
        highcharts={Highcharts}
        options={options(chartData, props.stock, socket)}
        theme={darkUnica}
      />
    </MarketChartWrapper>
  );
});

export default MarketChart;
