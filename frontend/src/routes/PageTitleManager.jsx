import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ROUTE_TITLES = {
  "/": "SwipIt — Intelligent Credit Card Rewards & Spends Optimizer | Maximize Every Swipe",
  "/dashboard": "Dashboard — SwipIt",
  "/spends": "Spends — SwipIt",
  "/card-rewards": "Track Rewards — SwipIt",
  "/track-rewards": "Track Rewards — SwipIt",
  "/recommendations": "Recommendations — SwipIt",
  "/profile": "Profile — SwipIt",
  "/settings": "Settings — SwipIt",
  "/login": "Log In — SwipIt",
  "/signup": "Sign Up — SwipIt",
  "/forgot-password": "Forgot Password — SwipIt",
  "/reset-password": "Reset Password — SwipIt",
  "/auth/callback": "Authenticating — SwipIt",
  "/privacy": "Privacy Policy — SwipIt",
  "/terms": "Terms of Service — SwipIt",
  "/404": "Page Not Found — SwipIt",
};

export function getTitleForPath(pathname) {
  if (!pathname) return ROUTE_TITLES["/"];
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  if (ROUTE_TITLES[cleanPath]) {
    return ROUTE_TITLES[cleanPath];
  }

  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (route !== "/" && cleanPath.startsWith(`${route}/`)) {
      return title;
    }
  }

  return "Page Not Found — SwipIt";
}

export function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    document.title = getTitleForPath(location.pathname);
  }, [location.pathname]);

  return null;
}

export default PageTitleManager;
