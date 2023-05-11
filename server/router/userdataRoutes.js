import { Router } from 'express';
import {
  wallet,
  position,
  execution,
  allPosition,
} from '../controllers/userdataControllers.js';

const router = Router();

router.get('/wallet', wallet);
router.get('/position', position);
router.get('/execution', execution);
router.get('/allPosition', allPosition);

export default router;
