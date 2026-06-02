import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  examAttempts,
  examAnswers,
  userQuestionProgress,
  userCourseProgress,
  userFlashcardReviews,
  users,
} from "../database/schema";
import { eq, and, count, sql } from "drizzle-orm";

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