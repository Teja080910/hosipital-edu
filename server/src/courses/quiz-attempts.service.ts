import { Injectable, NotFoundException, Inject, BadRequestException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  courseQuizzes,
  courseQuizAttempts,
  userCourseProgress,
} from "../database/schema";
import { eq, and, desc } from "drizzle-orm";

@Injectable()
export class QuizAttemptsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async create(userId: string, quizId: string) {
    const [quiz] = await this.db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.id, quizId))
      .limit(1);
    if (!quiz) throw new NotFoundException("Quiz not found");

    const [existing] = await this.db
      .select()
      .from(courseQuizAttempts)
      .where(
        and(
          eq(courseQuizAttempts.userId, userId),
          eq(courseQuizAttempts.quizId, quizId),
          eq(courseQuizAttempts.passed, true),
        ),
      )
      .limit(1);
    if (existing) throw new BadRequestException("Quiz already passed");

    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

    const [attempt] = await this.db
      .insert(courseQuizAttempts)
      .values({
        userId,
        quizId,
        totalQuestions: questions.length,
        answers: [],
      })
      .returning();

    return { ...attempt, quiz };
  }

  async findById(id: string) {
    const [attempt] = await this.db
      .select()
      .from(courseQuizAttempts)
      .where(eq(courseQuizAttempts.id, id))
      .limit(1);
    if (!attempt) throw new NotFoundException("Quiz attempt not found");

    const [quiz] = await this.db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.id, attempt.quizId))
      .limit(1);

    return { ...attempt, quiz };
  }

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(courseQuizAttempts)
      .where(eq(courseQuizAttempts.userId, userId))
      .orderBy(desc(courseQuizAttempts.createdAt));
  }

  async submit(
    id: string,
    userId: string,
    answers: { questionIndex: number; selectedOptionIndex: number }[],
  ) {
    const [attempt] = await this.db
      .select()
      .from(courseQuizAttempts)
      .where(
        and(
          eq(courseQuizAttempts.id, id),
          eq(courseQuizAttempts.userId, userId),
        ),
      )
      .limit(1);
    if (!attempt) throw new NotFoundException("Quiz attempt not found");
    if (attempt.completedAt) throw new BadRequestException("Quiz already submitted");

    const [quiz] = await this.db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.id, attempt.quizId))
      .limit(1);

    const questions: any[] = Array.isArray(quiz.questions) ? quiz.questions : [];
    let correctCount = 0;

    const gradedAnswers = answers.map((a) => {
      const question = questions[a.questionIndex];
      if (!question) return { ...a, isCorrect: false, correctOptionIndex: -1 };

      const isCorrect = a.selectedOptionIndex === question.correctIndex;
      if (isCorrect) correctCount++;

      return {
        questionIndex: a.questionIndex,
        selectedOptionIndex: a.selectedOptionIndex,
        correctOptionIndex: question.correctIndex,
        isCorrect,
      };
    });

    const score = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    const [updated] = await this.db
      .update(courseQuizAttempts)
      .set({
        answers: gradedAnswers,
        score,
        correctAnswers: correctCount,
        passed,
        completedAt: new Date(),
      })
      .where(eq(courseQuizAttempts.id, id))
      .returning();

    if (passed && quiz.lessonId) {
      const [progress] = await this.db
        .select()
        .from(userCourseProgress)
        .where(
          and(
            eq(userCourseProgress.userId, userId),
            eq(userCourseProgress.lessonId, quiz.lessonId),
          ),
        )
        .limit(1);

      if (progress) {
        await this.db
          .update(userCourseProgress)
          .set({ quizScore: score, quizPassed: true, updatedAt: new Date() })
          .where(eq(userCourseProgress.id, progress.id));
      }
    }

    return updated;
  }
}
