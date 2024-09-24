import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';

export const handleBrowserToken = async (userId: string, browserToken: string | undefined) => {
  if (!browserToken) {
    return false;
  }

  // Query using userId and browserToken
  const trustedBrowser = await prisma.browserList.findUnique({
    where: {
      // Use the correct composite unique field in your Prisma model
      userId_browserToken: {
        userId,
        browserToken
      }
    }
  });
  
  return !!trustedBrowser;
};

export const setBrowserTokenCookie = (res: Response) => {
  const newBrowserToken = uuidv4();
  res.cookie('browser_token', newBrowserToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
  return newBrowserToken;
};

