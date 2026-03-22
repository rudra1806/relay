import mongoose from 'mongoose';
import { config } from '../config/env.js';

const connectDB = async () => {
    try {
        // Connect to MongoDB using the connection string from config and log the host on successful connection
        const conn = await mongoose.connect(config.mongoUri);
        console.log('✅ MongoDB connected successfully to', conn.connection.host);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;