import api from "../client";

export const parametersApi = {
  list: () => api.get("/public/parameters"),
  getPublic: (key: string) => api.get(`/public/parameters/${key}`),
  get: (key: string) => api.get(`/parameters/${key}`),
  create: (data: { key: string; value: any; description?: string }) => api.post("/parameters", data),
  update: (key: string, data: { value?: any; description?: string }) => api.patch(`/parameters/${key}`, data),
  remove: (key: string) => api.delete(`/parameters/${key}`),
};