import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { leads } from "../database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class LeadsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async create(data: { email: string; name?: string; source?: string; locale?: string }) {
    try {
      const [existing] = await this.db
        .select()
        .from(leads)
        .where(eq(leads.email, data.email))
        .limit(1);
      if (existing) {
        throw new ConflictException("This email is already registered");
      }
      const [lead] = await this.db.insert(leads).values(data).returning();
      return lead;
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      return { id: null, email: data.email };
    }
  }

  async findAll() {
    return this.db.select().from(leads).orderBy(leads.createdAt);
  }
}
