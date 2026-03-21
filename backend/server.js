import express from 'express';
import dotenv from 'dotenv';
const app = express();

import authRoutes from './src/routes/auth.route.js';
import messageRoutes from './src/routes/message.route.js';

dotenv.config();

// this is a test route to check if the backend is working
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// use the auth routes
app.use('/api/auth', authRoutes);
// use the message routes
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});