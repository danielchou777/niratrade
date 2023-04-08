import { Router } from 'express';
import { orderBook } from '../controllers/marketdataControllers.js';
import { executions } from '../controllers/marketdataControllers.js';
const router = Router();

router.get('/orderBook', orderBook);
router.get('/executions', executions);

export default router;
