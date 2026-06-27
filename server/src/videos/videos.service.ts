import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { videoModules, videoModuleExams, videoLessons, userVideoProgress, userSubscriptions, subscriptionPlans } from "../database/schema";
import { eq, asc, and, inArray, isNull, or, type SQL } from "drizzle-orm";

@Injectable()
export class VideosService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(user?: any) {
    let subExamId: string | null = null;
    if (user) {
      const [sub] = await this.db
        .select({ examId: subscriptionPlans.examId })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
        .limit(1);
      subExamId = sub?.examId || null;
    }

    const modules = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.isActive, true))
      .orderBy(asc(videoModules.sortOrder));

    const result: Array<Record<string, unknown>> = [];
    for (const mod of modules) {
      const examLinks = await this.db
        .select()
        .from(videoModuleExams)
        .where(eq(videoModuleExams.moduleId, mod.id));

      const modExamIds = examLinks.map((l: any) => l.examId);

      if (subExamId && modExamIds.length > 0 && !modExamIds.includes(subExamId)) {
        continue;
      }

      const lessons = await this.db
        .select()
        .from(videoLessons)
        .where(eq(videoLessons.moduleId, mod.id))
        .orderBy(asc(videoLessons.sortOrder));
      result.push({ ...mod, lessons, examIds: modExamIds });
    }
    return result;
  }

  async findById(id: string) {
    const [mod] = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.id, id))
      .limit(1);

    if (!mod) return null;

    const lessons = await this.db
      .select()
      .from(videoLessons)
      .where(eq(videoLessons.moduleId, id))
      .orderBy(asc(videoLessons.sortOrder));

    return { ...mod, lessons };
  }

  async getProgress(userId: string, lessonId: string) {
    const [row] = await this.db
      .select()
      .from(userVideoProgress)
      .where(
        and(
          eq(userVideoProgress.userId, userId),
          eq(userVideoProgress.lessonId, lessonId),
        ),
      )
      .limit(1);
    return row || null;
  }

  async saveProgress(
    userId: string,
    lessonId: string,
    watchedSeconds: number,
    duration?: number,
  ) {
    const isCompleted = duration ? watchedSeconds >= duration * 0.9 : false;

    const [existing] = await this.db
      .select()
      .from(userVideoProgress)
      .where(
        and(
          eq(userVideoProgress.userId, userId),
          eq(userVideoProgress.lessonId, lessonId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(userVideoProgress)
        .set({
          watchedSeconds: Math.max(existing.watchedSeconds, watchedSeconds),
          isCompleted: existing.isCompleted || isCompleted,
          lastWatchedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userVideoProgress.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(userVideoProgress)
      .values({
        userId,
        lessonId,
        watchedSeconds,
        isCompleted,
        lastWatchedAt: new Date(),
      })
      .returning();
    return created;
  }
}