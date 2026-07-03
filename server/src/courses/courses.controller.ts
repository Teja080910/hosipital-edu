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
import { IsOptional, IsString, IsBoolean, IsNumber, IsUUID, IsObject } from "class-validator";

class CreateCourseDto {
  @IsObject()
  title!: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsOptional()
  @IsObject()
  shortDescription?: object;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;

  @IsOptional()
  @IsObject()
  objectives?: object;

  @IsOptional()
  @IsObject()
  targetAudience?: object;

  @IsOptional()
  @IsObject()
  prerequisites?: object;

  @IsOptional()
  @IsObject()
  whatYouWillLearn?: object;

  @IsOptional()
  @IsObject()
  introduction?: object;

  @IsOptional()
  @IsObject()
  preExamInstructions?: object;

  @IsOptional()
  @IsObject()
  postExamInstructions?: object;

  @IsOptional()
  @IsObject()
  certificateInstructions?: object;
}

class UpdateCourseDto {
  @IsOptional()
  @IsObject()
  title?: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsOptional()
  @IsObject()
  shortDescription?: object;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  hasCertificate?: boolean;

  @IsOptional()
  @IsObject()
  objectives?: object;

  @IsOptional()
  @IsObject()
  targetAudience?: object;

  @IsOptional()
  @IsObject()
  prerequisites?: object;

  @IsOptional()
  @IsObject()
  whatYouWillLearn?: object;

  @IsOptional()
  @IsObject()
  introduction?: object;

  @IsOptional()
  @IsObject()
  preExamInstructions?: object;

  @IsOptional()
  @IsObject()
  postExamInstructions?: object;

  @IsOptional()
  @IsObject()
  certificateInstructions?: object;
}

@ApiTags("courses")
@Controller("courses")
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List courses" })
  async findAll(@Query("all") all?: string, @CurrentUser() user?: any) {
    return this.coursesService.findAll(all !== "true");
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create course (admin)" })
  async create(@Body() data: CreateCourseDto, @CurrentUser() user: any) {
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

  @Get("check-access/:slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check if user has access to course (subscription or trial)" })
  async checkAccess(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.checkAccess(user.id, courseId);
  }

  @Post(":slug/enroll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Enroll in course" })
  async enroll(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
    @Body("stripePaymentId") stripePaymentId?: string,
    @Body("locale") locale?: string,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.enroll(user.id, courseId, stripePaymentId, locale);
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
    @Body() data: { title: any; contentType?: string; videoUrl?: string; pdfUrl?: string; imageUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean },
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
    @Body() data: { title?: any; contentType?: string; videoUrl?: string; pdfUrl?: string; imageUrl?: string; content?: string; duration?: number; sortOrder?: number; isFreePreview?: boolean },
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

  @Post(":slug/lessons/:lessonId/complete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark lesson as complete" })
  async completeLesson(
    @Param("slug") slug: string,
    @Param("lessonId", ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.completeLesson(user.id, courseId, lessonId);
  }

  @Post(":slug/lessons/:lessonId/incomplete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark lesson as incomplete" })
  async incompleteLesson(
    @Param("slug") slug: string,
    @Param("lessonId", ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.incompleteLesson(user.id, courseId, lessonId);
  }

  @Get(":slug/comments")
  @ApiOperation({ summary: "Get comments for a course" })
  async getComments(@Param("slug") slug: string) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.getComments(courseId);
  }

  @Post(":slug/comments")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a comment to a course" })
  async addComment(
    @Param("slug") slug: string,
    @Body() data: { body: string; lessonId?: string; parentId?: string },
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.addComment(user.id, courseId, data);
  }

  @Delete("comments/:commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a comment" })
  async deleteComment(
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.deleteComment(commentId, user.id);
  }

  @Get(":slug/lessons/:lessonId/quiz")
  @ApiOperation({ summary: "Get quiz for a lesson" })
  async getLessonQuiz(@Param("lessonId", ParseUUIDPipe) lessonId: string) {
    return this.coursesService.getLessonQuiz(lessonId);
  }

  @Get(":slug/pre-test")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get pre-test quiz for a course" })
  async getPreTest(@Param("slug") slug: string) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.getCourseQuiz(courseId, "pre_test");
  }

  @Get(":slug/post-test")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get post-test quiz for a course" })
  async getPostTest(@Param("slug") slug: string) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.getCourseQuiz(courseId, "post_test");
  }

  @Get(":slug/test-results")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get pre/post test results for a course" })
  async getTestResults(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
  ) {
    const courseId = await this.coursesService.findIdBySlug(slug);
    return this.coursesService.getTestResults(user.id, courseId);
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
    @Body() data: UpdateCourseDto,
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