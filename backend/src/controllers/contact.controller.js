import ContactRequest from "../models/contactRequest.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { io, getReceiverSocketId } from "../lib/socket.js";

//===============================================================
// Contact Controller
//===============================================================
// Handles contact request functionality including sending, accepting,
// declining requests, and managing user connections.
//===============================================================

//===============================================================
// Send Contact Request
//===============================================================
export const sendContactRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent sending request to yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already contacts
    const sender = await User.findById(senderId);
    const isAlreadyContact = sender.contacts.some(
      (contactId) => contactId.toString() === receiverId
    );
    
    if (isAlreadyContact) {
      return res.status(400).json({ message: "Already in your contacts" });
    }

    // Check if request already exists (in any direction)
    const existingRequest = await ContactRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ message: "Contact request already pending" });
      }
      if (existingRequest.status === "declined") {
        // Allow resending after decline
        existingRequest.status = "pending";
        existingRequest.senderId = senderId;
        existingRequest.receiverId = receiverId;
        await existingRequest.save();
        
        // Notify receiver via socket
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("contactRequest", {
            request: await existingRequest.populate("senderId", "name email profilePic"),
          });
        }

        return res.status(200).json(existingRequest);
      }
    }

    // Create new contact request
    const newRequest = new ContactRequest({ senderId, receiverId });
    await newRequest.save();

    const populatedRequest = await ContactRequest.findById(newRequest._id)
      .populate("senderId", "name email profilePic")
      .populate("receiverId", "name email profilePic");

    // Notify receiver via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("contactRequest", { request: populatedRequest });
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Error in sendContactRequest:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Contact request already exists" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Get Pending Contact Requests
//===============================================================
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get requests received by the user that are still pending
    const requests = await ContactRequest.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("senderId", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Get Sent Contact Requests
//===============================================================
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ContactRequest.find({
      senderId: userId,
      status: "pending",
    })
      .populate("receiverId", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getSentRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Accept Contact Request
//===============================================================
export const acceptContactRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;

    // Validate requestId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Find the request
    const request = await ContactRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Verify the user is the receiver
    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    // Check if already accepted
    if (request.status === "accepted") {
      return res.status(400).json({ message: "Request already accepted" });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add each user to the other's contacts list
    await User.findByIdAndUpdate(request.senderId, {
      $addToSet: { contacts: request.receiverId },
    });
    await User.findByIdAndUpdate(request.receiverId, {
      $addToSet: { contacts: request.senderId },
    });

    // Notify sender via socket
    const senderSocketId = getReceiverSocketId(request.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("contactAccepted", {
        userId: userId.toString(),
        requestId: requestId,
      });
    }

    res.status(200).json({ message: "Contact request accepted", request });
  } catch (error) {
    console.error("Error in acceptContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Decline Contact Request
//===============================================================
export const declineContactRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;

    // Validate requestId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Find the request
    const request = await ContactRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Verify the user is the receiver
    if (request.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to decline this request" });
    }

    // Update status to declined
    request.status = "declined";
    await request.save();

    res.status(200).json({ message: "Contact request declined" });
  } catch (error) {
    console.error("Error in declineContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Cancel Sent Contact Request
//===============================================================
export const cancelContactRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;

    // Validate requestId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Find and delete the request
    const request = await ContactRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    // Verify the user is the sender
    if (request.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending requests" });
    }

    await ContactRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Contact request cancelled" });
  } catch (error) {
    console.error("Error in cancelContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Remove Contact
//===============================================================
export const removeContact = async (req, res) => {
  try {
    const userId = req.user._id;
    const contactId = req.params.id;

    // Validate contactId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Remove from both users' contacts
    await User.findByIdAndUpdate(userId, {
      $pull: { contacts: contactId },
    });
    await User.findByIdAndUpdate(contactId, {
      $pull: { contacts: userId },
    });

    // Delete any contact requests between them
    await ContactRequest.deleteMany({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    });

    // Notify the other user via socket that they were removed
    const contactSocketId = getReceiverSocketId(contactId);
    if (contactSocketId) {
      io.to(contactSocketId).emit("contactRemoved", { 
        removedBy: userId.toString(),
        contactId: contactId 
      });
    }

    res.status(200).json({ message: "Contact removed" });
  } catch (error) {
    console.error("Error in removeContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Get All Contacts
//===============================================================
export const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("contacts", "name email profilePic");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.contacts || []);
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Search Users (for adding new contacts)
//===============================================================
export const searchUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search users by name or email (excluding self)
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email profilePic")
      .limit(20);

    // Get current user's contacts and pending requests
    const currentUser = await User.findById(userId).select("contacts");
    const sentRequests = await ContactRequest.find({
      senderId: userId,
      status: "pending",
    }).select("receiverId");
    const receivedRequests = await ContactRequest.find({
      receiverId: userId,
      status: "pending",
    }).select("senderId");

    const contactIds = currentUser.contacts.map((id) => id.toString());
    const sentRequestIds = sentRequests.map((r) => r.receiverId.toString());
    const receivedRequestIds = receivedRequests.map((r) => r.senderId.toString());

    // Add connection status to each user
    const usersWithStatus = users.map((user) => {
      const userObj = user.toObject();
      const userIdStr = user._id.toString();

      if (contactIds.includes(userIdStr)) {
        userObj.connectionStatus = "connected";
      } else if (sentRequestIds.includes(userIdStr)) {
        userObj.connectionStatus = "pending";
      } else if (receivedRequestIds.includes(userIdStr)) {
        userObj.connectionStatus = "received";
      } else {
        userObj.connectionStatus = "none";
      }

      return userObj;
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
