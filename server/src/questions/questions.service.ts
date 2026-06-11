import {
  Injectable,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { questions, questionOptions, questionImages } from "../database/schema";
import { and, eq, isNull, ilike, asc, inArray } from "drizzle-orm";

@Injectable()
export class QuestionsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(filters: {
    examId?: string;
    specialtyId?: string;
    topicId?: string;
    subtopicId?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { examId, specialtyId, topicId, subtopicId, difficulty, page = 1, limit = 20, search } = filters;
    const offset = (page - 1) * limit;
    const conditions = [eq(questions.isActive, true)];

    if (examId) conditions.push(eq(questions.examId, examId));
    if (specialtyId) conditions.push(eq(questions.specialtyId, specialtyId));
    if (topicId) conditions.push(eq(questions.topicId, topicId));
    if (subtopicId) conditions.push(eq(questions.subtopicId, subtopicId));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty));
    if (search) conditions.push(ilike(questions.text, `%${search}%`));

    const items = await this.db
      .select()
      .from(questions)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    if (!items.length) return items;

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

    return items.map((q: any) => ({ ...q, options: optionsByQ.get(q.id) || [], images: imagesByQ.get(q.id) || [] }));
  }

  async findById(id: string) {
    const [question] = await this.db
      .select()
      .from(questions)
      .where(and(eq(questions.id, id), eq(questions.isActive, true)))
      .limit(1);
    if (!question) throw new NotFoundException("Question not found");

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

    return { ...question, options, images };
  }

  async create(data: any) {
    const { options, images, ...questionData } = data;
    const [question] = await this.db
      .insert(questions)
      .values(questionData)
      .returning();

    if (options?.length) {
      await this.db
        .insert(questionOptions)
        .values(options.map((o: any) => ({ ...o, questionId: question.id })));
    }
    if (images?.length) {
      await this.db
        .insert(questionImages)
        .values(images.map((i: any) => ({ ...i, questionId: question.id })));
    }

    return this.findById(question.id);
  }

  async update(id: string, data: any) {
    const { options, images, createdBy, examId, specialtyId, topicId, ...questionData } = data;
    const cleanData: any = { ...questionData, updatedAt: new Date() };
    if (examId !== undefined) cleanData.examId = examId || null;
    if (specialtyId !== undefined) cleanData.specialtyId = specialtyId || null;
    if (topicId !== undefined) cleanData.topicId = topicId || null;
    const [question] = await this.db
      .update(questions)
      .set(cleanData)
      .where(eq(questions.id, id))
      .returning();
    if (!question) throw new NotFoundException("Question not found");

    if (options && options.length > 0) {
      await this.db
        .delete(questionOptions)
        .where(eq(questionOptions.questionId, id));
      await this.db
        .insert(questionOptions)
        .values(options.map((o: any) => ({ ...o, questionId: id })));
    }

    return this.findById(id);
  }

  async softDelete(id: string) {
    const [question] = await this.db
      .update(questions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    if (!question) throw new NotFoundException("Question not found");
    return { message: "Question deleted" };
  }
}