import express from 'express';
// Fix import path
import { signup, login, checkAuth, updateProfile } from '../controllers/userController.js';
import protectRoute from '../middleware/auth.js'; // Fix: should be auth.js, not protectRoute

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/check-auth', protectRoute, checkAuth);
userRouter.put('/update-profile', protectRoute, updateProfile);

export default userRouter;
