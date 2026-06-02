import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { calendarEvents } from "../database/schema";
import { eq, and, gte, lte, type SQL } from "drizzle-orm";

@Injectable()
export class CalendarService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(filters: { userId?: string; startDate?: Date; endDate?: Date }) {
    const conditions: SQL[] = [];
    if (filters.userId) conditions.push(eq(calendarEvents.userId, filters.userId));
    if (filters.startDate) conditions.push(gte(calendarEvents.eventDate, filters.startDate));
    if (filters.endDate) conditions.push(lte(calendarEvents.eventDate, filters.endDate));
    return this.db.select().from(calendarEvents).where(and(...conditions));
  }

  async create(data: any) {
    const [event] = await this.db.insert(calendarEvents).values(data).returning();
    return event;
  }

  async update(id: string, data: any) {
    const [event] = await this.db
      .update(calendarEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async delete(id: string) {
    await this.db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return { message: "Event deleted" };
  }
}