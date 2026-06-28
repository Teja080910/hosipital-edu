import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { stripTimestamps } from "../common/utils/strip-timestamps";
import { DRIZZLE } from "../database/database.provider";
import { systemParameters } from "../database/schema";
import { eq } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class ParametersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

  async findAll() {
    return this.db.select().from(systemParameters).orderBy(systemParameters.key);
  }

  async findByKey(key: string) {
    const [param] = await this.db
      .select()
      .from(systemParameters)
      .where(eq(systemParameters.key, key))
      .limit(1);
    if (!param) throw new NotFoundException(this.i18n.t("parameters.notFound"));
    return param;
  }

  async create(data: { key: string; value: any; description?: string; updatedBy?: string }) {
    const [param] = await this.db.insert(systemParameters).values(stripTimestamps(data)).returning();
    return param;
  }

  async update(key: string, data: { value?: any; description?: string; updatedBy?: string }) {
    const [param] = await this.db
      .update(systemParameters)
      .set({ ...stripTimestamps(data), updatedAt: new Date() })
      .where(eq(systemParameters.key, key))
      .returning();
    if (!param) throw new NotFoundException(this.i18n.t("parameters.notFound"));
    return param;
  }

  async remove(key: string) {
    const [param] = await this.db
      .delete(systemParameters)
      .where(eq(systemParameters.key, key))
      .returning();
    if (!param) throw new NotFoundException(this.i18n.t("parameters.notFound"));
    return { message: this.i18n.t("parameters.deleted") };
  }
}