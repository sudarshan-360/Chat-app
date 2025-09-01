import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to homepage
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  // If user is not authenticated, render the public component (login/signup)
  return children;
};

export default PublicRoute;