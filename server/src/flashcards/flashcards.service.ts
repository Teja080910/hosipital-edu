import { Injectable, NotFoundException, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { getAccessibleExamId } from "../common/utils/access-helper";
import { DRIZZLE } from "../database/database.provider";
import {
  flashcards,
  flashcardExams,
  userFlashcardReviews,
  users,
  userSubscriptions,
  subscriptionPlans,
  specialties,
  topics,
} from "../database/schema";
import { eq, and, inArray, isNull, or, count, sql, lte, type SQL } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class FlashcardsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

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

    const isAdmin = user && (user.role === "admin" || user.role === "super_admin");

    if (!isAdmin) {
      let subExamId: string | null = null;
      if (user) {
        subExamId = await this.getSubscriptionExamId(user.id);
      }

      if (subExamId) {
        const subFIds = await this.db
          .select({ flashcardId: flashcardExams.flashcardId })
          .from(flashcardExams)
          .where(eq(flashcardExams.examId, subExamId));
        const subIds = subFIds.map((r: any) => r.flashcardId);
        conditions.push(inArray(flashcards.id, subIds));
        if (examId && examId !== subExamId) {
          return { data: [], total: 0, page, limit };
        }
      } else if (user?.targetExamId) {
        const targetFIds = await this.db
          .select({ flashcardId: flashcardExams.flashcardId })
          .from(flashcardExams)
          .where(eq(flashcardExams.examId, user.targetExamId));
        const targetIds = targetFIds.map((r: any) => r.flashcardId);
        conditions.push(inArray(flashcards.id, targetIds));
      } else {
        return { data: [], total: 0, page, limit };
      }
    } else if (examId) {
      const examFIds = await this.db
        .select({ flashcardId: flashcardExams.flashcardId })
        .from(flashcardExams)
        .where(eq(flashcardExams.examId, examId));
      const eIds = examFIds.map((r: any) => r.flashcardId);
      conditions.push(inArray(flashcards.id, eIds));
    }

    if (specialtyId) conditions.push(eq(flashcards.specialtyId, specialtyId));
    if (topicId) conditions.push(eq(flashcards.topicId, topicId));

    const where = and(...conditions);

    const [totalResult] = await this.db
      .select({ total: count() })
      .from(flashcards)
      .where(where);

    const rows = await this.db
      .select({
        id: flashcards.id,
        front: flashcards.front,
        back: flashcards.back,
        reference: flashcards.reference,
        examId: flashcards.examId,
        specialtyId: flashcards.specialtyId,
        topicId: flashcards.topicId,
        isActive: flashcards.isActive,
        createdBy: flashcards.createdBy,
        createdAt: flashcards.createdAt,
        updatedAt: flashcards.updatedAt,
        specialty: specialties.name,
        topic: topics.name,
      })
      .from(flashcards)
      .leftJoin(specialties, eq(flashcards.specialtyId, specialties.id))
      .leftJoin(topics, eq(flashcards.topicId, topics.id))
      .where(where)
      .limit(limit)
      .offset(offset);

    const fIds = rows.map((r: any) => r.id);
    const allExamLinks = fIds.length
      ? await this.db
          .select()
          .from(flashcardExams)
          .where(inArray(flashcardExams.flashcardId, fIds))
      : [];

    const examIdsByF = new Map<string, string[]>();
    for (const link of allExamLinks) {
      if (!examIdsByF.has(link.flashcardId)) examIdsByF.set(link.flashcardId, []);
      examIdsByF.get(link.flashcardId)!.push(link.examId);
    }

    return {
      data: rows.map((r: any) => ({ ...r, examIds: examIdsByF.get(r.id) || [] })),
      total: totalResult?.total ?? 0,
      page,
      limit,
    };
  }

  async findDue(userId: string, limit = 20) {
    const subExamId = await this.getSubscriptionExamId(userId);
    const now = new Date();
    const conditions = [
      eq(userFlashcardReviews.userId, userId),
      eq(flashcards.isActive, true),
      lte(userFlashcardReviews.nextReviewAt, now),
    ];
    if (subExamId) {
      const subFIds = await this.db
        .select({ flashcardId: flashcardExams.flashcardId })
        .from(flashcardExams)
        .where(eq(flashcardExams.examId, subExamId));
      const subIds = subFIds.map((r: any) => r.flashcardId);
      conditions.push(inArray(flashcards.id, subIds));
    } else {
      const [user] = await this.db
        .select({ targetExamId: users.targetExamId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (user?.targetExamId) {
        const targetFIds = await this.db
          .select({ flashcardId: flashcardExams.flashcardId })
          .from(flashcardExams)
          .where(eq(flashcardExams.examId, user.targetExamId));
        const targetIds = targetFIds.map((r: any) => r.flashcardId);
        conditions.push(inArray(flashcards.id, targetIds));
      } else {
        return [];
      }
    }

    return this.db
      .select({
        id: flashcards.id,
        front: flashcards.front,
        back: flashcards.back,
        reference: flashcards.reference,
        specialtyId: flashcards.specialtyId,
        topicId: flashcards.topicId,
        specialty: specialties.name,
        topic: topics.name,
      })
      .from(userFlashcardReviews)
      .innerJoin(
        flashcards,
        eq(flashcards.id, userFlashcardReviews.flashcardId),
      )
      .leftJoin(specialties, eq(flashcards.specialtyId, specialties.id))
      .leftJoin(topics, eq(flashcards.topicId, topics.id))
      .where(and(...conditions))
      .limit(limit);
  }

  async create(data: any) {
    const { examIds, ...cardData } = data;
    const [card] = await this.db.insert(flashcards).values(stripTimestamps(cardData)).returning();
    if (examIds?.length) {
      await this.db
        .insert(flashcardExams)
        .values(examIds.map((eId: string) => ({ flashcardId: card.id, examId: eId })));
    }
    return card;
  }

  async update(id: string, data: any) {
    const { examIds, ...cardData } = data;
    const [card] = await this.db
      .update(flashcards)
      .set({ ...stripTimestamps(cardData), updatedAt: new Date() })
      .where(eq(flashcards.id, id))
      .returning();
    if (!card) throw new NotFoundException(this.i18n.t("flashcards.notFound"));

    if (examIds) {
      await this.db
        .delete(flashcardExams)
        .where(eq(flashcardExams.flashcardId, id));
      if (examIds.length > 0) {
        await this.db
          .insert(flashcardExams)
          .values(examIds.map((eId: string) => ({ flashcardId: id, examId: eId })));
      }
    }

    return card;
  }

  async softDelete(id: string) {
    const [card] = await this.db
      .update(flashcards)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(flashcards.id, id))
      .returning();
    if (!card) throw new NotFoundException(this.i18n.t("flashcards.notFound"));
    return { message: this.i18n.t("flashcards.deleted") };
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
        throw new HttpException(this.i18n.t("exams.noActiveSubscription"), HttpStatus.FORBIDDEN);
      }

      const [plan] = await this.db
        .select({ examId: subscriptionPlans.examId })
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, sub.planId))
        .limit(1);

      if (plan?.examId) {
        const [link] = await this.db
          .select()
          .from(flashcardExams)
          .where(and(eq(flashcardExams.flashcardId, flashcardId), eq(flashcardExams.examId, plan.examId)))
          .limit(1);
        if (!link) {
          throw new HttpException("Flashcard not found for your subscription.", HttpStatus.FORBIDDEN);
        }
      }

      if (sub.remainingFlashcardAttempts != null && sub.remainingFlashcardAttempts < 1) {
        throw new HttpException(this.i18n.t("flashcards.noRemainingAttempts"), HttpStatus.FORBIDDEN);
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

  async getSpecialties(userId: string) {
    const [user] = await this.db
      .select({ role: users.role, targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isAdmin = user && (user.role === "admin" || user.role === "super_admin");

    let subExamId: string | null = null;
    if (!isAdmin) {
      subExamId = await this.getSubscriptionExamId(userId);
      if (!subExamId) {
        subExamId = user?.targetExamId || null;
      }
    }

    let query = this.db
      .select({
        id: specialties.id,
        name: specialties.name,
      })
      .from(specialties);

    if (subExamId) {
      query = query.where(eq(specialties.examId, subExamId));
    }

    const rows = await query;

    rows.sort((a, b) => (a.name?.en ?? "").localeCompare(b.name?.en ?? ""));

    return rows;
  }

  private async getSubscriptionExamId(userId: string): Promise<string | null> {
    const examId = await getAccessibleExamId(this.db, userId);
    if (examId) return examId;

    const [user] = await this.db
      .select({ targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.targetExamId || null;
  }
}