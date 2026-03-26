import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Cleanup Script: Remove Unverified Users
 * 
 * This script removes users who haven't verified their email
 * within a specified time period (default: 24 hours).
 * 
 * Usage: node backend/scripts/cleanupUnverifiedUsers.js [hours]
 * Example: node backend/scripts/cleanupUnverifiedUsers.js 48
 */

const DEFAULT_HOURS = 24; // Default: 24 hours

async function cleanupUnverifiedUsers(hoursOld = DEFAULT_HOURS) {
  try {
    // Check if MONGO_URI is loaded
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI not found in environment variables');
      console.error('   Make sure backend/.env file exists and contains MONGO_URI');
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    
    console.log(`\n📊 Searching for unverified users older than ${hoursOld} hours...`);
    console.log(`   Cutoff date: ${cutoffDate.toISOString()}`);

    // Find unverified users created before cutoff date
    const unverifiedUsers = await User.find({
      isVerified: false,
      createdAt: { $lt: cutoffDate }
    }).select('email name createdAt');

    console.log(`\n📊 Found ${unverifiedUsers.length} unverified users to clean up`);

    if (unverifiedUsers.length === 0) {
      console.log('✨ No unverified users to clean up. All done!');
      process.exit(0);
    }

    // Display users to be deleted
    console.log('\n📋 Users to be deleted:');
    unverifiedUsers.forEach((user, index) => {
      const age = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${age} hours old`);
    });

    // Ask for confirmation
    console.log('\n⚠️  This will permanently delete these users and their data.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete unverified users
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate }
    });

    console.log(`✅ Cleanup complete!`);
    console.log(`   - Deleted: ${result.deletedCount} users`);

    // Show remaining unverified users (recent ones)
    const remainingUnverified = await User.countDocuments({ isVerified: false });
    console.log(`\n📊 Remaining unverified users: ${remainingUnverified}`);
    
    if (remainingUnverified > 0) {
      console.log(`   (These are less than ${hoursOld} hours old and will be cleaned up later)`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Get hours from command line argument or use default
const hoursArg = process.argv[2];
const hours = hoursArg ? parseInt(hoursArg, 10) : DEFAULT_HOURS;

if (isNaN(hours) || hours <= 0) {
  console.error('❌ Invalid hours argument. Please provide a positive number.');
  console.log('Usage: node backend/scripts/cleanupUnverifiedUsers.js [hours]');
  console.log('Example: node backend/scripts/cleanupUnverifiedUsers.js 48');
  process.exit(1);
}

// Run cleanup
cleanupUnverifiedUsers(hours);
