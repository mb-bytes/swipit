import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoutes";

// Eagerly loaded for instant initial render on critical paths
import LandingContainer from "@/components/Landing/LandingContainer";
import SignupContainer from "@/components/Signup/Signup.jsx";
import LoginContainer from "@/components/Login/Login.jsx";
import AuthCallback from "@/components/Auth/AuthCallback.jsx";
import NotFoundPage from "@/components/NotFound/NotFoundPage.jsx";

const ForgotPassword = lazy(
  () => import("@/components/Auth/ForgotPassword.jsx"),
);
const ResetPassword = lazy(() => import("@/components/Auth/ResetPassword.jsx"));
const DashboardContainer = lazy(
  () => import("@/components/Dashboard/DashboardContainer.jsx"),
);
const Home = lazy(() => import("@/components/Dashboard/Home/Home.jsx"));
const Spends = lazy(() => import("@/components/Dashboard/Spends/Spends.jsx"));
const TrackRewards = lazy(
  () => import("@/components/Dashboard/TrackRewards/TrackRewards.jsx"),
);
const Recommendations = lazy(
  () => import("@/components/Dashboard/Recommendations/Recommendations.jsx"),
);
const Profile = lazy(() => import("@/components/Profile/Profile.jsx"));
const Settings = lazy(() => import("@/components/Settings/Settings.jsx"));

function PageFallback() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f2eee5] text-[#111215]">
      <div className="w-8 h-8 rounded-full border-2 border-[#111215]/20 border-t-[#111215] animate-spin" />
      <p className="mt-3 text-xs font-mono tracking-widest text-[#111215]/60 uppercase">
        Loading...
      </p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardContainer />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Home />} />
          <Route path="/spends" element={<Spends />} />
          <Route path="/card-rewards" element={<TrackRewards />} />
          <Route path="/track-rewards" element={<TrackRewards />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
