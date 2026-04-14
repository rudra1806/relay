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

// Map of userId -> { peerId, callType } for tracking active calls
const activeCalls = new Map();

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

    // ──────────────────────────────────────────────
    // WebRTC Call Signaling Events
    // ──────────────────────────────────────────────

    // Caller initiates a call to receiver
    socket.on("call:initiate", ({ receiverId, callType }) => {
      const receiverSocketId = onlineUsers.get(receiverId);

      // Check if receiver is online
      if (!receiverSocketId) {
        socket.emit("call:unavailable", { receiverId });
        return;
      }

      // Check if receiver is already in a call
      if (activeCalls.has(receiverId)) {
        socket.emit("call:busy", { receiverId });
        return;
      }

      // Check if caller is already in a call
      if (activeCalls.has(userId)) {
        socket.emit("call:busy", { receiverId, message: "You are already in a call" });
        return;
      }

      // Send incoming call to receiver
      const caller = socket.user;
      io.to(receiverSocketId).emit("call:incoming", {
        callerId: userId,
        callerName: caller.name,
        callerPic: caller.profilePic,
        callType,
      });

      console.log(`📞 ${userId} calling ${receiverId} (${callType})`);
    });

    // Receiver accepts the call
    socket.on("call:accepted", ({ callerId, callType }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (!callerSocketId) return;

      // Track active call for both users
      activeCalls.set(userId, { peerId: callerId, callType });
      activeCalls.set(callerId, { peerId: userId, callType });

      io.to(callerSocketId).emit("call:accepted", {
        acceptedBy: userId,
        callType,
      });

      console.log(`✅ ${userId} accepted call from ${callerId}`);
    });

    // Receiver rejects the call
    socket.on("call:rejected", ({ callerId }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (!callerSocketId) return;

      io.to(callerSocketId).emit("call:rejected", {
        rejectedBy: userId,
      });

      console.log(`❌ ${userId} rejected call from ${callerId}`);
    });

    // Either party ends the call
    socket.on("call:ended", ({ peerId }) => {
      const peerSocketId = onlineUsers.get(peerId);

      // Clean up active call tracking
      activeCalls.delete(userId);
      activeCalls.delete(peerId);

      if (peerSocketId) {
        io.to(peerSocketId).emit("call:ended", {
          endedBy: userId,
        });
      }

      console.log(`📴 Call ended between ${userId} and ${peerId}`);
    });

    // WebRTC SDP Offer (Caller → Receiver)
    socket.on("call:offer", ({ offer, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:offer", {
          offer,
          callerId: userId,
        });
      }
    });

    // WebRTC SDP Answer (Receiver → Caller)
    socket.on("call:answer", ({ answer, callerId }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("call:answer", {
          answer,
          answererId: userId,
        });
      }
    });

    // ICE Candidate exchange (bidirectional)
    socket.on("call:ice-candidate", ({ candidate, peerId }) => {
      const peerSocketId = onlineUsers.get(peerId);
      if (peerSocketId) {
        io.to(peerSocketId).emit("call:ice-candidate", {
          candidate,
          from: userId,
        });
      }
    });

    // Media toggle notifications (mute/camera)
    socket.on("call:toggle-media", ({ peerId, mediaType, enabled }) => {
      const peerSocketId = onlineUsers.get(peerId);
      if (peerSocketId) {
        io.to(peerSocketId).emit("call:toggle-media", {
          from: userId,
          mediaType, // 'audio' or 'video'
          enabled,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);

      // If user was in an active call, notify the peer
      const activeCall = activeCalls.get(userId);
      if (activeCall) {
        const peerSocketId = onlineUsers.get(activeCall.peerId);
        if (peerSocketId) {
          io.to(peerSocketId).emit("call:ended", {
            endedBy: userId,
            reason: "disconnected",
          });
        }
        activeCalls.delete(userId);
        activeCalls.delete(activeCall.peerId);
      }

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
