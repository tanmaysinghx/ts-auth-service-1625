import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export default prisma;

/* Function to verify DB connection is successful or not */
export const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};