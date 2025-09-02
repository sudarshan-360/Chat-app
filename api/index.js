// api/index.js - Main serverless function entry point
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "../server/lib/db.js";
import userRoutes from "../server/routes/userRoutes.js";
import messageRoutes from "../server/routes/messageRoutes.js";
import authRoutes from "../server/routes/authRoutes.js";
import passport from "../server/lib/passport.js";

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

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

// Passport
app.use(passport.initialize());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Connect to database
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected for serverless function");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

// Serverless function handler
export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}