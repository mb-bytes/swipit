import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthVerification } from "@/components/Auth/AuthVerification";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthVerification />;

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

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
