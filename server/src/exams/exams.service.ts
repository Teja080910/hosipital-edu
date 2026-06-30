import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";
import { getAccessibleExamId } from "../common/utils/access-helper";
import { DRIZZLE } from "../database/database.provider";
import { exams, questionExams, specialties, subscriptionPlans, subtopics, topics, userSubscriptions } from "../database/schema";

@Injectable()
export class ExamsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll(user?: any) {
    let allowedExamId: string | null = null;
    let hasAccess = false;
    if (user) {
      const isAdmin = user.role === "admin" || user.role === "super_admin";
      if (!isAdmin) {
        const [sub] = await this.db
          .select({ examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
          .from(userSubscriptions)
          .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
          .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
          .limit(1);
        if (sub && !sub.isCourseOnly) {
          if (sub.examId) {
            allowedExamId = sub.examId;
          }
          hasAccess = true;
        } else if (user.targetExamId) {
          allowedExamId = user.targetExamId;
          const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
          if (hoursSinceRegistration <= 24) {
            hasAccess = true;
          }
        }
      } else {
        hasAccess = true;
      }
    }

    if (user && !allowedExamId && !hasAccess && user.role !== "admin" && user.role !== "super_admin") return [];

    const questionFilter = allowedExamId
      ? sql`(SELECT COUNT(*) FROM question_exams WHERE question_exams.exam_id = ${allowedExamId} AND question_exams.question_id = questions.id)`
      : sql`(SELECT COUNT(*) FROM question_exams WHERE question_exams.exam_id = exams.id AND question_exams.question_id = questions.id)`;

    const examFilter = allowedExamId
      ? eq(exams.id, allowedExamId)
      : eq(exams.isActive, true);

    const rows = await this.db
      .select({
        id: exams.id,
        slug: exams.slug,
        name: exams.name,
        description: exams.description,
        isActive: exams.isActive,
        sortOrder: exams.sortOrder,
        createdAt: exams.createdAt,
        _questionCount: sql<number>`(SELECT COUNT(*) FROM questions WHERE ${questionFilter} > 0 AND questions.is_active = true)`,
      })
      .from(exams)
      .where(examFilter)
      .orderBy(asc(exams.sortOrder));
    return rows.map((r) => ({ ...r, hasAccess }));
  }

  async findSubscribed(user: any) {
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    let allowedExamId: string | null = null;
    let hasAccess = false;

    if (!isAdmin) {
      const [sub] = await this.db
        .select({ examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
        .limit(1);

      if (sub && sub.isCourseOnly) return [];
      if (sub) {
        if (sub.examId) {
          allowedExamId = sub.examId;
        }
        hasAccess = true;
      } else if (user.targetExamId) {
        allowedExamId = user.targetExamId;
        const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
        if (hoursSinceRegistration <= 24) {
          hasAccess = true;
        }
      }
    } else {
      hasAccess = true;
    }

    const questionFilter = allowedExamId
      ? sql`EXISTS (SELECT 1 FROM question_exams WHERE question_exams.exam_id = ${allowedExamId} AND question_exams.question_id = questions.id) OR questions.exam_id = ${allowedExamId}`
      : sql`EXISTS (SELECT 1 FROM question_exams WHERE question_exams.exam_id = exams.id AND question_exams.question_id = questions.id) OR questions.exam_id = exams.id`;

    const examFilter = allowedExamId
      ? eq(exams.id, allowedExamId)
      : eq(exams.isActive, true);

    const rows = await this.db
      .select({
        id: exams.id,
        slug: exams.slug,
        name: exams.name,
        description: exams.description,
        isActive: exams.isActive,
        sortOrder: exams.sortOrder,
        createdAt: exams.createdAt,
        _questionCount: sql<number>`(SELECT COUNT(*) FROM questions WHERE (${questionFilter}) AND questions.is_active = true)`,
      })
      .from(exams)
      .where(examFilter)
      .orderBy(asc(exams.sortOrder));
    return rows.map((r) => ({ ...r, hasAccess }));
  }

  async findById(id: string, user?: any) {
    const [exam] = await this.db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);
    if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));

    if (user) {
      const isAdmin = user.role === "admin" || user.role === "super_admin";
      if (!isAdmin) {
        const [sub] = await this.db
          .select({ examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
          .from(userSubscriptions)
          .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
          .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
          .limit(1);

        if (!sub || sub.isCourseOnly) {
          if (user.targetExamId && user.targetExamId === id) {
            // Allow viewing exam details (specialties/topics) even after trial
          } else if (!sub) {
            throw new ForbiddenException(this.i18n.t("exams.subscriptionNotIncludeExam"));
          }
          // sub exists but isCourseOnly and no targetExamId match -> blocked
        } else if (sub.examId && sub.examId !== id) {
          throw new ForbiddenException(this.i18n.t("exams.subscriptionNotIncludeExam"));
        }
        // sub exists, not courseOnly, no examId (general plan) -> allowed
      }
    }

    const specs = await this.db
      .select()
      .from(specialties)
      .where(eq(specialties.examId, id))
      .orderBy(asc(specialties.sortOrder));

    if (!specs.length) return { ...exam, specialties: [] };

    const specIds = specs.map((s: any) => s.id);
    const topRows = await this.db
      .select()
      .from(topics)
      .where(inArray(topics.specialtyId, specIds))
      .orderBy(asc(topics.sortOrder));

    let specialtiesWithTopics = specs.map((s: any) => ({
      ...s,
      topics: topRows.filter((t: any) => t.specialtyId === s.id),
    }));

    const topicIds = topRows.map((t: any) => t.id);
    if (topicIds.length) {
      const subRows = await this.db
        .select()
        .from(subtopics)
        .where(inArray(subtopics.topicId, topicIds))
        .orderBy(asc(subtopics.sortOrder));

      specialtiesWithTopics = specialtiesWithTopics.map((s: any) => ({
        ...s,
        topics: s.topics.map((t: any) => ({
          ...t,
          subtopics: subRows.filter((sub: any) => sub.topicId === t.id),
        })),
      }));
    }

    return { ...exam, specialties: specialtiesWithTopics };
  }

  async findBySlug(slug: string) {
    const [exam] = await this.db
      .select()
      .from(exams)
      .where(eq(exams.slug, slug))
      .limit(1);
    if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));
    return exam;
  }

  async create(data: any) {
    const { createdAt, updatedAt, deletedAt, ...cleanData } = data;
    const [exam] = await this.db.insert(exams).values(cleanData).returning();
    return exam;
  }

  async update(id: string, data: any) {
    const { createdAt, updatedAt, deletedAt, ...cleanData } = data;
    const [exam] = await this.db
      .update(exams)
      .set(cleanData)
      .where(eq(exams.id, id))
      .returning();
    if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));
    return exam;
  }

  // ─── Specialty CRUD ───

  async createSpecialty(examId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [spec] = await this.db
      .insert(specialties)
      .values({ ...clean, examId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
      .returning();
    return spec;
  }

  async updateSpecialty(id: string, data: any) {
    const { createdAt, updatedAt, ...clean } = data;
    const [spec] = await this.db
      .update(specialties)
      .set(clean)
      .where(eq(specialties.id, id))
      .returning();
    if (!spec) throw new NotFoundException("Specialty not found");
    return spec;
  }

  async deleteSpecialty(id: string) {
    await this.db.delete(specialties).where(eq(specialties.id, id));
    return { deleted: true };
  }

  // ─── Topic CRUD ───

  async createTopic(specialtyId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [topic] = await this.db
      .insert(topics)
      .values({ ...clean, specialtyId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
      .returning();
    return topic;
  }

  async updateTopic(id: string, data: any) {
    const { createdAt, updatedAt, ...clean } = data;
    const [topic] = await this.db
      .update(topics)
      .set(clean)
      .where(eq(topics.id, id))
      .returning();
    if (!topic) throw new NotFoundException("Topic not found");
    return topic;
  }

  async deleteTopic(id: string) {
    await this.db.delete(topics).where(eq(topics.id, id));
    return { deleted: true };
  }

  // ─── Subtopic CRUD ───

  async createSubtopic(topicId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [sub] = await this.db
      .insert(subtopics)
      .values({ ...clean, topicId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
      .returning();
    return sub;
  }

  async updateSubtopic(id: string, data: any) {
    const { createdAt, updatedAt, ...clean } = data;
    const [sub] = await this.db
      .update(subtopics)
      .set(clean)
      .where(eq(subtopics.id, id))
      .returning();
    if (!sub) throw new NotFoundException("Subtopic not found");
    return sub;
  }

  async deleteSubtopic(id: string) {
    await this.db.delete(subtopics).where(eq(subtopics.id, id));
    return { deleted: true };
  }
}