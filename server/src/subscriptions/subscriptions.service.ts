import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  subscriptionPlans,
  userSubscriptions,
  payments,
} from "../database/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findPlans(visibleOnly = true) {
    const conditions = [eq(subscriptionPlans.isActive, true)];
    if (visibleOnly) conditions.push(eq(subscriptionPlans.isVisible, true));
    return this.db
      .select()
      .from(subscriptionPlans)
      .where(and(...conditions));
  }

  async findPlanById(id: string) {
    const [plan] = await this.db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .limit(1);
    return plan;
  }

  async createPlan(data: any) {
    const [plan] = await this.db.insert(subscriptionPlans).values(data).returning();
    return plan;
  }

  async updatePlan(id: string, data: any) {
    const [plan] = await this.db
      .update(subscriptionPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  async softDeletePlan(id: string) {
    const [plan] = await this.db
      .update(subscriptionPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  async getUserSubscription(userId: string) {
    const [sub] = await this.db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);
    return sub;
  }

  async createCheckoutSession(userId: string, planId: string) {
    const plan = await this.findPlanById(planId);
    if (!plan) throw new Error("Plan not found");
    return { url: `/checkout/${planId}`, planId };
  }

  async createSubscription(data: any) {
    const [sub] = await this.db
      .insert(userSubscriptions)
      .values(data)
      .returning();
    return sub;
  }

  async cancelSubscription(userId: string) {
    const [sub] = await this.db
      .update(userSubscriptions)
      .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .returning();
    return sub;
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await this.db.insert(payments).values({
          userId: session.client_reference_id,
          stripePaymentIntentId: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: "completed",
        });
        break;
      }
      case "invoice.payment_succeeded": {
        break;
      }
    }
  }
}