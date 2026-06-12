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
import { eq, and, count, sql, gte, lte, desc } from "drizzle-orm";

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
      .select({ day: sql<string>`distinct date_trunc('day', ${userQuestionProgress.lastAnsweredAt})::date` })
      .from(userQuestionProgress)
      .where(
        and(
          eq(userQuestionProgress.userId, userId),
          sql`${userQuestionProgress.lastAnsweredAt} IS NOT NULL`,
        ),
      )
      .orderBy(desc(sql`date_trunc('day', ${userQuestionProgress.lastAnsweredAt})`));

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

    return {
      totalUsers: totalUsers?.count || 0,
      totalAttempts: totalAttempts?.count || 0,
    };
  }
}