import { Router } from 'express';
import { order } from '../controllers/matchControllers.js';

const router = Router();

router.post('/order', order);

export default router;
