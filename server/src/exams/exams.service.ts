import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { exams, specialties, topics, subtopics, questions } from "../database/schema";
import { eq, asc, inArray, sql } from "drizzle-orm";

@Injectable()
export class ExamsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    const rows = await this.db
      .select({
        id: exams.id,
        slug: exams.slug,
        name: exams.name,
        description: exams.description,
        isActive: exams.isActive,
        sortOrder: exams.sortOrder,
        createdAt: exams.createdAt,
        _questionCount: sql<number>`(SELECT COUNT(*) FROM questions WHERE (questions.exam_id = exams.id OR questions.exam_id IS NULL) AND questions.is_active = true)`,
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
    if (!exam) throw new NotFoundException("Exam not found");

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
    if (!exam) throw new NotFoundException("Exam not found");
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
    if (!exam) throw new NotFoundException("Exam not found");
    return exam;
  }
}