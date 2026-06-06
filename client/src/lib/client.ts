import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
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
          window.location.href = "/en/login";
        }
      } else {
        window.location.href = "/en/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;