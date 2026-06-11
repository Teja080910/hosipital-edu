import api from "../client";

export const usersApi = {
  list: (params?: Record<string, string>) => api.get("/users", { params }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
  changeRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  getReferral: (id: string) => api.get(`/users/${id}/referral`),
  getSubscription: (id: string) => api.get(`/users/${id}/subscription`),
  updateSubscription: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}/subscription`, data),
};