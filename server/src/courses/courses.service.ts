import { Injectable, NotFoundException, Inject, BadRequestException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  courses,
  courseModules,
  courseLessons,
  courseQuizzes,
  userCourseEnrollments,
  userCourseProgress,
  userSubscriptions,
  subscriptionPlans,
  exams,
} from "../database/schema";
import { eq, and, asc, inArray, sql, type SQL } from "drizzle-orm";

@Injectable()
export class CoursesService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(onlyActive = true) {
    const conditions: SQL[] = [];
    if (onlyActive) conditions.push(eq(courses.isActive, true));
    return this.db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        description: courses.description,
        shortDescription: courses.shortDescription,
        coverImage: courses.coverImage,
        price: courses.price,
        durationDays: courses.durationDays,
        hasCertificate: courses.hasCertificate,
        sortOrder: courses.sortOrder,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        lessonCount: sql<number>`count(${courseLessons.id})::int`,
      })
      .from(courses)
      .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
      .leftJoin(courseLessons, eq(courseLessons.moduleId, courseModules.id))
      .where(and(...conditions))
      .groupBy(courses.id)
      .orderBy(asc(courses.sortOrder));
  }

  async findBySlug(slug: string) {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (!course || !course.isActive) throw new NotFoundException("Course not found");

    const mods = await this.db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .orderBy(asc(courseModules.sortOrder));

    if (mods.length === 0) return { ...course, modules: [] };

    const moduleIds = mods.map((m: any) => m.id);
    const lessons = await this.db
      .select()
      .from(courseLessons)
      .where(inArray(courseLessons.moduleId, moduleIds))
      .orderBy(asc(courseLessons.sortOrder));

    const lessonsByModule = lessons.reduce(
      (acc: Record<string, any[]>, l: any) => {
        (acc[l.moduleId] = acc[l.moduleId] || []).push(l);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const modulesWithLessons = mods.map((mod: any) => ({
      ...mod,
      lessons: lessonsByModule[mod.id] || [],
    }));

    return { ...course, modules: modulesWithLessons };
  }

  async findIdBySlug(slug: string) {
    const [course] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.slug, slug), eq(courses.isActive, true)))
      .limit(1);
    if (!course) throw new NotFoundException("Course not found");
    return course.id;
  }

  async create(data: any) {
    const [course] = await this.db.insert(courses).values(data).returning();
    return course;
  }

  async update(id: string, data: any) {
    const [course] = await this.db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    if (!course) throw new NotFoundException("Course not found");
    return course;
  }

  async softDelete(id: string) {
    const [course] = await this.db
      .update(courses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    if (!course) throw new NotFoundException("Course not found");
    return { message: "Course deleted" };
  }

  async enroll(userId: string, courseId: string, stripePaymentId?: string) {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new NotFoundException("Course not found");

    const [existing] = await this.db
      .select()
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.userId, userId),
          eq(userCourseEnrollments.courseId, courseId),
          eq(userCourseEnrollments.status, "active"),
        ),
      )
      .limit(1);

    if (existing) throw new BadRequestException("Already enrolled in this course");

    if (parseFloat(course.price) === 0 || stripePaymentId) {
      const [enrollment] = await this.db
        .insert(userCourseEnrollments)
        .values({
          userId,
          courseId,
          stripePaymentId,
          accessExpiresAt: new Date(Date.now() + course.durationDays * 86400000),
        })
        .returning();
      return enrollment;
    }

    const [sub] = await this.db
      .select()
      .from(userSubscriptions)
      .innerJoin(
        subscriptionPlans,
        eq(userSubscriptions.planId, subscriptionPlans.id),
      )
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);

    if (sub && !sub.subscription_plans.isCourseOnly) {
      const [enrollment] = await this.db
        .insert(userCourseEnrollments)
        .values({
          userId,
          courseId,
          accessExpiresAt: new Date(Date.now() + course.durationDays * 86400000),
        })
        .returning();
      return enrollment;
    }

    throw new BadRequestException("Payment required for this course");
  }

  async getEnrollment(userId: string, courseId: string) {
    const [enrollment] = await this.db
      .select()
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.userId, userId),
          eq(userCourseEnrollments.courseId, courseId),
          eq(userCourseEnrollments.status, "active"),
        ),
      )
      .limit(1);
    return enrollment || null;
  }

  async createModule(courseId: string, data: { title: any; description?: any; sortOrder?: number }) {
    const [mod] = await this.db
      .insert(courseModules)
      .values({ courseId, title: data.title, description: data.description ?? {}, sortOrder: data.sortOrder ?? 0 })
      .returning();
    return mod;
  }

  async updateModule(moduleId: string, data: { title?: any; description?: any; sortOrder?: number }) {
    const [mod] = await this.db
      .update(courseModules)
      .set(data)
      .where(eq(courseModules.id, moduleId))
      .returning();
    if (!mod) throw new NotFoundException("Module not found");
    return mod;
  }

  async deleteModule(moduleId: string) {
    const [mod] = await this.db
      .delete(courseModules)
      .where(eq(courseModules.id, moduleId))
      .returning({ id: courseModules.id });
    if (!mod) throw new NotFoundException("Module not found");
    return { message: "Module deleted" };
  }

  async createLesson(moduleId: string, data: { title: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) {
    const [lesson] = await this.db
      .insert(courseLessons)
      .values({
        moduleId,
        title: data.title,
        contentType: data.contentType ?? "video",
        videoUrl: data.videoUrl,
        pdfUrl: data.pdfUrl,
        content: data.content,
        duration: data.duration ?? 0,
        sortOrder: data.sortOrder ?? 0,
        isFreePreview: data.isFreePreview ?? false,
      })
      .returning();
    return lesson;
  }

  async updateLesson(lessonId: string, data: { title?: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) {
    const [lesson] = await this.db
      .update(courseLessons)
      .set(data)
      .where(eq(courseLessons.id, lessonId))
      .returning();
    if (!lesson) throw new NotFoundException("Lesson not found");
    return lesson;
  }

  async deleteLesson(lessonId: string) {
    const [lesson] = await this.db
      .delete(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .returning({ id: courseLessons.id });
    if (!lesson) throw new NotFoundException("Lesson not found");
    return { message: "Lesson deleted" };
  }

  async getProgress(userId: string, courseId: string) {
    const rows = await this.db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId),
        ),
      );

    const [result] = await this.db
      .select({ total: sql<number>`count(${courseLessons.id})::int` })
      .from(courseLessons)
      .innerJoin(courseModules, eq(courseLessons.moduleId, courseModules.id))
      .where(eq(courseModules.courseId, courseId));

    const completedCount = rows.filter((r: any) => r.isCompleted).length;
    const totalLessons = result?.total || 0;

    return {
      completed: completedCount,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      lessons: rows,
    };
  }
}