import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("courses")
@Controller("courses")
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: "List courses" })
  async findAll(@Query("all") all?: string) {
    return this.coursesService.findAll(all !== "true");
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create course (admin)" })
  async create(@Body() data: any, @CurrentUser() user: any) {
    return this.coursesService.create({ ...data, createdBy: user.id });
  }

  @Get("check-enrollment/:slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check if user is enrolled in course" })
  async checkEnrollment(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    const enrollment = await this.coursesService.getEnrollment(user.id, courseId);
    return { enrolled: !!enrollment };
  }

  @Post(":slug/enroll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Enroll in course" })
  async enroll(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
    @Body("stripePaymentId") stripePaymentId?: string,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.enroll(user.id, courseId, stripePaymentId);
  }

  @Get(":slug/progress")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user progress for a course" })
  async getProgress(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.getProgress(user.id, courseId);
  }

  @Post(":courseId/modules")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create module (admin)" })
  async createModule(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @Body() data: { title: any; description?: any; sortOrder?: number },
  ) {
    return this.coursesService.createModule(courseId, data);
  }

  @Patch("modules/:moduleId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update module (admin)" })
  async updateModule(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Body() data: { title?: any; description?: any; sortOrder?: number },
  ) {
    return this.coursesService.updateModule(moduleId, data);
  }

  @Delete("modules/:moduleId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete module (admin)" })
  async deleteModule(@Param("moduleId", ParseUUIDPipe) moduleId: string) {
    return this.coursesService.deleteModule(moduleId);
  }

  @Post("modules/:moduleId/lessons")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create lesson (admin)" })
  async createLesson(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Body() data: { title: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean },
  ) {
    return this.coursesService.createLesson(moduleId, data);
  }

  @Patch("lessons/:lessonId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update lesson (admin)" })
  async updateLesson(
    @Param("lessonId", ParseUUIDPipe) lessonId: string,
    @Body() data: { title?: any; contentType?: string; videoUrl?: string; pdfUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean },
  ) {
    return this.coursesService.updateLesson(lessonId, data);
  }

  @Delete("lessons/:lessonId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete lesson (admin)" })
  async deleteLesson(@Param("lessonId", ParseUUIDPipe) lessonId: string) {
    return this.coursesService.deleteLesson(lessonId);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get course with modules and lessons" })
  async findOne(@Param("slug") slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update course (admin)" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return this.coursesService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete course (admin)" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.coursesService.softDelete(id);
  }
}