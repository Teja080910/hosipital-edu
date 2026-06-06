import api from "../client";

export const subscriptionsApi = {
  plans: () => api.get("/subscription-plans"),
  mySubscription: () => api.get("/subscriptions/my"),
  createCheckout: (planId: string) => api.post("/subscriptions/create-checkout", { planId }),
  cancel: () => api.post("/subscriptions/cancel"),
  createPlan: (data: Record<string, unknown>) => api.post("/subscription-plans", data),
  updatePlan: (id: string, data: Record<string, unknown>) => api.patch(`/subscription-plans/${id}`, data),
  removePlan: (id: string) => api.delete(`/subscription-plans/${id}`),
};