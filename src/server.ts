import app from './app';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db';
import logger from './utils/logger';

dotenv.config();

const PORT = process?.env?.PORT ?? 1625;

app.listen(PORT, async () => {
  logger.info(`Server is running on port: ${PORT}`);
  try {
    //await connectToDatabase();
    logger.info('Database connection successful');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Database connection failed: ${error.message}`);
    } else {
      logger.error(`Database connection failed: ${JSON.stringify(error)}`);
    }
  }
});

if (process.env.ACCESS_TOKEN_SECRET) {
  logger.info('ACCESS_TOKEN_SECRET: Loaded');
} else {
  logger.warn('ACCESS_TOKEN_SECRET: Not Loaded');
}

if (process.env.REFRESH_TOKEN_SECRET) {
  logger.info('REFRESH_TOKEN_SECRET: Loaded');
} else {
  logger.warn('REFRESH_TOKEN_SECRET: Not Loaded');
}
