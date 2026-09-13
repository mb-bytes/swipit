import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthVerification } from "@/components/Auth/AuthVerification";
import { sileo } from "sileo";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isLoggingOut } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoggingOut && !hasShownToast.current) {
      hasShownToast.current = true;
      sileo.error({
        title: "Please log in",
        description: "You need to be logged in to access this",
      });
    }
  }, [loading, isAuthenticated, isLoggingOut]);

  if (loading) return <AuthVerification />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthVerification />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}

export { ProtectedRoute, PublicRoute };
