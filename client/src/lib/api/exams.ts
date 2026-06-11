import api from "../client";

export const examsApi = {
  list: () => api.get("/exams"),
  get: (id: string) => api.get(`/exams/${id}`),
  create: (data: Record<string, unknown>) => api.post("/exams", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/exams/${id}`, data),
};

export const attemptsApi = {
  create: (data: { examId: string; mode: string; questionCount: number; timeLimit?: number; customTitle?: string }) =>
    api.post("/exam-attempts", data),
  list: () => api.get("/exam-attempts"),
  get: (id: string) => api.get(`/exam-attempts/${id}`),
  answer: (id: string, data: { questionId: string; selectedOptionId: string; timeSpent: number }) =>
    api.patch(`/exam-attempts/${id}/answer`, data),
  complete: (id: string) => api.patch(`/exam-attempts/${id}/complete`),
};