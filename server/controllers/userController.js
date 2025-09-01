// server/controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

// Configure dotenv
dotenv.config();
import { uploadImageFromData } from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ success: false, message: "Please provide name, email and password" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ fullName, email, password: hashed });

    const token = generateToken(user._id);

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userSafe = { _id: user._id, fullName: user.fullName, email: user.email, profilePicture: user.profilePicture };

    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userSafe = { _id: user._id, fullName: user.fullName, email: user.email, profilePicture: user.profilePicture };

    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

export const checkAuth = async (req, res) => {
  // Endpoint public, but uses token from header/cookie; reuse protectRoute logic? We'll parse token here.
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    if (!token && req.cookies && req.cookies.token) token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Check auth error:", err);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export const getUsers = async (req, res) => {
  try {
    // protectRoute should have attached req.user
    const loggedInUserId = req.user._id;
    
    // Fetch all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    // Validate userId format (MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    // Find user with timeout to prevent hanging queries
    const user = await Promise.race([
      User.findById(userId).select("-password").lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      )
    ]);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure all required fields exist with defaults
    const userProfile = {
      _id: user._id,
      fullName: user.fullName || "Unknown User",
      email: user.email || "",
      profilePicture: user.profilePicture || null,
      bio: user.bio || null,
      phone: user.phone || null,
      status: user.status || "Available",
      createdAt: user.createdAt || new Date()
    };

    return res.json({ success: true, user: userProfile });
  } catch (err) {
    console.error("Get user profile error:", err);
    
    // Handle specific error types
    if (err.message === 'Database query timeout') {
      return res.status(408).json({ success: false, message: "Request timeout. Please try again." });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }
    
    return res.status(500).json({ success: false, message: "Failed to fetch user profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // protectRoute should have attached req.user
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { fullName, bio, phone, status, profilePicture } = req.body;

    // If profilePicture is a data URL/base64 string, upload to cloudinary
    let profilePictureUrl = user.profilePicture || "";
    if (profilePicture && profilePicture.startsWith("data:")) {
      profilePictureUrl = await uploadImageFromData(profilePicture, "quickchat_profiles");
    } else if (profilePicture && typeof profilePicture === "string" && profilePicture.startsWith("http")) {
      profilePictureUrl = profilePicture;
    }

    user.fullName = fullName || user.fullName;
    user.bio = bio !== undefined ? bio : user.bio;
    user.phone = phone !== undefined ? phone : user.phone;
    user.status = status !== undefined ? status : user.status;
    user.profilePicture = profilePictureUrl;

    await user.save();

    const userSafe = { _id: user._id, fullName: user.fullName, email: user.email, profilePicture: user.profilePicture, bio: user.bio, phone: user.phone, status: user.status };

    return res.json({ success: true, user: userSafe });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Profile update failed" });
  }
};
