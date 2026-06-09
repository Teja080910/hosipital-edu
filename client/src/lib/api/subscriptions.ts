import api from "../client";

export const subscriptionsApi = {
  plans: () => api.get("/subscription-plans"),
  mySubscription: () => api.get("/subscriptions/my"),
  upgradePlans: () => api.get("/subscriptions/upgrade-plans"),
  subscribe: (planId: string) => api.post("/subscriptions/subscribe", { planId }),
  createCheckout: (planId: string, locale?: string) => api.post("/subscriptions/create-checkout", { planId, locale }),
  confirmCheckout: (sessionId: string) => api.post("/subscriptions/confirm-checkout", { sessionId }),
  cancel: () => api.post("/subscriptions/cancel"),
  createPlan: (data: Record<string, unknown>) => api.post("/subscription-plans", data),
  updatePlan: (id: string, data: Record<string, unknown>) => api.patch(`/subscription-plans/${id}`, data),
  removePlan: (id: string) => api.delete(`/subscription-plans/${id}`),
};