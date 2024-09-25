
import { verifyOTPController } from '../controller/otpController';
import { requestOTP } from '../controller/otpController';
import { Router } from 'express';

const router = Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTPController);

export default router;
