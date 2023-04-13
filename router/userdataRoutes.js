import { Router } from 'express';
import { wallet } from '../controllers/userdataControllers.js';
import { position } from '../controllers/userdataControllers.js';
const router = Router();

router.post('/wallet', wallet);
router.post('/position', position);

export default router;
