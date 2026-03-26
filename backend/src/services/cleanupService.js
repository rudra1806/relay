import User from '../models/user.model.js';
import { config } from '../config/env.js';

/**
 * Cleanup Service
 * 
 * Automatically removes unverified users after a specified time period.
 * This prevents database bloat from abandoned signups.
 */

// Configuration
const CLEANUP_INTERVAL_HOURS = 6; // Run cleanup every 6 hours
const UNVERIFIED_USER_EXPIRY_HOURS = 24; // Delete unverified users after 24 hours

/**
 * Delete unverified users older than specified hours
 */
export async function cleanupUnverifiedUsers(hoursOld = UNVERIFIED_USER_EXPIRY_HOURS) {
  try {
    const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleanup: Deleted ${result.deletedCount} unverified users older than ${hoursOld} hours`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return 0;
  }
}

/**
 * Start automatic cleanup service
 * Runs periodically to clean up unverified users
 */
export function startCleanupService() {
  // Only run in production to avoid interfering with development
  if (!config.isProduction()) {
    console.log('ℹ️  Cleanup service disabled in development mode');
    return null;
  }

  console.log(`🧹 Starting cleanup service (runs every ${CLEANUP_INTERVAL_HOURS} hours)`);
  console.log(`   Will delete unverified users older than ${UNVERIFIED_USER_EXPIRY_HOURS} hours`);

  // Run cleanup immediately on startup
  cleanupUnverifiedUsers().catch(err => {
    console.error('Failed to run initial cleanup:', err);
  });

  // Schedule periodic cleanup
  const intervalMs = CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000;
  const intervalId = setInterval(() => {
    cleanupUnverifiedUsers().catch(err => {
      console.error('Failed to run scheduled cleanup:', err);
    });
  }, intervalMs);

  return intervalId;
}

/**
 * Stop cleanup service
 */
export function stopCleanupService(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('🛑 Cleanup service stopped');
  }
}

/**
 * Get statistics about unverified users
 */
export async function getUnverifiedUserStats() {
  try {
    const now = Date.now();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [total, last24h, lastWeek] = await Promise.all([
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ isVerified: false, createdAt: { $gte: oneDayAgo } }),
      User.countDocuments({ isVerified: false, createdAt: { $gte: oneWeekAgo } })
    ]);

    return {
      total,
      last24h,
      lastWeek,
      eligibleForCleanup: total - last24h
    };
  } catch (error) {
    console.error('❌ Error getting unverified user stats:', error);
    return null;
  }
}
