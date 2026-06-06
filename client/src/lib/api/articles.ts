import api from "../client";

export const articlesApi = {
  list: (params?: Record<string, string>) => api.get("/articles", { params }),
  get: (slug: string) => api.get(`/articles/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/articles", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/articles/${id}`, data),
  remove: (id: string) => api.delete(`/articles/${id}`),
};