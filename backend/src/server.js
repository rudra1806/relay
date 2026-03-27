import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/env.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import contactRoutes from './routes/contact.route.js';
import connectDB from './lib/db.js';
import { initSocket } from './lib/socket.js';
import { startCleanupService } from './services/cleanupService.js';

const app = express();
const __dirname = path.resolve();

app.use(cors({
  origin: config.isDevelopment()
    ? 'http://localhost:5173'
    : config.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' })); // Middleware to parse JSON bodies (increased for image uploads)
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies

// this is a test route to check if the backend is working
app.get('/api', (_req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// use the auth routes
app.use('/api/auth', authRoutes);
// use the message routes
app.use('/api/message', messageRoutes);
// use the contact routes
app.use('/api/contacts', contactRoutes);

// Initialize Socket.IO with the Express app
const { httpServer } = initSocket(app);

//make ready for production
if (config.isProduction()) {

  //here we are serving the frontend from the backend in production, so we need to tell express to serve the static files from the frontend/dist folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // this is a catch-all route that will send the index.html file for any request that doesn't match the above routes, this is necessary for client-side routing to work in production
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

const startServer = async () => {
  await connectDB();
  
  // Start cleanup service for unverified users (production only)
  startCleanupService();
  
  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`Server is running on port ${config.port}`);
  });
};

startServer();