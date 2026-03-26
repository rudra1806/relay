import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../models/user.model.js";

// Express app will be set via initSocket()
let io;
let httpServer;

// Map of userId -> socketId for tracking online users
const onlineUsers = new Map();

/**
 * Initialize Socket.IO with the Express app.
 * Creates an HTTP server wrapping the app and attaches Socket.IO.
 */
export function initSocket(app) {
  httpServer = http.createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: config.isDevelopment()
        ? "http://localhost:5173"
        : config.clientUrl,
      credentials: true,
    },
  });

  // Authenticate sockets using JWT cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Authentication error: No cookies"));
      }

      // Parse the jwt cookie from the cookie header
      const token = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("jwt="))
        ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      if (!decoded?.userId) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket for later use
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  // Handle connections
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId}`);

    // Track online user
    onlineUsers.set(userId, socket.id);

    // Broadcast updated online users list to all clients
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    // Handle typing events
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return { io, httpServer };
}

/**
 * Get the socket ID for a given user ID (if they are online).
 */
export function getReceiverSocketId(userId) {
  return onlineUsers.get(userId);
}

export { io, httpServer };
