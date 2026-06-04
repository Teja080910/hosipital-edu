import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { landingPageConfig } from "../database/schema";
import { eq, and } from "drizzle-orm";

@Injectable()
export class LandingService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(landingPageConfig)
      .where(eq(landingPageConfig.isActive, true));
  }

  async updateSection(section: string, config: any) {
    const [existing] = await this.db
      .select()
      .from(landingPageConfig)
      .where(eq(landingPageConfig.section, section))
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(landingPageConfig)
        .set({ config, updatedAt: new Date() })
        .where(eq(landingPageConfig.section, section))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(landingPageConfig)
      .values({ section, config, isActive: true })
      .returning();
    return created;
  }
}