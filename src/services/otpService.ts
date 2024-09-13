import { PrismaClient } from '@prisma/client';
import { generateOTP } from '../utils/otpUtils';
import { sendOTPEmail } from '../utils/emailTransport';

const prisma = new PrismaClient();

export const generateAndSendOTP = async (email: string) => {
  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otp.create({
    data: {
      email,
      otp,
      expiry,
    },
  });
  await sendOTPEmail(email, otp);
};

export const verifyOTP = async (email: string, enteredOTP: string): Promise<boolean> => {
  const storedOTPData = await prisma.otp.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
  if (!storedOTPData) return false;
  const { otp, expiry } = storedOTPData;
  if (new Date() > expiry) {
    await prisma.otp.delete({ where: { id: storedOTPData.id } });
    return false;
  }
  const isValid = otp === enteredOTP;
  if (isValid) {
    await prisma.otp.delete({ where: { id: storedOTPData.id } });
  }
  return isValid;
};
