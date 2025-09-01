import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchProfile } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google Sign-In failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem('token', token);
        
        try {
          // Fetch user profile to update auth context
          await fetchProfile();
          toast.success('Successfully signed in with Google!');
          navigate('/');
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error('Authentication failed. Please try again.');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, fetchProfile]);

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 h-full flex items-center justify-center relative p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-blue-300 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-purple-300 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-10 w-12 h-12 bg-indigo-300 rounded-full blur-lg"></div>
        </div>

        {/* Loading Container */}
        <div className="w-full max-w-md mx-auto relative z-10">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            {/* Loading Spinner */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-white"></div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Signing you in...
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Please wait while we complete your Google Sign-In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;