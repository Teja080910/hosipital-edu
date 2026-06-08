import api from "../client";

export const streamApi = {
  getUploadUrl: () => api.post("/stream/upload-url"),
  listVideos: (search?: string) => api.get("/stream/videos", { params: { search } }),
  getVideo: (uid: string) => api.get(`/stream/videos/${uid}`),
  deleteVideo: (uid: string) => api.delete(`/stream/videos/${uid}`),
  getSignedToken: (uid: string) => api.post(`/stream/videos/${uid}/token`),
  listModules: () => api.get("/stream/modules"),
  getModule: (id: string) => api.get(`/stream/modules/${id}`),
  createModule: (data: any) => api.post("/stream/modules", data),
  updateModule: (id: string, data: any) => api.patch(`/stream/modules/${id}`, data),
  deleteModule: (id: string) => api.delete(`/stream/modules/${id}`),
  createLesson: (data: any) => api.post("/stream/lessons", data),
  updateLesson: (id: string, data: any) => api.patch(`/stream/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/stream/lessons/${id}`),
};