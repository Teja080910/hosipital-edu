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
  checkAccess: (slug: string) => api.get(`/courses/check-access/${slug}`),
  getProgress: (slug: string) => api.get(`/courses/${slug}/progress`),
  getLessonQuiz: (slug: string, lessonId: string) => api.get(`/courses/${slug}/lessons/${lessonId}/quiz`),
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
  completeLesson: (slug: string, lessonId: string) =>
    api.post(`/courses/${slug}/lessons/${lessonId}/complete`),
  incompleteLesson: (slug: string, lessonId: string) =>
    api.post(`/courses/${slug}/lessons/${lessonId}/incomplete`),
  getComments: (slug: string) => api.get(`/courses/${slug}/comments`),
  addComment: (slug: string, data: { body: string; lessonId?: string; parentId?: string }) =>
    api.post(`/courses/${slug}/comments`, data),
  deleteComment: (commentId: string) => api.delete(`/courses/comments/${commentId}`),
  startQuiz: (quizId: string) => api.post("/courses/quiz-attempts", { quizId }),
  getQuizAttempts: () => api.get("/courses/quiz-attempts"),
  getQuizAttempt: (id: string) => api.get(`/courses/quiz-attempts/${id}`),
  submitQuiz: (id: string, answers: { questionIndex: number; selectedOptionIndex: number }[]) =>
    api.post(`/courses/quiz-attempts/${id}/submit`, { answers }),
  getPreTest: (slug: string) => api.get(`/courses/${slug}/pre-test`),
  getPostTest: (slug: string) => api.get(`/courses/${slug}/post-test`),
  getTestResults: (slug: string) => api.get(`/courses/${slug}/test-results`),
  adminGetQuiz: (courseId: string, type: string) => api.get(`/courses/${courseId}/quiz/${type}`),
  adminSaveQuiz: (courseId: string, data: { type: string; title: any; passingScore?: number; questions: any[] }) => api.post(`/courses/${courseId}/quiz`, data),
  adminDeleteQuiz: (courseId: string, type: string) => api.delete(`/courses/${courseId}/quiz/${type}`),
};