import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { io, getReceiverSocketId } from "../lib/socket.js";

//===============================================================
// Message Controller
//===============================================================
// This controller handles messaging functionality including fetching contacts,
// retrieving messages between users, and sending new messages with optional images.
// It includes robust validation, error handling, and Cloudinary integration.
//===============================================================


//===============================================================
// Get Contacts Controller
//===============================================================
// Fetches all users except the logged-in user for the contacts/sidebar list.
// Returns only necessary fields (username, profilePic) for optimal performance.
//===============================================================
export const getContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch all users except the logged-in user
    const contacts = await User.find({ _id: { $ne: loggedInUserId } })
      .select("name email profilePic")
      .sort({ name: 1 }); // Sort alphabetically by name

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error in getContacts:", error);

    // Handle database errors
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({ message: "Database service temporarily unavailable" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Get Messages Controller
//===============================================================
// Retrieves all messages between the logged-in user and a specific user.
// Messages are sorted chronologically and include validation for user existence.
//===============================================================
export const getMessagesByUserId = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.id;

    // Validate otherUserId format
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent fetching messages with yourself
    if (loggedInUserId.toString() === otherUserId) {
      return res.status(400).json({ message: "Cannot fetch messages with yourself" });
    }

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: 1 }); // Sort chronologically

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);

    // Handle invalid ObjectId cast errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Handle database errors
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({ message: "Database service temporarily unavailable" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Send Message Controller
//===============================================================
// Creates and sends a new message with optional text and/or image.
// Handles image upload to Cloudinary with validation and optimization.
// Includes comprehensive validation for message content and user existence.
//===============================================================
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    // Validate receiverId format
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Prevent sending messages to yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send messages to yourself" });
    }

    // Validate that at least text or image is provided
    if (!text && !image) {
      return res.status(400).json({ message: "Message must contain either text or image" });
    }

    // Validate text length if provided
    if (text && typeof text === "string") {
      const trimmedText = text.trim();
      if (trimmedText.length === 0 && !image) {
        return res.status(400).json({ message: "Message text cannot be empty" });
      }
      if (trimmedText.length > 5000) {
        return res.status(400).json({ message: "Message text cannot exceed 5000 characters" });
      }
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Prepare message data
    const messageData = {
      senderId,
      receiverId,
      text: text ? text.trim() : undefined,
    };

    // Handle image upload if provided
    if (image) {
      // Validate image is a string (base64)
      if (typeof image !== "string") {
        return res.status(400).json({ message: "Image must be a base64 string" });
      }

      // Validate base64 image format
      if (image.startsWith("data:image/")) {
        const validImageTypes = [
          "data:image/jpeg",
          "data:image/jpg",
          "data:image/png",
          "data:image/webp",
          "data:image/gif",
        ];
        const isValidType = validImageTypes.some((type) => image.startsWith(type));

        if (!isValidType) {
          return res.status(400).json({
            message: "Invalid image format. Supported formats: JPEG, PNG, WebP, GIF",
          });
        }

        // Check base64 size (limit to ~10MB)
        if (image.length > 14000000) {
          return res.status(400).json({ message: "Image is too large. Maximum size is 10MB" });
        }

        try {
          // Upload image to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "relay/messages",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" }, // Limit max dimensions
              { quality: "auto", fetch_format: "auto" },
            ],
          });

          messageData.image = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error("Error uploading image to Cloudinary:", uploadError);
          return res.status(500).json({ message: "Failed to upload image" });
        }
      } else {
        return res.status(400).json({
          message: "Invalid image format. Please provide a base64 encoded image",
        });
      }
    }

    // Create and save the message
    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save();

    // Emit real-time message to receiver if they are online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    // Handle invalid ObjectId cast errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Handle Cloudinary upload errors
    if (error.message && error.message.includes("cloudinary")) {
      return res.status(500).json({ message: "Failed to upload image" });
    }

    // Handle database errors
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({ message: "Database service temporarily unavailable" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Get Chat Partners Controller
//===============================================================
// Retrieves a list of users that the logged-in user has had conversations with.
// This is used to populate the chat sidebar with active conversations.
//===============================================================
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch distinct user IDs that the logged-in user has messaged with
    const sentMessages = await Message.find({ senderId: loggedInUserId }).distinct("receiverId");
    const receivedMessages = await Message.find({ receiverId: loggedInUserId }).distinct("senderId");

    const chatPartnerIds = Array.from(new Set([...sentMessages, ...receivedMessages]));

    // Fetch user details for chat partners
    const contacts = await User.find({ _id: { $in: chatPartnerIds } })
      .select("name email profilePic")
      .sort({ name: 1 }); // Sort alphabetically by name
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===============================================================
// Mark Messages As Read Controller
//===============================================================
// Marks all unread messages from a specific user as read.
// Called when the current user opens a conversation with that user.
//===============================================================
export const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    // Validate senderId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Mark all unread messages from sender to receiver as read
    const result = await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify the sender that their messages have been read (real-time)
    if (result.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          readBy: receiverId.toString(),
          senderId: senderId,
        });
      }
    }

    res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
