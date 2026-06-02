export type PlanInterval = "monthly" | "quarterly" | "annual";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "expired";
export type PaymentStatus = "succeeded" | "failed" | "refunded";

export interface SubscriptionPlanDto {
  id: string;
  stripePriceId: string;
  name: Record<string, string>;
  description: Record<string, string>;
  interval: PlanInterval;
  price: number;
  currency: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface UserSubscriptionDto {
  id: string;
  planId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlanDto;
}