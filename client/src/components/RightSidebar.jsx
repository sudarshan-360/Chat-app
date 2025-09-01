import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useChat } from '../../context/ChatContext'
import MediaModal from './MediaModal'

const RightSidebar = ({ setRightSidebarOpen }) => {
  const navigate = useNavigate()
  const { getSharedImages, selectedUser, clearChatHistory } = useChat()
  const sharedImages = getSharedImages()
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  const handleViewProfile = () => {
    if (selectedUser && selectedUser._id) {
      navigate(`/user/${selectedUser._id}`)
    }
  }

  const handleImageClick = (imageSrc, imageAlt) => {
    const newWindow = window.open('', '_blank')
    newWindow.document.write(`
      <html>
        <head>
          <title>${imageAlt}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imageSrc}" alt="${imageAlt}" />
        </body>
      </html>
    `)
    newWindow.document.close()
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border-l border-gray-600 p-3 sm:p-4 h-full flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
        <h3 className="text-white text-lg font-semibold">Chat Info</h3>
        {setRightSidebarOpen && (
          <button 
            onClick={() => setRightSidebarOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors xl:hidden"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* User Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm sm:text-base">Voice Call</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm sm:text-base">Video Call</span>
            </button>
            <button 
              onClick={handleViewProfile}
              className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm sm:text-base">View Profile</span>
            </button>
          </div>

          {/* Shared Media */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Shared Media</h4>
            {sharedImages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm">No shared images yet</p>
                <p className="text-white/40 text-xs mt-1">Images you share will appear here</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sharedImages.slice(0, 6).map((image) => (
                    <div 
                      key={image.id}
                      onClick={() => handleImageClick(image.src, image.alt)}
                      className="aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors group relative"
                    >
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      {/* Error fallback */}
                      <div className="absolute inset-0 bg-white/5 rounded-lg hidden items-center justify-center">
                        <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                {sharedImages.length > 6 && (
                  <button 
                    onClick={() => setIsMediaModalOpen(true)}
                    className="w-full mt-3 p-2 text-blue-400 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    View All Media ({sharedImages.length})
                  </button>
                )}
              </>
            )}
          </div>

          {/* Chat Settings */}
          <div className="space-y-2">
            <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Chat Settings</h4>
            <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm sm:text-base">Mute Notifications</span>
            </button>
            <button 
              onClick={clearChatHistory}
              className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm sm:text-base">Clear Chat History</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              <span className="text-sm sm:text-base">Block User</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Media Modal */}
      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        images={sharedImages}
      />
    </div>
  )
}

export default RightSidebar

