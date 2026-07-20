import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { DRIZZLE } from "../database/database.provider";
import {
  examAnswers,
  examAttempts,
  exams,
  questionOptions,
  questions,
  subscriptionPlans,
  userQuestionProgress,
  userSubscriptions,
  users,
} from "../database/schema";

import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class AttemptsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async create(data: {
    userId: string;
    examId: string;
    mode: string;
    questionCount: number;
    questionIds?: string[];
    timeLimit?: number;
    customTitle?: string;
  }) {
    return this.db.transaction(async (tx: any) => {
      const [exam] = await tx
        .select({ id: exams.id })
        .from(exams)
        .where(eq(exams.id, data.examId))
        .limit(1);
      if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));

      const [existingActive] = await tx
        .select({ id: examAttempts.id, mode: examAttempts.mode })
        .from(examAttempts)
        .where(and(eq(examAttempts.userId, data.userId), eq(examAttempts.examId, data.examId), eq(examAttempts.status, "in_progress")))
        .for("update")
        .limit(1);
      if (existingActive && existingActive.mode === data.mode) throw new HttpException(this.i18n.t("exams.duplicateActiveAttempt"), HttpStatus.BAD_REQUEST);

      const [user] = await tx
        .select({ role: users.role, targetExamId: users.targetExamId, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, data.userId))
        .limit(1);

      const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
      let sub: any = null;

      if (!isAdmin) {
        [sub] = await tx
          .select()
          .from(userSubscriptions)
          .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
          .where(
            and(
              eq(userSubscriptions.userId, data.userId),
              inArray(userSubscriptions.status, ["active", "cancelling"]),
            ),
          )
          .limit(1);

        if (!sub) {
          if (user.targetExamId && user.targetExamId === data.examId) {
            const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
            if (hoursSinceRegistration <= 24) {
              const [attempt] = await tx
                .insert(examAttempts)
                .values({
                  userId: data.userId,
                  examId: data.examId,
                  mode: data.mode,
                  questionCount: data.questionCount,
                  questionIds: data.questionIds ?? null,
                  timeLimit: data.timeLimit,
                  customTitle: data.customTitle,
                })
                .returning();
              return attempt;
            }
          }
          throw new HttpException(this.i18n.t("exams.noActiveSubscription"), HttpStatus.FORBIDDEN);
        }

        const plan = sub.subscription_plans;
        if (plan.isCourseOnly) {
          throw new HttpException(this.i18n.t("exams.notSubscribed"), HttpStatus.FORBIDDEN);
        }

        if (plan.maxExamAttempts == null && parseFloat(plan.price || "0") === 0) {
          throw new HttpException(this.i18n.t("exams.notSubscribed"), HttpStatus.FORBIDDEN);
        }

        if (plan.examId && plan.examId !== data.examId) {
          throw new HttpException(this.i18n.t("exams.subscriptionNotIncludeExam"), HttpStatus.FORBIDDEN);
        }

        if (sub.user_subscriptions.remainingExamAttempts != null && sub.user_subscriptions.remainingExamAttempts < 1) {
          throw new HttpException(this.i18n.t("exams.noRemainingAttempts"), HttpStatus.FORBIDDEN);
        }

        if (sub.user_subscriptions.remainingUses != null && sub.user_subscriptions.remainingUses < 1) {
          throw new HttpException(this.i18n.t("exams.usageLimitExceeded"), HttpStatus.FORBIDDEN);
        }

        if (plan.maxDays) {
          const created = new Date(sub.user_subscriptions.createdAt);
          const expired = new Date(created.getTime() + plan.maxDays * 24 * 60 * 60 * 1000);
          if (new Date() > expired) {
            throw new HttpException(this.i18n.t("exams.planExpired"), HttpStatus.FORBIDDEN);
          }
        }
      }

      const [attempt] = await tx
        .insert(examAttempts)
        .values({
          userId: data.userId,
          examId: data.examId,
          mode: data.mode,
          questionCount: data.questionCount,
          questionIds: data.questionIds ? JSON.stringify(data.questionIds) : null,
          timeLimit: data.timeLimit,
          customTitle: data.customTitle,
        })
        .returning();

      if (sub && sub.user_subscriptions.remainingExamAttempts != null) {
        await tx
          .update(userSubscriptions)
          .set({ remainingExamAttempts: sql`${userSubscriptions.remainingExamAttempts} - 1` })
          .where(and(
            eq(userSubscriptions.id, sub.user_subscriptions.id),
            gt(userSubscriptions.remainingExamAttempts, 0),
          ));
      }

      if (sub && sub.user_subscriptions.remainingUses != null) {
        await tx
          .update(userSubscriptions)
          .set({ remainingUses: sql`${userSubscriptions.remainingUses} - 1` })
          .where(and(
            eq(userSubscriptions.id, sub.user_subscriptions.id),
            gt(userSubscriptions.remainingUses, 0),
          ));
      }

      return attempt;
    });
  }

  async findById(id: string, userId: string) {
    const [attempt] = await this.db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, id))
      .limit(1);
    if (!attempt) throw new NotFoundException(this.i18n.t("exams.attemptNotFound"));
    if (attempt.userId !== userId) throw new ForbiddenException();

    const answers = await this.db
      .select()
      .from(examAnswers)
      .where(eq(examAnswers.attemptId, id))
      .orderBy(asc(examAnswers.answeredAt));

    const questionIds = answers.length
      ? [...new Set(answers.map((a: any) => a.questionId))] as string[]
      : (attempt.questionIds || []) as string[];

    if (!questionIds.length) return { ...attempt, answers };

    const allQuestions = await this.db
      .select()
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const qOptions = await this.db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds))
      .orderBy(asc(questionOptions.sortOrder));

    const qOptMap = new Map<string, any[]>();
    for (const opt of qOptions) {
      if (!qOptMap.has(opt.questionId)) qOptMap.set(opt.questionId, []);
      qOptMap.get(opt.questionId)!.push(opt);
    }

    const qMap = new Map(allQuestions.map((q: any) => [q.id, { ...q, options: qOptMap.get(q.id) || [] }]));

    const mergedAnswers = questionIds.map((qId: string) => {
      const existing = answers.find((a: any) => a.questionId === qId);
      if (existing) return { ...existing, question: qMap.get(qId) || null };
      return { attemptId: id, questionId: qId, selectedOptionId: null, isCorrect: false, timeSpent: 0, isFlagged: false, answeredAt: null, question: qMap.get(qId) || null };
    });

    return {
      ...attempt,
      answers: mergedAnswers,
    };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const rows = await this.db
      .select({
        id: examAttempts.id,
        examId: examAttempts.examId,
        customTitle: examAttempts.customTitle,
        mode: examAttempts.mode,
        status: examAttempts.status,
        questionCount: examAttempts.questionCount,
        answeredCount: examAttempts.answeredCount,
        correctCount: examAttempts.correctCount,
        timeLimit: examAttempts.timeLimit,
        timeSpent: examAttempts.timeSpent,
        startedAt: examAttempts.startedAt,
        completedAt: examAttempts.completedAt,
        createdAt: examAttempts.createdAt,
        examName: exams.name,
      })
      .from(examAttempts)
      .leftJoin(exams, eq(examAttempts.examId, exams.id))
      .where(eq(examAttempts.userId, userId))
      .orderBy(desc(examAttempts.createdAt))
      .limit(limit)
      .offset(offset);
    return rows;
  }

  async answerQuestion(data: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string;
    timeSpent: number;
  }, userId: string) {
    const [attemptCheck] = await this.db
      .select({ userId: examAttempts.userId, status: examAttempts.status })
      .from(examAttempts)
      .where(eq(examAttempts.id, data.attemptId))
      .limit(1);
    if (!attemptCheck) throw new NotFoundException(this.i18n.t("exams.attemptNotFound"));
    if (attemptCheck.userId !== userId) throw new ForbiddenException();
    if (attemptCheck.status === "completed") throw new HttpException(this.i18n.t("exams.attemptAlreadyCompleted"), HttpStatus.BAD_REQUEST);

    const [option] = await this.db
      .select()
      .from(questionOptions)
      .where(and(eq(questionOptions.id, data.selectedOptionId), eq(questionOptions.questionId, data.questionId)))
      .limit(1);
    if (!option) throw new HttpException(this.i18n.t("exams.invalidOption"), HttpStatus.BAD_REQUEST);

    const isCorrect = option?.isCorrect || false;

    const [existingAnswer] = await this.db
      .select()
      .from(examAnswers)
      .where(
        and(
          eq(examAnswers.attemptId, data.attemptId),
          eq(examAnswers.questionId, data.questionId),
        ),
      )
      .limit(1);

    let answer: any;
    if (existingAnswer) {
      const oldIsCorrect = existingAnswer.isCorrect;
      const correctDelta = (isCorrect ? 1 : 0) - (oldIsCorrect ? 1 : 0);

      const oldTimeSpent = existingAnswer.timeSpent || 0;
      [answer] = await this.db
        .update(examAnswers)
        .set({
          selectedOptionId: data.selectedOptionId,
          isCorrect,
          timeSpent: data.timeSpent,
          answeredAt: new Date(),
        })
        .where(eq(examAnswers.id, existingAnswer.id))
        .returning();

      await this.db
        .update(examAttempts)
        .set({
          correctCount: sql`${examAttempts.correctCount} + ${correctDelta}`,
          timeSpent: sql`${examAttempts.timeSpent} - ${oldTimeSpent} + ${data.timeSpent}`,
        })
        .where(eq(examAttempts.id, data.attemptId));
    } else {
      [answer] = await this.db
        .insert(examAnswers)
        .values({
          attemptId: data.attemptId,
          questionId: data.questionId,
          selectedOptionId: data.selectedOptionId,
          isCorrect,
          timeSpent: data.timeSpent,
        })
        .returning();

      await this.db
        .update(examAttempts)
        .set({
          answeredCount: sql`${examAttempts.answeredCount} + 1`,
          correctCount: sql`${examAttempts.correctCount} + ${isCorrect ? 1 : 0}`,
          timeSpent: sql`${examAttempts.timeSpent} + ${data.timeSpent}`,
        })
        .where(eq(examAttempts.id, data.attemptId));
    }

    const [attempt] = await this.db
      .select({ userId: examAttempts.userId })
      .from(examAttempts)
      .where(eq(examAttempts.id, data.attemptId))
      .limit(1);

    const [existing] = await this.db
      .select()
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, attempt.userId),
          eq(userQuestionProgress.questionId, data.questionId),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .update(userQuestionProgress)
        .set({
          timesAnswered: existing.timesAnswered + 1,
          timesCorrect: existing.timesCorrect + (isCorrect ? 1 : 0),
          lastAnsweredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userQuestionProgress.id, existing.id));
    } else {
      await this.db
        .insert(userQuestionProgress)
        .values({
          userId: attempt.userId,
          questionId: data.questionId,
          timesAnswered: 1,
          timesCorrect: isCorrect ? 1 : 0,
          lastAnsweredAt: new Date(),
        });
    }

    return { answer, isCorrect };
  }

  async findActiveByExam(userId: string, examId: string) {
    const [attempt] = await this.db
      .select()
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.userId, userId),
          eq(examAttempts.examId, examId),
          eq(examAttempts.status, "in_progress"),
        ),
      )
      .limit(1);
    if (!attempt) return null;

    const answers = await this.db
      .select()
      .from(examAnswers)
      .where(eq(examAnswers.attemptId, attempt.id))
      .orderBy(asc(examAnswers.answeredAt));

    if (!answers.length) return { ...attempt, answers: [] };

    const questionIds = [...new Set(answers.map((a: any) => a.questionId))] as string[];
    const allQuestions = await this.db
      .select()
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const qOptions = await this.db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds))
      .orderBy(asc(questionOptions.sortOrder));

    const qOptMap = new Map<string, any[]>();
    for (const opt of qOptions) {
      if (!qOptMap.has(opt.questionId)) qOptMap.set(opt.questionId, []);
      qOptMap.get(opt.questionId)!.push(opt);
    }

    const qMap = new Map(allQuestions.map((q: any) => [q.id, { ...q, options: qOptMap.get(q.id) || [] }]));

    return {
      ...attempt,
      answers: answers.map((a: any) => ({ ...a, question: qMap.get(a.questionId) || null })),
    };
  }

  async complete(id: string, userId: string) {
    const [attemptCheck] = await this.db
      .select({ userId: examAttempts.userId })
      .from(examAttempts)
      .where(eq(examAttempts.id, id))
      .limit(1);
    if (!attemptCheck) throw new NotFoundException(this.i18n.t("exams.attemptNotFound"));
    if (attemptCheck.userId !== userId) throw new ForbiddenException();

    const [attempt] = await this.db
      .update(examAttempts)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(examAttempts.id, id))
      .returning();
    if (!attempt) throw new NotFoundException(this.i18n.t("exams.attemptNotFound"));
    return attempt;
  }
}