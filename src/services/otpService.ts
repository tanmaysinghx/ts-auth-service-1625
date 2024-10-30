import { PrismaClient } from '@prisma/client';
import { generateOTP } from '../utils/otpUtils';
import { sendOTPEmail } from '../utils/emailTransport';
import cron from 'node-cron';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const OTP_EXPIRATION_MINUTES = 10;
const OTP_RETRY_INTERVAL_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 3;
const MAX_ATTEMPTS = 10;
const COUNT_ATTEMPTS = 600;
const OTP_RETENTION_DURATION_MINUTES = 10;

/* Function to generate OTP */
export const generateAndSendOTP = async (email: string) => {
  try {
    await cleanupOldOTPs();
    const recentOTP = await prisma.otp.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - OTP_RETRY_INTERVAL_SECONDS * 1000),
        },
      },
    });
    if (recentOTP) {
      return { success: false, message: 'OTP was generated recently. Please wait 60 seconds before requesting a new one.' };
    }
    const attemptsCount = await prisma.otp.count({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - COUNT_ATTEMPTS * 1000),
        },
      },
    });
    if (attemptsCount >= MAX_ATTEMPTS) {
      return { success: false, message: 'Maximum OTP requests reached. Please try again later.' };
    }
    const otp = generateOTP();
    const expiry = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
    await prisma.otp.create({
      data: {
        email,
        otp,
        expiry,
        attempts: attemptsCount + 1,
      },
    });
    // await sendOTPEmail(email, otp);
    return { success: true, message: 'OTP generated successfully.' };
  } catch (error) {
    console.error("Error generating OTP:", error);
    return { success: false, message: 'An error occurred while generating OTP. Please try again.' };
  }
};

/* Function to verify OTP */
export const verifyOTP = async (email: string, enteredOTP: string): Promise<{ valid: boolean; message: string }> => {
  const storedOTPData = await prisma.otp.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
  if (!storedOTPData) return { valid: false, message: 'No OTP found for this email.' };
  const { otp, expiry, attempts } = storedOTPData;
  if (new Date() > expiry) {
    await prisma.otp.delete({ where: { id: storedOTPData.id } });
    return { valid: false, message: 'OTP expired. Please request a new OTP.' };
  }
  if (attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otp.delete({ where: { id: storedOTPData.id } });
    return { valid: false, message: 'Maximum OTP attempts exceeded. Please request a new OTP.' };
  }
  const isValid = otp === enteredOTP;

  if (isValid) {
    await prisma.otp.delete({ where: { id: storedOTPData.id } });
    return { valid: true, message: 'OTP verified successfully.' };
  } else {
    await prisma.otp.update({
      where: { id: storedOTPData.id },
      data: { attempts: attempts + 1 },
    });
    return { valid: false, message: `Invalid OTP. You have ${MAX_OTP_ATTEMPTS - attempts - 1} attempts left.` };
  }
};

/* Function to clean up old OTPs */
export const cleanupOldOTPs = async () => {
  try {
    const retentionDate = new Date(Date.now() - OTP_RETENTION_DURATION_MINUTES * 60 * 1000);
    await prisma.otp.deleteMany({
      where: {
        createdAt: {
          lt: retentionDate,
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up old OTPs:', error);
  }
};

/* Schedule the cleanup to run every hour */
cron.schedule('0 * * * *', async () => {
  logger.info('Running OTP cleanup job...');
  await cleanupOldOTPs();
});

