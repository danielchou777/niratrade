import { Router } from 'express';
import { wallet } from '../controllers/userdataControllers.js';
const router = Router();

router.get('/wallet', wallet);

export default router;
