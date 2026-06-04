import api from "../client";

export const videosApi = {
  list: () => api.get("/videos"),
  get: (id: string) => api.get(`/videos/${id}`),
};