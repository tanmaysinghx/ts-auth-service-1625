import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseUtils';
import { verifyOTP } from '../services/otpService';

export const otpVerificationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json(errorResponse('Email and OTP are required', 'Invalid Request', "dd"));
        }
        const isOtpValid = await verifyOTP(email, otp);
        if (!isOtpValid) {
            return res.status(401).json(errorResponse('Invalid OTP. Please try again.', 'OTP Verification Failed', "dd"));
        }
        next();
    } catch (err) {
        return res.status(500).json(errorResponse('OTP verification failed', 'Error', "dd"));
    }
};
