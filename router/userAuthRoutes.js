import { Router } from 'express';
import jwtVerification from '../middleware/jwtVerification.js';

import {
  signup,
  signin,
  userProfile,
} from '../controllers/userAuthControllers.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', jwtVerification, userProfile);

export default router;
