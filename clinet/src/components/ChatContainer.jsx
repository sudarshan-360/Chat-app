import React, { useState, useEffect } from 'react'
import assets from '../assets/assets'
import { formatIndianTime } from '../lib/util'

const ChatContainer = ({ selectedUser, setSidebarOpen, setRightSidebarOpen, rightSidebarOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How are you doing?",
      time: "2:30 PM",
      sender: 'other'
    },
    {
      id: 2,
      text: "I'm doing great! Thanks for asking.",
      time: "2:32 PM",
      sender: 'me'
    },
    {
      id: 3,
      text: "That's awesome to hear!",
      time: "2:33 PM",
      sender: 'other'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        time: formatIndianTime(new Date()),
        sender: 'me'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newMessage = {
          id: messages.length + 1,
          text: `📎 ${file.name}`,
          time: formatIndianTime(new Date()),
          sender: 'me',
          type: 'file'
        };
        setMessages([...messages, newMessage]);
        console.log('File selected:', file);
      }
    };
    input.click();
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4">Welcome to QuickChat</h1>
          <p className="text-gray-300 text-base sm:text-lg mb-6">Select a user from the sidebar to start chatting</p>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors active:scale-95"
          >
            Browse Contacts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-sm h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-600 bg-white/5 flex-shrink-0">
        {/* Mobile menu button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center flex-shrink-0">
            <img 
              src={selectedUser.profilePic} 
              alt={selectedUser.fullName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600"
            />
            <p className="text-gray-400 text-xs mt-1 hidden sm:block">{formatIndianTime(currentTime)}</p>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg sm:text-xl font-semibold truncate">{selectedUser.fullName}</h2>
            <p className="text-green-400 text-sm">Online</p>
          </div>
        </div>

        {/* Right sidebar toggle for mobile/tablet */}
        {setRightSidebarOpen && (
          <button 
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors xl:hidden"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain">
        <div className="space-y-3 sm:space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl p-3 max-w-[85%] sm:max-w-xs lg:max-w-sm break-words ${
                msg.sender === 'me' 
                  ? 'bg-blue-600 rounded-br-md' 
                  : 'bg-white/10 backdrop-blur-sm rounded-bl-md'
              }`}>
                <p className="text-white text-sm sm:text-base leading-relaxed">{msg.text}</p>
                <span className={`text-xs block mt-1 ${
                  msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'
                }`}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-600 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={handleAttachment}
            className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 active:scale-95 self-end mb-1"
            title="Attach file"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-white/10 border border-gray-600 rounded-2xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none max-h-32 overflow-y-auto"
              style={{
                minHeight: '44px',
                height: 'auto'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2.5 sm:p-3 rounded-full transition-colors flex-shrink-0 active:scale-95 self-end mb-1"
            title="Send message"
          >
            <img 
              src={assets.send_button} 
              alt="Send" 
              className="w-5 h-5 sm:w-6 sm:h-6 filter invert"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
