import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

const app = express();
const __dirname = path.resolve();

// this is a test route to check if the backend is working
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// use the auth routes
app.use('/api/auth', authRoutes);
// use the message routes
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 3000;


//make ready for production
if (process.env.NODE_ENV === 'production') {

  //here we are serving the frontend from the backend in production, so we need to tell express to serve the static files from the frontend/dist folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // this is a catch-all route that will send the index.html file for any request that doesn't match the above routes, this is necessary for client-side routing to work in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});