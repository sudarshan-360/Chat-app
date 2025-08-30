import React from 'react'
import { useNavigate } from 'react-router-dom'
import assets, { userDummyData } from '../assets/assets'

const Sidebar = ({selectedUser, setSelectedUser, sidebarOpen, setSidebarOpen}) => {
  const navigate = useNavigate()

  const getUserStatus = (userId) => {
    const statuses = {
      "680f50aaf10f3cd28382ecf2": { online: true, unread: 3 },
      "680f50e4f10f3cd28382ecf9": { online: true, unread: 0 },
      "680f510af10f3cd28382ed01": { online: false, unread: 1 },
      "680f5137f10f3cd28382ed10": { online: false, unread: 0 },
      "680f516cf10f3cd28382ed11": { online: true, unread: 5 }
    }
    return statuses[userId] || { online: false, unread: 0 }
  }

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
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60"
          />
          <input 
            type="text" 
            placeholder="Search users..."
            className="w-full bg-white/10 border border-gray-600 rounded-lg pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-normal"
          />
        </div>
      </div>
      
      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2">
          {userDummyData.map((user) => {
            const userStatus = getUserStatus(user._id)
            return (
              <div 
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center gap-3 p-3 sm:p-4 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 active:scale-95 ${
                  selectedUser && selectedUser._id === user._id 
                    ? 'bg-white/20 border border-blue-500/30' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.profilePic} 
                    alt={user.fullName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-800 ${
                    userStatus === 'online' ? 'bg-green-500' :
                    userStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm sm:text-base truncate">{user.fullName}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {userStatus === 'online' ? 'Active now' :
                     userStatus === 'away' ? 'Away' : 'Last seen recently'}
                  </p>
                </div>
                {user.unreadCount && (
                  <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-medium flex-shrink-0">
                    {user.unreadCount > 9 ? '9+' : user.unreadCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="p-3 sm:p-4 border-t border-gray-600">
        <div 
          onClick={handleProfileClick}
          className="flex items-center gap-3 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
        >
          <img 
            src={assets.profile_pic} 
            alt="Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-600"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm sm:text-base truncate">Your Profile</h3>
            <p className="text-gray-400 text-xs sm:text-sm truncate">View and edit profile</p>
          </div>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Sidebar


