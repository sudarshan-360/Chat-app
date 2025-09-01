import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const { users, selectedUser, setSelectedUser, onlineUsers, unreadMessages, isLoading } = useChat()
  const [searchQuery, setSearchQuery] = useState('')

  const handleUserClick = (user) => {
    setSelectedUser(user)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId)
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }
    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  return (
    <div className="bg-white/10 backdrop-blur-sm border-r border-gray-600 h-full flex flex-col font-['Poppins'] w-full">
      {/* Header with Logo and Menu */}
      <div className="p-3 sm:p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg sm:text-xl font-semibold tracking-tight">QuickChat</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Close button for mobile */}
            <button 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <img 
                src={assets.menu_icon} 
                alt="Menu" 
                className="w-5 h-5 sm:w-6 sm:h-6 filter invert"
              />
            </button>
          </div>
        </div>
      </div>
      

      {/* Search Bar */}
      <div className="p-3 sm:p-4">
        <div className="relative">
          <img 
            src={assets.search_icon} 
            alt="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60 filter invert"
          />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-white/60">Loading...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-white/60">
              {searchQuery.trim() ? 'No users match your search' : 'No users found'}
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = isUserOnline(user._id)
            const unreadCount = unreadMessages[user._id] || 0
            const isSelected = selectedUser?._id === user._id
            
            return (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1
                  ${isSelected 
                    ? 'bg-blue-600/30 border border-blue-500/50' 
                    : 'hover:bg-white/10'
                  }
                `}
              >
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.profilePicture || assets.avatar_icon} 
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  {/* Online Status - Always show indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-sm truncate">
                      {user.fullName}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-1">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-600 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <img 
            src={authUser?.profilePicture || assets.avatar_icon} 
            alt="Your Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">
              {authUser?.fullName || 'Your Name'}
            </h3>
            <p className="text-gray-400 text-xs truncate">
              {authUser?.email || 'your.email@example.com'}
            </p>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={handleProfileClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Profile Settings"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar


