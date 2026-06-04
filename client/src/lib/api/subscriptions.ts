import api from "../client";

export const subscriptionsApi = {
  plans: () => api.get("/subscription-plans"),
  mySubscription: () => api.get("/subscriptions/my"),
  createCheckout: (planId: string) => api.post("/subscriptions/create-checkout", { planId }),
  cancel: () => api.post("/subscriptions/cancel"),
};