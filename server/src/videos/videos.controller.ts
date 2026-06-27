import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { VideosService } from "./videos.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("videos")
@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all video modules with lessons" })
  async findAll(@CurrentUser() user: any) {
    return this.videosService.findAll(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get video module with lessons" })
  async findOne(@Param("id") id: string) {
    return this.videosService.findById(id);
  }

  @Get("progress/:lessonId")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get watch progress for a lesson" })
  async getProgress(
    @Param("lessonId") lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.videosService.getProgress(user.id, lessonId);
  }

  @Post("progress/:lessonId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Save watch progress for a lesson" })
  async saveProgress(
    @Param("lessonId") lessonId: string,
    @Body("watchedSeconds") watchedSeconds: number,
    @Body("duration") duration: number | undefined,
    @CurrentUser() user: any,
  ) {
    return this.videosService.saveProgress(
      user.id,
      lessonId,
      watchedSeconds || 0,
      duration,
    );
  }
}