import { Request, Response } from 'express';
import { generateAndSendOTP, verifyOTP } from '../services/otpService';

export const requestOTP = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    await generateAndSendOTP(email);
    return res.status(200).json({ message: 'OTP sent successfully' });
};

export const verifyOTPController = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP' });

    return res.status(200).json({ message: 'OTP verified successfully' });
};
