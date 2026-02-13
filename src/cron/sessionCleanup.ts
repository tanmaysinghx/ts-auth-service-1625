import cron from "node-cron";
import { cleanupSessionsService } from "../services/sessionService";
import logger from "../utils/logger";

export const initSessionCleanup = () => {
  logger.info("Initializing Session Cleanup Job...");

  // 1. Run immediately on Server Startup
  runCleanup();

  // 2. Schedule to run every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    logger.info("Running scheduled session cleanup...");
    runCleanup();
  });
};

export const runCleanup = async () => {
  try {
    const deletedCount = await cleanupSessionsService();
    if (deletedCount > 0) {
      logger.info(`Cleanup Success: Removed ${deletedCount} old sessions.`);
    } else {
      logger.info("Cleanup: No sessions to remove.");
    }
  } catch (error) {
    logger.error(`Session Cleanup Failed: ${error}`);
  }
};