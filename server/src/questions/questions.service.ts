import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { questions, questionExams, questionOptions, questionImages, userSubscriptions, subscriptionPlans, users } from "../database/schema";
import { and, eq, isNull, ilike, asc, inArray, sql } from "drizzle-orm";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { getAccessibleExamId } from "../common/utils/access-helper";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll(filters: {
    examId?: string;
    specialtyId?: string;
    topicId?: string;
    subtopicId?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    search?: string;
  }, user?: any) {
    const { examId, specialtyId, topicId, subtopicId, difficulty, page = 1, limit = 20, search } = filters;
    const offset = (page - 1) * limit;
    const conditions = [eq(questions.isActive, true)];

    let isAdmin = false;
    let isCourseOnly = false;
    if (user) {
      const [u] = await this.db
        .select({ role: users.role, accountType: users.accountType })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      isAdmin = u && (u.role === "admin" || u.role === "super_admin");
      isCourseOnly = u?.accountType === "course_only";
    }

    let subExamId: string | null = null;
    if (user && !isAdmin) {
      if (isCourseOnly) {
        subExamId = "none";
      } else {
        const [sub] = await this.db
          .select({ planId: userSubscriptions.planId })
          .from(userSubscriptions)
          .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
          .limit(1);
        if (sub) {
          const [plan] = await this.db
            .select({ maxExamAttempts: subscriptionPlans.maxExamAttempts, price: subscriptionPlans.price })
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.id, sub.planId))
            .limit(1);
          if (plan && plan.maxExamAttempts == null && parseFloat(plan.price || "0") === 0) {
            return { data: [], total: 0, page, limit };
          }
        }
        subExamId = await this.getSubscriptionExamId(user.id);
      }
    }

    if (subExamId) {
      if (subExamId !== "__all__") {
        const subQIds = await this.db
          .select({ questionId: questionExams.questionId })
          .from(questionExams)
          .where(eq(questionExams.examId, subExamId));
        const subIds = subQIds.map((r: any) => r.questionId);
        conditions.push(inArray(questions.id, subIds));
        if (examId && examId !== subExamId) {
          return { data: [], total: 0, page, limit };
        }
      }
    } else if (examId && user && !isAdmin) {
      const [sub] = await this.db
        .select()
        .from(userSubscriptions)
        .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
        .limit(1);
      if (!sub) {
        const [u] = await this.db
          .select({ createdAt: users.createdAt, targetExamId: users.targetExamId })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        if (!u || !u.targetExamId || u.targetExamId !== examId || (Date.now() - new Date(u.createdAt).getTime()) > 86400000) {
          return { data: [], total: 0, page, limit };
        }
      }
      const examQIds = await this.db
        .select({ questionId: questionExams.questionId })
        .from(questionExams)
        .where(eq(questionExams.examId, examId));
      const eIds = examQIds.map((r: any) => r.questionId);
      conditions.push(inArray(questions.id, eIds));
    }

    if (specialtyId) conditions.push(eq(questions.specialtyId, specialtyId));
    if (topicId) conditions.push(eq(questions.topicId, topicId));
    if (subtopicId) conditions.push(eq(questions.subtopicId, subtopicId));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty));
    if (search) conditions.push(ilike(questions.text, `%${search}%`));

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(and(...conditions));

    const items = await this.db
      .select()
      .from(questions)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    if (!items.length) return { data: [], total: 0, page, limit };

    const qIds = items.map((q: any) => q.id);
    const allOptions = await this.db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, qIds))
      .orderBy(asc(questionOptions.sortOrder));

    const allImages = await this.db
      .select()
      .from(questionImages)
      .where(inArray(questionImages.questionId, qIds))
      .orderBy(asc(questionImages.sortOrder));

    const allExamLinks = await this.db
      .select()
      .from(questionExams)
      .where(inArray(questionExams.questionId, qIds));

    const optionsByQ = new Map<string, any[]>();
    for (const opt of allOptions) {
      if (!optionsByQ.has(opt.questionId)) optionsByQ.set(opt.questionId, []);
      optionsByQ.get(opt.questionId)!.push(opt);
    }

    const imagesByQ = new Map<string, any[]>();
    for (const img of allImages) {
      if (!imagesByQ.has(img.questionId)) imagesByQ.set(img.questionId, []);
      imagesByQ.get(img.questionId)!.push(img);
    }

    const examIdsByQ = new Map<string, string[]>();
    for (const link of allExamLinks) {
      if (!examIdsByQ.has(link.questionId)) examIdsByQ.set(link.questionId, []);
      examIdsByQ.get(link.questionId)!.push(link.examId);
    }

    return {
      data: items.map((q: any) => ({
        ...q,
        options: optionsByQ.get(q.id) || [],
        images: imagesByQ.get(q.id) || [],
        examIds: examIdsByQ.get(q.id) || [],
      })),
      total: count,
      page,
      limit,
    };
  }

  async findById(id: string, user?: any) {
    const [question] = await this.db
      .select()
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.isActive, true)))
      .limit(1);
    if (!question) throw new NotFoundException(this.i18n.t("questions.notFound"));

    if (user) {
      const [u] = await this.db
        .select({ role: users.role, accountType: users.accountType })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      const isAdmin = u && (u.role === "admin" || u.role === "super_admin");
      const isCourseOnly = u?.accountType === "course_only";
      if (isCourseOnly) {
        throw new ForbiddenException(this.i18n.t("questions.notFound"));
      }
      if (!isAdmin) {
        const subExamId = await this.getSubscriptionExamId(user.id);
        if (subExamId && subExamId !== "__all__") {
          const links = await this.db
            .select()
            .from(questionExams)
            .where(and(eq(questionExams.questionId, id), eq(questionExams.examId, subExamId)))
            .limit(1);
          if (!links.length) {
            throw new NotFoundException("Question not found");
          }
        }
      }
    }

    const options = await this.db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, id))
      .orderBy(asc(questionOptions.sortOrder));

    const images = await this.db
      .select()
      .from(questionImages)
      .where(eq(questionImages.questionId, id))
      .orderBy(asc(questionImages.sortOrder));

    const examLinks = await this.db
      .select()
      .from(questionExams)
      .where(eq(questionExams.questionId, id));

    return {
      ...question,
      options,
      images,
      examIds: examLinks.map((l: any) => l.examId),
    };
  }

  async create(data: any) {
    const { options, images, examIds, ...questionData } = data;
    const [question] = await this.db
      .insert(questions)
      .values(stripTimestamps(questionData))
      .returning();

    if (options?.length) {
      await this.db
        .insert(questionOptions)
        .values(options.map((o: any) => stripTimestamps({ ...o, questionId: question.id })));
    }
    if (images?.length) {
      await this.db
        .insert(questionImages)
        .values(images.map((i: any) => stripTimestamps({ ...i, questionId: question.id })));
    }
    if (examIds?.length) {
      await this.db
        .insert(questionExams)
        .values(examIds.map((eId: string) => ({ questionId: question.id, examId: eId })));
    }

    return this.findById(question.id);
  }

  async update(id: string, data: any) {
    const { options, images, examIds, createdBy, createdAt, updatedAt, deletedAt, examId, specialtyId, topicId, subtopicId, ...questionData } = data;
    const cleanData: any = { ...questionData, updatedAt: new Date() };
    if (examId !== undefined) cleanData.examId = examId || null;
    if (specialtyId !== undefined) cleanData.specialtyId = specialtyId || null;
    if (topicId !== undefined) cleanData.topicId = topicId || null;
    if (subtopicId !== undefined) cleanData.subtopicId = subtopicId || null;
    const [question] = await this.db
      .update(questions)
      .set(cleanData)
      .where(eq(questions.id, id))
      .returning();
    if (!question) throw new NotFoundException(this.i18n.t("questions.notFound"));

    if (options && options.length > 0) {
      await this.db
        .delete(questionOptions)
        .where(eq(questionOptions.questionId, id));
      await this.db
        .insert(questionOptions)
        .values(options.map((o: any) => stripTimestamps({ ...o, questionId: id })));
    }

    if (images) {
      await this.db
        .delete(questionImages)
        .where(eq(questionImages.questionId, id));
      if (images.length > 0) {
        await this.db
          .insert(questionImages)
          .values(images.map((i: any) => stripTimestamps({ ...i, questionId: id })));
      }
    }

    if (examIds) {
      await this.db
        .delete(questionExams)
        .where(eq(questionExams.questionId, id));
      if (examIds.length > 0) {
        await this.db
          .insert(questionExams)
          .values(examIds.map((eId: string) => ({ questionId: id, examId: eId })));
      }
    }

    return this.findById(id);
  }

  async softDelete(id: string) {
    const [question] = await this.db
      .update(questions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    if (!question) throw new NotFoundException(this.i18n.t("questions.notFound"));
    return { message: this.i18n.t("questions.deleted") };
  }

  private async getSubscriptionExamId(userId: string): Promise<string | null> {
    const examId = await getAccessibleExamId(this.db, userId);
    if (examId) return examId;

    const [user] = await this.db
      .select({ targetExamId: users.targetExamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.targetExamId || null;
  }
}
