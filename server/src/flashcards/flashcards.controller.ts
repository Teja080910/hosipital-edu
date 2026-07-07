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
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { FlashcardsService } from "./flashcards.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { IsOptional, IsString, IsUUID, IsInt, IsBoolean, IsArray, Min } from "class-validator";
import { Type } from "class-transformer";

class CreateFlashcardDto {
  @IsString()
  front!: string;

  @IsString()
  back!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  examIds?: string[];

  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class UpdateFlashcardDto {
  @IsOptional()
  @IsString()
  front?: string;

  @IsOptional()
  @IsString()
  back?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  examIds?: string[];

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class StartFlashcardExamDto {
  @IsString()
  mode!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  questionCount!: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  timeLimit?: number;

  @IsOptional()
  @IsString()
  customTitle?: string;

  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;
}

class AnswerFlashcardDto {
  @IsUUID()
  flashcardId!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

@ApiTags("flashcards")
@Controller("flashcards")
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List flashcards with filters" })
  async findAll(
    @Query("examId") examId?: string,
    @Query("specialtyId") specialtyId?: string,
    @Query("topicId") topicId?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @CurrentUser() user?: any,
  ) {
    return this.flashcardsService.findAll({ examId, specialtyId, topicId, page, limit }, user);
  }

  @Get("specialties")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get flashcard specialties" })
  async getSpecialties(@CurrentUser() user: any) {
    return this.flashcardsService.getSpecialties(user.id);
  }

  @Get("due")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get due flashcards for review" })
  async findDue(@CurrentUser() user: any, @Query("limit") limit?: number, @Query("specialtyId") specialtyId?: string) {
    return this.flashcardsService.findDue(user.id, limit, specialtyId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create flashcard (admin)" })
  async create(@Body() data: CreateFlashcardDto, @CurrentUser() user: any) {
    return this.flashcardsService.create({ ...data, createdBy: user.id });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update flashcard (admin)" })
  async update(@Param("id") id: string, @Body() data: UpdateFlashcardDto) {
    return this.flashcardsService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete flashcard (admin)" })
  async remove(@Param("id") id: string) {
    return this.flashcardsService.softDelete(id);
  }

  @Post(":id/review")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit flashcard review (SM-2)" })
  async review(
    @Param("id") id: string,
    @Body("quality") quality: number,
    @CurrentUser() user: any,
  ) {
    return this.flashcardsService.submitReview({
      userId: user.id,
      flashcardId: id,
      quality,
    });
  }

  @Get("exam-history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get flashcard exam history" })
  async getExamHistory(@CurrentUser() user: any) {
    return this.flashcardsService.getExamHistory(user.id);
  }

  @Get("exam-history/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get flashcard exam attempt detail" })
  async getExamAttemptDetail(@Param("id") id: string, @CurrentUser() user: any) {
    return this.flashcardsService.getExamAttemptDetail(id, user.id);
  }

  @Post("exam/start")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Start a flashcard exam" })
  async startExam(@Body() data: StartFlashcardExamDto, @CurrentUser() user: any) {
    return this.flashcardsService.startExam({ ...data, userId: user.id });
  }

  @Patch("exam/:id/answer")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Answer a flashcard in an exam" })
  async answerFlashcard(
    @Param("id") id: string,
    @Body() data: AnswerFlashcardDto,
    @CurrentUser() user: any,
  ) {
    return this.flashcardsService.answerFlashcardQuestion({ attemptId: id, ...data }, user.id);
  }

  @Patch("exam/:id/complete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Complete a flashcard exam" })
  async completeExam(@Param("id") id: string, @CurrentUser() user: any) {
    return this.flashcardsService.completeExam(id, user.id);
  }
}