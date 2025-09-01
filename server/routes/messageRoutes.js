import express from 'express';
import { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage, unsendMessage } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark-seen/:id', protectRoute, markMessageAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);
messageRouter.delete('/:messageId', protectRoute, unsendMessage);

export default messageRouter;