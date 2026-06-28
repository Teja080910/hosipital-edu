import api from "../client";

export const examsApi = {
  list: () => api.get("/exams"),
  subscribedList: () => api.get("/exams/subscribed"),
  get: (id: string) => api.get(`/exams/${id}`),
  create: (data: Record<string, unknown>) => api.post("/exams", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/exams/${id}`, data),
  // Specialty CRUD
  createSpecialty: (examId: string, data: Record<string, unknown>) => api.post(`/exams/${examId}/specialties`, data),
  updateSpecialty: (id: string, data: Record<string, unknown>) => api.patch(`/exams/specialties/${id}`, data),
  deleteSpecialty: (id: string) => api.delete(`/exams/specialties/${id}`),
  // Topic CRUD
  createTopic: (specialtyId: string, data: Record<string, unknown>) => api.post(`/exams/specialties/${specialtyId}/topics`, data),
  updateTopic: (id: string, data: Record<string, unknown>) => api.patch(`/exams/topics/${id}`, data),
  deleteTopic: (id: string) => api.delete(`/exams/topics/${id}`),
  // Subtopic CRUD
  createSubtopic: (topicId: string, data: Record<string, unknown>) => api.post(`/exams/topics/${topicId}/subtopics`, data),
  updateSubtopic: (id: string, data: Record<string, unknown>) => api.patch(`/exams/subtopics/${id}`, data),
  deleteSubtopic: (id: string) => api.delete(`/exams/subtopics/${id}`),
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
