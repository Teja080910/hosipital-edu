import { Controller, Post, Get, Param, Body, UseGuards, Res } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { FastifyReply } from "fastify";

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

@Controller("images")
export class ImagesController {
  constructor(private uploadService: UploadService) {}

  @Get(":key")
  @ApiOperation({ summary: "Proxy image from R2" })
  async serveImage(@Param("key") key: string, @Res() res: FastifyReply) {
    const url = await this.uploadService.getImageUrl(key);
    return res.redirect(302, url);
  }
}