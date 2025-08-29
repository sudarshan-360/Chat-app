import React from 'react'

const RightSidebar = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border-l border-gray-600 p-4">
      <h3 className="text-white text-lg font-semibold mb-4">Chat Info</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Shared Media</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-gray-700 rounded-lg"></div>
            <div className="aspect-square bg-gray-700 rounded-lg"></div>
            <div className="aspect-square bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Settings</h4>
          <div className="space-y-2">
            <button className="w-full text-left text-gray-300 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              Mute Notifications
            </button>
            <button className="w-full text-left text-gray-300 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              Block User
            </button>
            <button className="w-full text-left text-red-400 hover:text-red-300 p-2 hover:bg-white/10 rounded-lg transition-colors">
              Delete Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar

