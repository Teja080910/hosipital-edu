import { Injectable, NotFoundException, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { DRIZZLE } from "../database/database.provider";
import {
  flashcards,
  userFlashcardReviews,
  users,
  userSubscriptions,
  subscriptionPlans,
} from "../database/schema";
import { eq, and, inArray, isNull, or, type SQL } from "drizzle-orm";

@Injectable()
export class FlashcardsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(filters: {
    examId?: string;
    specialtyId?: string;
    topicId?: string;
    page?: number;
    limit?: number;
  }, user?: any) {
    const { examId, specialtyId, topicId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const conditions = [eq(flashcards.isActive, true)];

    if (examId) conditions.push(or(eq(flashcards.examId, examId), isNull(flashcards.examId)) as SQL<unknown>);
    if (specialtyId) conditions.push(eq(flashcards.specialtyId, specialtyId));
    if (topicId) conditions.push(eq(flashcards.topicId, topicId));

    if (user && !examId) {
      const subExamId = await this.getSubscriptionExamId(user.id);
      if (subExamId) conditions.push(or(eq(flashcards.examId, subExamId), isNull(flashcards.examId)) as SQL<unknown>);
    }

    return this.db
      .select()
      .from(flashcards)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
  }

  async findDue(userId: string, limit = 20) {
    const subExamId = await this.getSubscriptionExamId(userId);
    const conditions = [
      eq(userFlashcardReviews.userId, userId),
      eq(flashcards.isActive, true),
    ];
    if (subExamId) conditions.push(or(eq(flashcards.examId, subExamId), isNull(flashcards.examId)) as SQL<unknown>);

    return this.db
      .select()
      .from(userFlashcardReviews)
      .innerJoin(
        flashcards,
        eq(flashcards.id, userFlashcardReviews.flashcardId),
      )
      .where(and(...conditions))
      .limit(limit);
  }

  async create(data: any) {
    const [card] = await this.db.insert(flashcards).values(stripTimestamps(data)).returning();
    return card;
  }

  async update(id: string, data: any) {
    const [card] = await this.db
      .update(flashcards)
      .set({ ...stripTimestamps(data), updatedAt: new Date() })
      .where(eq(flashcards.id, id))
      .returning();
    if (!card) throw new NotFoundException("Flashcard not found");
    return card;
  }

  async softDelete(id: string) {
    const [card] = await this.db
      .update(flashcards)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(flashcards.id, id))
      .returning();
    if (!card) throw new NotFoundException("Flashcard not found");
    return { message: "Flashcard deleted" };
  }

  async submitReview(data: {
    userId: string;
    flashcardId: string;
    quality: number;
  }) {
    const { userId, flashcardId, quality } = data;

    const [user] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isAdmin = user && (user.role === "admin" || user.role === "super_admin");

    if (!isAdmin) {
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

      if (!sub) {
        throw new HttpException("No active subscription found.", HttpStatus.FORBIDDEN);
      }

      if (sub.remainingFlashcardAttempts != null && sub.remainingFlashcardAttempts < 1) {
        throw new HttpException("No remaining flashcard attempts. Please upgrade your plan.", HttpStatus.FORBIDDEN);
      }

      await this.db
        .update(userSubscriptions)
        .set({ remainingFlashcardAttempts: sub.remainingFlashcardAttempts - 1 })
        .where(eq(userSubscriptions.id, sub.id));
    }

    const [existing] = await this.db
      .select()
      .from(userFlashcardReviews)
      .where(
        and(
          eq(userFlashcardReviews.userId, userId),
          eq(userFlashcardReviews.flashcardId, flashcardId),
        ),
      )
      .limit(1);

    const result = this.calculateSM2(
      quality,
      existing?.easeFactor || 250,
      existing?.interval || 0,
      existing?.repetitions || 0,
    );

    const now = new Date();
    const nextReviewAt = new Date(
      now.getTime() + result.interval * 24 * 60 * 60 * 1000,
    );

    if (existing) {
      const [review] = await this.db
        .update(userFlashcardReviews)
        .set({
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewAt,
          lastReviewedAt: now,
          updatedAt: now,
        })
        .where(eq(userFlashcardReviews.id, existing.id))
        .returning();
      return review;
    }

    const [review] = await this.db
      .insert(userFlashcardReviews)
      .values({
        userId,
        flashcardId,
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt,
        lastReviewedAt: now,
      })
      .returning();
    return review;
  }

  private calculateSM2(
    quality: number,
    easeFactor: number,
    interval: number,
    repetitions: number,
  ) {
    let newEF = easeFactor;
    let newInterval = interval;
    let newReps = repetitions;

    if (quality >= 3) {
      if (newReps === 0) newInterval = 1;
      else if (newReps === 1) newInterval = 6;
      else newInterval = Math.round(interval * (easeFactor / 100));
      newReps += 1;
    } else {
      newReps = 0;
      newInterval = 1;
    }

    newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 130) newEF = 130;

    return { easeFactor: Math.round(newEF), interval: newInterval, repetitions: newReps };
  }

  private async getSubscriptionExamId(userId: string): Promise<string | null> {
    const [sub] = await this.db
      .select({ examId: subscriptionPlans.examId })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
      .limit(1);
    return sub?.examId || null;
  }
}