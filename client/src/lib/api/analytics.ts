import api from "../client";

export const analyticsApi = {
  userStats: () => api.get("/analytics/user-stats"),
  admin: () => api.get("/analytics/admin"),
  progress: () => api.get("/analytics/progress"),
  adminDau: (days = 30) => api.get("/analytics/admin/dau", { params: { days } }),
  adminMau: (months = 12) => api.get("/analytics/admin/mau", { params: { months } }),
  adminRetention: () => api.get("/analytics/admin/retention"),
  adminUserGrowth: (days = 30) => api.get("/analytics/admin/user-growth", { params: { days } }),
  adminExamCompletion: () => api.get("/analytics/admin/exam-completion"),
  adminRecentActivity: (limit = 10) => api.get("/analytics/admin/recent-activity", { params: { limit } }),
};