import api from "../client";

export const leadsApi = {
  create: (data: { email: string; name?: string; source?: string; locale?: string }) =>
    api.post("/leads", data),
};
