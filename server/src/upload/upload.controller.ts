import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, HttpException, HttpStatus, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

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
    const allowedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!contentType || !allowedFileTypes.includes(contentType)) {
      throw new BadRequestException("Invalid file type. Only JPEG, PNG, GIF, WebP images, and PDF files are allowed.");
    }
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      throw new HttpException("File too large. Maximum size is 10MB.", HttpStatus.PAYLOAD_TOO_LARGE);
    }
    return this.uploadService.uploadFile(key, contentType, buffer);
  }

  @Put("video/:uid")
  @ApiOperation({ summary: "Proxy upload video to Cloudflare Stream" })
  async uploadVideo(@Param("uid") uid: string, @Body("base64") base64: string, @Body("contentType") contentType: string) {
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!contentType || !allowedVideoTypes.includes(contentType)) {
      throw new BadRequestException("Invalid video type. Only MP4, WebM, and QuickTime videos are allowed.");
    }
    const token = this.config.get<string>("CLOUDFLARE_STREAM_TOKEN") || "";
    const accountId = this.config.get<string>("CLOUDFLARE_ACCOUNT_ID") || "";
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      throw new HttpException("File too large. Maximum size is 10MB.", HttpStatus.PAYLOAD_TOO_LARGE);
    }
    const ext = contentType.split("/")[1] || "mp4";
    const boundary = "----FormBoundary" + Date.now();
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="video.${ext}"\r\nContent-Type: ${contentType}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const body = Buffer.concat([Buffer.from(header), buffer, Buffer.from(footer)]);
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
      method: "POST",
      body,
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success) {
      const msgs = json.errors?.map((e: any) => e.message).join(", ") || "Video upload failed";
      throw new BadRequestException(msgs);
    }
    return { uid: json.result.uid };
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