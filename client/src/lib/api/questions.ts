import api from "../client";

export const questionsApi = {
  list: (params?: Record<string, string | number>) => api.get("/questions", { params }),
  get: (id: string) => api.get(`/questions/${id}`),
  create: (data: Record<string, unknown>) => api.post("/questions", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/questions/${id}`, data),
  remove: (id: string) => api.delete(`/questions/${id}`),
};