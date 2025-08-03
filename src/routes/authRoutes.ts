import { Router } from 'express';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware';
import { changePasswordController, handleRefreshToken, login, register, verifyTokenController } from '../controller/authController';
import { validateLoginData, validateRegisterData } from '../utils/validator';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */

router.post('/register', validateRegisterData, register);
router.post('/login', loginRateLimiter, validateLoginData, login);
router.post('/change-password', changePasswordController);
router.post('/refresh-token', handleRefreshToken);
router.post('/verify/verify-token', verifyTokenController);

export default router;
