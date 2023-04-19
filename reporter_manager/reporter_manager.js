import {
  getPreviousClosePrice,
  createNewMarketDataRow,
  updateMarketDataEveryMinute,
  moveRowToTodayHistory,
} from '../models/marketdataModels.js';

import cron from 'node-cron';

const stocks = ['DAN', 'APPL'];

const createEmptyRowWithOHLC = async (symbol) => {
  // Get the close price of the previous minute
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  now.setMinutes(now.getMinutes() - 1);
  const unixTimePreviousMin = Math.floor(now.getTime() / 1000);

  let previousClosePrice = await getPreviousClosePrice(
    symbol,
    unixTimePreviousMin
  );

  console.log(previousClosePrice);

  await moveRowToTodayHistory(symbol, unixTimePreviousMin);

  if (!previousClosePrice) {
    previousClosePrice = 0;
  }

  now.setMinutes(now.getMinutes() + 1);
  const unixTime = Math.floor(now.getTime() / 1000);

  await updateMarketDataEveryMinute(previousClosePrice, symbol, unixTime);

  // Set the timestamp to the next minute
  now.setMinutes(now.getMinutes() + 1);
  const unixTimeNextMin = Math.floor(now.getTime() / 1000);

  // Create a new row with the current timestamp
  await createNewMarketDataRow(symbol, unixTimeNextMin);
};

const createEmptyRowWithOHLCForAllStocks = async () => {
  const promises = [];
  for (const stock of stocks) {
    promises.push(createEmptyRowWithOHLC(stock));
  }

  await Promise.all(promises);
};

// Call the main function
cron.schedule('*/1 * * * *', createEmptyRowWithOHLCForAllStocks);
// await createEmptyRowWithOHLC();
