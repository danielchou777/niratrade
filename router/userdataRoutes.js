import { Router } from 'express';
import {
  wallet,
  position,
  execution,
} from '../controllers/userdataControllers.js';
const router = Router();

router.post('/wallet', wallet);
router.post('/position', position);
router.post('/execution', execution);

export default router;
