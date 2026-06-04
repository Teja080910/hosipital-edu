import api from "../client";

export const calendarApi = {
  list: (params: { startDate: string; endDate: string }) =>
    api.get("/calendar", { params }),
  create: (data: Record<string, unknown>) => api.post("/calendar", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/calendar/${id}`, data),
  remove: (id: string) => api.delete(`/calendar/${id}`),
};