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
 * Migration Script: Mark Existing Users as Verified
 * 
 * This script marks all existing users as verified to prevent
 * disruption when deploying the email verification feature.
 * 
 * Usage: node backend/scripts/migrateExistingUsers.js
 */

async function migrateExistingUsers() {
  try {
    // Check if MONGO_URI is loaded
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI not found in environment variables');
      console.error('   Make sure backend/.env file exists and contains MONGO_URI');
      console.error('   Current directory:', process.cwd());
      console.error('   Looking for .env at:', path.join(__dirname, '../.env'));
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    console.log('   Using MONGO_URI from:', path.join(__dirname, '../.env'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find all users who don't have isVerified field or it's false
    const usersToUpdate = await User.find({
      $or: [
        { isVerified: { $exists: false } },
        { isVerified: false }
      ]
    });

    console.log(`📊 Found ${usersToUpdate.length} users to migrate`);

    if (usersToUpdate.length === 0) {
      console.log('✨ No users need migration. All done!');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  This will mark all existing users as verified.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update all users
    const result = await User.updateMany(
      {
        $or: [
          { isVerified: { $exists: false } },
          { isVerified: false }
        ]
      },
      {
        $set: { isVerified: true },
        $unset: { otp: '', otpExpiry: '' }
      }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   - Modified: ${result.modifiedCount} users`);
    console.log(`   - Matched: ${result.matchedCount} users`);

    // Verify the migration
    const unverifiedCount = await User.countDocuments({ isVerified: false });
    console.log(`\n📊 Verification check:`);
    console.log(`   - Unverified users remaining: ${unverifiedCount}`);

    if (unverifiedCount === 0) {
      console.log('✨ All users are now verified!');
    } else {
      console.log('⚠️  Some users are still unverified. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateExistingUsers();
