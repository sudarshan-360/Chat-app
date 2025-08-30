//auth middleware

import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
