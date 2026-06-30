import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  examAttempts,
  examAnswers,
  userQuestionProgress,
  userCourseProgress,
  userFlashcardReviews,
  users,
  questions,
  specialties,
} from "../database/schema";
import { eq, and, count, sql, gte, desc } from "drizzle-orm";

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async getUserStats(userId: string) {
    const [attempts] = await this.db
      .select({
        total: count(),
        completed: sql`sum(case when status = 'completed' then 1 else 0 end)`,
        avgScore: sql`avg(correct_count::float / nullif(question_count, 0) * 100)`,
      })
      .from(examAttempts)
      .where(eq(examAttempts.userId, userId));

    const [flashcards] = await this.db
      .select({
        totalReviewed: count(),
      })
      .from(userFlashcardReviews)
      .where(eq(userFlashcardReviews.userId, userId));

    const [questions] = await this.db
      .select({
        totalAnswered: sql`sum(times_answered)`,
        totalCorrect: sql`sum(times_correct)`,
      })
      .from(userQuestionProgress)
      .where(eq(userQuestionProgress.userId, userId));

    const [courseProgress] = await this.db
      .select({
        completedLessons: count(),
      })
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.isCompleted, true),
        ),
      );

    return { attempts, flashcards, questions, courseProgress };
  }

  async getUserProgress(userId: string) {
    const totals = await this.getUserStats(userId);
    const totalAnswered = Number(totals.questions?.totalAnswered || 0);
    const totalCorrect = Number(totals.questions?.totalCorrect || 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const [hoursResult] = await this.db
      .select({ total: sql<number>`coalesce(sum(time_spent), 0)::int` })
      .from(examAttempts)
      .where(and(eq(examAttempts.userId, userId), eq(examAttempts.status, "completed")));
    const totalHours = Math.round((Number(hoursResult?.total || 0) / 3600) * 10) / 10;

    const streak = await this.computeStreak(userId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyData = await this.db
      .select({
        date: sql<string>`date_trunc('day', answered_at)::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(examAnswers)
      .where(
        and(
          eq(examAnswers.isCorrect, true),
          gte(examAnswers.answeredAt, weekAgo),
          sql`${examAnswers.answeredAt} IS NOT NULL`,
          sql`exists(select 1 from ${examAttempts} where ${examAttempts.id} = ${examAnswers.attemptId} and ${examAttempts.userId} = ${userId})`,
        ),
      )
      .groupBy(sql`date_trunc('day', answered_at)`)
      .orderBy(sql`date_trunc('day', answered_at)`);

    const specialtyData = await this.db
      .select({
        specialtyId: specialties.id,
        name: specialties.name,
        totalAnswered: sql<number>`coalesce(sum(${userQuestionProgress.timesAnswered}), 0)::int`,
        totalCorrect: sql<number>`coalesce(sum(${userQuestionProgress.timesCorrect}), 0)::int`,
      })
      .from(userQuestionProgress)
      .innerJoin(questions, eq(userQuestionProgress.questionId, questions.id))
      .innerJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(eq(userQuestionProgress.userId, userId))
      .groupBy(specialties.id, specialties.name);

    return {
      totalAnswered,
      totalCorrect,
      accuracy,
      totalHours,
      streak,
      weeklyData,
      specialtyData,
    };
  }

  private async computeStreak(userId: string) {
    const rows = await this.db
      .select({
        day: sql<string>`date_trunc('day', ${userQuestionProgress.lastAnsweredAt})::date`,
      })
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          sql`${userQuestionProgress.lastAnsweredAt} IS NOT NULL`,
        ),
      )
      .groupBy(sql`date_trunc('day', ${userQuestionProgress.lastAnsweredAt})::date`)
      .orderBy(desc(sql`date_trunc('day', ${userQuestionProgress.lastAnsweredAt})::date`));

    if (!rows.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const checkDate = new Date(today);

    for (const row of rows) {
      const day = new Date(row.day);
      const diff = Math.round((checkDate.getTime() - day.getTime()) / 86400000);
      if (diff === 0 || diff === 1) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (diff > 1) {
        break;
      }
    }

    return streak;
  }

  async getAdminStats() {
    const [totalUsers] = await this.db
      .select({ count: count() })
      .from(users);

    const [totalAttempts] = await this.db
      .select({ count: count() })
      .from(examAttempts);

    const [totalQuestions] = await this.db
      .select({ count: count() })
      .from(userQuestionProgress);

    const [totalFlashcards] = await this.db
      .select({ count: count() })
      .from(userFlashcardReviews);

    return {
      totalUsers: totalUsers?.count || 0,
      totalAttempts: totalAttempts?.count || 0,
      totalQuestionsAnswered: totalQuestions?.count || 0,
      totalFlashcardsReviewed: totalFlashcards?.count || 0,
    };
  }

  async getDailyActiveUsers(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const rows = await this.db
      .select({
        date: sql<string>`date_trunc('day', ${examAttempts.startedAt})::date`,
        count: sql<number>`count(distinct ${examAttempts.userId})::int`,
      })
      .from(examAttempts)
      .where(gte(examAttempts.startedAt, start))
      .groupBy(sql`date_trunc('day', ${examAttempts.startedAt})::date`)
      .orderBy(sql`date_trunc('day', ${examAttempts.startedAt})::date`);

    return rows;
  }

  async getMonthlyActiveUsers(months = 12) {
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await this.db
      .select({
        month: sql<string>`date_trunc('month', ${examAttempts.startedAt})::date`,
        count: sql<number>`count(distinct ${examAttempts.userId})::int`,
      })
      .from(examAttempts)
      .where(gte(examAttempts.startedAt, start))
      .groupBy(sql`date_trunc('month', ${examAttempts.startedAt})::date`)
      .orderBy(sql`date_trunc('month', ${examAttempts.startedAt})::date`);

    return rows;
  }

  async getCohortRetention() {
    const rows = await this.db
      .select({
        cohortMonth: sql<string>`date_trunc('month', ${users.createdAt})::date`,
        userId: users.id,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(sql`${users.createdAt} IS NOT NULL`)
      .orderBy(sql`date_trunc('month', ${users.createdAt})::date`);

    const cohorts: Record<string, { total: number; activeByMonth: Map<number, Set<string>> }> = {};
    for (const row of rows) {
      const cohort = new Date(row.cohortMonth).getTime();
      if (!cohorts[cohort]) cohorts[cohort] = { total: 0, activeByMonth: new Map() };
      cohorts[cohort].total++;
    }

    const now = new Date();
    const userActivity = await this.db
      .select({
        userId: examAttempts.userId,
        month: sql<string>`date_trunc('month', ${examAttempts.startedAt})::date`,
      })
      .from(examAttempts)
      .where(gte(examAttempts.startedAt, new Date(now.getFullYear() - 2, 0, 1)))
      .groupBy(examAttempts.userId, sql`date_trunc('month', ${examAttempts.startedAt})::date`);

    const userCohort: Record<string, number> = {};
    for (const row of rows) {
      if (!userCohort[row.userId]) userCohort[row.userId] = new Date(row.cohortMonth).getTime();
    }

    for (const act of userActivity) {
      const cohort = userCohort[act.userId];
      if (cohort && cohorts[cohort]) {
        const monthOffset = Math.round(
          (new Date(act.month).getTime() - cohort) / (30 * 24 * 60 * 60 * 1000),
        );
        if (monthOffset >= 0) {
          if (!cohorts[cohort].activeByMonth.has(monthOffset)) {
            cohorts[cohort].activeByMonth.set(monthOffset, new Set());
          }
          cohorts[cohort].activeByMonth.get(monthOffset)!.add(act.userId);
        }
      }
    }

    const result: { cohort: string; total: number; retention: Record<string, number> }[] = [];
    for (const [cohortKey, data] of Object.entries(cohorts)) {
      const retention: Record<string, number> = {};
      for (let m = 0; m <= 6; m++) {
        const activeUsersInMonth = data.activeByMonth.get(m)?.size || 0;
        retention[`month_${m}`] = Math.round((activeUsersInMonth / data.total) * 100);
      }
      result.push({
        cohort: new Date(Number(cohortKey)).toISOString().slice(0, 7),
        total: data.total,
        retention,
      });
    }

    return result.slice(-12);
  }

  async getUserGrowth(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const rows = await this.db
      .select({
        date: sql<string>`date_trunc('day', ${users.createdAt})::date`,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, start))
      .groupBy(sql`date_trunc('day', ${users.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})::date`);

    return rows;
  }

  async getExamCompletionStats() {
    const rows = await this.db
      .select({
        examId: examAttempts.examId,
        started: sql<number>`count(*)::int`,
        completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)::int`,
      })
      .from(examAttempts)
      .groupBy(examAttempts.examId);

    return rows;
  }
}