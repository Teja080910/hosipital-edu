import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import { videoModules, videoLessons } from "../database/schema";
import { eq, asc } from "drizzle-orm";

@Injectable()
export class VideosService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findAll() {
    const modules = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.isActive, true))
      .orderBy(asc(videoModules.sortOrder));

    const result: Array<Record<string, unknown>> = [];
    for (const mod of modules) {
      const lessons = await this.db
        .select()
        .from(videoLessons)
        .where(eq(videoLessons.moduleId, mod.id))
        .orderBy(asc(videoLessons.sortOrder));
      result.push({ ...mod, lessons });
    }
    return result;
  }

  async findById(id: string) {
    const [mod] = await this.db
      .select()
      .from(videoModules)
      .where(eq(videoModules.id, id))
      .limit(1);

    if (!mod) return null;

    const lessons = await this.db
      .select()
      .from(videoLessons)
      .where(eq(videoLessons.moduleId, id))
      .orderBy(asc(videoLessons.sortOrder));

    return { ...mod, lessons };
  }
}