// Add these imports at the top
import User from '../models/User.js';
import Message from '../models/message.js';

//get all users expect current user

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select('fullName email'); // Fix: use 'fullName' not 'username'
    
    const unreadMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        receiverId: userId, // Fix: should be userId (current user receiving)
        senderId: user._id,  // Fix: from other users
        read: false,
      });
      if(messages.length > 0) {
        unreadMessages[user._id] = messages.length;
      }
    });
    
    await Promise.all(promises); // Move outside map function
    res.json({ filteredUsers, unreadMessages });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get all messages for selected user

export const getMessages = async (req, res) => {
  try {
    const{id:selectedUserId} = req.params;
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
    })
    await Message.updateMany({
      senderId: selectedUserId,
      receiverId: userId,
    }, {
      read: true,
    });
    res.json({ messages });
  } catch (error) {
    console.error("Error in getMessagesForSelectedUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//API to mark message as seen

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;
    await Message.updateOne({
      _id: messageId,
      receiverId: userId,
    }, {
      read: true,
    });
    res.json({ message: "Message marked as seen" });
  } catch (error) {
    console.error("Error in markMessageAsSeen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
