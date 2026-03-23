import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

/**
 * here first we apply the arcjetProtection middleware to all routes in this router, 
 * which will help protect against bots and automated attacks. 
 * Then we apply the protectRoute middleware to ensure that only authenticated users can access these routes. 
 * This way, we ensure that all messaging-related routes are protected and only accessible to logged-in users.
 */
router.use(arcjetProtection, protectRoute); // Protect all routes in this router, user must be authenticated to access

// Get all contacts/users for sidebar
router.get("/contacts", getContacts);

// Get chat partners for authenticated user
router.get('/chats', getChatPartners);

// Get messages between authenticated user and specific user
router.get("/:id", getMessagesByUserId);

// Send message to specific user
router.post("/send/:id", sendMessage);

export default router;