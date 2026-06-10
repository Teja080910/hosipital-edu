import api from "../client";

export const videosApi = {
  list: () => api.get("/videos"),
  get: (id: string) => api.get(`/videos/${id}`),
  getProgress: (lessonId: string) => api.get(`/videos/progress/${lessonId}`),
  saveProgress: (lessonId: string, watchedSeconds: number, duration?: number) =>
    api.post(`/videos/progress/${lessonId}`, { watchedSeconds, duration }),
};