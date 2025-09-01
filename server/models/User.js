// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: function() { return !this.googleId; } }, // Password required only if not Google OAuth
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  status: { type: String, default: "Available" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
