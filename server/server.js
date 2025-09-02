// server/server.js
import dotenv from "dotenv";
import path from "path";

// Configure dotenv FIRST before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log('Environment check - JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Missing');

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { protectRoute } from "./middleware/auth.js";
import Message from "./models/message.js"; // Changed from Message.js to message.js
import User from "./models/User.js";
import { initSocket } from "./lib/socket.js";
import passport from "./lib/passport.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" })); // support large base64 images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// Passport middleware
app.use(passport.initialize());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // Google OAuth and regular auth routes
app.use("/api/messages", messageRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Chat App Backend API", 
    status: "running",
    endpoints: {
      health: "/api/health",
      status: "/api/status",
      auth: "/api/auth",
      users: "/api/users",
      messages: "/api/messages"
    }
  });
});

// Health route
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Status route
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

// Connect DB then start server
connectDB(process.env.MONGODB_URI).then(() => {
  // Socket.IO setup
  const io = new SocketIOServer(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
  });

  // Map userId -> Set of socketIds (supports multiple tabs/devices)
  const onlineMap = new Map();

  // Initialize socket instance for use in controllers
  initSocket(io, onlineMap);

  const emitOnlineUsers = () => {
    const onlineUserIds = Array.from(onlineMap.keys());
    io.emit("getOnlineUsers", onlineUserIds);
    io.emit("onlineUsers", onlineUserIds);
  };

  io.on("connection", (socket) => {
    try {
      // Support both handshake.auth and handshake.query
      const userId = (socket.handshake.auth && socket.handshake.auth.userId) || (socket.handshake.query && socket.handshake.query.userId);
      
      if (!userId) {
        // no user id provided — still allow, but don't register
      } else {
        // add socket id to map
        const existing = onlineMap.get(userId);
        if (existing) {
          existing.add(socket.id);
        } else {
          onlineMap.set(userId, new Set([socket.id]));
        }
        emitOnlineUsers();
      }

      // Join per-user room (optional)
      socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
      });

      // Optional client-side event to explicitly send message via socket
      // We'll still persist messages via REST send endpoint; this handler can be used for realtime only flows
      socket.on("sendMessage", async (payload) => {
        // expected payload: { senderId, receiverId, message, image }
        try {
          const { senderId, receiverId, message: text, image } = payload;
          if (!senderId || !receiverId) return;

          const saved = await Message.create({
            senderId,
            receiverId,
            message: text || "",
            image: image || "",
            seen: false
          });

          const msgObj = saved.toObject();

          // Emit to receiver(s)
          const receiverSockets = onlineMap.get(receiverId);
          if (receiverSockets && receiverSockets.size > 0) {
            receiverSockets.forEach(sid => io.to(sid).emit("newMessage", {
              _id: msgObj._id,
              senderId: msgObj.senderId,
              receiverId: msgObj.receiverId,
              message: msgObj.message,
              image: msgObj.image,
              createdAt: msgObj.createdAt,
            }));
          }

          // Emit to sender as well (so sender updates UI)
          const senderSockets = onlineMap.get(senderId);
          if (senderSockets && senderSockets.size > 0) {
            senderSockets.forEach(sid => io.to(sid).emit("newMessage", {
              _id: msgObj._id,
              senderId: msgObj.senderId,
              receiverId: msgObj.receiverId,
              message: msgObj.message,
              image: msgObj.image,
              createdAt: msgObj.createdAt,
            }));
          }
        } catch (err) {
          console.error("Socket sendMessage error:", err);
        }
      });

      // Typing indicators (relays to receiver)
      socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSockets = onlineMap.get(receiverId);
        if (receiverSockets) {
          receiverSockets.forEach(sid => io.to(sid).emit("typing", { senderId }));
        }
      });

      socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSockets = onlineMap.get(receiverId);
        if (receiverSockets) {
          receiverSockets.forEach(sid => io.to(sid).emit("stopTyping", { senderId }));
        }
      });

      socket.on("disconnect", () => {
        // remove socket from map
        if (userId) {
          const set = onlineMap.get(userId);
          if (set) {
            set.delete(socket.id);
            if (set.size === 0) onlineMap.delete(userId);
            else onlineMap.set(userId, set);
          }
          emitOnlineUsers();
        }
      });

    } catch (err) {
      console.error("Socket connection error:", err);
    }
  });

  // Start HTTP server
  // For Vercel, this won't be called due to serverless architecture
  // For Render and other platforms, this is needed
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

// Export server for Vercel
export default server;
