import express from 'express';

import { protectRoute } from '../middleware/auth.middleware.js';
import { signup, login, logout, updateProfile, checkAuth, verifyEmail, resendOTP, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

// Apply Arcjet protection to all routes in this router
router.use(arcjetProtection);

// Route for user signup
router.post('/signup', signup);

// Route for email verification with OTP
router.post('/verify-email', verifyEmail);

// Route for resending OTP
router.post('/resend-otp', resendOTP);

// Route for user login
router.post('/login', login);

// Route for user logout (requires authentication)
router.post('/logout', protectRoute, logout);

// Route for forgot password - sends OTP to email
router.post('/forgot-password', forgotPassword);

// Route for reset password - verifies OTP and updates password
router.post('/reset-password', resetPassword);

// Route for updating user profile - this route is protected, so the user must be authenticated to access it
router.put('/update-profile', protectRoute, updateProfile);

// Route for checking authentication status - protected route
router.get('/check', protectRoute, checkAuth);

export default router;