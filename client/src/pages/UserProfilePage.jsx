import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import assets from "../assets/assets";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchUserProfile = async (attempt = 0) => {
    if (!userId) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    // If trying to view own profile, redirect to profile page
    if (currentUser && userId === currentUser._id) {
      navigate('/profile');
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 second timeout
      
      const { data } = await API.get(`/users/profile/${userId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (data && data.success && data.user) {
        setUserProfile(data.user);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data?.message || "Invalid response from server");
      }
    } catch (err) {
      console.error(`Error fetching user profile (attempt ${attempt + 1}):`, err);
      
      let errorMessage = "Failed to load user profile";
      
      if (err.name === 'AbortError') {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        
        if (status === 404) {
          errorMessage = "User not found";
        } else if (status === 401) {
          errorMessage = "You don't have permission to view this profile";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      // Retry logic for network errors and server errors
      if (attempt < maxRetries && (err.request || (err.response && err.response.status >= 500))) {
        setRetryCount(attempt + 1);
        setTimeout(() => {
          fetchUserProfile(attempt + 1);
        }, (attempt + 1) * 500); // Linear backoff: 0.5s, 1s, 1.5s
        return;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId, currentUser, navigate]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchUserProfile();
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white mb-2">Loading profile...</p>
          {retryCount > 0 && (
            <p className="text-gray-300 text-sm">Retry attempt {retryCount} of {maxRetries}</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !userProfile) {
    return (
      <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Profile Unavailable</h3>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">{error || "User not found"}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <h1 className="text-white text-2xl font-semibold">{userProfile.fullName}'s Profile</h1>
            </div>
            <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
              Read Only
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={userProfile.profilePicture || assets.avatar_icon} 
                        alt={userProfile.fullName} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 mx-auto"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    
                    <h2 className="text-white text-xl font-semibold mb-2">{userProfile.fullName}</h2>
                    <p className="text-green-400 text-sm mb-4">{userProfile.status || "Available"}</p>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>Member since {formatDate(userProfile.createdAt)}</p>
                      <p>Last seen: Recently</p>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6 mt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Contact Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.906-1.298L3 21l1.298-5.094A9.863 9.863 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                      </svg>
                      <span>Send Message</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Voice Call</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Video Call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                      <div className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">
                        {userProfile.fullName}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                      <div className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">
                        {userProfile.email}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                      <div className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">
                        {userProfile.phone || "Not provided"}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                      <div className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3">
                        {userProfile.status || "Available"}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                    <div className="text-white bg-white/5 border border-gray-700 rounded-lg px-4 py-3 min-h-[80px]">
                      {userProfile.bio || "No bio available"}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-6">Account Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Member Since</h4>
                        <p className="text-gray-400 text-sm">{formatDate(userProfile.createdAt)}</p>
                      </div>
                      <div className="text-blue-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Account Status</h4>
                        <p className="text-gray-400 text-sm">Active user</p>
                      </div>
                      <div className="text-green-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
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

export default UserProfilePage;