import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { videoModules, videoModuleExams, videoLessons, userVideoProgress, userSubscriptions, subscriptionPlans, users } from "../database/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import { getAccessibleExamId } from "../common/utils/access-helper";

@Injectable()
export class VideosService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(user?: any) {
    if (user) {
      const [u] = await this.db
        .select({ accountType: users.accountType, role: users.role })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      if (u?.accountType === "course_only") {
        return [];
      }
      if (u?.role !== "admin" && u?.role !== "super_admin") {
        const [sub] = await this.db
          .select()
          .from(userSubscriptions)
          .where(
            and(
              eq(userSubscriptions.userId, user.id),
              eq(userSubscriptions.status, "active"),
            ),
          )
          .limit(1);
        if (!sub) {
          return [];
        }
        const [plan] = await this.db
          .select({ maxExamAttempts: subscriptionPlans.maxExamAttempts, price: subscriptionPlans.price })
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, sub.planId))
          .limit(1);
        if (plan && plan.maxExamAttempts == null && parseFloat(plan.price || "0") === 0) {
          return [];
        }
      }
    }
    let subExamId: string | null = null;
    if (user) {
      subExamId = await getAccessibleExamId(this.db, user.id);
    }

    const modules = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.isActive, true))
      .orderBy(asc(videoModules.sortOrder));

    const moduleIds = modules.map((m: typeof modules[number]) => m.id);
    const allExamLinks = await this.db
      .select()
      .from(videoModuleExams)
      .where(inArray(videoModuleExams.moduleId, moduleIds));
    const allLessons = await this.db
      .select()
      .from(videoLessons)
      .where(inArray(videoLessons.moduleId, moduleIds))
      .orderBy(asc(videoLessons.sortOrder));

    const examLinksByModule = new Map<string, any[]>();
    for (const link of allExamLinks) {
      if (!examLinksByModule.has(link.moduleId)) examLinksByModule.set(link.moduleId, []);
      examLinksByModule.get(link.moduleId)!.push(link);
    }
    const lessonsByModule = new Map<string, any[]>();
    for (const lesson of allLessons) {
      if (!lessonsByModule.has(lesson.moduleId)) lessonsByModule.set(lesson.moduleId, []);
      lessonsByModule.get(lesson.moduleId)!.push(lesson);
    }

    const result: Array<Record<string, unknown>> = [];
    for (const mod of modules) {
      const examLinks = examLinksByModule.get(mod.id) || [];
      const modExamIds = examLinks.map((l: any) => l.examId);
      if (subExamId && subExamId !== "__all__" && modExamIds.length > 0 && !modExamIds.includes(subExamId)) continue;
      const lessons = lessonsByModule.get(mod.id) || [];
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