import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { exams, specialties, topics, subtopics } from "../database/schema";
import { eq, asc } from "drizzle-orm";

@Injectable()
export class ExamsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(exams)
      .where(eq(exams.isActive, true))
      .orderBy(asc(exams.sortOrder));
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

    const specsWithTopics: any[] = [];
    for (const spec of specs) {
      const topicList = await this.db
        .select()
        .from(topics)
        .where(eq(topics.specialtyId, spec.id))
        .orderBy(asc(topics.sortOrder));

      const topicsWithSubtopics: any[] = [];
      for (const topic of topicList) {
        const subList = await this.db
          .select()
          .from(subtopics)
          .where(eq(subtopics.topicId, topic.id))
          .orderBy(asc(subtopics.sortOrder));
        topicsWithSubtopics.push({ ...topic, subtopics: subList });
      }

      specsWithTopics.push({ ...spec, topics: topicsWithSubtopics });
    }

    return { ...exam, specialties: specsWithTopics };
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
    const [exam] = await this.db.insert(exams).values(data).returning();
    return exam;
  }

  async update(id: string, data: any) {
    const [exam] = await this.db
      .update(exams)
      .set(data)
      .where(eq(exams.id, id))
      .returning();
    if (!exam) throw new NotFoundException("Exam not found");
    return exam;
  }
}