import { Injectable, Inject } from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { DRIZZLE } from "../database/database.provider";
import { calendarEvents } from "../database/schema";
import { eq, and, gte, lte, type SQL } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class CalendarService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll(filters: { userId?: string; startDate?: Date; endDate?: Date }) {
    const conditions: SQL[] = [];
    if (filters.userId) conditions.push(eq(calendarEvents.userId, filters.userId));
    if (filters.startDate) conditions.push(gte(calendarEvents.eventDate, filters.startDate));
    if (filters.endDate) conditions.push(lte(calendarEvents.eventDate, filters.endDate));
    return this.db.select().from(calendarEvents).where(and(...conditions));
  }

  async create(data: any) {
    const cleaned: any = stripTimestamps(data);
    if (cleaned.eventDate && typeof cleaned.eventDate === "string") {
      cleaned.eventDate = new Date(cleaned.eventDate);
    }
    const [event] = await this.db.insert(calendarEvents).values(cleaned).returning();
    return event;
  }

  async update(id: string, data: any) {
    const cleaned: any = stripTimestamps(data);
    if (cleaned.eventDate && typeof cleaned.eventDate === "string") {
      cleaned.eventDate = new Date(cleaned.eventDate);
    }
    const [event] = await this.db
      .update(calendarEvents)
      .set({ ...cleaned, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async delete(id: string) {
    await this.db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return { message: this.i18n.t("common.eventDeleted") };
  }
}