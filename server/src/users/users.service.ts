import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { users } from "../database/schema";
import { and, eq, isNull } from "drizzle-orm";

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const items = await this.db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .limit(limit)
      .offset(offset);
    return items;
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    return user;
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async softDelete(id: string) {
    const [user] = await this.db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException("User not found");
    return { message: "User deleted" };
  }
}