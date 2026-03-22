import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateToken = (userId, res) => {
  try {
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required to generate token');
    }

    // Generate JWT token
    const token = jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: '7d'
    });

    // Set cookie with appropriate security settings
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents XSS attacks by making the cookie inaccessible to JavaScript on the client side
      secure: config.isProduction(), // HTTPS only in production
      sameSite: 'strict', // (CSRF protection) by only sending the cookie in a first-party context 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw error;
  }
};
