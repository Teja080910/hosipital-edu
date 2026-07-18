import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { DRIZZLE } from "../database/database.provider";
import { articles, userSubscriptions, subscriptionPlans } from "../database/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class ArticlesService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

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

  async findBySlug(slug: string, user?: any) {
    const [article] = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true), isNull(articles.deletedAt)))
      .limit(1);
    if (!article) throw new NotFoundException(this.i18n.t("articles.notFound"));

    if (article.isSubscriberOnly) {
      if (!user) throw new ForbiddenException(this.i18n.t("articles.subscriptionRequired"));
      const isAdmin = user.role === "admin" || user.role === "super_admin";
      if (!isAdmin) {
        const [sub] = await this.db
          .select()
          .from(userSubscriptions)
          .innerJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
          .where(and(eq(userSubscriptions.userId, user.id), eq(userSubscriptions.status, "active")))
          .limit(1);
        if (!sub) throw new ForbiddenException(this.i18n.t("articles.subscriptionRequired"));
      }
    }

    return article;
  }

  async create(data: any) {
    const existing = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, data.slug), isNull(articles.deletedAt)))
      .limit(1);
    if (existing.length) throw new ConflictException(this.i18n.t("articles.slugExists"));
    const [article] = await this.db.insert(articles).values(stripTimestamps(data)).returning();
    return article;
  }

  async update(id: string, data: any) {
    if (data.slug) {
      const existing = await this.db
        .select()
        .from(articles)
        .where(and(eq(articles.slug, data.slug), isNull(articles.deletedAt)))
        .limit(1);
      if (existing.length && existing[0].id !== id) throw new ConflictException(this.i18n.t("articles.slugExists"));
    }
    const [article] = await this.db
      .update(articles)
      .set({ ...stripTimestamps(data), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    if (!article) throw new NotFoundException(this.i18n.t("articles.notFound"));
    return article;
  }

  async softDelete(id: string) {
    const [article] = await this.db
      .update(articles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    if (!article) throw new NotFoundException(this.i18n.t("articles.notFound"));
    return { message: this.i18n.t("articles.deleted") };
  }
}