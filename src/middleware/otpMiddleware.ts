import { Request, Response, NextFunction } from 'express';
import { verifyOTP } from 'services/otpService';

export const otpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;
  if (!otp || !verifyOTP(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  next();
};
