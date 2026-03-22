import express from 'express';

import { protectRoute } from '../middleware/auth.middleware.js';
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js';

const router = express.Router();

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route for user logout
router.post('/logout', logout);

// Route for updating user profile - this route is protected, so the user must be authenticated to access it
router.put('/update-profile', protectRoute, updateProfile);

// Route for checking authentication status - protected route
router.get('/check', protectRoute, checkAuth);

export default router;