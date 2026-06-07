import api from "../client";

export const analyticsApi = {
  userStats: () => api.get("/analytics/user-stats"),
  admin: () => api.get("/analytics/admin"),
};