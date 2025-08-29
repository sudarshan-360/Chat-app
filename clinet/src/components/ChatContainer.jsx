import React from 'react'
import assets from '../assets/assets'

const ChatContainer = ({ selectedUser }) => {
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-white text-4xl font-semibold mb-4">ChatContainer</h1>
          <p className="text-gray-300 text-lg">Select a user to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-600 bg-white/5">
        <img 
          src={selectedUser.profilePic} 
          alt={selectedUser.fullName}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
        />
        <div className="flex-1">
          <h2 className="text-white text-xl font-semibold">{selectedUser.fullName}</h2>
          <p className="text-green-400 text-sm">Online</p>
        </div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Sample messages */}
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">Hey! How are you doing?</p>
              <span className="text-gray-400 text-xs">2:30 PM</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-blue-600 rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">I'm doing great! Thanks for asking.</p>
              <span className="text-blue-200 text-xs">2:32 PM</span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">That's awesome to hear!</p>
              <span className="text-gray-400 text-xs">2:33 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          
          <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors">
            <img 
              src={assets.send_button} 
              alt="Send" 
              className="w-6 h-6 filter invert"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
