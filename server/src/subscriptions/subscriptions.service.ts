import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import {
  subscriptionPlans,
  userSubscriptions,
  payments,
  users,
  userCourseEnrollments,
  courses,
} from "../database/schema";
import { eq, and, gt, sql, isNull } from "drizzle-orm";
import { STRIPE } from "./stripe.provider";
import Stripe from "stripe";
import { MailService } from "../mail/mail.service";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    @Inject(STRIPE) private stripe: Stripe,
    private config: ConfigService,
    private mailService: MailService,
    private i18n: I18nService,
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;
    const [plan] = await this.db
      .select()
      .from(subscriptionPlans)
      .where(and(eq(subscriptionPlans.id, id), eq(subscriptionPlans.isActive, true)))
      .limit(1);
    return plan;
  }

  async createPlan(data: any) {
    const [plan] = await this.db.insert(subscriptionPlans).values(stripTimestamps(data)).returning();
    return plan;
  }

  async updatePlan(id: string, data: any) {
    const [plan] = await this.db
      .update(subscriptionPlans)
      .set({ ...stripTimestamps(data), updatedAt: new Date() })
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

  async createCheckoutSession(userId: string, planId: string, locale: string = "en") {
    const plan = await this.findPlanById(planId);
    if (!plan) throw new HttpException(this.i18n.t("subscriptions.planNotFound"), HttpStatus.NOT_FOUND);

    let stripePriceId = plan.stripePriceId;
    if (!stripePriceId) {
      const result = await this.createStripeProductAndPrice(plan);
      stripePriceId = result.priceId;
      await this.updatePlan(plan.id, { stripePriceId });
    }

    const existingSub = await this.getUserSubscription(userId);
    const appUrl = this.config.get<string>("APP_URL");

    if (existingSub?.stripeSubscriptionId) {
      const stripeSub = await this.stripe.subscriptions.retrieve(existingSub.stripeSubscriptionId);
      const currentItemId = stripeSub.items?.data?.[0]?.id;

      if (currentItemId) {
        await this.stripe.subscriptions.update(existingSub.stripeSubscriptionId, {
          items: [{ id: currentItemId, price: stripePriceId }],
          proration_behavior: "create_prorations",
          metadata: { planId: plan.id },
        });
      } else {
        await this.stripe.subscriptions.update(existingSub.stripeSubscriptionId, {
          items: [{ price: stripePriceId }],
          proration_behavior: "create_prorations",
          metadata: { planId: plan.id },
        });
      }

      await this.db
        .update(userSubscriptions)
        .set({
          planId: plan.id,
          remainingExamAttempts: plan.maxExamAttempts,
          remainingFlashcardAttempts: plan.maxFlashcardAttempts,
          remainingUses: plan.maxUses,
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.id, existingSub.id));

      return { url: `${appUrl}/${locale}/dashboard`, prorated: true };
    }

    let session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: stripePriceId, quantity: 1 }],
        client_reference_id: userId,
        metadata: { planId: plan.id },
        success_url: `${appUrl}/${locale}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/${locale}/dashboard/subscribe`,
      });
    } catch (err: any) {
      if (err?.code === "resource_missing" && err?.param === "line_items[0][price]") {
        const result = await this.createStripeProductAndPrice(plan);
        await this.updatePlan(plan.id, { stripePriceId: result.priceId });
        session = await this.stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: result.priceId, quantity: 1 }],
          client_reference_id: userId,
          metadata: { planId: plan.id },
          success_url: `${appUrl}/${locale}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/${locale}/dashboard/subscribe`,
        });
      } else {
        throw err;
      }
    }

    await this.db.insert(payments).values({
      userId,
      stripePaymentIntentId: session.id,
      amount: parseFloat(plan.price),
      currency: plan.currency || "USD",
      status: "pending",
      description: this.i18n.t("subscriptions.descriptionTemplate", { name: plan.name?.en || "Subscription", interval: plan.interval }),
    });

    return { url: session.url };
  }

  async confirmCheckout(sessionId: string, userId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== userId) {
      throw new HttpException(this.i18n.t("subscriptions.sessionOwnershipMismatch"), HttpStatus.FORBIDDEN);
    }
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return { status: "pending" };
    }
    const planId = session.metadata?.planId;
    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;
    if (!planId || !stripeSubscriptionId || !stripeCustomerId) {
      return { status: "incomplete" };
    }
    await this.activateSubscription({ userId, planId, stripeSubscriptionId, stripeCustomerId });
    return { status: "active" };
  }

  async activateSubscription(data: {
    userId: string;
    planId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
  }) {
    const plan = await this.findPlanById(data.planId);
    if (!plan) throw new Error(this.i18n.t("subscriptions.planNotFound"));

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.maxDays) {
      periodEnd.setDate(periodEnd.getDate() + plan.maxDays);
    } else if (plan.interval === "year") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (plan.interval === "quarter") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    return this.db.transaction(async (tx: any) => {
      await tx
        .update(userSubscriptions)
        .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(userSubscriptions.userId, data.userId),
            eq(userSubscriptions.status, "active"),
          ),
        );

      const [existing] = await tx
        .select({ id: userSubscriptions.id })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
        .limit(1);

      let sub;
      if (existing) {
        [sub] = await tx
          .update(userSubscriptions)
          .set({
            planId: data.planId,
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            canceledAt: null,
            remainingExamAttempts: plan.maxExamAttempts,
            remainingFlashcardAttempts: plan.maxFlashcardAttempts,
            remainingUses: plan.maxUses,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.id, existing.id))
          .returning();
      } else {
        [sub] = await tx
          .insert(userSubscriptions)
          .values({
            userId: data.userId,
            planId: data.planId,
            stripeSubscriptionId: data.stripeSubscriptionId,
            stripeCustomerId: data.stripeCustomerId,
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            remainingExamAttempts: plan.maxExamAttempts,
            remainingFlashcardAttempts: plan.maxFlashcardAttempts,
            remainingUses: plan.maxUses,
          })
          .returning();
      }

      const [user] = await tx
        .select()
        .from(users)
        .where(and(eq(users.id, data.userId), isNull(users.deletedAt)))
        .limit(1);

      if (user) {
        const planName = typeof plan.name === "object" ? plan.name?.en || plan.name : plan.name;
        await this.mailService.sendSubscriptionConfirmed(user.email, user.name, {
          name: planName,
          amount: plan.price,
          interval: plan.interval,
        });

        if (!plan.isCourseOnly && user.accountType === "course_only") {
          await tx
            .update(users)
            .set({ accountType: "full", updatedAt: new Date() })
            .where(eq(users.id, data.userId));
        }
      }

      return sub;
    });
  }

  private async createStripeProductAndPrice(plan: any) {
    const product = await this.stripe.products.create({
      name: plan.name?.en || "Subscription",
      metadata: { planId: plan.id },
    });
    const price = await this.stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(plan.price) * 100),
      currency: plan.currency?.toLowerCase() || "usd",
      recurring: {
        interval: plan.interval === "year" ? "year" : "month",
        interval_count: plan.interval === "quarter" ? 3 : 1,
      },
    });
    return { productId: product.id, priceId: price.id };
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

    if (!sub) throw new HttpException(this.i18n.t("subscriptions.noActiveSubscription"), HttpStatus.NOT_FOUND);

    if (sub.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (user) {
      await this.mailService.sendSubscriptionCancelled(user.email, user.name);
    }

    const [updated] = await this.db
      .update(userSubscriptions)
      .set({ status: "cancelling", canceledAt: new Date(), updatedAt: new Date() })
      .where(eq(userSubscriptions.id, sub.id))
      .returning();
    return updated;
  }
  // In-memory dedup set — not shared across instances; use Redis or DB for multi-instance setups
  private processedEvents = new Set<string>();
  private readonly EVENT_TTL_MS = 60 * 60 * 1000; // 1 hour
  private lastCleanup = Date.now();

  private cleanupProcessedEvents() {
    if (Date.now() - this.lastCleanup < this.EVENT_TTL_MS) return;
    this.processedEvents.clear();
    this.lastCleanup = Date.now();
  }

  async handleWebhook(event: any) {
    this.cleanupProcessedEvents();
    if (this.processedEvents.has(event.id)) {
      return;
    }
    this.processedEvents.add(event.id);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id;
          const stripeSubscriptionId = session.subscription as string;
          const stripeCustomerId = session.customer as string;
          const planId = session.metadata?.planId;
          const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

          await this.db
            .update(payments)
            .set({ status: "completed", stripePaymentIntentId: paymentIntent })
            .where(eq(payments.stripePaymentIntentId, session.id));

          if (session.metadata?.type === "course_enrollment") {
            const courseId = session.metadata?.courseId;
            if (userId && courseId) {
              const [course] = await this.db
                .select()
                .from(courses)
                .where(eq(courses.id, courseId))
                .limit(1);
              if (course) {
                const [existingEnrollment] = await this.db
                  .select({ id: userCourseEnrollments.id })
                  .from(userCourseEnrollments)
                  .where(
                    and(
                      eq(userCourseEnrollments.userId, userId),
                      eq(userCourseEnrollments.courseId, courseId),
                    ),
                  )
                  .limit(1);
                if (!existingEnrollment) {
                  await this.db.insert(userCourseEnrollments).values({
                    userId,
                    courseId,
                    stripePaymentId: session.id,
                    accessExpiresAt: new Date(Date.now() + (course.durationDays || 365) * 86400000),
                  });
                }
              }
            }
            return;
          } else if (planId && userId && stripeSubscriptionId) {
            await this.activateSubscription({
              userId,
              planId,
              stripeSubscriptionId,
              stripeCustomerId,
            });
          } else if (session.line_items?.data?.[0]?.price?.id && userId && stripeSubscriptionId) {
            const [plan] = await this.db
              .select()
              .from(subscriptionPlans)
              .where(eq(subscriptionPlans.stripePriceId, session.line_items.data[0].price.id))
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
            const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : undefined;

            const [existingSub] = await this.db
              .select({ planId: userSubscriptions.planId })
              .from(userSubscriptions)
              .where(eq(userSubscriptions.stripeSubscriptionId, subId))
              .limit(1);

            if (existingSub) {
              const [plan] = await this.db
                .select()
                .from(subscriptionPlans)
                .where(eq(subscriptionPlans.id, existingSub.planId))
                .limit(1);

              await this.db
                .update(userSubscriptions)
                .set({
                  status: "active",
                  currentPeriodEnd: periodEnd,
                  remainingExamAttempts: plan?.maxExamAttempts ?? undefined,
                  remainingFlashcardAttempts: plan?.maxFlashcardAttempts ?? undefined,
                  remainingUses: plan?.maxUses ?? undefined,
                  updatedAt: new Date(),
                })
                .where(eq(userSubscriptions.stripeSubscriptionId, subId));
            }
          }
          break;
        }
        case "invoice.payment_failed": {
          const failedInvoice = event.data.object as Stripe.Invoice;
          const subId = typeof failedInvoice.subscription === "string"
            ? failedInvoice.subscription
            : failedInvoice.subscription?.id;
          if (subId) {
            await this.db
              .update(userSubscriptions)
              .set({ status: "past_due", updatedAt: new Date() })
              .where(eq(userSubscriptions.stripeSubscriptionId, subId));

            const [sub] = await this.db
              .select({ userId: userSubscriptions.userId })
              .from(userSubscriptions)
              .where(eq(userSubscriptions.stripeSubscriptionId, subId))
              .limit(1);
            if (sub) {
              const [usr] = await this.db
                .select()
                .from(users)
                .where(and(eq(users.id, sub.userId), isNull(users.deletedAt)))
                .limit(1);
              if (usr) {
                await this.mailService.sendPaymentFailed(usr.email, usr.name);
              }
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const deletedSub = event.data.object as Stripe.Subscription;
          if (deletedSub.id) {
            await this.db
              .update(userSubscriptions)
              .set({ status: "canceled", updatedAt: new Date() })
              .where(eq(userSubscriptions.stripeSubscriptionId, deletedSub.id));
          }
          break;
        }
      }
    } catch (err) {
      console.error("Webhook handler error:", err);
    }
  }
}