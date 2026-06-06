import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { translations } from "../database/schema";
import { eq, and, type SQL } from "drizzle-orm";

@Injectable()
export class TranslationsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(filters: { locale?: string; namespace?: string }) {
    const conditions: SQL[] = [];
    if (filters.locale) conditions.push(eq(translations.locale, filters.locale));
    if (filters.namespace) conditions.push(eq(translations.namespace, filters.namespace));
    return this.db.select().from(translations).where(and(...conditions));
  }

  async create(data: { key: string; locale: string; value: string; namespace?: string }) {
    const [existing] = await this.db
      .select()
      .from(translations)
      .where(and(eq(translations.key, data.key), eq(translations.locale, data.locale)))
      .limit(1);
    if (existing) throw new ConflictException("A translation with this key and locale already exists");
    const [t] = await this.db.insert(translations).values(data).returning();
    return t;
  }

  async update(id: string, data: { value?: string; updatedBy?: string }) {
    const [t] = await this.db
      .update(translations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(translations.id, id))
      .returning();
    return t;
  }

  async exportAll() {
    const items = await this.db.select().from(translations);
    const grouped: Record<string, Record<string, Record<string, string>>> = {};
    for (const item of items) {
      if (!grouped[item.locale]) grouped[item.locale] = {};
      if (!grouped[item.locale][item.namespace]) grouped[item.locale][item.namespace] = {};
      grouped[item.locale][item.namespace][item.key] = item.value;
    }
    return grouped;
  }

  async autoTranslate(sourceLocale: string, targetLocale: string, namespace?: string) {
    const conditions: SQL[] = [eq(translations.locale, sourceLocale)];
    if (namespace) conditions.push(eq(translations.namespace, namespace));
    const sourceItems = await this.db.select().from(translations).where(and(...conditions));

    for (const item of sourceItems) {
      const [existing] = await this.db
        .select()
        .from(translations)
        .where(
          and(
            eq(translations.key, item.key),
            eq(translations.locale, targetLocale),
          ),
        )
        .limit(1);
      if (!existing) {
        await this.db.insert(translations).values({
          key: item.key,
          locale: targetLocale,
          value: item.value,
          namespace: item.namespace,
        });
      }
    }
    return { message: `Auto-translate from ${sourceLocale} to ${targetLocale} complete` };
  }
}