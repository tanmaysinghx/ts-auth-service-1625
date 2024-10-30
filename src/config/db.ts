import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export default prisma;

/* Function to verfiy DB connection is successfull or not */
export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.info('Database connection error:', error);
    process.exit(1);
  }
};