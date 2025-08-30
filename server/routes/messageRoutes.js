import express from 'express';
import { getUsersForSidebar, getMessages, markMessageAsSeen } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark-seen/:id', protectRoute, markMessageAsSeen);

export default messageRouter;