import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import LandingContainer from "@/components/Landing/LandingContainer";
import SignupContainer from "@/components/Signup/Signup.jsx";
import LoginContainer from "@/components/Login/Login.jsx";
import DashboardContainer from "@/components/Dashboard/DashboardContainer.jsx";
import Home from "@/components/Dashboard/Home/Home.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingContainer />} />
      <Route path="/signup" element={<SignupContainer />} />
      <Route path="/signin" element={<LoginContainer />} />
      <Route path="/login" element={<LoginContainer />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardContainer /></ProtectedRoute>}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;