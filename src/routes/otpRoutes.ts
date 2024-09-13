
import { verifyOTPController } from '../controller/otpController';
import { requestOTP } from '../controller/otpController';
import { Router } from 'express';

const router = Router();

router.post('/request-otp', requestOTP);       // To request an OTP
router.post('/verify-otp', verifyOTPController);  // To verify the OTP

export default router;
