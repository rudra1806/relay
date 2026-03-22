import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// this is a test route for signup
router.post('/signup', signup);

// this is a test route for login
router.post('/login', login);

// this is a test route for logout
router.post('/logout', logout);

export default router;