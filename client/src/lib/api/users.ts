import api from "../client";

export const usersApi = {
  list: () => api.get("/users"),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
  changeRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
};