import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import { users, userSubscriptions, subscriptionPlans } from "../database/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private config: ConfigService,
  ) {}

  async findAll(page = 1, limit = 1000) {
    const offset = (page - 1) * limit;
    const items = await this.db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .limit(limit)
      .offset(offset);
    const [totalResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(isNull(users.deletedAt));
    return { items, total: Number(totalResult.count) };
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    return user;
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async softDelete(id: string) {
    const [user] = await this.db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException("User not found");
    return { message: "User deleted" };
  }

  async getReferralInfo(userId: string) {
    const [user] = await this.db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);
    if (!user) throw new NotFoundException("User not found");
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.referredBy, userId));
    return {
      referralCode: user.referralCode,
      referralUrl: `${this.config.get("APP_URL")}/register?ref=${user.referralCode}`,
      totalReferred: Number(result.count),
    };
  }

  async getSubscription(userId: string) {
    const [sub] = await this.db
      .select({
        id: userSubscriptions.id,
        planId: userSubscriptions.planId,
        status: userSubscriptions.status,
        currentPeriodStart: userSubscriptions.currentPeriodStart,
        currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        remainingExamAttempts: userSubscriptions.remainingExamAttempts,
        remainingFlashcardAttempts: userSubscriptions.remainingFlashcardAttempts,
        canceledAt: userSubscriptions.canceledAt,
        createdAt: userSubscriptions.createdAt,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          interval: subscriptionPlans.interval,
          price: subscriptionPlans.price,
        },
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);
    return sub || null;
  }

  async updateSubscription(userId: string, data: { planId?: string; status?: string; remainingExamAttempts?: number; remainingFlashcardAttempts?: number; currentPeriodEnd?: string }) {
    const [existing] = await this.db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (existing) {
      const updateData: any = { updatedAt: new Date() };
      if (data.planId !== undefined) updateData.planId = data.planId;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.remainingExamAttempts !== undefined) updateData.remainingExamAttempts = data.remainingExamAttempts;
      if (data.remainingFlashcardAttempts !== undefined) updateData.remainingFlashcardAttempts = data.remainingFlashcardAttempts;
      if (data.currentPeriodEnd !== undefined) updateData.currentPeriodEnd = new Date(data.currentPeriodEnd);
      const [updated] = await this.db
        .update(userSubscriptions)
        .set(updateData)
        .where(eq(userSubscriptions.id, existing.id))
        .returning();
      return updated;
    }

    if (data.planId) {
      const now = new Date();
      const periodEnd = data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const [created] = await this.db
        .insert(userSubscriptions)
        .values({
          userId,
          planId: data.planId,
          status: data.status || "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          remainingExamAttempts: data.remainingExamAttempts,
          remainingFlashcardAttempts: data.remainingFlashcardAttempts,
        })
        .returning();
      return created;
    }

    return null;
  }
}