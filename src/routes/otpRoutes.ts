
import { verifyOTPController } from '../controller/otpController';
import { requestOTPController } from '../controller/otpController';
import { Router } from 'express';

const router = Router();

router.post('/request-otp', requestOTPController);
router.post('/verify-otp', verifyOTPController);

export default router;
