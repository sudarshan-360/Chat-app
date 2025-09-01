import express from 'express';
import passport from '../lib/passport.js';
import { generateToken } from '../lib/util.js';
import { register, login, checkAuth } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Regular auth routes
router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.get('/check-auth', checkAuth);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with success
      const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/login?error=oauth_failed`);
    }
  }
);

export default router;