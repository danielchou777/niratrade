import { Router } from 'express';
import { wallet } from '../controllers/userdataControllers.js';
const router = Router();

router.post('/wallet', wallet);

export default router;
