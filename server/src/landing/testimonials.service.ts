import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { testimonials } from "../database/schema";
import { eq, asc } from "drizzle-orm";

@Injectable()
export class TestimonialsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(asc(testimonials.sortOrder));
  }

  async findAllAdmin() {
    return this.db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder));
  }

  async create(data: any) {
    const [created] = await this.db
      .insert(testimonials)
      .values(data)
      .returning();
    return created;
  }

  async update(id: string, data: any) {
    const [updated] = await this.db
      .update(testimonials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1);
    if (!existing) throw new NotFoundException("Testimonial not found");
    await this.db
      .delete(testimonials)
      .where(eq(testimonials.id, id));
  }
}
