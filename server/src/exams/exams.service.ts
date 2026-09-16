import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";
import { DRIZZLE } from "../database/database.provider";
import { examAttempts, exams, questionExams, questions, specialties, subscriptionPlans, planExams, subtopics, topics, userSubscriptions, users } from "../database/schema";

@Injectable()
export class ExamsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll(user?: any) {
    let sub: any = null;
    let isAdmin = user && (user.role === "admin" || user.role === "super_admin");
    if (user && !isAdmin) {
      [sub] = await this.db
        .select({ planId: subscriptionPlans.id, examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(and(eq(userSubscriptions.userId, user.id), inArray(userSubscriptions.status, ["active", "cancelling"]), gt(userSubscriptions.currentPeriodEnd, new Date())))
        .limit(1);
    }

    const rows = await this.db
      .select({
        id: exams.id,
        slug: exams.slug,
        name: exams.name,
        description: exams.description,
        isActive: exams.isActive,
        sortOrder: exams.sortOrder,
        createdAt: exams.createdAt,
        _questionCount: sql`(SELECT COUNT(*) FROM questions WHERE (SELECT COUNT(*) FROM question_exams WHERE question_exams.exam_id = exams.id AND question_exams.question_id = questions.id) > 0 AND questions.is_active = true)`,
      })
      .from(exams)
      .where(eq(exams.isActive, true))
      .orderBy(asc(exams.sortOrder));

    let planExamIds: string[] = [];
    if (sub?.planId) {
      const peRows = await this.db
        .select({ examId: planExams.examId })
        .from(planExams)
        .where(eq(planExams.planId, sub.planId));
      planExamIds = peRows.map((r: any) => r.examId);
    }

    return rows.map((r: typeof rows[number]) => {
      let hasAccess = false;
      if (isAdmin) {
        hasAccess = true;
      } else if (sub) {
        if (planExamIds.length > 0) {
          hasAccess = planExamIds.includes(r.id);
        } else if (!sub.examId || sub.examId === r.id) {
          hasAccess = true;
        }
      } else if (user && user.targetExamId === r.id) {
        const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
        if (hoursSinceRegistration <= 24) {
          hasAccess = true;
        }
      }
      return { ...r, hasAccess };
    });
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
          .select({ planId: subscriptionPlans.id, examId: subscriptionPlans.examId, isCourseOnly: subscriptionPlans.isCourseOnly })
          .from(userSubscriptions)
          .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
          .where(and(eq(userSubscriptions.userId, user.id), inArray(userSubscriptions.status, ["active", "cancelling"]), gt(userSubscriptions.currentPeriodEnd, new Date())))
          .limit(1);

        if (!sub) {
          if (user.targetExamId && user.targetExamId === id) {
            const hoursSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / 3600000;
            if (hoursSinceRegistration > 24) {
              throw new ForbiddenException(this.i18n.t("exams.subscriptionNotIncludeExam"));
            }
          } else {
            throw new ForbiddenException(this.i18n.t("exams.subscriptionNotIncludeExam"));
          }
        } else {
          if (sub.examId && sub.examId !== id) {
            const peRows = await this.db
              .select({ examId: planExams.examId })
              .from(planExams)
              .where(eq(planExams.planId, sub.planId));
            const planExamIds = peRows.map((r: any) => r.examId);
            if (!planExamIds.includes(id)) {
              throw new ForbiddenException(this.i18n.t("exams.subscriptionNotIncludeExam"));
            }
          }
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
    if (!cleanData.slug) {
      const nameVal = (cleanData.name && (cleanData.name.en || Object.values(cleanData.name)[0])) || "";
      cleanData.slug = String(nameVal)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!cleanData.description) {
      cleanData.description = {};
    }
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

  async deleteExam(id: string, force = false) {
    const [exam] = await this.db.select({ id: exams.id }).from(exams).where(eq(exams.id, id)).limit(1);
    if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));

    const [{ c: attemptCount }] = await this.db
      .select({ c: count() })
      .from(examAttempts)
      .where(eq(examAttempts.examId, id));

    const [{ c: questionCount }] = await this.db
      .select({ c: count() })
      .from(questions)
      .where(
        sql`(${questions.specialtyId} IN (SELECT id FROM specialties WHERE exam_id = ${id})
          OR ${questions.topicId} IN (SELECT id FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = ${id})))`,
      );

    if (!force && (attemptCount > 0 || questionCount > 0)) {
      const key =
        attemptCount > 0 && questionCount > 0
          ? "exams.examInUseBoth"
          : attemptCount > 0
            ? "exams.examInUseAttempts"
            : "exams.examInUseQuestions";
      throw new ConflictException(this.i18n.t(key, { count: attemptCount || questionCount, attempts: attemptCount, questions: questionCount }));
    }

    if (attemptCount > 0) {
      await this.db.delete(examAttempts).where(eq(examAttempts.examId, id));
    }
    if (questionCount > 0) {
      await this.db
        .update(questions)
        .set({ specialtyId: null, topicId: null })
        .where(
          sql`(${questions.specialtyId} IN (SELECT id FROM specialties WHERE exam_id = ${id})
            OR ${questions.topicId} IN (SELECT id FROM topics WHERE specialty_id IN (SELECT id FROM specialties WHERE exam_id = ${id})))`,
        );
    }

    await this.db.delete(exams).where(eq(exams.id, id));
    return { deleted: true, removedAttempts: attemptCount, detachedQuestions: questionCount };
  }

  // ─── Specialty CRUD ───

  async createSpecialty(examId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [spec] = await this.db
      .insert(specialties)
      .values({ ...clean, examId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.name?.en || clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
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
    const [{ c: questionCount }] = await this.db
      .select({ c: count() })
      .from(questions)
      .where(eq(questions.specialtyId, id));
    if (questionCount > 0) throw new ConflictException(this.i18n.t("exams.specialtyInUse", { count: questionCount }));
    await this.db.delete(specialties).where(eq(specialties.id, id));
    return { deleted: true };
  }

  // ─── Topic CRUD ───

  async createTopic(specialtyId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [topic] = await this.db
      .insert(topics)
      .values({ ...clean, specialtyId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.name?.en || clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
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
    const [{ c: questionCount }] = await this.db
      .select({ c: count() })
      .from(questions)
      .where(eq(questions.topicId, id));
    if (questionCount > 0) throw new ConflictException(this.i18n.t("exams.topicInUse", { count: questionCount }));
    await this.db.delete(topics).where(eq(topics.id, id));
    return { deleted: true };
  }

  // ─── Subtopic CRUD ───

  async createSubtopic(topicId: string, data: any) {
    const { id, createdAt, ...clean } = data;
    const [sub] = await this.db
      .insert(subtopics)
      .values({ ...clean, topicId, name: clean.name || { en: clean.nameEn || "" }, slug: clean.slug || (clean.name?.en || clean.nameEn || "").toLowerCase().replace(/\s+/g, "-") })
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

  async copyQuestions(sourceExamId: string, targetExamId: string) {
    const [source] = await this.db.select({ id: exams.id }).from(exams).where(eq(exams.id, sourceExamId)).limit(1);
    const [target] = await this.db.select({ id: exams.id }).from(exams).where(eq(exams.id, targetExamId)).limit(1);
    if (!source) throw new NotFoundException("Source exam not found");
    if (!target) throw new NotFoundException("Target exam not found");

    const sourceLinks = await this.db
      .select({ questionId: questionExams.questionId })
      .from(questionExams)
      .where(eq(questionExams.examId, sourceExamId));

    if (!sourceLinks.length) return { copied: 0, message: "No questions found in source exam" };

    const sourceQIds = sourceLinks.map((l: any) => l.questionId);
    const existingTargetLinks = await this.db
      .select({ questionId: questionExams.questionId })
      .from(questionExams)
      .where(eq(questionExams.examId, targetExamId));
    const existingIds = new Set(existingTargetLinks.map((l: any) => l.questionId));
    const toInsert = sourceQIds.filter((id: string) => !existingIds.has(id));

    if (!toInsert.length) return { copied: 0, message: "All source questions already exist in target exam" };

    await this.db.insert(questionExams).values(
      toInsert.map((questionId: string) => ({ questionId, examId: targetExamId })),
    );

    return { copied: toInsert.length, message: `Copied ${toInsert.length} questions from source to target` };
  }
}