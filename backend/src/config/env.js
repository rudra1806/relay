import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Centralized configuration object
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGO_URI,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  
  // Email configuration (Resend)
  resendApiKey: process.env.RESEND_API_KEY,
  senderEmail: process.env.SENDER_EMAIL,
  senderName: process.env.SENDER_NAME,
  
  // Client configuration
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Cloudinary configuration
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  
  // Arcjet configuration
  arcjetKey: process.env.ARCJET_KEY,
  arcjetEnv: process.env.ARCJET_ENV || 'development',
  
  // Helper methods
  isProduction: () => config.nodeEnv === 'production',
  isDevelopment: () => config.nodeEnv === 'development'
};

// Validate required environment variables on startup
const validateConfig = () => {
  const requiredVars = [
    { key: 'mongoUri', name: 'MONGO_URI' },
    { key: 'jwtSecret', name: 'JWT_SECRET' },
    { key: 'resendApiKey', name: 'RESEND_API_KEY' },
    { key: 'senderEmail', name: 'SENDER_EMAIL' },
    { key: 'senderName', name: 'SENDER_NAME' },
    { key: 'cloudinaryCloudName', name: 'CLOUDINARY_CLOUD_NAME' },
    { key: 'cloudinaryApiKey', name: 'CLOUDINARY_API_KEY' },
    { key: 'cloudinaryApiSecret', name: 'CLOUDINARY_API_SECRET' },
    { key: 'arcjetKey', name: 'ARCJET_KEY' }
  ];

  const missingVars = requiredVars.filter(({ key }) => !config[key]);

  if (missingVars.length > 0) {
    const missingNames = missingVars.map(({ name }) => name).join(', ');
    console.error(`❌ Missing required environment variables: ${missingNames}`);
    throw new Error(`Missing required environment variables: ${missingNames}`);
  }

  console.log('✅ Environment configuration loaded successfully');
};

// Run validation
validateConfig();
