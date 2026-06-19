import api from "../client";

export const testimonialsApi = {
  getAll: () => api.get("/testimonials"),
  getAllAdmin: () => api.get("/testimonials/admin"),
  create: (data: Record<string, unknown>) => api.post("/testimonials", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/testimonials/${id}`, data),
  remove: (id: string) => api.delete(`/testimonials/${id}`),
};
