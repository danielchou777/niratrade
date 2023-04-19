import { updateMarketData } from '../models/marketdataModels.js';
import { roundToMinute } from '../utils/util.js';
const date = roundToMinute(new Date());
console.log(date);
updateMarketData('DAN', 100, date, 10);
