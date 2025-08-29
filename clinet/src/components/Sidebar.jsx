import React from 'react'
import { useNavigate } from 'react-router-dom'
import assets, { userDummyData } from '../assets/assets'

const Sidebar = ({selectedUser, setSelectedUser}) => {
  const navigate = useNavigate() //navigate programmatically.
  
  const handleUserClick = (user) => {
    setSelectedUser(user)
  }
  //Runs when you click a user from the list.
  const handleLogout = () => {
    // Will eventually log out the user
    navigate('/login')
  }
  
  // Mock data for online status and unread counts
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
  
  return (
    <div className="bg-white/10 backdrop-blur-sm border-r border-gray-600 h-full flex flex-col font-['Poppins']">
      {/* Header with Logo and Menu */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={assets.logo} 
              alt="Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-white text-xl font-semibold tracking-tight">QuickChat</h1>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <img 
              src={assets.menu_icon} 
              alt="Menu" 
              className="w-6 h-6 filter invert"
            />
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <img 
            src={assets.search_icon} 
            alt="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60"
          />
          <input 
            type="text" 
            placeholder="Search users..."
            className="w-full bg-white/10 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-normal"
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
                onClick={() => handleUserClick(user)} //the connection between clicking on a user and saving that user into state
                className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  selectedUser?._id === user._id 
                    ? 'bg-blue-600/30 border border-blue-500' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <img 
                    src={user.profilePic} 
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  {/* Online/Offline Status Indicator */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    userStatus.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium truncate">{user.fullName}</h3>
                    {/* Unread Message Count */}
                    {userStatus.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                        {userStatus.unread > 99 ? '99+' : userStatus.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm truncate font-normal">
                      {userStatus.online ? 'Online' : 'Offline'}
                    </p>
                    <div className="text-xs text-gray-500 font-normal">
                      12:30
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Footer with User Profile */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={assets.avatar_icon} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            {/* Your online status */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">You</h3>
            <p className="text-green-400 text-sm font-normal">Online</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar


