import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(assets.profile_martin);
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@quickchat.com",
    bio: "Hi Everyone, I am using QuickChat!",
    phone: "+1 (555) 123-4567",
    status: "Available"
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log("Profile updated:", profileData);
    console.log("Profile picture:", profilePicture);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
    setProfilePicture(assets.profile_martin);
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 h-full flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-gray-600 p-4 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-white text-2xl font-semibold">Profile Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4 group">
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 mx-auto transition-all duration-200 group-hover:brightness-75"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      
                      {/* Profile picture change button */}
                      <button 
                        onClick={handleProfilePictureClick}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Change profile picture"
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-white text-xs font-medium">Change Photo</span>
                        </div>
                      </button>
                      
                      {/* Quick change button for editing mode */}
                      {isEditing && (
                        <button 
                          onClick={handleProfilePictureClick}
                          className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors shadow-lg"
                          title="Upload new picture"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Profile picture options */}
                    <div className="mb-4">
                      <button 
                        onClick={handleProfilePictureClick}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Change Profile Picture
                      </button>
                    </div>
                    
                    <h2 className="text-white text-xl font-semibold mb-2">{profileData.fullName}</h2>
                    <p className="text-green-400 text-sm mb-4">{profileData.status}</p>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>Member since January 2024</p>
                      <p>Last seen: Just now</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6 mt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleProfilePictureClick}
                      className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Upload New Photo</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Privacy Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
                      </svg>
                      <span>Export Chat Data</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Help & Support</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information - Rest of the component remains the same */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={profileData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      ) : (
                        <p className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">{profileData.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      ) : (
                        <p className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      ) : (
                        <p className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">{profileData.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                      {isEditing ? (
                        <select 
                          value={profileData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="Available" className="bg-gray-800">Available</option>
                          <option value="Busy" className="bg-gray-800">Busy</option>
                          <option value="Away" className="bg-gray-800">Away</option>
                          <option value="Do Not Disturb" className="bg-gray-800">Do Not Disturb</option>
                        </select>
                      ) : (
                        <p className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">{profileData.status}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                    {isEditing ? (
                      <textarea 
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Tell others about yourself..."
                      />
                    ) : (
                      <p className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3 min-h-[80px]">{profileData.bio}</p>
                    )}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-6">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                        Enable
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Email Notifications</h4>
                        <p className="text-gray-400 text-sm">Receive notifications about new messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Read Receipts</h4>
                        <p className="text-gray-400 text-sm">Let others know when you've read their messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                  <h3 className="text-red-400 text-lg font-semibold mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors text-red-400">
                      <div className="text-left">
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-red-300 text-sm">Permanently delete your account and all data</p>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
