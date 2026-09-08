import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const accessTokenRef = useRef(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (accessTokenRef.current) {
        config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(requestInterceptor);
  }, []);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/user/refresh-token") &&
          !originalRequest.url?.includes("/api/user/login") &&
          !originalRequest.url?.includes("/api/user/signup")
        ) {
          originalRequest._retry = true;
          try {
            const { data } = await api.get("/api/user/refresh-token");
            accessTokenRef.current = data.access_token;
            setAccessToken(data.access_token);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return api(originalRequest);
          } catch (refreshError) {
            if (!window.location.pathname.includes("/auth/callback")) {
              accessTokenRef.current = null;
              setAccessToken(null);
              setUser(null);
            }
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(responseInterceptor);
  }, []);

  useEffect(() => {
    if (window.location.pathname.includes("/auth/callback")) {
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        const { data } = await api.get("/api/user/refresh-token");
        if (data?.access_token) {
          accessTokenRef.current = data.access_token;
          setAccessToken(data.access_token);

          try {
            const me = await api.get("/api/user/me", {
              headers: { Authorization: `Bearer ${data.access_token}` },
            });
            setUser(me.data);
          } catch {
            if (data?.user) {
              setUser(data.user);
            }
          }
        }
      } catch {
        accessTokenRef.current = null;
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signup = async (name, username, email, password) => {
    try {
      const { data } = await api.post("/api/user/signup", {
        name,
        username,
        email,
        password,
      });
      if (data?.access_token) {
        accessTokenRef.current = data.access_token;
        setAccessToken(data.access_token);
      }
      if (data?.user) {
        setUser(data.user);
      }
      return {
        success: true,
        data,
        message: data?.message || "Account created successfully",
      };
    } catch (error) {
      const detail = error.response?.data?.detail;
      const errorMsg =
        typeof detail === "string"
          ? detail
          : (Array.isArray(detail) ? detail[0]?.msg : null) ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Signup failed";
      return { success: false, error: errorMsg };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/api/user/login", credentials);
      accessTokenRef.current = data.access_token;
      setAccessToken(data.access_token);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      const detail = error.response?.data?.detail;
      const errorMsg =
        typeof detail === "string"
          ? detail
          : (Array.isArray(detail) ? detail[0]?.msg : null) ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Invalid credentials. Please check your username and password.";
      return { success: false, error: errorMsg };
    }
  };

  const loginWithToken = async (token) => {
    if (!token) {
      return { success: false, error: "No token provided" };
    }
    try {
      accessTokenRef.current = token;
      setAccessToken(token);

      // Extract user info from decoded JWT payload
      const payload = decodeJwt(token);
      let userData = payload?.user || null;

      try {
        const me = await api.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (me.data) {
          userData = me.data;
        }
      } catch (meError) {
        console.warn("Direct /api/user/me call note:", meError?.message);
      }

      if (userData) {
        setUser(userData);
        return { success: true, user: userData };
      }

      throw new Error("Unable to extract user profile from token");
    } catch (error) {
      console.error("loginWithToken error:", error);
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);
      return {
        success: false,
        error: error.message || "Failed to authenticate with token",
      };
    }
  };

  const isAuthenticated = Boolean(user && accessToken);

  const logout = async () => {
    try {
      await api.get("/api/user/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        signup,
        login,
        loginWithToken,
        isAuthenticated,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
