import api from "../client";

export const certificatesApi = {
  list: () => api.get("/certificates"),
  get: (id: string) => api.get(`/certificates/${id}`),
  generate: (courseId: string) => api.post("/certificates/generate", { courseId }),
  verify: (hash: string) => api.get(`/certificates/verify/${hash}`),
};