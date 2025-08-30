import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import assets from "./assets/assets";

const App = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${assets.bgImage})`,
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
};
//route - single mapping from a URL path
//routes - container of all the pages

export default App;
