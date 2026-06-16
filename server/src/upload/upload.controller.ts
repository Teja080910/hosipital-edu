import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags("upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("upload")
export class UploadController {
  constructor(private uploadService: UploadService) {}

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
  async uploadFile(@Param("key") key: string, @Req() req: any) {
    const contentType = req.headers["content-type"] || "application/octet-stream";
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    return this.uploadService.uploadFile(key, contentType, buffer);
  }
}

@Controller("images")
export class ImagesController {
  constructor(private uploadService: UploadService) {}

  @Get(":key")
  @ApiOperation({ summary: "Proxy image from R2" })
  async serveImage(@Param("key") key: string) {
    const url = await this.uploadService.getImageUrl(key);
    return { url };
  }
}