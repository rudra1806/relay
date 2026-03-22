import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/generateToken.js';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';


//===============================================================
// Auth Controller
//===============================================================
// This controller handles user authentication, including signup, login, logout, and checking authentication status. It includes robust validation for user input and secure password handling. The controller also generates JWT tokens for authenticated sessions and sets them as HTTP-only cookies for security.
//===============================================================



//===============================================================
// Signup Controller
//===============================================================
// This function handles user registration. It validates the input data, checks for existing users, hashes the password securely, creates a new user in the database, generates a JWT token, and returns the user data (excluding the password) in the response. It includes enhanced validation for production environments to ensure stronger security and better user experience.
//===============================================================
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';// Flag to determine if we are in production environment for stricter validations

  try {
    // Validate all fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Trim and validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    
    // Production-only validations
    if (isProduction) {
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }
      if (trimmedName.length > 50) {
        return res.status(400).json({ message: 'Name must be less than 50 characters' });
      }
      if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
        return res.status(400).json({ message: 'Name can only contain letters, spaces, hyphens, and apostrophes' });
      }
    }

    // Validate and normalize email
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    
    if (isProduction && trimmedEmail.length > 100) {
      return res.status(400).json({ message: 'Email must be less than 100 characters' });
    }

    // Basic password validation (always enforced)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Production-only password strength validations
    if (isProduction) {
      if (password.length > 128) {
        return res.status(400).json({ message: 'Password must be less than 128 characters' });
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one number' });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least one special character' });
      }

      // Check for common weak passwords
      const commonPasswords = ['password', '123456', 'password123', 'qwerty', 'abc123'];
      if (commonPasswords.includes(password.toLowerCase())) {
        return res.status(400).json({ message: 'Password is too common. Please choose a stronger password' });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password - use stronger hashing in production
    const saltRounds = isProduction ? 12 : 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with validated and sanitized data
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword
    });

    // Generate token
    generateToken(user._id, res);

    // Return user data without password
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

    // Sending welcome email asynchronously (not blocking the response)
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    sendWelcomeEmail(user.name, user.email, clientURL).catch(err => {
      console.error('Failed to send welcome email:', err);
      // Don't throw error - email failure shouldn't affect signup success
    });
    

  } catch (error) {
    console.error('Error in signup:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key errors (e.g. email already exists, though we check for this explicitly as well to provide a nicer error message before hitting the database error handling layer - this is just a safeguard)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};



//===============================================================
// Login Controller
//===============================================================
// This function handles user login. It validates the input data, checks for the existence of the user, compares the provided password with the stored hashed password, generates a JWT token if authentication is successful, and returns the user data (excluding the password) in the response. It includes robust error handling to provide clear feedback on authentication failures, input sanitization, and rate limiting considerations.
//===============================================================
export const login = async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    // Validate all fields are present
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format and normalize
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password is not empty
    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ message: 'Password cannot be empty' });
    }

    // Production-only validations
    if (isProduction) {
      if (trimmedEmail.length > 100) {
        return res.status(400).json({ message: 'Email must be less than 100 characters' });
      }
      if (password.length > 128) {
        return res.status(400).json({ message: 'Password must be less than 128 characters' });
      }
    }

    // Find user by email
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      // Use generic message to prevent email enumeration attacks
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Use generic message to prevent timing attacks
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and set cookie
    generateToken(user._id, res);

    // Return user data without password
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Error in login:', error);
    
    // Handle specific database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(503).json({ message: 'Database service temporarily unavailable' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};



//===============================================================
// Logout Controller
//===============================================================
// This function handles user logout by clearing the JWT cookie. It sets the cookie to an empty value and expires it immediately, effectively logging the user out. It includes comprehensive cookie clearing options to ensure the cookie is properly removed across different environments and browsers, and provides appropriate error handling.
//===============================================================
export const logout = (req, res) => {
  try {
    // Clear the JWT cookie with comprehensive options
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Prevent CSRF attacks
      expires: new Date(0), // Expire immediately
      path: '/' // Ensure cookie is cleared for all paths
    });

    res.status(200).json({ 
      message: 'Logged out successfully',
      success: true 
    });

  } catch (error) {
    console.error('Error in logout:', error);
    
    // Even if there's an error, attempt to clear the cookie
    res.clearCookie('jwt');
    
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
};


//===============================================================
// Check Authentication Controller
//===============================================================
// This function checks if the user is authenticated by retrieving the user information based on the user ID stored in the request (which is set by the authentication middleware). It returns the user data (excluding the password) if the user is found, or an appropriate error message if the user is not found or if there is an internal server error. This function includes validation of the user ID format, comprehensive error handling, and ensures that sensitive data is never exposed in the response.
//===============================================================
export const checkAuth = async (req, res) => {
  try {
    // Validate that userId exists in request (set by auth middleware)
    if (!req.userId) {
      return res.status(401).json({ 
        message: 'Authentication required',
        authenticated: false 
      });
    }

    // Validate userId format (MongoDB ObjectId)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(req.userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        authenticated: false 
      });
    }

    // Fetch user data excluding sensitive fields
    const user = await User.findById(req.userId).select('-password -__v');
    
    if (!user) {
      // User ID is valid but user doesn't exist (possibly deleted)
      return res.status(404).json({ 
        message: 'User not found',
        authenticated: false 
      });
    }

    // Return user data with authentication status
    res.status(200).json({
      authenticated: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in checkAuth:', error);
    
    // Handle specific database errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid user ID',
        authenticated: false 
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(503).json({ 
        message: 'Database service temporarily unavailable',
        authenticated: false 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      authenticated: false 
    });
  }
};