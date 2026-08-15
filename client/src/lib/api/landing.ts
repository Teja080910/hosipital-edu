import api from "../client";

export const landingApi = {
  get: () => api.get("/landing"),
  getData: () => api.get("/landing-data"),
  updateSection: (section: string, config: Record<string, unknown>) =>
    api.put(`/landing/${section}`, config),
};
