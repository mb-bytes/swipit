import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoutes";
import LandingContainer from "@/components/Landing/LandingContainer";
import SignupContainer from "@/components/Signup/Signup.jsx";
import LoginContainer from "@/components/Login/Login.jsx";
import AuthCallback from "@/components/Auth/AuthCallback.jsx";
import DashboardContainer from "@/components/Dashboard/DashboardContainer.jsx";
import Home from "@/components/Dashboard/Home/Home.jsx";
import NotFoundPage from "@/components/NotFound/NotFoundPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingContainer />} />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupContainer />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginContainer />
          </PublicRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
