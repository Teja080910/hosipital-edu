import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import { videoModules, videoModuleExams, videoLessons } from "../database/schema";
import { eq, asc } from "drizzle-orm";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class StreamService {
  private apiToken: string;
  private accountId: string;
  private baseUrl: string;

  constructor(
    @Inject(DRIZZLE) private db: any,
    private config: ConfigService,
    private i18n: I18nService,
  ) {
    this.apiToken = this.config.get<string>("CLOUDFLARE_STREAM_TOKEN") || "";
    this.accountId = this.config.get<string>("CLOUDFLARE_ACCOUNT_ID") || "";
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  async generateUploadUrl() {
    const res = await fetch(`${this.baseUrl}/direct_upload`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ maxDurationSeconds: 3600 }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new HttpException(json.errors?.[0]?.message || this.i18n.t("stream.failedGenerateUploadUrl"), HttpStatus.BAD_GATEWAY);
    }
    return json.result;
  }

  async listVideos(search?: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: this.headers,
    });
    const json = await res.json();
    if (!json.success) {
      throw new HttpException(this.i18n.t("stream.failedListVideos"), HttpStatus.BAD_GATEWAY);
    }
    return json.result;
  }

  async getVideo(uid: string) {
    const res = await fetch(`${this.baseUrl}/${uid}`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) {
      throw new HttpException(this.i18n.t("stream.videoNotFound"), HttpStatus.NOT_FOUND);
    }
    return json.result;
  }

  async deleteVideo(uid: string) {
    const res = await fetch(`${this.baseUrl}/${uid}`, {
      method: "DELETE",
      headers: this.headers,
    });
    const json = await res.json();
    if (!json.success) {
      throw new HttpException(this.i18n.t("stream.failedDeleteVideo"), HttpStatus.BAD_GATEWAY);
    }
    return json;
  }

  async generateSignedToken(uid: string) {
    const res = await fetch(`${this.baseUrl}/${uid}/token`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new HttpException(this.i18n.t("stream.failedGenerateToken"), HttpStatus.BAD_GATEWAY);
    }
    return json.result;
  }

  async listModules() {
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
      const examLinks = await this.db
        .select()
        .from(videoModuleExams)
        .where(eq(videoModuleExams.moduleId, mod.id));
      result.push({ ...mod, lessons, examIds: examLinks.map((l: any) => l.examId) });
    }
    return result;
  }

  async getModule(id: string) {
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
    const examLinks = await this.db
      .select()
      .from(videoModuleExams)
      .where(eq(videoModuleExams.moduleId, id));
    return { ...mod, lessons, examIds: examLinks.map((l: any) => l.examId) };
  }

  async createModule(data: { title: any; description: any; examIds?: string[]; sortOrder?: number }) {
    const { examIds, ...moduleData } = data;
    const [mod] = await this.db
      .insert(videoModules)
      .values({
        ...moduleData,
        examId: null,
        sortOrder: data.sortOrder || 0,
      })
      .returning();
    if (examIds?.length) {
      await this.db
        .insert(videoModuleExams)
        .values(examIds.map((eId: string) => ({ moduleId: mod.id, examId: eId })));
    }
    return mod;
  }

  async updateModule(id: string, data: { title?: any; description?: any; examIds?: string[]; sortOrder?: number; isActive?: boolean }) {
    const { examIds, createdAt, updatedAt, deletedAt, ...cleanData } = data as any;
    const [mod] = await this.db
      .update(videoModules)
      .set(cleanData)
      .where(eq(videoModules.id, id))
      .returning();

    if (examIds) {
      await this.db
        .delete(videoModuleExams)
        .where(eq(videoModuleExams.moduleId, id));
      if (examIds.length > 0) {
        await this.db
          .insert(videoModuleExams)
          .values(examIds.map((eId: string) => ({ moduleId: id, examId: eId })));
      }
    }

    return mod;
  }

  async deleteModule(id: string) {
    await this.db.delete(videoModules).where(eq(videoModules.id, id));
  }

  async createLesson(data: {
    moduleId: string;
    title: any;
    description: any;
    videoUrl: string;
    duration?: number;
    sortOrder?: number;
  }) {
    const [lesson] = await this.db
      .insert(videoLessons)
      .values({
        moduleId: data.moduleId,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        duration: data.duration || 0,
        sortOrder: data.sortOrder || 0,
      })
      .returning();
    return lesson;
  }

  async updateLesson(id: string, data: {
    title?: any; description?: any; videoUrl?: string; duration?: number; sortOrder?: number; isActive?: boolean;
  }) {
    const { createdAt, updatedAt, deletedAt, ...cleanData } = data as any;
    const [lesson] = await this.db
      .update(videoLessons)
      .set(cleanData)
      .where(eq(videoLessons.id, id))
      .returning();
    return lesson;
  }

  async deleteLesson(id: string) {
    await this.db.delete(videoLessons).where(eq(videoLessons.id, id));
  }
}