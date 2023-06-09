import { Router } from 'express';
import {
  orderBook,
  executions,
  stocks,
  marketChart,
  getAllStockPrices,
} from '../controllers/marketdataControllers.js';

const router = Router();

router.get('/orderBook', orderBook);
router.get('/executions', executions);
router.get('/stocks', stocks);
router.get('/marketChart', marketChart);
router.get('/stockPrices', getAllStockPrices);

export default router;
