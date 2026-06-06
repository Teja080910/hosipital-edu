import api from "../client";

export const coursesApi = {
  list: (all?: boolean) => api.get("/courses", { params: all ? { all: "true" } : undefined }),
  get: (slug: string) => api.get(`/courses/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/courses", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/courses/${id}`, data),
  remove: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string, stripePaymentId?: string) =>
    api.post(`/courses/${id}/enroll`, { stripePaymentId }),
};