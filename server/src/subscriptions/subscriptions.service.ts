import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import {
  subscriptionPlans,
  userSubscriptions,
  payments,
} from "../database/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { STRIPE } from "./stripe.provider";
import Stripe from "stripe";

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    @Inject(STRIPE) private stripe: Stripe,
    private config: ConfigService,
  ) {}

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
      .select({
        id: userSubscriptions.id,
        userId: userSubscriptions.userId,
        planId: userSubscriptions.planId,
        stripeSubscriptionId: userSubscriptions.stripeSubscriptionId,
        stripeCustomerId: userSubscriptions.stripeCustomerId,
        status: userSubscriptions.status,
        currentPeriodStart: userSubscriptions.currentPeriodStart,
        currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        canceledAt: userSubscriptions.canceledAt,
        createdAt: userSubscriptions.createdAt,
        updatedAt: userSubscriptions.updatedAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          interval: subscriptionPlans.interval,
          price: subscriptionPlans.price,
          currency: subscriptionPlans.currency,
          sortOrder: subscriptionPlans.sortOrder,
        },
      })
      .from(userSubscriptions)
      .innerJoin(
        subscriptionPlans,
        eq(userSubscriptions.planId, subscriptionPlans.id),
      )
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);
    return sub;
  }

  async getUpgradePlans(userId: string) {
    const sub = await this.getUserSubscription(userId);
    if (!sub) return this.findPlans(true);
    const currentSortOrder = (sub.plan as any)?.sortOrder ?? 0;
    return this.db
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.isActive, true),
          eq(subscriptionPlans.isVisible, true),
          gt(subscriptionPlans.sortOrder, currentSortOrder),
        ),
      )
      .orderBy(subscriptionPlans.sortOrder);
  }

  async createCheckoutSession(userId: string, planId: string) {
    const plan = await this.findPlanById(planId);
    if (!plan) throw new HttpException("Plan not found", HttpStatus.NOT_FOUND);

    if (!plan.stripePriceId) {
      const product = await this.stripe.products.create({
        name: plan.name?.en || "Subscription",
        metadata: { planId: plan.id },
      });
      const stripePrice = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(parseFloat(plan.price) * 100),
        currency: plan.currency?.toLowerCase() || "usd",
        recurring: {
          interval: plan.interval === "year" ? "year" : plan.interval === "quarter" ? "month" : "month",
          interval_count: plan.interval === "quarter" ? 3 : 1,
        },
      });
      await this.updatePlan(plan.id, { stripePriceId: stripePrice.id });
      plan.stripePriceId = stripePrice.id;
    }

    let appUrl = this.config.get<string>("APP_URL")
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: userId,
      success_url: `${appUrl}/en/dashboard?checkout=success`,
      cancel_url: `${appUrl}/en/dashboard/subscribe`,
    });

    await this.db.insert(payments).values({
      userId,
      stripePaymentIntentId: session.id,
      amount: parseFloat(plan.price),
      currency: plan.currency || "USD",
      status: "pending",
      description: `${plan.name?.en || "Subscription"} - ${plan.interval}`,
    });

    return { url: session.url };
  }

  async activateSubscription(data: {
    userId: string;
    planId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
  }) {
    const plan = await this.findPlanById(data.planId);
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === "year") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (plan.interval === "quarter") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const [sub] = await this.db
      .insert(userSubscriptions)
      .values({
        userId: data.userId,
        planId: data.planId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      })
      .returning();
    return sub;
  }

  async cancelSubscription(userId: string) {
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

    if (!sub) throw new HttpException("No active subscription", HttpStatus.NOT_FOUND);

    if (sub.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const [updated] = await this.db
      .update(userSubscriptions)
      .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
      .where(eq(userSubscriptions.id, sub.id))
      .returning();
    return updated;
  }

  async handleWebhook(event: any) {

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;
        const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

        await this.db
          .update(payments)
          .set({
            status: "completed",
            stripePaymentIntentId: paymentIntent,
          })
          .where(eq(payments.stripePaymentIntentId, session.id));

        const lineItem = session.line_items?.data?.[0];
        if (lineItem?.price?.id && userId && stripeSubscriptionId) {
          const [plan] = await this.db
            .select()
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.stripePriceId, lineItem.price.id))
            .limit(1);

          if (plan) {
            await this.activateSubscription({
              userId,
              planId: plan.id,
              stripeSubscriptionId,
              stripeCustomerId,
            });
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
          await this.db
            .update(userSubscriptions)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(userSubscriptions.stripeSubscriptionId, subId));
        }
        break;
      }
    }
  }
}