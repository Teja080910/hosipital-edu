import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { StreamService } from "./stream.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("stream")
@Controller("stream")
export class StreamController {
  constructor(private stream: StreamService) {}

  @Post("upload-url")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate a Cloudflare Stream direct upload URL" })
  async getUploadUrl() {
    return this.stream.generateUploadUrl();
  }

  @Get("videos")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List videos from Cloudflare Stream" })
  async listVideos(@Query("search") search?: string) {
    return this.stream.listVideos(search);
  }

  @Get("videos/:uid")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a single video from Cloudflare Stream" })
  async getVideo(@Param("uid") uid: string) {
    return this.stream.getVideo(uid);
  }

  @Delete("videos/:uid")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a video from Cloudflare Stream" })
  async deleteVideo(@Param("uid") uid: string) {
    return this.stream.deleteVideo(uid);
  }

  @Post("videos/:uid/token")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate a signed viewing token for a video" })
  async getSignedToken(@Param("uid") uid: string) {
    return this.stream.generateSignedToken(uid);
  }

  @Get("modules")
  @ApiOperation({ summary: "List all video modules with lessons" })
  async listModules() {
    return this.stream.listModules();
  }

  @Get("modules/:id")
  @ApiOperation({ summary: "Get a video module with lessons" })
  async getModule(@Param("id") id: string) {
    return this.stream.getModule(id);
  }

  @Post("modules")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a video module" })
  async createModule(@Body() data: { title: any; description: any; examIds?: string[]; sortOrder?: number }) {
    return this.stream.createModule(data);
  }

  @Patch("modules/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a video module" })
  async updateModule(
    @Param("id") id: string,
    @Body() data: { title?: any; description?: any; examIds?: string[]; sortOrder?: number; isActive?: boolean },
  ) {
    return this.stream.updateModule(id, data);
  }

  @Delete("modules/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a video module" })
  async deleteModule(@Param("id") id: string) {
    return this.stream.deleteModule(id);
  }

  @Post("lessons")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a lesson in a module" })
  async createLesson(@Body() data: {
    moduleId: string;
    title: any;
    description: any;
    videoUrl: string;
    duration?: number;
    sortOrder?: number;
  }) {
    return this.stream.createLesson(data);
  }

  @Patch("lessons/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a lesson" })
  async updateLesson(
    @Param("id") id: string,
    @Body() data: { title?: any; description?: any; videoUrl?: string; duration?: number; sortOrder?: number; isActive?: boolean },
  ) {
    return this.stream.updateLesson(id, data);
  }

  @Delete("lessons/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a lesson" })
  async deleteLesson(@Param("id") id: string) {
    return this.stream.deleteLesson(id);
  }
}