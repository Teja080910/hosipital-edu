import { Injectable, NotFoundException, Inject, BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import {
  courses,
  courseModules,
  courseLessons,
  courseQuizzes,
  courseQuizAttempts,
  userCourseEnrollments,
  userCourseProgress,
  courseComments,
  userSubscriptions,
  subscriptionPlans,
  exams,
  users,
  courseExams,
} from "../database/schema";
import { eq, and, asc, inArray, sql, desc, type SQL } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";
import { STRIPE } from "../subscriptions/stripe.provider";
import Stripe from "stripe";

@Injectable()
export class CoursesService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
    private config: ConfigService,
    @Inject(STRIPE) private stripe: Stripe,
  ) {}

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
        examId: courses.examId,
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
      .where(and(eq(courses.slug, slug), eq(courses.isActive, true)))
      .limit(1);
    if (!course) throw new NotFoundException(this.i18n.t("courses.notFound"));

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

    const ceRows = await this.db
      .select({ examId: courseExams.examId })
      .from(courseExams)
      .where(eq(courseExams.courseId, course.id));
    const examIds = ceRows.map((r: any) => r.examId);
    if (course.examId && !examIds.includes(course.examId)) examIds.push(course.examId);

    return { ...course, modules: modulesWithLessons, examIds };
  }

  async findIdBySlug(slug: string) {
    const [course] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.slug, slug), eq(courses.isActive, true)))
      .limit(1);
    if (!course) throw new NotFoundException(this.i18n.t("courses.notFound"));
    return course.id;
  }

  async create(data: any) {
    const { createdAt, updatedAt, deletedAt, examIds, ...cleanData } = data;
    const [course] = await this.db.insert(courses).values(cleanData).returning();
    if (examIds?.length) {
      await this.db.insert(courseExams).values(
        examIds.map((eId: string) => ({ courseId: course.id, examId: eId }))
      );
    }
    return course;
  }

  async update(id: string, data: any) {
    const { createdAt, updatedAt, deletedAt, examIds, ...cleanData } = data;
    const [course] = await this.db
      .update(courses)
      .set({ ...cleanData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    if (!course) throw new NotFoundException(this.i18n.t("courses.notFound"));
    if (examIds) {
      await this.db.delete(courseExams).where(eq(courseExams.courseId, id));
      if (examIds.length > 0) {
        await this.db.insert(courseExams).values(
          examIds.map((eId: string) => ({ courseId: id, examId: eId }))
        );
      }
    }
    return course;
  }

  async softDelete(id: string) {
    const [course] = await this.db
      .update(courses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    if (!course) throw new NotFoundException(this.i18n.t("courses.notFound"));
    return { message: this.i18n.t("courses.deleted") };
  }

  async enroll(userId: string, courseId: string, stripePaymentId?: string, locale?: string) {
    const [userRecord] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const isAdmin = userRecord && (userRecord.role === "admin" || userRecord.role === "super_admin");

    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new NotFoundException(this.i18n.t("courses.notFound"));

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

    if (existing) throw new BadRequestException(this.i18n.t("courses.alreadyEnrolled"));

    if (isAdmin) {
      const [enrollment] = await this.db
        .insert(userCourseEnrollments)
        .values({
          userId,
          courseId,
          stripePaymentId,
          accessExpiresAt: new Date(Date.now() + (course.durationDays || 365) * 86400000),
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

    const isCourseOnly = sub?.subscription_plans?.isCourseOnly;
    const subCourseId = sub?.subscription_plans?.courseId;

    if (isCourseOnly && subCourseId !== courseId) {
      throw new BadRequestException(this.i18n.t("courses.paymentRequired"));
    }

    const isValidStripeSession = stripePaymentId?.startsWith("cs_");
    const subExamId = sub?.subscription_plans?.examId;
    if (sub && !isCourseOnly && subExamId && subExamId !== course.examId) {
      throw new BadRequestException(this.i18n.t("courses.paymentRequired"));
    }

    if (parseFloat(course.price) === 0 || isValidStripeSession || (sub && !isCourseOnly) || (isCourseOnly && subCourseId === courseId)) {
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

    if (!stripePaymentId) {
      const appUrl = this.config.get<string>("APP_URL") || "http://localhost:4175";
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: course.title?.en || "Course" },
            unit_amount: Math.round(parseFloat(course.price) * 100),
          },
          quantity: 1,
        }],
        client_reference_id: userId,
        metadata: { courseId, type: "course_enrollment" },
        success_url: `${appUrl}/${locale || "en"}/dashboard/courses/${course.slug}?enroll=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/${locale || "en"}/dashboard/courses/${course.slug}`,
      });
      return { url: session.url };
    }

    throw new BadRequestException(this.i18n.t("courses.paymentRequired"));
  }

  async checkAccess(userId: string, courseId: string) {
    const [userRecord] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (userRecord && (userRecord.role === "admin" || userRecord.role === "super_admin")) {
      return { hasAccess: true };
    }

    const [course] = await this.db
      .select({ examId: courses.examId, sortOrder: courses.sortOrder, id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) return { hasAccess: false };

    const ceRows = await this.db
      .select({ examId: courseExams.examId })
      .from(courseExams)
      .where(eq(courseExams.courseId, courseId));
    const courseExamIds: string[] = [];
    if (course.examId) courseExamIds.push(course.examId);
    ceRows.forEach((r: any) => { if (!courseExamIds.includes(r.examId)) courseExamIds.push(r.examId); });

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

    if (sub) {
      const plan = sub.subscription_plans;
      if (plan.isCourseOnly) {
        if (plan.courseId !== courseId) {
          return { hasAccess: false };
        }
        return { hasAccess: true };
      }
      if (courseExamIds.length > 0) {
        if (plan.examId && courseExamIds.includes(plan.examId)) return { hasAccess: true };
        const [planUser] = await this.db
          .select({ targetExamId: users.targetExamId })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (planUser?.targetExamId && courseExamIds.includes(planUser.targetExamId)) return { hasAccess: true };
        return { hasAccess: false };
      }
      if (parseFloat(plan.price) > 0) {
        return { hasAccess: true };
      }
    }

    const [user] = await this.db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
      if (hoursSinceRegistration <= 24) {
        const [firstCourse] = await this.db
          .select({ id: courses.id })
          .from(courses)
          .where(eq(courses.isActive, true))
          .orderBy(asc(courses.sortOrder))
          .limit(1);
        if (firstCourse && firstCourse.id === courseId) {
          return { hasAccess: true, isTrial: true };
        }
      }
    }

    return { hasAccess: false };
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
    const { createdAt, updatedAt, deletedAt, ...cleanData } = data as any;
    const [mod] = await this.db
      .update(courseModules)
      .set(cleanData)
      .where(eq(courseModules.id, moduleId))
      .returning();
    if (!mod) throw new NotFoundException(this.i18n.t("courses.moduleNotFound"));
    return mod;
  }

  async deleteModule(moduleId: string) {
    const [mod] = await this.db
      .delete(courseModules)
      .where(eq(courseModules.id, moduleId))
      .returning({ id: courseModules.id });
    if (!mod) throw new NotFoundException(this.i18n.t("courses.moduleNotFound"));
    return { message: this.i18n.t("courses.moduleDeleted") };
  }

  async createLesson(moduleId: string, data: { title: any; contentType?: string; videoUrl?: string; pdfUrl?: string; imageUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) {
    const [lesson] = await this.db
      .insert(courseLessons)
      .values({
        moduleId,
        title: data.title,
        contentType: data.contentType ?? "video",
        videoUrl: data.videoUrl,
        pdfUrl: data.pdfUrl,
        imageUrl: data.imageUrl,
        content: data.content,
        duration: data.duration ?? 0,
        sortOrder: data.sortOrder ?? 0,
        isFreePreview: data.isFreePreview ?? false,
      })
      .returning();
    return lesson;
  }

  async updateLesson(lessonId: string, data: { title?: any; contentType?: string; videoUrl?: string; pdfUrl?: string; imageUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean }) {
    const { createdAt, updatedAt, deletedAt, ...cleanData } = data as any;
    const [lesson] = await this.db
      .update(courseLessons)
      .set(cleanData)
      .where(eq(courseLessons.id, lessonId))
      .returning();
    if (!lesson) throw new NotFoundException(this.i18n.t("courses.lessonNotFound"));
    return lesson;
  }

  async deleteLesson(lessonId: string) {
    const [lesson] = await this.db
      .delete(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .returning({ id: courseLessons.id });
    if (!lesson) throw new NotFoundException(this.i18n.t("courses.lessonNotFound"));
    return { message: this.i18n.t("courses.lessonDeleted") };
  }

  async completeLesson(userId: string, courseId: string, lessonId: string) {
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
    if (!enrollment) throw new ForbiddenException(this.i18n.t("courses.notEnrolled"));

    const [existing] = await this.db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.lessonId, lessonId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(userCourseProgress)
        .set({ isCompleted: true, completedAt: new Date(), updatedAt: new Date() })
        .where(eq(userCourseProgress.id, existing.id))
        .returning();
      return updated;
    }

    const [lesson] = await this.db
      .select({ moduleId: courseLessons.moduleId })
      .from(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .limit(1);
    if (!lesson) throw new NotFoundException(this.i18n.t("courses.lessonNotFound"));

    const [progress] = await this.db
      .insert(userCourseProgress)
      .values({
        userId,
        courseId,
        moduleId: lesson.moduleId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      })
      .returning();
    return progress;
  }

  async incompleteLesson(userId: string, courseId: string, lessonId: string) {
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
    if (!enrollment) throw new ForbiddenException(this.i18n.t("courses.notEnrolled"));

    const [existing] = await this.db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.lessonId, lessonId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(userCourseProgress)
        .set({ isCompleted: false, completedAt: null, updatedAt: new Date() })
        .where(eq(userCourseProgress.id, existing.id))
        .returning();
      return updated;
    }

    throw new NotFoundException(this.i18n.t("courses.progressNotFound"));
  }

  async getComments(courseId: string) {
    return this.db
      .select()
      .from(courseComments)
      .where(
        and(
          eq(courseComments.courseId, courseId),
          sql`${courseComments.deletedAt} IS NULL`,
        ),
      )
      .orderBy(asc(courseComments.createdAt));
  }

  async addComment(userId: string, courseId: string, data: { body: string; lessonId?: string; parentId?: string }) {
    const [comment] = await this.db
      .insert(courseComments)
      .values({
        userId,
        courseId,
        lessonId: data.lessonId,
        parentId: data.parentId,
        body: data.body,
      })
      .returning();
    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const [comment] = await this.db
      .select()
      .from(courseComments)
      .where(eq(courseComments.id, commentId))
      .limit(1);
    if (!comment) throw new NotFoundException(this.i18n.t("courses.commentNotFound"));
    if (comment.userId !== userId) throw new ForbiddenException(this.i18n.t("courses.notYourComment"));

    const [deleted] = await this.db
      .update(courseComments)
      .set({ deletedAt: new Date() })
      .where(eq(courseComments.id, commentId))
      .returning();
    return { message: this.i18n.t("courses.commentDeleted") };
  }

  async getLessonQuiz(lessonId: string) {
    const [quiz] = await this.db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.lessonId, lessonId))
      .limit(1);
    if (!quiz) return null;
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions = quiz.questions.map((q: any) => {
        const { correctIndex, ...rest } = q;
        return rest;
      });
    }
    return quiz;
  }

  async getCourseQuiz(courseId: string, type: "pre_test" | "post_test") {
    const [quiz] = await this.db
      .select()
      .from(courseQuizzes)
      .where(
        and(
          eq(courseQuizzes.courseId, courseId),
          eq(courseQuizzes.type, type),
        ),
      )
      .limit(1);
    if (!quiz) return null;
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions = quiz.questions.map((q: any) => {
        const { correctIndex, ...rest } = q;
        return rest;
      });
    }
    return quiz;
  }

  async getTestResults(userId: string, courseId: string) {
    const quizzes = await this.db
      .select()
      .from(courseQuizzes)
      .where(
        and(
          eq(courseQuizzes.courseId, courseId),
          inArray(courseQuizzes.type, ["pre_test", "post_test"]),
        ),
      );

    const results: Record<string, any> = {};
    for (const quiz of quizzes) {
      const [best] = await this.db
        .select()
        .from(courseQuizAttempts)
        .where(
          and(
            eq(courseQuizAttempts.quizId, quiz.id),
            eq(courseQuizAttempts.userId, userId),
            eq(courseQuizAttempts.passed, true),
          ),
        )
        .orderBy(desc(courseQuizAttempts.score))
        .limit(1);

      results[quiz.type] = best
        ? { score: best.score, passed: true, completedAt: best.completedAt }
        : null;
    }

    return results;
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