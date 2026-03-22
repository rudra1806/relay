import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/generateToken.js';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';
import { config } from '../config/env.js';
import cloudinary from '../lib/cloudinary.js';


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
  const isProduction = config.isProduction();// Flag to determine if we are in production environment for stricter validations

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
      profilePic: user.profilePic,
      createdAt: user.createdAt
    });

    // Sending welcome email asynchronously (not blocking the response)
    sendWelcomeEmail(user.name, user.email, config.clientUrl).catch(err => {
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
  const isProduction = config.isProduction();

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
      profilePic: user.profilePic,
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
      secure: config.isProduction(), // Use secure cookies in production
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
// Update Profile Controller
//===============================================================
// This function handles updating user profile information. It allows users to update their name, email, password, and profile picture. It includes validation, checks for email uniqueness, securely hashes new passwords, and uploads profile pictures to Cloudinary. The controller is protected by authentication middleware, so req.user is available.
//===============================================================
export const updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword, profilePic } = req.body;
  const isProduction = config.isProduction();

  try {
    // Get the authenticated user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate at least one field is being updated
    if (name === undefined && email === undefined && newPassword === undefined && profilePic === undefined) {
      return res.status(400).json({ message: 'Please provide at least one field to update' });
    }

    // Update name if provided
    if (name !== undefined) {
      const trimmedName = name.trim();
      
      if (trimmedName.length === 0) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }

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

      user.name = trimmedName;
    }

    // Update email if provided
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }

      if (isProduction && trimmedEmail.length > 100) {
        return res.status(400).json({ message: 'Email must be less than 100 characters' });
      }

      // Check if email is already taken by another user
      if (trimmedEmail !== user.email) {
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = trimmedEmail;
      }
    }

    // Update password if provided
    if (newPassword) {
      // Require current password for security
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      if (isProduction) {
        if (newPassword.length > 128) {
          return res.status(400).json({ message: 'Password must be less than 128 characters' });
        }
        if (!/[a-z]/.test(newPassword)) {
          return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[A-Z]/.test(newPassword)) {
          return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[0-9]/.test(newPassword)) {
          return res.status(400).json({ message: 'Password must contain at least one number' });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
          return res.status(400).json({ message: 'Password must contain at least one special character' });
        }

        const commonPasswords = ['password', '123456', 'password123', 'qwerty', 'abc123'];
        if (commonPasswords.includes(newPassword.toLowerCase())) {
          return res.status(400).json({ message: 'Password is too common. Please choose a stronger password' });
        }
      }

      // Hash new password
      const saltRounds = isProduction ? 12 : 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update profile picture if provided
    if (profilePic !== undefined) {
      // Validate profilePic is a string (base64 or URL)
      if (typeof profilePic !== 'string') {
        return res.status(400).json({ message: 'Profile picture must be a string' });
      }

      // If it's a base64 image, upload to Cloudinary
      if (profilePic.startsWith('data:image/')) {
        // Validate base64 format more strictly
        const validImageTypes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp', 'data:image/gif'];
        const isValidType = validImageTypes.some(type => profilePic.startsWith(type));
        
        if (!isValidType) {
          return res.status(400).json({ message: 'Invalid image format. Supported formats: JPEG, PNG, WebP, GIF' });
        }

        // Check base64 size (limit to ~5MB base64 string)
        if (profilePic.length > 7000000) {
          return res.status(400).json({ message: 'Profile picture is too large. Maximum size is 5MB' });
        }

        try {
          // Delete old profile picture from Cloudinary if it exists
          if (user.profilePic && user.profilePic.includes('cloudinary')) {
            try {
              // Extract public_id from Cloudinary URL
              // URL format: https://res.cloudinary.com/cloud/image/upload/v123456/relay/profiles/abc123.jpg
              const urlParts = user.profilePic.split('/upload/');
              if (urlParts.length > 1) {
                // Get everything after /upload/ and before the file extension
                const pathAfterUpload = urlParts[1];
                // Remove version number if present (e.g., v1234567890/)
                const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
                // Remove file extension to get public_id
                const publicId = pathWithoutVersion.split('.')[0];
                
                if (publicId) {
                  await cloudinary.uploader.destroy(publicId);
                }
              }
            } catch (err) {
              console.error('Error deleting old profile picture:', err);
              // Don't fail the update if deletion fails
            }
          }

          // Upload new profile picture
          const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: 'relay/profiles',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });

          user.profilePic = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          return res.status(500).json({ message: 'Failed to upload profile picture' });
        }
      } else if (profilePic === '') {
        // Allow clearing profile picture (delete from Cloudinary if exists)
        if (user.profilePic && user.profilePic.includes('cloudinary')) {
          try {
            const urlParts = user.profilePic.split('/upload/');
            if (urlParts.length > 1) {
              const pathAfterUpload = urlParts[1];
              const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
              const publicId = pathWithoutVersion.split('.')[0];
              
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            }
          } catch (err) {
            console.error('Error deleting profile picture:', err);
            // Don't fail the update if deletion fails
          }
        }
        user.profilePic = '';
      } else {
        // Reject arbitrary URLs for security
        return res.status(400).json({ message: 'Invalid profile picture format. Please provide a base64 image or empty string to clear.' });
      }
    }

    // Save updated user
    await user.save();

    // Return updated user data (password excluded by toJSON method)
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Handle duplicate key errors (MongoDB error code 11000)
    if (error.code === 11000) {
      // Extract which field caused the duplicate error
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'email' 
        ? 'Email already in use' 
        : `Duplicate ${field} value`;
      return res.status(400).json({ message });
    }

    // Handle Cloudinary upload errors
    if (error.message && error.message.includes('cloudinary')) {
      return res.status(500).json({ message: 'Failed to upload profile picture' });
    }

    // Handle database connection errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database service temporarily unavailable' });
    }

    // Generic server error
    res.status(500).json({ message: 'Internal server error' });
  }
};



//===============================================================
// Check Authentication Controller
//===============================================================
// This function checks if the user is authenticated by retrieving the user information
// It's used by the frontend to verify if a user session is still valid
// The user is already authenticated via the protectRoute middleware, so req.user is available
//===============================================================
export const checkAuth = async (req, res) => {
  try {
    // User is already authenticated and attached to req by protectRoute middleware
    res.status(200).json({
      authenticated: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in checkAuth:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      authenticated: false 
    });
  }
};
