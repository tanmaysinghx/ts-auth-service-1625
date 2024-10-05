import app from './app';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db';
import logger from './utils/logger';
import fs from 'fs';
import https from 'https';

dotenv.config();

const PORT = process.env.PORT || 1625;

const pfxPath = process.env.PFX_PATH || 'src/certificates/mykeystore.p12';
const passphrase = process.env.PFX_PASSPHRASE;

if (!pfxPath || !passphrase) {
  throw new Error("PFX_PATH and PFX_PASSPHRASE environment variables must be defined");
}

const options = {
  pfx: fs.readFileSync(pfxPath),
  passphrase: passphrase
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443 with p12 certificate');
});

app.listen(PORT, async () => {
  logger.info(`Server is running on port: ${PORT}`);
  try {
    await connectToDatabase();
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
