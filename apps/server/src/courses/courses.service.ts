import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  courses,
  courseModules,
  courseLessons,
  courseQuizzes,
  userCourseEnrollments,
  userCourseProgress,
} from "../database/schema";
import { eq, and, asc, type SQL } from "drizzle-orm";

@Injectable()
export class CoursesService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(onlyActive = true) {
    const conditions: SQL[] = [];
    if (onlyActive) conditions.push(eq(courses.isActive, true));
    return this.db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(asc(courses.sortOrder));
  }

  async findBySlug(slug: string) {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (!course) throw new NotFoundException("Course not found");

    const mods = await this.db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .orderBy(asc(courseModules.sortOrder));

    const modulesWithLessons: Array<Record<string, unknown>> = [];
    for (const mod of mods) {
      const lessons = await this.db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.moduleId, mod.id))
        .orderBy(asc(courseLessons.sortOrder));
      modulesWithLessons.push({ ...mod, lessons });
    }

    return { ...course, modules: modulesWithLessons };
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

    const accessExpiresAt = new Date();
    accessExpiresAt.setDate(accessExpiresAt.getDate() + course.durationDays);

    const [enrollment] = await this.db
      .insert(userCourseEnrollments)
      .values({
        userId,
        courseId,
        stripePaymentId,
        accessExpiresAt,
      })
      .returning();
    return enrollment;
  }

  async getProgress(userId: string, courseId: string) {
    return this.db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId),
        ),
      );
  }
}