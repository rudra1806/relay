import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendContactRequest,
  getPendingRequests,
  getSentRequests,
  acceptContactRequest,
  declineContactRequest,
  cancelContactRequest,
  removeContact,
  getContacts,
  searchUsers,
} from "../controllers/contact.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Search users
router.get("/search", searchUsers);

// Get contacts
router.get("/", getContacts);

// Get pending requests (received)
router.get("/requests/pending", getPendingRequests);

// Get sent requests
router.get("/requests/sent", getSentRequests);

// Send contact request
router.post("/request/:id", sendContactRequest);

// Accept contact request
router.patch("/accept/:id", acceptContactRequest);

// Decline contact request
router.patch("/decline/:id", declineContactRequest);

// Cancel sent request
router.delete("/cancel/:id", cancelContactRequest);

// Remove contact
router.delete("/:id", removeContact);

export default router;
