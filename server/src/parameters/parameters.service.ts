import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { systemParameters } from "../database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class ParametersService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    return this.db.select().from(systemParameters).orderBy(systemParameters.key);
  }

  async findByKey(key: string) {
    const [param] = await this.db
      .select()
      .from(systemParameters)
      .where(eq(systemParameters.key, key))
      .limit(1);
    if (!param) throw new NotFoundException("Parameter not found");
    return param;
  }

  async create(data: { key: string; value: any; description?: string; updatedBy?: string }) {
    const [param] = await this.db.insert(systemParameters).values(data).returning();
    return param;
  }

  async update(key: string, data: { value?: any; description?: string; updatedBy?: string }) {
    const [param] = await this.db
      .update(systemParameters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(systemParameters.key, key))
      .returning();
    if (!param) throw new NotFoundException("Parameter not found");
    return param;
  }

  async remove(key: string) {
    const [param] = await this.db
      .delete(systemParameters)
      .where(eq(systemParameters.key, key))
      .returning();
    if (!param) throw new NotFoundException("Parameter not found");
    return { message: "Parameter deleted" };
  }
}