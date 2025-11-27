import cron from "node-cron";
import { cleanupSessionsService } from "../services/sessionService";

export const initSessionCleanup = () => {
  console.log("🔄 Initializing Session Cleanup Job...");

  // 1. Run immediately on Server Startup
  runCleanup();

  // 2. Schedule to run every 10 minutes
  // Cron Syntax: */10 * * * * (Every 10th minute)
  cron.schedule("*/10 * * * *", () => {
    console.log("⏰ Running scheduled session cleanup...");
    runCleanup();
  });
};

export const runCleanup = async () => {
  try {
    const deletedCount = await cleanupSessionsService();
    if (deletedCount > 0) {
      console.log(`✅ Cleanup Success: Removed ${deletedCount} old sessions.`);
    } else {
      console.log(`ℹ️ Cleanup: No sessions to remove.`);
    }
  } catch (error) {
    console.error("❌ Session Cleanup Failed:", error);
  }
};