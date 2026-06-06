import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { articles, articleTagsMapping } from "../database/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

@Injectable()
export class ArticlesService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(filters: { categoryId?: string; page?: number; limit?: number; publishedOnly?: boolean }) {
    const { categoryId, page = 1, limit = 20, publishedOnly = true } = filters;
    const offset = (page - 1) * limit;
    const conditions = [isNull(articles.deletedAt)];
    if (publishedOnly) conditions.push(eq(articles.isPublished, true));
    if (categoryId) conditions.push(eq(articles.categoryId, categoryId));

    return this.db
      .select()
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async findBySlug(slug: string) {
    const [article] = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), isNull(articles.deletedAt)))
      .limit(1);
    if (!article) throw new NotFoundException("Article not found");
    return article;
  }

  async create(data: any) {
    const existing = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, data.slug), isNull(articles.deletedAt)))
      .limit(1);
    if (existing.length) throw new ConflictException("An article with this slug already exists");
    const [article] = await this.db.insert(articles).values(data).returning();
    return article;
  }

  async update(id: string, data: any) {
    const [article] = await this.db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    if (!article) throw new NotFoundException("Article not found");
    return article;
  }

  async softDelete(id: string) {
    const [article] = await this.db
      .update(articles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    if (!article) throw new NotFoundException("Article not found");
    return { message: "Article deleted" };
  }
}