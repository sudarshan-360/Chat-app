import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { formatIndianTime } from "../lib/util";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = ({
  setSidebarOpen,
  setRightSidebarOpen,
  rightSidebarOpen,
}) => {
  const { user: authUser } = useAuth();
  const { selectedUser, messages, sendMessage, unsendMessage, isLoading, onlineUsers } = useChat();
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  // Enhanced auto scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        const hasNewMessages = messages.length > prevMsgCountRef.current;
        const lastMsg = messages[messages.length - 1];
        const isMyLastMessage = lastMsg?.senderId === authUser?._id;

        // Always scroll when:
        // 1. User sends a message
        // 2. User is near bottom and receives a message
        // 3. First message in conversation
        if (hasNewMessages && (isMyLastMessage || isNearBottom || prevMsgCountRef.current === 0)) {
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            });
          });
        }

        prevMsgCountRef.current = messages.length;
      }
    };

    scrollToBottom();
  }, [messages, authUser?._id]);

  const handleSendMessage = async () => {
    if (!message.trim() && !imagePreview) return;
    
    const messageData = {
      text: message.trim(),
      image: imagePreview
    };

    try {
      await sendMessage(messageData);
      setMessage("");
      setImagePreview(null);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUnsendMessage = async (messageId) => {
    try {
      await unsendMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm">
        {/* Header with mobile menu button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-white/10 flex-shrink-0 lg:hidden">
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-semibold">QuickChat</h1>
          <div className="w-9 h-9"></div> {/* Spacer for centering */}
        </div>
        
        {/* Welcome content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Welcome to QuickChat</h2>
            <p className="text-white/60 mb-4">Select a conversation to start messaging</p>
            <button 
              className="lg:hidden px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              Browse Conversations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm h-full max-h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <img 
            src={selectedUser.profilePicture || assets.avatar_icon} 
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
          />
          <div>
            <h3 className="text-white font-semibold">{selectedUser.fullName}</h3>
            {onlineUsers.includes(selectedUser._id) && (
              <p className="text-green-400 text-sm">Online</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors xl:hidden"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 scroll-smooth min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ 
          scrollBehavior: 'smooth', 
          maxHeight: 'calc(100vh - 140px)',
          overscrollBehavior: 'contain'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-white/60">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="text-white/60 mb-2">No messages yet</div>
              <div className="text-white/40 text-sm">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.senderId === authUser?._id;
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
            const isFirstInGroup = showAvatar;
            const isMiddleInGroup = !isFirstInGroup && !isLastInGroup;
            
            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2 sm:gap-3 w-full ${
                  isMyMessage ? 'justify-end' : 'justify-start'
                } ${isLastInGroup ? 'mb-3' : 'mb-1'}`}
              >
                {/* Avatar for received messages */}
                {!isMyMessage && (
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                    {showAvatar ? (
                      <img 
                        src={selectedUser.profilePicture || assets.avatar_icon} 
                        alt={selectedUser.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`
                  flex flex-col max-w-[85%] xs:max-w-[80%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] xl:max-w-[50%]
                  ${isMyMessage ? 'items-end' : 'items-start'}
                  min-w-0 flex-1
                `}>
                  <div className={`
                    relative px-3 py-2 sm:px-4 sm:py-2.5 shadow-md group
                    ${isMyMessage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/15 backdrop-blur-md text-white border border-white/20'
                    }
                    ${
                      isFirstInGroup && isLastInGroup
                        ? 'rounded-2xl' // Single message
                        : isFirstInGroup
                        ? isMyMessage
                          ? 'rounded-2xl rounded-br-lg' // First in group (sent)
                          : 'rounded-2xl rounded-bl-lg' // First in group (received)
                        : isLastInGroup
                        ? isMyMessage
                          ? 'rounded-2xl rounded-tr-lg' // Last in group (sent)
                          : 'rounded-2xl rounded-tl-lg' // Last in group (received)
                        : isMyMessage
                        ? 'rounded-2xl rounded-tr-lg rounded-br-lg' // Middle in group (sent)
                        : 'rounded-2xl rounded-tl-lg rounded-bl-lg' // Middle in group (received)
                    }
                    min-w-0 break-words word-wrap max-w-full
                  `}>
                    {/* Unsend button for own messages */}
                    {isMyMessage && (
                      <button
                        onClick={() => handleUnsendMessage(msg._id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-medium shadow-lg hover:scale-110"
                        title="Delete message"
                      >
                        ×
                      </button>
                    )}
                    {/* Image message */}
                    {msg.image && (
                      <div className="mb-2">
                        <img 
                          src={msg.image} 
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                          style={{ maxWidth: '280px', maxHeight: '400px' }}
                          onClick={() => window.open(msg.image, '_blank')}
                        />
                      </div>
                    )}
                    
                    {/* Text message */}
                    {msg.message && (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words hyphens-auto overflow-wrap-anywhere" 
                         style={{
                           wordBreak: 'break-word', 
                           overflowWrap: 'anywhere',
                           wordWrap: 'break-word'
                         }}>
                        {msg.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  {isLastInGroup && (
                    <p className={`text-xs text-white/50 mt-1 px-1 ${
                      isMyMessage ? 'text-right' : 'text-left'
                    }`}>
                      {formatIndianTime(new Date(msg.timestamp || msg.createdAt))}
                    </p>
                  )}
                </div>
                
                {/* Avatar for sent messages */}
                {isMyMessage && (
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                    {showAvatar ? (
                      <img 
                        src={authUser?.profilePicture || assets.avatar_icon} 
                        alt="You"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-3 sm:px-4 py-2 border-t border-gray-600/30 bg-white/5 backdrop-blur-sm">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview"
              className="max-h-20 sm:max-h-24 rounded-xl shadow-lg border border-white/10"
            />
            <button 
              onClick={removeImagePreview}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shadow-lg transition-all duration-200 hover:scale-110"
              title="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-600/50 bg-white/5 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-end gap-2 sm:gap-3 max-w-full">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 hover:bg-white/10 rounded-xl transition-colors flex-shrink-0 group"
            title="Attach image"
          >
            <img 
              src={assets.gallery_icon} 
              alt="Attach" 
              className="w-4 h-4 sm:w-5 sm:h-5 filter invert opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </button>
          
          <div className="flex-1 relative min-w-0">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-white/10 border border-gray-600/50 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:bg-white/15 resize-none transition-all duration-200 text-sm sm:text-base"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '120px',
                lineHeight: '1.5'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim() && !imagePreview}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
              (message.trim() || imagePreview)
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-gray-600/50 cursor-not-allowed opacity-50'
            }`}
          >
            <img 
              src={assets.send_button} 
              alt="Send" 
              className="w-4 h-4 sm:w-5 sm:h-5 filter invert"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
