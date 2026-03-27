import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  console.error('Make sure your .env file exists in the backend directory');
  process.exit(1);
}

// Define schemas inline for migration
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilePic: String,
  isVerified: Boolean,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  image: String,
  isRead: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

async function migrateToContactSystem() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔄 Starting migration to contact system...\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    let totalContactsAdded = 0;

    // For each user, find who they've messaged with and add them as contacts
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name} (${user.email})`);

      // Find all users this person has messaged with
      const sentMessages = await Message.find({ senderId: user._id }).distinct('receiverId');
      const receivedMessages = await Message.find({ receiverId: user._id }).distinct('senderId');

      // Combine and deduplicate
      const chatPartnerIds = [...new Set([...sentMessages, ...receivedMessages])];

      if (chatPartnerIds.length === 0) {
        console.log('   ℹ️  No message history, skipping');
        continue;
      }

      // Add these users as contacts (if not already)
      const newContacts = chatPartnerIds.filter(
        (id) => !user.contacts.some((c) => c.toString() === id.toString())
      );

      if (newContacts.length > 0) {
        await User.findByIdAndUpdate(user._id, {
          $addToSet: { contacts: { $each: newContacts } },
        });
        console.log(`   ✅ Added ${newContacts.length} contacts`);
        totalContactsAdded += newContacts.length;
      } else {
        console.log('   ℹ️  All chat partners already in contacts');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Total contacts added: ${totalContactsAdded}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

migrateToContactSystem();
