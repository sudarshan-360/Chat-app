import React from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Added missing import
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AuthSuccess from "./pages/AuthSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import assets from "./assets/assets";

const App = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${assets.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center", // Added for better background positioning
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Toaster position="top-center" /> {/* Added position prop for better UX */}
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/user/:userId" element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } />
        <Route path="/auth/success" element={<AuthSuccess />} />
      </Routes>
    </div>
  );
};
//route - single mapping from a URL path
//routes - container of all the pages

export default App;
