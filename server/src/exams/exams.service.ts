import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";
import { DRIZZLE } from "../database/database.provider";
import { exams, specialties, subscriptionPlans, subtopics, topics, userSubscriptions } from "../database/schema";

@Injectable()
export class ExamsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll(user?: any) {
    let subExamId: string | null = null;
    if (user) {
      const [sub] = await this.db
        .select({ examId: subscriptionPlans.examId })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active"), isNull(userSubscriptions.canceledAt)))
        .limit(1);
      subExamId = sub?.examId || null;
    }

    const questionFilter = subExamId
      ? sql`questions.exam_id = ${subExamId}`
      : sql`(questions.exam_id = exams.id OR questions.exam_id IS NULL)`;

    const rows = await this.db
      .select({
        id: exams.id,
        slug: exams.slug,
        name: exams.name,
        description: exams.description,
        isActive: exams.isActive,
        sortOrder: exams.sortOrder,
        createdAt: exams.createdAt,
        _questionCount: sql<number>`(SELECT COUNT(*) FROM questions WHERE ${questionFilter} AND questions.is_active = true)`,
      })
      .from(exams)
      .where(eq(exams.isActive, true))
      .orderBy(asc(exams.sortOrder));
    return rows;
  }

  async findById(id: string) {
    const [exam] = await this.db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);
    if (!exam) throw new NotFoundException(this.i18n.t("exams.notFound"));

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
}