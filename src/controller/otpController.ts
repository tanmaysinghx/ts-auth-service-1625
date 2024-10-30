import { Request, Response } from 'express';
import { generateAndSendOTP, verifyOTP } from '../services/otpService';
import { errorResponse, successResponse } from '../utils/responseUtils';

interface CustomRequest extends Request {
  transactionId?: string;
}

/* Controller to generate OTP */
export const requestOTPController = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  const { email } = req.body;
  const result = await generateAndSendOTP(email);
  if (result.success) {
    return res.status(200).json(successResponse(result.message, "OTP generated successfully for " + email, transactionId));
  } else {
    return res.status(400).json(errorResponse(result.message, "OTP generation failed", transactionId));
  }
};

/* Controller to verify OTP */
export const verifyOTPController = async (req: CustomRequest, res: Response) => {
  const transactionId = req.transactionId;
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  const { valid, message } = await verifyOTP(email, otp);
  if (!valid) {
    return res.status(400).json({ error: message });
  }
  return res.status(200).json(successResponse(null, "OTP verified successfully for " + email, transactionId));
};
