import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getPublicKey, updateEncryptedKeys } from '../controllers/encryption.controller.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

// All encryption routes require authentication
router.use(arcjetProtection, protectRoute);

// Get a user's public key (for encrypting messages to them)
router.get('/public-key/:userId', getPublicKey);

// Update encrypted private key (password change / recovery)
router.put('/keys', updateEncryptedKeys);

export default router;
