import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingContainer from "@/components/Landing/LandingContainer";
import SignupContainer from "@/components/Signup/Signup.jsx";
import LoginContainer from "@/components/Login/Login.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingContainer />} />
      <Route path="/signup" element={<SignupContainer />} />
      <Route path="/signin" element={<LoginContainer />} />
      <Route path="/login" element={<LoginContainer />} />
    </Routes>
  );
}

export default AppRoutes;