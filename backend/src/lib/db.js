import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env so that we can use them in our code
dotenv.config();

const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables and log the host on successful connection
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully to', conn.connection.host);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;