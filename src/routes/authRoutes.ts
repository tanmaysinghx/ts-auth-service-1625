import { Router } from 'express';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware';
import { changePasswordController, handleRefreshToken, login, register, verifyTokenController } from '../controller/authController';
import { validateRegisterData } from '../utils/validator';

const router = Router();

router.post('/register', validateRegisterData, register);
router.post('/login', loginRateLimiter, login);
router.post('/change-password', changePasswordController);
router.post('/refresh-token', handleRefreshToken);
router.post('/verify/verify-token', verifyTokenController);

export default router;
