import { Controller, Post, Body, UseGuards } from "@nestjs/common";
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
}