import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { DRIZZLE } from "../database/database.provider";
import {
  examAnswers,
  examAttempts,
  exams,
  questionOptions,
  questions,
  userQuestionProgress,
  userSubscriptions,
  users,
} from "../database/schema";

@Injectable()
export class AttemptsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async create(data: {
    userId: string;
    examId: string;
    mode: string;
    questionCount: number;
    timeLimit?: number;
  }) {
    const [user] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
    let sub: any = null;

    if (!isAdmin) {
      [sub] = await this.db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, data.userId),
            eq(userSubscriptions.status, "active"),
          ),
        )
        .limit(1);

      if (!sub) {
        throw new HttpException("No active subscription found.", HttpStatus.FORBIDDEN);
      }

      if (sub.remainingExamAttempts != null && sub.remainingExamAttempts < 1) {
        throw new HttpException("No remaining exam attempts. Please upgrade your plan.", HttpStatus.FORBIDDEN);
      }
    }

    const [attempt] = await this.db
      .insert(examAttempts)
      .values({
        userId: data.userId,
        examId: data.examId,
        mode: data.mode,
        questionCount: data.questionCount,
        timeLimit: data.timeLimit,
      })
      .returning();

    if (sub && sub.remainingExamAttempts != null) {
      await this.db
        .update(userSubscriptions)
        .set({ remainingExamAttempts: sub.remainingExamAttempts - 1 })
        .where(eq(userSubscriptions.id, sub.id));
    }

    return attempt;
  }

  async findById(id: string) {
    const [attempt] = await this.db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, id))
      .limit(1);
    if (!attempt) throw new NotFoundException("Attempt not found");

    const answers = await this.db
      .select()
      .from(examAnswers)
      .where(eq(examAnswers.attemptId, id))
      .orderBy(asc(examAnswers.answeredAt));

    if (!answers.length) return { ...attempt, answers };

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

  async findByUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const rows = await this.db
      .select({
        id: examAttempts.id,
        examId: examAttempts.examId,
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
  }) {
    const [option] = await this.db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.id, data.selectedOptionId))
      .limit(1);

    const isCorrect = option?.isCorrect || false;

    const [answer] = await this.db
      .insert(examAnswers)
      .values({
        attemptId: data.attemptId,
        questionId: data.questionId,
        selectedOptionId: data.selectedOptionId,
        isCorrect,
        timeSpent: data.timeSpent,
      })
      .returning();

    const [attempt] = await this.db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, data.attemptId))
      .limit(1);

    const answeredCount = (attempt?.answeredCount || 0) + 1;
    const correctCount = (attempt?.correctCount || 0) + (isCorrect ? 1 : 0);
    const accumulatedTime = (attempt?.timeSpent || 0) + data.timeSpent;

    await this.db
      .update(examAttempts)
      .set({ answeredCount, correctCount, timeSpent: accumulatedTime })
      .where(eq(examAttempts.id, data.attemptId));

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

  async complete(id: string) {
    const [attempt] = await this.db
      .update(examAttempts)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(examAttempts.id, id))
      .returning();
    if (!attempt) throw new NotFoundException("Attempt not found");
    return attempt;
  }
}