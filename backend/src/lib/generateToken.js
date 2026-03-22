import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  try {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables');
      throw new Error('JWT configuration error');
    }

    // Validate userId
    if (!userId) {
      throw new Error('User ID is required to generate token');
    }

    // Generate JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Set cookie with appropriate security settings
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents XSS attacks by making the cookie inaccessible to JavaScript on the client side
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // (CSRF protection) by only sending the cookie in a first-party context 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw error;
  }
};
