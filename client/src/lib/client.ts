import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Routes that require authentication — 401s here should redirect to login
const PROTECTED_ROUTES = ["/dashboard"];

const isProtectedRoute = () => {
  if (typeof window === "undefined") return false;
  return PROTECTED_ROUTES.some((route) =>
    window.location.pathname.includes(route)
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Never redirect for these endpoints — they handle auth state themselves
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          useAuthStore.getState().setTokens(
            data.access_token ?? data.accessToken,
            data.refresh_token ?? data.refreshToken
          );
          originalRequest.headers.Authorization = `Bearer ${data.access_token ?? data.accessToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().clearTokens();
          // Only force navigate to login if on a protected page
          if (isProtectedRoute()) {
            const locale = window.location.pathname.split("/")[1] || "en";
            window.location.href = `/${locale}/login`;
          }
        }
      } else {
        // No refresh token — only redirect if on a protected page
        if (isProtectedRoute()) {
          const locale = window.location.pathname.split("/")[1] || "en";
          window.location.href = `/${locale}/login`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;