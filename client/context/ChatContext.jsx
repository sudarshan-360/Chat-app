import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import API from "../src/utils/api";
import { useAuth, profileUpdateEvent } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const selectedUserRef = useRef(null);

  // Keep ref in sync with selectedUser state
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Listen for profile updates and refresh users list
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUsers(); // Refresh users list when any profile is updated
    };

    profileUpdateEvent.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      profileUpdateEvent.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      const s = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          userId: user._id
        }
      });
      setSocket(s);

      s.on("newMessage", (msg) => {
        // Only add message if it's part of the current conversation
        const currentSelectedUser = selectedUserRef.current;
        if (currentSelectedUser && 
            ((msg.senderId === user._id && msg.receiverId === currentSelectedUser._id) ||
             (msg.senderId === currentSelectedUser._id && msg.receiverId === user._id))) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      s.on("messageDeleted", ({ messageId }) => {
        setMessages((prev) => prev.filter(msg => msg._id !== messageId));
      });

      s.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });

      s.on("onlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });

      return () => s.disconnect();
    }
  }, [user?._id]);

   // Fetch users when user is authenticated
  useEffect(() => {
    if (user?._id) {
      fetchUsers();
    }
  }, [user?._id]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    } else {
      setMessages([]); // Clear messages when no user is selected
    }
  }, [selectedUser?._id]);

  const fetchUsers = async () => {
    if (!user?._id) return; // Don't fetch if user is not authenticated
    
    try {
      setIsLoading(true);
      const { data } = await API.get("/messages/users");
      // Double-check filtering on frontend to prevent logged-in user from appearing
      const filteredUsers = (data.filteredUsers || []).filter(u => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await API.get(`/messages/${userId}`);
      setMessages(data.messages || []);
      // Don't override selectedUser here - it should already be set with the full user object
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser) throw new Error("No user selected");
    
    try {
      const { data } = await API.post(`/messages/send/${selectedUser._id}`, {
        text: messageData.text,
        image: messageData.image
      });
      
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        // Socket events are now handled by the backend API
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  };

  const unsendMessage = async (messageId) => {
    try {
      const { data } = await API.delete(`/messages/${messageId}`);
      
      if (data.success) {
        // Remove message from local state immediately for better UX
        setMessages((prev) => prev.filter(msg => msg._id !== messageId));
        // Socket events will handle real-time updates for other users
      } else {
        throw new Error(data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Unsend message error:", error);
      throw error;
    }
  };

  const clearChatHistory = () => {
    // Clear messages only from local state - this only affects current user's view
    setMessages([]);
    // Clear unread messages for the selected user
    if (selectedUser) {
      setUnreadMessages(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));
    }
  };

  // Extract images from messages for shared media display
  const getSharedImages = () => {
    return messages
      .filter(msg => msg.image) // Only messages with images
      .map(msg => ({
        id: msg._id,
        src: msg.image,
        alt: `Image from ${msg.senderId === user?._id ? 'You' : selectedUser?.fullName || 'User'}`,
        timestamp: msg.timestamp || msg.createdAt,
        senderId: msg.senderId
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
  };

  return (
    <ChatContext.Provider
      value={{ 
        users, 
        messages, 
        selectedUser, 
        onlineUsers, 
        unreadMessages, 
        isLoading,
        fetchUsers, 
        fetchMessages, 
        sendMessage, 
        unsendMessage,
        clearChatHistory,
        setSelectedUser,
        getSharedImages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
