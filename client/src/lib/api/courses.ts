import api from "../client";

export const coursesApi = {
  list: (all?: boolean) => api.get("/courses", { params: all ? { all: "true" } : undefined }),
  get: (slug: string) => api.get(`/courses/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/courses", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/courses/${id}`, data),
  remove: (id: string) => api.delete(`/courses/${id}`),
  enroll: (slug: string, stripePaymentId?: string) =>
    api.post(`/courses/${slug}/enroll`, { stripePaymentId }),
  checkEnrollment: (slug: string) => api.get(`/courses/check-enrollment/${slug}`),
  getProgress: (slug: string) => api.get(`/courses/${slug}/progress`),
  createModule: (courseId: string, data: { title: any; description?: any; sortOrder?: number }) =>
    api.post(`/courses/${courseId}/modules`, data),
  updateModule: (moduleId: string, data: { title?: any; description?: any; sortOrder?: number }) =>
    api.patch(`/courses/modules/${moduleId}`, data),
  deleteModule: (moduleId: string) => api.delete(`/courses/modules/${moduleId}`),
  createLesson: (moduleId: string, data: { title: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) =>
    api.post(`/courses/modules/${moduleId}/lessons`, data),
  updateLesson: (lessonId: string, data: { title?: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) =>
    api.patch(`/courses/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) => api.delete(`/courses/lessons/${lessonId}`),
};