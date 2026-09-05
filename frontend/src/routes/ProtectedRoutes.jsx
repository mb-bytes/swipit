import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthVerification } from "@/components/Auth/AuthVerification";
import { sileo } from "sileo";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthVerification />;

  if (!isAuthenticated) {
    sileo.error({
      title: "Please log in",
      description: "You need to be logged in to access this",
    });
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
