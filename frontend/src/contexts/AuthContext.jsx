import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const accessTokenRef = useRef(null)

    useEffect(() => {
        accessTokenRef.current = accessToken
    }, [accessToken])

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use((config) => {
            if (accessTokenRef.current) {
                config.headers.Authorization = `Bearer ${accessTokenRef.current}`
            }
            return config
        })
        return () => api.interceptors.request.eject(requestInterceptor);
    }, [])

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (res) => res,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/api/user/refresh-token")) {
                    originalRequest._retry = true;
                    try {
                        const { data } = await api.get("/api/user/refresh-token");
                        setAccessToken(data.access_token);
                        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                        return api(originalRequest); // retry original request
                    } catch (refreshError) {
                        setAccessToken(null);
                        setUser(null);
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(responseInterceptor);
    }, []);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const { data } = await api.get("/api/user/refresh-token");
                setAccessToken(data.access_token);
                const me = await api.get("/api/user/me");
                setUser(me.data);
            } catch {
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
            const { data } = await api.post("/api/user/signup", { name, username, email, password });
            if (data?.user) {
                setUser(data.user);
            }
            return { success: true, data, message: data?.message || "Account created successfully" };
        } catch (error) {
            const detail = error.response?.data?.detail;
            const errorMsg = typeof detail === 'string'
                ? detail
                : (Array.isArray(detail) ? detail[0]?.msg : null)
                || error.response?.data?.message
                || error.response?.data?.error
                || 'Signup failed';
            return { success: false, error: errorMsg };
        }
    };

    const login = async (credentials) => {
        const { data } = await api.post("/api/user/login", credentials);
        setAccessToken(data.access_token);
        setUser(data.user);
    };

    const logout = async () => {
        await api.get("/api/user/logout");
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, signup, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}









