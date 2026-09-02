import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

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
            accessTokenRef.current = null;
            setAccessToken(null);
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(responseInterceptor);
  }, []);

  useEffect(() => {
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
        isAuthenticated,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
