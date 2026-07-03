import { Injectable, NotFoundException, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { getAccessibleExamId } from "../common/utils/access-helper";
import { DRIZZLE } from "../database/database.provider";
import {
  flashcards,
  flashcardExams,
  flashcardExamAttempts,
  flashcardExamAnswers,
  userFlashcardReviews,
  users,
  userSubscriptions,
  subscriptionPlans,
  specialties,
  topics,
} from "../database/schema";
import { eq, and, inArray, notInArray, isNull, count, sql, lte, ne, type SQL } from "drizzle-orm";
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
      if (user) {
        const [u] = await this.db
          .select({ accountType: users.accountType })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        if (u?.accountType === "course_only") {
          return { data: [], total: 0, page, limit };
        }
      }
      const [sub] = await this.db
        .select({ planId: userSubscriptions.planId })
        .from(userSubscriptions)
        .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
        .limit(1);
      if (sub) {
        const [plan] = await this.db
          .select({ maxFlashcards: subscriptionPlans.maxFlashcards, maxFlashcardAttempts: subscriptionPlans.maxFlashcardAttempts })
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, sub.planId))
          .limit(1);
        if (plan && plan.maxFlashcards == null && plan.maxFlashcardAttempts == null) {
          return { data: [], total: 0, page, limit };
        }
      }
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

    let flashcardIds: string[] = [];
    if (subExamId) {
      const subFIds = await this.db
        .select({ flashcardId: flashcardExams.flashcardId })
        .from(flashcardExams)
        .where(eq(flashcardExams.examId, subExamId));
      flashcardIds = subFIds.map((r: any) => r.flashcardId);
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
        flashcardIds = targetFIds.map((r: any) => r.flashcardId);
      } else {
        return [];
      }
    }

    if (!flashcardIds.length) return [];

    const now = new Date();

    const reviewedDue = await this.db
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
      .innerJoin(flashcards, eq(flashcards.id, userFlashcardReviews.flashcardId))
      .leftJoin(specialties, eq(flashcards.specialtyId, specialties.id))
      .leftJoin(topics, eq(flashcards.topicId, topics.id))
      .where(
        and(
          eq(userFlashcardReviews.userId, userId),
          eq(flashcards.isActive, true),
          lte(userFlashcardReviews.nextReviewAt, now),
          inArray(flashcards.id, flashcardIds),
        ),
      )
      .limit(limit);

    if (reviewedDue.length >= limit) return reviewedDue;

    const reviewedIds = reviewedDue.map((r: any) => r.id);
    const unreviewedCount = limit - reviewedDue.length;

    const unreviewed = await this.db
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
      .from(flashcards)
      .leftJoin(specialties, eq(flashcards.specialtyId, specialties.id))
      .leftJoin(topics, eq(flashcards.topicId, topics.id))
      .where(
        and(
          eq(flashcards.isActive, true),
          inArray(flashcards.id, flashcardIds),
          reviewedIds.length > 0
            ? notInArray(flashcards.id, reviewedIds)
            : sql`TRUE`,
        ),
      )
      .limit(unreviewedCount);

    return [...reviewedDue, ...unreviewed];
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

    let sub: any = null;

    if (!isAdmin) {
      [sub] = await this.db
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
        .select({ examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, sub.planId))
        .limit(1);

      if (plan?.isCourseOnly) {
        throw new HttpException(this.i18n.t("exams.notSubscribed"), HttpStatus.FORBIDDEN);
      }

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

    let review: any;
    try {
      if (existing) {
        [review] = await this.db
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
      } else {
        [review] = await this.db
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
      }
    } catch (e) {
      throw e;
    }

    if (!isAdmin && sub && sub.remainingFlashcardAttempts != null && !existing) {
      await this.db
        .update(userSubscriptions)
        .set({ remainingFlashcardAttempts: sql`${userSubscriptions.remainingFlashcardAttempts} - 1` })
        .where(eq(userSubscriptions.id, sub.id));
    }

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
      .from(specialties)
      .where(ne(specialties.type, "question"));

    if (subExamId && subExamId !== "__all__") {
      query = query.where(eq(specialties.examId, subExamId));
    }

    const rows = await query;

    rows.sort((a: typeof rows[number], b: typeof rows[number]) => (a.name?.en ?? "").localeCompare(b.name?.en ?? ""));

    return rows;
  }

  private async getSubscriptionExamId(userId: string, userRole?: string): Promise<string | null> {
    const examId = await getAccessibleExamId(this.db, userId, userRole);
    if (examId) return examId;

    const [user] = await this.db
      .select({ targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.targetExamId || null;
  }

  async startExam(data: {
    userId: string;
    mode: string;
    questionCount: number;
    timeLimit?: number;
    customTitle?: string;
    specialtyId?: string;
    topicId?: string;
  }) {
    const { userId, mode, questionCount, timeLimit, customTitle, specialtyId, topicId } = data;

    const [user] = await this.db
      .select({ role: users.role, targetExamId: users.targetExamId, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new NotFoundException("User not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";

    let sub: any = null;
    let accessibleExamId: string | null = null;

    if (!isAdmin) {
      accessibleExamId = await this.getSubscriptionExamId(userId);
      if (!accessibleExamId) {
        const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
        if (user.targetExamId && hoursSinceRegistration <= 24) {
          accessibleExamId = user.targetExamId;
        } else {
          throw new HttpException(this.i18n.t("exams.noActiveSubscription"), HttpStatus.FORBIDDEN);
        }
      }

      [sub] = await this.db
        .select()
        .from(userSubscriptions)
        .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active")))
        .limit(1);

      if (sub) {
        if (sub.remainingFlashcardAttempts != null && sub.remainingFlashcardAttempts < 1) {
          throw new HttpException(this.i18n.t("flashcards.noRemainingAttempts"), HttpStatus.FORBIDDEN);
        }
        if (sub.remainingUses != null && sub.remainingUses < 1) {
          throw new HttpException(this.i18n.t("exams.usageLimitExceeded"), HttpStatus.FORBIDDEN);
        }
      }
    }

    const conditions: SQL[] = [eq(flashcards.isActive, true)];
    if (accessibleExamId && accessibleExamId !== "__all__") {
      const examFIds = await this.db
        .select({ flashcardId: flashcardExams.flashcardId })
        .from(flashcardExams)
        .where(eq(flashcardExams.examId, accessibleExamId));
      const ids = examFIds.map((r: any) => r.flashcardId);
      if (!ids.length) throw new HttpException("No flashcards available for this exam", HttpStatus.BAD_REQUEST);
      conditions.push(inArray(flashcards.id, ids));
    }
    if (specialtyId) conditions.push(eq(flashcards.specialtyId, specialtyId));
    if (topicId) conditions.push(eq(flashcards.topicId, topicId));

    const allCards = await this.db
      .select({ id: flashcards.id })
      .from(flashcards)
      .where(and(...conditions));

    if (!allCards.length) throw new HttpException("No flashcards available", HttpStatus.BAD_REQUEST);

    const shuffled = allCards.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount || shuffled.length, shuffled.length));
    const selectedIds = selected.map((c: any) => c.id);

    const [existingActive] = await this.db
      .select({ id: flashcardExamAttempts.id })
      .from(flashcardExamAttempts)
      .where(and(eq(flashcardExamAttempts.userId, userId), eq(flashcardExamAttempts.status, "in_progress")))
      .limit(1);
    if (existingActive) {
      throw new HttpException("You already have an active flashcard exam. Complete it first.", HttpStatus.BAD_REQUEST);
    }

    const [attempt] = await this.db
      .insert(flashcardExamAttempts)
      .values({
        userId,
        mode: mode || "practice",
        status: "in_progress",
        customTitle,
        questionCount: selectedIds.length,
        timeLimit,
        startedAt: new Date(),
      })
      .returning();

    if (sub && sub.remainingFlashcardAttempts != null) {
      await this.db
        .update(userSubscriptions)
        .set({ remainingFlashcardAttempts: sql`${userSubscriptions.remainingFlashcardAttempts} - 1` })
        .where(and(eq(userSubscriptions.id, sub.id), sql`${userSubscriptions.remainingFlashcardAttempts} > 0`));
    }
    if (sub && sub.remainingUses != null) {
      await this.db
        .update(userSubscriptions)
        .set({ remainingUses: sql`${userSubscriptions.remainingUses} - 1` })
        .where(and(eq(userSubscriptions.id, sub.id), sql`${userSubscriptions.remainingUses} > 0`));
    }

    const cardDetails = await this.db
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
      .from(flashcards)
      .leftJoin(specialties, eq(flashcards.specialtyId, specialties.id))
      .leftJoin(topics, eq(flashcards.topicId, topics.id))
      .where(inArray(flashcards.id, selectedIds));

    return { ...attempt, flashcards: cardDetails };
  }

  async answerFlashcardQuestion(data: {
    attemptId: string;
    flashcardId: string;
    isCorrect: boolean;
  }, userId: string) {
    const [attempt] = await this.db
      .select({ userId: flashcardExamAttempts.userId, status: flashcardExamAttempts.status })
      .from(flashcardExamAttempts)
      .where(eq(flashcardExamAttempts.id, data.attemptId))
      .limit(1);
    if (!attempt) throw new NotFoundException("Flashcard exam attempt not found");
    if (attempt.userId !== userId) throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    if (attempt.status === "completed") throw new HttpException("Exam already completed", HttpStatus.BAD_REQUEST);

    const [existing] = await this.db
      .select()
      .from(flashcardExamAnswers)
      .where(and(eq(flashcardExamAnswers.attemptId, data.attemptId), eq(flashcardExamAnswers.flashcardId, data.flashcardId)))
      .limit(1);
    if (existing) throw new HttpException("Already answered this flashcard", HttpStatus.BAD_REQUEST);

    const [answer] = await this.db
      .insert(flashcardExamAnswers)
      .values({
        attemptId: data.attemptId,
        flashcardId: data.flashcardId,
        isCorrect: data.isCorrect,
        answeredAt: new Date(),
      })
      .returning();

    await this.db
      .update(flashcardExamAttempts)
      .set({
        answeredCount: sql`${flashcardExamAttempts.answeredCount} + 1`,
        correctCount: sql`${flashcardExamAttempts.correctCount} + ${data.isCorrect ? 1 : 0}`,
      })
      .where(eq(flashcardExamAttempts.id, data.attemptId));

    return answer;
  }

  async completeExam(attemptId: string, userId: string) {
    const [attempt] = await this.db
      .select({ userId: flashcardExamAttempts.userId, status: flashcardExamAttempts.status, startedAt: flashcardExamAttempts.startedAt })
      .from(flashcardExamAttempts)
      .where(eq(flashcardExamAttempts.id, attemptId))
      .limit(1);
    if (!attempt) throw new NotFoundException("Flashcard exam attempt not found");
    if (attempt.userId !== userId) throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    if (attempt.status === "completed") throw new HttpException("Exam already completed", HttpStatus.BAD_REQUEST);

    const timeSpent = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    const [updated] = await this.db
      .update(flashcardExamAttempts)
      .set({ status: "completed", completedAt: new Date(), timeSpent })
      .where(eq(flashcardExamAttempts.id, attemptId))
      .returning();

    return updated;
  }

  async getExamHistory(userId: string) {
    return this.db
      .select({
        id: flashcardExamAttempts.id,
        mode: flashcardExamAttempts.mode,
        status: flashcardExamAttempts.status,
        customTitle: flashcardExamAttempts.customTitle,
        questionCount: flashcardExamAttempts.questionCount,
        answeredCount: flashcardExamAttempts.answeredCount,
        correctCount: flashcardExamAttempts.correctCount,
        scorePercentage: sql<number>`CASE WHEN ${flashcardExamAttempts.questionCount} > 0 THEN ROUND((${flashcardExamAttempts.correctCount}::numeric / ${flashcardExamAttempts.questionCount}) * 100, 1) ELSE 0 END`,
        timeLimit: flashcardExamAttempts.timeLimit,
        timeSpent: flashcardExamAttempts.timeSpent,
        startedAt: flashcardExamAttempts.startedAt,
        completedAt: flashcardExamAttempts.completedAt,
        createdAt: flashcardExamAttempts.createdAt,
      })
      .from(flashcardExamAttempts)
      .where(eq(flashcardExamAttempts.userId, userId))
      .orderBy(sql`${flashcardExamAttempts.createdAt} DESC`);
  }

  async getExamAttemptDetail(attemptId: string, userId: string) {
    const [attempt] = await this.db
      .select()
      .from(flashcardExamAttempts)
      .where(and(eq(flashcardExamAttempts.id, attemptId), eq(flashcardExamAttempts.userId, userId)))
      .limit(1);
    if (!attempt) throw new NotFoundException("Flashcard exam attempt not found");

    const answers = await this.db
      .select({
        id: flashcardExamAnswers.id,
        flashcardId: flashcardExamAnswers.flashcardId,
        flashcardFront: flashcards.front,
        flashcardBack: flashcards.back,
        isCorrect: flashcardExamAnswers.isCorrect,
        answeredAt: flashcardExamAnswers.answeredAt,
      })
      .from(flashcardExamAnswers)
      .innerJoin(flashcards, eq(flashcards.id, flashcardExamAnswers.flashcardId))
      .where(eq(flashcardExamAnswers.attemptId, attemptId));

    return { ...attempt, answers };
  }
}