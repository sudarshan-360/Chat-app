// server/controllers/messageController.js
import Message from "../models/message.js";
import User from "../models/User.js";
import { uploadImageFromData, deleteImageFromUrl } from "../lib/cloudinary.js";
import { getIO, emitToUser } from "../lib/socket.js";

/**
 * GET /api/messages/users
 * Return list of users (except requester) + unread counts keyed by userId
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const me = req.user;
    if (!me) return res.status(401).json({ success: false, message: "Not authenticated" });

    // All other users
    const users = await User.find({ _id: { $ne: me._id } }).select("fullName email profilePicture");

    // Calculate unread counts: messages where receiver=me and seen=false, group by senderId
    const unreadAgg = await Message.aggregate([
      { $match: { receiverId: me._id, seen: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } }
    ]);

    const unreadMessages = {};
    unreadAgg.forEach(r => {
      unreadMessages[r._id.toString()] = r.count;
    });

    return res.json({ success: true, filteredUsers: users, unreadMessages });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/**
 * GET /api/messages/:userId
 * Get messages between auth user and :userId ordered oldest -> newest
 */
export const getMessages = async (req, res) => {
  try {
    const me = req.user;
    const otherId = req.params.id;
    if (!me) return res.status(401).json({ success: false, message: "Not authenticated" });

    // Fetch messages between two users
    const messages = await Message.find({
      $or: [
        { senderId: me._id, receiverId: otherId },
        { senderId: otherId, receiverId: me._id }
      ]
    }).sort({ createdAt: 1 });

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

/**
 * POST /api/messages/send/:userId
 * body: { text, image } where image may be a dataURL or empty
 */
export const sendMessage = async (req, res) => {
  try {
    const me = req.user;
    const receiverId = req.params.id;
    if (!me) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { text, image } = req.body;

    let imageUrl = "";
    if (image && typeof image === "string" && image.startsWith("data:")) {
      // upload to cloudinary
      imageUrl = await uploadImageFromData(image, "quickchat_messages");
    } else if (image && typeof image === "string" && image.startsWith("http")) {
      imageUrl = image;
    }

    const message = await Message.create({
      senderId: me._id,
      receiverId,
      message: text || "",
      image: imageUrl,
      seen: false
    });

    // populate sender/receiver minimal data for convenience
    const populated = await Message.findById(message._id).lean();

    // Emit socket events for real-time messaging
    try {
      // Emit to receiver only
      emitToUser(receiverId, 'newMessage', populated);
      
      // Emit to sender for confirmation
      emitToUser(me._id, 'newMessage', populated);
    } catch (socketError) {
      console.log('Socket emission failed:', socketError.message);
      // Don't fail the API call if socket emission fails
    }

    // Return the saved message object
    return res.json({ success: true, data: populated });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

/**
 * PUT /api/messages/mark-seen/:messageId
 * mark a single message as seen
 */
export const markMessageAsSeen = async (req, res) => {
  try {
    const me = req.user;
    const messageId = req.params.messageId;
    if (!me) return res.status(401).json({ success: false, message: "Not authenticated" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (message.receiverId.toString() !== me._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed to mark this message" });
    }

    message.seen = true;
    await message.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("Mark seen error:", err);
    return res.status(500).json({ success: false, message: "Failed to mark message as seen" });
  }
};

/**
 * DELETE /api/messages/:messageId
 * Delete/unsend a message (only sender can delete their own messages)
 */
export const unsendMessage = async (req, res) => {
  try {
    const me = req.user;
    const messageId = req.params.messageId;
    if (!me) return res.status(401).json({ success: false, message: "Not authenticated" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    
    // Only sender can delete their own messages
    if (message.senderId.toString() !== me._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    // If message has an image, try to delete it from Cloudinary
    if (message.image) {
      try {
        await deleteImageFromUrl(message.image);
      } catch (imageError) {
        console.error("Failed to delete image from Cloudinary:", imageError);
        // Continue with message deletion even if image deletion fails
      }
    }

    // Delete the message from database
    await Message.findByIdAndDelete(messageId);

    // Emit socket events for real-time message removal
    try {
      // Emit to receiver
      emitToUser(message.receiverId.toString(), 'messageDeleted', { messageId });
      
      // Emit to sender for confirmation
      emitToUser(me._id.toString(), 'messageDeleted', { messageId });
    } catch (socketError) {
      console.log('Socket emission failed:', socketError.message);
      // Don't fail the API call if socket emission fails
    }

    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Unsend message error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};
