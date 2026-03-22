import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/generateToken.js';


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
// This function handles user login. It validates the input data, checks for the existence of the user, compares the provided password with the stored hashed password, generates a JWT token if authentication is successful, and returns the user data (excluding the password) in the response. It includes robust error handling to provide clear feedback on authentication failures.
//===============================================================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//===============================================================
// Logout Controller
//===============================================================
// This function handles user logout by clearing the JWT cookie. It sets the cookie to an empty value and expires it immediately, effectively logging the user out. It also includes error handling to ensure that any issues during the logout process are logged and an appropriate response is sent back to the client.
//===============================================================
export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//===============================================================
// Check Authentication Controller
//===============================================================
// This function checks if the user is authenticated by retrieving the user information based on the user ID stored in the request (which is set by the authentication middleware). It returns the user data (excluding the password) if the user is found, or an appropriate error message if the user is not found or if there is an internal server error. This function is useful for verifying the authentication status of a user and retrieving their information.
//===============================================================

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in checkAuth:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};