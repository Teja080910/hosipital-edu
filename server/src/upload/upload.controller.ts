import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { FastifyReply } from "fastify";
import { ConfigService } from "@nestjs/config";

@ApiTags("upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("upload")
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private config: ConfigService,
  ) {}

  @Post("presigned-url")
  @ApiOperation({ summary: "Generate presigned URL for R2 upload" })
  async presignedUrl(
    @Body("key") key: string,
    @Body("contentType") contentType: string,
  ) {
    return this.uploadService.generatePresignedUrl(key, contentType);
  }

  @Put("file/:key")
  @ApiOperation({ summary: "Proxy upload file to R2" })
  async uploadFile(@Param("key") key: string, @Body("base64") base64: string, @Body("contentType") contentType: string) {
    const buffer = Buffer.from(base64, "base64");
    return this.uploadService.uploadFile(key, contentType || "image/png", buffer);
  }

  @Put("video/:uid")
  @ApiOperation({ summary: "Proxy upload video to Cloudflare Stream" })
  async uploadVideo(@Param("uid") uid: string, @Body("base64") base64: string, @Body("contentType") contentType: string) {
    const token = this.config.get<string>("CLOUDFLARE_STREAM_TOKEN") || "";
    const buffer = Buffer.from(base64, "base64");
    const res = await fetch(`https://upload.cloudflarestream.com/${uid}`, {
      method: "PUT",
      body: buffer,
      headers: { "Content-Type": contentType || "video/mp4", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Video upload failed");
    return { uid };
  }
}

@Controller("images")
export class ImagesController {
  constructor(private uploadService: UploadService) {}

  @Get("*")
  @ApiOperation({ summary: "Proxy image from R2" })
  async serveImage(@Req() req: any) {
    const fullKey = req.params["*"];
    const url = await this.uploadService.getImageUrl(fullKey);
    return { url };
  }
}