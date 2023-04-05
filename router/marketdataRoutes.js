import { Router } from 'express';
import { orderBook } from '../controllers/marketdataControllers.js';
const router = Router();

router.get('/orderBook', orderBook);

export default router;
