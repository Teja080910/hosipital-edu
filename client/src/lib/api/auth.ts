import api from "../client";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginData) => api.post("/auth/login", data),
  register: (data: RegisterData) => api.post("/auth/register", data),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};