import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { videoModules, videoLessons, userVideoProgress } from "../database/schema";
import { eq, asc, and, sql } from "drizzle-orm";

@Injectable()
export class VideosService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    const modules = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.isActive, true))
      .orderBy(asc(videoModules.sortOrder));

    const result: Array<Record<string, unknown>> = [];
    for (const mod of modules) {
      const lessons = await this.db
        .select()
        .from(videoLessons)
        .where(eq(videoLessons.moduleId, mod.id))
        .orderBy(asc(videoLessons.sortOrder));
      result.push({ ...mod, lessons });
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