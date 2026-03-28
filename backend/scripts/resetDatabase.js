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

/**
 * Reset Database Script
 * 
 * ⚠️  WARNING: This will DELETE ALL DATA from your database!
 * 
 * This script completely wipes the database and is useful when:
 * - Schema has changed significantly
 * - You want to start fresh in development
 * - Old data is causing compatibility issues
 * 
 * Usage: node backend/scripts/resetDatabase.js
 */

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from your database!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    console.log(`\n📊 Found ${collections.length} collections to drop`);

    // Drop each collection
    for (const collection of collections) {
      console.log(`   Dropping collection: ${collection.collectionName}`);
      await collection.drop();
    }

    console.log('\n✅ Database reset complete!');
    console.log('   All collections have been dropped.');
    console.log('   Collections will be recreated automatically when you start the server.\n');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the reset
resetDatabase();
