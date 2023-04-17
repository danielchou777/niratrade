import { Router } from 'express';
import {
  orderBook,
  executions,
  stocks,
} from '../controllers/marketdataControllers.js';
const router = Router();

router.get('/orderBook', orderBook);
router.get('/executions', executions);
router.get('/stocks', stocks);

export default router;
