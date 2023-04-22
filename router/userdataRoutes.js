import { Router } from 'express';
import {
  wallet,
  position,
  execution,
} from '../controllers/userdataControllers.js';
const router = Router();

router.get('/wallet', wallet);
router.get('/position', position);
router.get('/execution', execution);

export default router;
