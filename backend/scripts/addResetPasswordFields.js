import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

async function addResetPasswordFields() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Check if any users are missing the new fields
    const usersWithoutFields = await User.countDocuments({
      $or: [
        { resetPasswordOTP: { $exists: false } },
        { resetPasswordOTPExpiry: { $exists: false } },
        { lastResetOTPSentAt: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${usersWithoutFields} users without reset password fields`);

    if (usersWithoutFields === 0) {
      console.log('✅ All users already have the required fields');
      await mongoose.connection.close();
      return;
    }

    // Add the fields to users who don't have them
    const result = await User.updateMany(
      {
        $or: [
          { resetPasswordOTP: { $exists: false } },
          { resetPasswordOTPExpiry: { $exists: false } },
          { lastResetOTPSentAt: { $exists: false } }
        ]
      },
      {
        $set: {
          resetPasswordOTP: null,
          resetPasswordOTPExpiry: null,
          lastResetOTPSentAt: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with reset password fields`);
    console.log('✅ Migration completed successfully');

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addResetPasswordFields();
