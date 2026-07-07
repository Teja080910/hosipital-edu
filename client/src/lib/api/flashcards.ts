import api from "../client";

export const flashcardsApi = {
  list: (params?: Record<string, string | number>) => api.get("/flashcards", { params }),
  specialties: () => api.get("/flashcards/specialties"),
  due: (params?: Record<string, string | number>) => api.get("/flashcards/due", { params }),
  create: (data: Record<string, unknown>) => api.post("/flashcards", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/flashcards/${id}`, data),
  remove: (id: string) => api.delete(`/flashcards/${id}`),
  review: (id: string, quality: number) =>
    api.post(`/flashcards/${id}/review`, { quality }),
  examHistory: () => api.get("/flashcards/exam-history"),
  examHistoryDetail: (id: string) => api.get(`/flashcards/exam-history/${id}`),
  startExam: (data: { mode: string; questionCount: number; timeLimit?: number; customTitle?: string; specialtyId?: string; topicId?: string }) =>
    api.post("/flashcards/exam/start", data),
  answerExam: (id: string, data: { flashcardId: string; isCorrect: boolean }) =>
    api.patch(`/flashcards/exam/${id}/answer`, data),
  completeExam: (id: string) =>
    api.patch(`/flashcards/exam/${id}/complete`),
};