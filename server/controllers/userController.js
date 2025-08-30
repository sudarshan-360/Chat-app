// Fix import - missing .js extension
import User from "../models/User.js";

// Remove duplicate cloudinary import (line 5)
// import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';
import { generateToken } from "../lib/util";  
import cloudinary from '../lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

//signup
export const signup = async (req, res) => {

    const { fullName, email, password , bio} = req.body;
  try {
    if(!fullName || !email || !password || !bio) {
      return res.json({success: false, message: 'Please fill all the fields'})
    }
    const user = await User.findOne({email});
    if(user) {
      return res.json({success: false, message: 'User already exists'})
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({success: true, message: 'User created successfully', token, user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      bio: newUser.bio,
    }});
  } catch (error) {
    console.error('Error in signup controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if(!email || !password) {
      return res.json({success: false, message: 'Please fill all the fields'})
    }
    const user = await User.findOne({email});
    if(!user) {
      return res.json({success: false, message: 'User does not exist'})
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
      return res.json({success: false, message: 'Invalid password'})
    }
    const token = generateToken(user._id);
    res.json({success: true, message: 'User logged in successfully', token, user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio,
    }});
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//check if user is authenticated
export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    res.json({success: true, user});
  } catch (error) {
    console.error('Error in checkAuth controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//update user
export const updateProfile = async (req, res) => {
  try {
    const userID = req.user._id;
    const { fullName, email, password, bio, profilePic } = req.body; // Move this to top
    
    const user = await User.findById(userID); // Get user first
    
    if(fullName) user.fullName = fullName;
    if(email) user.email = email;
    if(bio) user.bio = bio;
    
    if(password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    
    if(profilePic) {
      const cloudinaryResponse = await cloudinary.uploader.upload(profilePic, {
        folder: 'chat-app',
        width: 200,
        height: 200,
        crop: 'fill',
      });
      user.profilePicture = cloudinaryResponse.secure_url;
    }
    
    await user.save();
    res.json({success: true, message: 'User updated successfully', user});
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}